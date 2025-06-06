# coin_flip_game.py
import secrets
import decimal
from typing import Dict, Union

# Game Constants based on RTP = 96.00%
GAME_NAME = "Coin Flip"
WIN_PAYOUT_RATE = decimal.Decimal('1.92') # Total return on win per unit bet
CHOICES = ['Heads', 'Tails']

def play_coin_flip(bet_amount: decimal.Decimal, choice: str) -> Dict[str, Union[str, decimal.Decimal]]:
    """
    Simulates a Coin Flip game round.

    Args:
        bet_amount: The amount wagered (as Decimal).
        choice: The player's choice ('Heads' or 'Tails').

    Returns:
        A dictionary containing the result.
    """
    if choice not in CHOICES:
        raise ValueError(f"Choice must be one of {CHOICES}")
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    outcome = secrets.choice(CHOICES)

    if outcome == choice:
        # Player wins
        winnings = bet_amount * WIN_PAYOUT_RATE
        net_win_loss = winnings - bet_amount
    else:
        # Player loses
        winnings = decimal.Decimal('0')
        net_win_loss = -bet_amount

    return {
        'game': GAME_NAME,
        'choice': choice,
        'outcome': outcome,
        'bet': bet_amount,
        'payout_rate_on_win': WIN_PAYOUT_RATE,
        'winnings': winnings.quantize(decimal.Decimal('0.00')), # Currency precision
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('10.00')
    player_choice = 'Heads'
    try:
        result = play_coin_flip(bet, player_choice)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Bet: {result['bet']} on {result['choice']}")
        print(f"Outcome: {result['outcome']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")