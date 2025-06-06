import pytest


def test_reel_slot_valid_request(client):
    response = client.post("/games/slot/play", json={
        "bet_amount": 10.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Simple 3-Reel Slot"
    assert len(data["combination"]) == 3
    # Validate symbols
    valid_symbols = ['C', 'L', 'B']
    for symbol in data["combination"]:
        assert symbol in valid_symbols
    assert data["bet"] == 10.0
    assert "payout_rate_on_win" in data
    assert "winnings" in data
    assert "net_win_loss" in data


def test_reel_slot_different_bets(client):
    for bet in [0.5, 1.0, 5.0, 25.0]:
        response = client.post("/games/slot/play", json={
            "bet_amount": bet
        })
        assert response.status_code == 200
        data = response.json()
        assert data["bet"] == bet


def test_reel_slot_negative_bet(client):
    response = client.post("/games/slot/play", json={
        "bet_amount": -10.0
    })
    assert response.status_code == 400


def test_reel_slot_zero_bet(client):
    response = client.post("/games/slot/play", json={
        "bet_amount": 0.0
    })
    assert response.status_code == 400