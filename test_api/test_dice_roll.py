import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_dice_roll_valid_request():
    response = client.post("/dice/play", json={
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

def test_dice_roll_all_valid_numbers():
    for number in [1, 2, 3, 4, 5, 6]:
        response = client.post("/dice/play", json={
            "bet_amount": 5.0,
            "number": number
        })
        assert response.status_code == 200
        data = response.json()
        assert data["choice"] == number

def test_dice_roll_invalid_number_low():
    response = client.post("/dice/play", json={
        "bet_amount": 10.0,
        "number": 0
    })
    assert response.status_code == 400

def test_dice_roll_invalid_number_high():
    response = client.post("/dice/play", json={
        "bet_amount": 10.0,
        "number": 7
    })
    assert response.status_code == 400

def test_dice_roll_negative_bet():
    response = client.post("/dice/play", json={
        "bet_amount": -5.0,
        "number": 3
    })
    assert response.status_code == 400