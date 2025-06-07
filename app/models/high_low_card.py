from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from .base import Base

class HighLowResult(Base):
    __tablename__ = "high_low_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    drawn_card = Column(String, nullable=False)
    guess = Column(String, nullable=False)  # 'High' or 'Low'
    result = Column(String, nullable=False)  # 'Win' or 'Lose'
    bet = Column(Numeric(10, 2), nullable=False)
    winnings = Column(Numeric(10, 2), nullable=False)
    net_win_loss = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
