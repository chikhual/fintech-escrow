"""
Task Management System for FinTech ESCROW Platform
Integrates with session management and audit system
"""
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from enum import Enum
import json
import uuid
from .session_manager import SessionManager, TaskManager, TaskStatus, TaskPriority
from .critical_notifications import CriticalNotificationManager, NotificationType

class MilestoneStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"

class TaskCategory(str, Enum):
    INFRASTRUCTURE = "infrastructure"
    BACKEND = "backend"
    FRONTEND = "frontend"
    SECURITY = "security"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    DOCUMENTATION = "documentation"
    INTEGRATION = "integration"

class ProjectTaskManager:
    """Manages project tasks and milestones with integration to session system"""
    
    def __init__(self, session_manager: SessionManager):
        self.session_manager = session_manager
        self.task_manager = TaskManager(session_manager)
        self.notification_manager = CriticalNotificationManager(session_manager)
        self.milestones = self._initialize_milestones()
        self.tasks = self._initialize_tasks()
    
    def _initialize_milestones(self) -> Dict[str, Dict[str, Any]]:
        """Initialize project milestones"""
        return {
            "M1": {
                "name": "Preparación de Infraestructura y Base de Datos",
                "status": MilestoneStatus.COMPLETED,
                "completion_date": "2024-01-30",
                "description": "Configuración de servidores, base de datos y logging",
                "dependencies": [],
                "tasks": ["M1-1", "M1-2", "M1-3", "M1-4", "M1-5"]
            },
            "M2": {
                "name": "Desarrollo Backend y API ESCROW",
                "status": MilestoneStatus.COMPLETED,
                "completion_date": "2024-01-30",
                "description": "Implementación de microservicios y lógica ESCROW",
                "dependencies": ["M1"],
                "tasks": ["M2-1", "M2-2", "M2-3", "M2-4", "M2-5"]
            },
            "M3": {
                "name": "Desarrollo Frontend Web App",
                "status": MilestoneStatus.IN_PROGRESS,
                "completion_date": None,
                "description": "Interfaz de usuario Angular con TailwindCSS",
                "dependencies": ["M1"],
                "tasks": ["M3-1", "M3-2", "M3-3", "M3-4", "M3-5"]
            },
            "M4": {
                "name": "Integración de Seguridad, KYC y Validaciones",
                "status": MilestoneStatus.IN_PROGRESS,
                "completion_date": None,
                "description": "Autenticación 2FA, KYC y validaciones documentales",
                "dependencies": ["M2", "M3"],
                "tasks": ["M4-1", "M4-2", "M4-3", "M4-4", "M4-5"]
            },
            "M5": {
                "name": "Pruebas QA, Seguridad y Control de Calidad",
                "status": MilestoneStatus.NOT_STARTED,
                "completion_date": None,
                "description": "Pruebas unitarias, integración, seguridad y carga",
                "dependencies": ["M4"],
                "tasks": ["M5-1", "M5-2", "M5-3", "M5-4", "M5-5"]
            },
            "M6": {
                "name": "Demo y Despliegue Inicial",
                "status": MilestoneStatus.IN_PROGRESS,
                "completion_date": None,
                "description": "Preparación de demo y despliegue en producción",
                "dependencies": ["M5"],
                "tasks": ["M6-1", "M6-2", "M6-3", "M6-4"]
            }
        }
    
    def _initialize_tasks(self) -> Dict[str, Dict[str, Any]]:
        """Initialize project tasks"""
        return {
            # M1 Tasks
            "M1-1": {
                "title": "Configuración de servidores y hosting en nube pública",
                "description": "Configurar Docker Compose y servicios en la nube",
                "milestone": "M1",
                "category": TaskCategory.INFRASTRUCTURE,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "DevOps Team",
                "completion_date": "2024-01-30",
                "dependencies": [],
                "estimated_hours": 8,
                "actual_hours": 6
            },
            "M1-2": {
                "title": "Modelado inicial y creación de base de datos PostgreSQL",
                "description": "Diseñar y crear esquema de base de datos",
                "milestone": "M1",
                "category": TaskCategory.INFRASTRUCTURE,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M1-1"],
                "estimated_hours": 12,
                "actual_hours": 10
            },
            "M1-3": {
                "title": "Configuración del ORM SQLAlchemy",
                "description": "Configurar SQLAlchemy 2.0 con modelos",
                "milestone": "M1",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M1-2"],
                "estimated_hours": 6,
                "actual_hours": 5
            },
            "M1-4": {
                "title": "Definición y registro de modelos para usuarios, transacciones y documentos",
                "description": "Crear modelos SQLAlchemy para todas las entidades",
                "milestone": "M1",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M1-3"],
                "estimated_hours": 16,
                "actual_hours": 14
            },
            "M1-5": {
                "title": "Establecer mecanismos iniciales de logging y auditoría",
                "description": "Implementar sistema de logging y auditoría",
                "milestone": "M1",
                "category": TaskCategory.INFRASTRUCTURE,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M1-4"],
                "estimated_hours": 8,
                "actual_hours": 8
            },
            # M2 Tasks
            "M2-1": {
                "title": "Implementación de servicios REST con FastAPI",
                "description": "Crear 4 microservicios con FastAPI",
                "milestone": "M2",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M1-5"],
                "estimated_hours": 20,
                "actual_hours": 18
            },
            "M2-2": {
                "title": "Desarrollo de endpoints para gestión de usuarios y roles",
                "description": "Implementar Auth Service con JWT",
                "milestone": "M2",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M2-1"],
                "estimated_hours": 12,
                "actual_hours": 10
            },
            "M2-3": {
                "title": "Desarrollo de lógica ESCROW para retención y liberación de fondos",
                "description": "Implementar ESCROW Service con 9 estados",
                "milestone": "M2",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M2-2"],
                "estimated_hours": 24,
                "actual_hours": 22
            },
            "M2-4": {
                "title": "Integración inicial de sistema de notificaciones",
                "description": "Implementar Notification Service con múltiples canales",
                "milestone": "M2",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M2-3"],
                "estimated_hours": 16,
                "actual_hours": 14
            },
            "M2-5": {
                "title": "Desarrollo de mecanismos para manejo de documentos y evidencias",
                "description": "Sistema de documentos y evidencias",
                "milestone": "M2",
                "category": TaskCategory.BACKEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Backend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M2-4"],
                "estimated_hours": 10,
                "actual_hours": 8
            },
            # M3 Tasks
            "M3-1": {
                "title": "Setup inicial Angular y entorno de desarrollo",
                "description": "Configurar Angular 17 con TailwindCSS",
                "milestone": "M3",
                "category": TaskCategory.FRONTEND,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Frontend Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M1-5"],
                "estimated_hours": 8,
                "actual_hours": 6
            },
            "M3-2": {
                "title": "Diseño e implementación de flujos de registro y autorización",
                "description": "Crear componentes de login/registro",
                "milestone": "M3",
                "category": TaskCategory.FRONTEND,
                "status": TaskStatus.IN_PROGRESS,
                "priority": TaskPriority.HIGH,
                "assignee": "Frontend Team",
                "completion_date": None,
                "dependencies": ["M3-1"],
                "estimated_hours": 16,
                "actual_hours": 4
            },
            "M3-3": {
                "title": "Desarrollo de interfaces para iniciar y seguir transacciones ESCROW",
                "description": "Dashboard y formularios de transacciones",
                "milestone": "M3",
                "category": TaskCategory.FRONTEND,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.HIGH,
                "assignee": "Frontend Team",
                "completion_date": None,
                "dependencies": ["M3-2"],
                "estimated_hours": 24,
                "actual_hours": 0
            },
            "M3-4": {
                "title": "Implementación de notificaciones en tiempo real para usuarios",
                "description": "WebSockets y notificaciones push",
                "milestone": "M3",
                "category": TaskCategory.FRONTEND,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Frontend Team",
                "completion_date": None,
                "dependencies": ["M3-3"],
                "estimated_hours": 12,
                "actual_hours": 0
            },
            "M3-5": {
                "title": "Integración de formularios con validaciones dinámicas",
                "description": "Formularios reactivos con validación",
                "milestone": "M3",
                "category": TaskCategory.FRONTEND,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Frontend Team",
                "completion_date": None,
                "dependencies": ["M3-4"],
                "estimated_hours": 8,
                "actual_hours": 0
            },
            # M4 Tasks
            "M4-1": {
                "title": "Implementación de autenticación de dos factores (2FA)",
                "description": "Sistema 2FA preparado para Truora",
                "milestone": "M4",
                "category": TaskCategory.SECURITY,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Security Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M2-2"],
                "estimated_hours": 12,
                "actual_hours": 10
            },
            "M4-2": {
                "title": "Integración con proveedor externo para validación KYC (Truora u otro)",
                "description": "Integrar API de Truora para KYC",
                "milestone": "M4",
                "category": TaskCategory.INTEGRATION,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.HIGH,
                "assignee": "Integration Team",
                "completion_date": None,
                "dependencies": ["M4-1"],
                "estimated_hours": 16,
                "actual_hours": 0
            },
            "M4-3": {
                "title": "Configuración de validación documental automática (INE, RFC, CURP, CFDI)",
                "description": "Validación automática de documentos mexicanos",
                "milestone": "M4",
                "category": TaskCategory.SECURITY,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Security Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M4-2"],
                "estimated_hours": 20,
                "actual_hours": 18
            },
            "M4-4": {
                "title": "Asegurar cifrado y protección de datos sensibles",
                "description": "Implementar bcrypt, JWT, HTTPS",
                "milestone": "M4",
                "category": TaskCategory.SECURITY,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "Security Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M4-3"],
                "estimated_hours": 8,
                "actual_hours": 6
            },
            "M4-5": {
                "title": "Implementación de roles y permisos diferenciados",
                "description": "5 roles con permisos específicos",
                "milestone": "M4",
                "category": TaskCategory.SECURITY,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Security Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M4-4"],
                "estimated_hours": 6,
                "actual_hours": 5
            },
            # M5 Tasks
            "M5-1": {
                "title": "Desarrollo de pruebas unitarias y de integración para backend y frontend",
                "description": "pytest configurado, pruebas pendientes",
                "milestone": "M5",
                "category": TaskCategory.TESTING,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "QA Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M4-5"],
                "estimated_hours": 20,
                "actual_hours": 8
            },
            "M5-2": {
                "title": "Pruebas de penetración y seguridad del sistema",
                "description": "Pruebas de seguridad con herramientas especializadas",
                "milestone": "M5",
                "category": TaskCategory.TESTING,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.HIGH,
                "assignee": "Security Team",
                "completion_date": None,
                "dependencies": ["M5-1"],
                "estimated_hours": 16,
                "actual_hours": 0
            },
            "M5-3": {
                "title": "Automatización de pruebas de flujo completo de usuario (browser automation)",
                "description": "Pruebas end-to-end automatizadas",
                "milestone": "M5",
                "category": TaskCategory.TESTING,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.MEDIUM,
                "assignee": "QA Team",
                "completion_date": None,
                "dependencies": ["M5-2"],
                "estimated_hours": 24,
                "actual_hours": 0
            },
            "M5-4": {
                "title": "Ejecución de pruebas de carga y rendimiento",
                "description": "Pruebas de carga y rendimiento",
                "milestone": "M5",
                "category": TaskCategory.TESTING,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.MEDIUM,
                "assignee": "QA Team",
                "completion_date": None,
                "dependencies": ["M5-3"],
                "estimated_hours": 12,
                "actual_hours": 0
            },
            "M5-5": {
                "title": "Registro y seguimiento de defectos",
                "description": "Sistema de seguimiento de defectos",
                "milestone": "M5",
                "category": TaskCategory.TESTING,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.LOW,
                "assignee": "QA Team",
                "completion_date": None,
                "dependencies": ["M5-4"],
                "estimated_hours": 8,
                "actual_hours": 0
            },
            # M6 Tasks
            "M6-1": {
                "title": "Preparar entorno demo con accesos restringidos",
                "description": "Docker Compose listo para demo",
                "milestone": "M6",
                "category": TaskCategory.DEPLOYMENT,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.HIGH,
                "assignee": "DevOps Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M5-1"],
                "estimated_hours": 4,
                "actual_hours": 2
            },
            "M6-2": {
                "title": "Documentación para usuarios y equipo de soporte",
                "description": "Documentación completa implementada",
                "milestone": "M6",
                "category": TaskCategory.DOCUMENTATION,
                "status": TaskStatus.COMPLETED,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Documentation Team",
                "completion_date": "2024-01-30",
                "dependencies": ["M6-1"],
                "estimated_hours": 16,
                "actual_hours": 20
            },
            "M6-3": {
                "title": "Ejecución de demos en vivo para clientes y stakeholders",
                "description": "Presentaciones demo en vivo",
                "milestone": "M6",
                "category": TaskCategory.DEPLOYMENT,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.HIGH,
                "assignee": "Product Team",
                "completion_date": None,
                "dependencies": ["M6-2"],
                "estimated_hours": 8,
                "actual_hours": 0
            },
            "M6-4": {
                "title": "Retroalimentación y ajustes post-demo",
                "description": "Implementar feedback de stakeholders",
                "milestone": "M6",
                "category": TaskCategory.DEPLOYMENT,
                "status": TaskStatus.PENDING,
                "priority": TaskPriority.MEDIUM,
                "assignee": "Development Team",
                "completion_date": None,
                "dependencies": ["M6-3"],
                "estimated_hours": 16,
                "actual_hours": 0
            }
        }
    
    def create_task(self, 
                   task_id: str,
                   title: str,
                   description: str,
                   milestone: str,
                   category: TaskCategory,
                   priority: TaskPriority = TaskPriority.MEDIUM,
                   assignee: str = None,
                   estimated_hours: int = 0,
                   dependencies: List[str] = None) -> Dict[str, Any]:
        """Create a new project task"""
        
        # Check for duplicates
        duplicate_task = self._find_duplicate_task(title, description)
        if duplicate_task:
            self.session_manager._add_activity(
                "task_duplicate_detected",
                f"Task '{title}' detected as duplicate of task {duplicate_task['task_id']}",
                {"duplicate_of": duplicate_task['task_id']}
            )
            return {
                "success": False,
                "error": "Duplicate task detected",
                "duplicate_of": duplicate_task['task_id']
            }
        
        # Validate milestone exists
        if milestone not in self.milestones:
            return {
                "success": False,
                "error": f"Milestone {milestone} not found"
            }
        
        # Create task
        task = {
            "task_id": task_id,
            "title": title,
            "description": description,
            "milestone": milestone,
            "category": category.value,
            "status": TaskStatus.PENDING.value,
            "priority": priority.value,
            "assignee": assignee,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "dependencies": dependencies or [],
            "estimated_hours": estimated_hours,
            "actual_hours": 0
        }
        
        self.tasks[task_id] = task
        
        # Add to milestone
        if task_id not in self.milestones[milestone]["tasks"]:
            self.milestones[milestone]["tasks"].append(task_id)
        
        # Create session task
        self.task_manager.create_task_with_validation(
            task_id=task_id,
            title=title,
            description=description,
            priority=priority,
            context={"milestone": milestone, "category": category.value}
        )
        
        # Add to session activities
        self.session_manager._add_activity(
            "project_task_created",
            f"Project task '{title}' created for milestone {milestone}",
            {"task_id": task_id, "milestone": milestone}
        )
        
        return {
            "success": True,
            "task": task
        }
    
    def update_task_status(self, task_id: str, status: TaskStatus, 
                          actual_hours: int = None, notes: str = None) -> Dict[str, Any]:
        """Update task status"""
        
        if task_id not in self.tasks:
            return {
                "success": False,
                "error": "Task not found"
            }
        
        task = self.tasks[task_id]
        old_status = task["status"]
        
        # Update task
        task["status"] = status.value
        task["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        if actual_hours is not None:
            task["actual_hours"] = actual_hours
        
        if notes:
            task["notes"] = notes
        
        # Update session task
        self.session_manager.update_task_status(task_id, status, notes)
        
        # Check if milestone should be updated
        self._update_milestone_status(task["milestone"])
        
        # Add to session activities
        self.session_manager._add_activity(
            "project_task_updated",
            f"Project task '{task['title']}' status changed from {old_status} to {status.value}",
            {"task_id": task_id, "old_status": old_status, "new_status": status.value}
        )
        
        # If task is completed, check for critical notifications
        if status == TaskStatus.COMPLETED:
            self._handle_task_completion(task)
        
        return {
            "success": True,
            "task": task
        }
    
    def _find_duplicate_task(self, title: str, description: str) -> Optional[Dict[str, Any]]:
        """Find duplicate tasks"""
        for task in self.tasks.values():
            if (task["title"].lower() == title.lower() or 
                self._calculate_similarity(task["description"], description) > 0.8):
                return task
        return None
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union) if union else 0.0
    
    def _update_milestone_status(self, milestone_id: str):
        """Update milestone status based on task completion"""
        milestone = self.milestones[milestone_id]
        tasks = [self.tasks[task_id] for task_id in milestone["tasks"] if task_id in self.tasks]
        
        if not tasks:
            return
        
        completed_tasks = [t for t in tasks if t["status"] == TaskStatus.COMPLETED.value]
        in_progress_tasks = [t for t in tasks if t["status"] == TaskStatus.IN_PROGRESS.value]
        
        if len(completed_tasks) == len(tasks):
            milestone["status"] = MilestoneStatus.COMPLETED.value
            milestone["completion_date"] = datetime.now(timezone.utc).isoformat()
        elif in_progress_tasks or any(t["status"] == TaskStatus.PENDING.value for t in tasks):
            milestone["status"] = MilestoneStatus.IN_PROGRESS.value
        else:
            milestone["status"] = MilestoneStatus.NOT_STARTED.value
    
    def _handle_task_completion(self, task: Dict[str, Any]):
        """Handle task completion"""
        if task.get("priority") == TaskPriority.CRITICAL.value:
            # Create critical notification for task completion
            self.notification_manager.create_critical_notification(
                notification_type=NotificationType.CRITICAL_CHANGE,
                title=f"Critical Task Completed: {task['title']}",
                message=f"Critical task '{task['title']}' has been completed and requires review.",
                context={
                    "task_id": task["task_id"],
                    "milestone": task["milestone"],
                    "assignee": task["assignee"]
                },
                requires_confirmation=True
            )
    
    def get_project_status(self) -> Dict[str, Any]:
        """Get overall project status"""
        total_tasks = len(self.tasks)
        completed_tasks = len([t for t in self.tasks.values() if t["status"] == TaskStatus.COMPLETED.value])
        in_progress_tasks = len([t for t in self.tasks.values() if t["status"] == TaskStatus.IN_PROGRESS.value])
        pending_tasks = len([t for t in self.tasks.values() if t["status"] == TaskStatus.PENDING.value])
        
        total_estimated_hours = sum(t.get("estimated_hours", 0) for t in self.tasks.values())
        total_actual_hours = sum(t.get("actual_hours", 0) for t in self.tasks.values())
        
        milestone_status = {}
        for milestone_id, milestone in self.milestones.items():
            milestone_tasks = [self.tasks[task_id] for task_id in milestone["tasks"] if task_id in self.tasks]
            milestone_status[milestone_id] = {
                "name": milestone["name"],
                "status": milestone["status"],
                "completion_date": milestone["completion_date"],
                "total_tasks": len(milestone_tasks),
                "completed_tasks": len([t for t in milestone_tasks if t["status"] == TaskStatus.COMPLETED.value]),
                "progress_percentage": (len([t for t in milestone_tasks if t["status"] == TaskStatus.COMPLETED.value]) / len(milestone_tasks) * 100) if milestone_tasks else 0
            }
        
        return {
            "project_name": "FinTech ESCROW Platform",
            "overall_progress": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "in_progress_tasks": in_progress_tasks,
            "pending_tasks": pending_tasks,
            "total_estimated_hours": total_estimated_hours,
            "total_actual_hours": total_actual_hours,
            "efficiency": (total_actual_hours / total_estimated_hours * 100) if total_estimated_hours > 0 else 0,
            "milestones": milestone_status,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    
    def get_tasks_by_milestone(self, milestone_id: str) -> List[Dict[str, Any]]:
        """Get tasks for a specific milestone"""
        if milestone_id not in self.milestones:
            return []
        
        milestone = self.milestones[milestone_id]
        return [self.tasks[task_id] for task_id in milestone["tasks"] if task_id in self.tasks]
    
    def get_tasks_by_status(self, status: TaskStatus) -> List[Dict[str, Any]]:
        """Get tasks by status"""
        return [task for task in self.tasks.values() if task["status"] == status.value]
    
    def get_critical_tasks(self) -> List[Dict[str, Any]]:
        """Get critical tasks"""
        return [task for task in self.tasks.values() 
                if task.get("priority") == TaskPriority.CRITICAL.value and 
                task["status"] != TaskStatus.COMPLETED.value]
    
    def get_overdue_tasks(self) -> List[Dict[str, Any]]:
        """Get overdue tasks"""
        # This is a simplified implementation
        # In production, you would check against deadlines
        return []
    
    def generate_project_report(self) -> str:
        """Generate project report in markdown format"""
        status = self.get_project_status()
        
        report = f"""# FinTech ESCROW Project Report
Generated: {status['last_updated']}

## Project Overview
- **Project Name**: {status['project_name']}
- **Overall Progress**: {status['overall_progress']:.1f}%
- **Total Tasks**: {status['total_tasks']}
- **Completed Tasks**: {status['completed_tasks']}
- **In Progress Tasks**: {status['in_progress_tasks']}
- **Pending Tasks**: {status['pending_tasks']}

## Time Tracking
- **Total Estimated Hours**: {status['total_estimated_hours']}
- **Total Actual Hours**: {status['total_actual_hours']}
- **Efficiency**: {status['efficiency']:.1f}%

## Milestones
"""
        
        for milestone_id, milestone in status['milestones'].items():
            report += f"""
### {milestone_id}: {milestone['name']}
- **Status**: {milestone['status']}
- **Progress**: {milestone['progress_percentage']:.1f}%
- **Tasks**: {milestone['completed_tasks']}/{milestone['total_tasks']}
- **Completion Date**: {milestone['completion_date'] or 'Not completed'}
"""
        
        report += "\n## Critical Tasks\n"
        critical_tasks = self.get_critical_tasks()
        for task in critical_tasks:
            report += f"- **{task['task_id']}**: {task['title']} (Assignee: {task['assignee']})\n"
        
        return report
