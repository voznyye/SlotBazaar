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
from Games.wheel_of_fortune import play_wheel_of_fortune

router = APIRouter()

class WheelOfFortuneRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)

class WheelOfFortuneResponse(BaseModel):
    game: str
    winning_segment: str
    bet: Decimal
    payout_rate_on_win: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=WheelOfFortuneResponse)
def play_wheel_of_fortune_game(
    request: WheelOfFortuneRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if user has sufficient balance
        if current_user.balance < request.bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
            
        result = play_wheel_of_fortune(request.bet_amount)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="wheel_of_fortune",
            bet_amount=request.bet_amount,
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