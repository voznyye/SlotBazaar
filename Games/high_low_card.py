# high_low_card_game.py
import secrets
import decimal
from typing import Dict, Union

# Game Constants based on RTP ~ 96%
GAME_NAME = "High/Low Card (Simplified)"
LOW_PAYOUT_RATE = decimal.Decimal('2.08')  # Payout for betting Low (2-7)
HIGH_PAYOUT_RATE = decimal.Decimal('1.78') # Payout for betting High (8-A)
CHOICES = ['Low', 'High']

# Card ranks (Ace high)
RANKS = [str(r) for r in range(2, 11)] + ['J', 'Q', 'K', 'A'] # All card ranks
RANK_VALUES = {str(r): r for r in range(2, 11)}
RANK_VALUES.update({'J': 11, 'Q': 12, 'K': 13, 'A': 13}) # Changed Ace value from 14 to 13

LOW_THRESHOLD = 7 # Low range: 2-7
HIGH_THRESHOLD = 8 # High range: 8-A

def get_random_card() -> Dict[str, Union[str, int]]:
    """Selects a random card rank."""
    # Only rank matters in this version
    rank = secrets.choice(RANKS)
    value = RANK_VALUES[rank]
    return {'rank': rank, 'value': value}

def play_high_low_card(bet_amount: decimal.Decimal, choice: str) -> Dict[str, Union[str, int, decimal.Decimal]]:
    """
    Simulates a High/Low card game round.

    Args:
        bet_amount: The amount wagered (as Decimal).
        choice: The player's choice ('Low' or 'High').

    Returns:
        A dictionary containing the result.
    """
    if choice not in CHOICES:
        raise ValueError(f"Choice must be one of {CHOICES}")
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    card = get_random_card()
    outcome_rank = card['rank']
    outcome_value = card['value']

    is_win = False
    payout_rate = decimal.Decimal('0')

    if choice == 'Low' and outcome_value <= LOW_THRESHOLD:
        is_win = True
        payout_rate = LOW_PAYOUT_RATE
    elif choice == 'High' and outcome_value >= HIGH_THRESHOLD:
        is_win = True
        payout_rate = HIGH_PAYOUT_RATE

    if is_win:
        winnings = bet_amount * payout_rate
        net_win_loss = winnings - bet_amount
    else:
        winnings = decimal.Decimal('0')
        net_win_loss = -bet_amount

    return {
        'game': GAME_NAME,
        'choice': choice,
        'outcome_card_rank': outcome_rank,
        'outcome_card_value': outcome_value,
        'bet': bet_amount,
        'payout_rate_on_win': payout_rate if is_win else decimal.Decimal('0'),
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('15.00')
    player_choice = 'High'
    try:
        result = play_high_low_card(bet, player_choice)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Bet: {result['bet']} on {result['choice']}")
        print(f"Outcome Card: Rank {result['outcome_card_rank']} (Value {result['outcome_card_value']})")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
    except ValueError as e:
        print(f"Error: {e}")