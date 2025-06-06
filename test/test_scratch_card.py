import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from scratch_card_simulator import play_scratch_card, CARD_COST, PRIZE_DISTRIBUTION

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_scratch_card_fixed_cost():
    # If an incorrect bet is passed, it should throw an error
    with pytest.raises(ValueError):
        play_scratch_card(decimal.Decimal('2.00'))

def test_scratch_card_valid(monkeypatch):
    # Force return a specific payout_rate, e.g. 5 (multiplied by 1.00)
    monkeypatch.setattr('scratch_card_simulator.random.choices',
                        lambda rates, weights, k: [decimal.Decimal('5')])
    result = play_scratch_card()  # bet_amount defaults to CARD_COST
    assert result['game'] == 'Scratch Card Simulator'
    assert result['bet'] == CARD_COST
    assert result['revealed_payout_rate'] == decimal.Decimal('5')
    # winnings = 1.00 * 5 = 5.00; net = 5.00 - 1.00 = 4.00
    assert result['winnings'] == decimal.Decimal('5.00')
    assert result['net_win_loss'] == decimal.Decimal('4.00')
