# 📋 Guía para Crear la Base de Datos FINTECH ESCROW

## 🎯 Opción 1: Desde la Interfaz Gráfica de PostgreSQL (MÁS FÁCIL)

Si tienes PostgreSQL 17 corriendo (como se ve en tu imagen):

### Paso 1: Crear el Usuario
1. Haz clic en el botón **"Connect..."** o conecta a la base de datos `postgres`
2. Una vez conectado, ejecuta estos comandos SQL en la consola:

```sql
-- Crear usuario
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';

-- Otorgar privilegios
ALTER USER fintech_user CREATEDB;
```

### Paso 2: Crear la Base de Datos
1. Haz clic en el botón **"+"** (el botón de agregar en la parte inferior izquierda)
2. O haz clic derecho en cualquier base de datos → **"Create Database..."**
3. Completa el formulario:
   - **Database Name**: `fintech_escrow`
   - **Owner**: Selecciona `fintech_user` del dropdown
   - **Encoding**: UTF8 (por defecto)
   - Haz clic en **"Save"** o **"Create"**

### Paso 3: Verificar Conexión
En la interfaz gráfica, deberías ver la nueva base de datos `fintech_escrow` en la lista.

---

## 🖥️ Opción 2: Desde Terminal (SQL)

Si prefieres usar la terminal:

```bash
# Conectar a PostgreSQL (usa tu usuario de PostgreSQL)
psql -U postgres

# O si tienes otro usuario:
psql -U tu_usuario_postgres
```

Luego ejecuta estos comandos SQL:

```sql
-- 1. Crear usuario
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';

-- 2. Otorgar privilegios para crear bases de datos
ALTER USER fintech_user CREATEDB;

-- 3. Crear la base de datos
CREATE DATABASE fintech_escrow OWNER fintech_user;

-- 4. Conectar a la nueva base de datos
\c fintech_escrow

-- 5. Otorgar todos los privilegios
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;

-- 6. Verificar que todo está bien
\du  -- Ver usuarios
\l   -- Ver bases de datos

-- 7. Salir
\q
```

---

## ✅ Paso Final: Habilitar la Inicialización

Una vez que la base de datos esté creada, descomenta la línea en el archivo:

`backend/auth_service/main.py`

Cambia esto:
```python
# init_db()  # Comentado temporalmente
```

Por esto:
```python
init_db()  # Ya descomentado - inicializar tablas
```

---

## 🧪 Probar la Conexión

Puedes probar la conexión desde Python:

```python
# Desde el directorio backend
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
python3 -c "from shared.database import engine; print('✅ Conexión exitosa!' if engine.connect() else '❌ Error')"
```

---

## 📝 Notas Importantes

- **Usuario**: `fintech_user`
- **Contraseña**: `fintech_pass`
- **Base de Datos**: `fintech_escrow`
- **Host**: `localhost`
- **Puerto**: `5432`

Si cambias alguno de estos valores, actualiza la variable `DATABASE_URL` en:
- `backend/shared/database.py` (línea 14)
- O usa variables de entorno antes de iniciar el servicio

