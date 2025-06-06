import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_high_low_card_high():
    response = client.post("/highlow/play", json={
        "bet_amount": 10.0,
        "choice": "High"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "High/Low Card (Simplified)"
    assert data["choice"] == "High"
    assert "outcome_card_rank" in data
    assert "outcome_card_value" in data
    assert 1 <= data["outcome_card_value"] <= 13
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data

def test_high_low_card_low():
    response = client.post("/highlow/play", json={
        "bet_amount": 5.0,
        "choice": "Low"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["choice"] == "Low"
    assert data["bet"] == 5.0

def test_high_low_card_invalid_choice():
    response = client.post("/highlow/play", json={
        "bet_amount": 10.0,
        "choice": "Middle"
    })
    assert response.status_code == 400

def test_high_low_card_negative_bet():
    response = client.post("/highlow/play", json={
        "bet_amount": -10.0,
        "choice": "High"
    })
    assert response.status_code == 400