#!/bin/bash

# Применяем чистую миграцию для создания всех таблиц заново
echo "Running database recreation migration..."
alembic upgrade recreate_all_tables || {
    echo "Recreation migration failed, trying other migrations..."
    alembic upgrade head || {
        echo "All migrations failed, using direct SQL approach..."
        
        # Прямое выполнение SQL для создания/обновления схемы
        python -c "
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
conn_string = os.getenv('DATABASE_URL')

try:
    conn = psycopg2.connect(conn_string)
    cur = conn.cursor()
    
    # Проверяем существование таблицы users
    cur.execute(\"\"\"
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='users'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Creating users table...')
        cur.execute('''
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            balance NUMERIC(12,2) NOT NULL,
            is_active BOOLEAN NOT NULL,
            is_verified BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP WITH TIME ZONE
        )
        ''')
        
        cur.execute('CREATE INDEX ix_users_id ON users (id)')
        cur.execute('CREATE UNIQUE INDEX ix_users_email ON users (email)')
        cur.execute('CREATE UNIQUE INDEX ix_users_username ON users (username)')
        
        print('Users table created')
    else:
        # Проверяем наличие колонки is_verified
        cur.execute(\"\"\"
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_verified'
        \"\"\")
        
        if cur.fetchone() is None:
            print('Adding is_verified column...')
            cur.execute('ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false')
        
        # Проверяем наличие колонки last_login
        cur.execute(\"\"\"
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_login'
        \"\"\")
        
        if cur.fetchone() is None:
            print('Adding last_login column...')
            cur.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE')
    
    # Проверяем существование таблицы game_sessions
    cur.execute(\"\"\"
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='game_sessions'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Creating game_sessions table...')
        cur.execute('''
        CREATE TABLE game_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            game_type VARCHAR(50) NOT NULL,
            bet_amount NUMERIC(10,2) NOT NULL,
            win_amount NUMERIC(10,2) NOT NULL,
            net_result NUMERIC(10,2) NOT NULL,
            game_data JSON,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')
        
        cur.execute('CREATE INDEX ix_game_sessions_id ON game_sessions (id)')
        cur.execute('CREATE INDEX ix_game_sessions_user_id ON game_sessions (user_id)')
        
        print('Game sessions table created')
    else:
        # Проверяем наличие колонки game_type
        cur.execute(\"\"\"
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='game_sessions' AND column_name='game_type'
        \"\"\")
        
        if cur.fetchone() is None:
            print('Adding game_type column...')
            cur.execute('ALTER TABLE game_sessions ADD COLUMN game_type VARCHAR(50) NOT NULL DEFAULT \'unknown\'')
    
    # Проверяем существование типов enum
    cur.execute(\"\"\"
    SELECT typname FROM pg_type WHERE typname='transactiontype'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Creating transaction type enum...')
        cur.execute(\"\"\"
        CREATE TYPE transactiontype AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'REFUND')
        \"\"\")
    
    cur.execute(\"\"\"
    SELECT typname FROM pg_type WHERE typname='transactionstatus'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Creating transaction status enum...')
        cur.execute(\"\"\"
        CREATE TYPE transactionstatus AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        \"\"\")
    
    # Проверяем существование таблицы transactions
    cur.execute(\"\"\"
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='transactions'
    \"\"\")
    
    if cur.fetchone() is None:
        print('Creating transactions table...')
        cur.execute('''
        CREATE TABLE transactions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            type transactiontype NOT NULL,
            status transactionstatus NOT NULL,
            amount NUMERIC(12,2) NOT NULL,
            balance_before NUMERIC(12,2) NOT NULL,
            balance_after NUMERIC(12,2) NOT NULL,
            description VARCHAR(255),
            game_session_id INTEGER,
            reference_id VARCHAR(100),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (game_session_id) REFERENCES game_sessions(id)
        )
        ''')
        
        cur.execute('CREATE INDEX ix_transactions_id ON transactions (id)')
        cur.execute('CREATE INDEX ix_transactions_user_id ON transactions (user_id)')
        
        print('Transactions table created')
    
    conn.commit()
    print('Database schema updated successfully')
    
except Exception as e:
    print(f'Error updating database schema: {e}')
    conn.rollback()
finally:
    if 'conn' in locals():
        conn.close()
        "
    }
}

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000