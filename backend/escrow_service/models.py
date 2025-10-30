"""
ESCROW Service Models
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from shared.database import Base


class EscrowStatus(str, PyEnum):
    PENDING_AGREEMENT = "pending_agreement"
    PENDING_PAYMENT = "pending_payment"
    PAYMENT_RECEIVED = "payment_received"
    ITEM_SHIPPED = "item_shipped"
    ITEM_DELIVERED = "item_delivered"
    INSPECTION_PERIOD = "inspection_period"
    BUYER_APPROVED = "buyer_approved"
    SELLER_APPROVED = "seller_approved"
    FUNDS_RELEASED = "funds_released"
    TRANSACTION_COMPLETED = "transaction_completed"
    DISPUTED = "disputed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class ItemCategory(str, PyEnum):
    VEHICLE = "vehicle"
    MACHINERY = "machinery"
    ELECTRONICS = "electronics"
    REAL_ESTATE = "real_estate"
    JEWELRY = "jewelry"
    ART = "art"
    OTHER = "other"


class ItemCondition(str, PyEnum):
    NEW = "new"
    LIKE_NEW = "like_new"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class DeliveryMethod(str, PyEnum):
    PICKUP = "pickup"
    SHIPPING = "shipping"
    MEETUP = "meetup"
    OTHER = "other"


class PaymentMethod(str, PyEnum):
    BANK_TRANSFER = "bank_transfer"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    WIRE_TRANSFER = "wire_transfer"


class Currency(str, PyEnum):
    MXN = "MXN"
    USD = "USD"
    EUR = "EUR"


class EscrowTransaction(Base):
    __tablename__ = "escrow_transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(50), unique=True, index=True, nullable=False)
    
    # Parties involved
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    supervisor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Item information
    item_title = Column(String(200), nullable=False)
    item_description = Column(Text, nullable=False)
    item_category = Column(Enum(ItemCategory), nullable=False)
    item_condition = Column(Enum(ItemCondition), nullable=False)
    item_estimated_value = Column(Numeric(15, 2), nullable=False)
    item_images = Column(JSON, default=list)
    
    # Transaction terms
    price = Column(Numeric(15, 2), nullable=False)
    currency = Column(Enum(Currency), default=Currency.MXN, nullable=False)
    escrow_fee = Column(Numeric(15, 2), nullable=False)
    total_amount = Column(Numeric(15, 2), nullable=False)
    delivery_method = Column(Enum(DeliveryMethod), nullable=False)
    delivery_address = Column(JSON, nullable=True)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    inspection_period_days = Column(Integer, default=3, nullable=False)
    
    # Transaction status
    status = Column(Enum(EscrowStatus), default=EscrowStatus.PENDING_AGREEMENT, nullable=False)
    
    # Important dates
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    agreement_date = Column(DateTime(timezone=True), nullable=True)
    payment_date = Column(DateTime(timezone=True), nullable=True)
    shipping_date = Column(DateTime(timezone=True), nullable=True)
    delivery_date = Column(DateTime(timezone=True), nullable=True)
    inspection_start_date = Column(DateTime(timezone=True), nullable=True)
    inspection_end_date = Column(DateTime(timezone=True), nullable=True)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    
    # Payment information
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    payment_transaction_id = Column(String(100), nullable=True)
    payment_status = Column(String(20), default="pending")
    payment_processed_at = Column(DateTime(timezone=True), nullable=True)
    payment_refunded_at = Column(DateTime(timezone=True), nullable=True)
    
    # Evidence and documentation
    shipping_evidence = Column(JSON, default=dict)
    inspection_evidence = Column(JSON, default=dict)
    documents = Column(JSON, default=list)
    
    # Communication
    messages = Column(JSON, default=list)
    
    # Dispute information
    dispute_info = Column(JSON, default=dict)
    
    # Notification preferences
    notification_preferences = Column(JSON, default=dict)
    
    # Metadata
    source = Column(String(20), default="web")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # KYC/AML flags
    kyc_flags = Column(JSON, default=dict)
    
    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="escrow_transactions_as_buyer")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="escrow_transactions_as_seller")
    supervisor = relationship("User", foreign_keys=[supervisor_id])


class EscrowMessage(Base):
    __tablename__ = "escrow_messages"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("escrow_transactions.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    message = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False)
    attachments = Column(JSON, default=list)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transaction = relationship("EscrowTransaction")
    sender = relationship("User")


class EscrowDispute(Base):
    __tablename__ = "escrow_disputes"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("escrow_transactions.id"), nullable=False)
    initiated_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    reason = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="open")  # open, under_review, resolved, closed
    
    resolution = Column(Text, nullable=True)
    resolved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    transaction = relationship("EscrowTransaction")
    initiated_by = relationship("User", foreign_keys=[initiated_by_id])
    resolved_by = relationship("User", foreign_keys=[resolved_by_id])
