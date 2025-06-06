from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from number_guess import play_number_guess

router = APIRouter()

class NumberGuessRequest(BaseModel):
    bet_amount: float
    guess: int

@router.post("/play")
def play_number_guess_game(request: NumberGuessRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_number_guess(bet, request.guess)
        
        return {
            "game": result["game"],
            "choice": result["choice"],
            "secret_number": result["secret_number"],
            "bet": float(result["bet"]),
            "payout_rate_on_win": float(result["payout_rate_on_win"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")