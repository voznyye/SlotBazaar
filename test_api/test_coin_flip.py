import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_coin_flip_valid_request():
    response = client.post("/coin/play", json={
        "bet_amount": 10.0,
        "choice": "Heads"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Coin Flip"
    assert data["choice"] == "Heads"
    assert data["outcome"] in ["Heads", "Tails"]
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data

def test_coin_flip_tails():
    response = client.post("/coin/play", json={
        "bet_amount": 5.0,
        "choice": "Tails"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["choice"] == "Tails"
    assert data["bet"] == 5.0

def test_coin_flip_invalid_choice():
    response = client.post("/coin/play", json={
        "bet_amount": 10.0,
        "choice": "Invalid"
    })
    assert response.status_code == 400

def test_coin_flip_negative_bet():
    response = client.post("/coin/play", json={
        "bet_amount": -10.0,
        "choice": "Heads"
    })
    assert response.status_code == 400

def test_coin_flip_zero_bet():
    response = client.post("/coin/play", json={
        "bet_amount": 0.0,
        "choice": "Heads"
    })
    assert response.status_code == 400