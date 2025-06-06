from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from coin_flip import play_coin_flip

router = APIRouter()

class CoinFlipRequest(BaseModel):
    bet_amount: float
    choice: str

@router.post("/play")
def play_coin_flip_game(request: CoinFlipRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_coin_flip(bet, request.choice)
        
        # Convert Decimal to float for JSON response
        return {
            "game": result["game"],
            "choice": result["choice"],
            "outcome": result["outcome"],
            "bet": float(result["bet"]),
            "payout_rate_on_win": float(result["payout_rate_on_win"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")