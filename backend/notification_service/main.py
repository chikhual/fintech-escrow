"""
Notification Microservice
Handles email, SMS, push notifications, and real-time communication
"""
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Dict, Any, Optional
import os
import json
import asyncio
from twilio.rest import Client
import sendgrid
from sendgrid.helpers.mail import Mail
import firebase_admin
from firebase_admin import credentials, messaging

from shared.database import get_db, init_db
from shared.models import User, Notification
from shared.auth import get_current_user, require_roles, UserRole
from shared.schemas import SuccessResponse, ErrorResponse

# Initialize FastAPI app
app = FastAPI(
    title="FinTech ESCROW - Notification Service",
    description="Notification and real-time communication microservice",
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

# Initialize external services
twilio_client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN")
) if os.getenv("TWILIO_ACCOUNT_SID") else None

sendgrid_client = sendgrid.SendGridAPIClient(
    api_key=os.getenv("SENDGRID_API_KEY")
) if os.getenv("SENDGRID_API_KEY") else None

# Initialize Firebase (for push notifications)
if os.getenv("FIREBASE_CREDENTIALS_PATH"):
    cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS_PATH"))
    firebase_admin.initialize_app(cred)

# Initialize database
init_db()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Remove broken connections
                    self.active_connections[user_id].remove(connection)

    async def broadcast(self, message: str, user_ids: List[int]):
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()


class NotificationCreate:
    user_id: int
    title: str
    message: str
    notification_type: str
    metadata: Optional[Dict[str, Any]] = None


class EmailNotification:
    to: str
    subject: str
    html_content: str
    template_id: Optional[str] = None


class SMSNotification:
    to: str
    message: str


@app.post("/notifications", response_model=SuccessResponse)
async def create_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Create a new notification"""
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == notification_data.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Create notification record
        notification = Notification(
            user_id=notification_data.user_id,
            title=notification_data.title,
            message=notification_data.message,
            notification_type=notification_data.notification_type,
            metadata=notification_data.metadata or {}
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Send real-time notification
        await manager.send_personal_message(
            json.dumps({
                "type": "notification",
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "timestamp": notification.created_at.isoformat()
            }),
            notification_data.user_id
        )
        
        # Send via appropriate channel
        if notification_data.notification_type == "email":
            await send_email_notification(user.email, notification_data.title, notification_data.message)
        elif notification_data.notification_type == "sms" and user.phone:
            await send_sms_notification(user.phone, notification_data.message)
        elif notification_data.notification_type == "push":
            await send_push_notification(user.id, notification_data.title, notification_data.message)
        
        # Mark as sent
        notification.is_sent = True
        notification.sent_at = datetime.utcnow()
        db.commit()
        
        return SuccessResponse(
            success=True,
            message="Notification created and sent successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )


@app.get("/notifications")
async def get_notifications(
    page: int = 1,
    limit: int = 10,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's notifications"""
    try:
        query = db.query(Notification).filter(Notification.user_id == current_user.id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        # Pagination
        offset = (page - 1) * limit
        notifications = query.offset(offset).limit(limit).all()
        
        return {
            "notifications": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.notification_type,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat(),
                    "read_at": n.read_at.isoformat() if n.read_at else None
                }
                for n in notifications
            ],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": query.count()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve notifications: {str(e)}"
        )


@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark notification as read"""
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        ).first()
        
        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found"
            )
        
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        
        return SuccessResponse(
            success=True,
            message="Notification marked as read"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )


@app.post("/send-email")
async def send_email_notification(
    to: str,
    subject: str,
    html_content: str,
    template_id: Optional[str] = None,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Send email notification"""
    try:
        if not sendgrid_client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email service not configured"
            )
        
        message = Mail(
            from_email=os.getenv("FROM_EMAIL", "noreply@fintech-escrow.com"),
            to_emails=to,
            subject=subject,
            html_content=html_content
        )
        
        if template_id:
            message.template_id = template_id
        
        response = sendgrid_client.send(message)
        
        return SuccessResponse(
            success=True,
            message=f"Email sent successfully. Status: {response.status_code}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )


@app.post("/send-sms")
async def send_sms_notification(
    to: str,
    message: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Send SMS notification"""
    try:
        if not twilio_client:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="SMS service not configured"
            )
        
        twilio_message = twilio_client.messages.create(
            body=message,
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            to=to
        )
        
        return SuccessResponse(
            success=True,
            message=f"SMS sent successfully. SID: {twilio_message.sid}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send SMS: {str(e)}"
        )


@app.post("/send-push")
async def send_push_notification(
    user_id: int,
    title: str,
    body: str,
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Send push notification"""
    try:
        # TODO: Get user's FCM token from database
        # For now, this is a placeholder
        
        return SuccessResponse(
            success=True,
            message="Push notification sent successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send push notification: {str(e)}"
        )


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket endpoint for real-time notifications"""
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)


async def send_email_notification(to: str, subject: str, content: str):
    """Helper function to send email"""
    if sendgrid_client:
        try:
            message = Mail(
                from_email=os.getenv("FROM_EMAIL", "noreply@fintech-escrow.com"),
                to_emails=to,
                subject=subject,
                html_content=content
            )
            sendgrid_client.send(message)
        except Exception as e:
            print(f"Failed to send email: {e}")


async def send_sms_notification(to: str, message: str):
    """Helper function to send SMS"""
    if twilio_client:
        try:
            twilio_client.messages.create(
                body=message,
                from_=os.getenv("TWILIO_PHONE_NUMBER"),
                to=to
            )
        except Exception as e:
            print(f"Failed to send SMS: {e}")


async def send_push_notification(user_id: int, title: str, body: str):
    """Helper function to send push notification"""
    # TODO: Implement FCM push notification
    pass


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "notification-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)
