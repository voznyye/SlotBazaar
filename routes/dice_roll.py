from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from dice_roll import play_dice_roll_number

router = APIRouter()

class DiceRollRequest(BaseModel):
    bet_amount: float
    number: int

@router.post("/play")
def play_dice_roll_game(request: DiceRollRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_dice_roll_number(bet, request.number)
        
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