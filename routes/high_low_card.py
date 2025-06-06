from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from high_low_card import play_high_low_card

router = APIRouter()

class HighLowCardRequest(BaseModel):
    bet_amount: float
    choice: str

@router.post("/play")
def play_high_low_card_game(request: HighLowCardRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_high_low_card(bet, request.choice)
        
        return {
            "game": result["game"],
            "choice": result["choice"],
            "outcome_card_rank": result["outcome_card_rank"],
            "outcome_card_value": result["outcome_card_value"],
            "bet": float(result["bet"]),
            "payout_rate_on_win": float(result["payout_rate_on_win"]),
            "winnings": float(result["winnings"]),
            "net_win_loss": float(result["net_win_loss"])
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")