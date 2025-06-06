import pytest


def test_dice_roll_valid_request(client):
    response = client.post("/games/dice/play", json={
        "bet_amount": 10.0,
        "number": 3
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Dice Roll (Bet on Number)"
    assert data["choice"] == 3
    assert data["outcome"] in [1, 2, 3, 4, 5, 6]
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data
    assert "payout_rate_on_win" in data


def test_dice_roll_all_valid_numbers(client):
    for number in [1, 2, 3, 4, 5, 6]:
        response = client.post("/games/dice/play", json={
            "bet_amount": 5.0,
            "number": number
        })
        assert response.status_code == 200
        data = response.json()
        assert data["choice"] == number


def test_dice_roll_invalid_number_low(client):
    response = client.post("/games/dice/play", json={
        "bet_amount": 10.0,
        "number": 0
    })
    assert response.status_code == 400


def test_dice_roll_invalid_number_high(client):
    response = client.post("/games/dice/play", json={
        "bet_amount": 10.0,
        "number": 7
    })
    assert response.status_code == 400


def test_dice_roll_negative_bet(client):
    response = client.post("/games/dice/play", json={
        "bet_amount": -5.0,
        "number": 3
    })
    assert response.status_code == 400