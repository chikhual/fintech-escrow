"""
Session Management API for FinTech ESCROW Platform
Provides endpoints for session management, task tracking, and critical notifications
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from .database import get_db
from .auth import get_current_user, require_roles, UserRole
from .session_manager import SessionManager, TaskManager, TaskStatus, TaskPriority
from .critical_notifications import CriticalNotificationManager, NotificationType
from .audit_middleware import ComplianceValidator, DocumentGenerator, OnboardingAssistant
from .schemas import SuccessResponse, ErrorResponse

router = APIRouter()

# Global session managers (in production, use Redis or database)
session_managers = {}
task_managers = {}
notification_managers = {}

def get_session_manager(user_id: int, role: str) -> SessionManager:
    """Get or create session manager for user"""
    session_key = f"{user_id}_{role}"
    if session_key not in session_managers:
        session_managers[session_key] = SessionManager(user_id, role)
    return session_managers[session_key]

def get_task_manager(session_manager: SessionManager) -> TaskManager:
    """Get or create task manager for session"""
    session_key = session_manager.session_id
    if session_key not in task_managers:
        task_managers[session_key] = TaskManager(session_manager)
    return task_managers[session_key]

def get_notification_manager(session_manager: SessionManager) -> CriticalNotificationManager:
    """Get or create notification manager for session"""
    session_key = session_manager.session_id
    if session_key not in notification_managers:
        notification_managers[session_key] = CriticalNotificationManager(session_manager)
    return notification_managers[session_key]

@router.post("/sessions/start")
async def start_session(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new session for the user"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        
        return {
            "success": True,
            "session_id": session_manager.session_id,
            "user_id": current_user.id,
            "role": current_user.role.value,
            "start_time": session_manager.session_data["start_time"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start session: {str(e)}"
        )

@router.get("/sessions/current")
async def get_current_session(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current session information"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        summary = session_manager.get_session_summary()
        
        return {
            "success": True,
            "session": summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session: {str(e)}"
        )

@router.post("/tasks")
async def create_task(
    title: str,
    description: str,
    priority: TaskPriority = TaskPriority.MEDIUM,
    context: Optional[Dict[str, Any]] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        task_manager = get_task_manager(session_manager)
        
        task_id = f"TASK-{uuid.uuid4().hex[:8].upper()}"
        
        result = task_manager.create_task_with_validation(
            task_id=task_id,
            title=title,
            description=description,
            priority=priority,
            context=context
        )
        
        if result["success"]:
            return {
                "success": True,
                "task_id": task_id,
                "message": "Task created successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create task: {str(e)}"
        )

@router.get("/tasks")
async def get_tasks(
    status: Optional[TaskStatus] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks for current session"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        task_manager = get_task_manager(session_manager)
        
        if status:
            tasks = task_manager.get_tasks_by_status(status)
        else:
            tasks = session_manager.session_data["tasks"]
        
        return {
            "success": True,
            "tasks": tasks,
            "total": len(tasks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tasks: {str(e)}"
        )

@router.put("/tasks/{task_id}/status")
async def update_task_status(
    task_id: str,
    new_status: TaskStatus,
    notes: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task status"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        
        success = session_manager.update_task_status(task_id, new_status, notes)
        
        if success:
            return {
                "success": True,
                "message": f"Task {task_id} status updated to {new_status.value}"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task status: {str(e)}"
        )

@router.get("/tasks/critical")
async def get_critical_tasks(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get critical tasks requiring attention"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        task_manager = get_task_manager(session_manager)
        
        critical_tasks = task_manager.get_critical_tasks()
        
        return {
            "success": True,
            "critical_tasks": critical_tasks,
            "count": len(critical_tasks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get critical tasks: {str(e)}"
        )

@router.post("/notifications/critical")
async def create_critical_notification(
    notification_type: NotificationType,
    title: str,
    message: str,
    context: Dict[str, Any],
    requires_confirmation: bool = True,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a critical notification"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        notification_manager = get_notification_manager(session_manager)
        
        notification = notification_manager.create_critical_notification(
            notification_type=notification_type,
            title=title,
            message=message,
            context=context,
            requires_confirmation=requires_confirmation
        )
        
        return {
            "success": True,
            "notification": notification
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create critical notification: {str(e)}"
        )

@router.get("/notifications/pending")
async def get_pending_notifications(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending critical notifications"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        notification_manager = get_notification_manager(session_manager)
        
        pending = notification_manager.get_pending_confirmations()
        overdue = notification_manager.get_overdue_confirmations()
        
        return {
            "success": True,
            "pending_notifications": pending,
            "overdue_notifications": overdue,
            "total_pending": len(pending),
            "total_overdue": len(overdue)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pending notifications: {str(e)}"
        )

@router.post("/notifications/{notification_id}/confirm")
async def confirm_notification(
    notification_id: str,
    confirmation_notes: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm a critical notification"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        notification_manager = get_notification_manager(session_manager)
        
        result = notification_manager.confirm_notification(
            notification_id=notification_id,
            confirmed_by=current_user.id,
            confirmation_notes=confirmation_notes
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Notification confirmed successfully",
                "notification": result["notification"]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm notification: {str(e)}"
        )

@router.post("/notifications/{notification_id}/reject")
async def reject_notification(
    notification_id: str,
    rejection_reason: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a critical notification"""
    try:
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        notification_manager = get_notification_manager(session_manager)
        
        result = notification_manager.reject_notification(
            notification_id=notification_id,
            rejected_by=current_user.id,
            rejection_reason=rejection_reason
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": "Notification rejected successfully",
                "notification": result["notification"]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject notification: {str(e)}"
        )

