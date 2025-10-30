# FinTech ESCROW - Test Suite

Este directorio contiene todas las pruebas automatizadas para la plataforma FinTech ESCROW, incluyendo pruebas end-to-end, de integración, de rendimiento y de seguridad.

## Estructura del Directorio

```
tests/
├── e2e/                    # Pruebas end-to-end con Playwright
│   ├── 01-auth.test.ts     # Flujos de autenticación
│   ├── 02-escrow.test.ts   # Flujos de transacciones ESCROW
│   ├── 03-payment.test.ts  # Flujos de pagos
│   ├── 04-admin.test.ts    # Funciones administrativas
│   ├── 05-performance.test.ts # Pruebas de rendimiento
│   ├── 06-security.test.ts # Pruebas de seguridad
│   ├── 07-mobile.test.ts   # Experiencia móvil
│   └── 08-integration.test.ts # Pruebas de integración
├── api/                    # Pruebas de API
│   ├── auth.test.ts        # API de autenticación
│   └── transactions.test.ts # API de transacciones
├── integration/            # Pruebas de integración
│   ├── database.test.ts    # Integración con base de datos
│   └── external-services.test.ts # Servicios externos
├── load-tests/            # Pruebas de carga
│   ├── load-test.yml      # Prueba de carga normal
│   ├── stress-test.yml    # Prueba de estrés
│   ├── spike-test.yml     # Prueba de picos
│   └── volume-test.yml    # Prueba de volumen
├── fixtures/              # Datos de prueba
│   └── sample-data.json   # Datos de muestra
├── pages/                 # Page Objects
│   ├── auth-page.ts       # Página de autenticación
│   ├── escrow-page.ts     # Página de transacciones
│   └── dashboard-page.ts  # Página de dashboard
├── global-setup.ts        # Configuración global
├── global-teardown.ts     # Limpieza global
└── README.md             # Este archivo
```

## Tipos de Pruebas

### 1. Pruebas End-to-End (E2E)
- **Herramienta**: Playwright
- **Cobertura**: 20 user journeys completos
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Mobile, Tablet

### 2. Pruebas de API
- **Herramienta**: Playwright + Jest
- **Cobertura**: Todos los endpoints REST
- **Validaciones**: Respuestas, códigos de estado, esquemas

### 3. Pruebas de Integración
- **Base de Datos**: PostgreSQL, Redis
- **Servicios Externos**: Stripe, SendGrid, Twilio, Firebase, Truora
- **APIs**: Webhooks, WebSockets

### 4. Pruebas de Carga
- **Herramienta**: Artillery
- **Tipos**: Carga normal, estrés, picos, volumen
- **Métricas**: Tiempo de respuesta, throughput, errores

### 5. Pruebas de Seguridad
- **Inyección SQL**: Prevención de ataques
- **XSS**: Cross-site scripting
- **CSRF**: Cross-site request forgery
- **Autenticación**: Bypass, sesiones
- **Autorización**: Control de acceso

## Comandos de Ejecución

### Instalación
```bash
npm install
npm run test:install
```

### Pruebas E2E
```bash
# Todas las pruebas
npm run test

# Pruebas específicas
npm run test:auth
npm run test:escrow
npm run test:payment
npm run test:admin

# Pruebas por categoría
npm run test:smoke
npm run test:regression
npm run test:performance
npm run test:security

# Pruebas móviles
npm run test:mobile

# Pruebas con interfaz
npm run test:ui

# Pruebas en modo debug
npm run test:debug
```

### Pruebas de API
```bash
npm run test:api
```

### Pruebas de Integración
```bash
npm run test:integration
```

### Pruebas de Carga
```bash
# Carga normal
npm run test:load

# Prueba de estrés
npm run test:stress

# Prueba de picos
npm run test:spike

# Prueba de volumen
npm run test:volume
```

### Todas las Pruebas
```bash
npm run test:all
```

## Configuración

### Variables de Entorno
```bash
# Base URL
BASE_URL=http://localhost:4200

# API Base URL
API_BASE_URL=http://localhost:8000

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/fintech_escrow

# Redis
REDIS_URL=redis://localhost:6379

# Servicios externos
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
FIREBASE_SERVICE_ACCOUNT_KEY=...
TRUORA_API_KEY=...
```

### Configuración de Playwright
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Mobile (iPhone, Android)
- **Timeouts**: 60s para pruebas, 10s para expectativas
- **Retries**: 2 en CI, 0 en local
- **Workers**: 1 en CI, 4 en local

## User Journeys Cubiertos

### 1. Autenticación y Onboarding
- Registro de usuario
- Verificación de email
- Verificación KYC
- Configuración 2FA
- Recuperación de contraseña

### 2. Transacciones ESCROW
- Creación de transacción
- Aceptación de transacción
- Proceso de pago
- Envío de producto
- Confirmación de entrega
- Aprobación de transacción

### 3. Resolución de Disputas
- Creación de disputa
- Revisión de evidencias
- Resolución de disputa
- Procesamiento de reembolsos

### 4. Funciones Administrativas
- Gestión de usuarios
- Gestión de transacciones
- Resolución de disputas
- Reportes y métricas
- Configuración del sistema

### 5. Experiencia Móvil
- Navegación móvil
- Formularios táctiles
- Notificaciones push
- Funcionalidad offline

## Métricas de Calidad

### Cobertura de Código
- **Objetivo**: >90%
- **Backend**: Python + FastAPI
- **Frontend**: Angular + TypeScript

### Tiempo de Ejecución
- **Pruebas E2E**: <30 minutos
- **Pruebas API**: <5 minutos
- **Pruebas de Carga**: <10 minutos

### Tiempo de Respuesta
- **Páginas**: <3 segundos
- **APIs**: <500ms
- **Base de datos**: <100ms

## Reportes

### HTML Report
```bash
npm run test:report
```

### Allure Report
```bash
npm run test:ui
```

### JSON Report
```bash
npm run test:ci
```

## Integración CI/CD

### GitHub Actions
- Ejecución automática en PRs
- Reportes de cobertura
- Notificaciones de fallos
- Artefactos de pruebas

### Criterios de Aprobación
- Todas las pruebas pasan
- Cobertura >90%
- Tiempo de ejecución <30 min
- Sin vulnerabilidades críticas

## Troubleshooting

### Problemas Comunes

1. **Timeouts**: Aumentar timeouts en configuración
2. **Flaky Tests**: Revisar selectores y esperas
3. **Datos de Prueba**: Verificar fixtures y setup
4. **Servicios Externos**: Verificar conectividad

### Debug
```bash
# Modo debug
npm run test:debug

# Con trace
npm run test:trace

# Con video
npm run test:video

# Con screenshots
npm run test:screenshot
```

### Logs
- **Playwright**: `test-results/`
- **Allure**: `allure-results/`
- **Coverage**: `coverage/`

## Contribución

### Agregar Nuevas Pruebas
1. Crear archivo en directorio apropiado
2. Seguir convenciones de nomenclatura
3. Incluir documentación
4. Agregar a CI/CD

### Convenciones
- **Archivos**: `*.test.ts` para pruebas
- **Describe**: `'Feature Name'`
- **Test**: `'should do something'`
- **Tags**: `@smoke`, `@regression`, `@performance`

### Page Objects
- Un archivo por página
- Métodos públicos para interacciones
- Validaciones en tests, no en page objects
- Reutilización entre tests

## Recursos

- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Artillery Documentation](https://artillery.io/)
- [Allure Report](https://docs.qameta.io/allure/)
- [User Journeys Document](../USER_JOURNEYS.md)
