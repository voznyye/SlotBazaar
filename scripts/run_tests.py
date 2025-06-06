#!/usr/bin/env python3
"""
Script to run all tests with proper configuration
"""
import subprocess
import sys
import os

def run_tests():
    """Run all tests"""
    print("🧪 Running SlotBazaar Tests...")
    
    # Set environment variables for testing
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["JWT_SECRET_KEY"] = "test-secret-key"
    
    # Run pytest with coverage
    cmd = [
        sys.executable, "-m", "pytest",
        "-v",
        "--tb=short",
        "--cov=app",
        "--cov-report=term-missing",
        "--cov-report=html:htmlcov",
        "test_api/"
    ]
    
    try:
        result = subprocess.run(cmd, check=True)
        print("✅ All tests passed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests failed with exit code {e.returncode}")
        return False

def run_specific_test(test_path):
    """Run specific test"""
    print(f"🧪 Running specific test: {test_path}")
    
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    os.environ["JWT_SECRET_KEY"] = "test-secret-key"
    
    cmd = [sys.executable, "-m", "pytest", "-v", test_path]
    
    try:
        subprocess.run(cmd, check=True)
        print("✅ Test passed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Test failed with exit code {e.returncode}")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific test
        test_path = sys.argv[1]
        run_specific_test(test_path)
    else:
        # Run all tests
        run_tests()