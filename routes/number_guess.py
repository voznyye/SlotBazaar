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
from Games.number_guess import play_number_guess

router = APIRouter()

class NumberGuessRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)
    guess: int

class NumberGuessResponse(BaseModel):
    game: str
    choice: int
    secret_number: int
    bet: Decimal
    payout_rate_on_win: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=NumberGuessResponse)
def play_number_guess_game(
    request: NumberGuessRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate guess
        if request.guess < 1 or request.guess > 10:
            raise HTTPException(status_code=400, detail="Guess must be between 1 and 10")
            
        # Check if user has sufficient balance
        if current_user.balance < request.bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
            
        result = play_number_guess(request.bet_amount, request.guess)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="number_guess",
            bet_amount=request.bet_amount,
            winnings=result["winnings"],
            game_data={
                "choice": request.guess,
                "secret_number": result["secret_number"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return NumberGuessResponse(
            game=result["game"],
            choice=result["choice"],
            secret_number=result["secret_number"],
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