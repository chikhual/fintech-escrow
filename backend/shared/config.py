"""
Configuration settings for FinTech ESCROW Platform
"""
import os
from typing import List, Dict, Any
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-super-secure-secret-key-here")
    bcrypt_rounds: int = int(os.getenv("BCRYPT_ROUNDS", "12"))
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    refresh_token_expire_days: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # CORS
    allowed_origins: List[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:4200,http://localhost:3000").split(",")
    
    # Stripe
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_publishable_key: str = os.getenv("STRIPE_PUBLISHABLE_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    # Twilio
    twilio_account_sid: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    twilio_auth_token: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    twilio_phone_number: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    
    # SendGrid
    sendgrid_api_key: str = os.getenv("SENDGRID_API_KEY", "")
    from_email: str = os.getenv("FROM_EMAIL", "noreply@fintech-escrow.com")
    
    # Firebase
    firebase_credentials_path: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    
    # Truora
    truora_api_key: str = os.getenv("TRUORA_API_KEY", "")
    truora_base_url: str = os.getenv("TRUORA_BASE_URL", "https://api.truora.com")
    
    # File Upload
    upload_path: str = os.getenv("UPLOAD_PATH", "./uploads")
    max_file_size: int = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB
    allowed_file_types: List[str] = os.getenv("ALLOWED_FILE_TYPES", "jpg,jpeg,png,pdf,doc,docx").split(",")
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    log_format: str = os.getenv("LOG_FORMAT", "json")
    
    # Monitoring
    sentry_dsn: str = os.getenv("SENTRY_DSN", "")
    prometheus_enabled: bool = os.getenv("PROMETHEUS_ENABLED", "true").lower() == "true"
    
    # Development
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # Session Management
    session_timeout_minutes: int = int(os.getenv("SESSION_TIMEOUT_MINUTES", "60"))
    max_sessions_per_user: int = int(os.getenv("MAX_SESSIONS_PER_USER", "5"))
    
    # Critical Notifications
    notification_retention_days: int = int(os.getenv("NOTIFICATION_RETENTION_DAYS", "30"))
    critical_notification_timeout_hours: int = int(os.getenv("CRITICAL_NOTIFICATION_TIMEOUT_HOURS", "24"))
    
    # Compliance
    kyc_required_amount_threshold: float = float(os.getenv("KYC_REQUIRED_AMOUNT_THRESHOLD", "10000.0"))
    dual_approval_required_amount_threshold: float = float(os.getenv("DUAL_APPROVAL_REQUIRED_AMOUNT_THRESHOLD", "50000.0"))
    
    # ESCROW
    escrow_fee_percentage: float = float(os.getenv("ESCROW_FEE_PERCENTAGE", "2.5"))
    default_inspection_period_days: int = int(os.getenv("DEFAULT_INSPECTION_PERIOD_DAYS", "3"))
    max_inspection_period_days: int = int(os.getenv("MAX_INSPECTION_PERIOD_DAYS", "30"))
    transaction_expiry_days: int = int(os.getenv("TRANSACTION_EXPIRY_DAYS", "30"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Business rules configuration
BUSINESS_RULES = {
    "user_roles": {
        "admin": {
            "permissions": ["all"],
            "kyc_required": False,
            "dual_approval_required": False
        },
        "advisor": {
            "permissions": ["view_all", "manage_disputes", "approve_transactions"],
            "kyc_required": True,
            "dual_approval_required": False
        },
        "seller": {
            "permissions": ["create_transactions", "manage_own_transactions"],
            "kyc_required": True,
            "dual_approval_required": True
        },
        "buyer": {
            "permissions": ["create_transactions", "manage_own_transactions"],
            "kyc_required": True,
            "dual_approval_required": True
        },
        "broker": {
            "permissions": ["facilitate_transactions", "view_own_transactions"],
            "kyc_required": True,
            "dual_approval_required": False
        }
    },
    "transaction_statuses": {
        "pending_agreement": {
            "allowed_operations": ["accept", "cancel"],
            "requires_notification": True,
            "critical": False
        },
        "pending_payment": {
            "allowed_operations": ["pay", "cancel"],
            "requires_notification": True,
            "critical": False
        },
        "payment_received": {
            "allowed_operations": ["ship"],
            "requires_notification": True,
            "critical": True
        },
        "item_shipped": {
            "allowed_operations": ["deliver"],
            "requires_notification": True,
            "critical": False
        },
        "item_delivered": {
            "allowed_operations": ["approve", "dispute"],
            "requires_notification": True,
            "critical": False
        },
        "inspection_period": {
            "allowed_operations": ["approve", "dispute"],
            "requires_notification": True,
            "critical": False
        },
        "buyer_approved": {
            "allowed_operations": ["seller_approve"],
            "requires_notification": True,
            "critical": True
        },
        "funds_released": {
            "allowed_operations": [],
            "requires_notification": True,
            "critical": True
        },
        "transaction_completed": {
            "allowed_operations": [],
            "requires_notification": True,
            "critical": False
        },
        "disputed": {
            "allowed_operations": ["resolve", "escalate"],
            "requires_notification": True,
            "critical": True
        },
        "cancelled": {
            "allowed_operations": [],
            "requires_notification": True,
            "critical": False
        },
        "expired": {
            "allowed_operations": [],
            "requires_notification": True,
            "critical": False
        }
    },
    "kyc_requirements": {
        "personal_documents": ["INE", "CURP", "RFC"],
        "address_documents": ["Proof of Address"],
        "financial_documents": ["Bank Statement", "Proof of Income"],
        "business_documents": ["Business Registration", "Tax Compliance Certificate"]
    },
    "notification_channels": {
        "critical": ["email", "sms", "push", "websocket"],
        "important": ["email", "push", "websocket"],
        "normal": ["email", "websocket"],
        "low": ["websocket"]
    },
    "audit_requirements": {
        "sensitive_operations": [
            "create_transaction",
            "process_payment",
            "release_funds",
            "create_dispute",
            "resolve_dispute"
        ],
        "compliance_checks": [
            "kyc_verification",
            "dual_approval",
            "escrow_flow_validation",
            "amount_thresholds"
        ]
    }
}

# Validation rules
VALIDATION_RULES = {
    "email": {
        "pattern": r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        "max_length": 255
    },
    "phone": {
        "pattern": r"^\+?[1-9]\d{1,14}$",
        "max_length": 20
    },
    "curp": {
        "pattern": r"^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9]{2}$",
        "length": 18
    },
    "rfc": {
        "pattern": r"^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$",
        "min_length": 10,
        "max_length": 13
    },
    "ine_number": {
        "pattern": r"^[0-9]{18}$",
        "length": 18
    },
    "password": {
        "min_length": 8,
        "require_uppercase": True,
        "require_lowercase": True,
        "require_digits": True,
        "require_special_chars": False
    },
    "transaction_amount": {
        "min_amount": 100.0,
        "max_amount": 1000000.0
    }
}

# Error messages
ERROR_MESSAGES = {
    "validation": {
        "required_field": "This field is required",
        "invalid_email": "Please enter a valid email address",
        "invalid_phone": "Please enter a valid phone number",
        "invalid_curp": "Please enter a valid CURP",
        "invalid_rfc": "Please enter a valid RFC",
        "invalid_ine": "Please enter a valid INE number",
        "password_too_short": "Password must be at least 8 characters long",
        "password_requirements": "Password must contain uppercase, lowercase, and digits",
        "amount_too_low": "Amount must be at least $100",
        "amount_too_high": "Amount cannot exceed $1,000,000"
    },
    "business": {
        "insufficient_permissions": "You don't have permission to perform this action",
        "kyc_required": "KYC verification is required for this operation",
        "dual_approval_required": "This operation requires approval from both parties",
        "invalid_transaction_status": "This operation is not allowed for the current transaction status",
        "transaction_not_found": "Transaction not found",
        "user_not_found": "User not found",
        "duplicate_task": "A similar task already exists",
        "task_already_completed": "This task has already been completed"
    },
    "system": {
        "internal_error": "An internal error occurred. Please try again later",
        "service_unavailable": "Service temporarily unavailable",
        "rate_limit_exceeded": "Too many requests. Please try again later",
        "session_expired": "Your session has expired. Please log in again",
        "maintenance_mode": "System is under maintenance. Please try again later"
    }
}

# Success messages
SUCCESS_MESSAGES = {
    "task_created": "Task created successfully",
    "task_updated": "Task updated successfully",
    "task_completed": "Task completed successfully",
    "notification_sent": "Notification sent successfully",
    "notification_confirmed": "Notification confirmed successfully",
    "notification_rejected": "Notification rejected successfully",
    "document_generated": "Document generated successfully",
    "validation_passed": "Validation passed successfully",
    "operation_completed": "Operation completed successfully"
}
