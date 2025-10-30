"""
ESCROW Service Pydantic Schemas
"""
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from .models import EscrowStatus, ItemCategory, ItemCondition, DeliveryMethod, PaymentMethod, Currency


class ItemInfo(BaseModel):
    title: str
    description: str
    category: ItemCategory
    condition: ItemCondition
    estimated_value: Decimal
    images: Optional[List[str]] = []


class TransactionTerms(BaseModel):
    price: Decimal
    currency: Currency = Currency.MXN
    delivery_method: DeliveryMethod
    delivery_address: Optional[Dict[str, Any]] = None
    inspection_period_days: int = 3

    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        if v < 100:
            raise ValueError('Price must be at least 100')
        return v

    @validator('inspection_period_days')
    def validate_inspection_period(cls, v):
        if v < 1 or v > 30:
            raise ValueError('Inspection period must be between 1 and 30 days')
        return v


class EscrowTransactionCreate(BaseModel):
    seller_id: int
    item: ItemInfo
    terms: TransactionTerms


class EscrowTransactionUpdate(BaseModel):
    status: Optional[EscrowStatus] = None
    delivery_address: Optional[Dict[str, Any]] = None
    inspection_period_days: Optional[int] = None


class EscrowTransactionResponse(BaseModel):
    id: int
    transaction_id: str
    buyer_id: int
    seller_id: int
    supervisor_id: Optional[int] = None
    
    # Item information
    item_title: str
    item_description: str
    item_category: ItemCategory
    item_condition: ItemCondition
    item_estimated_value: Decimal
    item_images: List[str]
    
    # Transaction terms
    price: Decimal
    currency: Currency
    escrow_fee: Decimal
    total_amount: Decimal
    delivery_method: DeliveryMethod
    delivery_address: Optional[Dict[str, Any]] = None
    delivery_date: Optional[datetime] = None
    inspection_period_days: int
    
    # Status and dates
    status: EscrowStatus
    created_at: datetime
    agreement_date: Optional[datetime] = None
    payment_date: Optional[datetime] = None
    shipping_date: Optional[datetime] = None
    inspection_start_date: Optional[datetime] = None
    inspection_end_date: Optional[datetime] = None
    completion_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    
    # Payment info
    payment_method: Optional[PaymentMethod] = None
    payment_status: str
    payment_processed_at: Optional[datetime] = None
    
    # Evidence
    shipping_evidence: Dict[str, Any]
    inspection_evidence: Dict[str, Any]
    documents: List[Dict[str, Any]]
    
    # Communication
    messages: List[Dict[str, Any]]
    
    # Dispute
    dispute_info: Dict[str, Any]
    
    class Config:
        from_attributes = True


class EscrowMessageCreate(BaseModel):
    message: str
    is_internal: bool = False
    attachments: Optional[List[Dict[str, Any]]] = []


class EscrowMessageResponse(BaseModel):
    id: int
    transaction_id: int
    sender_id: int
    message: str
    is_internal: bool
    attachments: List[Dict[str, Any]]
    created_at: datetime
    
    class Config:
        from_attributes = True


class EscrowDisputeCreate(BaseModel):
    reason: str
    description: str


class EscrowDisputeResponse(BaseModel):
    id: int
    transaction_id: int
    initiated_by_id: int
    reason: str
    description: str
    status: str
    resolution: Optional[str] = None
    resolved_by_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class PaymentInfo(BaseModel):
    payment_method: PaymentMethod
    amount: Decimal
    currency: Currency = Currency.MXN
    bank_details: Optional[Dict[str, Any]] = None


class ShippingEvidence(BaseModel):
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    shipping_date: Optional[datetime] = None
    delivery_confirmation: Optional[str] = None
    photos: Optional[List[str]] = []


class InspectionEvidence(BaseModel):
    buyer_photos: Optional[List[str]] = []
    buyer_notes: Optional[str] = None
    seller_photos: Optional[List[str]] = []
    seller_notes: Optional[str] = None
    inspection_report: Optional[str] = None


class EscrowStats(BaseModel):
    total_transactions: int
    total_value: Decimal
    total_fees: Decimal
    active_transactions: int
    completed_transactions: int
    disputed_transactions: int
    status_breakdown: Dict[str, int]
    category_breakdown: Dict[str, int]
