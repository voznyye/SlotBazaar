from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from ..models.user import User
from ..models.transaction import Transaction, TransactionType, TransactionStatus
from ..schemas.user import UserCreate, UserLogin
from decimal import Decimal
from typing import Optional


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.username == user_data.username) | (User.email == user_data.email)
        ).first()
        
        if existing_user:
            if existing_user.username == user_data.username:
                raise HTTPException(status_code=400, detail="Username already exists")
            else:
                raise HTTPException(status_code=400, detail="Email already exists")

        # Create new user
        user = User(
            username=user_data.username,
            email=user_data.email,
            balance=Decimal('100.00')  # Starting bonus
        )
        user.set_password(user_data.password)
        
        try:
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            # Create initial bonus transaction
            self._create_transaction(
                user_id=user.id,
                transaction_type=TransactionType.BONUS,
                amount=Decimal('100.00'),
                balance_before=Decimal('0.00'),
                balance_after=Decimal('100.00'),
                description="Welcome bonus"
            )
            
            return user
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(status_code=400, detail="User creation failed")

    def authenticate_user(self, login_data: UserLogin) -> Optional[User]:
        """Authenticate user by username and password"""
        user = self.db.query(User).filter(User.username == login_data.username).first()
        
        if not user or not user.check_password(login_data.password):
            return None
        
        if not user.is_active:
            raise HTTPException(status_code=400, detail="User account is disabled")
        
        return user

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def update_balance(self, user_id: int, amount: Decimal, transaction_type: TransactionType, 
                      description: str = None, game_session_id: int = None) -> Transaction:
        """Update user balance and create transaction record"""
        user = self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        balance_before = user.balance
        
        # Check if user has sufficient balance for negative transactions
        if amount < 0 and user.balance + amount < 0:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        user.balance += amount
        balance_after = user.balance

        # Create transaction record
        transaction = self._create_transaction(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=abs(amount),
            balance_before=balance_before,
            balance_after=balance_after,
            description=description,
            game_session_id=game_session_id
        )

        try:
            self.db.commit()
            self.db.refresh(user)
            self.db.refresh(transaction)
            return transaction
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Balance update failed")

    def deposit(self, user_id: int, amount: Decimal) -> Transaction:
        """Deposit money to user account"""
        return self.update_balance(
            user_id=user_id,
            amount=amount,
            transaction_type=TransactionType.DEPOSIT,
            description=f"Deposit of ${amount}"
        )

    def withdraw(self, user_id: int, amount: Decimal) -> Transaction:
        """Withdraw money from user account"""
        return self.update_balance(
            user_id=user_id,
            amount=-amount,
            transaction_type=TransactionType.WITHDRAWAL,
            description=f"Withdrawal of ${amount}"
        )

    def _create_transaction(self, user_id: int, transaction_type: TransactionType, 
                          amount: Decimal, balance_before: Decimal, balance_after: Decimal,
                          description: str = None, game_session_id: int = None) -> Transaction:
        """Create a transaction record"""
        transaction = Transaction(
            user_id=user_id,
            type=transaction_type,
            status=TransactionStatus.COMPLETED,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=description,
            game_session_id=game_session_id
        )
        
        self.db.add(transaction)
        return transaction