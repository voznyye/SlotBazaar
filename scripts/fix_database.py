#!/usr/bin/env python3
"""
СКРИПТ АВАРИЙНОГО ВОССТАНОВЛЕНИЯ БАЗЫ ДАННЫХ
Исправляет несогласованность между метаданными и физическими таблицами.
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
logger = logging.getLogger('fix_database')

# Загрузка переменных окружения
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    # Попробуем получить из аргументов командной строки
    if len(sys.argv) > 1:
        DATABASE_URL = sys.argv[1]
    else:
        logger.error('DATABASE_URL not found in environment variables or command line arguments')
        logger.info('Usage: python fix_database.py [DATABASE_URL]')
        sys.exit(1)

# Важное предупреждение
logger.warning("=" * 80)
logger.warning("КРИТИЧЕСКОЕ ВОССТАНОВЛЕНИЕ БАЗЫ ДАННЫХ")
logger.warning("Этот скрипт исправит несогласованность в базе данных")
logger.warning("=" * 80)
time.sleep(1)

try:
    # Подключаемся к базе данных
    logger.info('Connecting to database...')
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # 1. ОЧИСТКА ВСЕХ МЕТАДАННЫХ
    logger.info("ФАЗА 1: Очистка метаданных...")
    
    tables_to_check = ['users', 'game_sessions', 'transactions']
    enum_types = ['transactiontype', 'transactionstatus']
    
    # Очищаем таблицы
    for table in tables_to_check:
        try:
            cur.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
            logger.info(f"Очищены метаданные таблицы {table}")
        except Exception as e:
            logger.warning(f"Ошибка при очистке таблицы {table}: {e}")
    
    # 2. СОЗДАНИЕ ENUM ТИПОВ
    logger.info("ФАЗА 2: Создание enum типов...")
    
    # Создаем enum типы
    enum_definitions = {
        'transactiontype': "'DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'BONUS', 'REFUND'",
        'transactionstatus': "'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'"
    }
    
    for enum_name, values in enum_definitions.items():
        try:
            # Сначала пробуем удалить если существует
            cur.execute(f"DROP TYPE IF EXISTS {enum_name} CASCADE")
            # Затем создаем заново
            cur.execute(f"CREATE TYPE {enum_name} AS ENUM ({values})")
            logger.info(f"Создан enum тип {enum_name}")
        except Exception as e:
            logger.error(f"Ошибка при создании enum типа {enum_name}: {e}")
            logger.info("Пробуем продолжить без этого enum типа")
    
    # 3. СОЗДАНИЕ ТАБЛИЦ
    logger.info("ФАЗА 3: Создание таблиц...")
    
    # Создаем таблицу пользователей
    try:
        logger.info("Создание таблицы users...")
        cur.execute("""
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            balance NUMERIC(12,2) NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT true,
            is_verified BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP WITH TIME ZONE
        )
        """)
        
        cur.execute("CREATE INDEX ix_users_id ON users (id)")
        cur.execute("CREATE UNIQUE INDEX ix_users_email ON users (email)")
        cur.execute("CREATE UNIQUE INDEX ix_users_username ON users (username)")
        
        logger.info("Таблица users создана успешно")
        
        # Проверяем, что таблица действительно создана
        cur.execute("SELECT 1 FROM users LIMIT 1")
        logger.info("Таблица users доступна для запросов")
    except Exception as e:
        logger.error(f"Критическая ошибка при создании таблицы users: {e}")
        logger.error("Невозможно продолжать без таблицы users")
        sys.exit(1)
    
    # Создаем таблицу игровых сессий
    try:
        logger.info("Создание таблицы game_sessions...")
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
        
        logger.info("Таблица game_sessions создана успешно")
    except Exception as e:
        logger.error(f"Ошибка при создании таблицы game_sessions: {e}")
        logger.warning("Продолжаем без таблицы game_sessions")
    
    # Создаем таблицу транзакций
    try:
        logger.info("Создание таблицы transactions...")
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
        
        logger.info("Таблица transactions создана успешно")
    except Exception as e:
        logger.error(f"Ошибка при создании таблицы transactions: {e}")
        logger.warning("Продолжаем без таблицы transactions")
    
    # 4. СОЗДАНИЕ ТЕСТОВОГО ПОЛЬЗОВАТЕЛЯ
    logger.info("ФАЗА 4: Создание тестового пользователя...")
    
    try:
        cur.execute("SELECT COUNT(*) FROM users")
        user_count = cur.fetchone()[0]
        
        if user_count == 0:
            logger.info("Создание тестового пользователя...")
            cur.execute("""
            INSERT INTO users (username, email, hashed_password, balance, is_active, is_verified)
            VALUES ('test_user', 'test@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 1000.00, true, true)
            """)
            logger.info('Создан тестовый пользователь (логин: "test_user", пароль: "password")')
        else:
            logger.info(f"Найдено {user_count} пользователей, пропускаем создание тестового пользователя")
    except Exception as e:
        logger.error(f"Ошибка при создании тестового пользователя: {e}")
    
    # 5. ПРОВЕРКА ВОССТАНОВЛЕНИЯ
    logger.info("ФАЗА 5: Проверка успешности восстановления...")
    
    success = True
    try:
        # Проверяем основные таблицы
        for table in tables_to_check:
            try:
                cur.execute(f"SELECT COUNT(*) FROM {table}")
                count = cur.fetchone()[0]
                logger.info(f"Таблица {table}: {count} записей")
            except Exception as e:
                logger.error(f"Ошибка при проверке таблицы {table}: {e}")
                success = False
        
        if success:
            logger.info("=" * 80)
            logger.info("ВОССТАНОВЛЕНИЕ БАЗЫ ДАННЫХ УСПЕШНО ЗАВЕРШЕНО!")
            logger.info("Все необходимые таблицы созданы и доступны")
            logger.info("=" * 80)
        else:
            logger.warning("=" * 80)
            logger.warning("ВОССТАНОВЛЕНИЕ ЗАВЕРШЕНО С ОШИБКАМИ")
            logger.warning("Некоторые таблицы могут быть недоступны")
            logger.warning("=" * 80)
    except Exception as e:
        logger.error(f"Ошибка при финальной проверке: {e}")
        success = False

except Exception as e:
    logger.error(f"Критическая ошибка в процессе восстановления: {e}")
finally:
    try:
        if 'conn' in locals() and conn:
            conn.close()
            logger.info("Соединение с базой данных закрыто")
    except Exception as e:
        logger.error(f"Ошибка при закрытии соединения: {e}")
    
    logger.info("Скрипт восстановления завершен")