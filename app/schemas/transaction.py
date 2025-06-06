from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional
from ..models.transaction import TransactionType, TransactionStatus


class TransactionBase(BaseModel):
    type: TransactionType
    amount: Decimal
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    user_id: int
    balance_before: Decimal
    balance_after: Decimal
    game_session_id: Optional[int] = None
    reference_id: Optional[str] = None


class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    status: TransactionStatus
    balance_before: Decimal
    balance_after: Decimal
    game_session_id: Optional[int] = None
    reference_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionHistory(BaseModel):
    transactions: list[TransactionResponse]
    total_count: int
    page: int
    per_page: int