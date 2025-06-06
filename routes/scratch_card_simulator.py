# scratch_card_game.py
import secrets
import decimal
from typing import Dict, Union, List

# Game Constants based on RTP = 96.00%
GAME_NAME = "Scratch Card Simulator"
CARD_COST = decimal.Decimal('1.00') # Assume fixed cost/bet per card

# Prize Structure: Payout Rate -> Probability
# Payout Rate is the total returned (including stake) if that prize is won
# Note: Using strings for Decimal keys might be safer if precision issues arise
PRIZE_DISTRIBUTION = {
    decimal.Decimal('0'): 0.620,    # Lose
    decimal.Decimal('1'): 0.160,    # Push (Win 0x)
    decimal.Decimal('2'): 0.150,    # Win 1x
    decimal.Decimal('5'): 0.050,    # Win 4x
    decimal.Decimal('10'): 0.015,   # Win 9x
    decimal.Decimal('20'): 0.005,   # Win 19x
}

# Prepare lists for secrets.choices()
PAYOUT_RATES = list(PRIZE_DISTRIBUTION.keys())
PROBABILITIES = list(PRIZE_DISTRIBUTION.values())

# Verify probabilities sum to 1 (or close enough due to float precision)
if not abs(sum(PROBABILITIES) - 1.0) < 1e-9:
     raise ValueError("Probabilities in PRIZE_DISTRIBUTION must sum to 1.")

def play_scratch_card(bet_amount: decimal.Decimal = CARD_COST) -> Dict[str, Union[str, decimal.Decimal]]:
    """
    Simulates revealing a scratch card outcome based on weighted probabilities.

    Args:
        bet_amount: The cost of the card (fixed in this simple version).

    Returns:
        A dictionary containing the result.
    """
    if bet_amount != CARD_COST:
        # In this simple model, bet_amount is fixed by card cost
        # A more complex version might allow different card values
        raise ValueError(f"Bet amount must be equal to CARD_COST ({CARD_COST})")
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")


    # secrets.choices returns a list, get the first element
    # Weights are automatically used by the function
    chosen_payout_rate = secrets.choices(PAYOUT_RATES, weights=PROBABILITIES, k=1)[0]

    winnings = bet_amount * chosen_payout_rate # Winnings based on card cost * prize multiplier
    net_win_loss = winnings - bet_amount

    return {
        'game': GAME_NAME,
        'bet': bet_amount, # Cost of the card
        'revealed_payout_rate': chosen_payout_rate,
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    # Bet amount is fixed by CARD_COST here
    try:
        result = play_scratch_card()
        print(f"--- {GAME_NAME} Example ---")
        print(f"Card Cost (Bet): {result['bet']}")
        print(f"Revealed Payout Rate: {result['revealed_payout_rate']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")