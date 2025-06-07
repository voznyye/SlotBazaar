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
from wheel_of_fortune import play_wheel_of_fortune

router = APIRouter()

class WheelOfFortuneRequest(BaseModel):
    bet_amount: float

class WheelOfFortuneResponse(BaseModel):
    game: str
    winning_segment: str
    bet: float
    payout_rate_on_win: float
    winnings: float
    net_win_loss: float
    new_balance: float

@router.post("/play", response_model=WheelOfFortuneResponse)
def play_wheel_of_fortune_game(
    request: WheelOfFortuneRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_wheel_of_fortune(bet)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="wheel_of_fortune",
            bet_amount=bet,
            winnings=result["winnings"],
            game_data={
                "winning_segment": result["winning_segment"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return WheelOfFortuneResponse(
            game=result["game"],
            winning_segment=result["winning_segment"],
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