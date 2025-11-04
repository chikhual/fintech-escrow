# 🚀 PREPARACIÓN PARA DESPLIEGUE EN VERCEL

## ✅ CHECKLIST PRE-DESPLIEGUE

### 1. Configuración de Archivos ✅

- ✅ `vercel.json` - Configurado correctamente
- ✅ `package.json` - Con engines Node.js 20.x
- ✅ `.nvmrc` - Node.js 20 especificado
- ✅ `environment.prod.ts` - Listo para variables de entorno
- ✅ Rutas de Angular configuradas
- ✅ Build command configurado

### 2. Configuración de Vercel

#### Paso 1: Variables de Entorno

En el Dashboard de Vercel, ve a **Settings → Environment Variables** y configura:

```
NODE_ENV=production
```

**Opcional (si tienes backend desplegado):**
```
VITE_API_URL=https://tu-backend.railway.app
VITE_AUTH_API_URL=https://tu-backend.railway.app/auth
VITE_ESCROW_API_URL=https://tu-backend.railway.app/escrow
```

#### Paso 2: Configuración del Proyecto

En **Settings → General**:

1. **Framework Preset:** Angular (o detectar automáticamente)
2. **Root Directory:** `frontend-angular` ⚠️ IMPORTANTE
3. **Build Command:** `npm run build` (ya configurado en vercel.json)
4. **Output Directory:** `dist/frontend-angular/browser` (ya configurado en vercel.json)
5. **Install Command:** `npm ci` (ya configurado en vercel.json)

### 3. Verificación de Build Local

Antes de desplegar, verifica que el build funciona localmente:

```bash
cd frontend-angular
npm ci
npm run build
```

Si el build es exitoso, estás listo para Vercel.

---

## 📋 CONFIGURACIÓN ACTUAL

### vercel.json
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend-angular/browser",
  "installCommand": "NODE_ENV=development npm ci",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### package.json - engines
```json
{
  "engines": {
    "node": "20.x",
    "npm": ">=10.0.0"
  }
}
```

### .nvmrc
```
20
```

---

## 🚀 PASOS PARA DESPLEGAR

### Opción 1: Desde Dashboard (Recomendado)

1. **Ve a:** https://vercel.com/dashboard
2. **Click en:** "Add New Project" (o selecciona proyecto existente)
3. **Conecta:** `chikhual/fintech-escrow` desde GitHub
4. **Configura:**
   - Root Directory: `frontend-angular`
   - Framework: Angular (auto-detect)
   - Build Command: `npm run build` (ya en vercel.json)
   - Output Directory: `dist/frontend-angular/browser` (ya en vercel.json)
5. **Click en:** "Deploy"
6. **Espera:** 2-5 minutos para el build

### Opción 2: Desde CLI

```bash
cd frontend-angular
npx vercel login
npx vercel --prod
```

---

## 🔍 VERIFICACIÓN POST-DESPLIEGUE

Una vez desplegado, verifica estas URLs:

### URLs Principales:
- ✅ `https://tu-proyecto.vercel.app/consufin` - Página principal
- ✅ `https://tu-proyecto.vercel.app/consufin/marketplace` - Marketplace
- ✅ `https://tu-proyecto.vercel.app/user-portal` - Portal Usuario
- ✅ `https://tu-proyecto.vercel.app/broker-portal` - Portal Broker

### Verificaciones:
1. ✅ Páginas cargan sin errores
2. ✅ No hay errores en consola del navegador
3. ✅ Navegación funciona correctamente
4. ✅ Rutas SPA funcionan (refresh de página)
5. ✅ Imágenes y assets se cargan correctamente

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: Build Failed

**Causa común:** Node.js versión incorrecta
**Solución:** Verifica que `engines` en `package.json` especifique Node 20.x

### Error: Output Directory not found

**Causa común:** Ruta incorrecta en vercel.json
**Solución:** Verifica que `outputDirectory` sea `dist/frontend-angular/browser`

### Error: Module not found

**Causa común:** devDependencies no instaladas
**Solución:** `installCommand` ya incluye `NODE_ENV=development` para instalar devDependencies

---

## 📝 NOTAS IMPORTANTES

- **Root Directory:** DEBE ser `frontend-angular` (no el root del repo)
- **Build Cache:** Vercel usa cache automáticamente para builds más rápidos
- **Preview Deployments:** Cada push crea una preview URL automáticamente
- **Custom Domain:** Puedes configurar dominio personalizado después del despliegue

---

## ✅ ESTADO ACTUAL

- ✅ Configuración lista para Vercel
- ✅ Build command correcto
- ✅ Output directory correcto
- ✅ Node.js version especificada
- ✅ Rewrites para SPA configurados
- ✅ Código respaldado en GitHub

**¡Todo está listo para desplegar! 🚀**

