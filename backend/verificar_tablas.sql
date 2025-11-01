-- Script para verificar las tablas creadas en fintech_escrow
-- Ejecuta estos comandos en psql conectado a fintech_escrow

-- 1. Ver todas las tablas
\dt

-- 2. Ver tablas con más detalles
SELECT 
    table_name, 
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 3. Ver estructura de la tabla 'users'
\d users

-- 4. Ver estructura de la tabla 'documents'
\d documents

-- 5. Ver estructura de la tabla 'notifications'
\d notifications

-- 6. Contar cuántas tablas hay
SELECT COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- 7. Ver todos los nombres de tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

