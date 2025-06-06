import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_wheel_of_fortune_valid_request():
    response = client.post("/wheel/play", json={
        "bet_amount": 10.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Simple Wheel of Fortune"
    assert 0 <= data["winning_segment"] <= 19
    assert data["bet"] == 10.0
    assert "payout_rate_on_win" in data
    assert "winnings" in data
    assert "net_win_loss" in data

def test_wheel_of_fortune_different_bets():
    for bet in [1.0, 5.0, 25.0, 100.0]:
        response = client.post("/wheel/play", json={
            "bet_amount": bet
        })
        assert response.status_code == 200
        data = response.json()
        assert data["bet"] == bet

def test_wheel_of_fortune_negative_bet():
    response = client.post("/wheel/play", json={
        "bet_amount": -10.0
    })
    assert response.status_code == 400

def test_wheel_of_fortune_zero_bet():
    response = client.post("/wheel/play", json={
        "bet_amount": 0.0
    })
    assert response.status_code == 400