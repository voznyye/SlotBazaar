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
    try:
        # Пробуем использовать обычный сервис
        user_service = UserService(db)
        user = user_service.create_user(user_data)
        return user
    except Exception as e:
        # Если возникает ошибка, связанная с отсутствующей колонкой
        if "column users.is_verified does not exist" in str(e):
            # Используем альтернативный сервис
            from app.services.fallback_user_service import FallbackUserService
            fallback_service = FallbackUserService(db)
            user = fallback_service.create_user(user_data)
            
            # Добавляем is_verified для совместимости с моделью ответа
            from fastapi.encoders import jsonable_encoder
            user_dict = jsonable_encoder(user)
            user_dict["is_verified"] = False
            
            return user_dict
        else:
            # Если ошибка не связана с отсутствующей колонкой, пробрасываем дальше
            raise

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user and return access token"""
    try:
        user_service = UserService(db)
        user = user_service.authenticate_user(login_data)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last login - только если колонка существует
        try:
            from sqlalchemy.sql import func
            user.last_login = func.now()
            db.commit()
        except Exception as e:
            # Игнорируем ошибку, если колонки last_login нет
            db.rollback()
            print(f"Warning: Could not update last_login: {e}")
        
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        # Обрабатываем отсутствующие поля
        user_response = None
        try:
            user_response = UserResponse.model_validate(user)
        except Exception:
            # Если валидация не удалась, создаем словарь вручную
            from fastapi.encoders import jsonable_encoder
            user_dict = jsonable_encoder(user)
            if "is_verified" not in user_dict:
                user_dict["is_verified"] = False
            user_response = user_dict
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user_response
        }
    except Exception as e:
        # Если возникает ошибка, связанная с отсутствующей колонкой
        if "column users.is_verified does not exist" in str(e):
            # Используем альтернативный сервис
            from app.services.fallback_user_service import FallbackUserService
            fallback_service = FallbackUserService(db)
            user = fallback_service.authenticate_user(login_data)
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect username or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": str(user.id)}, expires_delta=access_token_expires
            )
            
            # Добавляем недостающие поля в ответ
            from fastapi.encoders import jsonable_encoder
            user_dict = jsonable_encoder(user)
            user_dict["is_verified"] = False
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": user_dict
            }
        else:
            # Если ошибка не связана с отсутствующей колонкой, пробрасываем дальше
            raise

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