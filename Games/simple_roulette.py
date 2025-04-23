# simple_roulette_game.py
import secrets
import decimal
from typing import Dict, Union, List

# Game Constants based on RTP = 97.30% for Red/Black
GAME_NAME = "Simple Roulette (Red/Black Bet)"
WIN_PAYOUT_RATE = decimal.Decimal('2.00') # Payout for Red/Black (1:1 Net Win)
CHOICES = ['Red', 'Black']

# European Wheel Layout (simplified mapping)
# 0: Green, 1-18: Red, 19-36: Black (Example mapping, real wheels vary)
SLOTS = 37 # 0 to 36
RED_NUMBERS = set(range(1, 19)) # Example Red numbers
BLACK_NUMBERS = set(range(19, 37)) # Example Black numbers
GREEN_NUMBER = 0

def get_slot_outcome() -> Dict[str, Union[int, str]]:
    """ Determines the winning number and color."""
    winning_number = secrets.randbelow(SLOTS) # Generates 0-36
    if winning_number == GREEN_NUMBER:
        color = 'Green'
    elif winning_number in RED_NUMBERS:
        color = 'Red'
    elif winning_number in BLACK_NUMBERS:
        color = 'Black'
    else:
        # Should not happen with standard 0-36 wheel
        color = 'Unknown'
    return {'number': winning_number, 'color': color}

def play_simple_roulette_redblack(bet_amount: decimal.Decimal, choice: str) -> Dict[str, Union[str, int, decimal.Decimal]]:
    """
    Simulates a Roulette round betting on Red or Black.

    Args:
        bet_amount: The amount wagered (as Decimal).
        choice: The player's choice ('Red' or 'Black').

    Returns:
        A dictionary containing the result.
    """
    if choice not in CHOICES:
        raise ValueError(f"Choice must be one of {CHOICES}")
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    outcome_details = get_slot_outcome()
    outcome_color = outcome_details['color']
    winning_number = outcome_details['number']

    if outcome_color == choice:
        # Win
        winnings = bet_amount * WIN_PAYOUT_RATE
        net_win_loss = winnings - bet_amount
    else:
        # Loss (includes Green)
        winnings = decimal.Decimal('0')
        net_win_loss = -bet_amount

    return {
        'game': GAME_NAME,
        'choice': choice,
        'outcome_number': winning_number,
        'outcome_color': outcome_color,
        'bet': bet_amount,
        'payout_rate_on_win': WIN_PAYOUT_RATE,
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('20.00')
    player_choice = 'Red'
    try:
        result = play_simple_roulette_redblack(bet, player_choice)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Bet: {result['bet']} on {result['choice']}")
        print(f"Outcome: Number {result['outcome_number']} ({result['outcome_color']})")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")