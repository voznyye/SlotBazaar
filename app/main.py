from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from routes import auth
from routes import user
from routes import coin_flip
from routes import dice_roll
from routes import high_low_card
from routes import number_guess
from routes import rock_paper_scissors
from routes import scratch_card_simulator
from routes import simple_roulette
from routes import simplified_blackjack
from routes import wheel_of_fortune
from routes import reel_slot

app = FastAPI(
    title="SlotBazaar API", 
    description="Casino Games API with User Management", 
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

api_router = APIRouter(prefix="/api")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication and User Management
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(user.router, prefix="/user", tags=["User Management"])

# Game Routes
api_router.include_router(coin_flip.router, prefix="/games/coin", tags=["Coin Flip"])
api_router.include_router(dice_roll.router, prefix="/games/dice", tags=["Dice Roll"])
api_router.include_router(high_low_card.router, prefix="/games/highlow", tags=["High Low Card"])
api_router.include_router(number_guess.router, prefix="/games/guess", tags=["Number Guess"])
api_router.include_router(rock_paper_scissors.router, prefix="/games/rps",  tags=["Rock Paper Scissors"])
api_router.include_router(scratch_card_simulator.router, prefix="/games/scratch", tags=["Scratch Card"])
api_router.include_router(simple_roulette.router, prefix="/games/roulette", tags=["Roulette"])
api_router.include_router(simplified_blackjack.router, prefix="/games/blackjack", tags=["Blackjack"])
api_router.include_router(wheel_of_fortune.router, prefix="/games/wheel", tags=["Wheel of Fortune"])
api_router.include_router(reel_slot.router, prefix="/games/slot", tags=["Slot Machine"])

app.include_router(api_router)

@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "Welcome to SlotBazaar API",
        "version": "2.0.0",
        "features": [
            "User Registration & Authentication",
            "Balance Management",
            "10+ Casino Games",
            "Transaction History",
            "Game Statistics"
        ],
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "SlotBazaar API"}