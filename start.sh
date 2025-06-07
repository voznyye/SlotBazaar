#!/bin/bash
set -e

# Применяем миграции
echo "Running database migrations..."
alembic upgrade head

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000