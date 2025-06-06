from pydantic import BaseModel, condecimal
from decimal import Decimal
from typing import Literal

# Legacy schemas for backward compatibility
class CoinFlipRequest(BaseModel):
    choice: Literal['Heads', 'Tails']
    bet: condecimal(gt=0)

class CoinFlipResponse(BaseModel):
    outcome: str
    winnings: Decimal
    net_win_loss: Decimal

# Import new schemas
from .schemas.user import *
from .schemas.transaction import *
from .schemas.game import *
