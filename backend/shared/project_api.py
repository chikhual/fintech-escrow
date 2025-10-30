"""
Project Management API for FinTech ESCROW Platform
Provides endpoints for project task management and reporting
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from .database import get_db
from .auth import get_current_user, require_roles, UserRole
from .session_manager import SessionManager, TaskStatus, TaskPriority
from .task_management import ProjectTaskManager, MilestoneStatus, TaskCategory
from .critical_notifications import CriticalNotificationManager, NotificationType
from .schemas import SuccessResponse, ErrorResponse

router = APIRouter()

# Global project task managers (in production, use Redis or database)
project_managers = {}

def get_project_manager(session_manager: SessionManager) -> ProjectTaskManager:
    """Get or create project task manager for session"""
    session_key = session_manager.session_id
    if session_key not in project_managers:
        project_managers[session_key] = ProjectTaskManager(session_manager)
    return project_managers[session_key]

@router.get("/project/status")
async def get_project_status(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall project status"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        status = project_manager.get_project_status()
        
        return {
            "success": True,
            "project_status": status
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project status: {str(e)}"
        )

@router.get("/project/milestones")
async def get_milestones(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all project milestones"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        milestones = project_manager.milestones
        
        return {
            "success": True,
            "milestones": milestones
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get milestones: {str(e)}"
        )

@router.get("/project/milestones/{milestone_id}/tasks")
async def get_milestone_tasks(
    milestone_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks for a specific milestone"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        tasks = project_manager.get_tasks_by_milestone(milestone_id)
        
        return {
            "success": True,
            "milestone_id": milestone_id,
            "tasks": tasks,
            "total": len(tasks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get milestone tasks: {str(e)}"
        )

@router.get("/project/tasks")
async def get_project_tasks(
    status: Optional[TaskStatus] = Query(None),
    category: Optional[TaskCategory] = Query(None),
    assignee: Optional[str] = Query(None),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project tasks with filtering"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        tasks = list(project_manager.tasks.values())
        
        # Apply filters
        if status:
            tasks = [t for t in tasks if t["status"] == status.value]
        if category:
            tasks = [t for t in tasks if t["category"] == category.value]
        if assignee:
            tasks = [t for t in tasks if t.get("assignee") == assignee]
        
        return {
            "success": True,
            "tasks": tasks,
            "total": len(tasks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project tasks: {str(e)}"
        )

@router.get("/project/tasks/critical")
async def get_critical_tasks(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get critical tasks requiring attention"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        critical_tasks = project_manager.get_critical_tasks()
        
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

@router.get("/project/tasks/overdue")
async def get_overdue_tasks(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overdue tasks"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        overdue_tasks = project_manager.get_overdue_tasks()
        
        return {
            "success": True,
            "overdue_tasks": overdue_tasks,
            "count": len(overdue_tasks)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get overdue tasks: {str(e)}"
        )

@router.post("/project/tasks")
async def create_project_task(
    task_id: str,
    title: str,
    description: str,
    milestone: str,
    category: TaskCategory,
    priority: TaskPriority = TaskPriority.MEDIUM,
    assignee: Optional[str] = None,
    estimated_hours: int = 0,
    dependencies: Optional[List[str]] = None,
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Create a new project task"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        result = project_manager.create_task(
            task_id=task_id,
            title=title,
            description=description,
            milestone=milestone,
            category=category,
            priority=priority,
            assignee=assignee,
            estimated_hours=estimated_hours,
            dependencies=dependencies
        )
        
        if result["success"]:
            return {
                "success": True,
                "task": result["task"],
                "message": "Project task created successfully"
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
            detail=f"Failed to create project task: {str(e)}"
        )

@router.put("/project/tasks/{task_id}/status")
async def update_task_status(
    task_id: str,
    new_status: TaskStatus,
    actual_hours: Optional[int] = None,
    notes: Optional[str] = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update project task status"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        result = project_manager.update_task_status(
            task_id=task_id,
            status=new_status,
            actual_hours=actual_hours,
            notes=notes
        )
        
        if result["success"]:
            return {
                "success": True,
                "task": result["task"],
                "message": f"Task {task_id} status updated to {new_status.value}"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result["error"]
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update task status: {str(e)}"
        )

@router.get("/project/tasks/{task_id}")
async def get_task_details(
    task_id: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific task"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        if task_id not in project_manager.tasks:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        task = project_manager.tasks[task_id]
        
        # Get related tasks (dependencies and dependents)
        dependencies = []
        for dep_id in task.get("dependencies", []):
            if dep_id in project_manager.tasks:
                dependencies.append({
                    "task_id": dep_id,
                    "title": project_manager.tasks[dep_id]["title"],
                    "status": project_manager.tasks[dep_id]["status"]
                })
        
        dependents = []
        for other_task_id, other_task in project_manager.tasks.items():
            if task_id in other_task.get("dependencies", []):
                dependents.append({
                    "task_id": other_task_id,
                    "title": other_task["title"],
                    "status": other_task["status"]
                })
        
        return {
            "success": True,
            "task": task,
            "dependencies": dependencies,
            "dependents": dependents
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get task details: {str(e)}"
        )

@router.get("/project/report")
async def generate_project_report(
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Generate project report"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        report = project_manager.generate_project_report()
        
        return {
            "success": True,
            "report": report
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate project report: {str(e)}"
        )

@router.get("/project/metrics")
async def get_project_metrics(
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Get project metrics and KPIs"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        status = project_manager.get_project_status()
        
        # Calculate additional metrics
        tasks_by_category = {}
        tasks_by_priority = {}
        tasks_by_assignee = {}
        
        for task in project_manager.tasks.values():
            # By category
            category = task.get("category", "unknown")
            tasks_by_category[category] = tasks_by_category.get(category, 0) + 1
            
            # By priority
            priority = task.get("priority", "unknown")
            tasks_by_priority[priority] = tasks_by_priority.get(priority, 0) + 1
            
            # By assignee
            assignee = task.get("assignee", "unassigned")
            tasks_by_assignee[assignee] = tasks_by_assignee.get(assignee, 0) + 1
        
        # Calculate velocity (tasks completed per week)
        # This is a simplified calculation
        velocity = status["completed_tasks"] / 4  # Assuming 4 weeks of work
        
        metrics = {
            "overall_progress": status["overall_progress"],
            "total_tasks": status["total_tasks"],
            "completed_tasks": status["completed_tasks"],
            "in_progress_tasks": status["in_progress_tasks"],
            "pending_tasks": status["pending_tasks"],
            "efficiency": status["efficiency"],
            "velocity": velocity,
            "tasks_by_category": tasks_by_category,
            "tasks_by_priority": tasks_by_priority,
            "tasks_by_assignee": tasks_by_assignee,
            "milestone_progress": {
                milestone_id: milestone["progress_percentage"]
                for milestone_id, milestone in status["milestones"].items()
            }
        }
        
        return {
            "success": True,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get project metrics: {str(e)}"
        )

@router.post("/project/milestones/{milestone_id}/update-status")
async def update_milestone_status(
    milestone_id: str,
    new_status: MilestoneStatus,
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Update milestone status"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        if milestone_id not in project_manager.milestones:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Milestone not found"
            )
        
        milestone = project_manager.milestones[milestone_id]
        old_status = milestone["status"]
        
        milestone["status"] = new_status.value
        if new_status == MilestoneStatus.COMPLETED:
            milestone["completion_date"] = datetime.now(timezone.utc).isoformat()
        
        # Add to session activities
        session_manager._add_activity(
            "milestone_status_updated",
            f"Milestone {milestone_id} status changed from {old_status} to {new_status.value}",
            {"milestone_id": milestone_id, "old_status": old_status, "new_status": new_status.value}
        )
        
        return {
            "success": True,
            "milestone": milestone,
            "message": f"Milestone {milestone_id} status updated to {new_status.value}"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update milestone status: {str(e)}"
        )

@router.get("/project/burndown")
async def get_burndown_chart_data(
    current_user = Depends(require_roles([UserRole.ADMIN, UserRole.ADVISOR])),
    db: Session = Depends(get_db)
):
    """Get burndown chart data for project visualization"""
    try:
        from .session_manager import get_session_manager
        session_manager = get_session_manager(current_user.id, current_user.role.value)
        project_manager = get_project_manager(session_manager)
        
        # This is a simplified implementation
        # In production, you would calculate actual burndown data
        burndown_data = {
            "ideal_burndown": [
                {"day": 1, "remaining_tasks": 30},
                {"day": 2, "remaining_tasks": 28},
                {"day": 3, "remaining_tasks": 26},
                {"day": 4, "remaining_tasks": 24},
                {"day": 5, "remaining_tasks": 22},
                {"day": 6, "remaining_tasks": 20},
                {"day": 7, "remaining_tasks": 18},
                {"day": 8, "remaining_tasks": 16},
                {"day": 9, "remaining_tasks": 14},
                {"day": 10, "remaining_tasks": 12},
                {"day": 11, "remaining_tasks": 10},
                {"day": 12, "remaining_tasks": 8},
                {"day": 13, "remaining_tasks": 6},
                {"day": 14, "remaining_tasks": 4},
                {"day": 15, "remaining_tasks": 2},
                {"day": 16, "remaining_tasks": 0}
            ],
            "actual_burndown": [
                {"day": 1, "remaining_tasks": 30},
                {"day": 2, "remaining_tasks": 29},
                {"day": 3, "remaining_tasks": 27},
                {"day": 4, "remaining_tasks": 25},
                {"day": 5, "remaining_tasks": 23},
                {"day": 6, "remaining_tasks": 21},
                {"day": 7, "remaining_tasks": 19},
                {"day": 8, "remaining_tasks": 17},
                {"day": 9, "remaining_tasks": 15},
                {"day": 10, "remaining_tasks": 13},
                {"day": 11, "remaining_tasks": 11},
                {"day": 12, "remaining_tasks": 9},
                {"day": 13, "remaining_tasks": 7},
                {"day": 14, "remaining_tasks": 5},
                {"day": 15, "remaining_tasks": 3},
                {"day": 16, "remaining_tasks": 1}
            ]
        }
        
        return {
            "success": True,
            "burndown_data": burndown_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get burndown data: {str(e)}"
        )
