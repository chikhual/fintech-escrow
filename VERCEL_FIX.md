# 🔧 SOLUCIÓN: Error "ng: command not found" en Vercel

## Problema

Vercel está ejecutando el build desde la raíz del repositorio en lugar de desde `frontend-angular/`, por lo que no encuentra el comando `ng`.

## Solución

**IMPORTANTE:** Debes configurar el **Root Directory** en Vercel Dashboard.

### Paso 1: Configurar Root Directory en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **General**
3. Busca la sección **"Root Directory"**
4. Cambia a: `frontend-angular`
5. Click en **Save**

### Paso 2: Configuración de Build

Con Root Directory configurado como `frontend-angular`, los comandos serán:

- **Build Command:** `npm run build`
- **Output Directory:** `dist/frontend-angular/browser`
- **Install Command:** `npm install`

### Paso 3: Actualizar vercel.json (opcional)

Si prefieres que el `vercel.json` funcione sin Root Directory, el archivo ya está actualizado para usar paths relativos desde `frontend-angular/`.

## Configuración Manual en Dashboard

Si el `vercel.json` no se detecta automáticamente:

```
Framework Preset: Other
Root Directory: frontend-angular
Build Command: npm run build
Output Directory: dist/frontend-angular/browser
Install Command: npm install
```

## Verificación

Después de cambiar el Root Directory:

1. Haz click en **"Redeploy"** en el último deployment
2. O espera al próximo commit para que se despliegue automáticamente
3. Verifica los logs del build - deberían mostrar que está ejecutándose desde `frontend-angular/`

## Error Anterior

```
sh: line 1: ng: command not found
Error: Command "npm run build -- --configuration production" exited with 127
```

Esto ocurría porque:
- Vercel ejecutaba `npm install` en la raíz
- El `ng` estaba en `frontend-angular/node_modules/.bin/ng`
- Pero el build se ejecutaba desde la raíz donde `ng` no estaba disponible

## Solución Aplicada

1. ✅ Actualizado `vercel.json` para usar paths relativos
2. ✅ Documentación de configuración en este archivo
3. ⚠️ **NECESARIO:** Configurar Root Directory en Vercel Dashboard