@router.post("/documents/generate/escrow-contract")
async def generate_escrow_contract(
    transaction_data: Dict[str, Any],
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Generate ESCROW contract with AI assistance"""
    try:
        document_generator = DocumentGenerator()
        contract = document_generator.generate_escrow_contract(transaction_data)
        
        # Create critical notification for human review
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        notification_manager = get_notification_manager(session_manager)
        
        notification = notification_manager.handle_document_requires_review(
            document_id=contract["contract_id"],
            document_type="escrow_contract",
            context=transaction_data
        )
        
        return {
            "success": True,
            "contract": contract,
            "notification": notification,
            "message": "Contract generated successfully. Human review required."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate contract: {str(e)}"
        )

@router.post("/documents/generate/kyc-checklist")
async def generate_kyc_checklist(
    user_role: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate KYC checklist for user role"""
    try:
        document_generator = DocumentGenerator()
        checklist = document_generator.generate_kyc_checklist(user_role)
        
        return {
            "success": True,
            "checklist": checklist
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate checklist: {str(e)}"
        )

@router.post("/onboarding/validate-step")
async def validate_onboarding_step(
    step: str,
    data: Dict[str, Any],
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate onboarding step data"""
    try:
        onboarding_assistant = OnboardingAssistant()
        validation_result = onboarding_assistant.validate_onboarding_step(step, data)
        
        if not validation_result["valid"]:
            guidance = onboarding_assistant.generate_onboarding_guidance(step, validation_result)
            validation_result["guidance"] = guidance
        
        return {
            "success": True,
            "validation": validation_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate onboarding step: {str(e)}"
        )

@router.post("/compliance/validate-operation")
async def validate_operation(
    operation: str,
    context: Dict[str, Any],
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Validate operation against compliance rules"""
    try:
        compliance_validator = ComplianceValidator()
        
        # Validate KYC requirements
        kyc_validation = compliance_validator.validate_kyc_requirement(
            user={"is_identity_verified": current_user.is_identity_verified,
                  "is_kyc_verified": current_user.is_kyc_verified},
            operation=operation
        )
        
        # Validate dual approval requirements
        dual_approval_validation = compliance_validator.validate_dual_approval(
            operation=operation,
            current_user={"id": current_user.id, "role": current_user.role.value},
            other_party=context.get("other_party")
        )
        
        # Validate ESCROW flow
        escrow_validation = compliance_validator.validate_escrow_flow(
            transaction_status=context.get("transaction_status", ""),
            operation=operation
        )
        
        return {
            "success": True,
            "validations": {
                "kyc": kyc_validation,
                "dual_approval": dual_approval_validation,
                "escrow_flow": escrow_validation
            },
            "overall_valid": all([
                kyc_validation["valid"],
                dual_approval_validation["valid"],
                escrow_validation["valid"]
            ])
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to validate operation: {str(e)}"
        )

@router.get("/sessions/{session_id}/summary")
async def get_session_summary(
    session_id: str,
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Get session summary (admin/advisor only)"""
    try:
        # Find session manager by session_id
        session_manager = None
        for sm in session_managers.values():
            if sm.session_id == session_id:
                session_manager = sm
                break
        
        if not session_manager:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
        
        summary = session_manager.get_session_summary()
        
        return {
            "success": True,
            "session_summary": summary
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session summary: {str(e)}"
        )

@router.delete("/sessions/{session_id}")
async def cleanup_session(
    session_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean up session data"""
    try:
        # Find and cleanup session
        session_key_to_remove = None
        for key, sm in session_managers.items():
            if sm.session_id == session_id and sm.user_id == current_user.id:
                sm.cleanup_session()
                session_key_to_remove = key
                break
        
        if session_key_to_remove:
            del session_managers[session_key_to_remove]
            if session_key_to_remove in task_managers:
                del task_managers[session_key_to_remove]
            if session_key_to_remove in notification_managers:
                del notification_managers[session_key_to_remove]
        
        return {
            "success": True,
            "message": "Session cleaned up successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup session: {str(e)}"
        )
