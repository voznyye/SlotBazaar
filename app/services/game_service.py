from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..models.user import User
from ..models.game_session import GameSession
from ..models.transaction import TransactionType
from ..services.user_service import UserService
from ..schemas.game import GameSessionCreate
from decimal import Decimal
from typing import Dict, Any


class GameService:
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)

    def start_game_session(self, user_id: int, game_type: str, bet_amount: Decimal) -> GameSession:
        """Start a new game session and deduct bet from user balance"""
        user = self.user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.balance < bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # Create game session
        game_session = GameSession(
            user_id=user_id,
            game_type=game_type,
            bet_amount=bet_amount,
            win_amount=Decimal('0.00'),
            net_result=-bet_amount  # Initially negative (bet amount)
        )

        try:
            self.db.add(game_session)
            self.db.flush()  # Get the ID without committing

            # Deduct bet amount from user balance
            self.user_service.update_balance(
                user_id=user_id,
                amount=-bet_amount,
                transaction_type=TransactionType.BET,
                description=f"Bet for {game_type}",
                game_session_id=game_session.id
            )

            return game_session
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Failed to start game session")

    def complete_game_session(self, session_id: int, win_amount: Decimal, 
                            game_data: Dict[str, Any] = None) -> GameSession:
        """Complete a game session with results"""
        game_session = self.db.query(GameSession).filter(GameSession.id == session_id).first()
        if not game_session:
            raise HTTPException(status_code=404, detail="Game session not found")

        # Update game session
        game_session.win_amount = win_amount
        game_session.net_result = win_amount - game_session.bet_amount
        game_session.game_data = game_data

        try:
            # If there are winnings, add them to user balance
            if win_amount > 0:
                self.user_service.update_balance(
                    user_id=game_session.user_id,
                    amount=win_amount,
                    transaction_type=TransactionType.WIN,
                    description=f"Win from {game_session.game_type}",
                    game_session_id=session_id
                )

            self.db.commit()
            self.db.refresh(game_session)
            return game_session
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail="Failed to complete game session")

    def create_game_session(self, user_id: int, game_type: str, bet_amount: Decimal, 
                          winnings: Decimal, game_data: Dict[str, Any] = None) -> GameSession:
        """Create a complete game session in one step"""
        user = self.user_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.balance < bet_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # Create game session
        game_session = GameSession(
            user_id=user_id,
            game_type=game_type,
            bet_amount=bet_amount,
            win_amount=winnings,
            net_result=winnings - bet_amount,
            game_data=game_data
        )

        try:
            self.db.add(game_session)
            self.db.flush()  # Get the ID without committing

            # Create bet transaction
            self.user_service.update_balance(
                user_id=user_id,
                amount=-bet_amount,
                transaction_type=TransactionType.BET,
                description=f"Bet for {game_type}",
                game_session_id=game_session.id
            )

            # Create win transaction if there are winnings
            if winnings > 0:
                self.user_service.update_balance(
                    user_id=user_id,
                    amount=winnings,
                    transaction_type=TransactionType.WIN,
                    description=f"Win from {game_type}",
                    game_session_id=game_session.id
                )

            self.db.commit()
            self.db.refresh(game_session)
            return game_session
        except Exception as e:
            self.db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to create game session: {str(e)}")

    def get_user_game_history(self, user_id: int, page: int = 1, per_page: int = 20):
        """Get user's game history with pagination"""
        offset = (page - 1) * per_page
        
        sessions = self.db.query(GameSession).filter(
            GameSession.user_id == user_id
        ).order_by(GameSession.created_at.desc()).offset(offset).limit(per_page).all()

        total_count = self.db.query(GameSession).filter(
            GameSession.user_id == user_id
        ).count()

        return {
            "sessions": sessions,
            "total_count": total_count,
            "page": page,
            "per_page": per_page
        }

    def get_user_stats(self, user_id: int) -> Dict[str, Any]:
        """Get user's gaming statistics"""
        from sqlalchemy import func
        
        stats = self.db.query(
            func.count(GameSession.id).label('total_games'),
            func.sum(GameSession.bet_amount).label('total_bet'),
            func.sum(GameSession.win_amount).label('total_won'),
            func.sum(GameSession.net_result).label('net_result')
        ).filter(GameSession.user_id == user_id).first()

        return {
            "total_games": stats.total_games or 0,
            "total_bet": float(stats.total_bet or 0),
            "total_won": float(stats.total_won or 0),
            "net_result": float(stats.net_result or 0)
        }