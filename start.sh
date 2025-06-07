#!/bin/bash
set -e

echo "Starting application initialization..."

# Проверка соединения с базой данных
echo "Checking database connection..."
DB_CHECK_RESULT=0
python test_db_connection.py || DB_CHECK_RESULT=$?

if [ $DB_CHECK_RESULT -ne 0 ]; then
    echo "Database connection check failed (code $DB_CHECK_RESULT)"
    echo "Cannot proceed without database connection"
    exit 1
else
    echo "Database connection successful"
fi

# Эта секция применяет миграции безопасным способом
echo "Applying database migrations..."

# Проверяем, есть ли проблема с несколькими головными ревизиями
ALEMBIC_ERROR=0
alembic current 2>/dev/null || ALEMBIC_ERROR=$?

if [ $ALEMBIC_ERROR -ne 0 ]; then
    echo "Detected issue with Alembic migrations, attempting direct database structure fix..."
    python scripts/db_fix.py || echo "Warning: Database fix might not be complete"
else
    echo "Alembic is configured correctly, applying migrations..."
    # Пробуем применить миграции, игнорируя ошибки
    alembic upgrade head || echo "Warning: Some migrations may not have been applied"
fi

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000