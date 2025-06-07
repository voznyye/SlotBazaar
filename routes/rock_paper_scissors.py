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
from rock_paper_scissors import play_rock_paper_scissors

router = APIRouter()

class RockPaperScissorsRequest(BaseModel):
    bet_amount: float
    choice: str

class RockPaperScissorsResponse(BaseModel):
    game: str
    player_choice: str
    house_choice: str
    result_status: str
    bet: float
    payout_rate: float
    winnings: float
    net_win_loss: float
    new_balance: float

@router.post("/play", response_model=RockPaperScissorsResponse)
def play_rock_paper_scissors_game(
    request: RockPaperScissorsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_rock_paper_scissors(bet, request.choice)
        
        # Create game session and update balance
        game_service = GameService(db)
        session = game_service.create_game_session(
            user_id=current_user.id,
            game_type="rock_paper_scissors",
            bet_amount=bet,
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
            bet=float(result["bet"]),
            payout_rate=float(result["payout_rate"]),
            winnings=float(result["winnings"]),
            net_win_loss=float(result["net_win_loss"]),
            new_balance=float(current_user.balance)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")