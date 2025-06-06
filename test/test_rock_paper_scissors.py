import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from rock_paper_scissors import play_rock_paper_scissors

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_rps_push(monkeypatch):
    # Принудительно house_choice = 'Rock', player выбирает 'Rock' → ничья
    monkeypatch.setattr('rock_paper_scissors.secrets.choice', lambda choices: 'Rock')
    bet = decimal.Decimal('10.00')
    result = play_rock_paper_scissors(bet, 'Rock')
    assert result['house_choice'] == 'Rock'
    assert result['result_status'] == 'Push'
    assert result['winnings'] == decimal.Decimal('10.00')  # stake возвращается
    assert result['net_win_loss'] == decimal.Decimal('0.00')

def test_rps_win(monkeypatch):
    # По правилам Rock бьёт Scissors
    monkeypatch.setattr('rock_paper_scissors.secrets.choice', lambda choices: 'Scissors')
    bet = decimal.Decimal('5.00')
    result = play_rock_paper_scissors(bet, 'Rock')
    assert result['house_choice'] == 'Scissors'
    assert result['result_status'] == 'Win'
    # Payout = 5.00 * 1.91 = 9.55; net = 9.55 - 5.00 = 4.55
    assert result['winnings'] == decimal.Decimal('9.55')
    assert result['net_win_loss'] == decimal.Decimal('4.55')

def test_rps_loss(monkeypatch):
    # Paper бьёт Rock → игрок проиграл
    monkeypatch.setattr('rock_paper_scissors.secrets.choice', lambda choices: 'Paper')
    bet = decimal.Decimal('2.00')
    result = play_rock_paper_scissors(bet, 'Rock')
    assert result['house_choice'] == 'Paper'
    assert result['result_status'] == 'Loss'
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-2.00')

def test_invalid_choice():
    with pytest.raises(ValueError):
        play_rock_paper_scissors(decimal.Decimal('1.00'), 'Lizard')

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_rock_paper_scissors(decimal.Decimal('-1.00'), 'Rock')
