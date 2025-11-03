#!/bin/bash

echo "🔍 VERIFICANDO BACKEND..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar PostgreSQL
echo "1️⃣ Verificando PostgreSQL..."
if pg_isready -q; then
    echo -e "${GREEN}✅ PostgreSQL está corriendo${NC}"
else
    echo -e "${RED}❌ PostgreSQL NO está corriendo${NC}"
    echo "   Inicia PostgreSQL con: brew services start postgresql (macOS)"
    exit 1
fi

# 2. Verificar usuario y base de datos
echo ""
echo "2️⃣ Verificando usuario y base de datos..."
if psql -U fintech_user -d fintech_escrow -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Usuario 'fintech_user' y base de datos 'fintech_escrow' existen${NC}"
else
    echo -e "${YELLOW}⚠️  Usuario o base de datos no existen${NC}"
    echo "   Ejecuta: psql -U postgres -f setup_database.sql"
fi

# 3. Verificar dependencias de Python
echo ""
echo "3️⃣ Verificando dependencias de Python..."
if python3 -c "import email_validator" 2>/dev/null; then
    echo -e "${GREEN}✅ email-validator está instalado${NC}"
else
    echo -e "${RED}❌ email-validator NO está instalado${NC}"
    echo "   Instala con: pip install 'pydantic[email]'"
fi

# 4. Verificar que el servidor esté corriendo
echo ""
echo "4️⃣ Verificando servidor en puerto 8001..."
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está corriendo en http://localhost:8001${NC}"
    
    # Probar endpoint de health
    RESPONSE=$(curl -s http://localhost:8001/health)
    echo "   Respuesta: $RESPONSE"
else
    echo -e "${RED}❌ Backend NO está corriendo${NC}"
    echo "   Inicia con:"
    echo "   cd backend/auth_service"
    echo "   export DATABASE_URL=\"postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow\""
    echo "   export SECRET_KEY=\"dev-secret-key-change-in-production\""
    echo "   export ALLOWED_ORIGINS=\"http://localhost:4200\""
    echo "   export PYTHONPATH=\"/Users/benjmincervantesvega/fintech/backend:\$PYTHONPATH\""
    echo "   python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
fi

# 5. Verificar usuarios en base de datos
echo ""
echo "5️⃣ Verificando usuarios de prueba..."
if psql -U fintech_user -d fintech_escrow -t -c "SELECT COUNT(*) FROM users WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com');" 2>/dev/null | grep -q "3"; then
    echo -e "${GREEN}✅ Usuarios de prueba encontrados${NC}"
    psql -U fintech_user -d fintech_escrow -c "SELECT email, role, status FROM users WHERE email IN ('ben@test.com', 'vendedor@test.com', 'asesor@test.com');" 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Usuarios de prueba no encontrados${NC}"
    echo "   Ejecuta: psql -U fintech_user -d fintech_escrow -f insert_test_users.sql"
fi

echo ""
echo "✅ Verificación completada"

