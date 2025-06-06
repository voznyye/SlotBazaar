import pytest


def test_simplified_blackjack_valid_request(client):
    response = client.post("/games/blackjack/play", json={
        "bet_amount": 10.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Simplified Blackjack"
    assert len(data["player_hand"]) == 2
    assert len(data["dealer_hand"]) == 2
    assert isinstance(data["player_value"], int)
    assert isinstance(data["dealer_value"], int)
    assert "result_status" in data
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data


def test_simplified_blackjack_different_bets(client):
    for bet in [1.0, 25.0, 50.0]:
        response = client.post("/games/blackjack/play", json={
            "bet_amount": bet
        })
        assert response.status_code == 200
        data = response.json()
        assert data["bet"] == bet


def test_simplified_blackjack_negative_bet(client):
    response = client.post("/games/blackjack/play", json={
        "bet_amount": -10.0
    })
    assert response.status_code == 400


def test_simplified_blackjack_zero_bet(client):
    response = client.post("/games/blackjack/play", json={
        "bet_amount": 0.0
    })
    assert response.status_code == 400