const express = require('express');
const Loan = require('../models/Loan');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { protect, authorize, requireVerification } = require('../middleware/auth');
const { validateLoanApplication, validateObjectId, validateSearchQuery } = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/loans
// @desc    Crear nueva solicitud de préstamo
// @access  Private (Borrower)
router.post('/', protect, authorize('borrower'), requireVerification, validateLoanApplication, async (req, res) => {
  try {
    const { principalAmount, interestRate, termMonths, collateral, purpose } = req.body;

    // Verificar que el usuario tenga un prestamista asignado o buscar uno disponible
    let lender = await User.findOne({ 
      role: 'lender', 
      isActive: true,
      isIdentityVerified: true 
    });

    if (!lender) {
      return res.status(400).json({
        success: false,
        message: 'No hay prestamistas disponibles en este momento'
      });
    }

    // Crear el préstamo
    const loan = new Loan({
      borrower: req.user._id,
      lender: lender._id,
      principalAmount,
      interestRate,
      termMonths,
      collateral,
      purpose,
      status: 'pending_approval'
    });

    await loan.save();

    // Generar calendario de pagos
    const paymentSchedule = loan.generatePaymentSchedule();
    loan.payments = paymentSchedule;
    await loan.save();

    // Poblar información del prestamista
    await loan.populate('lender', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Solicitud de préstamo creada exitosamente',
      data: {
        loan
      }
    });

  } catch (error) {
    console.error('Error creando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/loans
// @desc    Obtener préstamos del usuario
// @access  Private
router.get('/', protect, validateSearchQuery, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = {};
    
    if (req.user.role === 'borrower') {
      filters.borrower = req.user._id;
    } else if (req.user.role === 'lender') {
      filters.lender = req.user._id;
    } else if (req.user.role === 'broker') {
      filters.broker = req.user._id;
    }

    if (status) {
      filters.status = status;
    }

    // Construir ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const loans = await Loan.find(filters)
      .populate('borrower', 'firstName lastName email')
      .populate('lender', 'firstName lastName email')
      .populate('broker', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Loan.countDocuments(filters);

    res.json({
      success: true,
      data: {
        loans,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalLoans: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo préstamos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/loans/:id
// @desc    Obtener préstamo por ID
// @access  Private
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('borrower', 'firstName lastName email phone address')
      .populate('lender', 'firstName lastName email phone')
      .populate('broker', 'firstName lastName email phone');

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    // Verificar permisos
    const canAccess = 
      loan.borrower._id.toString() === req.user._id.toString() ||
      loan.lender._id.toString() === req.user._id.toString() ||
      loan.broker?._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este préstamo'
      });
    }

    res.json({
      success: true,
      data: {
        loan
      }
    });

  } catch (error) {
    console.error('Error obteniendo préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/loans/:id/approve
// @desc    Aprobar préstamo
// @access  Private (Lender, Admin)
router.put('/:id/approve', protect, authorize('lender', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (loan.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'El préstamo no está pendiente de aprobación'
      });
    }

    // Verificar que el prestamista sea el propietario del préstamo
    if (req.user.role === 'lender' && loan.lender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aprobar este préstamo'
      });
    }

    // Aprobar el préstamo
    loan.status = 'approved';
    loan.approvalDate = new Date();
    loan.approvedBy = req.user._id;

    // Agregar nota de aprobación
    loan.notes.push({
      author: req.user._id,
      content: 'Préstamo aprobado',
      isInternal: false
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Préstamo aprobado exitosamente',
      data: {
        loan
      }
    });

  } catch (error) {
    console.error('Error aprobando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/loans/:id/reject
// @desc    Rechazar préstamo
// @access  Private (Lender, Admin)
router.put('/:id/reject', protect, authorize('lender', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { reason } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (loan.status !== 'pending_approval') {
      return res.status(400).json({
        success: false,
        message: 'El préstamo no está pendiente de aprobación'
      });
    }

    // Verificar que el prestamista sea el propietario del préstamo
    if (req.user.role === 'lender' && loan.lender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar este préstamo'
      });
    }

    // Rechazar el préstamo
    loan.status = 'rejected';
    loan.rejectionDate = new Date();
    loan.rejectedBy = req.user._id;
    loan.rejectionReason = reason;

    // Agregar nota de rechazo
    loan.notes.push({
      author: req.user._id,
      content: `Préstamo rechazado: ${reason}`,
      isInternal: false
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Préstamo rechazado',
      data: {
        loan
      }
    });

  } catch (error) {
    console.error('Error rechazando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/loans/:id/fund
// @desc    Financiar préstamo
// @access  Private (Lender, Admin)
router.put('/:id/fund', protect, authorize('lender', 'admin'), validateObjectId('id'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'El préstamo debe estar aprobado para ser financiado'
      });
    }

    // Verificar que el prestamista sea el propietario del préstamo
    if (req.user.role === 'lender' && loan.lender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para financiar este préstamo'
      });
    }

    // TODO: Aquí se integraría con Stripe para procesar el pago
    // Por ahora, solo actualizamos el estado

    // Financiar el préstamo
    loan.status = 'funded';
    loan.fundingDate = new Date();
    loan.fundedBy = req.user._id;

    // Agregar nota de financiación
    loan.notes.push({
      author: req.user._id,
      content: 'Préstamo financiado exitosamente',
      isInternal: false
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Préstamo financiado exitosamente',
      data: {
        loan
      }
    });

  } catch (error) {
    console.error('Error financiando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/loans/:id/activate
// @desc    Activar préstamo (cambiar de funded a active)
// @access  Private (Admin)
router.put('/:id/activate', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    if (loan.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'El préstamo debe estar financiado para ser activado'
      });
    }

    // Activar el préstamo
    loan.status = 'active';
    loan.activationDate = new Date();

    // Agregar nota de activación
    loan.notes.push({
      author: req.user._id,
      content: 'Préstamo activado - pagos programados',
      isInternal: false
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Préstamo activado exitosamente',
      data: {
        loan
      }
    });

  } catch (error) {
    console.error('Error activando préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/loans/:id/payments
// @desc    Obtener pagos de un préstamo
// @access  Private
router.get('/:id/payments', protect, validateObjectId('id'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    // Verificar permisos
    const canAccess = 
      loan.borrower.toString() === req.user._id.toString() ||
      loan.lender.toString() === req.user._id.toString() ||
      loan.broker?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los pagos de este préstamo'
      });
    }

    const payments = await Payment.find({ loan: loan._id })
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: {
        payments,
        loan: {
          loanId: loan.loanId,
          principalAmount: loan.principalAmount,
          monthlyPayment: loan.monthlyPayment,
          totalAmount: loan.totalAmount,
          status: loan.status
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

// @route   POST /api/loans/:id/notes
// @desc    Agregar nota a un préstamo
// @access  Private
router.post('/:id/notes', protect, validateObjectId('id'), async (req, res) => {
  try {
    const { content, isInternal = false } = req.body;
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Préstamo no encontrado'
      });
    }

    // Verificar permisos
    const canAccess = 
      loan.borrower.toString() === req.user._id.toString() ||
      loan.lender.toString() === req.user._id.toString() ||
      loan.broker?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar notas a este préstamo'
      });
    }

    // Agregar nota
    loan.notes.push({
      author: req.user._id,
      content,
      isInternal
    });

    await loan.save();

    res.json({
      success: true,
      message: 'Nota agregada exitosamente',
      data: {
        note: loan.notes[loan.notes.length - 1]
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

// @route   GET /api/loans/stats/overview
// @desc    Obtener estadísticas generales de préstamos
// @access  Private (Admin, Lender)
router.get('/stats/overview', protect, authorize('admin', 'lender'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (req.user.role === 'lender') {
      matchStage.lender = req.user._id;
    }
    
    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Loan.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          totalAmount: { $sum: '$principalAmount' },
          averageAmount: { $avg: '$principalAmount' },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]);

    // Contar préstamos por estado
    const statusCounts = {};
    if (stats.length > 0) {
      stats[0].statusCounts.forEach(status => {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        totalLoans: stats[0]?.totalLoans || 0,
        totalAmount: stats[0]?.totalAmount || 0,
        averageAmount: stats[0]?.averageAmount || 0,
        statusCounts
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
