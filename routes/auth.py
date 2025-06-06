from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db import get_db
from app.auth import create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserLogin, UserResponse, DepositRequest, WithdrawalRequest, BalanceResponse
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    user_service = UserService(db)
    user = user_service.create_user(user_data)
    return user

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    user_service = UserService(db)
    user = user_service.authenticate_user(login_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    from sqlalchemy.sql import func
    user.last_login = func.now()
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@router.post("/deposit", response_model=BalanceResponse)
def deposit_money(
    deposit_data: DepositRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deposit money to user account"""
    user_service = UserService(db)
    transaction = user_service.deposit(current_user.id, deposit_data.amount)
    
    # Refresh user to get updated balance
    db.refresh(current_user)
    
    return BalanceResponse(
        balance=current_user.balance,
        transaction_id=transaction.id,
        message=f"Successfully deposited ${deposit_data.amount}"
    )

@router.post("/withdraw", response_model=BalanceResponse)
def withdraw_money(
    withdrawal_data: WithdrawalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw money from user account"""
    user_service = UserService(db)
    transaction = user_service.withdraw(current_user.id, withdrawal_data.amount)
    
    # Refresh user to get updated balance
    db.refresh(current_user)
    
    return BalanceResponse(
        balance=current_user.balance,
        transaction_id=transaction.id,
        message=f"Successfully withdrew ${withdrawal_data.amount}"
    )

@router.get("/balance")
def get_balance(current_user: User = Depends(get_current_user)):
    """Get current user balance"""
    return {"balance": current_user.balance}