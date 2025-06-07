#!/bin/bash

echo "Starting database fix script..."

# Если есть переменная окружения DATABASE_URL, используем её
if [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL from environment variables"
    python scripts/db_fix.py "$DATABASE_URL"
else
    # Иначе пытаемся получить из .env файла
    echo "No DATABASE_URL in environment, trying from .env file"
    python scripts/db_fix.py
fi

echo "Script completed."