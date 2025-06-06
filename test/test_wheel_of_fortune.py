import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from wheel_of_fortune import play_wheel_of_fortune, SEGMENT_PAYOUTS

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_wheel_of_fortune_segment(monkeypatch):
    # Force set winning_segment = 9 (randbelow → 9)
    monkeypatch.setattr('wheel_of_fortune.secrets.randbelow', lambda n: 9)
    bet = decimal.Decimal('3.00')
    result = play_wheel_of_fortune(bet)
    assert result['winning_segment'] == 9
    # SEGMENT_PAYOUTS[9] == Decimal('3')
    assert result['payout_rate_on_win'] == SEGMENT_PAYOUTS[9]
    # winnings = 3.00 * 3 = 9.00; net = 9.00 - 3.00 = 6.00
    assert result['winnings'] == decimal.Decimal('9.00')
    assert result['net_win_loss'] == decimal.Decimal('6.00')

def test_wheel_of_fortune_loss(monkeypatch):
    # сегмент 2 (пустой) → проигрыш
    monkeypatch.setattr('wheel_of_fortune.secrets.randbelow', lambda n: 2)
    bet = decimal.Decimal('1.00')
    result = play_wheel_of_fortune(bet)
    assert result['winning_segment'] == 2
    assert result['payout_rate_on_win'] == decimal.Decimal('0')
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-1.00')

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_wheel_of_fortune(decimal.Decimal('-1.00'))
