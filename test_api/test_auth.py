import pytest
from fastapi.testclient import TestClient
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post("/auth/register", json={
        "username": "testuser",
        "password": "testpass"
    })
    assert response.status_code == 200
    assert response.json() == {"msg": "User registered"}

def test_register_existing_user():
    # Register user first
    client.post("/auth/register", json={
        "username": "testuser2",
        "password": "testpass"
    })
    # Try to register same user again
    response = client.post("/auth/register", json={
        "username": "testuser2",
        "password": "testpass"
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "User exists"

def test_login_valid_user():
    # Register user first
    client.post("/auth/register", json={
        "username": "loginuser",
        "password": "loginpass"
    })
    # Login with valid credentials
    response = client.post("/auth/login", json={
        "username": "loginuser",
        "password": "loginpass"
    })
    assert response.status_code == 200
    assert response.json() == {"msg": "Login successful", "username": "loginuser"}

def test_login_invalid_user():
    response = client.post("/auth/login", json={
        "username": "nonexistent",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"