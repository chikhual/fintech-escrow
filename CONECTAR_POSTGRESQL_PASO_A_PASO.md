# 🔧 CONECTAR POSTGRESQL - INSTRUCCIONES PASO A PASO

## 📋 PASO 1: Verificar si PostgreSQL está instalado

Ejecuta este comando y dime qué resultado obtienes:

```bash
which psql
```

**Si aparece una ruta** (ej: `/usr/local/bin/psql` o `/opt/homebrew/bin/psql`):
- ✅ PostgreSQL está instalado
- **PASA AL PASO 2**

**Si dice "psql no encontrado" o no muestra nada:**
- ❌ PostgreSQL NO está instalado
- **NECESITAS INSTALARLO PRIMERO**

---

## 📦 PASO 2 (Solo si necesitas instalar): Instalar PostgreSQL

### Opción A: Con Homebrew (macOS - Recomendado)

```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar PostgreSQL
brew install postgresql@15

# Iniciar PostgreSQL
brew services start postgresql@15
```

### Opción B: Con Docker (Más fácil)

```bash
# Instalar Docker Desktop si no lo tienes
# Luego ejecutar:
cd /Users/benjmincervantesvega/fintech/backend
docker-compose up -d postgres
```

**Después de instalar, PASA AL PASO 3**

---

## 🔍 PASO 3: Verificar si PostgreSQL está corriendo

Ejecuta este comando:

```bash
pg_isready -h localhost -p 5432
```

**Si dice:** `localhost:5432 - accepting connections`
- ✅ PostgreSQL está corriendo
- **PASA AL PASO 4**

**Si dice:** `no response` o error de conexión
- ❌ PostgreSQL NO está corriendo
- **NECESITAS INICIARLO**

### Para iniciar PostgreSQL:

**Si instalaste con Homebrew:**
```bash
brew services start postgresql@15
```

**Si instalaste con Docker:**
```bash
cd /Users/benjmincervantesvega/fintech/backend
docker-compose up -d postgres
```

**Espera 10 segundos y vuelve a ejecutar `pg_isready`**

---

## 🗄️ PASO 4: Crear la base de datos y usuario

Ejecuta estos comandos UNO POR UNO:

### 4.1. Conectarse a PostgreSQL

```bash
psql -U postgres
```

**Si pide contraseña y no sabes cuál:**
- En macOS con Homebrew, normalmente NO hay contraseña (presiona Enter)
- Si da error, intenta: `psql -U $USER` o `psql postgres`

### 4.2. Crear el usuario (si no existe)

Dentro de psql, ejecuta:

```sql
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
```

**Si dice:** `CREATE ROLE`
- ✅ Usuario creado
- **CONTINÚA**

**Si dice:** `ERROR: role "fintech_user" already exists`
- ✅ Usuario ya existe (no es problema)
- **CONTINÚA**

### 4.3. Crear la base de datos

Dentro de psql, ejecuta:

```sql
CREATE DATABASE fintech_escrow OWNER fintech_user;
```

**Si dice:** `CREATE DATABASE`
- ✅ Base de datos creada
- **CONTINÚA**

**Si dice:** `ERROR: database "fintech_escrow" already exists`
- ✅ Base de datos ya existe (no es problema)
- **CONTINÚA**

### 4.4. Dar permisos al usuario

Dentro de psql, ejecuta:

```sql
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
```

**Si dice:** `GRANT`
- ✅ Permisos otorgados
- **CONTINÚA**

### 4.5. Salir de psql

```sql
\q
```

**Ahora PASA AL PASO 5**

---

## ✅ PASO 5: Verificar conexión

Ejecuta este comando:

```bash
psql -U fintech_user -d fintech_escrow -h localhost -c "SELECT version();"
```

**Si muestra información de PostgreSQL:**
- ✅ Conexión funciona correctamente
- **PASA AL PASO 6**

**Si da error:**
- ❌ Hay un problema de conexión
- **Dime qué error específico aparece**

---

## 🐍 PASO 6: Verificar que Python puede conectarse

Ejecuta estos comandos:

```bash
cd /Users/benjmincervantesvega/fintech/backend

# Verificar que tienes psycopg2 instalado
python3 -c "import psycopg2; print('psycopg2 instalado')" 2>&1
```

**Si dice:** `psycopg2 instalado`
- ✅ Librería instalada
- **PASA AL PASO 7**

**Si da error:**
- ❌ Necesitas instalar psycopg2
- **Ejecuta:** `pip3 install psycopg2-binary`

---

