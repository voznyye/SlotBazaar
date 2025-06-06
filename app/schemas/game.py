from pydantic import BaseModel, condecimal
from decimal import Decimal
from datetime import datetime
from typing import Optional, Dict, Any


class GameSessionBase(BaseModel):
    game_type: str
    bet_amount: condecimal(gt=0, decimal_places=2)


class GameSessionCreate(GameSessionBase):
    user_id: int
    win_amount: Decimal = Decimal('0.00')
    net_result: Decimal
    game_data: Optional[Dict[str, Any]] = None


class GameSessionResponse(GameSessionBase):
    id: int
    user_id: int
    win_amount: Decimal
    net_result: Decimal
    game_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class GameHistory(BaseModel):
    sessions: list[GameSessionResponse]
    total_count: int
    page: int
    per_page: int


# Enhanced game request/response schemas
class GameRequest(BaseModel):
    bet_amount: condecimal(gt=0, decimal_places=2)


class GameResponse(BaseModel):
    session_id: int
    outcome: str
    bet_amount: Decimal
    win_amount: Decimal
    net_result: Decimal
    balance_after: Decimal
    game_data: Dict[str, Any]