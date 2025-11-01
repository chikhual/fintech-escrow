# 📍 Dónde Encontrar "Root Directory" en Vercel

## ⚠️ IMPORTANTE: Estás en la configuración del EQUIPO, no del PROYECTO

La imagen muestra la página de **Settings del Equipo** (Team Settings), pero necesitas ir a la configuración del **PROYECTO**.

---

## 🔍 Pasos para encontrar Root Directory

### Paso 1: Salir de Team Settings

1. En la barra lateral izquierda, busca **"Projects"** o **"Proyectos"**
2. Click en **"Projects"**

### Paso 2: Seleccionar tu proyecto

1. Verás una lista de proyectos
2. Busca y click en: **`fintech-escrow`** (o el nombre que le diste)

### Paso 3: Ir a Settings del Proyecto

1. Una vez dentro del proyecto, busca en el menú superior:
   - **"Settings"** o **"Configuración"**
   - O un ícono de engranaje ⚙️

2. Click en **"Settings"**

### Paso 4: Buscar Root Directory

1. En el menú izquierdo de Settings, busca:
   - **"General"** 
   - O **"Build & Development Settings"**

2. En esa sección, verás una opción llamada:
   - **"Root Directory"**

3. Por defecto estará vacío o dirá: **`./`**

---

## 📝 Configuración Correcta

Una vez que encuentres "Root Directory":

1. Click en el campo de texto
2. Escribe: `frontend-angular`
3. Click en **"Save"** o **"Guardar"**

---

## 🖼️ Ubicación Visual

```
Vercel Dashboard
│
├── [Team Settings] ← Aquí estás ahora ❌
│   └── General (Team Name, Team URL, etc.)
│
└── Projects ← Necesitas ir aquí ✅
    └── fintech-escrow (tu proyecto)
        └── Settings
            └── General
                └── Root Directory ← AQUÍ ESTÁ
```

---

## 🔄 Alternativa: Durante el Import del Proyecto

Si aún no has importado el proyecto:

1. Ve a **"Add New..."** → **"Project"**
2. Selecciona tu repositorio
3. Durante la configuración inicial, verás **"Root Directory"**
4. Cambia a: `frontend-angular`

---

## ✅ Verificación

Después de configurar Root Directory:

1. Los comandos se ejecutarán desde `frontend-angular/`
2. `ng` estará disponible
3. El build debería funcionar correctamente

---

## 🆘 Si aún no lo encuentras

1. Ve directamente a: `https://vercel.com/[tu-team]/fintech-escrow/settings`
2. O busca en la URL: debe tener `/settings` o `/settings/general`
3. Revisa la sección **"Build & Development Settings"**

