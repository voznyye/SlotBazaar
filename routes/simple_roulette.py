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
from Games.simple_roulette import play_simple_roulette_redblack

router = APIRouter()

class SimpleRouletteRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)
    choice: str

class RouletteResponse(BaseModel):
    game: str
    choice: str
    outcome_number: int
    outcome_color: str
    bet: Decimal
    payout_rate_on_win: Decimal
    winnings: Decimal
    net_win_loss: Decimal
    new_balance: Decimal

@router.post("/play", response_model=RouletteResponse)
def play_simple_roulette_game(
    request: SimpleRouletteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Play simple roulette game"""
    # Validate choice
    if request.choice.lower() not in ['red', 'black']:
        raise HTTPException(status_code=400, detail="Choice must be 'red' or 'black'")
    
    # Check if user has sufficient balance
    if current_user.balance < request.bet_amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    try:
        result = play_simple_roulette_redblack(request.bet_amount, request.choice)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="roulette",
            bet_amount=request.bet_amount,
            winnings=result["winnings"],
            game_data={
                "choice": request.choice,
                "outcome_number": result["outcome_number"],
                "outcome_color": result["outcome_color"],
                "won": result["winnings"] > 0
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return RouletteResponse(
            game=result["game"],
            choice=result["choice"],
            outcome_number=result["outcome_number"],
            outcome_color=result["outcome_color"],
            bet=request.bet_amount,
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