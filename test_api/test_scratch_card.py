import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_scratch_card_default_cost():
    response = client.post("/scratch/play")
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Scratch Card Simulator"
    assert data["bet"] == 1.0  # Default cost
    assert "revealed_payout_rate" in data
    assert "winnings" in data
    assert "net_win_loss" in data

def test_scratch_card_custom_bet():
    # Scratch card uses fixed cost, custom bet should fail
    response = client.post("/scratch/play", json={
        "bet_amount": 5.0
    })
    assert response.status_code == 400  # Fixed cost only

def test_scratch_card_get_cost():
    response = client.get("/scratch/cost")
    assert response.status_code == 200
    data = response.json()
    assert "card_cost" in data
    assert data["card_cost"] == 1.0

def test_scratch_card_negative_bet():
    response = client.post("/scratch/play", json={
        "bet_amount": -5.0
    })
    assert response.status_code == 400

def test_scratch_card_zero_bet():
    response = client.post("/scratch/play", json={
        "bet_amount": 0.0
    })
    assert response.status_code == 400