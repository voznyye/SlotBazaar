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
from Games.reel_slot import play_simple_slot

router = APIRouter()

class ReelSlotRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)

class ReelSlotResponse(BaseModel):
    game: str
    combination: list
    bet: Decimal
    payout_rate_on_win: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=ReelSlotResponse)
def play_reel_slot_game(
    request: ReelSlotRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if user has sufficient balance
        if current_user.balance < request.bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
            
        result = play_simple_slot(request.bet_amount)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="reel_slot",
            bet_amount=request.bet_amount,
            winnings=result["winnings"],
            game_data={
                "combination": result["combination"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return ReelSlotResponse(
            game=result["game"],
            combination=result["combination"],
            bet=result["bet"],
            payout_rate_on_win=result["payout_rate_on_win"],
            winnings=result["winnings"],
            net_win_loss=result["net_win_loss"],
            new_balance=current_user.balance
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Game error: {str(e)}")