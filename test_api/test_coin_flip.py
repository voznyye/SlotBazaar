import pytest


def test_coin_flip_valid_request(authenticated_client):
    response = authenticated_client.post("/games/coin/flip", json={
        "bet": "10.00",
        "choice": "heads"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["outcome"] in ["heads", "tails"]
    assert data["result"] in ["win", "lose"]
    assert data["bet_amount"] == "10.00"
    assert "winnings" in data
    assert "new_balance" in data


def test_coin_flip_tails(authenticated_client):
    response = authenticated_client.post("/games/coin/flip", json={
        "bet": "5.00",
        "choice": "tails"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["outcome"] in ["heads", "tails"]
    assert data["bet_amount"] == "5.00"


def test_coin_flip_invalid_choice(authenticated_client):
    response = authenticated_client.post("/games/coin/flip", json={
        "bet": "10.00",
        "choice": "invalid"
    })
    assert response.status_code == 400
    assert "choice must be" in response.json()["detail"].lower()


def test_coin_flip_negative_bet(authenticated_client):
    response = authenticated_client.post("/games/coin/flip", json={
        "bet": "-10.00",
        "choice": "heads"
    })
    assert response.status_code == 422  # Validation error


def test_coin_flip_zero_bet(authenticated_client):
    response = authenticated_client.post("/games/coin/flip", json={
        "bet": "0.00",
        "choice": "heads"
    })
    assert response.status_code == 422  # Validation error


def test_coin_flip_insufficient_balance(authenticated_client):
    # Try to bet more than available balance
    response = authenticated_client.post("/games/coin/flip", json={
        "bet": "1000.00",
        "choice": "heads"
    })
    assert response.status_code == 400
    assert "insufficient balance" in response.json()["detail"].lower()