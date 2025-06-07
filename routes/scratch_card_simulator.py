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
from scratch_card_simulator import play_scratch_card, CARD_COST

router = APIRouter()

class ScratchCardRequest(BaseModel):
    bet_amount: float = None

class ScratchCardResponse(BaseModel):
    game: str
    bet: float
    revealed_payout_rate: float
    winnings: float
    net_win_loss: float
    new_balance: float

@router.post("/play", response_model=ScratchCardResponse)
def play_scratch_card_game(
    request: ScratchCardRequest = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Scratch card has fixed cost
        if request and request.bet_amount is not None:
            bet = decimal.Decimal(str(request.bet_amount))
            result = play_scratch_card(bet)
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
            bet=float(result["bet"]),
            revealed_payout_rate=float(result["revealed_payout_rate"]),
            winnings=float(result["winnings"]),
            net_win_loss=float(result["net_win_loss"]),
            new_balance=float(current_user.balance)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/cost")
def get_scratch_card_cost():
    return {"card_cost": float(CARD_COST)}