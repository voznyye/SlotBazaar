#!/usr/bin/env python3
"""
Скрипт для обновления таблицы alembic_version.
Используется для установки конкретной версии миграции без применения миграций.
"""
import os
import sys
import psycopg2
import logging
import argparse
from dotenv import load_dotenv

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

def get_latest_migration_id():
    """Получает ID последней созданной миграции в директории alembic/versions."""
    versions_dir = os.path.join('alembic', 'versions')
    
    if not os.path.exists(versions_dir):
        logger.error(f"Migrations directory not found: {versions_dir}")
        return None
    
    migration_files = [f for f in os.listdir(versions_dir) if f.endswith('.py') and not f.startswith('__')]
    
    if not migration_files:
        logger.error("No migration files found")
        return None
    
    # Сортируем по времени создания, берем самый свежий
    migration_files.sort(key=lambda x: os.path.getctime(os.path.join(versions_dir, x)), reverse=True)
    newest_migration = migration_files[0]
    
    # Извлекаем ID миграции из имени файла
    migration_id = newest_migration.split('_')[0]
    logger.info(f"Latest migration: {newest_migration} (ID: {migration_id})")
    
    return migration_id

def update_alembic_version(migration_id):
    """Обновляет таблицу alembic_version, устанавливая указанный ID миграции."""
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set")
        return False
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Проверяем текущее содержимое таблицы alembic_version
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
        
        # Добавляем новый ID миграции
        logger.info(f"Adding migration ID to alembic_version: {migration_id}")
        try:
            cur.execute("INSERT INTO alembic_version (version_num) VALUES (%s)", (migration_id,))
            logger.info("Migration ID added to alembic_version")
        except Exception as e:
            logger.error(f"Error adding migration ID: {e}")
            return False
        
        # Проверяем результат
        try:
            cur.execute("SELECT * FROM alembic_version")
            versions = cur.fetchall()
            logger.info(f"Updated alembic_version entries: {versions}")
        except Exception as e:
            logger.warning(f"Could not select from alembic_version: {e}")
        
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Database error: {e}")
        return False

def main():
    """Основная функция для обновления таблицы alembic_version."""
    parser = argparse.ArgumentParser(description="Update alembic_version table with a specific migration ID")
    parser.add_argument("--migration-id", help="Migration ID to set (if not provided, latest migration will be used)")
    args = parser.parse_args()
    
    # Если ID миграции не указан, используем последнюю миграцию
    migration_id = args.migration_id
    if not migration_id:
        logger.info("Migration ID not provided, using latest migration")
        migration_id = get_latest_migration_id()
        
    if not migration_id:
        logger.error("Failed to determine migration ID")
        return False
    
    # Обновляем таблицу alembic_version
    if update_alembic_version(migration_id):
        logger.info(f"Successfully updated alembic_version to {migration_id}")
        return True
    else:
        logger.error("Failed to update alembic_version")
        return False

if __name__ == "__main__":
    logger.info("Starting alembic_version update")
    
    if main():
        logger.info("Update completed successfully")
        sys.exit(0)
    else:
        logger.error("Update failed")
        sys.exit(1)