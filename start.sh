#!/bin/bash

# ЗАЩИТА ОТ СБРОСА ДАННЫХ
if [ -f "scripts/reset_database.py" ]; then
    echo "ВНИМАНИЕ: Обнаружен скрипт reset_database.py, временно переименовываем его для защиты данных"
    mv scripts/reset_database.py scripts/reset_database.py.disabled
fi

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
            
            # Запускаем безопасный скрипт восстановления таблиц (НЕ УДАЛЯЕТ данные)
            echo "Запускаем безопасный скрипт восстановления таблиц..."
            python scripts/recover_tables.py
        }
    }
}

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000