import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from coin_flip import play_coin_flip

@pytest.fixture(autouse=True)
def set_decimal_precision():
    # Настроим точность Decimal, чтобы результаты были предсказуемые
    decimal.getcontext().prec = 10

def test_coin_flip_win(monkeypatch):
    # Принудительно заставим исход быть Heads, чтобы проверить выигрыш
    monkeypatch.setattr('coin_flip.secrets.choice', lambda choices: 'Heads')
    bet = decimal.Decimal('10.00')
    result = play_coin_flip(bet, 'Heads')
    assert result['game'] == 'Coin Flip'
    assert result['choice'] == 'Heads'
    assert result['outcome'] == 'Heads'
    # Payout rate = 1.92, winnings = 10.00 * 1.92 = 19.20, net = 19.20 - 10.00 = 9.20
    assert result['payout_rate_on_win'] == decimal.Decimal('1.92')
    assert result['winnings'] == decimal.Decimal('19.20')
    assert result['net_win_loss'] == decimal.Decimal('9.20')

def test_coin_flip_loss(monkeypatch):
    # Заставим исход быть Tails, а ставка — на Heads => проигрыш
    monkeypatch.setattr('coin_flip.secrets.choice', lambda choices: 'Tails')
    bet = decimal.Decimal('5.00')
    result = play_coin_flip(bet, 'Heads')
    assert result['outcome'] == 'Tails'
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-5.00')

def test_invalid_choice():
    bet = decimal.Decimal('1.00')
    with pytest.raises(ValueError):
        play_coin_flip(bet, 'Invalid')  # недопустимый выбор

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_coin_flip(decimal.Decimal('-1.00'), 'Heads')
