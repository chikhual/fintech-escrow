#!/bin/bash
echo "🔍 VERIFICACIÓN DE POSTGRESQL"
echo "=============================="
echo ""

# Paso 1: Verificar si psql está instalado
echo "PASO 1: Verificando si PostgreSQL está instalado..."
if command -v psql &> /dev/null; then
    PSQL_PATH=$(which psql)
    echo "✅ PostgreSQL encontrado en: $PSQL_PATH"
    psql --version
else
    echo "❌ PostgreSQL NO está instalado"
    echo ""
    echo "Necesitas instalarlo. Opciones:"
    echo "  A) Con Homebrew: brew install postgresql@15"
    echo "  B) Con Docker: docker-compose up -d postgres"
    exit 1
fi

echo ""
echo "PASO 2: Verificando si PostgreSQL está corriendo..."
if pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "✅ PostgreSQL está corriendo en localhost:5432"
else
    echo "❌ PostgreSQL NO está corriendo"
    echo ""
    echo "Para iniciarlo:"
    echo "  - Homebrew: brew services start postgresql@15"
    echo "  - Docker: cd backend && docker-compose up -d postgres"
    exit 1
fi

echo ""
echo "PASO 3: Verificando conexión a la base de datos..."
if psql -U fintech_user -d fintech_escrow -h localhost -c "SELECT 1;" &> /dev/null; then
    echo "✅ Conexión a fintech_escrow funciona"
else
    echo "⚠️  No se pudo conectar con usuario fintech_user"
    echo "   Intentando con usuario postgres..."
    if psql -U postgres -c "SELECT 1;" &> /dev/null; then
        echo "✅ Conexión con postgres funciona"
        echo ""
        echo "Necesitas crear el usuario y base de datos:"
        echo "  psql -U postgres"
        echo "  CREATE USER fintech_user WITH PASSWORD 'fintech_pass';"
        echo "  CREATE DATABASE fintech_escrow OWNER fintech_user;"
        echo "  GRANT ALL PRIVILEGES ON DATABASE fintech_escrow TO fintech_user;"
    else
        echo "❌ No se puede conectar a PostgreSQL"
        exit 1
    fi
fi

echo ""
echo "=============================="
echo "✅ PostgreSQL está configurado correctamente"
echo ""
echo "Próximo paso: Ver CONECTAR_POSTGRESQL_PASO_A_PASO.md"
