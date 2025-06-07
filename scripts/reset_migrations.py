#!/usr/bin/env python3
"""
Скрипт для сброса миграций Alembic и создания новой миграции с текущей схемой БД.
Используется для исправления проблем с множественными головными ревизиями.
"""
import os
import sys
import psycopg2
import logging
from dotenv import load_dotenv
from sqlalchemy import inspect, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Загружаем переменные окружения
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def get_table_info(engine):
    """Получает информацию о существующих таблицах в БД."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    table_info = {}
    for table in tables:
        columns = inspector.get_columns(table)
        primary_key = inspector.get_pk_constraint(table)
        foreign_keys = inspector.get_foreign_keys(table)
        
        table_info[table] = {
            'columns': columns,
            'primary_key': primary_key,
            'foreign_keys': foreign_keys
        }
    
    return table_info

def clear_alembic_version():
    """Очищает таблицу alembic_version и добавляет новую запись."""
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set")
        return False
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Проверяем содержимое таблицы alembic_version
        try:
            cur.execute("SELECT * FROM alembic_version")
            versions = cur.fetchall()
            logger.info(f"Current alembic_version entries: {versions}")
        except Exception as e:
            logger.warning(f"Could not select from alembic_version: {e}")
        
        # Очищаем таблицу alembic_version
        logger.info("Clearing alembic_version table")
        try:
            cur.execute("DELETE FROM alembic_version")
            logger.info("alembic_version table cleared")
        except Exception as e:
            logger.error(f"Error clearing alembic_version table: {e}")
            return False
        
        # Создаем новую запись с временным ID
        new_version = "temp_reset_migration"
        logger.info(f"Adding new version to alembic_version: {new_version}")
        try:
            cur.execute("INSERT INTO alembic_version (version_num) VALUES (%s)", (new_version,))
            logger.info("New version added to alembic_version")
        except Exception as e:
            logger.error(f"Error adding new version: {e}")
            return False
        
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Database error: {e}")
        return False

def reset_migrations():
    """Основная функция для сброса миграций."""
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set")
        return False
    
    # Подключаемся к базе данных и получаем информацию о таблицах
    try:
        engine = create_engine(DATABASE_URL)
        table_info = get_table_info(engine)
        
        logger.info(f"Found {len(table_info)} tables in database:")
        for table, info in table_info.items():
            logger.info(f" - {table} ({len(info['columns'])} columns)")
        
        # Очищаем таблицу alembic_version
        if not clear_alembic_version():
            logger.error("Failed to clear alembic_version table")
            return False
        
        logger.info("Migration reset completed successfully")
        logger.info("\nINSTRUCTIONS:")
        logger.info("1. The alembic_version table has been updated with a temporary migration ID")
        logger.info("2. You can now create a new migration with:")
        logger.info("   alembic revision --autogenerate -m \"reset_schema\"")
        logger.info("3. After creating the new migration, update alembic_version with the new ID")
        
        return True
    except Exception as e:
        logger.error(f"Error in reset_migrations: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting Alembic migrations reset")
    
    if reset_migrations():
        logger.info("Successfully reset migrations")
        sys.exit(0)
    else:
        logger.error("Failed to reset migrations")
        sys.exit(1)