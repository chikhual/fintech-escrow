# ⚙️ Configuración Manual de Vercel (si vercel.json no funciona)

Si el `vercel.json` automático no funciona, configura manualmente en el Dashboard de Vercel:

## 📋 Settings del Proyecto:

### General:
- **Framework Preset:** `Other` o `Angular`
- **Root Directory:** `frontend-angular`

### Build & Development Settings:
- **Build Command:** `npm run build`
- **Output Directory:** `dist/frontend-angular/browser`
- **Install Command:** `npm install`
- **Development Command:** `npm start`

### Environment Variables:
```
API_URL=https://tu-backend.railway.app
AUTH_API_URL=https://tu-backend.railway.app  
WS_URL=wss://tu-backend.railway.app/ws
```

## 🔧 Alternativa: Usar Root Directory

Si prefieres que Vercel trabaje directamente en `frontend-angular`:

1. En Vercel Dashboard → Project Settings → General
2. Cambiar **Root Directory** a: `frontend-angular`
3. Entonces los comandos serían:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend-angular/browser`
   - **Install Command:** `npm install`

## ✅ Verificación:

Después del despliegue, verifica:
- ✅ La aplicación carga correctamente
- ✅ Las rutas funcionan (SPA routing)
- ✅ Los assets se cargan (CSS, JS, imágenes)
- ✅ La conexión con el backend funciona

