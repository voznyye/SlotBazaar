import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from simplified_blackjack import play_simplified_blackjack, calculate_hand_value

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_calculate_hand_value_ace():
    # Check that ace converts from 11 to 1 when necessary
    hand = ['A', 'K', '5']  # 11 + 10 + 5 = 26 → ace counts as 1 → 16
    assert calculate_hand_value(hand) == 16

def test_blackjack_win():
    # Player: K, A; Dealer: 3, 5
    deck = ['2'] * 48 + ['5', '3', 'A', 'K']  # pop() с конца → K, A, 3, 5
    bet = decimal.Decimal('20.00')
    result = play_simplified_blackjack(bet, custom_deck=deck)

    assert result['player_hand'] == ['K', 'A']
    assert result['dealer_hand'] == ['3', '5']
    assert result['result_status'].startswith('Player Blackjack')
    assert result['winnings'] == decimal.Decimal('40.00')
    assert result['net_win_loss'] == decimal.Decimal('20.00')





