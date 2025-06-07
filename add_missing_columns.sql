-- Скрипт для добавления отсутствующих колонок в таблицу users

-- Проверяем наличие колонки is_verified и добавляем её, если она отсутствует
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name='users' AND column_name='is_verified'
    ) THEN
        EXECUTE 'ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false';
        RAISE NOTICE 'Added is_verified column';
    ELSE
        RAISE NOTICE 'Column is_verified already exists';
    END IF;
    
    -- Проверяем наличие колонки last_login и добавляем её, если она отсутствует
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name='users' AND column_name='last_login'
    ) THEN
        EXECUTE 'ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE';
        RAISE NOTICE 'Added last_login column';
    ELSE
        RAISE NOTICE 'Column last_login already exists';
    END IF;
END
$$;