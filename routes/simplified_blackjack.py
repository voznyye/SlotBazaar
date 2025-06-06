# simplified_blackjack_game.py
import secrets
import decimal
from typing import Dict, Union, List, Tuple

# Game Constants based on approximate RTP ~ 97.3%
GAME_NAME = "Simplified Blackjack"
WIN_PAYOUT_RATE = decimal.Decimal('2.00')  # Pays 1:1 (Net Win) for regular win AND Blackjack
PUSH_PAYOUT_RATE = decimal.Decimal('1.00') # Stake returned on tie
LOSS_PAYOUT_RATE = decimal.Decimal('0.00')

# --- Simplified Deck and Hand Logic ---
# Using numeric values: A=11 initially, J/Q/K=10
CARD_VALUES = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11}
DECK = [rank for rank in CARD_VALUES for _ in range(4)] # 4 suits

def calculate_hand_value(hand: List[str]) -> int:
    """Calculates the Blackjack value of a hand, handling Aces."""
    value = sum(CARD_VALUES[card] for card in hand)
    num_aces = hand.count('A')
    while value > 21 and num_aces > 0:
        value -= 10 # Change Ace value from 11 to 1
        num_aces -= 1
    return value

def play_simplified_blackjack(bet_amount: decimal.Decimal) -> Dict[str, Union[str, List[str], int, decimal.Decimal]]:
    """
    Simulates a VERY simplified Blackjack hand focusing on payout rules.
    NOTE: This does NOT implement player/dealer strategy (Hit/Stand decisions).
          It deals initial hands and determines immediate win/loss/push based on those.
          Real Blackjack simulation is much more complex.

    Args:
        bet_amount: The amount wagered (as Decimal).

    Returns:
        A dictionary containing the result.
    """
    if not isinstance(bet_amount, decimal.Decimal) or bet_amount <= 0:
        raise ValueError("Bet amount must be a positive Decimal.")

    # --- Deal Initial Hands ---
    # Simplified dealing - does not affect probabilities much for single hand vs fresh deck
    current_deck = DECK[:] # Make a copy
    secrets.SystemRandom().shuffle(current_deck) # Shuffle securely

    player_hand = [current_deck.pop(), current_deck.pop()]
    dealer_hand = [current_deck.pop(), current_deck.pop()]

    player_value = calculate_hand_value(player_hand)
    dealer_value = calculate_hand_value(dealer_hand)

    # --- Determine Immediate Outcomes (No Hit/Stand Logic Here) ---
    player_has_blackjack = (player_value == 21 and len(player_hand) == 2)
    dealer_has_blackjack = (dealer_value == 21 and len(dealer_hand) == 2)

    result_status = "Undetermined (Needs Hit/Stand)" # Default if no immediate outcome
    payout_rate = LOSS_PAYOUT_RATE # Default

    if player_has_blackjack and dealer_has_blackjack:
        result_status = "Push (Both Blackjack)"
        payout_rate = PUSH_PAYOUT_RATE
    elif player_has_blackjack:
        result_status = "Player Blackjack"
        payout_rate = WIN_PAYOUT_RATE # Pays 1:1
    elif dealer_has_blackjack:
        result_status = "Dealer Blackjack"
        payout_rate = LOSS_PAYOUT_RATE
    elif player_value > 21: # Player Busts
        result_status = "Player Busts"
        payout_rate = LOSS_PAYOUT_RATE
    # --- In a full game, Hit/Stand logic would go here ---
    # --- For this simplified version, compare initial non-BJ, non-bust hands ---
    elif player_value > dealer_value or dealer_value > 21: # Also covers dealer bust if implemented
         # Assuming no further hits, player wins
         # This is a major simplification!
         result_status = "Player Wins (Simplified comparison)"
         payout_rate = WIN_PAYOUT_RATE
    elif dealer_value > player_value:
         # Assuming no further hits, dealer wins
         result_status = "Dealer Wins (Simplified comparison)"
         payout_rate = LOSS_PAYOUT_RATE
    elif dealer_value == player_value:
         # Assuming no further hits, push
         result_status = "Push (Simplified comparison)"
         payout_rate = PUSH_PAYOUT_RATE


    winnings = bet_amount * payout_rate
    # Net win/loss calculation needs care with Push payout of 1
    if payout_rate == PUSH_PAYOUT_RATE:
        net_win_loss = decimal.Decimal('0')
    elif payout_rate == WIN_PAYOUT_RATE:
        net_win_loss = winnings - bet_amount
    else: # Loss
        net_win_loss = -bet_amount


    return {
        'game': GAME_NAME,
        'player_hand': player_hand,
        'dealer_hand': dealer_hand,
        'player_value': player_value,
        'dealer_value': dealer_value,
        'result_status': result_status,
        'bet': bet_amount,
        'payout_rate': payout_rate, # The actual payout rate applied
        'winnings': winnings.quantize(decimal.Decimal('0.00')),
        'net_win_loss': net_win_loss.quantize(decimal.Decimal('0.00'))
    }

# Example usage:
if __name__ == "__main__":
    decimal.getcontext().prec = 10
    bet = decimal.Decimal('25.00')
    try:
        result = play_simplified_blackjack(bet)
        print(f"--- {GAME_NAME} Example ---")
        print(f"Player Bet: {result['bet']}")
        print(f"Player Hand: {result['player_hand']} (Value: {result['player_value']})")
        print(f"Dealer Hand: {result['dealer_hand']} (Value: {result['dealer_value']})")
        print(f"Result: {result['result_status']}")
        print(f"Winnings: {result['winnings']}")
        print(f"Net Win/Loss: {result['net_win_loss']}")
        print("\nNOTE: This Blackjack result is highly simplified and doesn't include player/dealer strategy.")
    except ValueError as e:
        print(f"Error: {e}")