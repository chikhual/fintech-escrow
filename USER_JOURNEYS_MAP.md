# 🗺️ MAPA COMPLETO DE RECORRIDOS DE USUARIO

## 📊 CATEGORÍAS DE FLUJOS

### 1. 🔐 AUTENTICACIÓN Y REGISTRO

#### A. Usuario Nuevo - Registro Completo
1. **Landing** → `/consufin`
   - Click "Registrarse" → `/consufin/registro`
2. **Registro** → `/consufin/registro`
   - Llenar formulario de registro
   - Submit → Auto-login → `/consufin/validacion`
3. **Validación KYC** → `/consufin/validacion`
   - Completar datos personales
   - Subir documentos
   - Verificar email/teléfono
   - Finalizar → `/consufin/usuario`

#### B. Usuario Existente - Login
1. **Landing** → `/consufin`
   - Click "Iniciar Sesión" → `/consufin/registro`
2. **Login** → `/consufin/registro`
   - Email: `vendedor@test.com`
   - Password: `Vendedor1$`
   - Submit → `/consufin/usuario`
3. **Portal Usuario** → `/consufin/usuario`
   - Dashboard visible
   - WebSocket conectado
   - Notificaciones cargadas

#### C. Recuperación de Contraseña
1. `/consufin/registro` → Click "Olvidé mi contraseña"
2. Ingresar email
3. Recibir email de recuperación
4. Click en link → Reset password
5. Nueva contraseña → Login

#### D. Verificación de Email
1. Post-registro → Email recibido
2. Click en link de verificación
3. Verificar → `/consufin/validacion` o `/consufin/usuario`

---

### 2. 👤 PERFIL Y CONFIGURACIÓN

#### A. Gestión de Perfil Completo
1. `/consufin/usuario` → Click "Perfil"
2. **Datos Personales**
   - Editar nombre, CURP, RFC, fecha nacimiento
   - Guardar → Validación → Éxito
3. **Datos Empresa**
   - Razón social, RFC empresarial, tipo
   - Guardar → Validación → Éxito
4. **Datos Bancarios**
   - Banco, CLABE, número cuenta
   - Guardar → Validación → Éxito

#### B. Configuración de Usuario
1. `/consufin/usuario` → Click "Configuración"
2. **General**
   - Idioma, zona horaria, modo oscuro
   - Guardar cambios
3. **Notificaciones**
   - Preferencias email/SMS/push (comprador/vendedor)
   - Guardar cambios
4. **Transacciones**
   - Período inspección, monto máximo, auto-liberación
   - Guardar cambios

---

### 3. 💰 TRANSACCIONES - COMPRADOR

#### A. Buscar y Comprar Producto
1. `/consufin/usuario` → "Productos" → "Buscar"
2. Búsqueda de productos
   - Filtrar por categoría, precio, ubicación
   - Seleccionar producto
3. Ver detalles producto
4. Click "Comprar" → Crear transacción
5. Revisar términos → Aceptar
6. Proceso de pago
7. Confirmación → `/consufin/usuario` → "Compras"

#### B. Gestionar Compras
1. `/consufin/usuario` → "Mis Transacciones" → "Compras"
2. Ver lista de compras (paginada)
3. **Transacción Pendiente**
   - Ver detalles → Aceptar términos
   - Realizar pago
4. **Transacción En Proceso**
   - Esperar envío
   - Recibir notificación de envío
   - Confirmar recepción
   - Período de inspección
   - Aprobar o rechazar
5. **Transacción Completada**
   - Ver historial
   - Calificar vendedor

#### C. Disputa como Comprador
1. Transacción en proceso → "Abrir Disputa"
2. Seleccionar razón
3. Describir problema
4. Subir evidencia
5. Enviar → Esperar resolución
6. Ver estado de disputa

---

### 4. 🏪 TRANSACCIONES - VENDEDOR

#### A. Crear Nueva Venta
1. `/consufin/usuario` → "Crear Nueva Venta"
2. Completar formulario:
   - Título, categoría, descripción
   - Precio, imágenes
   - Período de inspección
3. Publicar → Transacción creada
4. Notificación a compradores potenciales

#### B. Gestionar Ventas
1. `/consufin/usuario` → "Mis Transacciones" → "Ventas"
2. Ver lista de ventas (paginada)
3. **Transacción Pendiente**
   - Esperar aceptación del comprador
   - Notificación cuando acepta
4. **Transacción En Proceso**
   - Esperar pago
   - Notificación de pago recibido
   - Preparar envío
   - Marcar como enviado
   - Subir evidencia de envío
5. **Transacción Completada**
   - Fondos liberados
   - Ver historial
   - Recibir calificación

#### C. Disputa como Vendedor
1. Transacción en proceso → Responder a disputa
2. Ver alegatos del comprador
3. Responder con evidencia
4. Esperar resolución de administrador

---

### 5. 🔔 NOTIFICACIONES

#### A. Ver Notificaciones
1. `/consufin/usuario` → "Notificaciones"
2. Ver lista paginada
3. Filtrar por tipo (Todas/Compras/Ventas/Urgentes)
4. Marcar como leída
5. Click en notificación → Navegar a transacción relacionada

