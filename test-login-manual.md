# 🧪 GUÍA DE PRUEBA MANUAL: LOGIN Y PORTAL DE USUARIO

## 📋 INSTRUCCIONES PARA PROBAR MANUALMENTE

### Prerequisitos
1. ✅ Frontend corriendo en `http://localhost:4200`
2. ✅ Backend Auth Service corriendo en `http://localhost:8001`
3. ✅ Backend ESCROW Service corriendo en `http://localhost:8002`
4. ✅ Backend Notification Service corriendo en `http://localhost:8004`

### Credenciales de Prueba
- **Email:** `vendedor@test.com`
- **Password:** `Vendedor1$`

---

## 🔍 PASOS DE PRUEBA

### 1. Navegar a Página de Login
**URL:** `http://localhost:4200/consufin/registro`

**Verificar:**
- [ ] Página carga correctamente
- [ ] Se muestra formulario de login
- [ ] Inputs de email y password están visibles
- [ ] Botón "Iniciar Sesión" está presente

**Si hay errores:**
- Verificar consola del navegador (F12)
- Verificar que el servidor Angular esté corriendo
- Verificar que no hay errores de CORS

---

### 2. Realizar Login

**Acciones:**
1. Ingresar email: `vendedor@test.com`
2. Ingresar password: `Vendedor1$`
3. Click en "Iniciar Sesión"

**Verificar:**
- [ ] El botón muestra estado de "Cargando..." al hacer click
- [ ] No hay errores en la consola del navegador
- [ ] Se redirige a `/consufin/usuario`
- [ ] La página del portal de usuario carga

**Si el login falla:**
- Verificar que el backend Auth Service esté corriendo
- Verificar credenciales en la base de datos
- Revisar errores en la consola del navegador
- Revisar logs del backend

---

### 3. Verificar Portal de Usuario - Dashboard

**URL esperada:** `http://localhost:4200/consufin/usuario`

**Verificar elementos:**
- [ ] Sidebar de navegación visible en el lado izquierdo
- [ ] Logo/Header "FINTECH ESCROW" visible
- [ ] Mensaje de bienvenida con nombre de usuario
- [ ] Selector de rol (Comprador/Vendedor/Completo)
- [ ] Tarjetas de estadísticas:
  - [ ] Como Comprador (En Proceso, Completadas, Pendientes, En Disputa, Gastado, Rating)
  - [ ] Como Vendedor (En Proceso, Completadas, Pendientes, En Disputa, Vendido, Rating)
- [ ] Sección de Notificaciones Recientes
- [ ] Footer con información del usuario y botón "Cerrar Sesión"

**Verificar funcionalidad:**
- [ ] Cambiar entre roles (Comprador/Vendedor/Completo) y ver que las estadísticas cambian
- [ ] Click en "Ver todas" en notificaciones → navega a sección de notificaciones

---

### 4. Verificar Sección PERFIL

**Acciones:**
1. Click en "Perfil" en el sidebar

**Verificar subsecciones:**

#### A. Datos Personales
- [ ] Formulario visible con campos:
  - Nombre
  - Apellidos
  - CURP
  - RFC
  - Fecha de Nacimiento
  - Teléfono
  - Dirección
- [ ] Botón "Guardar Cambios" presente
- [ ] Los campos se pueden editar

#### B. Datos Empresa
- [ ] Click en tab "Registro Empresa"
- [ ] Formulario visible con campos:
  - Razón Social
  - RFC Empresarial
  - Tipo de Empresa
  - Años de Experiencia
- [ ] Botón "Guardar Cambios" presente

#### C. Datos Bancarios
- [ ] Click en tab "Datos Bancarios"
- [ ] Formulario visible con campos:
  - Banco (dropdown)
  - CLABE
  - Número de Cuenta
  - Titular de la Cuenta
- [ ] Botón "Guardar Cambios" presente

---

### 5. Verificar Sección TRANSACCIONES

