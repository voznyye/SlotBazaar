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

# Проверяем наличие таблиц и структуру базы данных
echo "Checking database structure..."
TABLE_COUNT=$(python -c "
import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute(\"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'\")
count = cur.fetchone()[0]
print(count)
conn.close()
")

echo "Found $TABLE_COUNT tables in database"

# Проверяем содержимое alembic_version
echo "Checking alembic_version table..."
ALEMBIC_VERSION_COUNT=$(python -c "
import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    cur = conn.cursor()
    cur.execute(\"SELECT COUNT(*) FROM alembic_version\")
    count = cur.fetchone()[0]
    print(count)
    conn.close()
except Exception as e:
    print('0')
")

echo "Found $ALEMBIC_VERSION_COUNT entries in alembic_version table"

# Сначала попробуем стандартный подход с множественным числом heads
echo "Attempting to apply Alembic migrations using multiple heads..."
alembic upgrade heads || echo "Warning: Failed to apply migrations with 'heads'"

# Проверяем таблицы снова
echo "Checking tables after migration attempt..."
NEW_TABLE_COUNT=$(python -c "
import os
import psycopg2
from dotenv import load_dotenv
load_dotenv()
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
cur = conn.cursor()
cur.execute(\"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'\")
count = cur.fetchone()[0]
print(count)
conn.close()
")

echo "Now found $NEW_TABLE_COUNT tables in database"

# Если alembic_version содержит несколько записей, сбрасываем её
if [ "$ALEMBIC_VERSION_COUNT" -gt 1 ]; then
    echo "Multiple entries in alembic_version detected. Attempting to fix..."
    python scripts/reset_migrations.py || echo "Warning: Failed to reset migrations"
    
    # Пробуем применить миграции снова
    echo "Trying migrations after reset..."
    alembic upgrade head || echo "Warning: Failed to apply migrations after reset"
fi

# Если таблиц всё ещё недостаточно, создаем их напрямую
if [ "$NEW_TABLE_COUNT" -lt 4 ]; then
    echo "Still missing tables. Creating tables directly with SQLAlchemy..."
    python -c "
    from app.db import engine
    from app.models.base import Base
    from app.models.user import User
    from app.models.transaction import Transaction
    from app.models.game_session import GameSession
    
    # Создаем все таблицы напрямую
    Base.metadata.create_all(bind=engine)
    print('Tables created with SQLAlchemy')
    "
    
    # Обновляем таблицу alembic_version с последней миграцией
    echo "Updating alembic_version table with latest migration..."
    python scripts/update_alembic_version.py || echo "Warning: Failed to update alembic_version"
fi

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000