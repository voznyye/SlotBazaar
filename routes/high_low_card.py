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
from high_low_card import play_high_low_card

router = APIRouter()

class HighLowCardRequest(BaseModel):
    bet_amount: float
    choice: str

class HighLowCardResponse(BaseModel):
    game: str
    choice: str
    outcome_card_rank: str
    outcome_card_value: int
    bet: float
    payout_rate_on_win: float
    winnings: float
    net_win_loss: float
    new_balance: float

@router.post("/play", response_model=HighLowCardResponse)
def play_high_low_card_game(
    request: HighLowCardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_high_low_card(bet, request.choice)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="high_low_card",
            bet_amount=bet,
            winnings=result["winnings"],
            game_data={
                "choice": request.choice,
                "outcome_card_rank": result["outcome_card_rank"],
                "outcome_card_value": result["outcome_card_value"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return HighLowCardResponse(
            game=result["game"],
            choice=result["choice"],
            outcome_card_rank=result["outcome_card_rank"],
            outcome_card_value=result["outcome_card_value"],
            bet=float(result["bet"]),
            payout_rate_on_win=float(result["payout_rate_on_win"]),
            winnings=float(result["winnings"]),
            net_win_loss=float(result["net_win_loss"]),
            new_balance=float(current_user.balance)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")