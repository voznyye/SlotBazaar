from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from wheel_of_fortune import play_wheel_of_fortune

router = APIRouter()

class WheelOfFortuneRequest(BaseModel):
    bet_amount: float

@router.post("/play")
def play_wheel_of_fortune_game(request: WheelOfFortuneRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_wheel_of_fortune(bet)
        
        return {
            "game": result["game"],
            "winning_segment": result["winning_segment"],
            "bet": float(result["bet"]),
            "payout_rate_on_win": float(result["payout_rate_on_win"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")