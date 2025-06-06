from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from simplified_blackjack import play_simplified_blackjack

router = APIRouter()

class SimplifiedBlackjackRequest(BaseModel):
    bet_amount: float

@router.post("/play")
def play_simplified_blackjack_game(request: SimplifiedBlackjackRequest):
    try:
        bet = decimal.Decimal(str(request.bet_amount))
        result = play_simplified_blackjack(bet)
        
        return {
            "game": result["game"],
            "player_hand": result["player_hand"],
            "dealer_hand": result["dealer_hand"],
            "player_value": result["player_value"],
            "dealer_value": result["dealer_value"],
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