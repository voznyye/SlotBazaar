#!/usr/bin/env python3
"""
Скрипт для исправления проблемы с множественными головными ревизиями Alembic.
Автоматически определяет головные ревизии и применяет их.
"""
import subprocess
import os
import sys
import logging
from dotenv import load_dotenv

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger('fix_alembic_heads')

# Загрузка переменных окружения
load_dotenv()

def get_alembic_heads():
    """Получает список текущих головных ревизий Alembic."""
    try:
        # Запускаем команду alembic heads
        result = subprocess.run(
            ['alembic', 'heads'], 
            capture_output=True, 
            text=True, 
            check=True
        )
        
        # Парсим вывод
        heads = []
        for line in result.stdout.splitlines():
            if line and not line.startswith('INFO') and not line.startswith('DEBUG'):
                # Обычно строка содержит идентификатор ревизии в начале строки
                head_id = line.split(' ')[0].strip()
                if head_id:
                    heads.append(head_id)
        
        return heads
    except subprocess.CalledProcessError as e:
        logger.error(f"Error getting Alembic heads: {e}")
        logger.error(f"STDOUT: {e.stdout}")
        logger.error(f"STDERR: {e.stderr}")
        return []

def check_alembic_version_table():
    """Проверяет содержимое таблицы alembic_version в базе данных."""
    try:
        # Используем psql для запроса к таблице alembic_version
        DATABASE_URL = os.getenv('DATABASE_URL')
        if not DATABASE_URL:
            logger.error("DATABASE_URL not set")
            return False
            
        # Парсим DATABASE_URL для извлечения параметров подключения
        # Обратите внимание, что это упрощённый парсер и может не работать для всех URL
        parts = DATABASE_URL.replace("postgresql://", "").split("@")
        user_pass = parts[0].split(":")
        username = user_pass[0]
        password = user_pass[1] if len(user_pass) > 1 else ""
        
        host_port_db = parts[1].split("/")
        host_port = host_port_db[0].split(":")
        host = host_port[0]
        port = host_port[1] if len(host_port) > 1 else "5432"
        database = host_port_db[1]
        
        # Формируем команду с параметрами подключения
        cmd = [
            "psql", 
            f"postgresql://{username}:{password}@{host}:{port}/{database}",
            "-c", "SELECT * FROM alembic_version;"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        logger.info("Current alembic_version table contents:")
        logger.info(result.stdout)
        
        return True
    except Exception as e:
        logger.error(f"Error checking alembic_version table: {e}")
        return False

def apply_migrations():
    """Применяет все головные ревизии миграций."""
    heads = get_alembic_heads()
    
    if not heads:
        logger.error("Could not determine Alembic heads")
        return False
    
    logger.info(f"Found {len(heads)} Alembic heads: {heads}")
    
    # Применяем каждую головную ревизию по отдельности
    success = True
    for head in heads:
        try:
            logger.info(f"Applying migration: {head}")
            subprocess.run(
                ['alembic', 'upgrade', head], 
                check=True
            )
            logger.info(f"Successfully applied migration: {head}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Error applying migration {head}: {e}")
            success = False
    
    return success

if __name__ == "__main__":
    logger.info("Starting Alembic heads fix script")
    
    # Проверяем содержимое таблицы alembic_version (информационно)
    check_alembic_version_table()
    
    # Применяем миграции
    if apply_migrations():
        logger.info("Successfully applied all migrations")
        sys.exit(0)
    else:
        logger.error("Failed to apply all migrations")
        sys.exit(1)