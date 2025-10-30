# FinTech ESCROW Platform

Una plataforma de transacciones seguras con sistema ESCROW para compra/venta de artículos, construida con arquitectura de microservicios escalables usando Python FastAPI, Angular y PostgreSQL, siguiendo las mejores prácticas de desarrollo moderno.

## 🚀 Características Principales

### Para Compradores
- **Compra Segura**: Sistema de compra protegido con fondos en custodia hasta satisfacción
- **Proceso de Inspección**: Período de inspección para verificar el artículo recibido
- **Comunicación Directa**: Chat integrado con vendedores durante la transacción
- **Dashboard Personalizado**: Vista completa de compras activas y completadas
- **Notificaciones**: Alertas en tiempo real sobre el estado de las transacciones

### Para Vendedores
- **Venta Protegida**: Garantía de pago antes de entregar el artículo
- **Gestión de Inventario**: Control de artículos en venta y transacciones activas
- **Sistema de Evidencias**: Subida de fotos y documentos para respaldar la venta
- **Reportes de Ventas**: Estadísticas y análisis de rendimiento
- **Protección contra Fraude**: Fondos seguros hasta confirmación del comprador

### Para Administradores
- **Panel de Control**: Vista completa de la plataforma con métricas en tiempo real
- **Gestión de Disputas**: Resolución de conflictos entre compradores y vendedores
- **Monitoreo de Transacciones**: Supervisión de todas las operaciones ESCROW
- **Configuración del Sistema**: Personalización de reglas y parámetros de seguridad

## 🛠️ Tecnologías Utilizadas

### Backend (Microservicios)
- **Python 3.11** - Lenguaje de programación
- **FastAPI** - Framework web moderno y rápido
- **PostgreSQL 15** - Base de datos relacional
- **SQLAlchemy** - ORM para Python
- **Redis** - Cache y sesiones
- **JWT** - Autenticación con tokens
- **bcrypt** - Encriptación de contraseñas
- **Stripe** - Procesamiento de pagos
- **Twilio** - Notificaciones SMS
- **SendGrid** - Notificaciones por email
- **Firebase** - Push notifications

### Frontend
- **Angular 17** - Framework de aplicaciones web
- **TypeScript** - Superset tipado de JavaScript
- **TailwindCSS** - Framework de CSS utilitario
- **Angular Material** - Componentes de UI
- **RxJS** - Programación reactiva
- **Chart.js** - Gráficos y visualizaciones
- **WebSockets** - Comunicación en tiempo real

### Base de Datos
- **PostgreSQL** - Base de datos principal
- **Redis** - Cache y sesiones
- **Índices optimizados** - Para consultas rápidas
- **Triggers** - Automatización de cálculos
- **Extensiones** - UUID y PGCrypto

### DevOps y CI/CD
- **Docker** - Contenedores
- **Docker Compose** - Orquestación local
- **GitHub Actions** - CI/CD automatizado
- **Kubernetes** - Orquestación en producción
- **Prometheus** - Métricas y monitoreo
- **Grafana** - Dashboards

## 📋 Prerrequisitos

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (opcional)
- Cuenta de Stripe (para pagos)
- Cuenta de Twilio (para SMS)
- Cuenta de SendGrid (para emails)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd fintech
```

### 2. Configurar base de datos
```bash
# Iniciar PostgreSQL y Redis con Docker
docker-compose up -d postgres redis

# O instalar localmente
# PostgreSQL: https://www.postgresql.org/download/
# Redis: https://redis.io/download
```

### 3. Configurar variables de entorno
```bash
cd backend
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Base de datos
DATABASE_URL=postgresql://fintech_user:fintech_pass@localhost:5432/fintech_escrow
REDIS_URL=redis://localhost:6379

# Seguridad
SECRET_KEY=tu-super-secret-key-aqui
BCRYPT_ROUNDS=12

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_publishable_key

# Twilio (SMS)
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token

# SendGrid (Email)
SENDGRID_API_KEY=tu_sendgrid_api_key
FROM_EMAIL=noreply@fintech-escrow.com
```

### 4. Instalar dependencias del backend
```bash
cd backend
pip install -r requirements.txt
```

### 5. Instalar dependencias del frontend
```bash
cd frontend-angular
npm install
```

### 6. Ejecutar la aplicación

#### Opción A: Con Docker Compose (Recomendado)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

#### Opción B: Desarrollo local
```bash
# Iniciar microservicios
cd backend
python start_services.py

