import pytest


def test_scratch_card_default_cost(client):
    response = client.post("/games/scratch/play")
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Scratch Card Simulator"
    assert data["bet"] == 1.0  # Default cost
    assert "revealed_payout_rate" in data
    assert "winnings" in data
    assert "net_win_loss" in data


def test_scratch_card_custom_bet(client):
    # Scratch card requires fixed cost, custom bet should fail
    response = client.post("/games/scratch/play", json={
        "bet_amount": 5.0
    })
    assert response.status_code == 400
    assert "CARD_COST" in response.json()["detail"]


def test_scratch_card_get_cost(client):
    response = client.get("/games/scratch/cost")
    assert response.status_code == 200
    data = response.json()
    assert "card_cost" in data
    assert data["card_cost"] == 1.0


def test_scratch_card_negative_bet(client):
    response = client.post("/games/scratch/play", json={
        "bet_amount": -5.0
    })
    assert response.status_code == 400


def test_scratch_card_zero_bet(client):
    response = client.post("/games/scratch/play", json={
        "bet_amount": 0.0
    })
    assert response.status_code == 400