#!/bin/bash

# КРИТИЧЕСКАЯ СИТУАЦИЯ: ПРИНУДИТЕЛЬНЫЙ СБРОС БАЗЫ ДАННЫХ
echo "EMERGENCY DATABASE RESET IN PROGRESS..."
echo "This will delete all data and recreate the database schema!"

# Принудительно выполняем скрипт сброса базы данных (--force пропускает подтверждение)
python scripts/reset_database.py --force

# Если по какой-то причине скрипт сброса не сработал, пробуем другие методы
if [ $? -ne 0 ]; then
    echo "Emergency reset failed, trying alternative methods..."
    
    # Пытаемся использовать более простой скрипт создания таблиц
    python scripts/create_tables.py
    
    # Если и это не сработало, пробуем Alembic
    if [ $? -ne 0 ]; then
        echo "Direct SQL approach failed, trying migrations..."
        alembic upgrade heads || echo "All database repair methods failed!"
    fi
fi

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000