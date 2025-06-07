#!/usr/bin/env python3
"""
Скрипт для полного сброса и пересоздания базы данных.
ВНИМАНИЕ: Этот скрипт удалит все данные!

Использование:
  python reset_database.py [DATABASE_URL] [--force]
  
  --force: Пропускает подтверждение пользователя (для автоматизированных скриптов)
"""

import os
import psycopg2
from dotenv import load_dotenv
import sys
import logging
import argparse

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('reset_database')

# Парсинг аргументов командной строки
parser = argparse.ArgumentParser(description='Reset and recreate the database schema')
parser.add_argument('database_url', nargs='?', help='Database URL (optional if DATABASE_URL env var is set)')
parser.add_argument('--force', action='store_true', help='Skip confirmation prompt')
args = parser.parse_args()

# Загрузка переменных окружения
load_dotenv()
DATABASE_URL = args.database_url or os.getenv('DATABASE_URL')

if not DATABASE_URL:
    logger.error('DATABASE_URL not found in environment variables or command line arguments')
    logger.info('Usage: python reset_database.py [DATABASE_URL] [--force]')
    sys.exit(1)

# Запрос подтверждения, если не указан флаг --force
if not args.force:
    confirm = input("""
WARNING: This script will DELETE ALL DATA and recreate the database schema!
Are you sure you want to continue? [y/N]: """).lower().strip()
    
    if confirm != 'y':
        logger.info("Operation cancelled by user")
        sys.exit(0)
    
logger.info("Proceeding with database reset...")

try:
    # Подключаемся к базе данных
    logger.info('Connecting to database...')
    conn = psycopg2.connect(DATABASE_URL)
    
    # Проверяем текущее состояние транзакций
    # Сначала попробуем установить autocommit = True для сброса любых активных транзакций
    conn.autocommit = True
    
    # Создаем новый курсор
    cur = conn.cursor()
    
    # Попытка отменить любые незавершенные транзакции
    try:
        cur.execute("ROLLBACK")
        logger.info("Rolled back any pending transactions")
    except Exception as e:
        logger.warning(f"Could not rollback: {e}")
    
    # Теперь устанавливаем autocommit = False для нашей новой транзакции
    conn.autocommit = False
    # Пересоздаем курсор для новой транзакции
    cur = conn.cursor()
    
    # 1. Удаляем все существующие таблицы и типы
    logger.info('Dropping all existing tables and types...')
    
    # Удаляем таблицы в правильном порядке (сначала зависимые)
    tables = ['transactions', 'game_sessions', 'users']
    for table in tables:
        try:
            cur.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            logger.info(f"Dropped table {table}")
        except Exception as e:
            logger.warning(f"Error dropping table {table}: {e}")
            # Продолжаем выполнение
    
    # Удаляем все пользовательские типы
    try:
        cur.execute("DROP TYPE IF EXISTS transactiontype CASCADE")
        logger.info("Dropped type transactiontype")
    except Exception as e:
        logger.warning(f"Error dropping type transactiontype: {e}")
    
    try:
        cur.execute("DROP TYPE IF EXISTS transactionstatus CASCADE")
        logger.info("Dropped type transactionstatus")
    except Exception as e:
        logger.warning(f"Error dropping type transactionstatus: {e}")
    
    # 2. Создаем типы enum
    logger.info('Creating enum types...')
    try:
        cur.execute("""
        CREATE TYPE transactiontype AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'REFUND')
        """)
        logger.info('Created transactiontype enum')
    except Exception as e:
        logger.error(f"Error creating transactiontype enum: {e}")
        raise
    
    try:
        cur.execute("""
        CREATE TYPE transactionstatus AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')
        """)
        logger.info('Created transactionstatus enum')
    except Exception as e:
        logger.error(f"Error creating transactionstatus enum: {e}")
        raise
    
    # 3. Создаем таблицу пользователей
    logger.info('Creating users table...')
    try:
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
        
        logger.info('Created users table')
    except Exception as e:
        logger.error(f"Error creating users table: {e}")
        raise
    
    # 4. Создаем таблицу игровых сессий
    logger.info('Creating game_sessions table...')
    try:
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
        
        logger.info('Created game_sessions table')
    except Exception as e:
        logger.error(f"Error creating game_sessions table: {e}")
        raise
    
    # 5. Создаем таблицу транзакций
    logger.info('Creating transactions table...')
    try:
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
        
        logger.info('Created transactions table')
    except Exception as e:
        logger.error(f"Error creating transactions table: {e}")
        raise
    
    # 6. Создаем тестового пользователя (опционально)
    try:
        cur.execute("""
        INSERT INTO users (username, email, hashed_password, balance, is_active, is_verified)
        VALUES ('test_user', 'test@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 1000.00, true, true)
        """)
        logger.info('Created test user (password: "password")')
    except Exception as e:
        logger.warning(f"Error creating test user: {e}")
    
    # Фиксируем все изменения
    conn.commit()
    logger.info('Database reset and recreated successfully')
    
except Exception as e:
    logger.error(f'Fatal error resetting database: {e}')
    conn.rollback()
    sys.exit(1)
finally:
    if 'conn' in locals():
        conn.close()