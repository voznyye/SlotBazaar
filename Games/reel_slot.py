# simple_slot_game.py
import secrets
import decimal
from typing import Dict, Union, Tuple

# Game Constants based on RTP = 96.30%
GAME_NAME = "Simple 3-Reel Slot"
SYMBOLS = ['C', 'L', 'B'] # Cherry, Lemon, Bar
NUM_REELS = 3

# Paytable: Combination -> Payout Rate
PAYTABLE = {
    ('C', 'C', 'C'): decimal.Decimal('5'),
    ('L', 'L', 'L'): decimal.Decimal('8'),
    ('B', 'B', 'B'): decimal.Decimal('13'),
}

def spin_reels(num_reels: int, symbols: list) -> Tuple[str, ...]:
    """Generates random symbols for each reel."""
    # Equal probability for each symbol
    return tuple(secrets.choice(symbols) for _ in range(num_reels))

def play_simple_slot(bet_amount: decimal.Decimal) -> Dict[str, Union[str, Tuple[str,...], decimal.Decimal]]:
    """
    Simulates one spin of the simple 3-reel slot machine.

    Args:
        bet_amount: The amount wagered per spin (as Decimal).

    Returns:
        A dictionary containing the result.
    """
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    combination = spin_reels(NUM_REELS, SYMBOLS)
    payout_rate = PAYTABLE.get(combination, decimal.Decimal('0')) # Get payout or 0 if not a winning combo

    winnings = bet_amount * payout_rate
    net_win_loss = winnings - bet_amount

    return {
        'game': GAME_NAME,
        'combination': combination,
        'bet': bet_amount,
        'payout_rate_on_win': payout_rate,
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('0.50')
    try:
        result = play_simple_slot(bet)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Bet: {result['bet']}")
        print(f"Outcome Combination: {result['combination']}")
        print(f"Payout Rate: {result['payout_rate_on_win']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")