#!/bin/bash

# Применяем миграции
echo "Running database migrations..."
alembic upgrade head || {
    echo "Migration failed, but we'll continue anyway..."
    # Применить только нашу миграцию для добавления колонки
    echo "Trying to apply just the column addition migration..."
    alembic upgrade add_is_verified_column || {
        echo "Failed to apply migration, but we'll try to start the app anyway..."
    }
}

# Альтернативное решение: прямое выполнение SQL
echo "Checking if columns exist and adding them if needed..."
python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
conn_string = os.getenv('DATABASE_URL')

try:
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    
    # Проверяем наличие колонки is_verified
    cur.execute(\"\"\"
    SELECT column_name FROM information_schema.columns 
    WHERE table_name='users' AND column_name='is_verified'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Adding is_verified column...')
        cur.execute('ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false')
    else:
        print('Column is_verified already exists')
    
    # Проверяем наличие колонки last_login
    cur.execute(\"\"\"
    SELECT column_name FROM information_schema.columns 
    WHERE table_name='users' AND column_name='last_login'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Adding last_login column...')
        cur.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE')
    else:
        print('Column last_login already exists')
    
    conn.commit()
    print('Database updated successfully')
    
except Exception as e:
    print(f'Error updating database: {e}')
finally:
    if 'conn' in locals():
        conn.close()
"

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000