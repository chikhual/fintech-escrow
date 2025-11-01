# Configuración de Base de Datos PostgreSQL

## Crear Usuario y Base de Datos

Si PostgreSQL está corriendo localmente, ejecuta estos comandos:

```bash
# Opción 1: Usando psql directamente
psql -U postgres
```

Luego dentro de psql:
```sql
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
CREATE DATABASE fintech_escrow OWNER fintech_user;
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
\q
```

## Opción 2: Usando Docker

Si PostgreSQL está en Docker:
```bash
docker exec -it <postgres_container> psql -U postgres
```

## Opción 3: Modificar la conexión

Si quieres usar el usuario `postgres` por defecto, modifica `DATABASE_URL` en:
- `backend/shared/database.py` 
- Variables de entorno

## Verificar conexión

```bash
psql -U fintech_user -d fintech_escrow -h localhost
```

Si la conexión funciona, puedes descomentar `init_db()` en `auth_service/main.py`.

