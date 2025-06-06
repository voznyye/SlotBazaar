from fastapi import FastAPI
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from routes import auth
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

app = FastAPI(title="SlotBazaar API", description="Casino Games API", version="1.0.0")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(coin_flip.router, prefix="/coin", tags=["coin"])
app.include_router(dice_roll.router, prefix="/dice", tags=["dice"])
app.include_router(high_low_card.router, prefix="/highlow", tags=["highlow"])
app.include_router(number_guess.router, prefix="/guess", tags=["guess"])
app.include_router(rock_paper_scissors.router, prefix="/rps", tags=["rps"])
app.include_router(scratch_card_simulator.router, prefix="/scratch", tags=["scratch"])
app.include_router(simple_roulette.router, prefix="/roulette", tags=["roulette"])
app.include_router(simplified_blackjack.router, prefix="/blackjack", tags=["blackjack"])
app.include_router(wheel_of_fortune.router, prefix="/wheel", tags=["wheel"])
app.include_router(reel_slot.router, prefix="/slot", tags=["slot"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SlotBazaar API"}