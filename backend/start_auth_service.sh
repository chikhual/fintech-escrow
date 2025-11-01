#!/bin/bash

# Script para iniciar el servicio de autenticación

echo "🚀 Iniciando servicio de autenticación CONSUFIN..."

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 no está instalado. Por favor instálalo primero."
    exit 1
fi

# Ir al directorio del servicio
cd "$(dirname "$0")/auth_service"

# Verificar si existe un entorno virtual
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias
echo "📥 Instalando dependencias..."
pip install -q --upgrade pip
pip install -q fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose[cryptography] passlib[bcrypt] python-multipart

# Verificar conexión a base de datos
echo "🔍 Verificando conexión a base de datos..."

# Configurar variables de entorno si no existen
export DATABASE_URL=${DATABASE_URL:-"postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"}
export SECRET_KEY=${SECRET_KEY:-"your-super-secure-secret-key-change-in-production"}
export ALLOWED_ORIGINS=${ALLOWED_ORIGINS:-"http://localhost:4200,http://localhost:3000"}

echo "🌐 Servidor de autenticación iniciando en http://localhost:8001"
echo "📊 Documentación API: http://localhost:8001/docs"
echo ""
echo "⚠️  Asegúrate de que PostgreSQL esté corriendo en el puerto 5432"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Iniciar servidor
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

