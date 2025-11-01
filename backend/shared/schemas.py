"""
Pydantic schemas for request/response validation
"""
import re
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from .models import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.CLIENT


class UserCreate(UserBase):
    password: str
    curp: Optional[str] = None
    rfc: Optional[str] = None
    ine_number: Optional[str] = None
    
    # Registration fields
    person_type: Optional[str] = None  # "fisica" or "moral"
    usage_intent: Optional[Dict[str, bool]] = None  # {"comprar": true, "vender": true, "ambos": true}
    birth_date: Optional[datetime] = None
    
    # Address fields
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip_code: Optional[str] = None
    address_country: Optional[str] = "México"
    address_neighborhood: Optional[str] = None
    address_municipality: Optional[str] = None
    
    # GPS
    gps_latitude: Optional[str] = None
    gps_longitude: Optional[str] = None
    
    # Broker-specific fields
    broker_business_name: Optional[str] = None
    broker_business_rfc: Optional[str] = None
    broker_business_type: Optional[str] = None
    broker_years_experience: Optional[int] = None
    broker_specialization: Optional[str] = None
    broker_annual_volume: Optional[int] = None
    broker_licenses: Optional[List[Dict[str, Any]]] = None
    broker_references: Optional[List[Dict[str, str]]] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        # Special character validation
        special_chars = "!@#$%^&*(),.?\":{}|<>"
        if not any(c in special_chars for c in v):
            raise ValueError('Password must contain at least one special character')
        return v
    
    @validator('curp')
    def validate_curp(cls, v):
        if v and not re.match(r'^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$', v.upper()):
            raise ValueError('CURP format is invalid')
        return v.upper() if v else v
    
    @validator('rfc')
    def validate_rfc(cls, v):
        if v and not re.match(r'^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$', v.upper()):
            raise ValueError('RFC format is invalid')
        return v.upper() if v else v


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip_code: Optional[str] = None
    address_country: Optional[str] = None
    monthly_income: Optional[int] = None
    employment_status: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    id: int
    status: UserStatus
    is_email_verified: bool
    is_phone_verified: bool
    is_identity_verified: bool
    is_kyc_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    two_factor_code: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    refresh_token: Optional[str] = None


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None


class DocumentBase(BaseModel):
    document_type: str
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    status: str
    verification_notes: Optional[str] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str
    metadata: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    is_sent: bool
    sent_at: Optional[datetime] = None
    created_at: datetime
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None


class SuccessResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
