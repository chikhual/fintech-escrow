# Listado Completo de Rutas del Proyecto FinTech ESCROW

Este documento contiene todas las direcciones (rutas) de páginas y endpoints API del proyecto.

## 📋 Índice

1. [Frontend Angular](#frontend-angular)
2. [Frontend React](#frontend-react)
3. [Backend Microservicios (Python/FastAPI)](#backend-microservicios-pythonfastapi)
4. [Backend Legacy (Node.js/Express)](#backend-legacy-nodejsexpress)

---

## 🅰️ Frontend Angular

**Base URL:** `http://localhost:4200` (desarrollo)

### Rutas Principales

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Redirección | Redirige a `/consufin` |
| `/broker` | BrokerDashboardComponent | Dashboard para brokers |
| `/tasks` | TaskManagerComponent | Gestor de tareas |

### Rutas CONSUFIN

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/consufin` | ConsufinHomeComponent | Página principal de CONSUFIN |
| `/consufin/registro` | ConsufinAuthComponent | Login y registro |
| `/consufin/registro/seleccion` | RegistrationSelectionComponent | Selección de tipo de registro |
| `/consufin/registro/wizard` | RegistrationWizardComponent | Wizard de registro |
| `/consufin/acceso-interno` | InternalAccessComponent | Acceso interno |
| `/consufin/verificacion` | VerificationDashboardComponent | Dashboard de verificación |
| `/consufin/transaccion/nueva` | ConsufinWizardComponent | Crear nueva transacción |
| `/consufin/transaccion/preview` | ConsufinTransactionDetailComponent | Vista previa de transacción |
| `/consufin/transaccion/acciones` | ConsufinTransactionActionsComponent | Acciones de transacción |
| `/consufin/transaccion/rechazo` | ConsufinRejectComponent | Rechazo de transacción |
| `/consufin/transaccion/disputa` | ConsufinDisputeComponent | Disputa de transacción |
| `/consufin/transacciones` | ConsufinListComponent | Lista de transacciones |
| `/consufin/calculadora` | ConsufinCalculatorComponent | Calculadora de costos |
| `/consufin/faq` | ConsufinFaqComponent | Preguntas frecuentes |
| `/consufin/ayuda` | ConsufinHelpComponent | Página de ayuda |
| `/consufin/contacto` | ConsufinContactComponent | Contacto |
| `/consufin/validacion` | ConsufinKycComponent | Validación KYC |
| `/consufin/integraciones` | ConsufinIntegrationsComponent | Integraciones |
| `/consufin/settings` | UserSettingsComponent | Configuración de usuario |
| `/consufin/roles` | RoleCenterComponent | Centro de roles |
| `/consufin/usuario` | UserPortalComponent | Portal de usuario |
| `/consufin/comprador` | Redirección | Redirige a `/consufin/usuario` |

---

## ⚛️ Frontend React

**Base URL:** `http://localhost:3000` (desarrollo)

### Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | Login | Página de inicio de sesión |
| `/register` | Register | Página de registro |

### Rutas Protegidas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Redirección | Redirige a `/escrow/dashboard` |
| `/escrow/dashboard` | EscrowDashboard | Dashboard principal ESCROW |
| `/escrow/new` | NewEscrowTransaction | Crear nueva transacción ESCROW |
| `/documents` | Documents | Gestión de documentos |
| `/notifications` | Notifications | Notificaciones |
| `/profile` | Profile | Perfil de usuario |
| `/admin` | AdminDashboard | Dashboard de administración (solo admin) |

---

## 🐍 Backend Microservicios (Python/FastAPI)

### 🔐 Auth Service (Puerto 8001)

**Base URL:** `http://localhost:8001`

#### Autenticación y Registro

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| POST | `/refresh` | Renovar token de acceso | No |
| GET | `/me` | Obtener perfil del usuario actual | Sí |
| PUT | `/me` | Actualizar perfil del usuario | Sí |
| POST | `/verify-email` | Verificar email con token | No |
| POST | `/resend-verification` | Reenviar email de verificación | No |
| POST | `/forgot-password` | Solicitar recuperación de contraseña | No |
| POST | `/reset-password` | Restablecer contraseña con token | No |
| POST | `/change-password` | Cambiar contraseña | Sí |

#### Verificación

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/verification/send-phone-code` | Enviar código de verificación por SMS | Sí |
| POST | `/verification/verify-phone` | Verificar teléfono con código | Sí |
| GET | `/verification/status` | Obtener estado de verificación | Sí |
| POST | `/verification/document/{document_id}/approve` | Aprobar documento (admin/advisor) | Sí |
| POST | `/verification/document/{document_id}/reject` | Rechazar documento (admin/advisor) | Sí |

#### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servicio |

---

### 💼 ESCROW Service (Puerto 8002)

**Base URL:** `http://localhost:8002`

#### Transacciones ESCROW

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/transactions` | Crear nueva transacción ESCROW | Sí (verificado) |
| GET | `/transactions` | Listar transacciones del usuario | Sí |
| GET | `/transactions/{transaction_id}` | Obtener transacción específica | Sí |
| PUT | `/transactions/{transaction_id}/accept` | Aceptar términos (vendedor) | Sí (verificado) |
| PUT | `/transactions/{transaction_id}/pay` | Procesar pago (comprador) | Sí (verificado) |
| PUT | `/transactions/{transaction_id}/ship` | Marcar como enviado (vendedor) | Sí (verificado) |
| PUT | `/transactions/{transaction_id}/deliver` | Marcar como entregado (comprador) | Sí (verificado) |
| PUT | `/transactions/{transaction_id}/approve` | Aprobar transacción (comprador) | Sí (verificado) |
| POST | `/transactions/{transaction_id}/messages` | Agregar mensaje a transacción | Sí |
| POST | `/transactions/{transaction_id}/dispute` | Crear disputa | Sí (verificado) |

#### Estadísticas

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/stats` | Estadísticas ESCROW | Sí (admin/advisor) |

#### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servicio |

---

### 💳 Payment Service (Puerto 8003)

**Base URL:** `http://localhost:8003`

#### Pagos

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/create-payment-intent` | Crear Payment Intent de Stripe | Sí (verificado) |
| POST | `/confirm-payment` | Confirmar pago | Sí (verificado) |
| POST | `/capture-payment` | Capturar fondos (liberar al vendedor) | Sí (admin/advisor) |
| POST | `/refund-payment` | Reembolsar pago | Sí (admin/advisor) |
| GET | `/payment-methods` | Obtener métodos de pago guardados | Sí |
| GET | `/transactions` | Historial de transacciones de pago | Sí |
| POST | `/webhook` | Webhook de Stripe | No |

#### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servicio |

---

### 🔔 Notification Service (Puerto 8004)

**Base URL:** `http://localhost:8004`

#### Notificaciones

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/notifications` | Crear notificación | Sí (admin/advisor) |
| GET | `/notifications` | Listar notificaciones del usuario | Sí |
| PUT | `/notifications/{notification_id}/read` | Marcar notificación como leída | Sí |
| POST | `/send-email` | Enviar email | Sí (admin/advisor) |
| POST | `/send-sms` | Enviar SMS | Sí (admin/advisor) |
| POST | `/send-push` | Enviar notificación push | Sí (admin/advisor) |

#### WebSocket

| Protocolo | Endpoint | Descripción | Autenticación |
|-----------|----------|-------------|---------------|
| WS | `/ws/{user_id}` | Conexión WebSocket para notificaciones en tiempo real | Sí |

#### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servicio |

---

## 🟢 Backend Legacy (Node.js/Express)

**Base URL:** `http://localhost:5000` (desarrollo)

### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/refresh` | Renovar token de acceso | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| PUT | `/api/auth/change-password` | Cambiar contraseña | Sí |
| POST | `/api/auth/forgot-password` | Solicitar recuperación de contraseña | No |
| POST | `/api/auth/reset-password` | Restablecer contraseña con token | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| POST | `/api/auth/verify-email` | Solicitar verificación de email | Sí |
| POST | `/api/auth/confirm-email` | Confirmar verificación de email | Sí |

---

### 👥 Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Obtener perfil del usuario | Sí |
| PUT | `/api/users/profile` | Actualizar perfil del usuario | Sí |
| GET | `/api/users/:id` | Obtener usuario por ID | Sí (admin) |
| GET | `/api/users` | Listar usuarios | Sí (admin) |
| PUT | `/api/users/:id/status` | Cambiar estado de usuario | Sí (admin) |
| PUT | `/api/users/:id/role` | Cambiar rol de usuario | Sí (admin) |
| GET | `/api/users/stats/overview` | Estadísticas de usuarios | Sí (admin) |

---

### 💼 ESCROW (`/api/escrow`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/escrow/transactions` | Crear nueva transacción ESCROW | Sí |
| GET | `/api/escrow/transactions` | Listar transacciones | Sí |
| GET | `/api/escrow/transactions/:id` | Obtener transacción por ID | Sí |
| PUT | `/api/escrow/transactions/:id/accept` | Aceptar términos (vendedor) | Sí (seller) |
| PUT | `/api/escrow/transactions/:id/pay` | Realizar pago (comprador) | Sí (buyer) |
| PUT | `/api/escrow/transactions/:id/ship` | Marcar como enviado (vendedor) | Sí (seller) |
| PUT | `/api/escrow/transactions/:id/deliver` | Marcar como entregado (comprador) | Sí (buyer) |
| PUT | `/api/escrow/transactions/:id/approve` | Aprobar transacción (comprador) | Sí (buyer) |
| POST | `/api/escrow/transactions/:id/messages` | Agregar mensaje | Sí |
| POST | `/api/escrow/transactions/:id/dispute` | Iniciar disputa | Sí |
| GET | `/api/escrow/stats/overview` | Estadísticas generales | Sí (admin/supervisor) |

---

### 💳 Pagos (`/api/payments`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Crear nuevo pago | Sí (borrower) |
| GET | `/api/payments` | Listar pagos del usuario | Sí |
| GET | `/api/payments/:id` | Obtener pago por ID | Sí |
| PUT | `/api/payments/:id/retry` | Reintentar pago fallido | Sí (borrower) |
| POST | `/api/payments/:id/refund` | Procesar reembolso | Sí (lender/admin) |
| GET | `/api/payments/overdue` | Obtener pagos vencidos | Sí (lender/admin) |
| GET | `/api/payments/stats/overview` | Estadísticas de pagos | Sí (admin/lender) |
| POST | `/api/payments/:id/notes` | Agregar nota a un pago | Sí |
| GET | `/api/payments/upcoming` | Obtener próximos pagos | Sí (borrower) |

---

### 📄 Documentos (`/api/documents`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/api/documents/upload` | Subir documento de usuario | Sí (verificado) |
| GET | `/api/documents` | Obtener documentos del usuario | Sí |
| GET | `/api/documents/:id/download` | Descargar documento | Sí |
| DELETE | `/api/documents/:id` | Eliminar documento | Sí |
| PUT | `/api/documents/:id/status` | Cambiar estado de documento | Sí (admin) |
| POST | `/api/documents/loan/:loanId` | Subir documento de préstamo | Sí |
| GET | `/api/documents/loan/:loanId` | Obtener documentos de un préstamo | Sí |
| GET | `/api/documents/pending` | Obtener documentos pendientes | Sí (admin) |

---

### 🔔 Notificaciones (`/api/notifications`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Obtener notificaciones del usuario | Sí |
| PUT | `/api/notifications/:id/read` | Marcar notificación como leída | Sí |
| PUT | `/api/notifications/read-all` | Marcar todas como leídas | Sí |
| DELETE | `/api/notifications/:id` | Eliminar notificación | Sí |
| PUT | `/api/notifications/preferences` | Actualizar preferencias | Sí |
| GET | `/api/notifications/preferences` | Obtener preferencias | Sí |

---

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check del servidor |

---

## 📝 Notas Importantes

### Autenticación

- **Backend Microservicios (FastAPI):** Utilizan JWT Bearer tokens
  ```
  Authorization: Bearer <token>
  ```

- **Backend Legacy (Express):** Utiliza JWT tokens en cookies o headers
  ```
  Authorization: Bearer <token>
  ```

### Roles y Permisos

- **Roles disponibles:**
  - `CLIENT` / `buyer` / `borrower`: Cliente/Comprador/Prestatario
  - `seller` / `lender`: Vendedor/Prestamista
  - `BROKER`: Broker
  - `ADMIN` / `admin`: Administrador
  - `ADVISOR` / `supervisor`: Asesor/Supervisor

### Estados de Verificación

- `PENDING_EMAIL`: Pendiente verificación de email
- `EMAIL_VERIFIED`: Email verificado
- `PENDING_PHONE`: Pendiente verificación de teléfono
- `PHONE_VERIFIED`: Teléfono verificado
- `DOCUMENTS_SUBMITTED`: Documentos enviados
- `FULLY_VERIFIED`: Completamente verificado
- `VERIFICATION_FAILED`: Verificación fallida

---

## 🔗 Enlaces Útiles

- **Documentación API:** Ver `API_DOCUMENTATION.md`
- **Arquitectura:** Ver `ARCHITECTURE.md`
- **Setup Base de Datos:** Ver `SETUP_DB.md`

---

**Última actualización:** 2025-01-30
**Total de rutas documentadas:** 100+

---

## 🌐 URLs de Vercel - Páginas Desplegadas

### Base URL de Producción

**URL Base:** `https://fintech-escrow.vercel.app`  
*(Nota: Verifica la URL exacta en tu dashboard de Vercel: https://vercel.com/dashboard)*

### Tabla de URLs Completas

| Página | Ruta | URL Completa Vercel |
|--------|------|---------------------|
| **Página Principal** | `/consufin` | `https://fintech-escrow.vercel.app/consufin` |
| **Login/Registro** | `/consufin/registro` | `https://fintech-escrow.vercel.app/consufin/registro` |
| **Selección de Registro** | `/consufin/registro/seleccion` | `https://fintech-escrow.vercel.app/consufin/registro/seleccion` |
| **Wizard de Registro** | `/consufin/registro/wizard` | `https://fintech-escrow.vercel.app/consufin/registro/wizard` |
| **Acceso Interno** | `/consufin/acceso-interno` | `https://fintech-escrow.vercel.app/consufin/acceso-interno` |
| **Verificación** | `/consufin/verificacion` | `https://fintech-escrow.vercel.app/consufin/verificacion` |
| **Nueva Transacción** | `/consufin/transaccion/nueva` | `https://fintech-escrow.vercel.app/consufin/transaccion/nueva` |
| **Vista Previa Transacción** | `/consufin/transaccion/preview` | `https://fintech-escrow.vercel.app/consufin/transaccion/preview` |
| **Acciones de Transacción** | `/consufin/transaccion/acciones` | `https://fintech-escrow.vercel.app/consufin/transaccion/acciones` |
| **Rechazo de Transacción** | `/consufin/transaccion/rechazo` | `https://fintech-escrow.vercel.app/consufin/transaccion/rechazo` |
| **Disputa de Transacción** | `/consufin/transaccion/disputa` | `https://fintech-escrow.vercel.app/consufin/transaccion/disputa` |
| **Lista de Transacciones** | `/consufin/transacciones` | `https://fintech-escrow.vercel.app/consufin/transacciones` |
| **Calculadora** | `/consufin/calculadora` | `https://fintech-escrow.vercel.app/consufin/calculadora` |
| **FAQ** | `/consufin/faq` | `https://fintech-escrow.vercel.app/consufin/faq` |
| **Ayuda** | `/consufin/ayuda` | `https://fintech-escrow.vercel.app/consufin/ayuda` |
| **Contacto** | `/consufin/contacto` | `https://fintech-escrow.vercel.app/consufin/contacto` |
| **Validación KYC** | `/consufin/validacion` | `https://fintech-escrow.vercel.app/consufin/validacion` |
| **Integraciones** | `/consufin/integraciones` | `https://fintech-escrow.vercel.app/consufin/integraciones` |
| **Configuración** | `/consufin/settings` | `https://fintech-escrow.vercel.app/consufin/settings` |
| **Centro de Roles** | `/consufin/roles` | `https://fintech-escrow.vercel.app/consufin/roles` |
| **Portal de Usuario** | `/consufin/usuario` | `https://fintech-escrow.vercel.app/consufin/usuario` |
| **Dashboard Broker** | `/broker` | `https://fintech-escrow.vercel.app/broker` |
| **Gestor de Tareas** | `/tasks` | `https://fintech-escrow.vercel.app/tasks` |

### Notas Importantes

1. **URL Base:** La URL base puede variar según tu configuración de Vercel. Verifica la URL exacta en:
   - Dashboard de Vercel: https://vercel.com/dashboard
   - Busca tu proyecto `fintech-escrow` o el nombre que hayas configurado

2. **Dominio Personalizado:** Si has configurado un dominio personalizado, reemplaza `fintech-escrow.vercel.app` con tu dominio.

3. **Preview Deployments:** Vercel crea URLs de preview para cada PR/commit. Estas siguen el formato:
   - `https://fintech-escrow-[hash].vercel.app/[ruta]`

4. **Verificación de URLs:**
   - Accede a tu proyecto en Vercel Dashboard
   - Ve a la pestaña "Deployments"
   - Cada deployment tiene su propia URL que puedes copiar

### Ejemplo de Uso

Para acceder a la calculadora desde Vercel:
```
https://fintech-escrow.vercel.app/consufin/calculadora
```

Para acceder al portal de usuario:
```
https://fintech-escrow.vercel.app/consufin/usuario
```

---

**⚠️ IMPORTANTE:** Reemplaza `fintech-escrow.vercel.app` con la URL real de tu proyecto en Vercel si es diferente.

