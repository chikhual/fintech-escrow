# Proceso de Registro de Usuarios - CONSUFIN

## 📋 Resumen del Sistema Actual

### Estado Actual
✅ **Base de datos configurada** - PostgreSQL con SQLAlchemy  
✅ **Modelo de Usuario definido** - Tabla `users` con todos los campos necesarios  
✅ **API de registro funcional** - Endpoint `/register` en auth_service  
✅ **Frontend completo** - Formulario de registro con validaciones  
✅ **Docker Compose** - Configuración para desarrollo local

---

## 🗄️ Estructura de la Base de Datos

### Tabla: `users`

#### Campos Obligatorios (Registro Inicial)
- `email` (VARCHAR(255), UNIQUE, NOT NULL) - Correo electrónico
- `first_name` (VARCHAR(100), NOT NULL) - Nombre
- `last_name` (VARCHAR(100), NOT NULL) - Apellido
- `hashed_password` (VARCHAR(255), NOT NULL) - Contraseña encriptada
- `role` (ENUM, DEFAULT 'buyer') - Rol: buyer, seller, broker, advisor, admin
- `status` (ENUM, DEFAULT 'pending_verification') - Estado: active, inactive, pending_verification, suspended

#### Campos Opcionales (Pueden llenarse después)
- `phone` (VARCHAR(20), UNIQUE) - Teléfono (10 dígitos para MX)
- `curp` (VARCHAR(18), UNIQUE) - CURP (opcional en registro)
- `rfc` (VARCHAR(13), UNIQUE) - RFC (opcional en registro)
- `ine_number` (VARCHAR(20), UNIQUE) - Número de INE (opcional en registro)

#### Campos de Dirección
- `address_street` - Calle y número
- `address_city` - Ciudad
- `address_state` - Estado
- `address_zip_code` - Código postal
- `address_country` (DEFAULT 'México')

#### Campos de Verificación
- `is_email_verified` (BOOLEAN, DEFAULT FALSE)
- `is_phone_verified` (BOOLEAN, DEFAULT FALSE)
- `is_identity_verified` (BOOLEAN, DEFAULT FALSE)
- `is_kyc_verified` (BOOLEAN, DEFAULT FALSE)

#### Campos Financieros
- `monthly_income` (INTEGER)
- `credit_score` (INTEGER)
- `employment_status` (VARCHAR(50))

#### Configuración
- `notification_preferences` (JSONB) - Preferencias de notificaciones
- `biometric_data` (JSONB) - Para implementación futura

#### Timestamps
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)
- `last_login` (TIMESTAMP WITH TIME ZONE)

---

## 🔄 Flujo de Registro Actual

### 1. Frontend (`auth.component.ts`)

**Campos del formulario:**
- Tipo de persona: Persona Física / Persona Moral
- Nombre
- Apellido
- Correo electrónico (validado)
- Teléfono (10 dígitos, validado)
- Contraseña (validaciones: min 8 caracteres, mayúscula, minúscula, número)

**Validaciones en frontend:**
```typescript
- Email válido (regex)
- Contraseña: min 8 caracteres, mayúscula, minúscula, número
- Teléfono: exactamente 10 dígitos
- Nombre y apellido: requeridos
```

### 2. Servicio de Autenticación (`auth.service.ts`)

**Request al backend:**
```typescript
POST http://localhost:8001/register
{
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  phone?: string,
  role?: string (default: 'buyer')
}
```

### 3. Backend (`auth_service/main.py`)

**Endpoint:** `POST /register`

**Validaciones:**
- Email único (error si ya existe)
- CURP único (si se proporciona)
- Contraseña validada según esquema Pydantic

**Proceso:**
1. Verificar que el email no exista
2. Hash de la contraseña con bcrypt
3. Crear usuario con status `PENDING_VERIFICATION`
4. Guardar en base de datos
5. Retornar objeto User

**TODO:**
- Envío de email de verificación
- Notificación de bienvenida

---

## 🚀 Cómo Iniciar la Base de Datos

### Opción 1: Docker Compose (Recomendado)

```bash
cd backend
docker-compose up -d postgres
```

Esto iniciará:
- PostgreSQL en puerto 5432
- Base de datos: `fintech_escrow`
- Usuario: `fintech_user`
- Password: `fintech_pass`

### Opción 2: PostgreSQL Local

