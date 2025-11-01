# 🚀 Guía Completa de Configuración de Vercel

## 📋 Pre-requisitos

1. ✅ Cuenta de Vercel (https://vercel.com)
2. ✅ Repositorio en GitHub: `chikhual/fintech-escrow`
3. ✅ Build local funcionando correctamente

---

## 🔧 Configuración Paso a Paso

### Paso 1: Conectar Repositorio en Vercel

1. Ve a https://vercel.com y inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Selecciona el repositorio: **`chikhual/fintech-escrow`**
4. Click en **"Import"**

### Paso 2: Configurar Framework y Root Directory

En la página de configuración del proyecto:

#### Opción A: Usando vercel.json (Recomendado)

Vercel debería detectar automáticamente el archivo `vercel.json` en la raíz.

**Settings que Vercel detectará:**
- **Root Directory:** Se configurará automáticamente en `frontend-angular`
- **Build Command:** `cd frontend-angular && npm ci && npm run build`
- **Output Directory:** `frontend-angular/dist/frontend-angular/browser`
- **Install Command:** `cd frontend-angular && npm ci`

#### Opción B: Configuración Manual

Si prefieres configurar manualmente:

1. **Framework Preset:** `Other` (o deja en blanco)
2. **Root Directory:** `frontend-angular`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist/frontend-angular/browser`
5. **Install Command:** `npm install`

### Paso 3: Variables de Entorno

En **"Environment Variables"**, agrega:

#### Variables Requeridas (cuando tengas el backend):

```bash
API_URL=https://tu-backend.railway.app
AUTH_API_URL=https://tu-backend.railway.app
WS_URL=wss://tu-backend.railway.app/ws
```

#### Variables Opcionales:

```bash
# Para desarrollo
NODE_ENV=production

# Si usas analytics
ANALYTICS_ID=tu-id
```

**⚠️ IMPORTANTE:** 
- Marca todas las variables para **Production**, **Preview**, y **Development**
- Si no tienes el backend aún, puedes dejar valores por defecto

### Paso 4: Configuración Avanzada

#### Build Settings

1. Ve a **Settings** → **General**
2. En **Build & Development Settings**:
   - **Node.js Version:** `18.x` o superior (recomendado)
   - **Install Command:** `npm ci` (más rápido y confiable)
   - **Build Command:** `npm run build`
   - **Development Command:** `npm start`
   - **Output Directory:** `dist/frontend-angular/browser`

#### Ignored Build Step

Si no quieres que se despliegue en cada commit:

```
git diff HEAD^ HEAD --quiet . frontend-angular/
```

---

## 🎯 Configuración Recomendada Final

### En Vercel Dashboard:

```
┌─────────────────────────────────────────┐
│ Framework Preset: Other                  │
│ Root Directory: frontend-angular        │
│ Build Command: npm run build            │
│ Output Directory: dist/frontend-angular │
│                                          │
│ Environment Variables:                   │
│   API_URL=https://tu-backend.railway.app│
│   AUTH_API_URL=https://tu-backend...    │
│   WS_URL=wss://tu-backend.railway.app...│
└─────────────────────────────────────────┘
```

---

## ✅ Verificación

### Después del Deploy:

1. ✅ Verifica que la aplicación carga correctamente
2. ✅ Prueba las rutas (SPA routing)
3. ✅ Verifica que los assets se cargan (CSS, JS, imágenes)
4. ✅ Revisa la consola del navegador por errores
5. ✅ Prueba la conexión con el backend (cuando esté disponible)

### Comandos de Verificación:

```bash
# Ver logs del deploy
vercel logs

# Ver detalles del proyecto
vercel inspect

# Redeploy manual
vercel --prod
```

---

## 🔄 Workflow de Desarrollo

### Para Desarrollo:

```bash
# Desarrollo local
cd frontend-angular
npm start

# Build local
npm run build

# Preview en Vercel
vercel
```

### Para Producción:

```bash
# Deploy a producción
vercel --prod

# O simplemente hacer push a main branch
git push origin main
# Vercel detectará automáticamente y desplegará
```

---

## 🐛 Troubleshooting

### Error: "ng: command not found"

**Solución:** Asegúrate de que `Root Directory` esté configurado como `frontend-angular`

### Error: "Cannot find module"

**Solución:** Verifica que `Install Command` sea `npm install` o `npm ci`

### Error: "Output directory not found"

**Solución:** Verifica que `Output Directory` sea `dist/frontend-angular/browser`

### Build exitoso pero página en blanco

**Solución:** 
1. Verifica que `vercel.json` tenga el rewrite correcto
2. Verifica las variables de entorno
3. Revisa los logs de Vercel

### Variables de entorno no funcionan

**Solución:**
- En Angular, las variables de entorno se reemplazan en tiempo de build
- Asegúrate de que las variables estén marcadas para todos los ambientes
- Puede ser necesario hacer un redeploy después de agregar variables

---

## 📝 Notas Importantes

1. **Angular Build:** El build de producción optimiza automáticamente el código
2. **SPA Routing:** El `vercel.json` ya está configurado para manejar rutas SPA
3. **Cache:** Vercel cachea el build, usa `npm ci` para builds más rápidos
4. **Limitaciones:** El bundle es de ~524KB, hay un warning pero no es crítico

---

## 🔗 Enlaces Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Documentación Vercel:** https://vercel.com/docs
- **Angular Deployment:** https://angular.io/guide/deployment
- **Repositorio GitHub:** https://github.com/chikhual/fintech-escrow

---

## ✨ Próximos Pasos

1. ✅ Configura el proyecto en Vercel siguiendo esta guía
2. 🔄 Despliega el backend en Railway
3. 🔗 Actualiza las variables de entorno con las URLs reales del backend
4. 🎉 ¡Tu aplicación estará en producción!

