from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from ..models.user import User
from ..models.transaction import Transaction, TransactionType, TransactionStatus
from ..schemas.user import UserCreate, UserLogin
from decimal import Decimal
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class FallbackUserService:
    """Fallback user service for database without is_verified column"""
    
    def __init__(self, db: Session):
        self.db = db
        self.use_fallback = self._check_if_fallback_needed()
        
    def _check_if_fallback_needed(self) -> bool:
        """Check if we need to use fallback (no is_verified column)"""
        try:
            # Try to create a query that uses is_verified
            self.db.query(User.is_verified).limit(1).all()
            return False  # Column exists, no fallback needed
        except Exception as e:
            logger.warning(f"Error accessing is_verified column: {e}")
            return True  # Need to use fallback
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user - fallback version for database without is_verified"""
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            if existing_user.username == user_data.username:
                raise HTTPException(status_code=400, detail="Username already exists")
            else:
                raise HTTPException(status_code=400, detail="Email already exists")

        # Fallback: use only columns we know exist
        user = None
        
        try:
            # Create new user with SQL
            from sqlalchemy.sql import text
            
            # Хешируем пароль
            temp_user = User()
            temp_user.set_password(user_data.password)
            hashed_password = temp_user.hashed_password
            
            # Используем SQL напрямую, исключая проблемные колонки
            result = self.db.execute(
                text("""
                INSERT INTO users (username, email, hashed_password, balance, is_active, created_at, updated_at) 
                VALUES (:username, :email, :hashed_password, :balance, :is_active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id
                """),
                {
                    "username": user_data.username,
                    "email": user_data.email,
                    "hashed_password": hashed_password,
                    "balance": Decimal('100.00'),
                    "is_active": True
                }
            )
            
            user_id = result.scalar_one()
            
            # Получаем пользователя обратно
            user = self.db.query(User).filter(User.id == user_id).first()
            
            # Create initial bonus transaction
            transaction = Transaction(
                user_id=user.id,
                type=TransactionType.BONUS,
                status=TransactionStatus.COMPLETED,
                amount=Decimal('100.00'),
                balance_before=Decimal('0.00'),
                balance_after=Decimal('100.00'),
                description="Welcome bonus"
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            return user
            
        except Exception as e:
            logger.error(f"Error creating user with fallback: {e}")
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"User creation failed: {str(e)}")

    def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """Authenticate user by username and password"""
        user = self.db.query(User).filter(User.username == login_data.username).first()
        
        if not user or not user.check_password(login_data.password):
            return None
        
        if not user.is_active:
            raise HTTPException(status_code=400, detail="User account is disabled")
        
        return user