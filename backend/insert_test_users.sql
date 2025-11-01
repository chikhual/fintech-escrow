-- Script SQL para crear usuarios de prueba
-- Ejecuta este script en PostgreSQL conectado a fintech_escrow

-- SUPER USUARIO - Benjamin
-- Email: ben@test.com
-- Password: Etuxad1$
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
    '$2b$12$4yCpEq/yQhx.JT2MWsTPjOBPTVn4iOA4fDqq4ZrXfmK7zfue8gBEC',
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

-- CLIENT (Vendedor)
-- Email: vendedor@test.com
-- Password: Vendedor1$
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
    '$2b$12$HEF3ih3J.S7UAWKnCxpNe.xzFwCErQKyhYZWHyGsk95kfJvAGLANe',
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

-- ASESOR
-- Email: asesor@test.com
-- Password: Asesor1$
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
    '$2b$12$kVaStEH36E8YNaarX40A2uJ7e3o11WoPYRUadR56uy/0xpNGCxBBi',
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

-- Verificar usuarios creados
SELECT 
    email,
    first_name || ' ' || last_name as nombre_completo,
    role,
    status,
    is_email_verified,
    is_kyc_verified
FROM users
WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com')
ORDER BY 
    CASE role
        WHEN 'super_user' THEN 1
        WHEN 'advisor' THEN 2
        WHEN 'client' THEN 3
    END;

