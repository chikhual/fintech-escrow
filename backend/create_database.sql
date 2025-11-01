-- Script para crear la base de datos FINTECH ESCROW
-- Ejecuta este script en PostgreSQL 17

-- Paso 1: Crear el usuario
-- Si el usuario ya existe, este comando fallará (puedes ignorar el error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'fintech_user') THEN
        CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
    END IF;
END
$$;

-- Paso 2: Otorgar privilegios al usuario
ALTER USER fintech_user CREATEDB;

-- Paso 3: Crear la base de datos
-- Si la base de datos ya existe, este comando fallará (puedes ignorar el error)
SELECT 'CREATE DATABASE fintech_escrow OWNER fintech_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fintech_escrow')\gexec

-- Paso 4: Conectar a la nueva base de datos y otorgar privilegios
\c fintech_escrow

-- Otorgar todos los privilegios en el esquema público
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO fintech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fintech_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fintech_user;

-- Paso 5: Verificar que todo se creó correctamente
SELECT '✅ Usuario creado:' as status, usename FROM pg_user WHERE usename = 'fintech_user';
SELECT '✅ Base de datos creada:' as status, datname FROM pg_database WHERE datname = 'fintech_escrow';

