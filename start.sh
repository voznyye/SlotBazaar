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
        
        # Применяем скрипт исправления структуры БД (не очищает данные)
        echo "Applying database structure fixes..."
        python scripts/db_fix.py || true
    else
        echo "Production mode detected. Skipping invasive recovery methods."
    fi
else
    echo "Database connection successful"
fi

# Используем специальный скрипт для исправления проблемы с головными ревизиями Alembic
echo "Applying Alembic migrations with multi-head fix..."
python scripts/fix_alembic_heads.py || echo "Warning: Migrations may not have been fully applied"

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000