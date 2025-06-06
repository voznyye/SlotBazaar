import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from reel_slot import play_simple_slot, spin_reels, SYMBOLS

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_spin_reels_length():
    combo = spin_reels(3, SYMBOLS)
    assert isinstance(combo, tuple)
    assert len(combo) == 3
    for symbol in combo:
        assert symbol in SYMBOLS

def test_slot_win(monkeypatch):
    # Force return combination ('C','C','C')
    monkeypatch.setattr('reel_slot.secrets.choice', lambda symbols: 'C')
    bet = decimal.Decimal('0.50')
    result = play_simple_slot(bet)
    assert result['combination'] == ('C', 'C', 'C')
    # PAYTABLE[('C','C','C')] = Decimal('5'), winnings = 0.5*5 = 2.5, net = 2.00
    assert result['payout_rate_on_win'] == decimal.Decimal('5')
    assert result['winnings'] == decimal.Decimal('2.50')
    assert result['net_win_loss'] == decimal.Decimal('2.00')

def test_slot_loss(monkeypatch):
    # Сделаем так, чтобы хоть один символ был иным: первая и вторая — 'C', третья — 'L'
    seq = ['C','C','L']
    def fake_choice(symbols):
        return seq.pop(0)
    monkeypatch.setattr('reel_slot.secrets.choice', fake_choice)
    bet = decimal.Decimal('1.00')
    result = play_simple_slot(bet)
    assert result['combination'] == ('C', 'C', 'L')
    assert result['payout_rate_on_win'] == decimal.Decimal('0')
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-1.00')

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_simple_slot(decimal.Decimal('-0.50'))
