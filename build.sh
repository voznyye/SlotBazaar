#!/bin/bash
set -e

# Этот скрипт выполняется во время сборки Docker-образа на Render.com
echo "🚀 Running SlotBazaar build script..."

# Проверяем, есть ли в репозитории alembic.ini
if [ -f alembic.ini ]; then
    echo "✅ Found alembic.ini"
    
    # Проверяем наличие директории с миграциями
    if [ -d alembic/versions ]; then
        echo "✅ Migrations directory exists"
    else
        echo "⚠️ Warning: migrations directory not found"
        echo "Creating migrations directory..."
        mkdir -p alembic/versions
    fi
else
    echo "⚠️ Warning: alembic.ini not found"
    echo "This may cause issues with database migrations"
fi

# Проверяем наличие скрипта для инициализации базы данных
if [ -f scripts/fix_models_and_create_tables.py ]; then
    echo "✅ Database initialization script found"
else
    echo "❌ Error: Database initialization script not found"
    exit 1
fi

# Установка прав на исполнение для скриптов
chmod +x start.sh
echo "✅ Made start.sh executable"

echo "🎮 SlotBazaar build completed successfully"
echo "The application will initialize the database and create missing tables on first run"