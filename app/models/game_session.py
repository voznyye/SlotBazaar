from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    game_type = Column(String(50), nullable=False)  # coin_flip, dice_roll, etc.
    bet_amount = Column(Numeric(10, 2), nullable=False)
    win_amount = Column(Numeric(10, 2), default=0.00, nullable=False)
    net_result = Column(Numeric(10, 2), nullable=False)  # win_amount - bet_amount
    game_data = Column(JSON, nullable=True)  # Store game-specific data (choice, outcome, etc.)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="game_sessions")
    transactions = relationship("Transaction", back_populates="game_session")

    def __repr__(self):
        return f"<GameSession(id={self.id}, user_id={self.user_id}, game_type='{self.game_type}', net_result={self.net_result})>"