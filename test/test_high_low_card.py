import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from high_low_card import play_high_low_card

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def fake_card(rank, value):
    return {'rank': rank, 'value': value}

def test_high_low_card_low_win(monkeypatch):
    # Force return a card with value 5 (low)
    monkeypatch.setattr('high_low_card.get_random_card', lambda: fake_card('5', 5))
    bet = decimal.Decimal('10.00')
    result = play_high_low_card(bet, 'Low')
    assert result['choice'] == 'Low'
    assert result['outcome_card_value'] == 5
    assert result['payout_rate_on_win'] == decimal.Decimal('2.08')
    assert result['winnings'] == decimal.Decimal('20.80')
    assert result['net_win_loss'] == decimal.Decimal('10.80')

def test_high_low_card_high_win(monkeypatch):
    # Принудительно вернём карту «Q» = 12 (высокая)
    monkeypatch.setattr('high_low_card.get_random_card', lambda: fake_card('Q', 12))
    bet = decimal.Decimal('8.00')
    result = play_high_low_card(bet, 'High')
    assert result['choice'] == 'High'
    assert result['outcome_card_rank'] == 'Q'
    assert result['payout_rate_on_win'] == decimal.Decimal('1.78')
    assert result['winnings'] == decimal.Decimal('14.24')
    assert result['net_win_loss'] == decimal.Decimal('6.24')

def test_high_low_card_loss(monkeypatch):
    # Принудительно вернём значение 2, ставка на High => проигрыш
    monkeypatch.setattr('high_low_card.get_random_card', lambda: fake_card('2', 2))
    bet = decimal.Decimal('5.00')
    result = play_high_low_card(bet, 'High')
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-5.00')

def test_invalid_choice():
    with pytest.raises(ValueError):
        play_high_low_card(decimal.Decimal('1.00'), 'Middle')

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_high_low_card(decimal.Decimal('-1.00'), 'Low')
