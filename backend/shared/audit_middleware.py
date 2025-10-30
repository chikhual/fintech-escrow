"""
Audit Middleware for FinTech ESCROW Platform
Handles audit logging, validation, and compliance tracking
"""
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import json
import uuid
from .session_manager import SessionManager, TaskManager, TaskPriority
from .auth import get_current_user
from .database import get_db
from sqlalchemy.orm import Session

class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware for audit logging and compliance tracking"""
    
    def __init__(self, app, service_name: str):
        super().__init__(app)
        self.service_name = service_name
        self.sensitive_endpoints = [
            "/transactions",
            "/payments",
            "/users",
            "/documents",
            "/notifications"
        ]
        self.critical_operations = [
            "POST /transactions",
            "PUT /transactions/*/pay",
            "PUT /transactions/*/approve",
            "POST /payments",
            "PUT /payments/*/capture",
            "PUT /payments/*/refund"
        ]
    
    async def dispatch(self, request: Request, call_next):
        """Process request and response with audit logging"""
        
        # Generate request ID for tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Start timing
        start_time = datetime.now(timezone.utc)
        
        # Extract user information if available
        user_id = None
        user_role = None
        try:
            # Try to get current user from token
            if "authorization" in request.headers:
                # This is a simplified approach - in production, use proper JWT validation
                user_id = 1  # Placeholder - should extract from JWT
                user_role = "user"  # Placeholder - should extract from JWT
        except Exception:
            pass
        
        # Log request
        await self._log_request(request, request_id, user_id, user_role)
        
        # Check for critical operations
        is_critical = self._is_critical_operation(request.method, str(request.url))
        if is_critical:
            await self._log_critical_operation(request, request_id, user_id, user_role)
        
        # Process request
        try:
            response = await call_next(request)
            
            # Log response
            await self._log_response(request, response, request_id, start_time, user_id, user_role)
            
            return response
            
        except HTTPException as e:
            # Log error
            await self._log_error(request, e, request_id, start_time, user_id, user_role)
            raise e
        except Exception as e:
            # Log unexpected error
            await self._log_unexpected_error(request, e, request_id, start_time, user_id, user_role)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "Internal server error", "request_id": request_id}
            )
    
    async def _log_request(self, request: Request, request_id: str, user_id: Optional[int], user_role: Optional[str]):
        """Log incoming request"""
        log_data = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "method": request.method,
            "url": str(request.url),
            "user_id": user_id,
            "user_role": user_role,
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "content_type": request.headers.get("content-type"),
            "content_length": request.headers.get("content-length")
        }
        
        # Log to file (in production, use proper logging service)
        print(f"AUDIT REQUEST: {json.dumps(log_data)}")
    
    async def _log_response(self, request: Request, response: Response, request_id: str, 
                           start_time: datetime, user_id: Optional[int], user_role: Optional[str]):
        """Log response"""
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        
        log_data = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "duration_seconds": duration,
            "user_id": user_id,
            "user_role": user_role
        }
        
        print(f"AUDIT RESPONSE: {json.dumps(log_data)}")
    
    async def _log_error(self, request: Request, error: HTTPException, request_id: str,
                        start_time: datetime, user_id: Optional[int], user_role: Optional[str]):
        """Log HTTP error"""
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        
        log_data = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "method": request.method,
            "url": str(request.url),
            "error_type": "HTTP_ERROR",
            "status_code": error.status_code,
            "error_message": str(error.detail),
            "duration_seconds": duration,
            "user_id": user_id,
            "user_role": user_role
        }
        
        print(f"AUDIT ERROR: {json.dumps(log_data)}")
    
    async def _log_unexpected_error(self, request: Request, error: Exception, request_id: str,
                                   start_time: datetime, user_id: Optional[int], user_role: Optional[str]):
        """Log unexpected error"""
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()
        
        log_data = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "method": request.method,
            "url": str(request.url),
            "error_type": "UNEXPECTED_ERROR",
            "error_message": str(error),
            "duration_seconds": duration,
            "user_id": user_id,
            "user_role": user_role
        }
        
        print(f"AUDIT UNEXPECTED ERROR: {json.dumps(log_data)}")
    
    async def _log_critical_operation(self, request: Request, request_id: str, 
                                     user_id: Optional[int], user_role: Optional[str]):
        """Log critical operations that require special attention"""
        log_data = {
            "request_id": request_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": self.service_name,
            "operation_type": "CRITICAL_OPERATION",
            "method": request.method,
            "url": str(request.url),
            "user_id": user_id,
            "user_role": user_role,
            "requires_confirmation": True
        }
        
        print(f"AUDIT CRITICAL: {json.dumps(log_data)}")
    
    def _is_critical_operation(self, method: str, url: str) -> bool:
        """Check if operation is critical"""
        operation = f"{method} {url.split('?')[0]}"  # Remove query parameters
        
        for critical_op in self.critical_operations:
            if self._match_pattern(operation, critical_op):
                return True
        return False
    
    def _match_pattern(self, operation: str, pattern: str) -> bool:
        """Match operation against pattern (supports wildcards)"""
        if "*" in pattern:
            # Simple wildcard matching
            pattern_parts = pattern.split("*")
            if len(pattern_parts) == 2:
                return operation.startswith(pattern_parts[0]) and operation.endswith(pattern_parts[1])
        return operation == pattern


class ComplianceValidator:
    """Validates operations against compliance rules"""
    
    def __init__(self):
        self.kyc_required_operations = [
            "POST /transactions",
            "POST /payments",
            "PUT /transactions/*/pay"
        ]
        self.dual_approval_required = [
            "PUT /transactions/*/approve",
            "PUT /payments/*/capture"
        ]
    
    def validate_kyc_requirement(self, user: Dict[str, Any], operation: str) -> Dict[str, Any]:
        """Validate KYC requirements for operation"""
        if not self._is_kyc_required_operation(operation):
            return {"valid": True}
        
        if not user.get("is_identity_verified", False):
            return {
                "valid": False,
                "error": "Identity verification required for this operation",
                "required_documents": ["INE", "CURP", "RFC", "Proof of Address"]
            }
        
        if not user.get("is_kyc_verified", False):
            return {
                "valid": False,
                "error": "KYC verification required for this operation",
                "required_documents": ["Bank Statement", "Proof of Income"]
            }
        
        return {"valid": True}
    
    def validate_dual_approval(self, operation: str, current_user: Dict[str, Any], 
                              other_party: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Validate dual approval requirements"""
        if not self._is_dual_approval_required(operation):
            return {"valid": True}
        
        # Check if both parties have approved
        # This is a simplified check - in production, implement proper approval tracking
        return {
            "valid": True,
            "requires_confirmation": True,
            "message": "This operation requires confirmation from both parties"
        }
    
    def validate_escrow_flow(self, transaction_status: str, operation: str) -> Dict[str, Any]:
        """Validate ESCROW flow compliance"""
        valid_transitions = {
            "pending_agreement": ["accept", "cancel"],
            "pending_payment": ["pay", "cancel"],
            "payment_received": ["ship"],
            "item_shipped": ["deliver"],
            "inspection_period": ["approve", "dispute"],
            "buyer_approved": ["seller_approve"],
            "funds_released": []
        }
        
        if transaction_status not in valid_transitions:
            return {
                "valid": False,
                "error": f"Invalid transaction status: {transaction_status}"
            }
        
        allowed_operations = valid_transitions[transaction_status]
        if operation not in allowed_operations:
            return {
                "valid": False,
                "error": f"Operation '{operation}' not allowed for status '{transaction_status}'",
                "allowed_operations": allowed_operations
            }
        
        return {"valid": True}
    
    def _is_kyc_required_operation(self, operation: str) -> bool:
        """Check if operation requires KYC verification"""
        for kyc_op in self.kyc_required_operations:
            if self._match_pattern(operation, kyc_op):
                return True
        return False
    
    def _is_dual_approval_required(self, operation: str) -> bool:
        """Check if operation requires dual approval"""
        for dual_op in self.dual_approval_required:
            if self._match_pattern(operation, dual_op):
                return True
        return False
    
    def _match_pattern(self, operation: str, pattern: str) -> bool:
        """Match operation against pattern (supports wildcards)"""
        if "*" in pattern:
            pattern_parts = pattern.split("*")
            if len(pattern_parts) == 2:
                return operation.startswith(pattern_parts[0]) and operation.endswith(pattern_parts[1])
        return operation == pattern


