#!/bin/bash
set -e

# Этот скрипт выполняется во время сборки Docker-образа
echo "Running build script..."

# Проверяем, есть ли в репозитории alembic.ini
if [ -f alembic.ini ]; then
    echo "Found alembic.ini, checking migrations..."
    
    # Проверяем наличие директории с миграциями
    if [ -d alembic/versions ]; then
        echo "Migrations directory exists, continuing..."
    else
        echo "Error: migrations directory not found"
        exit 1
    fi
else
    echo "Error: alembic.ini not found"
    exit 1
fi

echo "Build completed successfully"