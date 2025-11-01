#!/usr/bin/env python3
"""
Script simple para crear usuarios usando SQL directo después de hashear
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.auth import get_password_hash

# Hashear contraseñas
hash_ben = get_password_hash("Etuxad1$")
hash_vendedor = get_password_hash("Vendedor1$")
hash_asesor = get_password_hash("Asesor1$")

# Generar SQL
sql = f"""
-- SUPER USUARIO - Benjamin
INSERT INTO users (
    email, first_name, last_name, hashed_password, role, status,
    is_email_verified, is_phone_verified, is_identity_verified, is_kyc_verified,
    person_type, phone, created_at, updated_at
) VALUES (
    'ben@test.com', 'Benjamin', 'Cervantes Vega', '{hash_ben}',
    'super_user', 'active',
    true, true, true, true,
    'fisica', '5551234567', NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- CLIENT (Vendedor)
INSERT INTO users (
    email, first_name, last_name, hashed_password, role, status,
    is_email_verified, is_phone_verified, is_identity_verified, is_kyc_verified,
    person_type, phone, usage_intent, created_at, updated_at
) VALUES (
    'vendedor@test.com', 'Vendedor', 'Test', '{hash_vendedor}',
    'client', 'fully_verified',
    true, true, true, true,
    'fisica', '5551234568', '{{"vender": true, "comprar": false, "ambos": false}}'::jsonb,
    NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- ASESOR
INSERT INTO users (
    email, first_name, last_name, hashed_password, role, status,
    is_email_verified, is_phone_verified, is_identity_verified, is_kyc_verified,
    person_type, phone, created_at, updated_at
) VALUES (
    'asesor@test.com', 'Asesor', 'CONSUFIN', '{hash_asesor}',
    'advisor', 'active',
    true, true, true, true,
    'fisica', '5551234569', NOW(), NOW()
)
ON CONFLICT (email) DO UPDATE SET
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Verificar usuarios creados
SELECT email, first_name || ' ' || last_name as nombre, role, status 
FROM users 
WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com')
ORDER BY role;
"""

print("SQL generado. Copia y pega esto en tu terminal de PostgreSQL:")
print("="*70)
print(sql)
print("="*70)

