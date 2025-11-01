"""
Notification service utilities
Handles sending emails, SMS, and push notifications
"""
import os
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from .models import User, Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str = "email",
    metadata: Optional[Dict[str, Any]] = None
) -> Notification:
    """Create a notification record"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        notification_metadata=metadata or {},
        is_sent=False,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


async def send_email_notification(
    to_email: str,
    subject: str,
    html_content: str,
    user_id: Optional[int] = None,
    db: Optional[Session] = None
) -> bool:
    """
    Send email notification
    TODO: Integrate with SendGrid, AWS SES, or similar service
    """
    # For now, just log the email (in production, use real email service)
    print(f"[EMAIL] To: {to_email}")
    print(f"[EMAIL] Subject: {subject}")
    print(f"[EMAIL] Content: {html_content[:100]}...")
    
    # Create notification record if user_id and db provided
    if user_id and db:
        create_notification(
            db=db,
            user_id=user_id,
            title=subject,
            message=html_content,
            notification_type="email",
            metadata={"to_email": to_email}
        )
    
    # TODO: Actual email sending implementation
    # Example with SendGrid:
    # import sendgrid
    # from sendgrid.helpers.mail import Mail
    # 
    # sg = sendgrid.SendGridAPIClient(api_key=os.getenv("SENDGRID_API_KEY"))
    # message = Mail(
    #     from_email=os.getenv("FROM_EMAIL"),
    #     to_emails=to_email,
    #     subject=subject,
    #     html_content=html_content
    # )
    # response = sg.send(message)
    # return response.status_code == 202
    
    return True


async def send_sms_notification(
    to_phone: str,
    message: str,
    user_id: Optional[int] = None,
    db: Optional[Session] = None
) -> bool:
    """
    Send SMS notification
    TODO: Integrate with Twilio or similar service
    """
    # For now, just log the SMS (in production, use real SMS service)
    print(f"[SMS] To: {to_phone}")
    print(f"[SMS] Message: {message}")
    
    # Create notification record if user_id and db provided
    if user_id and db:
        create_notification(
            db=db,
            user_id=user_id,
            title="SMS Notification",
            message=message,
            notification_type="sms",
            metadata={"to_phone": to_phone}
        )
    
    # TODO: Actual SMS sending implementation
    # Example with Twilio:
    # from twilio.rest import Client
    # 
    # client = Client(
    #     os.getenv("TWILIO_ACCOUNT_SID"),
    #     os.getenv("TWILIO_AUTH_TOKEN")
    # )
    # 
    # message = client.messages.create(
    #     body=message,
    #     from_=os.getenv("TWILIO_PHONE_NUMBER"),
    #     to=to_phone
    # )
    # return message.sid is not None
    
    return True


async def send_verification_email(
    db: Session,
    user: User,
    verification_token: str
) -> bool:
    """Send email verification email"""
    verification_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:4200')}/consufin/verificar-email?token={verification_token}"
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Verifica tu correo electrónico</h2>
            <p>Hola {user.first_name},</p>
            <p>Gracias por registrarte en CONSUFIN. Por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
            <p><a href="{verification_url}" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verificar Email</a></p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p>{verification_url}</p>
            <p>Este enlace expirará en 24 horas.</p>
            <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
            <p>Saludos,<br>El equipo de CONSUFIN</p>
        </body>
    </html>
    """
    
    return await send_email_notification(
        to_email=user.email,
        subject="Verifica tu correo electrónico - CONSUFIN",
        html_content=html_content,
        user_id=user.id,
        db=db
    )


async def send_welcome_notification(
    db: Session,
    user: User
) -> bool:
    """Send welcome notification after registration"""
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>¡Bienvenido a CONSUFIN!</h2>
            <p>Hola {user.first_name},</p>
            <p>Tu cuenta ha sido creada exitosamente. Estamos aquí para ayudarte a realizar transacciones seguras con ESCROW.</p>
            <p>Próximos pasos:</p>
            <ul>
                <li>Verifica tu correo electrónico</li>
                <li>Verifica tu número de teléfono</li>
                <li>Completa tu perfil y documentos KYC</li>
            </ul>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <p>Saludos,<br>El equipo de CONSUFIN</p>
        </body>
    </html>
    """
    
    return await send_email_notification(
        to_email=user.email,
        subject="¡Bienvenido a CONSUFIN!",
        html_content=html_content,
        user_id=user.id,
        db=db
    )


async def send_phone_verification_code(
    db: Session,
    user: User,
    code: str
) -> bool:
    """Send phone verification SMS"""
    message = f"Tu código de verificación de CONSUFIN es: {code}. Válido por 10 minutos."
    
    return await send_sms_notification(
        to_phone=user.phone or "",
        message=message,
        user_id=user.id,
        db=db
    )


async def send_verification_status_update(
    db: Session,
    user: User,
    document_type: str,
    status: str
) -> bool:
    """Send notification when document verification status changes"""
    status_messages = {
        "approved": "ha sido aprobado",
        "rejected": "ha sido rechazado",
        "pending": "está en revisión"
    }
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Actualización de Verificación</h2>
            <p>Hola {user.first_name},</p>
            <p>Tu documento {document_type} {status_messages.get(status, 'tiene un cambio de estado')}.</p>
            <p>Puedes revisar el estado de tus documentos en tu panel de usuario.</p>
            <p>Saludos,<br>El equipo de CONSUFIN</p>
        </body>
    </html>
    """
    
    return await send_email_notification(
        to_email=user.email,
        subject=f"Actualización de verificación - {document_type}",
        html_content=html_content,
        user_id=user.id,
        db=db
    )


async def send_kyc_completion_notification(
    db: Session,
    user: User
) -> bool:
    """Send notification when KYC is fully completed"""
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>¡Verificación KYC Completada!</h2>
            <p>Hola {user.first_name},</p>
            <p>¡Felicitaciones! Tu proceso de verificación KYC ha sido completado exitosamente.</p>
            <p>Ahora puedes:</p>
            <ul>
                <li>Realizar transacciones sin restricciones</li>
                <li>Acceder a todas las funcionalidades de la plataforma</li>
                <li>Disfrutar de beneficios exclusivos</li>
            </ul>
            <p>Saludos,<br>El equipo de CONSUFIN</p>
        </body>
    </html>
    """
    
    return await send_email_notification(
        to_email=user.email,
        subject="¡Verificación KYC Completada!",
        html_content=html_content,
        user_id=user.id,
        db=db
    )

