#!/bin/bash
set -e

echo "Starting application initialization..."

# Проверка соединения с базой данных
echo "Checking database connection..."
DB_CHECK_RESULT=0
python test_db_connection.py || DB_CHECK_RESULT=$?

if [ $DB_CHECK_RESULT -ne 0 ]; then
    echo "Database connection check failed (code $DB_CHECK_RESULT)"
    
    # Только для аварийного восстановления (не для продакшена)
    if [ "$ENVIRONMENT" != "production" ]; then
        echo "Not in production mode. Attempting database recovery..."
        
        # Применяем миграции alembic
        echo "Running migrations..."
        alembic upgrade head || true
        
        # Применяем скрипт исправления структуры БД (не очищает данные)
        echo "Applying database structure fixes..."
        python scripts/db_fix.py || true
    else
        echo "Production mode detected. Skipping invasive recovery methods."
        echo "Attempting migrations only..."
        alembic upgrade head || echo "Warning: Migrations failed"
    fi
else
    echo "Database connection successful"
    
    # Применяем миграции (безопасно для продакшена)
    echo "Running migrations..."
    alembic upgrade head
fi

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000