#!/usr/bin/env python3
"""
СКРИПТ АВАРИЙНОГО ВОССТАНОВЛЕНИЯ ТАБЛИЦ
Этот скрипт предназначен для восстановления таблиц в продакшен-среде,
когда они были случайно удалены.

Он НЕ удаляет существующие таблицы, а только создает недостающие.
"""

import os
import psycopg2
from dotenv import load_dotenv
import sys
import logging
import time

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('recover_tables')

# Загрузка переменных окружения
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    # Попробуем получить из аргументов командной строки
    if len(sys.argv) > 1:
        DATABASE_URL = sys.argv[1]
    else:
        logger.error('DATABASE_URL not found in environment variables or command line arguments')
        logger.info('Usage: python recover_tables.py [DATABASE_URL]')
        sys.exit(1)

# Важное предупреждение
logger.warning("=" * 80)
logger.warning("ЭТОТ СКРИПТ ВОССТАНОВИТ ТОЛЬКО СТРУКТУРУ ТАБЛИЦ!")
logger.warning("ДАННЫЕ, КОТОРЫЕ БЫЛИ УТЕРЯНЫ, НЕ БУДУТ ВОССТАНОВЛЕНЫ!")
logger.warning("=" * 80)
time.sleep(2)  # Пауза для чтения предупреждения

try:
    # Подключаемся к базе данных
    logger.info('Connecting to database...')
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True  # Каждая команда будет в отдельной транзакции для безопасности
    cur = conn.cursor()
    
    # Проверяем существование типов enum
    logger.info("Checking enum types...")
    
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
    
    # Проверяем существование таблицы users
    logger.info("Checking users table...")
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='users'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating users table...')
        cur.execute("""
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
        """)
        
        cur.execute("CREATE INDEX ix_users_id ON users (id)")
        cur.execute("CREATE UNIQUE INDEX ix_users_email ON users (email)")
        cur.execute("CREATE UNIQUE INDEX ix_users_username ON users (username)")
        
        logger.info('Users table created')
    else:
        logger.info('Users table already exists')
    
    # Проверяем существование таблицы game_sessions
    logger.info("Checking game_sessions table...")
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='game_sessions'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating game_sessions table...')
        cur.execute("""
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
        """)
        
        cur.execute("CREATE INDEX ix_game_sessions_id ON game_sessions (id)")
        cur.execute("CREATE INDEX ix_game_sessions_user_id ON game_sessions (user_id)")
        
        logger.info('Game sessions table created')
    else:
        logger.info('Game sessions table already exists')
    
    # Проверяем существование таблицы transactions
    logger.info("Checking transactions table...")
    cur.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_name='transactions'
    """)
    
    if cur.fetchone() is None:
        logger.info('Creating transactions table...')
        cur.execute("""
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
        """)
        
        cur.execute("CREATE INDEX ix_transactions_id ON transactions (id)")
        cur.execute("CREATE INDEX ix_transactions_user_id ON transactions (user_id)")
        
        logger.info('Transactions table created')
    else:
        logger.info('Transactions table already exists')
    
    logger.info("=" * 80)
    logger.info("ВОССТАНОВЛЕНИЕ ТАБЛИЦ ЗАВЕРШЕНО!")
    logger.info("Все таблицы и индексы были проверены и созданы при необходимости.")
    logger.info("=" * 80)
    
except Exception as e:
    logger.error(f'Error during recovery: {e}')
finally:
    if 'conn' in locals():
        conn.close()