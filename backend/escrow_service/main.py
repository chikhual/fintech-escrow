"""
ESCROW Microservice
Handles all ESCROW transaction logic, state management, and dispute resolution
"""
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional
import os
import uuid

from shared.database import get_db, init_db
from shared.models import User
from shared.auth import get_current_user, require_verification, require_roles, UserRole
from shared.audit_middleware import AuditMiddleware, ComplianceValidator, CriticalNotificationManager
from shared.session_manager import SessionManager
from .models import EscrowTransaction, EscrowMessage, EscrowDispute, EscrowStatus
from .schemas import (
    EscrowTransactionCreate, EscrowTransactionResponse, EscrowTransactionUpdate,
    EscrowMessageCreate, EscrowMessageResponse, EscrowDisputeCreate,
    EscrowDisputeResponse, PaymentInfo, ShippingEvidence, InspectionEvidence,
    EscrowStats
)

# Initialize FastAPI app
app = FastAPI(
    title="FinTech ESCROW - ESCROW Service",
    description="ESCROW transaction management microservice",
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

# Audit middleware
app.add_middleware(AuditMiddleware, service_name="escrow-service")

# Initialize database
init_db()


def calculate_escrow_fee(price: Decimal) -> Decimal:
    """Calculate ESCROW fee (2.5% of price)"""
    return (price * Decimal('0.025')).quantize(Decimal('0.01'))


def generate_transaction_id() -> str:
    """Generate unique transaction ID"""
    return f"ESC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"


@app.post("/transactions", response_model=EscrowTransactionResponse)
async def create_transaction(
    transaction_data: EscrowTransactionCreate,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Create a new ESCROW transaction"""
    # Verify seller exists and is verified
    seller = db.query(User).filter(User.id == transaction_data.seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )
    
    if not seller.is_identity_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seller must be identity verified"
        )
    
    # Don't allow self-transactions
    if transaction_data.seller_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create transaction with yourself"
        )
    
    # Calculate fees
    escrow_fee = calculate_escrow_fee(transaction_data.terms.price)
    total_amount = transaction_data.terms.price + escrow_fee
    
    # Create transaction
    db_transaction = EscrowTransaction(
        transaction_id=generate_transaction_id(),
        buyer_id=current_user.id,
        seller_id=transaction_data.seller_id,
        item_title=transaction_data.item.title,
        item_description=transaction_data.item.description,
        item_category=transaction_data.item.category,
        item_condition=transaction_data.item.condition,
        item_estimated_value=transaction_data.item.estimated_value,
        item_images=transaction_data.item.images or [],
        price=transaction_data.terms.price,
        currency=transaction_data.terms.currency,
        escrow_fee=escrow_fee,
        total_amount=total_amount,
        delivery_method=transaction_data.terms.delivery_method,
        delivery_address=transaction_data.terms.delivery_address,
        inspection_period_days=transaction_data.terms.inspection_period_days,
        status=EscrowStatus.PENDING_AGREEMENT,
        expiry_date=datetime.utcnow() + timedelta(days=30)
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # TODO: Send notification to seller
    # TODO: Create audit log
    
    return db_transaction


@app.get("/transactions", response_model=List[EscrowTransactionResponse])
async def get_transactions(
    status: Optional[EscrowStatus] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's ESCROW transactions with filtering and pagination"""
    query = db.query(EscrowTransaction).filter(
        or_(
            EscrowTransaction.buyer_id == current_user.id,
            EscrowTransaction.seller_id == current_user.id
        )
    )
    
    # Apply filters
    if status:
        query = query.filter(EscrowTransaction.status == status)
    if category:
        query = query.filter(EscrowTransaction.item_category == category)
    
    # Pagination
    offset = (page - 1) * limit
    transactions = query.offset(offset).limit(limit).all()
    
    return transactions


@app.get("/transactions/{transaction_id}", response_model=EscrowTransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific ESCROW transaction"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check permissions
    if (transaction.buyer_id != current_user.id and 
        transaction.seller_id != current_user.id and 
        current_user.role not in [UserRole.ADMIN, UserRole.ADVISOR]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return transaction


@app.put("/transactions/{transaction_id}/accept")
async def accept_transaction(
    transaction_id: int,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Accept transaction terms (seller)"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can accept transaction"
        )
    
    if transaction.status != EscrowStatus.PENDING_AGREEMENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction is not pending agreement"
        )
    
    # Update status
    transaction.status = EscrowStatus.PENDING_PAYMENT
    transaction.agreement_date = datetime.utcnow()
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": "Transaction terms accepted. Waiting for payment.",
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": False
    }
    transaction.messages.append(message)
    
    db.commit()
    
    # TODO: Send notification to buyer
    # TODO: Create audit log
    
    return {"success": True, "message": "Transaction accepted"}


@app.put("/transactions/{transaction_id}/pay")
async def process_payment(
    transaction_id: int,
    payment_info: PaymentInfo,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Process payment (buyer)"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyer can process payment"
        )
    
    if transaction.status != EscrowStatus.PENDING_PAYMENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction is not pending payment"
        )
    
    # TODO: Integrate with Stripe for actual payment processing
    # For now, simulate successful payment
    
    # Update transaction
    transaction.status = EscrowStatus.PAYMENT_RECEIVED
    transaction.payment_date = datetime.utcnow()
    transaction.payment_method = payment_info.payment_method
    transaction.payment_status = "completed"
    transaction.payment_processed_at = datetime.utcnow()
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": f"Payment processed successfully via {payment_info.payment_method.value}",
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": False
    }
    transaction.messages.append(message)
    
    db.commit()
    
    # TODO: Send notification to seller
    # TODO: Create audit log
    
    return {"success": True, "message": "Payment processed successfully"}