class DocumentGenerator:
    """Generates contracts, checklists, and templates with AI assistance"""
    
    def __init__(self):
        self.templates = {
            "escrow_contract": "templates/escrow_contract.md",
            "kyc_checklist": "templates/kyc_checklist.md",
            "dispute_resolution": "templates/dispute_resolution.md"
        }
    
    def generate_escrow_contract(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate ESCROW contract with AI assistance"""
        # This is a placeholder - in production, integrate with AI service
        contract = {
            "contract_id": f"ESC-CONTRACT-{uuid.uuid4().hex[:8].upper()}",
            "parties": {
                "buyer": transaction_data.get("buyer"),
                "seller": transaction_data.get("seller")
            },
            "item": transaction_data.get("item"),
            "terms": transaction_data.get("terms"),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "requires_human_review": True,
            "ai_generated": True,
            "review_deadline": (datetime.now(timezone.utc).timestamp() + 24 * 3600)  # 24 hours
        }
        
        return contract
    
    def generate_kyc_checklist(self, user_role: str) -> Dict[str, Any]:
        """Generate KYC checklist based on user role"""
        checklists = {
            "buyer": [
                "Valid government-issued ID (INE)",
                "CURP verification",
                "RFC verification",
                "Proof of address (utility bill)",
                "Bank statement (last 3 months)",
                "Proof of income"
            ],
            "seller": [
                "Valid government-issued ID (INE)",
                "CURP verification",
                "RFC verification",
                "Proof of address (utility bill)",
                "Business registration (if applicable)",
                "Tax compliance certificate"
            ]
        }
        
        return {
            "checklist_id": f"KYC-{user_role.upper()}-{uuid.uuid4().hex[:8].upper()}",
            "user_role": user_role,
            "required_documents": checklists.get(user_role, []),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "requires_human_review": False,
            "ai_generated": True
        }
    
    def generate_dispute_resolution_template(self, dispute_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate dispute resolution template"""
        return {
            "template_id": f"DISPUTE-{uuid.uuid4().hex[:8].upper()}",
            "dispute_type": dispute_data.get("reason"),
            "parties": dispute_data.get("parties"),
            "resolution_steps": [
                "Initial assessment and documentation",
                "Evidence collection and verification",
                "Mediation attempt with both parties",
                "Independent evaluation if mediation fails",
                "Final decision and implementation"
            ],
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "requires_human_review": True,
            "ai_generated": True
        }


class OnboardingAssistant:
    """Assists with user onboarding process"""
    
    def __init__(self):
        self.required_fields = {
            "personal": ["first_name", "last_name", "email", "phone"],
            "identity": ["curp", "rfc", "ine_number"],
            "address": ["address_street", "address_city", "address_state", "address_zip_code"],
            "financial": ["monthly_income", "employment_status"]
        }
    
    def validate_onboarding_step(self, step: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate onboarding step data"""
        required_fields = self.required_fields.get(step, [])
        missing_fields = []
        invalid_fields = []
        
        for field in required_fields:
            if field not in data or not data[field]:
                missing_fields.append(field)
            elif not self._validate_field(field, data[field]):
                invalid_fields.append(field)
        
        return {
            "valid": len(missing_fields) == 0 and len(invalid_fields) == 0,
            "missing_fields": missing_fields,
            "invalid_fields": invalid_fields,
            "next_step": self._get_next_step(step, missing_fields, invalid_fields)
        }
    
    def _validate_field(self, field: str, value: str) -> bool:
        """Validate individual field"""
        validators = {
            "email": lambda v: "@" in v and "." in v,
            "phone": lambda v: len(v) >= 10 and v.replace("+", "").replace("-", "").replace(" ", "").isdigit(),
            "curp": lambda v: len(v) == 18 and v.isalnum(),
            "rfc": lambda v: len(v) >= 10 and v.isalnum(),
            "ine_number": lambda v: len(v) >= 18 and v.isdigit(),
            "monthly_income": lambda v: v.isdigit() and int(v) > 0
        }
        
        validator = validators.get(field)
        return validator(value) if validator else True
    
    def _get_next_step(self, current_step: str, missing_fields: list, invalid_fields: list) -> str:
        """Get next onboarding step"""
        if missing_fields or invalid_fields:
            return current_step
        
        step_order = ["personal", "identity", "address", "financial"]
        current_index = step_order.index(current_step) if current_step in step_order else 0
        
        if current_index < len(step_order) - 1:
            return step_order[current_index + 1]
        
        return "complete"
    
    def generate_onboarding_guidance(self, step: str, errors: Dict[str, Any]) -> Dict[str, Any]:
        """Generate guidance for onboarding step"""
        guidance = {
            "step": step,
            "title": f"Complete {step.title()} Information",
            "instructions": [],
            "tips": [],
            "examples": {}
        }
        
        if step == "personal":
            guidance["instructions"] = [
                "Enter your full legal name as it appears on official documents",
                "Use a valid email address for account verification",
                "Provide a phone number where you can be reached"
            ]
            guidance["examples"] = {
                "email": "example@email.com",
                "phone": "+52 55 1234 5678"
            }
        elif step == "identity":
            guidance["instructions"] = [
                "Enter your CURP exactly as it appears on your official ID",
                "Provide your RFC for tax purposes",
                "Enter your INE number without spaces or dashes"
            ]
            guidance["tips"] = [
                "CURP should be 18 characters long",
                "RFC should be at least 10 characters",
                "INE number should be 18 digits"
            ]
        
        return guidance
