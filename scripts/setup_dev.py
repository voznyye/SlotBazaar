#!/usr/bin/env python3
"""
Development setup script
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def setup_environment():
    """Setup development environment"""
    print("🚀 Setting up SlotBazaar development environment...")
    
    # Create .env file if it doesn't exist
    env_file = Path(".env")
    if not env_file.exists():
        print("📝 Creating .env file...")
        env_example = Path(".env.example")
        if env_example.exists():
            env_file.write_text(env_example.read_text())
            print("✅ .env file created from .env.example")
        else:
            # Create basic .env file
            env_content = """DATABASE_URL=sqlite:///./slotbazaar.db
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
DEBUG=True
ENVIRONMENT=development
"""
            env_file.write_text(env_content)
            print("✅ Basic .env file created")
    
    # Install dependencies
    if not run_command("pip install -r requirements.txt", "Installing dependencies"):
        return False
    
    # Initialize database
    if not run_command("alembic revision --autogenerate -m 'Initial migration'", "Creating initial migration"):
        print("⚠️  Migration creation failed, but continuing...")
    
    if not run_command("alembic upgrade head", "Running database migrations"):
        print("⚠️  Migration failed, but continuing...")
    
    print("\n🎉 Development environment setup complete!")
    print("\n📋 Next steps:")
    print("1. Review and update .env file with your settings")
    print("2. Run: python scripts/run_tests.py")
    print("3. Start development server: uvicorn app.main:app --reload")
    print("4. Or use Docker: docker-compose up --build")
    
    return True

def setup_docker():
    """Setup Docker environment"""
    print("🐳 Setting up Docker environment...")
    
    if not run_command("docker-compose up -d db", "Starting database container"):
        return False
    
    print("⏳ Waiting for database to be ready...")
    import time
    time.sleep(10)
    
    if not run_command("docker-compose exec app alembic upgrade head", "Running migrations in Docker"):
        print("⚠️  Docker migration failed")
    
    print("✅ Docker environment ready!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "docker":
        setup_docker()
    else:
        setup_environment()