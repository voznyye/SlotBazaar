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
import random

router = APIRouter()

class CoinFlipRequest(BaseModel):
    bet: condecimal(gt=0, decimal_places=2)
    choice: str

class CoinFlipResponse(BaseModel):
    outcome: str
    result: str
    bet_amount: Decimal
    winnings: Decimal
    new_balance: Decimal

@router.post("/flip", response_model=CoinFlipResponse)
def play_coin_flip_game(
    request: CoinFlipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Play coin flip game"""
    # Validate choice
    if request.choice.lower() not in ['heads', 'tails']:
        raise HTTPException(status_code=400, detail="Choice must be 'heads' or 'tails'")
    
    # Check if user has sufficient balance
    if current_user.balance < request.bet:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    try:
        game_service = GameService(db)
        
        # Play the game
        outcome = random.choice(['heads', 'tails'])
        won = outcome.lower() == request.choice.lower()
        winnings = request.bet * 2 if won else Decimal('0')
        net_result = winnings - request.bet
        
        # Create game session and update balance
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="coin_flip",
            bet_amount=request.bet,
            winnings=winnings,
            game_data={
                "choice": request.choice,
                "outcome": outcome,
                "won": won
            }
        )
        
        # Refresh user to get updated balance
        db.refresh(current_user)
        
        return CoinFlipResponse(
            outcome=outcome,
            result="win" if won else "lose",
            bet_amount=request.bet,
            winnings=winnings,
            new_balance=current_user.balance
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Game error: {str(e)}")