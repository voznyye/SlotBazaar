#!/usr/bin/env python3
"""
Скрипт для исправления структуры базы данных напрямую без Alembic.
Вы можете запустить его из консоли на Render.com.
"""

import os
import psycopg2
from dotenv import load_dotenv
import sys
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('db_fix')

# Загрузка переменных окружения
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    # Попробуем получить из аргументов командной строки
    if len(sys.argv) > 1:
        DATABASE_URL = sys.argv[1]
    else:
        logger.error('DATABASE_URL not found in environment variables or command line arguments')
        logger.info('Usage: python db_fix.py [DATABASE_URL]')
        sys.exit(1)

try:
    # Подключаемся к базе данных
    logger.info('Connecting to database...')
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Выводим список таблиц для диагностики
    logger.info('Current tables in database:')
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema='public' AND table_type='BASE TABLE'
    """)
    tables = cur.fetchall()
    for table in tables:
        logger.info(f'- {table[0]}')
    
    # Проверяем существование таблицы users
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='users'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating users table...')
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
        
        logger.info('Users table created')
    else:
        logger.info('Users table exists, checking columns...')
        
        # Проверяем наличие колонки is_verified
        cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_verified'
        """)
        
        if cur.fetchone() is None:
            logger.info('Adding is_verified column...')
            cur.execute('ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false')
            logger.info('is_verified column added')
        else:
            logger.info('is_verified column already exists')
        
        # Проверяем наличие колонки last_login
        cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_login'
        """)
        
        if cur.fetchone() is None:
            logger.info('Adding last_login column...')
            cur.execute('ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE')
            logger.info('last_login column added')
        else:
            logger.info('last_login column already exists')
    
    # Проверяем существование типов enum
    cur.execute("""
    SELECT typname FROM pg_type WHERE typname='transactiontype'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating transaction type enum...')
        cur.execute("""
        CREATE TYPE transactiontype AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'REFUND')
        """)
        logger.info('Transaction type enum created')
    else:
        logger.info('Transaction type enum already exists')
    
    cur.execute("""
    SELECT typname FROM pg_type WHERE typname='transactionstatus'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating transaction status enum...')
        cur.execute("""
        CREATE TYPE transactionstatus AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        """)
        logger.info('Transaction status enum created')
    else:
        logger.info('Transaction status enum already exists')
    
    # Проверяем существование таблицы game_sessions
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='game_sessions'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating game_sessions table...')
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
        
        logger.info('Game sessions table created')
    else:
        logger.info('Game sessions table exists, checking columns...')
        
        # Проверяем наличие колонки game_type
        cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name='game_sessions' AND column_name='game_type'
        """)
        
        if cur.fetchone() is None:
            logger.info('Adding game_type column...')
            cur.execute('ALTER TABLE game_sessions ADD COLUMN game_type VARCHAR(50) NOT NULL DEFAULT \'unknown\'')
            logger.info('game_type column added')
        else:
            logger.info('game_type column already exists')
    
    # Проверяем существование таблицы transactions
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='transactions'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating transactions table...')
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
        
        logger.info('Transactions table created')
    else:
        logger.info('Transactions table already exists')
    
    # Выводим информацию о колонках в таблицах
    logger.info('\nDetailed schema information:')
    
    for table in ['users', 'game_sessions', 'transactions']:
        logger.info(f'\nColumns in {table}:')
        cur.execute(f"""
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns 
        WHERE table_name='{table}'
        ORDER BY ordinal_position
        """)
        columns = cur.fetchall()
        for col in columns:
            col_name, data_type, max_length, nullable = col
            logger.info(f"- {col_name}: {data_type}{f'({max_length})' if max_length else ''} {'NULL' if nullable == 'YES' else 'NOT NULL'}")
    
    conn.commit()
    logger.info('\nDatabase schema verification and update completed successfully')
    
except Exception as e:
    logger.error(f'Error updating database schema: {e}')
    if 'conn' in locals():
        conn.rollback()
finally:
    if 'conn' in locals():
        conn.close()