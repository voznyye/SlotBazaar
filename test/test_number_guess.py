import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from number_guess import play_number_guess

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_number_guess_win(monkeypatch):
    # Принудительно вернём secret_number = 7 (randbelow даёт 6)
    monkeypatch.setattr('number_guess.secrets.randbelow', lambda n: 6)
    bet = decimal.Decimal('2.00')
    result = play_number_guess(bet, 7)
    assert result['choice'] == 7
    assert result['secret_number'] == 7
    assert result['payout_rate_on_win'] == decimal.Decimal('9.5')
    assert result['winnings'] == decimal.Decimal('19.00')
    assert result['net_win_loss'] == decimal.Decimal('17.00')

def test_number_guess_loss(monkeypatch):
    # Принудительно вернём secret_number = 3 (randbelow даёт 2)
    monkeypatch.setattr('number_guess.secrets.randbelow', lambda n: 2)
    bet = decimal.Decimal('3.00')
    result = play_number_guess(bet, 5)
    assert result['secret_number'] == 3
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-3.00')

def test_invalid_choice():
    with pytest.raises(ValueError):
        play_number_guess(decimal.Decimal('1.00'), 11)

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_number_guess(decimal.Decimal('-1.00'), 5)
