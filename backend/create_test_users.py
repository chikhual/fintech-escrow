#!/usr/bin/env python3
"""
Script para crear usuarios de prueba en la base de datos
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.database import SessionLocal, init_db
from shared.models import User, UserRole, UserStatus
from shared.auth import get_password_hash
from datetime import datetime

def create_test_users():
    """Crea los usuarios de prueba"""
    
    # Crear sesión de base de datos
    db = SessionLocal()
    
    try:
        # 1. SUPER USUARIO - Benjamin
        benjamin = db.query(User).filter(User.email == "ben@test.com").first()
        if not benjamin:
            benjamin = User(
                email="ben@test.com",
                first_name="Benjamin",
                last_name="Cervantes Vega",
                hashed_password=get_password_hash("Etuxad1$"),
                role=UserRole.SUPER_USER,
                status=UserStatus.ACTIVE,
                is_email_verified=True,
                is_phone_verified=True,
                is_identity_verified=True,
                is_kyc_verified=True,
                person_type="fisica",
                phone="5551234567"
            )
            db.add(benjamin)
            print("✅ Usuario SUPER_USER (Benjamin) creado")
        else:
            print("ℹ️ Usuario ben@test.com ya existe, actualizando...")
            benjamin.hashed_password = get_password_hash("Etuxad1$")
            benjamin.role = UserRole.SUPER_USER
            benjamin.status = UserStatus.ACTIVE
        
        # 2. CLIENT - Vendedor
        vendedor = db.query(User).filter(User.email == "vendedor@test.com").first()
        if not vendedor:
            vendedor = User(
                email="vendedor@test.com",
                first_name="Vendedor",
                last_name="Test",
                hashed_password=get_password_hash("Vendedor1$"),
                role=UserRole.CLIENT,
                status=UserStatus.FULLY_VERIFIED,
                is_email_verified=True,
                is_phone_verified=True,
                is_identity_verified=True,
                is_kyc_verified=True,
                person_type="fisica",
                phone="5551234568",
                usage_intent={"vender": True, "comprar": False, "ambos": False}
            )
            db.add(vendedor)
            print("✅ Usuario CLIENT (Vendedor) creado")
        else:
            print("ℹ️ Usuario vendedor@test.com ya existe, actualizando...")
            vendedor.hashed_password = get_password_hash("Vendedor1$")
            vendedor.role = UserRole.CLIENT
            vendedor.status = UserStatus.FULLY_VERIFIED
        
        # 3. ASESOR
        asesor = db.query(User).filter(User.email == "asesor@test.com").first()
        if not asesor:
            asesor = User(
                email="asesor@test.com",
                first_name="Asesor",
                last_name="CONSUFIN",
                hashed_password=get_password_hash("Asesor1$"),
                role=UserRole.ADVISOR,
                status=UserStatus.ACTIVE,
                is_email_verified=True,
                is_phone_verified=True,
                is_identity_verified=True,
                is_kyc_verified=True,
                person_type="fisica",
                phone="5551234569"
            )
            db.add(asesor)
            print("✅ Usuario ADVISOR (Asesor) creado")
        else:
            print("ℹ️ Usuario asesor@test.com ya existe, actualizando...")
            asesor.hashed_password = get_password_hash("Asesor1$")
            asesor.role = UserRole.ADVISOR
            asesor.status = UserStatus.ACTIVE
        
        # Guardar cambios
        db.commit()
        
        print("\n" + "="*50)
        print("✅ USUARIOS DE PRUEBA CREADOS EXITOSAMENTE")
        print("="*50)
        print("\n📋 RESUMEN:")
        print("\n1. SUPER USUARIO:")
        print("   Email: ben@test.com")
        print("   Password: Etuxad1$")
        print("   Rol: SUPER_USER")
        print("   Estado: ACTIVE")
        
        print("\n2. CLIENT (Vendedor):")
        print("   Email: vendedor@test.com")
        print("   Password: Vendedor1$")
        print("   Rol: CLIENT")
        print("   Estado: FULLY_VERIFIED")
        
        print("\n3. ASESOR:")
        print("   Email: asesor@test.com")
        print("   Password: Asesor1$")
        print("   Rol: ADVISOR")
        print("   Estado: ACTIVE")
        
        print("\n✅ Todos los usuarios están listos para usar!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error al crear usuarios: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Creando usuarios de prueba...")
    create_test_users()

