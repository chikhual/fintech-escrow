"""
Session Manager for FinTech ESCROW Platform
Handles session persistence, task tracking, and audit logging
"""
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from enum import Enum
import json
import os
from pathlib import Path
from sqlalchemy.orm import Session
from .database import get_db
from .models import User, Notification

class TaskStatus(str, Enum):
    ACTIVE = "active"
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    DUPLICATE = "duplicate"
    CANCELLED = "cancelled"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class SessionManager:
    """Manages user sessions, task tracking, and audit logging"""
    
    def __init__(self, user_id: int, role: str, session_id: Optional[str] = None):
        self.user_id = user_id
        self.role = role
        self.session_id = session_id or f"session_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.session_data = {
            "session_id": self.session_id,
            "user_id": user_id,
            "role": role,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "tasks": [],
            "activities": [],
            "validations": [],
            "errors": [],
            "recommendations": []
        }
        self.session_file_path = self._get_session_file_path()
        self._load_session()
    
    def _get_session_file_path(self) -> Path:
        """Get the path for session file"""
        sessions_dir = Path("sessions")
        sessions_dir.mkdir(exist_ok=True)
        return sessions_dir / f"{self.session_id}.md"
    
    def _load_session(self):
        """Load existing session data if available"""
        if self.session_file_path.exists():
            try:
                with open(self.session_file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # Parse markdown content to extract session data
                    # This is a simplified parser - in production, use a proper markdown parser
                    self.session_data = self._parse_session_markdown(content)
            except Exception as e:
                print(f"Error loading session: {e}")
    
    def _parse_session_markdown(self, content: str) -> Dict[str, Any]:
        """Parse session markdown content to extract data"""
        # Simplified parser - in production, use a proper markdown parser
        lines = content.split('\n')
        session_data = {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "role": self.role,
            "start_time": datetime.now(timezone.utc).isoformat(),
            "tasks": [],
            "activities": [],
            "validations": [],
            "errors": [],
            "recommendations": []
        }
        
        current_section = None
        for line in lines:
            if line.startswith('## '):
                current_section = line[3:].lower().replace(' ', '_')
            elif line.startswith('- ') and current_section:
                if current_section in session_data:
                    session_data[current_section].append(line[2:])
        
        return session_data
    
    def create_task(self, 
                   task_id: str, 
                   title: str, 
                   description: str, 
                   priority: TaskPriority = TaskPriority.MEDIUM,
                   context: Optional[Dict[str, Any]] = None) -> bool:
        """Create a new task, checking for duplicates first"""
        
        # Check for duplicates
        duplicate_task = self._find_duplicate_task(title, description)
        if duplicate_task:
            self._mark_task_as_duplicate(task_id, duplicate_task['task_id'])
            self._add_activity(
                "task_duplicate_detected",
                f"Task '{title}' detected as duplicate of task {duplicate_task['task_id']}",
                {"duplicate_of": duplicate_task['task_id']}
            )
            return False
        
        # Check if task is already completed
        completed_task = self._find_completed_task(title, description)
        if completed_task:
            self._add_activity(
                "task_already_completed",
                f"Task '{title}' was already completed in session {completed_task['session_id']}",
                {"completed_task": completed_task}
            )
            return False
        
        # Create new task
        task = {
            "task_id": task_id,
            "title": title,
            "description": description,
            "priority": priority.value,
            "status": TaskStatus.ACTIVE.value,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "context": context or {},
            "assignee": self.user_id,
            "role": self.role
        }
        
        self.session_data["tasks"].append(task)
        self._add_activity(
            "task_created",
            f"Task '{title}' created with priority {priority.value}",
            {"task_id": task_id}
        )
        
        self._save_session()
        return True
    
    def _find_duplicate_task(self, title: str, description: str) -> Optional[Dict[str, Any]]:
        """Find duplicate tasks based on title and description similarity"""
        for task in self.session_data["tasks"]:
            if (task["title"].lower() == title.lower() or 
                self._calculate_similarity(task["description"], description) > 0.8):
                return task
        return None
    
    def _find_completed_task(self, title: str, description: str) -> Optional[Dict[str, Any]]:
        """Find completed tasks with similar title or description"""
        for task in self.session_data["tasks"]:
            if (task["status"] == TaskStatus.COMPLETED.value and
                (task["title"].lower() == title.lower() or 
                 self._calculate_similarity(task["description"], description) > 0.8)):
                return task
        return None
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts (simplified)"""
        # In production, use a proper text similarity algorithm
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union) if union else 0.0
    
    def _mark_task_as_duplicate(self, task_id: str, duplicate_of: str):
        """Mark task as duplicate"""
        for task in self.session_data["tasks"]:
            if task["task_id"] == task_id:
                task["status"] = TaskStatus.DUPLICATE.value
                task["duplicate_of"] = duplicate_of
                task["updated_at"] = datetime.now(timezone.utc).isoformat()
                break
    
    def update_task_status(self, task_id: str, status: TaskStatus, 
                          notes: Optional[str] = None) -> bool:
        """Update task status"""
        for task in self.session_data["tasks"]:
            if task["task_id"] == task_id:
                old_status = task["status"]
                task["status"] = status.value
                task["updated_at"] = datetime.now(timezone.utc).isoformat()
                if notes:
                    task["notes"] = notes
                
                self._add_activity(
                    "task_status_updated",
                    f"Task {task_id} status changed from {old_status} to {status.value}",
                    {"task_id": task_id, "old_status": old_status, "new_status": status.value}
                )
                
                # If task is completed, check for critical changes
                if status == TaskStatus.COMPLETED:
                    self._handle_task_completion(task)
                
                self._save_session()
                return True
        return False
    
    def _handle_task_completion(self, task: Dict[str, Any]):
        """Handle task completion, including critical change notifications"""
        if task.get("priority") == TaskPriority.CRITICAL.value:
            self._add_activity(
                "critical_task_completed",
                f"Critical task '{task['title']}' completed - requires confirmation",
                {"task_id": task["task_id"]}
            )
            # TODO: Send notification to user about critical change
            self._send_critical_change_notification(task)
    
    def _send_critical_change_notification(self, task: Dict[str, Any]):
        """Send notification for critical changes"""
        # TODO: Implement notification sending
        pass
    
    def add_validation(self, validation_type: str, description: str, 
                      result: bool, details: Optional[Dict[str, Any]] = None):
        """Add validation record"""
        validation = {
            "type": validation_type,
            "description": description,
            "result": result,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "details": details or {}
        }
        self.session_data["validations"].append(validation)
        self._add_activity(
            "validation_performed",
            f"Validation '{validation_type}': {description} - {'PASSED' if result else 'FAILED'}",
            {"validation_type": validation_type, "result": result}
        )
        self._save_session()
    
    def add_error(self, error_type: str, description: str, 
                  context: Optional[Dict[str, Any]] = None):
        """Add error record"""
        error = {
            "type": error_type,
            "description": description,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "context": context or {}
        }
        self.session_data["errors"].append(error)
        self._add_activity(
            "error_detected",
            f"Error '{error_type}': {description}",
            {"error_type": error_type}
        )
        self._save_session()
    
    def add_recommendation(self, recommendation_type: str, description: str,
                          priority: TaskPriority = TaskPriority.MEDIUM,
                          requires_human_review: bool = False):
        """Add recommendation"""
        recommendation = {
            "type": recommendation_type,
            "description": description,
            "priority": priority.value,
            "requires_human_review": requires_human_review,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.session_data["recommendations"].append(recommendation)
        self._add_activity(
            "recommendation_generated",
            f"Recommendation '{recommendation_type}': {description}",
            {"recommendation_type": recommendation_type, "requires_human_review": requires_human_review}
        )
        self._save_session()
    
    def _add_activity(self, activity_type: str, description: str, 
                     metadata: Optional[Dict[str, Any]] = None):
        """Add activity record"""
        activity = {
            "type": activity_type,
            "description": description,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "user_id": self.user_id,
            "role": self.role,
            "metadata": metadata or {}
        }
        self.session_data["activities"].append(activity)
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get session summary"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "role": self.role,
            "start_time": self.session_data["start_time"],
            "end_time": datetime.now(timezone.utc).isoformat(),
            "total_tasks": len(self.session_data["tasks"]),
            "active_tasks": len([t for t in self.session_data["tasks"] if t["status"] == TaskStatus.ACTIVE.value]),
            "completed_tasks": len([t for t in self.session_data["tasks"] if t["status"] == TaskStatus.COMPLETED.value]),
            "duplicate_tasks": len([t for t in self.session_data["tasks"] if t["status"] == TaskStatus.DUPLICATE.value]),
            "total_validations": len(self.session_data["validations"]),
            "total_errors": len(self.session_data["errors"]),
            "total_recommendations": len(self.session_data["recommendations"]),
            "critical_recommendations": len([r for r in self.session_data["recommendations"] if r["requires_human_review"]])
        }
    
    def _save_session(self):
        """Save session to markdown file"""
        try:
            with open(self.session_file_path, 'w', encoding='utf-8') as f:
                f.write(self._generate_session_markdown())
        except Exception as e:
            print(f"Error saving session: {e}")
    
    def _generate_session_markdown(self) -> str:
        """Generate session markdown content"""
        summary = self.get_session_summary()
        
        markdown = f"""# Session Summary - {self.session_id}

## Basic Information
- **User ID**: {summary['user_id']}
- **Role**: {summary['role']}
- **Start Time**: {summary['start_time']}
- **End Time**: {summary['end_time']}

## Task Summary
- **Total Tasks**: {summary['total_tasks']}
- **Active Tasks**: {summary['active_tasks']}
- **Completed Tasks**: {summary['completed_tasks']}
- **Duplicate Tasks**: {summary['duplicate_tasks']}

## Activity Summary
- **Total Validations**: {summary['total_validations']}
- **Total Errors**: {summary['total_errors']}
- **Total Recommendations**: {summary['total_recommendations']}
- **Critical Recommendations**: {summary['critical_recommendations']}

## Tasks
"""
        
        for task in self.session_data["tasks"]:
            markdown += f"""
### {task['title']}
- **ID**: {task['task_id']}
- **Status**: {task['status']}
- **Priority**: {task['priority']}
- **Created**: {task['created_at']}
- **Description**: {task['description']}
"""
            if task.get('updated_at'):
                markdown += f"- **Updated**: {task['updated_at']}\n"
            if task.get('notes'):
                markdown += f"- **Notes**: {task['notes']}\n"
            if task.get('duplicate_of'):
                markdown += f"- **Duplicate of**: {task['duplicate_of']}\n"
        
        markdown += "\n## Activities\n"
        for activity in self.session_data["activities"]:
            markdown += f"- **{activity['timestamp']}** - {activity['type']}: {activity['description']}\n"
        
        markdown += "\n## Validations\n"
        for validation in self.session_data["validations"]:
            status = "✅ PASSED" if validation['result'] else "❌ FAILED"
            markdown += f"- **{validation['timestamp']}** - {validation['type']}: {validation['description']} - {status}\n"
        
        markdown += "\n## Errors\n"
        for error in self.session_data["errors"]:
            markdown += f"- **{error['timestamp']}** - {error['type']}: {error['description']}\n"
        
        markdown += "\n## Recommendations\n"
        for recommendation in self.session_data["recommendations"]:
            review_required = "⚠️ REQUIRES HUMAN REVIEW" if recommendation['requires_human_review'] else ""
            markdown += f"- **{recommendation['timestamp']}** - {recommendation['type']}: {recommendation['description']} {review_required}\n"
        
        return markdown
    
    def cleanup_session(self):
        """Clean up session data"""
        try:
            if self.session_file_path.exists():
                self.session_file_path.unlink()
        except Exception as e:
            print(f"Error cleaning up session: {e}")


class TaskManager:
    """Manages task operations with validation and audit logging"""
    
    def __init__(self, session_manager: SessionManager):
        self.session_manager = session_manager
    
    def create_task_with_validation(self, 
                                  task_id: str, 
                                  title: str, 
                                  description: str,
                                  priority: TaskPriority = TaskPriority.MEDIUM,
                                  context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create task with validation and duplicate checking"""
        
        # Validate task data
        validation_result = self._validate_task_data(title, description, context)
        if not validation_result["valid"]:
            self.session_manager.add_error(
                "task_validation_failed",
                f"Task validation failed: {validation_result['error']}",
                {"task_id": task_id, "validation_result": validation_result}
            )
            return {
                "success": False,
                "error": validation_result["error"],
                "task_id": task_id
            }
        
        # Check for duplicates
        duplicate_task = self.session_manager._find_duplicate_task(title, description)
        if duplicate_task:
            return {
                "success": False,
                "error": "Duplicate task detected",
                "duplicate_of": duplicate_task["task_id"],
                "task_id": task_id
            }
        
        # Create task
        success = self.session_manager.create_task(task_id, title, description, priority, context)
        
        return {
            "success": success,
            "task_id": task_id,
            "message": "Task created successfully" if success else "Task creation failed"
        }
    
    def _validate_task_data(self, title: str, description: str, 
                           context: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate task data according to business rules"""
        
        if not title or len(title.strip()) < 3:
            return {"valid": False, "error": "Title must be at least 3 characters long"}
        
        if not description or len(description.strip()) < 10:
            return {"valid": False, "error": "Description must be at least 10 characters long"}
        
        # Check for sensitive data in title or description
        sensitive_keywords = ["password", "secret", "key", "token", "ssn", "credit_card"]
        text_to_check = (title + " " + description).lower()
        
        for keyword in sensitive_keywords:
            if keyword in text_to_check:
                return {"valid": False, "error": f"Sensitive keyword '{keyword}' detected in task content"}
        
        return {"valid": True}
    
    def get_tasks_by_status(self, status: TaskStatus) -> List[Dict[str, Any]]:
        """Get tasks by status"""
        return [task for task in self.session_manager.session_data["tasks"] 
                if task["status"] == status.value]
    
    def get_critical_tasks(self) -> List[Dict[str, Any]]:
        """Get critical tasks requiring attention"""
        return [task for task in self.session_manager.session_data["tasks"] 
                if task.get("priority") == TaskPriority.CRITICAL.value and 
                task["status"] == TaskStatus.ACTIVE.value]
