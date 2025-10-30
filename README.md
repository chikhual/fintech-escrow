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

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación y autorización
- **Stripe** - Procesamiento de pagos
- **Multer** - Manejo de archivos
- **Bcrypt** - Encriptación de contraseñas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Material-UI** - Componentes de interfaz
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos y visualizaciones

### Seguridad
- **Helmet** - Headers de seguridad
- **Rate Limiting** - Protección contra ataques
- **CORS** - Control de acceso
- **Validación de Datos** - Sanitización de entradas
- **Encriptación** - Protección de datos sensibles

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn
- Cuenta de Stripe (para pagos)

## 🚀 Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd fintech
```

### 2. Instalar dependencias del backend
```bash
npm install
```

### 3. Instalar dependencias del frontend
```bash
cd client
npm install
cd ..
```

### 4. Configurar variables de entorno
```bash
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/fintech_loans

# Servidor
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRE=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_publishable_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
```

### 5. Iniciar MongoDB
```bash
# En macOS con Homebrew
brew services start mongodb-community

# En Ubuntu/Debian
sudo systemctl start mongod

# En Windows
net start MongoDB
```

### 6. Ejecutar la aplicación
```bash
# Desarrollo (backend y frontend simultáneamente)
npm run dev

# O ejecutar por separado:
# Backend
npm run server

# Frontend
npm run client
```

## 📁 Estructura del Proyecto

```
fintech/
├── client/                 # Aplicación React
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Contextos de React
│   │   ├── pages/          # Páginas de la aplicación
│   │   └── App.tsx
│   └── package.json
├── models/                 # Modelos de MongoDB
│   ├── User.js
│   ├── Loan.js
│   └── Payment.js
├── routes/                 # Rutas de la API
│   ├── auth.js
│   ├── users.js
│   ├── loans.js
│   ├── payments.js
│   ├── documents.js
│   └── notifications.js
├── middleware/             # Middleware personalizado
│   ├── auth.js
│   └── validation.js
├── uploads/               # Archivos subidos
├── server.js              # Servidor principal
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/change-password` - Cambiar contraseña

### Usuarios
- `GET /api/users/profile` - Obtener perfil
- `PUT /api/users/profile` - Actualizar perfil
- `GET /api/users` - Listar usuarios (admin)
- `PUT /api/users/:id/status` - Cambiar estado de usuario

### Préstamos
- `POST /api/loans` - Crear préstamo
- `GET /api/loans` - Listar préstamos
- `GET /api/loans/:id` - Obtener préstamo
- `PUT /api/loans/:id/approve` - Aprobar préstamo
- `PUT /api/loans/:id/reject` - Rechazar préstamo
- `PUT /api/loans/:id/fund` - Financiar préstamo

### Pagos
- `POST /api/payments` - Crear pago
- `GET /api/payments` - Listar pagos
- `GET /api/payments/:id` - Obtener pago
- `PUT /api/payments/:id/retry` - Reintentar pago
- `POST /api/payments/:id/refund` - Procesar reembolso

### Documentos
- `POST /api/documents/upload` - Subir documento
- `GET /api/documents` - Listar documentos
- `GET /api/documents/:id/download` - Descargar documento
- `DELETE /api/documents/:id` - Eliminar documento

### Notificaciones
- `GET /api/notifications` - Listar notificaciones
- `PUT /api/notifications/:id/read` - Marcar como leída
- `PUT /api/notifications/read-all` - Marcar todas como leídas
- `DELETE /api/notifications/:id` - Eliminar notificación

## 🔒 Seguridad

### Autenticación y Autorización
- JWT tokens para autenticación
- Roles de usuario (borrower, lender, broker, admin)
- Middleware de protección de rutas
- Verificación de permisos por recurso

### Validación de Datos
- Validación de entrada en todas las rutas
- Sanitización de datos de usuario
- Validación de archivos subidos
- Límites de tamaño de archivo

### Protección de API
- Rate limiting para prevenir abuso
- Headers de seguridad con Helmet
- CORS configurado correctamente
- Validación de tokens JWT

## 🧪 Testing

```bash
# Ejecutar tests del backend
npm test

# Ejecutar tests del frontend
cd client
npm test
```

## 🚀 Despliegue

### Variables de Entorno de Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb://tu-cluster-mongodb
JWT_SECRET=tu-jwt-secret-super-seguro
STRIPE_SECRET_KEY=sk_live_tu_stripe_live_key
FRONTEND_URL=https://tu-dominio.com
API_URL=https://api.tu-dominio.com
```

### Despliegue en Heroku
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login en Heroku
heroku login

# Crear aplicación
heroku create tu-app-name

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=tu-mongodb-uri
heroku config:set JWT_SECRET=tu-jwt-secret

# Desplegar
git push heroku main
```

## 📊 Monitoreo y Logs

- Logs estructurados con Morgan
- Métricas de rendimiento
- Monitoreo de errores
- Alertas de seguridad

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@fintechloans.com
- Documentación: [docs.fintechloans.com](https://docs.fintechloans.com)
- Issues: [GitHub Issues](https://github.com/tu-usuario/fintech/issues)

## 🎯 Roadmap

### Próximas Características
- [ ] Integración con más procesadores de pago
- [ ] API móvil nativa
- [ ] Sistema de calificaciones
- [ ] Chat en tiempo real
- [ ] Integración con bancos
- [ ] Análisis de riesgo con IA
- [ ] Marketplace de préstamos
- [ ] Sistema de referidos

### Mejoras Técnicas
- [ ] Tests de integración
- [ ] CI/CD pipeline
- [ ] Monitoreo avanzado
- [ ] Caché con Redis
- [ ] Microservicios
- [ ] Docker containers
- [ ] Kubernetes deployment

---

**Desarrollado con ❤️ por el equipo de FinTech Loans**
