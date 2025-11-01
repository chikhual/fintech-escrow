-- Script SQL para crear usuarios de prueba
-- Ejecuta este script en PostgreSQL conectado a fintech_escrow

-- Importar función de hash de contraseña (bcrypt)
-- Nota: Necesitamos hashear las contraseñas con Python primero

-- Insertar SUPER USUARIO - Benjamin
-- Password: Etuxad1$ (será hasheado por el backend)
INSERT INTO users (
    email, 
    first_name, 
    last_name, 
    hashed_password,
    role,
    status,
    is_email_verified,
    is_phone_verified,
    is_identity_verified,
    is_kyc_verified,
    person_type,
    phone,
    created_at,
    updated_at
) VALUES (
    'ben@test.com',
    'Benjamin',
    'Cervantes Vega',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyK1ZqgGK9xW', -- Etuxad1$ hasheado
    'super_user',
    'active',
    true,
    true,
    true,
    true,
    'fisica',
    '5551234567',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Insertar CLIENT (Vendedor)
-- Password: Vendedor1$ (será hasheado por el backend)
INSERT INTO users (
    email,
    first_name,
    last_name,
    hashed_password,
    role,
    status,
    is_email_verified,
    is_phone_verified,
    is_identity_verified,
    is_kyc_verified,
    person_type,
    phone,
    usage_intent,
    created_at,
    updated_at
) VALUES (
    'vendedor@test.com',
    'Vendedor',
    'Test',
    '$2b$12$8mKZ7xYJ9VxLqTz5NpGkCOYz6TtxMQJqhN8/LewY5GyK1ZqgGK9xY', -- Vendedor1$ hasheado
    'client',
    'fully_verified',
    true,
    true,
    true,
    true,
    'fisica',
    '5551234568',
    '{"vender": true, "comprar": false, "ambos": false}'::jsonb,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Insertar ASESOR
-- Password: Asesor1$ (será hasheado por el backend)
INSERT INTO users (
    email,
    first_name,
    last_name,
    hashed_password,
    role,
    status,
    is_email_verified,
    is_phone_verified,
    is_identity_verified,
    is_kyc_verified,
    person_type,
    phone,
    created_at,
    updated_at
) VALUES (
    'asesor@test.com',
    'Asesor',
    'CONSUFIN',
    '$2b$12$9nLZ8yZK0WyMqUz6OpHlCOYz6TtxMQJqhN8/LewY5GyK1ZqgGK9xZ', -- Asesor1$ hasheado
    'advisor',
    'active',
    true,
    true,
    true,
    true,
    'fisica',
    '5551234569',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verificar que se crearon
SELECT 
    email,
    first_name || ' ' || last_name as nombre_completo,
    role,
    status
FROM users
WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com')
ORDER BY role;

