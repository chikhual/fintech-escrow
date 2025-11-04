#!/bin/bash
# Script para iniciar el backend Auth Service

cd /Users/benjmincervantesvega/fintech/backend/auth_service

# Configurar variables de entorno
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
export DATABASE_URL="postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow"
export SECRET_KEY="dev-secret-key-change-in-production"
export ALLOWED_ORIGINS="http://localhost:4200"
export PYTHONPATH="/Users/benjmincervantesvega/fintech/backend:$PYTHONPATH"

echo "🚀 Iniciando Auth Service..."
echo "DATABASE_URL: $DATABASE_URL"
echo "Puerto: 8001"
echo ""
echo "Presiona CTRL+C para detener"
echo ""

# Iniciar servicio
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

