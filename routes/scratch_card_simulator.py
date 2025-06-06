from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from scratch_card_simulator import play_scratch_card, CARD_COST

router = APIRouter()

class ScratchCardRequest(BaseModel):
    bet_amount: float = None

@router.post("/play")
def play_scratch_card_game(request: ScratchCardRequest = None):
    try:
        # Scratch card has fixed cost
        if request and request.bet_amount is not None:
            bet = decimal.Decimal(str(request.bet_amount))
            result = play_scratch_card(bet)
        else:
            result = play_scratch_card()
        
        return {
            "game": result["game"],
            "bet": float(result["bet"]),
            "revealed_payout_rate": float(result["revealed_payout_rate"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/cost")
def get_scratch_card_cost():
    return {"card_cost": float(CARD_COST)}