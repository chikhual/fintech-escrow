"""
Shared database models for all microservices
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from .database import Base


class UserRole(str, PyEnum):
    ADMIN = "admin"
    ADVISOR = "advisor"
    SELLER = "seller"
    BUYER = "buyer"
    BROKER = "broker"


class UserStatus(str, PyEnum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING_VERIFICATION = "pending_verification"
    SUSPENDED = "suspended"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile information
    role = Column(Enum(UserRole), default=UserRole.BUYER, nullable=False)
    status = Column(Enum(UserStatus), default=UserStatus.PENDING_VERIFICATION, nullable=False)
    
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
    
    # Biometric data (for future implementation)
    biometric_data = Column(JSON)
    
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
    escrow_transactions_as_buyer = relationship("EscrowTransaction", foreign_keys="EscrowTransaction.buyer_id", back_populates="buyer")
    escrow_transactions_as_seller = relationship("EscrowTransaction", foreign_keys="EscrowTransaction.seller_id", back_populates="seller")
    documents = relationship("Document", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


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
    
    # Metadata
    metadata = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="documents")
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
    
    # Metadata
    metadata = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))
    
    # Relationships
    user = relationship("User", back_populates="notifications")
