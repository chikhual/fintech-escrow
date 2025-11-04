# 🚀 DESPLIEGUE EN VERCEL

## ✅ Cambios Subidos a GitHub

✅ **Commit realizado:** `feat: Agregar acceso directo externo al portal de usuario (/portal)`
✅ **Push a GitHub:** `https://github.com/chikhual/fintech-escrow.git`
✅ **Rama:** `main`

---

## 📋 PASOS PARA DESPLEGAR EN VERCEL

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. **Ve a:** https://vercel.com/dashboard

2. **Si ya tienes el proyecto conectado:**
   - Vercel detectará automáticamente el nuevo push
   - Se iniciará un nuevo despliegue automáticamente
   - Espera a que termine el build

3. **Si NO tienes el proyecto conectado:**
   - Click en "Add New Project"
   - Selecciona el repositorio: `chikhual/fintech-escrow`
   - Configura:
     - **Framework Preset:** Angular
     - **Root Directory:** `frontend-angular`
     - **Build Command:** `npm run build` o `npm run vercel-build`
     - **Output Directory:** `dist/frontend-angular/browser`
     - **Install Command:** `npm install`
   - Click en "Deploy"

---

### Opción 2: Desde la Terminal (Vercel CLI)

1. **Instalar Vercel CLI (si no lo tienes):**
   ```bash
   npm install -g vercel
   ```

2. **Login en Vercel:**
   ```bash
   vercel login
   ```

3. **Desplegar desde el directorio del frontend:**
   ```bash
   cd frontend-angular
   vercel --prod
   ```

---

## 🔧 Configuración del Proyecto

### Variables de Entorno en Vercel

Agrega estas variables en Vercel Dashboard → Settings → Environment Variables:

```
API_URL=https://tu-backend-url.com
AUTH_API_URL=https://tu-backend-url.com/auth
ESCROW_API_URL=https://tu-backend-url.com/escrow
NOTIFICATION_API_URL=https://tu-backend-url.com/notifications
PAYMENT_API_URL=https://tu-backend-url.com/payment
```

---

## 📝 Archivos de Configuración

### vercel.json
Ya existe en la raíz del proyecto con configuración básica.

### frontend-angular/.vercelignore
Ya existe para excluir archivos innecesarios del despliegue.

---

## 🌐 URLs Después del Despliegue

Una vez desplegado, tu aplicación estará disponible en:

- **URL Principal:** `https://tu-proyecto.vercel.app`
- **Acceso Directo al Portal:** `https://tu-proyecto.vercel.app/portal`
- **Portal Usuario:** `https://tu-proyecto.vercel.app/consufin/usuario`

---

## ✅ Verificar Despliegue

1. **Ve a tu dashboard de Vercel**
2. **Revisa el estado del deployment**
3. **Abre la URL generada**
4. **Prueba el acceso directo:** `https://tu-proyecto.vercel.app/portal`

---

## 🆘 Si Hay Problemas

### Error de Build
- Verifica que `package.json` tenga el script `vercel-build`
- Revisa los logs en Vercel Dashboard
- Asegúrate de que todas las dependencias estén instaladas

### Error de Rutas (404)
- Verifica que `vercel.json` tenga la configuración de rewrites
- Angular necesita configuración especial para SPA

### Error de Variables de Entorno
- Verifica que todas las variables estén configuradas en Vercel
- Asegúrate de que los nombres coincidan con los del código

---

## 📌 Próximos Pasos

1. ✅ Cambios subidos a GitHub
2. ⏳ Desplegar en Vercel (Dashboard o CLI)
3. ⏳ Configurar variables de entorno
4. ⏳ Verificar que `/portal` funcione correctamente
5. ⏳ Probar todas las funcionalidades

---

¡Listo! Los cambios están en GitHub y listos para desplegar. 🚀
