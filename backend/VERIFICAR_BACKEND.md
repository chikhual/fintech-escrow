# 🔍 Guía para Verificar el Backend

## 📋 Checklist de Verificación

### 1. Verificar que PostgreSQL esté corriendo

```bash
# Verificar si PostgreSQL está activo
pg_isready

# O intentar conectarse
psql -U postgres -l
```

### 2. Verificar Base de Datos y Usuario

```bash
# Conectarse a PostgreSQL como superusuario
psql -U postgres

# Dentro de psql, verificar si existe el usuario
\du

# Verificar si existe la base de datos
\l

# Si no existe, crear usuario y base de datos:
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
CREATE DATABASE fintech_escrow OWNER fintech_user;
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
\q
```

### 3. Instalar Dependencias de Python

```bash
cd backend
pip install -r requirements.txt
# O específicamente:
pip install 'pydantic[email]'
pip install email-validator
```

### 4. Verificar Variables de Entorno

```bash
# Verificar que las variables estén configuradas
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

# Verificar
echo $DATABASE_URL
echo $SECRET_KEY
```

### 5. Iniciar el Backend

```bash
cd backend
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"
cd auth_service
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Deberías ver:
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 6. Probar Endpoints del Backend

En otra terminal, prueba los endpoints:

```bash
# Health check
curl http://localhost:8001/health

# Probar login (debe fallar sin credenciales correctas)
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ben@test.com", "password": "Etuxad1$"}'

# Ver documentación API
open http://localhost:8001/docs
```

### 7. Verificar Usuarios en Base de Datos

```bash
psql -U fintech_user -d fintech_escrow -c "
SELECT email, role, status, is_email_verified 
FROM users 
WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com');
"
```

---

## 🐛 Problemas Comunes y Soluciones

### Error: `role "fintech_user" does not exist`

**Solución:**
```bash
psql -U postgres
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
CREATE DATABASE fintech_escrow OWNER fintech_user;
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
\q
```

### Error: `email-validator is not installed`

**Solución:**
```bash
pip install 'pydantic[email]'
pip install email-validator
```

### Error: `connection refused` o puerto en uso

**Solución:**
```bash
# Ver qué está usando el puerto 8001
lsof -i :8001

# O cambiar el puerto en el comando uvicorn
python3 -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

### Error: Tablas no existen

**Solución:**
```bash
# Las tablas se crean automáticamente al iniciar el servidor
# Pero puedes verificar:
psql -U fintech_user -d fintech_escrow -c "\dt"
```

---

## ✅ Verificación Exitosa

Si todo está bien, deberías poder:

1. ✅ Ver el servidor corriendo en `http://localhost:8001`
2. ✅ Acceder a la documentación en `http://localhost:8001/docs`
3. ✅ Ver el endpoint `/health` respondiendo
4. ✅ Hacer login desde el frontend sin errores

