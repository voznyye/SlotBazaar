from pydantic import BaseModel, EmailStr, condecimal
from decimal import Decimal
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(UserBase):
    id: int
    balance: Decimal
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class UserBalance(BaseModel):
    balance: Decimal

    model_config = {"from_attributes": True}


class DepositRequest(BaseModel):
    amount: condecimal(gt=0, decimal_places=2)


class WithdrawalRequest(BaseModel):
    amount: condecimal(gt=0, decimal_places=2)


class BalanceResponse(BaseModel):
    balance: Decimal
    transaction_id: int
    message: str