# Solución: Error "Failed to fetch" en Registro

## 🔴 Problema Identificado

El error **"Failed to fetch"** ocurre porque el **servicio de autenticación backend no está corriendo** en el puerto 8001.

## ✅ Soluciones

### Opción 1: Iniciar Servicio de Autenticación (Recomendado - Desarrollo)

#### Paso 1: Verificar PostgreSQL
El servicio de autenticación necesita PostgreSQL. Inícialo primero:

```bash
cd backend
docker-compose up -d postgres
```

O si tienes PostgreSQL local:
```bash
# Verificar que PostgreSQL esté corriendo
pg_isready -h localhost -p 5432
```

#### Paso 2: Iniciar Servicio de Autenticación

**Opción A: Script Automático (Más fácil)**
```bash
cd backend
./start_auth_service.sh
```

**Opción B: Manual con Python**
```bash
cd backend/auth_service

# Crear entorno virtual (solo primera vez)
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose[cryptography] passlib[bcrypt] python-multipart

# Configurar variables de entorno
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="your-super-secure-secret-key-here"
export ALLOWED_ORIGINS="http://localhost:4200"

# Iniciar servidor
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

#### Paso 3: Verificar que esté funcionando

Abre en tu navegador:
```
http://localhost:8001/docs
```

Deberías ver la documentación interactiva de la API (Swagger UI).

### Opción 2: Usar Docker Compose (Todo el stack)

```bash
cd backend

# Iniciar todos los servicios (PostgreSQL, Redis, Auth Service)
docker-compose up -d

# Ver logs del servicio de autenticación
docker-compose logs -f auth_service
```

### Opción 3: Verificar Variables de Entorno

Si el servicio está corriendo pero aún falla, verifica:

**Frontend (`frontend-angular/src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  authApiUrl: 'http://localhost:8001', // ← Debe ser 8001
  wsUrl: 'ws://localhost:8000/ws'
};
```

**Backend - Variables de entorno necesarias:**
```bash
DATABASE_URL=postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow
SECRET_KEY=your-super-secure-secret-key-here
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
```

## 🔍 Verificación Paso a Paso

### 1. Verificar que el puerto 8001 esté en uso:
```bash
lsof -ti:8001
# Debe mostrar un número de proceso si está corriendo
```

### 2. Probar el endpoint directamente:
```bash
curl http://localhost:8001/health
# Debe responder: {"status":"healthy","service":"auth-service"}
```

### 3. Probar registro desde terminal:
```bash
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "first_name": "Test",
    "last_name": "User",
    "phone": "5551234567"
  }'
```

### 4. Verificar CORS en el navegador:
- Abre DevTools (F12)
- Ve a la pestaña Network
- Intenta registrar
- Verifica que la petición vaya a `http://localhost:8001/register`
- Si hay error de CORS, verifica `ALLOWED_ORIGINS`

## 🐛 Troubleshooting

### Error: "Connection refused"
**Causa:** El servicio no está corriendo  
**Solución:** Inicia el servicio con una de las opciones arriba

### Error: "Database connection failed"
**Causa:** PostgreSQL no está corriendo o credenciales incorrectas  
**Solución:** 
```bash
# Iniciar PostgreSQL
docker-compose up -d postgres

# Verificar conexión
psql -U fintech_user -d fintech_escrow -h localhost
```

### Error: "CORS policy"
**Causa:** El origen del frontend no está permitido  
**Solución:** Verifica que `ALLOWED_ORIGINS` incluya `http://localhost:4200`

### Error: "Module not found"
**Causa:** Dependencias no instaladas  
**Solución:** 
```bash
pip install -r requirements.txt
```

## 📝 Checklist Rápido

- [ ] PostgreSQL corriendo en puerto 5432
- [ ] Servicio de autenticación corriendo en puerto 8001
- [ ] Variables de entorno configuradas correctamente
- [ ] Frontend apuntando a `http://localhost:8001`
- [ ] CORS configurado para permitir `http://localhost:4200`
- [ ] Base de datos `fintech_escrow` creada
- [ ] Tablas creadas (ejecutar `init.sql` o usar SQLAlchemy)

## 🚀 Inicio Rápido (Todo en uno)

```bash
# Terminal 1: PostgreSQL
cd backend
docker-compose up -d postgres

# Esperar 5 segundos para que PostgreSQL inicie...

# Terminal 2: Servicio de Autenticación
cd backend
./start_auth_service.sh

# Terminal 3: Frontend (si no está corriendo)
cd frontend-angular
ng serve
```

## 📊 URLs de Verificación

- **API Docs:** http://localhost:8001/docs
- **Health Check:** http://localhost:8001/health
- **Frontend:** http://localhost:4200/consufin/registro

---

**Una vez que el servicio esté corriendo, el registro debería funcionar correctamente.**

