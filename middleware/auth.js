const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar JWT
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Verificar que existe el token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Token no proporcionado.'
      });
    }
    
    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Obtener usuario del token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token válido pero usuario no encontrado.'
        });
      }
      
      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Cuenta desactivada. Contacta al soporte.'
        });
      }
      
      // Verificar si la contraseña fue cambiada después de que se emitió el token
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña fue cambiada recientemente. Inicia sesión nuevamente.'
        });
      }
      
      // Agregar usuario al request
      req.user = user;
      next();
      
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido.'
        });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Inicia sesión nuevamente.'
        });
      }
      throw error;
    }
    
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor.'
    });
  }
};

// Middleware para verificar roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Usuario no autenticado.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Middleware para verificar si el usuario es propietario del recurso
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. Usuario no autenticado.'
      });
    }
    
    // Los administradores pueden acceder a cualquier recurso
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Verificar si el usuario es propietario del recurso
    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (resourceId && resourceId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No tienes permisos para acceder a este recurso.'
      });
    }
    
    next();
  };
};

// Middleware para verificar verificación de identidad
const requireVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Usuario no autenticado.'
    });
  }
  
  const requiredVerifications = ['isEmailVerified', 'isPhoneVerified', 'isIdentityVerified'];
  const missingVerifications = requiredVerifications.filter(verification => !req.user[verification]);
  
  if (missingVerifications.length > 0) {
    return res.status(403).json({
      success: false,
      message: 'Se requiere verificación de identidad completa para acceder a esta función.',
      missingVerifications
    });
  }
  
  next();
};

// Middleware para verificar límites de tasa
const checkRateLimit = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.user ? req.user._id.toString() : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Limpiar requests antiguos
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

// Middleware para logging de seguridad
const securityLog = (action) => {
  return (req, res, next) => {
    const logData = {
      action,
      userId: req.user ? req.user._id : null,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      body: req.body
    };
    
    console.log('Security Log:', JSON.stringify(logData, null, 2));
    next();
  };
};

// Función para generar JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Función para generar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

module.exports = {
  protect,
  authorize,
  checkOwnership,
  requireVerification,
  checkRateLimit,
  securityLog,
  generateToken,
  generateRefreshToken
};
