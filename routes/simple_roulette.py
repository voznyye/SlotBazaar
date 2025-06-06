from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from simple_roulette import play_simple_roulette_redblack

router = APIRouter()

class SimpleRouletteRequest(BaseModel):
    bet_amount: float
    choice: str

@router.post("/play")
def play_simple_roulette_game(request: SimpleRouletteRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_simple_roulette_redblack(bet, request.choice)
        
        return {
            "game": result["game"],
            "choice": result["choice"],
            "outcome_number": result["outcome_number"],
            "outcome_color": result["outcome_color"],
            "bet": float(result["bet"]),
            "payout_rate_on_win": float(result["payout_rate_on_win"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")