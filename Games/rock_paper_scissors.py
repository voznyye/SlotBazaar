# rock_paper_scissors_game.py
import secrets
import decimal
from typing import Dict, Union

# Game Constants based on RTP = 97.00%
GAME_NAME = "Rock Paper Scissors (vs House)"
WIN_PAYOUT_RATE = decimal.Decimal('1.91') # Payout on win (includes stake)
PUSH_PAYOUT_RATE = decimal.Decimal('1.00') # Payout on push (stake returned)
LOSS_PAYOUT_RATE = decimal.Decimal('0.00') # Payout on loss
CHOICES = ['Rock', 'Paper', 'Scissors']

# Win conditions: Key beats Value
WIN_CONDITIONS = {
    'Rock': 'Scissors',
    'Paper': 'Rock',
    'Scissors': 'Paper'
}

def play_rock_paper_scissors(bet_amount: decimal.Decimal, player_choice: str) -> Dict[str, Union[str, decimal.Decimal]]:
    """
    Simulates a Rock Paper Scissors game round against the house.

    Args:
        bet_amount: The amount wagered (as Decimal).
        player_choice: The player's choice ('Rock', 'Paper', or 'Scissors').

    Returns:
        A dictionary containing the result.
    """
    if player_choice not in CHOICES:
        raise ValueError(f"Player choice must be one of {CHOICES}")
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    house_choice = secrets.choice(CHOICES)

    if player_choice == house_choice:
        # Push (Tie)
        result_status = "Push"
        payout_rate = PUSH_PAYOUT_RATE
    elif WIN_CONDITIONS[player_choice] == house_choice:
        # Player Wins
        result_status = "Win"
        payout_rate = WIN_PAYOUT_RATE
    else:
        # Player Loses
        result_status = "Loss"
        payout_rate = LOSS_PAYOUT_RATE

    winnings = bet_amount * payout_rate
    # Net win/loss calculation needs care with Push payout of 1
    if result_status == "Push":
        net_win_loss = decimal.Decimal('0')
    elif result_status == "Win":
        net_win_loss = winnings - bet_amount
    else: # Loss
        net_win_loss = -bet_amount


    return {
        'game': GAME_NAME,
        'player_choice': player_choice,
        'house_choice': house_choice,
        'result_status': result_status,
        'bet': bet_amount,
        'payout_rate': payout_rate, # The actual payout rate applied
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('10.00')
    player_choice = 'Paper'
    try:
        result = play_rock_paper_scissors(bet, player_choice)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Player Bet: {result['bet']} on {result['player_choice']}")
        print(f"House Choice: {result['house_choice']}")
        print(f"Result: {result['result_status']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")