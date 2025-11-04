# Integración del Portal de Usuario con Backend

## ✅ Servicios Creados

### 1. UserService (`user.service.ts`)
**Base URL:** `http://localhost:8001` (Auth Service)

**Métodos:**
- `getProfile()` - Obtener perfil del usuario actual
- `updateProfile(profileData)` - Actualizar datos personales
- `updateCompanyData(companyData)` - Actualizar datos empresariales
- `updateBankData(bankData)` - Actualizar datos bancarios

**Endpoints utilizados:**
- `GET /me` - Obtener perfil
- `PUT /me` - Actualizar perfil

---

### 2. TransactionService (`transaction.service.ts`)
**Base URL:** `http://localhost:8002` (ESCROW Service)

**Métodos:**
- `getTransactions(params?)` - Obtener transacciones del usuario
- `getTransaction(transactionId)` - Obtener transacción específica
- `createTransaction(transactionData)` - Crear nueva transacción ESCROW
- `acceptTransaction(transactionId)` - Aceptar términos (vendedor)
- `processPayment(transactionId, paymentInfo)` - Procesar pago (comprador)
- `markShipped(transactionId, shippingEvidence)` - Marcar como enviado
- `markDelivered(transactionId)` - Marcar como entregado
- `approveTransaction(transactionId)` - Aprobar transacción
- `createDispute(transactionId, disputeData)` - Crear disputa
- `getStats()` - Obtener estadísticas
- `calculateBuyerStats(transactions)` - Calcular estadísticas como comprador
- `calculateSellerStats(transactions)` - Calcular estadísticas como vendedor

**Endpoints utilizados:**
- `GET /transactions` - Listar transacciones
- `GET /transactions/{id}` - Obtener transacción
- `POST /transactions` - Crear transacción
- `PUT /transactions/{id}/accept` - Aceptar términos
- `PUT /transactions/{id}/pay` - Procesar pago
- `PUT /transactions/{id}/ship` - Marcar como enviado
- `PUT /transactions/{id}/deliver` - Marcar como entregado
- `PUT /transactions/{id}/approve` - Aprobar transacción
- `POST /transactions/{id}/dispute` - Crear disputa
- `GET /stats` - Estadísticas

---

### 3. NotificationService (`notification.service.ts`)
**Base URL:** `http://localhost:8004` (Notification Service)

**Métodos:**
- `getNotifications(params?)` - Obtener notificaciones del usuario
- `markAsRead(notificationId)` - Marcar notificación como leída
- `getUnreadCount()` - Obtener conteo de no leídas

**Endpoints utilizados:**
- `GET /notifications` - Listar notificaciones
- `PUT /notifications/{id}/read` - Marcar como leída

---

## 🔌 Configuración de URLs

### Environment (Desarrollo)
```typescript
// frontend-angular/src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  authApiUrl: 'http://localhost:8001',
  escrowApiUrl: 'http://localhost:8002',
  paymentApiUrl: 'http://localhost:8003',
  notificationApiUrl: 'http://localhost:8004',
  wsUrl: 'ws://localhost:8000/ws'
};
```

### Environment (Producción)
```typescript
// frontend-angular/src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.railway.app',
  authApiUrl: 'https://your-backend-url.railway.app',
  escrowApiUrl: 'https://your-backend-url.railway.app',
  paymentApiUrl: 'https://your-backend-url.railway.app',
  notificationApiUrl: 'https://your-backend-url.railway.app',
  wsUrl: 'wss://your-backend-url.railway.app/ws'
};
```

---

## 📋 Funcionalidades Conectadas

### ✅ Dashboard
- Carga estadísticas de comprador y vendedor desde transacciones
- Muestra notificaciones recientes
- Actualiza datos en tiempo real

### ✅ Perfil
- **Registro Persona:** 
  - Carga datos desde `GET /me`
  - Guarda cambios con `PUT /me`
  
- **Registro Empresa:**
  - Guarda datos empresariales con `PUT /me`
  
- **Datos Bancarios:**
  - Guarda datos bancarios con `PUT /me`

### ✅ Mis Transacciones
- **Ventas:** Filtra transacciones donde `seller_id === user.id`
- **Compras:** Filtra transacciones donde `buyer_id === user.id`
- **Disputas:** Filtra transacciones con `status === 'disputed'`
- Botón de actualizar para recargar datos

### ✅ Crear Nueva Venta
- Crea transacción ESCROW con `POST /transactions`
- Valida campos requeridos
- Recarga lista de transacciones después de crear

### ✅ Productos
- **Buscar:** Busca en transacciones disponibles
- **Publicar:** Redirige a "Crear Nueva Venta"

### ✅ Notificaciones
- Carga notificaciones con `GET /notifications`
- Marca como leídas con `PUT /notifications/{id}/read`
- Muestra contador de no leídas en sidebar

### ✅ Configuración
- Guarda preferencias localmente (pendiente de endpoint backend)

---

## 🔐 Autenticación

Todos los servicios utilizan el método `getAuthHeaders()` de `AuthService` que incluye:
```typescript
{
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🚀 Flujo de Datos

### Al Iniciar Sesión
1. Usuario ingresa credenciales → `POST /login`
2. Se obtiene token JWT
3. Se redirige a `/consufin/usuario`
4. Al cargar el portal:
   - `loadUserProfile()` → `GET /me`
   - `loadTransactions()` → `GET /transactions`
   - `loadNotifications()` → `GET /notifications`
   - `loadUnreadCount()` → `GET /notifications?unread_only=true`

### Al Guardar Perfil
1. Usuario completa formulario
2. Click en "Guardar Cambios"
3. `saveProfile()` → `PUT /me` con datos actualizados
4. Se recarga el perfil para mostrar cambios

### Al Crear Venta
1. Usuario completa formulario de venta
2. Click en "Crear Venta"
3. `createSale()` → `POST /transactions` con datos de la transacción
4. Se recarga lista de transacciones

---

## ⚠️ Manejo de Errores

Todos los servicios incluyen manejo de errores con:
- `catchError()` para capturar errores HTTP
- Mensajes de error amigables al usuario
- Fallback a datos locales cuando es posible
- Logs en consola para debugging

---

## 📝 Notas Importantes

1. **URLs de Producción:** Actualizar en `environment.prod.ts` con las URLs reales del backend desplegado

2. **CORS:** Asegurar que el backend tenga configurado CORS para permitir peticiones desde el frontend

3. **Tokens:** Los tokens se almacenan en `localStorage` y se incluyen automáticamente en todas las peticiones

4. **Refresh Token:** Implementar renovación automática de tokens cuando expire (pendiente)

5. **WebSockets:** Para notificaciones en tiempo real, conectar con `WS /ws/{user_id}` (pendiente)

---

## 🧪 Credenciales de Prueba

- **Email:** `vendedor@test.com`
- **Password:** `Vendedor1$`

Después del login, el usuario será redirigido automáticamente a `/consufin/usuario`

---

**Última actualización:** 2025-01-30
**Estado:** ✅ Integración completa con backend

