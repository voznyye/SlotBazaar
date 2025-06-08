from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, condecimal
from sqlalchemy.orm import Session
from decimal import Decimal
import sys
import os
from pathlib import Path

# Add the project root directory to Python path
project_root = str(Path(__file__).parent.parent)
if project_root not in sys.path:
    sys.path.append(project_root)

from app.auth import get_current_user
from app.db import get_db
from app.models.user import User
from app.services.game_service import GameService
from Games.dice_roll import play_dice_roll_number

router = APIRouter()

class DiceRollRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)
    number: int

class DiceRollResponse(BaseModel):
    game: str
    choice: int
    outcome: int
    bet: Decimal
    payout_rate_on_win: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=DiceRollResponse)
def play_dice_roll_game(
    request: DiceRollRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate number
        if request.number < 1 or request.number > 6:
            raise HTTPException(status_code=400, detail="Number must be between 1 and 6")
            
        # Check if user has sufficient balance
        if current_user.balance < request.bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
            
        result = play_dice_roll_number(request.bet_amount, request.number)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="dice_roll",
            bet_amount=request.bet_amount,
            winnings=result["winnings"],
            game_data={
                "choice": request.number,
                "outcome": result["outcome"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return DiceRollResponse(
            game=result["game"],
            choice=result["choice"],
            outcome=result["outcome"],
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