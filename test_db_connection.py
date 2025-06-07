"""
Test script to verify database connection and basic operations.
"""
import sys
import os
from dotenv import load_dotenv
from sqlalchemy import text
from app.db import engine, SessionLocal

def test_database_connection():
    """Test that we can connect to the database and run a simple query."""
    try:
        # Test the engine connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("Database connection successful!")
            print(f"Result: {result.fetchone()[0]}")
            
            # List all tables
            result = connection.execute(text(
                "SELECT table_name FROM information_schema.tables "
                "WHERE table_schema = 'public' ORDER BY table_name"
            ))
            tables = [row[0] for row in result.fetchall()]
            print("\nAvailable tables:")
            for table in tables:
                print(f"- {table}")
            
        return True
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return False

if __name__ == "__main__":
    # Make sure we're using the .env file settings
    load_dotenv(verbose=True)
    print(f"Using DATABASE_URL: {os.getenv('DATABASE_URL')}")
    
    # Test database connection
    success = test_database_connection()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)