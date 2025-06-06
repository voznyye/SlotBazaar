from pydantic import BaseModel, condecimal
from decimal import Decimal
from typing import Literal

class CoinFlipRequest(BaseModel):
    choice: Literal['Heads', 'Tails']
    bet: condecimal(gt=0)

class CoinFlipResponse(BaseModel):
    outcome: str
    winnings: Decimal
    net_win_loss: Decimal
