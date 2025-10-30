const mongoose = require('mongoose');

const escrowTransactionSchema = new mongoose.Schema({
  // Información básica de la transacción
  transactionId: {
    type: String,
    unique: true,
    required: true
  },
  
  // Partes involucradas
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Información del artículo
  item: {
    title: {
      type: String,
      required: [true, 'El título del artículo es requerido'],
      maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
    },
    category: {
      type: String,
      enum: ['vehicle', 'machinery', 'electronics', 'real_estate', 'jewelry', 'art', 'other'],
      required: true
    },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      required: true
    },
    images: [{
      url: String,
      filename: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    estimatedValue: {
      type: Number,
      required: true,
      min: [100, 'El valor estimado debe ser al menos $100']
    }
  },
  
  // Términos de la transacción
  terms: {
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [100, 'El precio debe ser al menos $100']
    },
    currency: {
      type: String,
      default: 'MXN',
      enum: ['MXN', 'USD', 'EUR']
    },
    escrowFee: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    deliveryMethod: {
      type: String,
      enum: ['pickup', 'shipping', 'meetup', 'other'],
      required: true
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      instructions: String
    },
    deliveryDate: Date,
    inspectionPeriod: {
      type: Number,
      default: 3, // días para inspección
      min: 1,
      max: 30
    }
  },
  
  // Estado de la transacción
  status: {
    type: String,
    enum: [
      'pending_agreement',    // Esperando acuerdo de términos
      'pending_payment',      // Esperando pago del comprador
      'payment_received',     // Pago recibido en custodia
      'item_shipped',         // Artículo enviado
      'item_delivered',       // Artículo entregado
      'inspection_period',    // Período de inspección
      'buyer_approved',       // Comprador aprobó
      'seller_approved',      // Vendedor aprobó
      'funds_released',       // Fondos liberados
      'transaction_completed', // Transacción completada
      'disputed',             // En disputa
      'cancelled',            // Cancelada
      'expired'               // Expirada
    ],
    default: 'pending_agreement'
  },
  
  // Fechas importantes
  createdAt: {
    type: Date,
    default: Date.now
  },
  agreementDate: Date,
  paymentDate: Date,
  shippingDate: Date,
  deliveryDate: Date,
  inspectionStartDate: Date,
  inspectionEndDate: Date,
  completionDate: Date,
  expiryDate: Date,
  
  // Información de pago
  payment: {
    method: {
      type: String,
      enum: ['bank_transfer', 'credit_card', 'debit_card', 'wire_transfer'],
      required: true
    },
    transactionId: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    processedAt: Date,
    refundedAt: Date
  },
  
  // Evidencias y documentación
  evidence: {
    shipping: {
      trackingNumber: String,
      carrier: String,
      shippingDate: Date,
      deliveryConfirmation: String,
      photos: [String]
    },
    inspection: {
      buyerPhotos: [String],
      buyerNotes: String,
      sellerPhotos: [String],
      sellerNotes: String,
      inspectionReport: String
    },
    documents: [{
      type: {
        type: String,
        enum: ['invoice', 'receipt', 'warranty', 'certificate', 'other'],
        required: true
      },
      filename: String,
      url: String,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Comunicación y mensajes
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres']
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      url: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Disputas
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    description: String,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed'],
      default: 'open'
    },
    resolution: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    createdAt: { type: Date, default: Date.now }
  },
  
  // Configuración de notificaciones
  notifications: {
    buyer: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    seller: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  
  // Metadatos
  source: {
    type: String,
    enum: ['web', 'mobile', 'api'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String,
  
  // Configuración de KYC/AML (para futuro)
  kyc: {
    buyerVerified: { type: Boolean, default: false },
    sellerVerified: { type: Boolean, default: false },
    verificationLevel: {
      type: String,
      enum: ['basic', 'enhanced', 'full'],
      default: 'basic'
    }
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
escrowTransactionSchema.index({ transactionId: 1 });
escrowTransactionSchema.index({ buyer: 1 });
escrowTransactionSchema.index({ seller: 1 });
escrowTransactionSchema.index({ status: 1 });
escrowTransactionSchema.index({ createdAt: -1 });
escrowTransactionSchema.index({ 'item.category': 1 });
escrowTransactionSchema.index({ 'terms.price': 1 });

// Middleware para generar transactionId antes de guardar
escrowTransactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionId = `ESC-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Middleware para calcular totales
escrowTransactionSchema.pre('save', function(next) {
  if (this.isModified('terms.price') || this.isModified('terms.escrowFee')) {
    this.terms.totalAmount = this.terms.price + this.terms.escrowFee;
  }
  next();
});

// Método para calcular días restantes de inspección
escrowTransactionSchema.methods.getInspectionDaysRemaining = function() {
  if (this.status !== 'inspection_period' || !this.inspectionEndDate) {
    return 0;
  }
  
  const now = new Date();
  const endDate = new Date(this.inspectionEndDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

// Método para verificar si la transacción está expirada
escrowTransactionSchema.methods.isExpired = function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
};

// Método para agregar mensaje
escrowTransactionSchema.methods.addMessage = function(senderId, message, isInternal = false) {
  this.messages.push({
    sender: senderId,
    message,
    isInternal,
    createdAt: new Date()
  });
  return this.save();
};

// Método para iniciar disputa
escrowTransactionSchema.methods.initiateDispute = function(initiatedBy, reason, description) {
  this.dispute = {
    isDisputed: true,
    initiatedBy,
    reason,
    description,
    status: 'open',
    createdAt: new Date()
  };
  this.status = 'disputed';
  return this.save();
};

// Método para resolver disputa
escrowTransactionSchema.methods.resolveDispute = function(resolvedBy, resolution) {
  this.dispute.status = 'resolved';
  this.dispute.resolution = resolution;
  this.dispute.resolvedBy = resolvedBy;
  this.dispute.resolvedAt = new Date();
  this.status = 'funds_released';
  return this.save();
};

// Método estático para obtener transacciones por estado
escrowTransactionSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('buyer seller', 'firstName lastName email');
};

// Método estático para obtener estadísticas
escrowTransactionSchema.statics.getStats = function(startDate, endDate) {
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
        _id: null,
        totalTransactions: { $sum: 1 },
        totalValue: { $sum: '$terms.price' },
        totalFees: { $sum: '$terms.escrowFee' },
        statusCounts: { $push: '$status' }
      }
    }
  ]);
};

module.exports = mongoose.model('EscrowTransaction', escrowTransactionSchema);
