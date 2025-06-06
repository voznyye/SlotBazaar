from fastapi import APIRouter, Depends
from app.schemas import CoinFlipRequest, CoinFlipResponse
from app.coin_flip_game import play_coin_flip
from app.db import SessionLocal
from app.models import CoinFlipResult
from app.auth import get_current_user
from decimal import Decimal

router = APIRouter()

@router.post("/play", response_model=CoinFlipResponse)
def play(req: CoinFlipRequest, user_id: str = Depends(get_current_user)):
    result = play_coin_flip(Decimal(req.bet), req.choice)

    db = SessionLocal()
    db_result = CoinFlipResult(
        user_id=user_id,
        choice=req.choice,
        outcome=result["outcome"],
        bet=result["bet"],
        winnings=result["winnings"],
        net_win_loss=result["net_win_loss"]
    )
    db.add(db_result)
    db.commit()
    db.close()

    return CoinFlipResponse(
        outcome=result["outcome"],
        winnings=result["winnings"],
        net_win_loss=result["net_win_loss"]
    )
