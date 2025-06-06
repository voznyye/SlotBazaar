import pytest
import decimal
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'Games'))
from dice_roll import play_dice_roll_number

@pytest.fixture(autouse=True)
def set_decimal_precision():
    decimal.getcontext().prec = 10

def test_dice_roll_win(monkeypatch):
    # Force the dice roll to be 3
    monkeypatch.setattr('dice_roll.secrets.randbelow', lambda n: 2)  # MIN_NUMBER=1, randbelow(6)→2 gives 1+2=3
    bet = decimal.Decimal('5.00')
    result = play_dice_roll_number(bet, 3)
    assert result['game'] == 'Dice Roll (Bet on Number)'
    assert result['choice'] == 3
    assert result['outcome'] == 3
    assert result['payout_rate_on_win'] == decimal.Decimal('5.7')
    # winnings = 5.00 * 5.7 = 28.50; net = 28.50 - 5.00 = 23.50
    assert result['winnings'] == decimal.Decimal('28.50')
    assert result['net_win_loss'] == decimal.Decimal('23.50')

def test_dice_roll_loss(monkeypatch):
    # Заставим выпадение быть 4, а ставка на 2 => проигрыш
    monkeypatch.setattr('dice_roll.secrets.randbelow', lambda n: 3)  # даст 1+3=4
    bet = decimal.Decimal('2.00')
    result = play_dice_roll_number(bet, 2)
    assert result['choice'] == 2
    assert result['outcome'] == 4
    assert result['winnings'] == decimal.Decimal('0.00')
    assert result['net_win_loss'] == decimal.Decimal('-2.00')

def test_invalid_number():
    with pytest.raises(ValueError):
        play_dice_roll_number(decimal.Decimal('1.00'), 7)  # 7 вне диапазона 1–6

def test_invalid_bet():
    with pytest.raises(ValueError):
        play_dice_roll_number(decimal.Decimal('-1.00'), 3)
