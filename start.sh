#!/bin/bash

# Безопасное создание таблиц без удаления данных
echo "Initializing database..."

# Копируем наш скрипт для создания таблиц в продакшн
# Он проверяет и исправляет модели, а затем создает таблицы, если их нет
python scripts/fix_models_and_create_tables.py

# Если скрипт не сработал, используем миграции
if [ $? -ne 0 ]; then
    echo "Table creation failed, trying migrations..."
    alembic upgrade heads || echo "Warning: Database initialization incomplete"
fi

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000