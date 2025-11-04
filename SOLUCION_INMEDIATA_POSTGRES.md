# ⚡ SOLUCIÓN INMEDIATA - CONECTAR POSTGRESQL

## 🔍 SITUACIÓN ACTUAL

- ❌ PostgreSQL NO está instalado localmente (`psql` no encontrado)
- ✅ Puerto 5432 está en uso (probablemente Docker)
- ❌ No se puede hacer login (página se queda en "Cargando...")

---

## 🎯 SOLUCIÓN RÁPIDA (Opción 1: Docker - Recomendado)

### PASO 1: Verificar Docker

Ejecuta este comando y dime el resultado:

```bash
docker --version
```

**Si muestra una versión:**
- ✅ Docker está instalado
- **PASA AL PASO 2**

**Si dice "command not found":**
- ❌ Docker no está instalado
- **Necesitas instalar Docker Desktop para macOS**

---

### PASO 2: Iniciar PostgreSQL con Docker

Ejecuta estos comandos (copia y pega todo):

```bash
cd /Users/benjmincervantesvega/fintech/backend
docker-compose up -d postgres
```

**Espera 10 segundos y luego ejecuta:**

```bash
docker ps | grep postgres
```

**Si ves un contenedor con nombre que contiene "postgres":**
- ✅ PostgreSQL está corriendo en Docker
- **PASA AL PASO 3**

**Si no ves nada:**
- ❌ Hay un problema con Docker
- **Dime qué error aparece cuando ejecutas `docker-compose up -d postgres`**

---

### PASO 3: Verificar que PostgreSQL funciona

Ejecuta este comando:

```bash
docker exec -it fintech_postgres psql -U fintech_user -d fintech_escrow -c "SELECT version();"
```

**Si muestra información de PostgreSQL:**
- ✅ PostgreSQL funciona correctamente
- **PASA AL PASO 4**

**Si dice "database does not exist" o error similar:**
- Necesitas crear la base de datos
- **PASA AL PASO 3.1**

#### PASO 3.1: Crear base de datos (si no existe)

```bash
# Crear base de datos
docker exec -it fintech_postgres psql -U postgres -c "CREATE DATABASE fintech_escrow;"

# Crear usuario (si no existe)
docker exec -it fintech_postgres psql -U postgres -c "CREATE USER fintech_user WITH PASSWORD 'fintech_pass';"

# Dar permisos
docker exec -it fintech_postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;"

# Verificar
docker exec -it fintech_postgres psql -U fintech_user -d fintech_escrow -c "SELECT 1;"
```

**Si el último comando muestra "1":**
- ✅ Base de datos creada correctamente
- **PASA AL PASO 4**

---

### PASO 4: Verificar que el backend puede conectarse

Ejecuta este comando:

```bash
cd /Users/benjmincervantesvega/fintech/backend

# Configurar variables de entorno
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

# Probar conexión con Python
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/benjmincervantesvega/fintech/backend')
from shared.database import engine
try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1")
        print("✅ Conexión a PostgreSQL funciona correctamente")
except Exception as e:
    print(f"❌ Error de conexión: {e}")
EOF
```

**Si dice "✅ Conexión funciona correctamente":**
- ✅ Todo está bien configurado
- **PASA AL PASO 5**

**Si da error:**
- ❌ Hay un problema de conexión
- **Dime qué error específico aparece**

---

### PASO 5: Iniciar el servicio de autenticación

Ejecuta estos comandos (en una NUEVA terminal):

```bash
cd /Users/benjmincervantesvega/fintech/backend/auth_service

# Configurar variables
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

# Iniciar servicio
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Deberías ver:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**Si ves esto:**
- ✅ Servicio iniciado
- **NO CIERRES ESTA TERMINAL**
- **PASA AL PASO 6**

**Si ves errores de conexión a la base de datos:**
- ❌ Hay un problema
- **Dime qué error específico aparece**

---

### PASO 6: Crear el usuario de prueba

Ejecuta estos comandos (en una NUEVA terminal, sin cerrar la del Paso 5):

```bash
cd /Users/benjmincervantesvega/fintech/backend

export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

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
        # Actualizar contraseña por si acaso
        existing_user.hashed_password = get_password_hash("Vendedor1$")
        existing_user.status = UserStatus.ACTIVE
        existing_user.is_email_verified = True
        db.commit()
        print("✅ Contraseña actualizada")
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
    print("\n✅ Usuario listo para login")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    db.close()
EOF
```

**Si dice "✅ Usuario listo para login":**
- ✅ Usuario creado/actualizado
- **PASA AL PASO 7**

**Si da error:**
- ❌ Hay un problema
- **Dime qué error específico aparece**

---

### PASO 7: Probar login desde el frontend

1. **Asegúrate de que:**
   - ✅ Frontend esté corriendo en `http://localhost:4200`
   - ✅ Backend Auth Service esté corriendo (Paso 5 - terminal abierta)
   - ✅ PostgreSQL esté corriendo en Docker (Paso 2)

2. **Abre tu navegador en:** `http://localhost:4200/consufin/registro`

3. **Ingresa:**
   - Email: `vendedor@test.com`
   - Password: `Vendedor1$`

4. **Haz click en "Iniciar Sesión"**

**Si te redirige a `/consufin/usuario` y ves el dashboard:**
- 🎉 **¡PROBLEMA RESUELTO!**
- ✅ Todo funciona correctamente

**Si sigue en "Cargando...":**
- Abre la consola del navegador (F12 → Console)
- **Dime qué errores aparecen en rojo**

---

## 🔄 ALTERNATIVA: Si Docker no funciona

Si Docker no funciona, puedes instalar PostgreSQL localmente:

### Opción A: Con Homebrew

```bash
# Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar PostgreSQL
brew install postgresql@15

# Iniciar PostgreSQL
brew services start postgresql@15

# Crear usuario y base de datos
psql postgres
```

Luego dentro de psql:
```sql
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
CREATE DATABASE fintech_escrow OWNER fintech_user;
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
\q
```

---

## 📝 RESUMEN DE COMANDOS IMPORTANTES

```bash
# Verificar Docker
docker ps

# Iniciar PostgreSQL
cd /Users/benjmincervantesvega/fintech/backend
docker-compose up -d postgres

# Ver logs de PostgreSQL
docker logs fintech_postgres

# Conectarse a PostgreSQL
docker exec -it fintech_postgres psql -U fintech_user -d fintech_escrow

# Iniciar backend
cd /Users/benjmincervantesvega/fintech/backend/auth_service
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

---

## 🆘 SI ALGO FALLA

Dime:
1. **En qué PASO te quedaste**
2. **Qué comando ejecutaste**
3. **Qué error específico aparece**

Y te ayudo a solucionarlo paso a paso.

