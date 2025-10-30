const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  // Información básica del préstamo
  loanId: {
    type: String,
    unique: true,
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
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Términos del préstamo
  principalAmount: {
    type: Number,
    required: [true, 'El monto principal es requerido'],
    min: [1000, 'El monto mínimo es $1,000'],
    max: [10000000, 'El monto máximo es $10,000,000']
  },
  interestRate: {
    type: Number,
    required: [true, 'La tasa de interés es requerida'],
    min: [0, 'La tasa de interés no puede ser negativa'],
    max: [50, 'La tasa de interés no puede exceder 50%']
  },
  termMonths: {
    type: Number,
    required: [true, 'El plazo en meses es requerido'],
    min: [1, 'El plazo mínimo es 1 mes'],
    max: [360, 'El plazo máximo es 360 meses (30 años)']
  },
  
  // Cálculos financieros
  monthlyPayment: {
    type: Number,
    required: true
  },
  totalInterest: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  
  // Estado del préstamo
  status: {
    type: String,
    enum: [
      'pending_approval',    // Esperando aprobación
      'approved',           // Aprobado
      'funded',             // Financiado
      'active',             // Activo
      'completed',          // Completado
      'defaulted',          // En mora
      'cancelled',          // Cancelado
      'rejected'            // Rechazado
    ],
    default: 'pending_approval'
  },
  
  // Fechas importantes
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: Date,
  fundingDate: Date,
  firstPaymentDate: Date,
  maturityDate: Date,
  lastPaymentDate: Date,
  
  // Información de garantía
  collateral: {
    hasCollateral: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['real_estate', 'vehicle', 'equipment', 'inventory', 'securities', 'other'],
      default: null
    },
    description: String,
    estimatedValue: Number,
    documents: [{
      type: String,
      fileName: String,
      filePath: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Historial de pagos
  payments: [{
    paymentNumber: Number,
    dueDate: Date,
    amount: Number,
    principal: Number,
    interest: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'late', 'missed'],
      default: 'pending'
    },
    paidDate: Date,
    paymentMethod: String,
    transactionId: String
  }],
  
  // Información de mora
  delinquency: {
    isDelinquent: {
      type: Boolean,
      default: false
    },
    daysPastDue: {
      type: Number,
      default: 0
    },
    lateFees: {
      type: Number,
      default: 0
    }
  },
  
  // Documentos del préstamo
  documents: [{
    type: {
      type: String,
      enum: ['loan_agreement', 'promissory_note', 'disclosure', 'amendment', 'other'],
      required: true
    },
    fileName: String,
    filePath: String,
    uploadedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'signed', 'approved'],
      default: 'pending'
    }
  }],
  
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
  
  // Configuración de notificaciones
  notifications: {
    paymentReminders: { type: Boolean, default: true },
    statusUpdates: { type: Boolean, default: true },
    documentRequests: { type: Boolean, default: true }
  },
  
  // Información de Stripe
  stripePaymentIntentId: String,
  stripeAccountId: String,
  
  // Metadatos
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'broker'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Índices para optimizar consultas
loanSchema.index({ loanId: 1 });
loanSchema.index({ borrower: 1 });
loanSchema.index({ lender: 1 });
loanSchema.index({ status: 1 });
loanSchema.index({ applicationDate: -1 });
loanSchema.index({ maturityDate: 1 });

// Middleware para generar loanId antes de guardar
loanSchema.pre('save', function(next) {
  if (!this.loanId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.loanId = `LOAN-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Middleware para calcular pagos mensuales
loanSchema.pre('save', function(next) {
  if (this.isModified('principalAmount') || this.isModified('interestRate') || this.isModified('termMonths')) {
    const monthlyRate = this.interestRate / 100 / 12;
    const numPayments = this.termMonths;
    
    if (monthlyRate === 0) {
      // Préstamo sin interés
      this.monthlyPayment = this.principalAmount / numPayments;
    } else {
      // Préstamo con interés
      this.monthlyPayment = this.principalAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
        (Math.pow(1 + monthlyRate, numPayments) - 1);
    }
    
    this.totalAmount = this.monthlyPayment * numPayments;
    this.totalInterest = this.totalAmount - this.principalAmount;
    
    // Calcular fecha de primer pago (30 días después de la financiación)
    if (this.fundingDate) {
      this.firstPaymentDate = new Date(this.fundingDate);
      this.firstPaymentDate.setMonth(this.firstPaymentDate.getMonth() + 1);
    }
    
    // Calcular fecha de vencimiento
    if (this.firstPaymentDate) {
      this.maturityDate = new Date(this.firstPaymentDate);
      this.maturityDate.setMonth(this.maturityDate.getMonth() + numPayments - 1);
    }
  }
  next();
});

// Método para generar calendario de pagos
loanSchema.methods.generatePaymentSchedule = function() {
  const schedule = [];
  let remainingBalance = this.principalAmount;
  const monthlyRate = this.interestRate / 100 / 12;
  
  for (let i = 1; i <= this.termMonths; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = this.monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    schedule.push({
      paymentNumber: i,
      dueDate: new Date(this.firstPaymentDate),
      amount: this.monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      remainingBalance: Math.max(0, remainingBalance),
      status: 'pending'
    });
    
    // Incrementar fecha para el siguiente mes
    this.firstPaymentDate.setMonth(this.firstPaymentDate.getMonth() + 1);
  }
  
  return schedule;
};

// Método para calcular días de mora
loanSchema.methods.calculateDaysPastDue = function() {
  if (this.status !== 'active') return 0;
  
  const today = new Date();
  const lastPayment = this.payments
    .filter(p => p.status === 'paid')
    .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))[0];
  
  if (!lastPayment) {
    // Si no hay pagos, calcular desde la fecha de primer pago
    const firstDueDate = this.payments[0]?.dueDate;
    if (firstDueDate && today > firstDueDate) {
      return Math.floor((today - firstDueDate) / (1000 * 60 * 60 * 24));
    }
  } else {
    // Calcular desde el último pago
    const nextDueDate = new Date(lastPayment.paidDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    
    if (today > nextDueDate) {
      return Math.floor((today - nextDueDate) / (1000 * 60 * 60 * 24));
    }
  }
  
  return 0;
};

module.exports = mongoose.model('Loan', loanSchema);
