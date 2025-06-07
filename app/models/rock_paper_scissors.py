from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from .base import Base

class RPSResult(Base):
    __tablename__ = "rock_paper_scissors_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    user_choice = Column(String, nullable=False)  # 'Rock', 'Paper', 'Scissors'
    computer_choice = Column(String, nullable=False)
    result = Column(String, nullable=False)  # 'Win', 'Lose', 'Draw'
    bet = Column(Numeric(10, 2), nullable=False)
    winnings = Column(Numeric(10, 2), nullable=False)
    net_win_loss = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
