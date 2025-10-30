const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Información personal
  firstName: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  lastName: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true,
    maxlength: [50, 'El apellido no puede exceder 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Formato de teléfono inválido']
  },
  
  // Información de dirección
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'México' }
  },
  
  // Información financiera
  creditScore: {
    type: Number,
    min: 300,
    max: 850,
    default: null
  },
  monthlyIncome: {
    type: Number,
    min: 0,
    default: null
  },
  employmentStatus: {
    type: String,
    enum: ['employed', 'self-employed', 'unemployed', 'retired', 'student'],
    default: 'employed'
  },
  
  // Información de verificación
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isIdentityVerified: {
    type: Boolean,
    default: false
  },
  isIncomeVerified: {
    type: Boolean,
    default: false
  },
  
  // Documentos
  documents: [{
    type: {
      type: String,
      enum: ['id', 'proof_of_income', 'bank_statement', 'employment_letter', 'other'],
      required: true
    },
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Configuración de cuenta
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin', 'supervisor'],
    default: 'buyer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Configuración de notificaciones
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  
  // Información de Stripe
  stripeCustomerId: String,
  stripeAccountId: String,
  
  // Timestamps
  lastLogin: Date,
  passwordChangedAt: Date
}, {
  timestamps: true
});

// Índices para optimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_ROUNDS) || 12);
  this.passwordChangedAt = new Date();
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si la contraseña fue cambiada después de que se emitió el JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Método para obtener el nombre completo
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Asegurar que los campos virtuales se incluyan en JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
