from fastapi import FastAPI
from app.routes import (
    auth, coin,
    dice_roll, high_low_card, number_guess,
    rock_paper_scissors, scratch_card_simulator,
    simple_roulette, simplified_blackjack,
    wheel_of_fortune, _3_reel_slot
)

app = FastAPI()
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(coin.router, prefix="/coin", tags=["coin"])
app.include_router(dice_roll.router, prefix="/dice", tags=["dice"])
app.include_router(high_low_card.router, prefix="/highlow", tags=["highlow"])
app.include_router(number_guess.router, prefix="/guess", tags=["guess"])
app.include_router(rock_paper_scissors.router, prefix="/rps", tags=["rps"])
app.include_router(scratch_card_simulator.router, prefix="/scratch", tags=["scratch"])
app.include_router(simple_roulette.router, prefix="/roulette", tags=["roulette"])
app.include_router(simplified_blackjack.router, prefix="/blackjack", tags=["blackjack"])
app.include_router(wheel_of_fortune.router, prefix="/wheel", tags=["wheel"])
app.include_router(_3_reel_slot.router, prefix="/slot", tags=["slot"])