#!/bin/bash

echo "Восстановление нормального режима работы приложения"
echo "Этот скрипт восстановит безопасную версию start.sh для нормальной работы"

# Создаем резервную копию текущего start.sh
cp start.sh start.sh.emergency

# Восстанавливаем нормальную версию start.sh
cat > start.sh << 'EOF'
#!/bin/bash

# Применяем миграции с улучшенной обработкой ошибок
echo "Running database migrations..."
# Сначала попробуем перейти к объединяющей миграции, которая включает все изменения
alembic upgrade merge_heads || {
    echo "Merge migration failed, trying individual migrations..."
    # Если объединение не сработало, попробуем выполнить все миграции
    alembic upgrade heads || {
        echo "Standard migrations failed, trying direct SQL approach..."
        
        # Запускаем скрипт для создания недостающих таблиц (безопасный режим)
        python scripts/create_tables.py
    }
}

# Запускаем приложение
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
EOF

# Восстанавливаем права на выполнение
chmod +x start.sh

echo "Нормальный режим восстановлен"
echo "Текущая версия сохранена как start.sh.emergency"
echo "После проверки нормальной работы приложения, вы можете удалить резервную копию"