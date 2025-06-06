from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from reel_slot import play_simple_slot

router = APIRouter()

class ReelSlotRequest(BaseModel):
    bet_amount: float

@router.post("/play")
def play_reel_slot_game(request: ReelSlotRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_simple_slot(bet)
        
        return {
            "game": result["game"],
            "combination": result["combination"],
            "bet": float(result["bet"]),
            "payout_rate_on_win": float(result["payout_rate_on_win"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")