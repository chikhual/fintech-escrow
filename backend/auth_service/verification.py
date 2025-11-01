"""
Additional verification endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from typing import Optional
from pydantic import BaseModel

from shared.database import get_db
from shared.models import User, UserStatus, Document
from shared.schemas import SuccessResponse
from shared.auth import get_current_user
from shared.notifications import (
    send_phone_verification_code,
    send_verification_status_update,
    send_kyc_completion_notification
)

router = APIRouter(prefix="/verification", tags=["verification"])


@router.post("/send-phone-code", response_model=SuccessResponse)
async def send_phone_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send phone verification code via SMS"""
    if not current_user.phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not provided"
        )
    
    # Generate 6-digit code
    code = str(secrets.randbelow(900000) + 100000)
    
    # Store code
    current_user.phone_verification_code = code
    current_user.phone_verification_code_expires = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    
    # Send SMS
    await send_phone_verification_code(db, current_user, code)
    
    return {"success": True, "message": "Verification code sent to your phone"}


class PhoneVerificationRequest(BaseModel):
    code: str

@router.post("/verify-phone")
async def verify_phone_code(
    request: PhoneVerificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify phone with code"""
    if not current_user.phone_verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No verification code found. Please request a new code."
        )
    
    if current_user.phone_verification_code_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification code has expired. Please request a new code."
        )
    
    if current_user.phone_verification_code != request.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code"
        )
    
    # Mark phone as verified
    current_user.is_phone_verified = True
    current_user.phone_verification_code = None
    current_user.phone_verification_code_expires = None
    
    # Update status
    if current_user.status == UserStatus.PENDING_PHONE:
        current_user.status = UserStatus.PHONE_VERIFIED
        # If documents are submitted, move to review
        docs_count = db.query(Document).filter(Document.user_id == current_user.id).count()
        if docs_count > 0:
            current_user.status = UserStatus.DOCUMENTS_SUBMITTED
    
    db.commit()
    
    return {"success": True, "message": "Phone verified successfully"}


@router.get("/status")
async def get_verification_status(
    current_user: User = Depends(get_current_user)
):
    """Get current verification status"""
    return {
        "email_verified": current_user.is_email_verified,
        "phone_verified": current_user.is_phone_verified,
        "identity_verified": current_user.is_identity_verified,
        "kyc_verified": current_user.is_kyc_verified,
        "status": current_user.status.value,
        "verification_progress": calculate_verification_progress(current_user)
    }


def calculate_verification_progress(user: User) -> dict:
    """Calculate verification progress percentage"""
    steps = {
        "email": user.is_email_verified,
        "phone": user.is_phone_verified,
        "documents": user.is_identity_verified,
        "kyc": user.is_kyc_verified
    }
    
    completed = sum(1 for v in steps.values() if v)
    total = len(steps)
    percentage = int((completed / total) * 100)
    
    return {
        "percentage": percentage,
        "completed_steps": completed,
        "total_steps": total,
        "steps": steps
    }


@router.post("/document/{document_id}/approve", response_model=SuccessResponse)
async def approve_document(
    document_id: int,
    notes: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a document (only for advisors/admins)"""
    # TODO: Check if current_user has permission (ADVISOR, CONSUFIN_USER, SUPER_USER)
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document.status = "approved"
    document.verified_by = current_user.id
    document.verified_at = datetime.utcnow()
    document.verification_notes = notes
    
    # Check if all required documents are approved
    user = document.user
    all_docs = db.query(Document).filter(Document.user_id == user.id).all()
    approved_count = sum(1 for d in all_docs if d.status == "approved")
    
    if approved_count == len(all_docs) and len(all_docs) > 0:
        user.is_identity_verified = True
        user.status = UserStatus.FULLY_VERIFIED
        # Send completion notification
        await send_kyc_completion_notification(db, user)
    
    db.commit()
    
    # Send notification to user
    await send_verification_status_update(db, user, document.document_type, "approved")
    
    return {"success": True, "message": "Document approved successfully"}


@router.post("/document/{document_id}/reject", response_model=SuccessResponse)
async def reject_document(
    document_id: int,
    notes: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a document (only for advisors/admins)"""
    # TODO: Check if current_user has permission
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document.status = "rejected"
    document.verified_by = current_user.id
    document.verified_at = datetime.utcnow()
    document.verification_notes = notes
    
    user = document.user
    user.status = UserStatus.VERIFICATION_FAILED
    
    db.commit()
    
    # Send notification to user
    await send_verification_status_update(db, user, document.document_type, "rejected")
    
    return {"success": True, "message": "Document rejected"}

