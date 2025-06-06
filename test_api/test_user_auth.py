import pytest
from decimal import Decimal


class TestUserAuthentication:
    """Test user registration and authentication"""

    def test_register_user(self, client):
        """Test user registration"""
        response = client.post("/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert data["balance"] == "100.00"  # Welcome bonus
        assert data["is_active"] is True

    def test_register_duplicate_username(self, client, test_user):
        """Test registration with duplicate username"""
        response = client.post("/auth/register", json={
            "username": "testuser",  # Already exists
            "email": "different@example.com",
            "password": "password123"
        })
        
        assert response.status_code == 400
        assert "Username already exists" in response.json()["detail"]

    def test_register_duplicate_email(self, client, test_user):
        """Test registration with duplicate email"""
        response = client.post("/auth/register", json={
            "username": "differentuser",
            "email": "test@example.com",  # Already exists
            "password": "password123"
        })
        
        assert response.status_code == 400
        assert "Email already exists" in response.json()["detail"]

    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post("/auth/login", json={
            "username": "testuser",
            "password": "testpassword"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "testuser"

    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials"""
        response = client.post("/auth/login", json={
            "username": "testuser",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_get_current_user(self, authenticated_client):
        """Test getting current user info"""
        response = authenticated_client.get("/auth/me")
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"

    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authentication"""
        response = client.get("/auth/me")
        
        assert response.status_code == 403  # No authorization header


class TestUserBalance:
    """Test user balance operations"""

    def test_get_balance(self, authenticated_client):
        """Test getting user balance"""
        response = authenticated_client.get("/auth/balance")
        
        assert response.status_code == 200
        data = response.json()
        assert "balance" in data
        assert float(data["balance"]) == 100.00

    def test_deposit_money(self, authenticated_client):
        """Test depositing money"""
        response = authenticated_client.post("/auth/deposit", json={
            "amount": "50.00"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert float(data["balance"]) == 150.00
        assert "transaction_id" in data
        assert "Successfully deposited $50.00" in data["message"]

    def test_withdraw_money(self, authenticated_client):
        """Test withdrawing money"""
        response = authenticated_client.post("/auth/withdraw", json={
            "amount": "25.00"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert float(data["balance"]) == 75.00
        assert "transaction_id" in data
        assert "Successfully withdrew $25.00" in data["message"]

    def test_withdraw_insufficient_balance(self, authenticated_client):
        """Test withdrawing more than available balance"""
        response = authenticated_client.post("/auth/withdraw", json={
            "amount": "200.00"
        })
        
        assert response.status_code == 400
        assert "Insufficient balance" in response.json()["detail"]

    def test_invalid_deposit_amount(self, authenticated_client):
        """Test deposit with invalid amount"""
        response = authenticated_client.post("/auth/deposit", json={
            "amount": "-10.00"
        })
        
        assert response.status_code == 422  # Validation error

    def test_invalid_withdrawal_amount(self, authenticated_client):
        """Test withdrawal with invalid amount"""
        response = authenticated_client.post("/auth/withdraw", json={
            "amount": "0"
        })
        
        assert response.status_code == 422  # Validation error