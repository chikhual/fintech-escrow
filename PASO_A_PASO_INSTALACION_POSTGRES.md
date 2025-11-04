# 📋 INSTALACIÓN PASO A PASO - POSTGRESQL

## 🎯 OBJETIVO
Instalar PostgreSQL y configurarlo para que funcione con el backend.

---

## ✅ PASO 1: Verificar Homebrew

**Ejecuta este comando:**

```bash
brew --version
```

**Si muestra una versión (ej: "Homebrew 4.x.x"):**
- ✅ Homebrew está instalado
- **PASA AL PASO 2**

**Si dice "command not found":**
- ❌ Homebrew NO está instalado
- **Instálalo ejecutando esto:**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Espera a que termine (puede tomar 5-10 minutos)**
**Luego vuelve a ejecutar `brew --version` para confirmar**

---

## ✅ PASO 2: Instalar PostgreSQL

**Ejecuta este comando:**

```bash
brew install postgresql@15
```

**ESPERA A QUE TERMINE** (puede tomar varios minutos)

**Al final deberías ver algo como:**
```
🍺  postgresql@15 was successfully installed!
```

**Si ves ese mensaje:**
- ✅ PostgreSQL instalado
- **PASA AL PASO 3**

**Si da error:**
- **Dime qué error específico aparece**

---

## ✅ PASO 3: Iniciar PostgreSQL

**Ejecuta este comando:**

```bash
brew services start postgresql@15
```

**Deberías ver:**
```
==> Successfully started `postgresql@15` (label: homebrew.mxcl.postgresql@15)
```

**Si ves ese mensaje:**
- ✅ PostgreSQL iniciado
- **PASA AL PASO 4**

**Si dice "already started":**
- ✅ PostgreSQL ya estaba corriendo
- **PASA AL PASO 4**

---

## ✅ PASO 4: Verificar que PostgreSQL está corriendo

**Ejecuta este comando:**

```bash
pg_isready
```

**Si dice:** `localhost:5432 - accepting connections`
- ✅ PostgreSQL funciona correctamente
- **PASA AL PASO 5**

**Si dice:** `no response`
- ❌ PostgreSQL no está corriendo
- **Ejecuta de nuevo:** `brew services restart postgresql@15`
- **Espera 5 segundos y vuelve a ejecutar `pg_isready`**

---

## ✅ PASO 5: Conectarse a PostgreSQL

**Ejecuta este comando:**

```bash
psql postgres
```

**Si te muestra un prompt como:** `postgres=#`
- ✅ Conectado correctamente
- **PASA AL PASO 6**

**Si pide contraseña:**
- En macOS con Homebrew normalmente NO hay contraseña
- **Presiona Enter** (sin escribir nada)
- Si sigue pidiendo contraseña, intenta: `psql -U $USER postgres`

**Si da error de conexión:**
- **Dime qué error específico aparece**

---

## ✅ PASO 6: Crear el usuario

**Estás dentro de psql (deberías ver `postgres=#`)**

**Ejecuta este comando (copia y pega):**

```sql
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
```

**Si dice:** `CREATE ROLE`
- ✅ Usuario creado
- **PASA AL PASO 7**

**Si dice:** `ERROR: role "fintech_user" already exists`
- ✅ Usuario ya existe (no es problema)
- **PASA AL PASO 7**

---

## ✅ PASO 7: Crear la base de datos

**Sigue dentro de psql (`postgres=#`)**

**Ejecuta este comando:**

```sql
CREATE DATABASE fintech_escrow OWNER fintech_user;
```

**Si dice:** `CREATE DATABASE`
- ✅ Base de datos creada
- **PASA AL PASO 8**

**Si dice:** `ERROR: database "fintech_escrow" already exists`
- ✅ Base de datos ya existe (no es problema)
- **PASA AL PASO 8**

---

## ✅ PASO 8: Dar permisos al usuario

**Sigue dentro de psql (`postgres=#`)**

**Ejecuta este comando:**

```sql
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
```

**Si dice:** `GRANT`
- ✅ Permisos otorgados
- **PASA AL PASO 9**

---

## ✅ PASO 9: Salir de psql

**Ejecuta este comando:**

```sql
\q
```

**Deberías volver a la terminal normal.**

---

## ✅ PASO 10: Verificar conexión

**Ejecuta este comando:**

```bash
psql -U fintech_user -d fintech_escrow -h localhost -c "SELECT version();"
```

**Si muestra información de PostgreSQL:**
- ✅ Conexión funciona perfectamente
- **PASA AL PASO 11**

**Si dice "password:"**
- Escribe: `fintech_pass`
- Presiona Enter

**Si da error:**
- **Dime qué error específico aparece**

---

## ✅ PASO 11: Configurar variables de entorno

**Ejecuta estos comandos (copia y pega todo junto):**

```bash
cd /Users/benjmincervantesvega/fintech/backend

export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

# Verificar
echo "✅ Variables configuradas:"
echo "DATABASE_URL: $DATABASE_URL"
echo "SECRET_KEY: configurado"
echo "ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
```

**Si ves las variables impresas:**
- ✅ Variables configuradas
- **PASA AL PASO 12**

---

## ✅ PASO 12: Probar conexión desde Python

**Ejecuta este comando (en la MISMA terminal donde configuraste las variables):**

```bash
python3 << 'EOF'
import sys
sys.path.insert(0, '/Users/benjmincervantesvega/fintech/backend')
from shared.database import engine
try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1")
        print("✅ Conexión a PostgreSQL funciona correctamente")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
EOF
```

**Si dice:** `✅ Conexión a PostgreSQL funciona correctamente`
- ✅ Todo está bien configurado
- **PASA AL PASO 13**

**Si da error:**
- ❌ Hay un problema
- **Dime qué error específico aparece**

---

## ✅ PASO 13: Iniciar el servicio de autenticación

**IMPORTANTE: Abre una NUEVA terminal** (no cierres esta)

**En la NUEVA terminal, ejecuta:**

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
- **PASA AL PASO 14**

**Si ves errores:**
- **Dime qué error específico aparece**

---

## ✅ PASO 14: Crear usuario de prueba

**Abre OTRA NUEVA terminal** (mantén abierta la del Paso 13)

**Ejecuta este comando:**

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
        # Actualizar contraseña y estado
        existing_user.hashed_password = get_password_hash("Vendedor1$")
        existing_user.status = UserStatus.ACTIVE
        existing_user.is_email_verified = True
        db.commit()
        print("✅ Contraseña y estado actualizados")
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
    print("\n🎉 Usuario listo para login!")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
    db.close()
EOF
```

**Si dice:** `🎉 Usuario listo para login!`
- ✅ Usuario creado/actualizado
- **PASA AL PASO 15**

**Si da error:**
- **Dime qué error específico aparece**

---

## ✅ PASO 15: Probar login

1. **Asegúrate de que:**
   - ✅ Frontend esté corriendo en `http://localhost:4200`
   - ✅ Backend Auth Service esté corriendo (Paso 13 - terminal abierta)
   - ✅ PostgreSQL esté corriendo

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

## 📝 NOTAS IMPORTANTES

1. **Mantén abierta la terminal del Paso 13** (donde está corriendo el backend)
2. **Si cierras esa terminal, el backend se detendrá**
3. **Para detener PostgreSQL:** `brew services stop postgresql@15`
4. **Para iniciar PostgreSQL:** `brew services start postgresql@15`

---

## 🆘 SI ALGO FALLA

**Dime:**
1. En qué PASO te quedaste
2. Qué comando ejecutaste
3. Qué error específico aparece

Y te ayudo a solucionarlo.

