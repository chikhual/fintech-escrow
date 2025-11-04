#!/bin/bash
# Test simple de login - Verificación básica

echo "🧪 TEST SIMPLE DE LOGIN Y PORTAL DE USUARIO"
echo "============================================"
echo ""

# Verificar que el frontend esté corriendo
echo "1. Verificando frontend..."
if curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo "   ✅ Frontend corriendo en puerto 4200"
else
    echo "   ❌ Frontend NO está corriendo"
    exit 1
fi

# Verificar página de login
echo ""
echo "2. Verificando página de login..."
if curl -s http://localhost:4200/consufin/registro | grep -qi "login\|registro\|email\|password" > /dev/null 2>&1; then
    echo "   ✅ Página de login accesible"
else
    echo "   ⚠️  Página de login puede no estar cargando correctamente"
fi

# Verificar backend Auth Service
echo ""
echo "3. Verificando backend Auth Service..."
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "   ✅ Auth Service corriendo en puerto 8001"
else
    echo "   ⚠️  Auth Service puede no estar corriendo (puerto 8001)"
fi

# Verificar backend ESCROW Service
echo ""
echo "4. Verificando backend ESCROW Service..."
if curl -s http://localhost:8002/health > /dev/null 2>&1; then
    echo "   ✅ ESCROW Service corriendo en puerto 8002"
else
    echo "   ⚠️  ESCROW Service puede no estar corriendo (puerto 8002)"
fi

# Verificar backend Notification Service
echo ""
echo "5. Verificando backend Notification Service..."
if curl -s http://localhost:8004/health > /dev/null 2>&1; then
    echo "   ✅ Notification Service corriendo en puerto 8004"
else
    echo "   ⚠️  Notification Service puede no estar corriendo (puerto 8004)"
fi

echo ""
echo "============================================"
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Abre tu navegador en: http://localhost:4200/consufin/registro"
echo "2. Ingresa las credenciales:"
echo "   Email: vendedor@test.com"
echo "   Password: Vendedor1$"
echo "3. Haz click en 'Iniciar Sesión'"
echo "4. Deberías ser redirigido a /consufin/usuario"
echo "5. Verifica todas las secciones del portal"
echo ""
echo "📖 Para guía completa, ver: test-login-manual.md"
echo "============================================"
