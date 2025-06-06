import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_simple_roulette_red():
    response = client.post("/roulette/play", json={
        "bet_amount": 10.0,
        "choice": "Red"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Simple Roulette (Red/Black Bet)"
    assert data["choice"] == "Red"
    assert 0 <= data["outcome_number"] <= 36
    assert data["outcome_color"] in ["Red", "Black", "Green"]
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data

def test_simple_roulette_black():
    response = client.post("/roulette/play", json={
        "bet_amount": 5.0,
        "choice": "Black"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["choice"] == "Black"
    assert data["bet"] == 5.0

def test_simple_roulette_invalid_choice():
    response = client.post("/roulette/play", json={
        "bet_amount": 10.0,
        "choice": "Green"
    })
    assert response.status_code == 400

def test_simple_roulette_negative_bet():
    response = client.post("/roulette/play", json={
        "bet_amount": -10.0,
        "choice": "Red"
    })
    assert response.status_code == 400