# En otra terminal, iniciar frontend
cd frontend-angular
ng serve
```

## 📁 Estructura del Proyecto

```
fintech/
├── backend/                    # Backend con microservicios
│   ├── auth_service/          # Servicio de autenticación
│   │   ├── main.py
│   │   └── Dockerfile
│   ├── escrow_service/        # Servicio de transacciones ESCROW
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── Dockerfile
│   ├── payment_service/       # Servicio de pagos
│   │   ├── main.py
│   │   └── Dockerfile
│   ├── notification_service/  # Servicio de notificaciones
│   │   ├── main.py
│   │   └── Dockerfile
│   ├── shared/                # Módulos compartidos
│   │   ├── database.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── auth.py
│   ├── docker-compose.yml
│   ├── init.sql
│   └── requirements.txt
├── frontend-angular/          # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── styles.scss
│   ├── tailwind.config.js
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── ARCHITECTURE.md
├── API_DOCUMENTATION.md
└── README.md
```

## 🔧 Microservicios

### Auth Service (Puerto 8001)
- Registro y autenticación de usuarios
- Verificación de identidad (KYC/AML)
- Gestión de tokens JWT
- Doble factor de autenticación

### ESCROW Service (Puerto 8002)
- Gestión de transacciones ESCROW
- Flujo de estados de transacciones
- Evidencias y documentación
- Resolución de disputas

### Payment Service (Puerto 8003)
- Procesamiento de pagos con Stripe
- Gestión de Payment Intents
- Captura y liberación de fondos
- Reembolsos y disputas

### Notification Service (Puerto 8004)
- Notificaciones por email (SendGrid)
- Notificaciones SMS (Twilio)
- Notificaciones push (Firebase)
- WebSockets para tiempo real

## 🔒 Seguridad

### Autenticación y Autorización
- JWT tokens con refresh tokens
- Roles jerárquicos: admin, advisor, seller, buyer, broker
- Doble factor de autenticación
- Verificación de identidad con Truora

### Protección de Datos
- Encriptación bcrypt para contraseñas
- HTTPS obligatorio en producción
- CORS configurado correctamente
- Rate limiting por IP y usuario
- Validación exhaustiva de datos

### Base de Datos
- Índices optimizados para consultas
- Triggers para automatización
- Constraints de integridad
- Backups automáticos

## 🧪 Testing

```bash
# Tests del backend
cd backend
pytest --cov=shared --cov=auth_service --cov=escrow_service

# Tests del frontend
cd frontend-angular
npm run test

# Tests de integración
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🚀 Despliegue

### Desarrollo Local
```bash
# Iniciar base de datos
docker-compose up -d postgres redis

# Iniciar microservicios
python backend/start_services.py

# Iniciar frontend
cd frontend-angular && ng serve
```

### Producción con Docker
```bash
# Construir y desplegar
docker-compose -f docker-compose.prod.yml up -d

# Verificar servicios
docker-compose ps
```

### Kubernetes (Futuro)
```bash
# Aplicar configuraciones
kubectl apply -f k8s/

# Verificar pods
kubectl get pods
```

## 📊 Monitoreo

### Métricas
- **Prometheus**: Métricas de aplicación
- **Grafana**: Dashboards de monitoreo
- **Health Checks**: Verificación de servicios
- **Logs**: Estructurados en JSON

### Alertas
- **Sentry**: Monitoreo de errores
- **Uptime**: Verificación de disponibilidad
- **Performance**: Métricas de rendimiento

## 🔧 API Documentation

### Swagger/OpenAPI
- **Auth Service**: http://localhost:8001/docs
- **ESCROW Service**: http://localhost:8002/docs
- **Payment Service**: http://localhost:8003/docs
- **Notification Service**: http://localhost:8004/docs

### Postman Collection
```bash
# Importar colección
curl -o fintech-escrow-api.postman_collection.json \
  https://raw.githubusercontent.com/tu-repo/fintech/main/api/fintech-escrow-api.postman_collection.json
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones
- **Commits**: Conventional Commits
- **Branches**: Git Flow
- **Code Style**: Black (Python), Prettier (TypeScript)
- **Testing**: Cobertura mínima 80%

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@fintech-escrow.com
- Documentación: [docs.fintech-escrow.com](https://docs.fintech-escrow.com)
- Issues: [GitHub Issues](https://github.com/tu-usuario/fintech/issues)

## 🎯 Roadmap

### Fase 1 (Completada)
- ✅ Microservicios básicos
- ✅ Autenticación y autorización
- ✅ Sistema ESCROW completo
- ✅ Integración con Stripe
- ✅ Notificaciones en tiempo real

### Fase 2 (Próximos 3 meses)
- [ ] Integración con Truora
- [ ] Sistema de KYC/AML completo
- [ ] Análisis de riesgo con IA
- [ ] API pública para terceros

### Fase 3 (Próximos 6 meses)
- [ ] Kubernetes y autoescalado
- [ ] Machine Learning para detección de fraude
- [ ] Integración con bancos (Open Banking)
- [ ] Blockchain para auditoría

### Fase 4 (Próximos 12 meses)
- [ ] Microservicios en múltiples regiones
- [ ] IA generativa para contratos
- [ ] Integración con IoT
- [ ] Realidad aumentada para inspecciones

---

**Desarrollado con ❤️ por el equipo de FinTech ESCROW**

*Arquitectura moderna, escalable y segura para transacciones protegidas*
