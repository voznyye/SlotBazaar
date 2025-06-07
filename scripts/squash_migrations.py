#!/usr/bin/env python3
"""
Скрипт для объединения всех миграций Alembic в одну новую миграцию.
Это решает проблему с несколькими головными ревизиями путем создания
единой миграции, отражающей текущее состояние базы данных.
"""
import os
import sys
import shutil
import datetime
import subprocess
import logging
import psycopg2
from dotenv import load_dotenv

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('squash_migrations')

# Загрузка переменных окружения
load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')

def backup_old_migrations():
    """Создает резервную копию текущих миграций."""
    versions_dir = os.path.join('alembic', 'versions')
    backup_dir = os.path.join('alembic', 'versions_backup_' + 
                            datetime.datetime.now().strftime('%Y%m%d_%H%M%S'))
    
    if not os.path.exists(versions_dir):
        logger.error(f"Migrations directory not found: {versions_dir}")
        return False
    
    # Создаем резервную копию
    logger.info(f"Creating backup of migrations in {backup_dir}")
    shutil.copytree(versions_dir, backup_dir)
    
    # Очищаем директорию с миграциями
    for file in os.listdir(versions_dir):
        if file.endswith('.py'):
            os.remove(os.path.join(versions_dir, file))
    
    logger.info("Old migrations backed up and directory cleared")
    return True

def create_single_migration():
    """Создает новую миграцию с текущей схемой БД."""
    try:
        # Генерируем новую миграцию с текущей схемой
        migration_name = "squashed_schema_" + datetime.datetime.now().strftime('%Y%m%d')
        logger.info(f"Creating new migration: {migration_name}")
        
        # Запускаем команду alembic revision
        cmd = [
            'alembic', 'revision', '--autogenerate',
            '-m', migration_name
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        logger.info("New migration created successfully")
        logger.info(result.stdout)
        
        # Ищем новый файл миграции
        versions_dir = os.path.join('alembic', 'versions')
        migration_files = [f for f in os.listdir(versions_dir) if f.endswith('.py')]
        
        if not migration_files:
            logger.error("No migration file was created")
            return None
        
        # Сортируем по времени создания, берем самый свежий
        newest_migration = sorted(migration_files, 
                                key=lambda x: os.path.getctime(os.path.join(versions_dir, x)),
                                reverse=True)[0]
        
        logger.info(f"New migration file: {newest_migration}")
        
        # Извлекаем ID миграции из имени файла
        migration_id = newest_migration.split('_')[0]
        return migration_id
    
    except subprocess.CalledProcessError as e:
        logger.error(f"Error creating migration: {e}")
        logger.error(f"STDOUT: {e.stdout}")
        logger.error(f"STDERR: {e.stderr}")
        return None

def update_alembic_version(migration_id):
    """Обновляет таблицу alembic_version, чтобы она указывала только на новую миграцию."""
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set")
        return False
    
    try:
        logger.info(f"Connecting to database: {DATABASE_URL[:20]}...")
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True  # Важно для DDL операций
        cur = conn.cursor()
        
        # Сначала очищаем таблицу
        logger.info("Clearing alembic_version table")
        cur.execute("DELETE FROM alembic_version")
        
        # Затем вставляем новый ID миграции
        logger.info(f"Setting alembic_version to: {migration_id}")
        cur.execute("INSERT INTO alembic_version (version_num) VALUES (%s)", (migration_id,))
        
        # Проверяем результат
        cur.execute("SELECT * FROM alembic_version")
        versions = cur.fetchall()
        logger.info(f"Current alembic_version: {versions}")
        
        conn.close()
        logger.info("alembic_version table updated successfully")
        return True
    
    except Exception as e:
        logger.error(f"Error updating alembic_version: {e}")
        return False

def main():
    """Основная функция, объединяющая все миграции."""
    logger.info("Starting migration squashing process")
    
    # Шаг 1: Резервное копирование и очистка
    if not backup_old_migrations():
        logger.error("Failed to backup old migrations")
        return False
    
    # Шаг 2: Создание новой миграции
    migration_id = create_single_migration()
    if not migration_id:
        logger.error("Failed to create new migration")
        return False
    
    # Шаг 3: Обновление таблицы alembic_version
    if not update_alembic_version(migration_id):
        logger.error("Failed to update alembic_version table")
        return False
    
    logger.info("Migration squashing completed successfully")
    logger.info(f"New migration ID: {migration_id}")
    logger.info("You can now use 'alembic upgrade head' without conflicts")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)