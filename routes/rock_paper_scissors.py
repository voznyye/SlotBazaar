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
from Games.rock_paper_scissors import play_rock_paper_scissors

router = APIRouter()

class RockPaperScissorsRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)
    choice: str

class RockPaperScissorsResponse(BaseModel):
    game: str
    player_choice: str
    house_choice: str
    result_status: str
    bet: Decimal
    payout_rate: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=RockPaperScissorsResponse)
def play_rock_paper_scissors_game(
    request: RockPaperScissorsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate choice
        if request.choice.lower() not in ['rock', 'paper', 'scissors']:
            raise HTTPException(status_code=400, detail="Choice must be 'rock', 'paper', or 'scissors'")
            
        # Check if user has sufficient balance
        if current_user.balance < request.bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
            
        result = play_rock_paper_scissors(request.bet_amount, request.choice)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="rock_paper_scissors",
            bet_amount=request.bet_amount,
            winnings=result["winnings"],
            game_data={
                "player_choice": result["player_choice"],
                "house_choice": result["house_choice"],
                "result_status": result["result_status"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return RockPaperScissorsResponse(
            game=result["game"],
            player_choice=result["player_choice"],
            house_choice=result["house_choice"],
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