**Acciones:**
1. Click en "Mis Transacciones" en el sidebar

**Verificar subsecciones:**

#### A. Ventas
- [ ] Click en tab "Ventas"
- [ ] Lista de transacciones de venta visible
- [ ] Filtros disponibles (si aplica)
- [ ] Botón "Actualizar" presente
- [ ] Si hay más de 20 transacciones, controles de paginación visibles

#### B. Compras
- [ ] Click en tab "Compras"
- [ ] Lista de transacciones de compra visible
- [ ] Misma estructura que Ventas
- [ ] Controles de paginación si hay más de 20 items

#### C. Disputas
- [ ] Click en tab "Disputas"
- [ ] Lista de transacciones en disputa visible
- [ ] Indicadores visuales de estado de disputa

---

### 6. Verificar Sección CREAR NUEVA VENTA

**Acciones:**
1. Click en "Crear Nueva Venta" en el sidebar

**Verificar:**
- [ ] Formulario completo visible
- [ ] Campos:
  - Título del Producto
  - Categoría
  - Precio (MXN)
  - Descripción
  - Período de Inspección
  - Fee ESCROW pagado por
- [ ] Botón "Crear Venta" presente
- [ ] Mensajes de validación funcionan

---

### 7. Verificar Sección PRODUCTOS

**Acciones:**
1. Click en "Productos" en el sidebar

**Verificar subsecciones:**

#### A. Buscar
- [ ] Campo de búsqueda visible
- [ ] Filtros disponibles (Categoría, Precio, Ubicación)
- [ ] Checkboxes: "Solo con ESCROW", "Vendedor Verificado"
- [ ] Grid de resultados de productos
- [ ] Botón "Comprar" en cada producto

#### B. Publicar
- [ ] Click en tab "Publicar"
- [ ] Mensaje informativo visible
- [ ] Botón que redirige a "Crear Nueva Venta"

---

### 8. Verificar Sección NOTIFICACIONES

**Acciones:**
1. Click en "Notificaciones" en el sidebar

**Verificar:**
- [ ] Lista de notificaciones visible
- [ ] Filtros: Todas/Compras/Ventas/Urgentes
- [ ] Cada notificación muestra:
  - Icono
  - Título
  - Mensaje
  - Fecha/hora
  - Botón "Marcar como leída"
- [ ] Controles de paginación si hay más de 20 notificaciones
- [ ] Badge de contador de no leídas en el sidebar

---

### 9. Verificar Sección CONFIGURACIÓN

**Acciones:**
1. Click en "Configuración" en el sidebar

**Verificar subsecciones:**

#### A. General
- [ ] Dropdown de Idioma
- [ ] Dropdown de Zona Horaria
- [ ] Checkbox de Modo Oscuro
- [ ] Botón "Guardar Cambios"

#### B. Notificaciones
- [ ] Configuración para Comprador:
  - Email, SMS, Push checkboxes
- [ ] Configuración para Vendedor:
  - Email, SMS, Push checkboxes
- [ ] Botón "Guardar Cambios"

#### C. Transacciones
- [ ] Período de Inspección por Defecto
- [ ] Monto Máximo sin Aprobación 2FA
- [ ] Checkbox de Liberación Automática de Fondos
- [ ] Botón "Guardar Cambios"

---

### 10. Verificar Funcionalidades Técnicas

#### A. WebSocket Connection
**Verificar:**
- [ ] Abrir consola del navegador (F12)
- [ ] Buscar mensajes de conexión WebSocket
- [ ] Verificar que no hay errores de conexión
- [ ] Si hay notificaciones nuevas, deberían aparecer en tiempo real

#### B. Token Storage
**Verificar:**
- [ ] Abrir DevTools → Application → Local Storage
- [ ] Verificar que existe:
  - `consufin_access_token`
  - `consufin_refresh_token`
  - `consufin_user`
- [ ] Verificar que hay entradas de caché (si se han cargado datos)

