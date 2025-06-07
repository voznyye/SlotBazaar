#!/bin/bash

# Применяем миграции с улучшенной обработкой ошибок
echo "Running database migrations..."
# Сначала попробуем перейти к объединяющей миграции, которая включает все изменения
alembic upgrade merge_heads || {
    echo "Merge migration failed, trying individual migrations..."
    # Если объединение не сработало, попробуем сначала recreate_all_tables
    alembic upgrade recreate_all_tables || {
        echo "Recreation migration failed, trying remaining migrations..."
        # Пытаемся выполнить все миграции
        alembic upgrade heads || {
            echo "All migrations failed, using direct SQL approach..."
            
            # Запускаем скрипт для создания таблиц напрямую (без сброса данных)
            python scripts/create_tables.py
        }
    }
}

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000