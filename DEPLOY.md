# 🚀 Guía de Despliegue - CONSUFIN ESCROW

## 📦 GitHub - Respaldar Código

### ✅ Ya completado:
```bash
git add -A
git commit -m "feat: Sistema completo de verificación y notificaciones"
git push origin main
```

### Para futuros cambios:
```bash
git add .
git commit -m "descripción del cambio"
git push origin main
```

---

## 🌐 Vercel - Despliegue del Frontend

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a [Vercel.com](https://vercel.com)** y inicia sesión

2. **Importa el proyecto desde GitHub:**
   - Click en "Add New..." → "Project"
   - Selecciona el repositorio: `chikhual/fintech-escrow`
   - Configura el proyecto:
     - **Framework Preset:** Angular
     - **Root Directory:** `frontend-angular`
     - **Build Command:** `npm run build` o `ng build --configuration production`
     - **Output Directory:** `dist/frontend-angular/browser`
     - **Install Command:** `npm install`

3. **Variables de Entorno:**
   ```
   API_URL=https://tu-backend.railway.app
   AUTH_API_URL=https://tu-backend.railway.app
   WS_URL=wss://tu-backend.railway.app/ws
   ```

4. **Click en "Deploy"**

### Opción 2: Desde la Terminal (CLI de Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Navegar al directorio del frontend
cd frontend-angular

# Iniciar despliegue
vercel

# Seguir las instrucciones:
# - ¿Configurar y desplegar? Yes
# - ¿Qué proyecto? Create new
# - Nombre del proyecto: fintech-escrow-frontend
# - Directorio: ./
# - Override settings? No

# Para producción:
vercel --prod
```

---

## ⚙️ Configuración de Vercel

### Archivo `vercel.json` (ya existe):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Build Settings en Vercel Dashboard:
- **Framework Preset:** Angular
- **Root Directory:** `frontend-angular`
- **Build Command:** `npm run build -- --configuration production`
- **Output Directory:** `dist/frontend-angular/browser`
- **Install Command:** `npm install`

### Variables de Entorno en Vercel:
1. Ve a Project Settings → Environment Variables
2. Agrega:
   ```
   API_URL = https://tu-backend.railway.app
   AUTH_API_URL = https://tu-backend.railway.app
   WS_URL = wss://tu-backend.railway.app/ws
   ```

---

## 🔧 Configuración del Backend en Railway

### 1. Crear proyecto en Railway
- Ve a [railway.app](https://railway.app)
- New Project → Deploy from GitHub
- Selecciona el repositorio: `chikhual/fintech-escrow`

### 2. Configurar servicio de autenticación:
- Add Service → GitHub Repo
- Selecciona el repositorio
- Root Directory: `backend/auth_service`
- Variables de entorno:
  ```
  DATABASE_URL=postgresql://user:pass@host:port/db
  SECRET_KEY=tu-secret-key-seguro
  ALLOWED_ORIGINS=https://tu-frontend.vercel.app
  PYTHONPATH=/app
  ```

### 3. Base de datos PostgreSQL:
- Add Database → PostgreSQL
- Railway creará automáticamente las variables `DATABASE_URL`

### 4. Puerto y dominio:
- Railway asigna automáticamente un dominio
- Copia el dominio y úsalo en las variables de entorno de Vercel

---

## 📝 Checklist de Despliegue

### Pre-despliegue:
- [ ] Código guardado en GitHub
- [ ] Tests pasando (si los hay)
- [ ] Variables de entorno documentadas
- [ ] Configuración de producción lista

### Frontend (Vercel):
- [ ] Proyecto importado desde GitHub
- [ ] Root Directory: `frontend-angular`
- [ ] Build Command configurado
- [ ] Output Directory: `dist/frontend-angular/browser`
- [ ] Variables de entorno agregadas
- [ ] Despliegue exitoso
- [ ] Dominio personalizado configurado (opcional)

### Backend (Railway):
- [ ] Proyecto creado
- [ ] Servicio de autenticación desplegado
- [ ] Base de datos PostgreSQL agregada
- [ ] Variables de entorno configuradas
- [ ] Tablas creadas (automático con `init_db()`)
- [ ] Dominio copiado y configurado en Vercel

### Post-despliegue:
- [ ] Verificar que el frontend carga correctamente
- [ ] Probar login/registro
- [ ] Verificar conexión con backend
- [ ] Probar endpoints de verificación
- [ ] Revisar logs en Vercel y Railway

---

## 🔗 URLs importantes

### Desarrollo Local:
- Frontend: http://localhost:4200
- Backend Auth: http://localhost:8001
- API: http://localhost:8000

### Producción:
- Frontend: https://tu-proyecto.vercel.app
- Backend: https://tu-proyecto.railway.app

---

## 🐛 Solución de Problemas

### Error: "Build failed"
- Verificar que `package.json` tenga todas las dependencias
- Verificar que `angular.json` esté configurado correctamente
- Revisar logs en Vercel Dashboard

### Error: "Cannot find module"
- Verificar que `node_modules` no esté en `.gitignore`
- Asegurar que `npm install` se ejecute en el build

### Error: "API Connection Failed"
- Verificar variables de entorno en Vercel
- Verificar CORS en el backend
- Verificar que el backend esté desplegado y funcionando

### Error: "Routing not working"
- Verificar que `vercel.json` tenga la configuración de rewrites
- Asegurar que todas las rutas redirijan a `index.html`

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Vercel Dashboard → Deployments → [tu deployment] → Runtime Logs
2. Revisa los logs en Railway Dashboard → [tu servicio] → Logs
3. Verifica las variables de entorno
4. Verifica que el backend esté corriendo

---

## 🎉 ¡Despliegue Completado!

Una vez desplegado, tu aplicación estará disponible en:
- **Frontend:** https://tu-proyecto.vercel.app
- **Backend:** https://tu-proyecto.railway.app

¡Felicidades! 🚀

