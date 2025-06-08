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
from Games.scratch_card_simulator import play_scratch_card, CARD_COST

router = APIRouter()

class ScratchCardRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2) = None

class ScratchCardResponse(BaseModel):
    game: str
    bet: Decimal
    revealed_payout_rate: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=ScratchCardResponse)
def play_scratch_card_game(
    request: ScratchCardRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Scratch card has fixed cost
        if request and request.bet_amount is not None:
            # Check if user has sufficient balance
            if current_user.balance < request.bet_amount:
                raise HTTPException(status_code=400, detail="Insufficient balance")
            result = play_scratch_card(request.bet_amount)
        else:
            result = play_scratch_card()
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="scratch_card",
            bet_amount=result["bet"],
            winnings=result["winnings"],
            game_data={
                "revealed_payout_rate": result["revealed_payout_rate"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return ScratchCardResponse(
            game=result["game"],
            bet=result["bet"],
            revealed_payout_rate=result["revealed_payout_rate"],
            winnings=result["winnings"],
            net_win_loss=result["net_win_loss"],
            new_balance=current_user.balance
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Game error: {str(e)}")

@router.get("/cost")
def get_scratch_card_cost():
    return {"card_cost": CARD_COST}