## 🔧 PASO 7: Configurar variables de entorno

Ejecuta estos comandos (copia y pega todo junto):

```bash
cd /Users/benjmincervantesvega/fintech/backend

export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

# Verificar que se configuraron
echo "DATABASE_URL: $DATABASE_URL"
echo "SECRET_KEY configurado: ✅"
echo "ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
```

**Deberías ver las variables impresas. Si ves las variables:**
- ✅ Variables configuradas
- **PASA AL PASO 8**

---

## 🚀 PASO 8: Iniciar el servicio de autenticación

Ejecuta estos comandos (en la MISMA terminal donde configuraste las variables):

```bash
cd /Users/benjmincervantesvega/fintech/backend/auth_service

# Asegúrate de tener las variables configuradas
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

# Iniciar el servicio
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Deberías ver algo como:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**Si ves esto:**
- ✅ Servicio iniciado correctamente
- **PASA AL PASO 9**

**Si ves errores de conexión a la base de datos:**
- ❌ Hay un problema de conexión
- **Dime qué error específico aparece**

---

## ✅ PASO 9: Probar el endpoint de login

Abre una NUEVA terminal (no cierres la del paso 8) y ejecuta:

```bash
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"vendedor@test.com","password":"Vendedor1$"}' \
  -v
```

**Si obtienes un JSON con `access_token`:**
- ✅ Login funciona correctamente
- **PASA AL PASO 10**

**Si da error 401 (Unauthorized):**
- El usuario puede no existir en la base de datos
- **PASA AL PASO 10** (crear usuario)

**Si da error 500 o de conexión:**
- ❌ Hay un problema con el backend
- **Dime qué error específico aparece**

---

## 👤 PASO 10: Crear el usuario de prueba en la base de datos

Ejecuta estos comandos:

```bash
cd /Users/benjmincervantesvega/fintech/backend

# Crear script Python para crear usuario
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/benjmincervantesvega/fintech/backend')

from shared.database import SessionLocal
from shared.models import User, UserRole, UserStatus
from shared.auth import get_password_hash
from datetime import datetime

db = SessionLocal()

try:
    # Verificar si el usuario ya existe
    existing_user = db.query(User).filter(User.email == "vendedor@test.com").first()
    
    if existing_user:
        print("✅ Usuario vendedor@test.com ya existe")
        print(f"   ID: {existing_user.id}")
        print(f"   Estado: {existing_user.status}")
    else:
        # Crear nuevo usuario
        new_user = User(
            email="vendedor@test.com",
            hashed_password=get_password_hash("Vendedor1$"),
            first_name="Usuario",
            last_name="Prueba",
            role=UserRole.USER,
            status=UserStatus.ACTIVE,
            is_email_verified=True,
            created_at=datetime.utcnow()
        )
        db.add(new_user)
        db.commit()
        print("✅ Usuario vendedor@test.com creado exitosamente")
        print(f"   ID: {new_user.id}")
    
    db.close()
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
    db.close()
EOF
```

**Si dice:** `✅ Usuario creado exitosamente` o `✅ Usuario ya existe`
- ✅ Usuario listo
- **PASA AL PASO 11**

**Si da error:**
- ❌ Hay un problema
- **Dime qué error específico aparece**

---

## 🧪 PASO 11: Probar login desde el frontend

1. **Asegúrate de que:**
   - ✅ Frontend esté corriendo en `http://localhost:4200`
   - ✅ Backend Auth Service esté corriendo en `http://localhost:8001` (Paso 8)

2. **Abre tu navegador en:** `http://localhost:4200/consufin/registro`

3. **Ingresa las credenciales:**
   - Email: `vendedor@test.com`
   - Password: `Vendedor1$`

4. **Haz click en "Iniciar Sesión"**

**Si te redirige a `/consufin/usuario` y ves el dashboard:**
- ✅ ¡TODO FUNCIONA CORRECTAMENTE!
- 🎉 **¡PROBLEMA RESUELTO!**

**Si sigue mostrando "Cargando..." o da error:**
- ❌ Hay un problema
- **Abre la consola del navegador (F12) y dime qué errores aparecen**

---

## 📝 NOTAS IMPORTANTES

1. **Mantén abierta la terminal del Paso 8** (donde está corriendo el backend)
2. **No cierres esa terminal** o el backend se detendrá
3. **Si cierras la terminal**, tendrás que volver al Paso 8

---

## 🆘 SI ALGO FALLA

Dime en QUÉ PASO te quedaste y qué ERROR específico aparece, y te ayudo a solucionarlo.

