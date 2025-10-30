"""
Critical Notifications System for FinTech ESCROW Platform
Handles critical change notifications and confirmation requirements
"""
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from enum import Enum
import json
from .session_manager import SessionManager, TaskPriority
from .audit_middleware import ComplianceValidator

class NotificationType(str, Enum):
    CRITICAL_CHANGE = "critical_change"
    TRANSACTION_STATUS_CHANGE = "transaction_status_change"
    PAYMENT_PROCESSED = "payment_processed"
    FUNDS_RELEASED = "funds_released"
    DISPUTE_CREATED = "dispute_created"
    DOCUMENT_REQUIRES_REVIEW = "document_requires_review"
    KYC_VERIFICATION_REQUIRED = "kyc_verification_required"
    DUAL_APPROVAL_REQUIRED = "dual_approval_required"

class CriticalNotificationManager:
    """Manages critical notifications and confirmations"""
    
    def __init__(self, session_manager: SessionManager):
        self.session_manager = session_manager
        self.compliance_validator = ComplianceValidator()
        self.pending_confirmations = {}
    
    def create_critical_notification(self, 
                                   notification_type: NotificationType,
                                   title: str,
                                   message: str,
                                   context: Dict[str, Any],
                                   requires_confirmation: bool = True,
                                   confirmation_deadline: Optional[datetime] = None) -> Dict[str, Any]:
        """Create a critical notification that requires attention"""
        
        notification_id = f"CRIT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{hash(title) % 10000:04d}"
        
        notification = {
            "notification_id": notification_id,
            "type": notification_type.value,
            "title": title,
            "message": message,
            "context": context,
            "requires_confirmation": requires_confirmation,
            "confirmation_deadline": confirmation_deadline.isoformat() if confirmation_deadline else None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "pending",
            "user_id": self.session_manager.user_id,
            "role": self.session_manager.role,
            "session_id": self.session_manager.session_id
        }
        
        # Add to session activities
        self.session_manager._add_activity(
            "critical_notification_created",
            f"Critical notification '{title}' created",
            {"notification_id": notification_id, "type": notification_type.value}
        )
        
        # Store pending confirmation if required
        if requires_confirmation:
            self.pending_confirmations[notification_id] = notification
        
        # Generate audit trail
        self._generate_audit_trail(notification)
        
        return notification
    
    def handle_transaction_status_change(self, 
                                       transaction_id: str,
                                       old_status: str,
                                       new_status: str,
                                       context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle critical transaction status changes"""
        
        critical_status_changes = {
            "payment_received": {
                "title": "Payment Received - Funds in Custody",
                "message": f"Payment for transaction {transaction_id} has been received and is being held in escrow.",
                "requires_confirmation": True
            },
            "funds_released": {
                "title": "Funds Released to Seller",
                "message": f"Funds for transaction {transaction_id} have been released to the seller.",
                "requires_confirmation": True
            },
            "disputed": {
                "title": "Transaction Disputed",
                "message": f"Transaction {transaction_id} has been disputed and requires immediate attention.",
                "requires_confirmation": True
            }
        }
        
        if new_status in critical_status_changes:
            change_info = critical_status_changes[new_status]
            
            notification = self.create_critical_notification(
                notification_type=NotificationType.TRANSACTION_STATUS_CHANGE,
                title=change_info["title"],
                message=change_info["message"],
                context={
                    "transaction_id": transaction_id,
                    "old_status": old_status,
                    "new_status": new_status,
                    **context
                },
                requires_confirmation=change_info["requires_confirmation"]
            )
            
            # Send immediate notification
            self._send_immediate_notification(notification)
            
            return notification
        
        return {"success": False, "message": "No critical notification required"}
    
    def handle_payment_processed(self, 
                               payment_id: str,
                               amount: float,
                               currency: str,
                               context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle payment processing notifications"""
        
        notification = self.create_critical_notification(
            notification_type=NotificationType.PAYMENT_PROCESSED,
            title="Payment Processed Successfully",
            message=f"Payment of {amount} {currency} has been processed successfully.",
            context={
                "payment_id": payment_id,
                "amount": amount,
                "currency": currency,
                **context
            },
            requires_confirmation=True
        )
        
        # Send immediate notification
        self._send_immediate_notification(notification)
        
        return notification
    
    def handle_funds_released(self, 
                            transaction_id: str,
                            amount: float,
                            currency: str,
                            seller_id: int,
                            context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle funds release notifications"""
        
        notification = self.create_critical_notification(
            notification_type=NotificationType.FUNDS_RELEASED,
            title="Funds Released to Seller",
            message=f"Funds of {amount} {currency} have been released to seller for transaction {transaction_id}.",
            context={
                "transaction_id": transaction_id,
                "amount": amount,
                "currency": currency,
                "seller_id": seller_id,
                **context
            },
            requires_confirmation=True
        )
        
        # Send immediate notification
        self._send_immediate_notification(notification)
        
        return notification
    
    def handle_dispute_created(self, 
                             dispute_id: str,
                             transaction_id: str,
                             reason: str,
                             context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle dispute creation notifications"""
        
        notification = self.create_critical_notification(
            notification_type=NotificationType.DISPUTE_CREATED,
            title="Transaction Dispute Created",
            message=f"A dispute has been created for transaction {transaction_id}. Reason: {reason}",
            context={
                "dispute_id": dispute_id,
                "transaction_id": transaction_id,
                "reason": reason,
                **context
            },
            requires_confirmation=True
        )
        
        # Send immediate notification
        self._send_immediate_notification(notification)
        
        return notification
    
    def handle_document_requires_review(self, 
                                      document_id: str,
                                      document_type: str,
                                      context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle document review requirements"""
        
        notification = self.create_critical_notification(
            notification_type=NotificationType.DOCUMENT_REQUIRES_REVIEW,
            title="Document Requires Human Review",
            message=f"AI-generated document '{document_type}' requires human legal review before use.",
            context={
                "document_id": document_id,
                "document_type": document_type,
                "ai_generated": True,
                "requires_legal_review": True,
                **context
            },
            requires_confirmation=True,
            confirmation_deadline=datetime.now(timezone.utc).timestamp() + 24 * 3600  # 24 hours
        )
        
        # Send immediate notification
        self._send_immediate_notification(notification)
        
        return notification
    
    def handle_kyc_verification_required(self, 
                                       user_id: int,
                                       missing_documents: List[str],
                                       context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle KYC verification requirements"""
        
        notification = self.create_critical_notification(
            notification_type=NotificationType.KYC_VERIFICATION_REQUIRED,
            title="KYC Verification Required",
            message=f"User {user_id} requires KYC verification. Missing documents: {', '.join(missing_documents)}",
            context={
                "user_id": user_id,
                "missing_documents": missing_documents,
                **context
            },
            requires_confirmation=True
        )
        
        # Send immediate notification
        self._send_immediate_notification(notification)
        
        return notification
    
    def handle_dual_approval_required(self, 
                                    operation: str,
                                    transaction_id: str,
                                    parties: List[Dict[str, Any]],
                                    context: Dict[str, Any]) -> Dict[str, Any]:
        """Handle dual approval requirements"""
        
        notification = self.create_critical_notification(
            notification_type=NotificationType.DUAL_APPROVAL_REQUIRED,
            title="Dual Approval Required",
            message=f"Operation '{operation}' on transaction {transaction_id} requires approval from both parties.",
            context={
                "operation": operation,
                "transaction_id": transaction_id,
                "parties": parties,
                **context
            },
            requires_confirmation=True
        )
        
        # Send immediate notification
        self._send_immediate_notification(notification)
        
        return notification
    
    def confirm_notification(self, notification_id: str, 
                           confirmed_by: int, 
                           confirmation_notes: Optional[str] = None) -> Dict[str, Any]:
        """Confirm a critical notification"""
        
        if notification_id not in self.pending_confirmations:
            return {
                "success": False,
                "error": "Notification not found or already confirmed"
            }
        
        notification = self.pending_confirmations[notification_id]
        notification["status"] = "confirmed"
        notification["confirmed_by"] = confirmed_by
        notification["confirmed_at"] = datetime.now(timezone.utc).isoformat()
        notification["confirmation_notes"] = confirmation_notes
        
        # Remove from pending confirmations
        del self.pending_confirmations[notification_id]
        
        # Add to session activities
        self.session_manager._add_activity(
            "critical_notification_confirmed",
            f"Critical notification '{notification['title']}' confirmed",
            {"notification_id": notification_id, "confirmed_by": confirmed_by}
        )
        
        # Generate audit trail
        self._generate_audit_trail(notification, "confirmed")
        
        return {
            "success": True,
            "notification": notification
        }
    
    def reject_notification(self, notification_id: str, 
                          rejected_by: int, 
                          rejection_reason: str) -> Dict[str, Any]:
        """Reject a critical notification"""
        
        if notification_id not in self.pending_confirmations:
            return {
                "success": False,
                "error": "Notification not found or already processed"
            }
        
        notification = self.pending_confirmations[notification_id]
        notification["status"] = "rejected"
        notification["rejected_by"] = rejected_by
        notification["rejected_at"] = datetime.now(timezone.utc).isoformat()
        notification["rejection_reason"] = rejection_reason
        
        # Remove from pending confirmations
        del self.pending_confirmations[notification_id]
        
        # Add to session activities
        self.session_manager._add_activity(
            "critical_notification_rejected",
            f"Critical notification '{notification['title']}' rejected",
            {"notification_id": notification_id, "rejected_by": rejected_by, "reason": rejection_reason}
        )
        
        # Generate audit trail
        self._generate_audit_trail(notification, "rejected")
        
        return {
            "success": True,
            "notification": notification
        }
    
    def get_pending_confirmations(self) -> List[Dict[str, Any]]:
        """Get all pending confirmations"""
        return list(self.pending_confirmations.values())
    
    def get_overdue_confirmations(self) -> List[Dict[str, Any]]:
        """Get overdue confirmations"""
        now = datetime.now(timezone.utc)
        overdue = []
        
        for notification in self.pending_confirmations.values():
            if notification.get("confirmation_deadline"):
                deadline = datetime.fromisoformat(notification["confirmation_deadline"])
                if now > deadline:
                    overdue.append(notification)
        
        return overdue
    
    def _send_immediate_notification(self, notification: Dict[str, Any]):
        """Send immediate notification via multiple channels"""
        # This is a placeholder - in production, integrate with actual notification services
        
        # Email notification
        self._send_email_notification(notification)
        
        # SMS notification (for critical items)
        if notification["type"] in ["critical_change", "dispute_created", "funds_released"]:
            self._send_sms_notification(notification)
        
        # Push notification
        self._send_push_notification(notification)
        
        # WebSocket notification
        self._send_websocket_notification(notification)
    
    def _send_email_notification(self, notification: Dict[str, Any]):
        """Send email notification"""
        # Placeholder - integrate with SendGrid
        print(f"EMAIL NOTIFICATION: {notification['title']} - {notification['message']}")
    
    def _send_sms_notification(self, notification: Dict[str, Any]):
        """Send SMS notification"""
        # Placeholder - integrate with Twilio
        print(f"SMS NOTIFICATION: {notification['title']} - {notification['message']}")
    
    def _send_push_notification(self, notification: Dict[str, Any]):
        """Send push notification"""
        # Placeholder - integrate with Firebase
        print(f"PUSH NOTIFICATION: {notification['title']} - {notification['message']}")
    
    def _send_websocket_notification(self, notification: Dict[str, Any]):
        """Send WebSocket notification"""
        # Placeholder - integrate with WebSocket service
        print(f"WEBSOCKET NOTIFICATION: {notification['title']} - {notification['message']}")
    
    def _generate_audit_trail(self, notification: Dict[str, Any], action: str = "created"):
        """Generate audit trail for notification"""
        audit_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "action": f"notification_{action}",
            "notification_id": notification["notification_id"],
            "type": notification["type"],
            "title": notification["title"],
            "user_id": notification["user_id"],
            "role": notification["role"],
            "session_id": notification["session_id"],
            "requires_confirmation": notification["requires_confirmation"]
        }
        
        # Log to audit system
        print(f"AUDIT TRAIL: {json.dumps(audit_entry)}")
    
    def cleanup_expired_notifications(self):
        """Clean up expired notifications"""
        now = datetime.now(timezone.utc)
        expired_notifications = []
        
        for notification_id, notification in self.pending_confirmations.items():
            if notification.get("confirmation_deadline"):
                deadline = datetime.fromisoformat(notification["confirmation_deadline"])
                if now > deadline:
                    expired_notifications.append(notification_id)
        
        for notification_id in expired_notifications:
            notification = self.pending_confirmations[notification_id]
            notification["status"] = "expired"
            notification["expired_at"] = now.isoformat()
            
            # Add to session activities
            self.session_manager._add_activity(
                "critical_notification_expired",
                f"Critical notification '{notification['title']}' expired",
                {"notification_id": notification_id}
            )
            
            # Remove from pending
            del self.pending_confirmations[notification_id]