1. Instalar PostgreSQL
2. Crear base de datos:
```sql
CREATE DATABASE fintech_escrow;
CREATE USER fintech_user WITH PASSWORD 'fintech_pass';
GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;
```

3. Ejecutar script de inicialización:
```bash
psql -U fintech_user -d fintech_escrow -f init.sql
```

### Variables de Entorno

**Backend (.env o environment):**
```env
DATABASE_URL=postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow
SECRET_KEY=your-super-secure-secret-key-here
ALLOWED_ORIGINS=http://localhost:4200
```

**Frontend (environment.ts):**
```typescript
authApiUrl: 'http://localhost:8001'
```

---

## ✅ Checklist de Verificación

### Base de Datos
- [ ] PostgreSQL corriendo
- [ ] Tabla `users` creada
- [ ] Enums `user_role` y `user_status` creados
- [ ] Índices en campos únicos (email, phone, curp, rfc, ine_number)

### Backend
- [ ] Auth service corriendo en puerto 8001
- [ ] Conexión a base de datos exitosa
- [ ] Endpoint `/register` funcionando
- [ ] Validaciones de contraseña activas
- [ ] Hash de contraseñas funcionando

### Frontend
- [ ] Formulario de registro completo
- [ ] Validaciones del lado del cliente
- [ ] Conexión al backend (authApiUrl configurado)
- [ ] Manejo de errores
- [ ] Redirección después del registro

---

## 🔍 Testing del Registro

### 1. Verificar Conexión a Base de Datos

```bash
# Conectar a PostgreSQL
psql -U fintech_user -d fintech_escrow

# Verificar tablas
\dt

# Ver estructura de tabla users
\d users

# Ver usuarios registrados
SELECT id, email, first_name, last_name, role, status, created_at FROM users;
```

### 2. Probar Registro via API

```bash
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "first_name": "Juan",
    "last_name": "Pérez",
    "phone": "5551234567",
    "role": "buyer"
  }'
```

### 3. Probar desde Frontend

1. Navegar a `http://localhost:4200/consufin/registro`
2. Llenar formulario de registro
3. Verificar que se guarde en base de datos
4. Verificar redirección a `/consufin/validacion`

---

## 📊 Modelo de Datos - Relaciones

```
User (users)
├── Documents (documents) - Documentos KYC/AML
├── Notifications (notifications) - Notificaciones del usuario
├── EscrowTransactions (buyer) - Transacciones como comprador
└── EscrowTransactions (seller) - Transacciones como vendedor
```

---

## 🔐 Seguridad

### Contraseñas
- ✅ Hash con bcrypt (ver `backend/shared/auth.py`)
- ✅ Validación: min 8 caracteres, mayúscula, minúscula, número
- ✅ No se almacena contraseña en texto plano

### Tokens
- ✅ JWT access tokens (30 minutos)
- ✅ Refresh tokens para renovación
- ✅ Tokens almacenados en localStorage (frontend)

### Validaciones
- ✅ Email único en base de datos
- ✅ CURP, RFC, INE únicos (si se proporcionan)
- ✅ Validación de formato en frontend y backend

---

## 🐛 Troubleshooting

### Error: "Failed to fetch"
- Verificar que el backend esté corriendo en puerto 8001
- Verificar CORS en `ALLOWED_ORIGINS`
- Verificar URL en `authApiUrl` del frontend

### Error: "Email already registered"
- El email ya existe en la base de datos
- Usar otro email o eliminar usuario existente

### Error: "Connection refused" (base de datos)
- Verificar que PostgreSQL esté corriendo
- Verificar `DATABASE_URL` en variables de entorno
- Verificar credenciales de conexión

### Tablas no se crean automáticamente
- Ejecutar `init_db()` manualmente o verificar que se ejecute al iniciar el servicio
- Verificar permisos del usuario de base de datos

---

## 📝 Próximos Pasos

1. **Implementar verificación de email**
   - Generar token de verificación
   - Enviar email con link de verificación
   - Endpoint para verificar email

2. **Mejorar validaciones KYC**
   - Validación de CURP
   - Validación de RFC
   - Validación de INE

3. **Agregar campo "Persona Type"**
   - Persona Física vs Persona Moral
   - Campos adicionales según tipo

4. **Implementar 2FA**
   - Código SMS o email
   - Verificación en login

5. **Dashboard de administración**
   - Ver usuarios registrados
   - Cambiar estados
   - Verificar documentos KYC

---

**Última actualización:** 2025-01-XX  
**Versión:** 1.0.0

