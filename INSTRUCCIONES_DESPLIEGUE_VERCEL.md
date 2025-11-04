# 🚀 INSTRUCCIONES PARA DESPLEGAR EN VERCEL

## ✅ PASO 1: Verificar GitHub

✅ **Cambios subidos a GitHub:**
- Repositorio: `https://github.com/chikhual/fintech-escrow.git`
- Rama: `main`
- Último commit: `feat: Agregar acceso directo externo al portal de usuario (/portal)`

---

## 📋 PASO 2: Desplegar en Vercel

### Opción A: Dashboard de Vercel (Recomendado - Más Fácil)

1. **Abre tu navegador y ve a:**
   ```
   https://vercel.com/dashboard
   ```

2. **Si ya tienes el proyecto conectado:**
   - Vercel detectará automáticamente el nuevo push
   - Verás un nuevo deployment en proceso
   - Espera 2-5 minutos a que termine

3. **Si NO tienes el proyecto conectado:**
   
   a. **Click en "Add New Project"**
   
   b. **Conecta GitHub:**
      - Selecciona: `chikhual/fintech-escrow`
      - Click en "Import"
   
   c. **Configura el proyecto:**
      - **Framework Preset:** Angular (o detectar automáticamente)
      - **Root Directory:** `frontend-angular` ⚠️ IMPORTANTE
      - **Build Command:** `npm run build` (dejar por defecto)
      - **Output Directory:** `dist/frontend-angular/browser` (dejar por defecto)
      - **Install Command:** `npm ci` (dejar por defecto)
   
   d. **Environment Variables (opcional por ahora):**
      - Puedes agregarlas después en Settings
      - O dejarlas para configurar más tarde
   
   e. **Click en "Deploy"**

---

### Opción B: Vercel CLI (Desde Terminal)

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Navegar al directorio del frontend:**
   ```bash
   cd frontend-angular
   ```

4. **Desplegar:**
   ```bash
   vercel --prod
   ```
   
   Sigue las instrucciones:
   - ¿Set up and deploy? → **Y**
   - ¿Which scope? → Tu cuenta
   - ¿Link to existing project? → **N** (primera vez) o **Y** (si ya existe)
   - ¿Project name? → `fintech-escrow` (o el que prefieras)
   - ¿Directory? → `./` (por defecto)
   - ¿Override settings? → **N**

---

## 🌐 PASO 3: Verificar el Despliegue

Una vez terminado el despliegue, verás una URL como:
```
https://fintech-escrow.vercel.app
```

### URLs Disponibles:

- **URL Principal:** `https://tu-proyecto.vercel.app`
- **Acceso Directo al Portal:** `https://tu-proyecto.vercel.app/portal` ⭐
- **Portal Usuario:** `https://tu-proyecto.vercel.app/consufin/usuario`
- **Login:** `https://tu-proyecto.vercel.app/consufin/registro`

---

## 🔧 PASO 4: Configurar Variables de Entorno (Opcional)

Si tu backend está desplegado, configura estas variables:

1. **Ve a:** Vercel Dashboard → Tu Proyecto → Settings → Environment Variables

2. **Agrega estas variables:**

```
API_URL=https://tu-backend.railway.app
AUTH_API_URL=https://tu-backend.railway.app/auth
ESCROW_API_URL=https://tu-backend.railway.app/escrow
NOTIFICATION_API_URL=https://tu-backend.railway.app/notifications
PAYMENT_API_URL=https://tu-backend.railway.app/payment
```

3. **Selecciona:** Production, Preview, Development (o solo Production)

4. **Haz un nuevo deployment** para aplicar los cambios

---

## ✅ PASO 5: Probar el Acceso Directo

1. **Abre en tu navegador:**
   ```
   https://tu-proyecto.vercel.app/portal
   ```

2. **Deberías ver:**
   - ✅ Dashboard del portal de usuario
   - ✅ Sidebar de navegación
   - ✅ Todas las secciones accesibles

---

## 🆘 Solución de Problemas

### Error: "Build failed"
**Solución:**
- Revisa los logs en Vercel Dashboard
- Verifica que `Root Directory` esté configurado como `frontend-angular`
- Asegúrate de que `package.json` tenga el script `build`

### Error: "404 Not Found" en rutas
**Solución:**
- Verifica que `vercel.json` tenga los rewrites configurados
- Asegúrate de que `outputDirectory` sea correcto
- Angular necesita configuración especial para SPA

### Error: Variables de entorno no funcionan
**Solución:**
- Verifica que las variables estén en el formato correcto
- Asegúrate de hacer un nuevo deployment después de agregar variables
- Verifica que los nombres coincidan con los del código

---

## 📝 Resumen

✅ **GitHub:** Cambios subidos
⏳ **Vercel:** Pendiente de desplegar
📋 **Siguiente paso:** Ve a https://vercel.com/dashboard y despliega

---

## 🎯 URL Final del Acceso Directo

Una vez desplegado, tu URL será:
```
https://tu-proyecto.vercel.app/portal
```

¡Esta es la URL que compartirás para acceso directo! 🚀

