const express = require('express');
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validatePayment, validateObjectId, validateSearchQuery } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/payments
// @desc    Crear nuevo pago
// @access  Private (Borrower)
router.post('/', protect, authorize('borrower'), validatePayment, async (req, res) => {
  try {
    const { loanId, amount, paymentMethod, bankDetails } = req.body;

    // Verificar que el préstamo existe y pertenece al usuario
    const loan = await Loan.findOne({
      _id: loanId,
      borrower: req.user._id,
      status: { $in: ['active', 'funded'] }
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado o no está activo'
      });
    }

    // Buscar el próximo pago pendiente
    const nextPayment = loan.payments.find(payment => payment.status === 'pending');
    
    if (!nextPayment) {
      return res.status(400).json({
        success: false,
        message: 'No hay pagos pendientes para este préstamo'
      });
    }

    // Verificar que el monto sea correcto
    if (Math.abs(amount - nextPayment.amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `El monto debe ser exactamente $${nextPayment.amount.toFixed(2)}`
      });
    }

    // Crear el pago
    const payment = new Payment({
      loan: loanId,
      borrower: req.user._id,
      lender: loan.lender,
      amount,
      principalAmount: nextPayment.principal,
      interestAmount: nextPayment.interest,
      dueDate: nextPayment.dueDate,
      paymentMethod,
      bankDetails,
      status: 'processing'
    });

    await payment.save();

    // TODO: Aquí se integraría con Stripe para procesar el pago real
    // Por ahora, simulamos un pago exitoso después de 2 segundos
    setTimeout(async () => {
      try {
        payment.status = 'completed';
        payment.paidDate = new Date();
        payment.processedDate = new Date();
        payment.processorResponse = {
          success: true,
          message: 'Pago procesado exitosamente',
          code: 'SUCCESS'
        };
        await payment.save();

        // Actualizar el préstamo
        nextPayment.status = 'paid';
        nextPayment.paidDate = new Date();
        nextPayment.paymentMethod = paymentMethod;
        nextPayment.transactionId = payment.paymentId;
        
        // Verificar si el préstamo está completo
        const remainingPayments = loan.payments.filter(p => p.status === 'pending');
        if (remainingPayments.length === 0) {
          loan.status = 'completed';
          loan.completionDate = new Date();
        }
        
        await loan.save();

        console.log(`Pago ${payment.paymentId} procesado exitosamente`);
      } catch (error) {
        console.error('Error procesando pago:', error);
      }
    }, 2000);

    res.status(201).json({
      success: true,
      message: 'Pago iniciado exitosamente',
      data: {
        payment: {
          paymentId: payment.paymentId,
          amount: payment.amount,
          status: payment.status,
          dueDate: payment.dueDate
        }
      }
    });

  } catch (error) {
    console.error('Error creando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/payments
// @desc    Obtener pagos del usuario
// @access  Private
router.get('/', protect, validateSearchQuery, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'dueDate', sortOrder = 'desc', status, loanId } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = {};
    
    if (req.user.role === 'borrower') {
      filters.borrower = req.user._id;
    } else if (req.user.role === 'lender') {
      filters.lender = req.user._id;
    }

    if (status) {
      filters.status = status;
    }

    if (loanId) {
      filters.loan = loanId;
    }

    // Construir ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const payments = await Payment.find(filters)
      .populate('loan', 'loanId principalAmount monthlyPayment status')
      .populate('borrower', 'firstName lastName email')
      .populate('lender', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(filters);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Obtener pago por ID
// @access  Private
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('loan', 'loanId principalAmount monthlyPayment status')
      .populate('borrower', 'firstName lastName email')
      .populate('lender', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Verificar permisos
    const canAccess = 
      payment.borrower._id.toString() === req.user._id.toString() ||
      payment.lender._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este pago'
      });
    }

    res.json({
      success: true,
      data: {
        payment
      }
    });

  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/payments/:id/retry
// @desc    Reintentar pago fallido
// @access  Private (Borrower)
router.put('/:id/retry', protect, authorize('borrower'), validateObjectId('id'), async (req, res) => {
  try {
    const { paymentMethod, bankDetails } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para reintentar este pago'
      });
    }

    if (payment.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden reintentar pagos fallidos'
      });
    }

    // Actualizar método de pago y reintentar
    payment.paymentMethod = paymentMethod;
    payment.bankDetails = bankDetails;
    payment.status = 'processing';
    payment.processorResponse = null;

    await payment.save();

    // TODO: Aquí se integraría con Stripe para reintentar el pago
    // Por ahora, simulamos un reintento exitoso
    setTimeout(async () => {
      try {
        payment.status = 'completed';
        payment.paidDate = new Date();
        payment.processedDate = new Date();
        payment.processorResponse = {
          success: true,
          message: 'Pago procesado exitosamente en reintento',
          code: 'SUCCESS'
        };
        await payment.save();

        // Actualizar el préstamo
        const loan = await Loan.findById(payment.loan);
        const loanPayment = loan.payments.find(p => p.transactionId === payment.paymentId);
        if (loanPayment) {
          loanPayment.status = 'paid';
          loanPayment.paidDate = new Date();
          await loan.save();
        }

        console.log(`Pago ${payment.paymentId} reintentado exitosamente`);
      } catch (error) {
        console.error('Error en reintento de pago:', error);
        payment.status = 'failed';
        payment.processorResponse = {
          success: false,
          message: 'Error en reintento de pago',
          code: 'RETRY_FAILED'
        };
        await payment.save();
      }
    }, 2000);

    res.json({
      success: true,
      message: 'Reintento de pago iniciado',
      data: {
        payment: {
          paymentId: payment.paymentId,
          status: payment.status
        }
      }
    });

  } catch (error) {
    console.error('Error reintentando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/payments/:id/refund
// @desc    Procesar reembolso
// @access  Private (Lender, Admin)
router.post('/:id/refund', protect, authorize('lender', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden reembolsar pagos completados'
      });
    }

    // Verificar permisos del prestamista
    if (req.user.role === 'lender' && payment.lender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para reembolsar este pago'
      });
    }

    // Procesar reembolso
    const refundAmount = amount || payment.amount;
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
    
    await payment.processRefund(refundAmount, reason, refundId);

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: {
        refund: {
          refundId,
          amount: refundAmount,
          reason,
          processedDate: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Error procesando reembolso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/payments/overdue
// @desc    Obtener pagos vencidos
// @access  Private (Lender, Admin)
router.get('/overdue', protect, authorize('lender', 'admin'), async (req, res) => {
  try {
    const overduePayments = await Payment.getOverduePayments();

    res.json({
      success: true,
      data: {
        overduePayments,
        count: overduePayments.length
      }
    });

  } catch (error) {
    console.error('Error obteniendo pagos vencidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/payments/stats/overview
// @desc    Obtener estadísticas de pagos
// @access  Private (Admin, Lender)
router.get('/stats/overview', protect, authorize('admin', 'lender'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await Payment.getPaymentStats(startDate, endDate);

    // Calcular totales
    const totalAmount = stats.reduce((sum, stat) => sum + stat.totalAmount, 0);
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);

    res.json({
      success: true,
      data: {
        stats,
        totals: {
          totalAmount,
          totalCount,
          averageAmount: totalCount > 0 ? totalAmount / totalCount : 0
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/payments/:id/notes
// @desc    Agregar nota a un pago
// @access  Private
router.post('/:id/notes', protect, validateObjectId('id'), async (req, res) => {
  try {
    const { content, isInternal = false } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    // Verificar permisos
    const canAccess = 
      payment.borrower.toString() === req.user._id.toString() ||
      payment.lender.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar notas a este pago'
      });
    }

    // Agregar nota
    payment.notes.push({
      author: req.user._id,
      content,
      isInternal
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Nota agregada exitosamente',
      data: {
        note: payment.notes[payment.notes.length - 1]
      }
    });

  } catch (error) {
    console.error('Error agregando nota:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/payments/upcoming
// @desc    Obtener próximos pagos
// @access  Private (Borrower)
router.get('/upcoming', protect, authorize('borrower'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcomingPayments = await Payment.find({
      borrower: req.user._id,
      status: 'pending',
      dueDate: {
        $gte: new Date(),
        $lte: futureDate
      }
    })
    .populate('loan', 'loanId principalAmount monthlyPayment status')
    .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: {
        upcomingPayments,
        count: upcomingPayments.length,
        totalAmount: upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0)
      }
    });

  } catch (error) {
    console.error('Error obteniendo próximos pagos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