#### B. Notificaciones en Tiempo Real
1. Usuario conectado → WebSocket activo
2. Nueva transacción → Notificación instantánea
3. Cambio de estado → Notificación
4. Pago recibido → Notificación
5. Disputa abierta → Notificación urgente

---

### 6. 🔄 FLUJOS DE TRANSACCIÓN COMPLETOS

#### A. Transacción Exitosa (Comprador → Vendedor)
1. **Vendedor**: Crear venta → Publicar
2. **Comprador**: Buscar → Encontrar → Comprar
3. **Comprador**: Aceptar términos → Pagar
4. **Sistema**: Bloquear fondos en ESCROW
5. **Vendedor**: Recibir notificación de pago → Enviar producto
6. **Vendedor**: Marcar como enviado → Subir evidencia
7. **Comprador**: Recibir notificación → Confirmar recepción
8. **Comprador**: Período de inspección (N días)
9. **Comprador**: Aprobar → Fondos liberados
10. **Vendedor**: Recibir fondos → Transacción completada

#### B. Transacción con Disputa
1. Pasos 1-7 del flujo exitoso
2. **Comprador**: Abrir disputa durante inspección
3. **Sistema**: Notificar a vendedor y admin
4. **Vendedor**: Responder con evidencia
5. **Admin**: Revisar → Resolver
6. **Sistema**: Liberar fondos según resolución

#### C. Transacción Rechazada
1. Pasos 1-3 del flujo exitoso
2. **Comprador**: Rechazar términos
3. **Sistema**: Cancelar transacción
4. **Vendedor**: Recibir notificación de cancelación

---

### 7. 🛠️ FUNCIONALIDADES AVANZADAS

#### A. Calculadora de Costos
1. `/consufin/calculadora`
2. Ingresar monto de transacción
3. Ver cálculo de fees ESCROW
4. Ver monto total a pagar

#### B. Búsqueda Avanzada
1. `/consufin/usuario` → "Productos" → "Buscar"
2. Filtros múltiples:
   - Categoría
   - Rango de precio
   - Ubicación
   - Solo con ESCROW
   - Vendedor verificado
3. Resultados paginados
4. Ordenar por relevancia/precio/fecha

#### C. Dashboard y Estadísticas
1. `/consufin/usuario` → Dashboard
2. Ver estadísticas:
   - Como comprador (en proceso, completadas, gastado, rating)
   - Como vendedor (en proceso, completadas, vendido, rating)
3. Cambiar rol activo (Comprador/Vendedor/Completo)
4. Ver notificaciones recientes

---

### 8. 🔒 SEGURIDAD Y VALIDACIÓN

#### A. Verificación de Identidad (KYC)
1. `/consufin/validacion`
2. Subir documentos:
   - INE/IFE
   - Comprobante de domicilio
   - RFC (si aplica)
3. Verificar datos:
   - CURP
   - RFC
   - Teléfono
   - Email
4. Esperar aprobación
5. Notificación de verificación completada

#### B. Renovación de Token
1. Usuario autenticado → Token expira en 30 min
2. Sistema renueva automáticamente 5 min antes
3. Si falla → Logout automático
4. Usuario debe re-autenticarse

---

### 9. 🚨 CASOS DE ERROR Y RECUPERACIÓN

#### A. Error de Conexión
1. Usuario navegando → Pérdida de conexión
2. WebSocket se desconecta
3. Sistema intenta reconectar automáticamente
4. Muestra indicador de estado
5. Al recuperar → Sincroniza datos

#### B. Error en Pago
1. Comprador intenta pagar → Error de Stripe
2. Mostrar mensaje de error
3. Opción de reintentar
4. Si falla múltiples veces → Contactar soporte

#### C. Token Expirado
1. Usuario inactivo → Token expira
2. Próxima petición → 401
3. Sistema intenta refresh token
4. Si refresh falla → Logout → Login

---

### 10. 📱 FLUJOS CROSS-DEVICE

#### A. Iniciar en Desktop, Continuar en Mobile
1. Usuario crea transacción en desktop
2. Cierra navegador
3. Abre en mobile → Login
4. Ve transacción en progreso
5. Continúa desde donde quedó

---

## 🔍 FLUJOS CRÍTICOS PARA TESTING

### Prioridad ALTA (Funcionalidad Core)
1. ✅ Registro → Login → Portal Usuario
2. ✅ Crear Venta → Buscar → Comprar → Pagar
3. ✅ Envío → Recepción → Inspección → Aprobación
4. ✅ Disputa → Resolución
5. ✅ Notificaciones en tiempo real

### Prioridad MEDIA (UX importante)
1. ✅ Paginación en listas grandes
2. ✅ Caché y rendimiento
3. ✅ Renovación automática de tokens
4. ✅ WebSocket reconexión

### Prioridad BAJA (Edge cases)
1. ✅ Manejo de errores
2. ✅ Validaciones de formularios
3. ✅ Estados de carga
4. ✅ Responsive design

---

## 🧪 TESTING AUTOMATIZADO REQUERIDO

Para cada flujo:
- [ ] Navegación correcta
- [ ] Validación de datos
- [ ] Manejo de errores
- [ ] Estados de carga
- [ ] Persistencia de datos
- [ ] Sincronización en tiempo real
- [ ] Responsive behavior

