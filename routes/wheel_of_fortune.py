# wheel_of_fortune_game.py
import secrets
import decimal
from typing import Dict, Union

# Game Constants based on RTP = 95.00%
GAME_NAME = "Simple Wheel of Fortune"
NUM_SEGMENTS = 10

# Define segments and their corresponding payout rates (total return per unit bet)
# Index corresponds to segment number 0-9
SEGMENT_PAYOUTS = [
    decimal.Decimal('0'),    # Segment 0: Lose
    decimal.Decimal('0'),    # Segment 1: Lose
    decimal.Decimal('0'),    # Segment 2: Lose
    decimal.Decimal('0'),    # Segment 3: Lose
    decimal.Decimal('0'),    # Segment 4: Lose
    decimal.Decimal('1.5'),  # Segment 5: Win 0.5x (Payout 1.5)
    decimal.Decimal('1.5'),  # Segment 6: Win 0.5x (Payout 1.5)
    decimal.Decimal('1.5'),  # Segment 7: Win 0.5x (Payout 1.5)
    decimal.Decimal('2'),    # Segment 8: Win 1x (Payout 2)
    decimal.Decimal('3'),    # Segment 9: Win 2x (Payout 3)
]

if len(SEGMENT_PAYOUTS) != NUM_SEGMENTS:
    raise ValueError("Length of SEGMENT_PAYOUTS must match NUM_SEGMENTS")

def play_wheel_of_fortune(bet_amount: decimal.Decimal) -> Dict[str, Union[str, int, decimal.Decimal]]:
    """
    Simulates a Simple Wheel of Fortune spin.

    Args:
        bet_amount: The amount wagered (as Decimal).

    Returns:
        A dictionary containing the result.
    """
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    winning_segment = secrets.randbelow(NUM_SEGMENTS) # Generates 0-9
    payout_rate = SEGMENT_PAYOUTS[winning_segment]

    winnings = bet_amount * payout_rate
    net_win_loss = winnings - bet_amount

    return {
        'game': GAME_NAME,
        'winning_segment': winning_segment,
        'bet': bet_amount,
        'payout_rate_on_win': payout_rate,
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('1.00')
    try:
        result = play_wheel_of_fortune(bet)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Bet: {result['bet']}")
        print(f"Winning Segment: {result['winning_segment']}")
        print(f"Segment Payout Rate: {result['payout_rate_on_win']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")