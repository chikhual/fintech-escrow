const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Información básica del pago
  paymentId: {
    type: String,
    unique: true,
    required: true
  },
  loan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Loan',
    required: true
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Detalles del pago
  amount: {
    type: Number,
    required: [true, 'El monto del pago es requerido'],
    min: [0, 'El monto no puede ser negativo']
  },
  principalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  interestAmount: {
    type: Number,
    required: true,
    min: 0
  },
  lateFee: {
    type: Number,
    default: 0,
    min: 0
  },
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Estado del pago
  status: {
    type: String,
    enum: [
      'pending',           // Pendiente
      'processing',        // Procesando
      'completed',         // Completado
      'failed',           // Fallido
      'cancelled',        // Cancelado
      'refunded',         // Reembolsado
      'disputed'          // En disputa
    ],
    default: 'pending'
  },
  
  // Fechas
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: Date,
  processedDate: Date,
  
  // Información de pago
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'ach', 'wire_transfer', 'check', 'cash'],
    required: true
  },
  
  // Información de Stripe
  stripePaymentIntentId: String,
  stripeChargeId: String,
  stripeTransferId: String,
  
  // Información bancaria
  bankDetails: {
    last4: String,
    brand: String,
    bankName: String,
    accountType: String
  },
  
  // Referencias externas
  externalTransactionId: String,
  referenceNumber: String,
  
  // Información de procesamiento
  processor: {
    type: String,
    enum: ['stripe', 'paypal', 'bank', 'manual'],
    default: 'stripe'
  },
  processorResponse: {
    success: Boolean,
    message: String,
    code: String,
    rawResponse: mongoose.Schema.Types.Mixed
  },
  
  // Información de reembolso
  refund: {
    amount: Number,
    reason: String,
    processedDate: Date,
    refundId: String
  },
  
  // Notas y comentarios
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  
  // Metadatos
  ipAddress: String,
  userAgent: String,
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'automatic'],
    default: 'web'
  },
  
  // Información de seguridad
  fraudScore: Number,
  riskFlags: [String],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ loan: 1 });
paymentSchema.index({ borrower: 1 });
paymentSchema.index({ lender: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ paidDate: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });

// Middleware para generar paymentId antes de guardar
paymentSchema.pre('save', function(next) {
  if (!this.paymentId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.paymentId = `PAY-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Middleware para validar montos
paymentSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('principalAmount') || this.isModified('interestAmount')) {
    const calculatedTotal = this.principalAmount + this.interestAmount + this.lateFee + this.processingFee;
    
    if (Math.abs(this.amount - calculatedTotal) > 0.01) {
      return next(new Error('El monto total no coincide con la suma de los componentes'));
    }
  }
  next();
});

// Método para marcar como pagado
paymentSchema.methods.markAsPaid = function(paidDate = new Date()) {
  this.status = 'completed';
  this.paidDate = paidDate;
  this.processedDate = paidDate;
  return this.save();
};

// Método para procesar reembolso
paymentSchema.methods.processRefund = function(amount, reason, refundId) {
  if (this.status !== 'completed') {
    throw new Error('Solo se pueden reembolsar pagos completados');
  }
  
  if (amount > this.amount) {
    throw new Error('El monto del reembolso no puede exceder el monto del pago');
  }
  
  this.refund = {
    amount,
    reason,
    processedDate: new Date(),
    refundId
  };
  
  this.status = 'refunded';
  return this.save();
};

// Método para calcular días de retraso
paymentSchema.methods.calculateDaysLate = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return 0;
  }
  
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  
  if (today <= dueDate) {
    return 0;
  }
  
  return Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
};

// Método para verificar si el pago está vencido
paymentSchema.methods.isOverdue = function() {
  return this.status === 'pending' && this.calculateDaysLate() > 0;
};

// Método para calcular comisión por mora
paymentSchema.methods.calculateLateFee = function() {
  const daysLate = this.calculateDaysLate();
  
  if (daysLate <= 0) {
    return 0;
  }
  
  // Comisión por mora: $25 por cada 30 días de retraso
  const lateFeeRate = 25;
  const feePeriods = Math.ceil(daysLate / 30);
  
  return lateFeeRate * feePeriods;
};

// Método estático para obtener pagos vencidos
paymentSchema.statics.getOverduePayments = function() {
  const today = new Date();
  return this.find({
    status: 'pending',
    dueDate: { $lt: today }
  }).populate('loan borrower lender');
};

// Método estático para obtener estadísticas de pagos
paymentSchema.statics.getPaymentStats = function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
