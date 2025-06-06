import pytest
from decimal import Decimal


class TestUserHistory:
    """Test user transaction and game history"""

    def test_get_transaction_history_empty(self, authenticated_client):
        """Test getting transaction history when empty"""
        response = authenticated_client.get("/user/transactions")
        
        assert response.status_code == 200
        data = response.json()
        assert data["transactions"] == []
        assert data["total_count"] == 0
        assert data["page"] == 1
        assert data["per_page"] == 20

    def test_get_transaction_history_with_data(self, authenticated_client):
        """Test getting transaction history with data"""
        # First make a deposit to create transaction
        authenticated_client.post("/auth/deposit", json={"amount": "50.00"})
        
        response = authenticated_client.get("/user/transactions")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["transactions"]) == 1
        assert data["total_count"] == 1
        assert data["transactions"][0]["type"] == "deposit"
        assert float(data["transactions"][0]["amount"]) == 50.00

    def test_get_transaction_history_pagination(self, authenticated_client):
        """Test transaction history pagination"""
        response = authenticated_client.get("/user/transactions?page=1&per_page=5")
        
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["per_page"] == 5

    def test_get_game_history_empty(self, authenticated_client):
        """Test getting game history when empty"""
        response = authenticated_client.get("/user/games")
        
        assert response.status_code == 200
        data = response.json()
        assert data["sessions"] == []
        assert data["total_count"] == 0
        assert data["page"] == 1
        assert data["per_page"] == 20

    def test_get_user_stats_empty(self, authenticated_client):
        """Test getting user stats when no games played"""
        response = authenticated_client.get("/user/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] is not None
        assert data["username"] == "testuser"
        assert data["current_balance"] == 100.0
        assert data["stats"]["total_games"] == 0
        assert data["stats"]["total_bet"] == 0.0
        assert data["stats"]["total_won"] == 0.0
        assert data["stats"]["net_result"] == 0.0

    def test_unauthorized_access_to_history(self, client):
        """Test accessing history without authentication"""
        response = client.get("/user/transactions")
        assert response.status_code == 403

        response = client.get("/user/games")
        assert response.status_code == 403

        response = client.get("/user/stats")
        assert response.status_code == 403