#### C. Cache Functionality
**Verificar:**
- [ ] Navegar a una sección con datos (ej: Transacciones)
- [ ] Recargar la página (F5)
- [ ] Los datos deberían cargar más rápido (desde caché)
- [ ] Verificar en Local Storage entradas con prefijo `cache_`

#### D. Paginación
**Verificar:**
- [ ] Si hay más de 20 items en Transacciones o Notificaciones
- [ ] Controles de paginación visibles:
  - Botón "Anterior"
  - Números de página
  - Botón "Siguiente"
  - Contador "Mostrando X - Y de Z"
- [ ] Click en siguiente página → carga nueva página
- [ ] Scroll automático al cambiar de página

#### E. Token Refresh
**Verificar:**
- [ ] Esperar 25 minutos (o simular token expirado)
- [ ] El token debería renovarse automáticamente
- [ ] No debería haber logout inesperado
- [ ] Verificar en consola mensajes de "Refreshing access token..."

---

### 11. Verificar Manejo de Errores

#### A. Backend Desconectado
1. Detener backend Auth Service
2. Intentar login
3. **Verificar:** Mensaje de error claro al usuario

#### B. Error de Red
1. Desactivar conexión a internet
2. Navegar por el portal
3. **Verificar:** Mensajes de error apropiados, no crash de la app

#### C. Token Expirado
1. Simular token expirado (editar localStorage)
2. Hacer una acción que requiera API
3. **Verificar:** Intento de refresh automático o redirect a login

---

## 📊 CHECKLIST DE VERIFICACIÓN COMPLETA

### Funcionalidad Core
- [ ] Login funciona correctamente
- [ ] Redirección a portal después de login
- [ ] Todas las secciones del sidebar son accesibles
- [ ] Navegación entre secciones funciona
- [ ] Datos se cargan correctamente

### Funcionalidades Avanzadas
- [ ] WebSocket conectado y funcionando
- [ ] Notificaciones en tiempo real
- [ ] Caché funcionando (datos cargan rápido en segunda visita)
- [ ] Paginación funciona correctamente
- [ ] Token refresh automático

### Robustez
- [ ] Manejo de errores apropiado
- [ ] No hay crashes de la aplicación
- [ ] Mensajes de error user-friendly
- [ ] Loading states visibles
- [ ] Validaciones de formularios funcionan

---

## 🐛 SI ALGO FALLA

### Problemas Comunes

1. **Login no funciona:**
   - Verificar que backend Auth Service esté corriendo
   - Verificar credenciales en base de datos
   - Revisar CORS en backend
   - Verificar logs del backend

2. **Portal no carga:**
   - Verificar que el componente UserPortalComponent existe
   - Revisar errores en consola del navegador
   - Verificar que el token se almacenó correctamente

3. **Datos no cargan:**
   - Verificar que servicios backend están corriendo
   - Revisar Network tab en DevTools
   - Verificar que el token es válido
   - Revisar errores de CORS

4. **WebSocket no conecta:**
   - Verificar que Notification Service esté corriendo
   - Verificar URL del WebSocket en environment
   - Revisar logs del backend

---

## 📝 NOTAS DE PRUEBA

**Fecha de prueba:** _______________
**Tester:** _______________
**Navegador:** _______________
**Versión:** _______________

**Resultados:**
- Tests pasados: ___ / 11
- Tests fallidos: ___ / 11
- Observaciones: _______________

---

## ✅ RESULTADO ESPERADO

Al finalizar esta prueba, deberías poder:
- ✅ Hacer login exitosamente
- ✅ Acceder a todas las secciones del portal
- ✅ Ver tus datos de perfil
- ✅ Ver tus transacciones (si existen)
- ✅ Crear nuevas ventas
- ✅ Buscar productos
- ✅ Ver notificaciones
- ✅ Configurar preferencias
- ✅ Tener conexión WebSocket activa
- ✅ Ver datos cacheados funcionando
- ✅ Navegar con paginación (si hay muchos datos)

