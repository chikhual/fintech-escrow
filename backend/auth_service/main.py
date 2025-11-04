"""
Authentication Microservice
Handles user registration, login, verification, and token management
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os

from shared.database import get_db, init_db
from shared.models import User, UserStatus, Document
from shared.schemas import (
    UserCreate, UserResponse, UserLogin, Token, UserUpdate,
    SuccessResponse, ErrorResponse
)
from shared.auth import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, get_current_user, require_verification
)
from shared.notifications import (
    send_verification_email, send_welcome_notification
)
from .verification import router as verification_router

# Initialize FastAPI app
app = FastAPI(
    title="FinTech ESCROW - Auth Service",
    description="Authentication and user management microservice",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:4200").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()  # Ya descomentado - inicializar tablas automáticamente

# Include routers
app.include_router(verification_router)


@app.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if CURP is unique (if provided)
    if user_data.curp:
        existing_curp = db.query(User).filter(User.curp == user_data.curp).first()
        if existing_curp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CURP already registered"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    # Generate email verification token
    import secrets
    email_token = secrets.token_urlsafe(32)
    email_token_expires = datetime.utcnow() + timedelta(hours=24)
    
    db_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role=user_data.role or UserRole.CLIENT,
        hashed_password=hashed_password,
        curp=user_data.curp,
        rfc=user_data.rfc,
        ine_number=user_data.ine_number,
        status=UserStatus.PENDING_EMAIL,
        
        # Registration fields
        person_type=user_data.person_type,
        usage_intent=user_data.usage_intent or {},
        birth_date=user_data.birth_date,
        
        # Address
        address_street=user_data.address_street,
        address_city=user_data.address_city,
        address_state=user_data.address_state,
        address_zip_code=user_data.address_zip_code,
        address_country=user_data.address_country,
        
        # GPS
        gps_latitude=user_data.gps_latitude,
        gps_longitude=user_data.gps_longitude,
        
        # Broker-specific fields (if role is BROKER)
        broker_business_name=user_data.broker_business_name if user_data.role == UserRole.BROKER else None,
        broker_business_rfc=user_data.broker_business_rfc if user_data.role == UserRole.BROKER else None,
        broker_business_type=user_data.broker_business_type if user_data.role == UserRole.BROKER else None,
        broker_years_experience=user_data.broker_years_experience if user_data.role == UserRole.BROKER else None,
        broker_specialization=user_data.broker_specialization if user_data.role == UserRole.BROKER else None,
        broker_annual_volume=user_data.broker_annual_volume if user_data.role == UserRole.BROKER else None,
        broker_licenses=user_data.broker_licenses if user_data.role == UserRole.BROKER else None,
        broker_references=user_data.broker_references if user_data.role == UserRole.BROKER else None,
        
        # Verification tokens
        email_verification_token=email_token,
        email_verification_token_expires=email_token_expires
    )
    
    # TODO: PARA PRUEBAS - Suspender validación de email
    # Automáticamente marcar email como verificado
    db_user.is_email_verified = True
    db_user.email_verification_token = None
    db_user.email_verification_token_expires = None
    db_user.status = UserStatus.EMAIL_VERIFIED
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # TODO: PARA PRUEBAS - Comentar envío de email de verificación
    # Send verification email with token
    # await send_verification_email(db, db_user, email_token)
    # Send welcome notification
    await send_welcome_notification(db, db_user)
    
    return db_user


@app.post("/login", response_model=Token)
async def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user and return tokens"""
    # Find user by email
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # TODO: PARA PRUEBAS - Suspender validación de email
    # Permitir login incluso con PENDING_EMAIL status
    # Check if user is active - allow login for users in verification process
    user_status = user.status.value if hasattr(user.status, 'value') else str(user.status)
    # Permitir todos los estados excepto SUSPENDED, INACTIVE, VERIFICATION_FAILED
    blocked_statuses = [UserStatus.SUSPENDED.value, UserStatus.INACTIVE.value, UserStatus.VERIFICATION_FAILED.value]
    if user_status in blocked_statuses:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User account is blocked. Current status: {user_status}."
        )
    
    # TODO: Implement 2FA verification
    if login_data.two_factor_code:
        # Verify 2FA code
        pass
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=30 * 60,  # 30 minutes
        refresh_token=refresh_token
    )


@app.post("/refresh", response_model=Token)
async def refresh_token(
    request: dict,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    from shared.auth import verify_token, create_access_token, create_refresh_token
    
    refresh_token_value = request.get("refresh_token")
    if not refresh_token_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )
    
    # Verify refresh token
    try:
        token_data = verify_token(refresh_token_value, token_type="refresh")
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Get user from database
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is active
    user_status = user.status.value if hasattr(user.status, 'value') else str(user.status)
    blocked_statuses = [UserStatus.SUSPENDED.value, UserStatus.INACTIVE.value, UserStatus.VERIFICATION_FAILED.value]
    if user_status in blocked_statuses:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User account is blocked. Current status: {user_status}."
        )
    
    # Create new tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )
    new_refresh_token = create_refresh_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=30 * 60,  # 30 minutes
        refresh_token=new_refresh_token
    )


@app.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user


@app.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Update user fields
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return current_user


@app.post("/verify-email", response_model=SuccessResponse)
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify user email with token"""
    user = db.query(User).filter(
        User.email_verification_token == token,
        User.email_verification_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    # Mark email as verified
    user.is_email_verified = True
    user.email_verification_token = None
    user.email_verification_token_expires = None
    
    # Update status based on current state
    if user.status == UserStatus.PENDING_EMAIL:
        user.status = UserStatus.EMAIL_VERIFIED
        # Move to phone verification if phone is provided
        if user.phone:
            user.status = UserStatus.PENDING_PHONE
    
    db.commit()
    
    return {"success": True, "message": "Email verified successfully"}


@app.post("/resend-verification", response_model=SuccessResponse)
async def resend_verification(
    email: str,
    db: Session = Depends(get_db)
):
    """Resend verification email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate new token if expired or missing
    if not user.email_verification_token or user.email_verification_token_expires < datetime.utcnow():
        import secrets
        user.email_verification_token = secrets.token_urlsafe(32)
        user.email_verification_token_expires = datetime.utcnow() + timedelta(hours=24)
        db.commit()
    
    # Send verification email
    await send_verification_email(db, user, user.email_verification_token)
    
    return {"success": True, "message": "Verification email sent"}


@app.post("/forgot-password")
async def forgot_password(
    email: str,
    db: Session = Depends(get_db)
):
    """Send password reset email"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # TODO: Send password reset email
    return SuccessResponse(
        success=True,
        message="Password reset email sent"
    )


@app.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    # TODO: Implement password reset logic
    pass


@app.post("/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    current_user.updated_at = datetime.utcnow()
    db.commit()
    
    return SuccessResponse(
        success=True,
        message="Password changed successfully"
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "auth-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
