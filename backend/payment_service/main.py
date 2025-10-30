"""
Payment Microservice
Handles payment processing, Stripe integration, and financial transactions
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from decimal import Decimal
from typing import Optional
import os
import stripe

from shared.database import get_db, init_db
from shared.models import User
from shared.auth import get_current_user, require_verification, require_roles, UserRole
from shared.schemas import SuccessResponse, ErrorResponse

# Initialize FastAPI app
app = FastAPI(
    title="FinTech ESCROW - Payment Service",
    description="Payment processing and financial transaction microservice",
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

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Initialize database
init_db()


class PaymentIntentCreate:
    amount: int
    currency: str
    metadata: dict
    payment_method_types: list = ["card"]


class PaymentIntentResponse:
    client_secret: str
    payment_intent_id: str
    amount: int
    currency: str
    status: str


@app.post("/create-payment-intent")
async def create_payment_intent(
    amount: int,
    currency: str = "mxn",
    transaction_id: Optional[str] = None,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Create a Stripe Payment Intent"""
    try:
        # Convert amount to cents
        amount_cents = int(amount * 100)
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency=currency,
            metadata={
                "user_id": str(current_user.id),
                "user_email": current_user.email,
                "transaction_id": transaction_id or "",
                "service": "fintech_escrow"
            },
            payment_method_types=["card"],
            capture_method="manual"  # Manual capture for ESCROW
        )
        
        return PaymentIntentResponse(
            client_secret=intent.client_secret,
            payment_intent_id=intent.id,
            amount=amount_cents,
            currency=currency,
            status=intent.status
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment creation failed: {str(e)}"
        )


@app.post("/confirm-payment")
async def confirm_payment(
    payment_intent_id: str,
    current_user: User = Depends(require_verification),
    db: Session = Depends(get_db)
):
    """Confirm a payment intent"""
    try:
        # Retrieve payment intent
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Verify user owns this payment
        if intent.metadata.get("user_id") != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Payment does not belong to user"
            )
        
        # Confirm the payment
        confirmed_intent = stripe.PaymentIntent.confirm(payment_intent_id)
        
        return {
            "success": True,
            "payment_intent_id": confirmed_intent.id,
            "status": confirmed_intent.status,
            "amount": confirmed_intent.amount,
            "currency": confirmed_intent.currency
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment confirmation failed: {str(e)}"
        )


@app.post("/capture-payment")
async def capture_payment(
    payment_intent_id: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Capture a payment (release funds to seller)"""
    try:
        # Retrieve payment intent
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Capture the payment
        captured_intent = stripe.PaymentIntent.capture(payment_intent_id)
        
        # TODO: Update transaction status in ESCROW service
        # TODO: Send notification to seller
        # TODO: Create audit log
        
        return {
            "success": True,
            "payment_intent_id": captured_intent.id,
            "status": captured_intent.status,
            "amount": captured_intent.amount,
            "currency": captured_intent.currency
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment capture failed: {str(e)}"
        )


@app.post("/refund-payment")
async def refund_payment(
    payment_intent_id: str,
    amount: Optional[int] = None,
    reason: str = "requested_by_customer",
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Refund a payment"""
    try:
        # Retrieve payment intent
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Create refund
        refund = stripe.Refund.create(
            payment_intent=payment_intent_id,
            amount=amount,  # If None, full refund
            reason=reason
        )
        
        # TODO: Update transaction status in ESCROW service
        # TODO: Send notification to buyer
        # TODO: Create audit log
        
        return {
            "success": True,
            "refund_id": refund.id,
            "amount": refund.amount,
            "status": refund.status,
            "reason": refund.reason
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refund failed: {str(e)}"
        )


@app.get("/payment-methods")
async def get_payment_methods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved payment methods"""
    try:
        # TODO: Implement customer payment methods retrieval
        # This would require creating Stripe customers and storing customer IDs
        
        return {
            "payment_methods": [],
            "message": "Payment methods feature coming soon"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve payment methods: {str(e)}"
        )


@app.get("/transactions")
async def get_payment_transactions(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's payment transaction history"""
    try:
        # TODO: Implement payment transaction history
        # This would require storing payment records in the database
        
        return {
            "transactions": [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": 0
            },
            "message": "Transaction history feature coming soon"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve transactions: {str(e)}"
        )


@app.post("/webhook")
async def stripe_webhook(request: dict):
    """Handle Stripe webhooks"""
    try:
        # TODO: Implement webhook signature verification
        # TODO: Handle different webhook events
        # TODO: Update transaction statuses based on payment events
        
        event_type = request.get("type")
        
        if event_type == "payment_intent.succeeded":
            # Handle successful payment
            pass
        elif event_type == "payment_intent.payment_failed":
            # Handle failed payment
            pass
        elif event_type == "charge.dispute.created":
            # Handle dispute
            pass
        
        return {"received": True}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Webhook processing failed: {str(e)}"
        )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "payment-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
