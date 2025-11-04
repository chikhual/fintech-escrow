# ✅ INSTRUCCIONES FINALES - INICIAR BACKEND Y PROBAR LOGIN

## 🎯 RESUMEN DE LO QUE YA ESTÁ HECHO

✅ PostgreSQL instalado y corriendo
✅ Base de datos `fintech_escrow` creada
✅ Usuario `fintech_user` creado con permisos
✅ Tablas de la base de datos creadas
✅ Usuario de prueba `vendedor@test.com` creado/actualizado

---

## 🚀 PASO FINAL: INICIAR EL BACKEND

### **ABRE UNA TERMINAL NUEVA** y ejecuta estos comandos:

```bash
cd /Users/benjmincervantesvega/fintech/backend/auth_service

export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Deberías ver:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**⚠️ IMPORTANTE: NO CIERRES ESTA TERMINAL**

---

## 🧪 PROBAR EL LOGIN

### Una vez que el backend esté corriendo:

1. **Abre tu navegador en:** `http://localhost:4200/consufin/registro`

2. **Ingresa las credenciales:**
   - Email: `vendedor@test.com`
   - Password: `Vendedor1$`

3. **Haz click en "Iniciar Sesión"**

4. **Deberías ser redirigido a:** `/consufin/usuario`

---

## ✅ VERIFICAR QUE TODO FUNCIONA

### Si el login funciona:
- ✅ Deberías ver el Dashboard del portal de usuario
- ✅ Sidebar de navegación visible
- ✅ Todas las secciones accesibles (Perfil, Transacciones, Notificaciones, etc.)
- ✅ WebSocket conectado (verificar en consola del navegador)

### Si el login NO funciona:
1. **Abre la consola del navegador (F12 → Console)**
2. **Dime qué errores aparecen en rojo**
3. **Verifica que el backend esté corriendo:**
   ```bash
   curl http://localhost:8001/health
   ```

---

## 🆘 SI HAY PROBLEMAS

### Problema: Backend no inicia
**Solución:**
- Verifica que PostgreSQL esté corriendo: `brew services list | grep postgresql`
- Verifica las variables de entorno están configuradas
- Revisa los errores en la terminal

### Problema: Error de conexión a la base de datos
**Solución:**
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
pg_isready
```

### Problema: Usuario no existe
**Solución:**
Ejecuta de nuevo el script de creación de usuario (ya debería estar creado)

---

## 📝 COMANDOS ÚTILES

### Verificar PostgreSQL
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
pg_isready
```

### Verificar backend
```bash
curl http://localhost:8001/health
```

### Ver usuarios en la base de datos
```bash
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
PGPASSWORD=fintech_pass psql -U fintech_user -d fintech_escrow -h localhost -c "SELECT id, email, first_name, last_name, status FROM users;"
```

---

## ✅ CHECKLIST FINAL

Antes de probar el login, verifica:

- [ ] PostgreSQL corriendo (`pg_isready`)
- [ ] Backend Auth Service corriendo (puerto 8001)
- [ ] Frontend corriendo (puerto 4200)
- [ ] Usuario `vendedor@test.com` existe en la base de datos
- [ ] No hay errores en la terminal del backend

---

## 🎉 ¡TODO LISTO!

Ahora deberías poder hacer login exitosamente y acceder al portal de usuario con todas sus funcionalidades.

**Si algo falla, dime qué error específico aparece y te ayudo a solucionarlo.**

