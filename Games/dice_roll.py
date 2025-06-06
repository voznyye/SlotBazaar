# dice_roll_game.py
import secrets
import decimal
from typing import Dict, Union

# Game Constants based on RTP = 95.00%
GAME_NAME = "Dice Roll (Bet on Number)"
WIN_PAYOUT_RATE = decimal.Decimal('5.7') # Total return on win per unit bet
MIN_NUMBER = 1
MAX_NUMBER = 6

def play_dice_roll_number(bet_amount: decimal.Decimal, chosen_number: int) -> Dict[str, Union[str, int, decimal.Decimal]]:
    """
    Simulates a Dice Roll game round where player bets on a specific number.

    Args:
        bet_amount: The amount wagered (as Decimal).
        chosen_number: The number the player bet on (1-6).

    Returns:
        A dictionary containing the result.
    """
    if not isinstance(chosen_number, int) or not MIN_NUMBER <= chosen_number <= MAX_NUMBER:
        raise ValueError(f"Chosen number must be an integer between {MIN_NUMBER} and {MAX_NUMBER}.")
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    # Generate random dice roll
    range_size = MAX_NUMBER - MIN_NUMBER + 1
    outcome = MIN_NUMBER + secrets.randbelow(range_size)

    if outcome == chosen_number:
        # Player wins
        winnings = bet_amount * WIN_PAYOUT_RATE
        net_win_loss = winnings - bet_amount
    else:
        # Player loses
        winnings = decimal.Decimal('0')
        net_win_loss = -bet_amount

    return {
        'game': GAME_NAME,
        'choice': chosen_number,
        'outcome': outcome,
        'bet': bet_amount,
        'payout_rate_on_win': WIN_PAYOUT_RATE,
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('5.00')
    player_choice = 3
    try:
        result = play_dice_roll_number(bet, player_choice)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Bet: {result['bet']} on Number {result['choice']}")
        print(f"Outcome: {result['outcome']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")