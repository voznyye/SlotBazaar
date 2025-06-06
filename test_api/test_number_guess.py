import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_number_guess_valid_request():
    response = client.post("/guess/play", json={
        "bet_amount": 10.0,
        "guess": 5
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Number Guess (1-10)"
    assert data["choice"] == 5
    assert 1 <= data["secret_number"] <= 10
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data

def test_number_guess_all_valid_numbers():
    for guess in range(1, 11):
        response = client.post("/guess/play", json={
            "bet_amount": 5.0,
            "guess": guess
        })
        assert response.status_code == 200
        data = response.json()
        assert data["choice"] == guess

def test_number_guess_invalid_number_low():
    response = client.post("/guess/play", json={
        "bet_amount": 10.0,
        "guess": 0
    })
    assert response.status_code == 400

def test_number_guess_invalid_number_high():
    response = client.post("/guess/play", json={
        "bet_amount": 10.0,
        "guess": 11
    })
    assert response.status_code == 400

def test_number_guess_negative_bet():
    response = client.post("/guess/play", json={
        "bet_amount": -5.0,
        "guess": 5
    })
    assert response.status_code == 400