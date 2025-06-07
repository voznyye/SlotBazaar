from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.sql import func
from .base import Base

class ScratchCardResult(Base):
    __tablename__ = "scratch_card_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    prize = Column(Numeric(10, 2), nullable=False)
    success = Column(String, nullable=False)  # 'Win' or 'Lose'
    bet = Column(Numeric(10, 2), nullable=False)
    winnings = Column(Numeric(10, 2), nullable=False)
    net_win_loss = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
