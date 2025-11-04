# 🚀 ACCESO DIRECTO AL PORTAL DE USUARIO

## 📍 URL de Acceso Rápido

### Opción 1: Acceso Rápido con Login Automático (Recomendado)

**URL:** `http://localhost:4200/consufin/acceso-rapido`

Esta página:
- ✅ Intenta hacer login automáticamente con `vendedor@test.com`
- ✅ Si el backend está disponible, te autentica y redirige al portal
- ✅ Si falla, te da opciones para reintentar o ir directamente

### Opción 2: Acceso Directo (Sin Autenticación - Solo Desarrollo)

**URL:** `http://localhost:4200/consufin/usuario`

**Importante:** Esta opción solo funciona si:
- Ya estás autenticado, O
- Usas el botón "Ir Directamente" en la página de acceso rápido

---

## 🔧 Cómo Usar

### Método 1: Usando Acceso Rápido

1. **Abre tu navegador en:**
   ```
   http://localhost:4200/consufin/acceso-rapido
   ```

2. **La página automáticamente:**
   - Intenta hacer login con `vendedor@test.com` / `Vendedor1$`
   - Si funciona, te redirige al portal
   - Si falla, muestra el error y opciones

3. **Si el backend no está disponible:**
   - Click en "Ir Directamente (Sin Autenticación)"
   - Esto te llevará al portal con datos mock (solo para desarrollo)

### Método 2: Marca de Favoritos

Crea un bookmark en tu navegador con:
- **Nombre:** `Portal Usuario - Acceso Rápido`
- **URL:** `http://localhost:4200/consufin/acceso-rapido`

---

## ⚠️ Notas Importantes

### Modo Desarrollo
- El acceso directo sin autenticación usa datos mock
- Algunas funciones pueden no funcionar sin backend real
- Los WebSockets no se conectarán sin autenticación real

### Producción
- Esta ruta NO debería estar disponible en producción
- Solo para desarrollo y testing local
- En producción, siempre requiere autenticación real

---

## 🐛 Si No Funciona

### Problema: "Error de conexión"
**Solución:** 
1. Verifica que el backend esté corriendo: `curl http://localhost:8001/health`
2. Inicia el backend: `./INICIAR_BACKEND.sh`

### Problema: "Credenciales incorrectas"
**Solución:**
1. Verifica que el usuario existe en la BD
2. Verifica la contraseña: `Vendedor1$`

### Problema: Página en blanco
**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica errores en la consola
3. Verifica que el frontend esté corriendo en puerto 4200

---

## ✅ URLs Útiles

- **Acceso Rápido:** `http://localhost:4200/consufin/acceso-rapido`
- **Portal Usuario:** `http://localhost:4200/consufin/usuario`
- **Login Normal:** `http://localhost:4200/consufin/registro`
- **Home:** `http://localhost:4200/consufin`

---

## 🎯 Uso Recomendado

Para desarrollo diario, usa el **acceso rápido**:
```
http://localhost:4200/consufin/acceso-rapido
```

Esto te ahorra tiempo haciendo login automáticamente cada vez que necesites acceder al portal.

