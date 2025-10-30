const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para registro de usuario
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  
  body('phone')
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  
  body('address.street')
    .notEmpty()
    .withMessage('La calle es requerida'),
  
  body('address.city')
    .notEmpty()
    .withMessage('La ciudad es requerida'),
  
  body('address.state')
    .notEmpty()
    .withMessage('El estado es requerido'),
  
  body('address.zipCode')
    .notEmpty()
    .withMessage('El código postal es requerido'),
  
  body('address.country')
    .notEmpty()
    .withMessage('El país es requerido'),
  
  handleValidationErrors
];

// Validaciones para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  
  handleValidationErrors
];

// Validaciones para préstamos
const validateLoanApplication = [
  body('principalAmount')
    .isNumeric()
    .withMessage('El monto principal debe ser numérico')
    .isFloat({ min: 1000, max: 10000000 })
    .withMessage('El monto debe estar entre $1,000 y $10,000,000'),
  
  body('interestRate')
    .isNumeric()
    .withMessage('La tasa de interés debe ser numérica')
    .isFloat({ min: 0, max: 50 })
    .withMessage('La tasa de interés debe estar entre 0% y 50%'),
  
  body('termMonths')
    .isInt({ min: 1, max: 360 })
    .withMessage('El plazo debe estar entre 1 y 360 meses'),
  
  body('collateral.hasCollateral')
    .optional()
    .isBoolean()
    .withMessage('hasCollateral debe ser un booleano'),
  
  body('collateral.type')
    .optional()
    .isIn(['real_estate', 'vehicle', 'equipment', 'inventory', 'securities', 'other'])
    .withMessage('Tipo de garantía inválido'),
  
  body('collateral.estimatedValue')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('El valor estimado debe ser un número positivo'),
  
  handleValidationErrors
];

// Validaciones para pagos
const validatePayment = [
  body('amount')
    .isNumeric()
    .withMessage('El monto debe ser numérico')
    .isFloat({ min: 0.01 })
    .withMessage('El monto debe ser mayor a $0.01'),
  
  body('paymentMethod')
    .isIn(['bank_transfer', 'credit_card', 'debit_card', 'ach', 'wire_transfer', 'check', 'cash'])
    .withMessage('Método de pago inválido'),
  
  body('loanId')
    .isMongoId()
    .withMessage('ID de préstamo inválido'),
  
  handleValidationErrors
];

// Validaciones para documentos
const validateDocumentUpload = [
  body('type')
    .isIn(['id', 'proof_of_income', 'bank_statement', 'employment_letter', 'other'])
    .withMessage('Tipo de documento inválido'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ID
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} debe ser un ID válido`),
  
  handleValidationErrors
];

// Validaciones para consultas de búsqueda
const validateSearchQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'amount', 'status', 'dueDate'])
    .withMessage('Campo de ordenamiento inválido'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('El orden debe ser "asc" o "desc"'),
  
  handleValidationErrors
];

// Validaciones para actualización de perfil
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  
  body('monthlyIncome')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('El ingreso mensual debe ser un número positivo'),
  
  body('employmentStatus')
    .optional()
    .isIn(['employed', 'self-employed', 'unemployed', 'retired', 'student'])
    .withMessage('Estado de empleo inválido'),
  
  body('notificationPreferences.email')
    .optional()
    .isBoolean()
    .withMessage('email debe ser un booleano'),
  
  body('notificationPreferences.sms')
    .optional()
    .isBoolean()
    .withMessage('sms debe ser un booleano'),
  
  body('notificationPreferences.push')
    .optional()
    .isBoolean()
    .withMessage('push debe ser un booleano'),
  
  handleValidationErrors
];

// Validaciones para cambio de contraseña
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validaciones para recuperación de contraseña
const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  handleValidationErrors
];

const validatePasswordResetConfirm = [
  body('token')
    .notEmpty()
    .withMessage('El token es requerido'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateLogin,
  validateLoanApplication,
  validatePayment,
  validateDocumentUpload,
  validateObjectId,
  validateSearchQuery,
  validateProfileUpdate,
  validatePasswordChange,
  validatePasswordReset,
  validatePasswordResetConfirm
};
