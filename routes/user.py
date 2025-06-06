from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.db import get_db
from app.auth import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.services.game_service import GameService
from app.schemas.transaction import TransactionHistory, TransactionResponse
from app.schemas.game import GameHistory

router = APIRouter()

@router.get("/transactions", response_model=TransactionHistory)
def get_transaction_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transaction history"""
    offset = (page - 1) * per_page
    
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.created_at.desc()).offset(offset).limit(per_page).all()

    total_count = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).count()

    return TransactionHistory(
        transactions=[TransactionResponse.model_validate(t) for t in transactions],
        total_count=total_count,
        page=page,
        per_page=per_page
    )

@router.get("/games", response_model=GameHistory)
def get_game_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's game history"""
    game_service = GameService(db)
    history = game_service.get_user_game_history(current_user.id, page, per_page)
    
    return GameHistory(**history)

@router.get("/stats")
def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's gaming statistics"""
    game_service = GameService(db)
    stats = game_service.get_user_stats(current_user.id)
    
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "current_balance": float(current_user.balance),
        "stats": stats
    }