@app.put("/transactions/{transaction_id}/ship")
async def mark_item_shipped(
    transaction_id: int,
    shipping_evidence: ShippingEvidence,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Mark item as shipped (seller)"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can mark item as shipped"
        )
    
    if transaction.status != EscrowStatus.PAYMENT_RECEIVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment must be received before shipping"
        )
    
    # Update transaction
    transaction.status = EscrowStatus.ITEM_SHIPPED
    transaction.shipping_date = datetime.utcnow()
    transaction.shipping_evidence = shipping_evidence.dict()
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": f"Item shipped. Tracking: {shipping_evidence.tracking_number or 'N/A'}",
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": False
    }
    transaction.messages.append(message)
    
    db.commit()
    
    # TODO: Send notification to buyer
    # TODO: Create audit log
    
    return {"success": True, "message": "Item marked as shipped"}


@app.put("/transactions/{transaction_id}/deliver")
async def mark_item_delivered(
    transaction_id: int,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Mark item as delivered (buyer)"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyer can mark item as delivered"
        )
    
    if transaction.status != EscrowStatus.ITEM_SHIPPED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item must be shipped before delivery confirmation"
        )
    
    # Update transaction
    transaction.status = EscrowStatus.INSPECTION_PERIOD
    transaction.delivery_date = datetime.utcnow()
    transaction.inspection_start_date = datetime.utcnow()
    transaction.inspection_end_date = datetime.utcnow() + timedelta(days=transaction.inspection_period_days)
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": "Item received. Inspection period started.",
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": False
    }
    transaction.messages.append(message)
    
    db.commit()
    
    # TODO: Send notification to seller
    # TODO: Create audit log
    
    return {"success": True, "message": "Item marked as delivered. Inspection period started."}


@app.put("/transactions/{transaction_id}/approve")
async def approve_transaction(
    transaction_id: int,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Approve transaction (buyer)"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    if transaction.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyer can approve transaction"
        )
    
    if transaction.status != EscrowStatus.INSPECTION_PERIOD:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction must be in inspection period"
        )
    
    # Update transaction
    transaction.status = EscrowStatus.BUYER_APPROVED
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": "Transaction approved. Funds will be released to seller.",
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": False
    }
    transaction.messages.append(message)
    
    # Check if seller also approved (for mutual approval)
    if transaction.seller_approved_at:
        transaction.status = EscrowStatus.FUNDS_RELEASED
        transaction.completion_date = datetime.utcnow()
    
    db.commit()
    
    # TODO: Release funds to seller
    # TODO: Send notification to seller
    # TODO: Create audit log
    
    return {"success": True, "message": "Transaction approved"}


@app.post("/transactions/{transaction_id}/messages")
async def add_message(
    transaction_id: int,
    message_data: EscrowMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add message to transaction"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check permissions
    if (transaction.buyer_id != current_user.id and 
        transaction.seller_id != current_user.id and 
        current_user.role not in [UserRole.ADMIN, UserRole.ADVISOR]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": message_data.message,
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": message_data.is_internal,
        "attachments": message_data.attachments or []
    }
    transaction.messages.append(message)
    
    db.commit()
    
    # TODO: Send real-time notification
    # TODO: Create audit log
    
    return {"success": True, "message": "Message added"}


@app.post("/transactions/{transaction_id}/dispute")
async def create_dispute(
    transaction_id: int,
    dispute_data: EscrowDisputeCreate,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Create dispute for transaction"""
    transaction = db.query(EscrowTransaction).filter(
        EscrowTransaction.id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check permissions
    if (transaction.buyer_id != current_user.id and 
        transaction.seller_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only transaction parties can create disputes"
        )
    
    # Check if dispute already exists
    if transaction.dispute_info.get("is_disputed"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dispute already exists for this transaction"
        )
    
    # Create dispute
    dispute = EscrowDispute(
        transaction_id=transaction_id,
        initiated_by_id=current_user.id,
        reason=dispute_data.reason,
        description=dispute_data.description
    )
    
    db.add(dispute)
    
    # Update transaction
    transaction.status = EscrowStatus.DISPUTED
    transaction.dispute_info = {
        "is_disputed": True,
        "dispute_id": dispute.id,
        "initiated_by": current_user.id,
        "reason": dispute_data.reason,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Add message
    message = {
        "sender_id": current_user.id,
        "message": f"Dispute created: {dispute_data.reason}",
        "timestamp": datetime.utcnow().isoformat(),
        "is_internal": False
    }
    transaction.messages.append(message)
    
    db.commit()
    
    # TODO: Send notification to admin
    # TODO: Create audit log
    
    return {"success": True, "message": "Dispute created"}


@app.get("/stats", response_model=EscrowStats)
async def get_escrow_stats(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Get ESCROW statistics (admin/advisor only)"""
    # TODO: Implement comprehensive statistics
    return EscrowStats(
        total_transactions=0,
        total_value=Decimal('0'),
        total_fees=Decimal('0'),
        active_transactions=0,
        completed_transactions=0,
        disputed_transactions=0,
        status_breakdown={},
        category_breakdown={}
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "escrow-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
