#!/bin/bash

echo "ВНИМАНИЕ: Этот скрипт полностью очистит базу данных и пересоздаст её!"
echo "Все данные будут потеряны!"
echo -n "Вы уверены? (y/n): "
read answer

if [ "$answer" != "y" ]; then
    echo "Операция отменена."
    exit 1
fi

echo "Начинаем полное восстановление базы данных..."

# Если есть переменная окружения DATABASE_URL, используем её
if [ -n "$DATABASE_URL" ]; then
    echo "Using DATABASE_URL from environment variables"
    python scripts/reset_database.py "$DATABASE_URL"
else
    # Иначе пытаемся получить из .env файла
    echo "No DATABASE_URL in environment, trying from .env file"
    python scripts/reset_database.py
fi

echo "Операция завершена."