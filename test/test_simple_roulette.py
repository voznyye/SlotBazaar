import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from simple_roulette import play_simple_roulette_redblack

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_roulette_red_win(monkeypatch):
    # Принудительно вернём число 5 (красное)
    monkeypatch.setattr('simple_roulette.secrets.randbelow', lambda n: 5)
    bet = decimal.Decimal('10.00')
    result = play_simple_roulette_redblack(bet, 'Red')
    assert result['choice'] == 'Red'
    assert result['outcome_number'] == 5
    assert result['outcome_color'] == 'Red'
    assert result['payout_rate_on_win'] == decimal.Decimal('2.00')
    assert result['winnings'] == decimal.Decimal('20.00')
    assert result['net_win_loss'] == decimal.Decimal('10.00')

def test_roulette_black_win(monkeypatch):
    # Принудительно вернём число 25 (черное)
    monkeypatch.setattr('simple_roulette.secrets.randbelow', lambda n: 25)
    bet = decimal.Decimal('5.00')
    result = play_simple_roulette_redblack(bet, 'Black')
    assert result['choice'] == 'Black'
    assert result['outcome_number'] == 25
    assert result['outcome_color'] == 'Black'
    assert result['winnings'] == decimal.Decimal('10.00')
    assert result['net_win_loss'] == decimal.Decimal('5.00')

def test_roulette_green_loss(monkeypatch):
    # Принудительно вернём 0 (зеленое) - проигрыш
    monkeypatch.setattr('simple_roulette.secrets.randbelow', lambda n: 0)
    bet = decimal.Decimal('8.00')
    result = play_simple_roulette_redblack(bet, 'Red')
    assert result['outcome_number'] == 0
    assert result['outcome_color'] == 'Green'
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-8.00')

def test_roulette_color_loss(monkeypatch):
    # Принудительно вернём красное число, а ставка на черное
    monkeypatch.setattr('simple_roulette.secrets.randbelow', lambda n: 10)
    bet = decimal.Decimal('3.00')
    result = play_simple_roulette_redblack(bet, 'Black')
    assert result['outcome_color'] == 'Red'
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-3.00')

def test_invalid_choice():
    with pytest.raises(ValueError):
        play_simple_roulette_redblack(decimal.Decimal('1.00'), 'Green')

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_simple_roulette_redblack(decimal.Decimal('-1.00'), 'Red')