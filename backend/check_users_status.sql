-- Verificar estado de usuarios de prueba
SELECT 
    email,
    first_name || ' ' || last_name as nombre,
    role,
    status,
    is_email_verified,
    is_phone_verified,
    is_identity_verified,
    is_kyc_verified,
    created_at
FROM users
WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com')
ORDER BY email;

-- Actualizar todos a 'active' si es necesario
UPDATE users 
SET status = 'active' 
WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com')
  AND status != 'active';

