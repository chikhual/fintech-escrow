# Guía de Despliegue en Vercel - CONSUFIN

## ✅ Estado Actual

**GitHub Repository:** `https://github.com/chikhual/fintech-escrow.git`

**Últimos Commits:**
- ✅ `3ab6676` - feat(consufin): reemplazar imagen por botón CALCULADORA y actualizar texto descriptivo
- ✅ `13f1308` - feat(auth): agregar tabs Login/Registro y funcionalidad de autenticación real
- ✅ `ba461eb` - feat(consufin): agregar sección de equipo en página principal
- ✅ `fd66163` - feat(consufin): agregar footer completo con logo, redes sociales y navegación

## 🚀 Despliegue en Vercel

### Opción 1: Despliegue Automático (Recomendado)

Si tu proyecto ya está conectado a Vercel:

1. **Verificar conexión:**
   - Ve a https://vercel.com/dashboard
   - Verifica que el proyecto `fintech-escrow` esté conectado a GitHub
   - Si no está conectado, sigue los pasos de la Opción 2

2. **Despliegue automático:**
   - Los cambios ya están en GitHub (branch `main`)
   - Vercel debería detectar automáticamente el nuevo commit
   - Si no se desplegó automáticamente:
     - Ve a tu proyecto en Vercel
     - Pestaña "Deployments"
     - Haz clic en "Redeploy" en el último deployment
     - Activa "Clear Build Cache" si es necesario
     - Click en "Redeploy"

### Opción 2: Conectar Proyecto por Primera Vez

1. **Accede a Vercel:**
   - Ve a https://vercel.com
   - Inicia sesión con tu cuenta (GitHub, GitLab, o Bitbucket)

2. **Importar proyecto:**
   - Click en "Add New..." → "Project"
   - Selecciona el repositorio `chikhual/fintech-escrow`
   - Click en "Import"

3. **Configuración del proyecto:**
   - **Framework Preset:** Angular
   - **Root Directory:** `frontend-angular`
   - **Build Command:** `npm run build` (o `npx ng build --configuration production`)
   - **Output Directory:** `dist/frontend-angular/browser`
   - **Install Command:** `npm install`

4. **Variables de Entorno:**
   Agrega estas variables en la configuración:
   ```
   NODE_ENV=production
   ```
   (Opcional: Si tienes variables específicas de API, agrégalas aquí)

5. **Deploy:**
   - Click en "Deploy"
   - Espera a que se complete el build
   - Tu sitio estará disponible en `https://tu-proyecto.vercel.app`

### Opción 3: Despliegue Manual con Vercel CLI

Si prefieres usar la CLI:

```bash
# Instalar Vercel CLI
npm i -g vercel

# En el directorio del frontend
cd frontend-angular

# Login
vercel login

# Desplegar
vercel --prod
```

## 📁 Configuración Actual

**Archivo `vercel.json`:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Esta configuración asegura que todas las rutas de Angular (SPA) funcionen correctamente.

## 🔍 Verificación Post-Despliegue

Una vez desplegado, verifica:

1. **Página principal:** `https://tu-proyecto.vercel.app/consufin`
2. **Login/Registro:** `https://tu-proyecto.vercel.app/consufin/registro`
3. **Botón Calculadora:** Click en "CALCULADORA" debe llevar a `/consufin/calculadora`
4. **Footer:** Debe mostrar correctamente con todas las secciones
5. **Sección Equipo:** Debe aparecer antes del footer
6. **Tabs Login/Registro:** Deben alternar correctamente

## 🛠️ Troubleshooting

### Error: Build Fails
- Verifica que `package.json` tenga todos los scripts necesarios
- Revisa los logs de build en Vercel para ver errores específicos
- Asegúrate de que todas las dependencias estén en `package.json`

### Error: 404 en Rutas
- Verifica que `vercel.json` tenga la configuración de rewrites
- Asegúrate de que el Output Directory sea `dist/frontend-angular/browser`

### Error: Variables de Entorno
- Verifica que las variables estén configuradas en Settings → Environment Variables
- Asegúrate de usar el formato correcto para producción

## 📝 Notas

- El despliegue automático se activa en cada push a `main`
- Los preview deployments se crean automáticamente en pull requests
- El cache de build se limpia automáticamente, pero puedes forzarlo manualmente

---

**Estado:** ✅ Todo listo para desplegar
**Última actualización:** Commit `3ab6676`

