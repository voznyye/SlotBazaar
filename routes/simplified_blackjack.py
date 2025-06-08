from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, condecimal
from sqlalchemy.orm import Session
from decimal import Decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.auth import get_current_user
from app.db import get_db
from app.models.user import User
from app.services.game_service import GameService
from Games.simplified_blackjack import play_simplified_blackjack

router = APIRouter()

class SimplifiedBlackjackRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)

class BlackjackResponse(BaseModel):
    game: str
    player_hand: list
    dealer_hand: list
    player_value: int
    dealer_value: int
    result_status: str
    bet: Decimal
    payout_rate: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=BlackjackResponse)
def play_simplified_blackjack_game(
    request: SimplifiedBlackjackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if user has sufficient balance
        if current_user.balance < request.bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
            
        result = play_simplified_blackjack(request.bet_amount)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="blackjack",
            bet_amount=request.bet_amount,
            winnings=result["winnings"],
            game_data={
                "player_hand": result["player_hand"],
                "dealer_hand": result["dealer_hand"],
                "player_value": result["player_value"],
                "dealer_value": result["dealer_value"],
                "result_status": result["result_status"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return BlackjackResponse(
            game=result["game"],
            player_hand=result["player_hand"],
            dealer_hand=result["dealer_hand"],
            player_value=result["player_value"],
            dealer_value=result["dealer_value"],
            result_status=result["result_status"],
            bet=result["bet"],
            payout_rate=result["payout_rate"],
            winnings=result["winnings"],
            net_win_loss=result["net_win_loss"],
            new_balance=current_user.balance
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Game error: {str(e)}")