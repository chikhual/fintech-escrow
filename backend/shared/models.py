"""
Shared database models for all microservices
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from .database import Base


class UserRole(str, PyEnum):
    # Usuarios públicos (registro abierto)
    CLIENT = "client"  # Puede ser Comprador, Vendedor o ambos
    BROKER = "broker"  # Broker profesional
    
    # Usuarios internos (solo por invitación)
    ADVISOR = "advisor"  # Asesor CONSUFIN
    CONSUFIN_USER = "consufin_user"  # Empleado administrativo
    SUPER_USER = "super_user"  # Administrador máximo
    
    # Mantener compatibilidad con roles antiguos
    ADMIN = "admin"  # Deprecated, usar SUPER_USER
    SELLER = "seller"  # Deprecated, usar CLIENT
    BUYER = "buyer"  # Deprecated, usar CLIENT


class UserStatus(str, PyEnum):
    # Estados de verificación progresivos
    PENDING_EMAIL = "pending_email"
    EMAIL_VERIFIED = "email_verified"
    PENDING_PHONE = "pending_phone"
    PHONE_VERIFIED = "phone_verified"
    PENDING_DOCUMENTS = "pending_documents"
    DOCUMENTS_SUBMITTED = "documents_submitted"
    UNDER_REVIEW = "under_review"
    PARTIALLY_VERIFIED = "partially_verified"  # Algunos docs aprobados
    FULLY_VERIFIED = "fully_verified"
    
    # Estados finales
    ACTIVE = "active"
    INACTIVE = "inactive"
    VERIFICATION_FAILED = "verification_failed"
    SUSPENDED = "suspended"
    
    # Mantener compatibilidad
    PENDING_VERIFICATION = "pending_verification"  # Deprecated, usar PENDING_EMAIL


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    role = Column(Enum(UserRole), default=UserRole.CLIENT, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_EMAIL, nullable=False)
    
    # Registration type and intent
    person_type = Column(String(20))  # "fisica" or "moral"
    usage_intent = Column(JSON)  # {"comprar": true, "vender": true, "ambos": true}
    birth_date = Column(DateTime(timezone=True))
    
    # Verification tokens and codes
    email_verification_token = Column(String(255), index=True)
    email_verification_token_expires = Column(DateTime(timezone=True))
    phone_verification_code = Column(String(10))
    phone_verification_code_expires = Column(DateTime(timezone=True))
    two_factor_secret = Column(String(255))  # For TOTP apps
    
    # GPS Location
    gps_latitude = Column(String(50))
    gps_longitude = Column(String(50))
    
    # TRUORA validation data
    truora_validation_data = Column(JSON)  # Store TRUORA API responses
    
    # Address
    address_street = Column(String(255))
    address_city = Column(String(100))
    address_state = Column(String(100))
    address_zip_code = Column(String(20))
    address_country = Column(String(100), default="México")
    
    # Verification
    is_email_verified = Column(Boolean, default=False)
    is_phone_verified = Column(Boolean, default=False)
    is_identity_verified = Column(Boolean, default=False)
    is_kyc_verified = Column(Boolean, default=False)
    
    # KYC/AML data
    curp = Column(String(18), unique=True, index=True)
    rfc = Column(String(13), unique=True, index=True)
    ine_number = Column(String(20), unique=True, index=True)
    
    # Financial information
    monthly_income = Column(Integer)
    credit_score = Column(Integer)
    employment_status = Column(String(50))
    
    # Broker-specific information (JSON fields for flexibility)
    broker_business_name = Column(String(255))  # Nombre comercial
    broker_business_rfc = Column(String(13))  # RFC de la empresa
    broker_business_type = Column(String(100))  # Giro comercial
    broker_years_experience = Column(Integer)
    broker_specialization = Column(String(100))  # Especialización
    broker_annual_volume = Column(Integer)  # Volumen anual promedio
    broker_licenses = Column(JSON)  # Array de licencias/certificaciones
    broker_references = Column(JSON)  # Referencias comerciales
    broker_insurance_policy_path = Column(String(500))  # Path a póliza de responsabilidad
    
    # Biometric data
    biometric_data = Column(JSON)
    selfie_verification_image = Column(String(500))  # Path to selfie
    selfie_verified_at = Column(DateTime(timezone=True))
    
    # Notification preferences
    notification_preferences = Column(JSON, default={
        "email": True,
        "sms": True,
        "push": True,
        "whatsapp": False
    })
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    # Note: EscrowTransaction relationships are defined in escrow_service/models.py
    # to avoid circular imports. These relationships are commented here but work
    # when both modules are loaded together.
    # escrow_transactions_as_buyer = relationship("EscrowTransaction", foreign_keys="EscrowTransaction.buyer_id", back_populates="buyer")
    # escrow_transactions_as_seller = relationship("EscrowTransaction", foreign_keys="EscrowTransaction.seller_id", back_populates="seller")
    documents = relationship("Document", foreign_keys="[Document.user_id]", back_populates="user")
    notifications = relationship("Notification", foreign_keys="[Notification.user_id]", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Document information
    document_type = Column(String(50), nullable=False)  # ine, curp, rfc, proof_of_income, etc.
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(100))
    
    # Verification status
    status = Column(String(20), default="pending")  # pending, approved, rejected
    verification_notes = Column(Text)
    verified_by = Column(Integer, ForeignKey("users.id"))
    verified_at = Column(DateTime(timezone=True))
    
    # Metadata (renamed to avoid SQLAlchemy reserved word conflict)
    document_metadata = Column("metadata", JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="documents")
    verifier = relationship("User", foreign_keys=[verified_by])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Notification content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)  # email, sms, push, whatsapp
    
    # Status
    is_read = Column(Boolean, default=False)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(DateTime(timezone=True))
    
    # Metadata (renamed to avoid SQLAlchemy reserved word conflict)
    notification_metadata = Column("metadata", JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="notifications")
