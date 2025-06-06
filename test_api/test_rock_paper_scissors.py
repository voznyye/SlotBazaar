import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_rock_paper_scissors_rock():
    response = client.post("/rps/play", json={
        "bet_amount": 10.0,
        "choice": "Rock"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["game"] == "Rock Paper Scissors (vs House)"
    assert data["player_choice"] == "Rock"
    assert data["house_choice"] in ["Rock", "Paper", "Scissors"]
    assert data["result_status"] in ["Win", "Loss", "Push"]
    assert data["bet"] == 10.0
    assert "winnings" in data
    assert "net_win_loss" in data

def test_rock_paper_scissors_all_choices():
    for choice in ["Rock", "Paper", "Scissors"]:
        response = client.post("/rps/play", json={
            "bet_amount": 5.0,
            "choice": choice
        })
        assert response.status_code == 200
        data = response.json()
        assert data["player_choice"] == choice

def test_rock_paper_scissors_invalid_choice():
    response = client.post("/rps/play", json={
        "bet_amount": 10.0,
        "choice": "Lizard"
    })
    assert response.status_code == 400

def test_rock_paper_scissors_negative_bet():
    response = client.post("/rps/play", json={
        "bet_amount": -10.0,
        "choice": "Rock"
    })
    assert response.status_code == 400