import pytest


def test_register_user(client):
    response = client.post("/auth/register", json={
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert "balance" in data
    assert data["is_active"] is True


def test_register_existing_user(client, test_user):
    # Try to register user with existing username
    response = client.post("/auth/register", json={
        "username": "testuser",  # This username already exists from test_user fixture
        "email": "different@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_login_valid_user(client, test_user):
    # Login with valid credentials
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpassword"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    assert data["user"]["username"] == "testuser"


def test_login_invalid_user(client):
    response = client.post("/auth/login", json={
        "username": "nonexistent",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert "incorrect username or password" in response.json()["detail"].lower()


def test_get_current_user(authenticated_client):
    response = authenticated_client.get("/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert "balance" in data
    assert "id" in data


def test_deposit_money(authenticated_client):
    response = authenticated_client.post("/auth/deposit", json={
        "amount": "50.00"
    })
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data
    assert "transaction_id" in data
    assert "message" in data


def test_get_balance(authenticated_client):
    response = authenticated_client.get("/auth/balance")
    assert response.status_code == 200
    data = response.json()
    assert "balance" in data