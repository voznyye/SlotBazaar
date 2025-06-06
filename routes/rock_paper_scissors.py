from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from rock_paper_scissors import play_rock_paper_scissors

router = APIRouter()

class RockPaperScissorsRequest(BaseModel):
    bet_amount: float
    choice: str

@router.post("/play")
def play_rock_paper_scissors_game(request: RockPaperScissorsRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_rock_paper_scissors(bet, request.choice)
        
        return {
            "game": result["game"],
            "player_choice": result["player_choice"],
            "house_choice": result["house_choice"],
            "result_status": result["result_status"],
            "bet": float(result["bet"]),
            "payout_rate": float(result["payout_rate"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")