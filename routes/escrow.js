const express = require('express');
const EscrowTransaction = require('../models/EscrowTransaction');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateObjectId, validateSearchQuery } = require('../middleware/validation');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/escrow';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen y documentos'));
    }
  }
});

// @route   POST /api/escrow/transactions
// @desc    Crear nueva transacción ESCROW
// @access  Private
router.post('/transactions', protect, async (req, res) => {
  try {
    const {
      sellerId,
      item,
      terms,
      deliveryMethod,
      deliveryAddress
    } = req.body;

    // Verificar que el vendedor existe
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado'
      });
    }

    // No permitir transacciones consigo mismo
    if (sellerId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'No puedes crear una transacción contigo mismo'
      });
    }

    // Calcular comisión de escrow (ejemplo: 2.5% del precio)
    const escrowFee = Math.round(terms.price * 0.025 * 100) / 100;

    // Crear la transacción
    const transaction = new EscrowTransaction({
      buyer: req.user._id,
      seller: sellerId,
      item,
      terms: {
        ...terms,
        escrowFee,
        totalAmount: terms.price + escrowFee
      },
      deliveryMethod,
      deliveryAddress,
      status: 'pending_agreement',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
    });

    await transaction.save();

    // Poblar información de las partes
    await transaction.populate('buyer seller', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Transacción ESCROW creada exitosamente',
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error creando transacción ESCROW:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/escrow/transactions
// @desc    Obtener transacciones del usuario
// @access  Private
router.get('/transactions', protect, validateSearchQuery, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, category } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = {};
    
    if (req.user.role === 'buyer') {
      filters.buyer = req.user._id;
    } else if (req.user.role === 'seller') {
      filters.seller = req.user._id;
    } else if (req.user.role === 'supervisor') {
      filters.supervisor = req.user._id;
    }

    if (status) {
      filters.status = status;
    }

    if (category) {
      filters['item.category'] = category;
    }

    // Construir ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const transactions = await EscrowTransaction.find(filters)
      .populate('buyer', 'firstName lastName email phone')
      .populate('seller', 'firstName lastName email phone')
      .populate('supervisor', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EscrowTransaction.countDocuments(filters);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo transacciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/escrow/transactions/:id
// @desc    Obtener transacción por ID
// @access  Private
router.get('/transactions/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const transaction = await EscrowTransaction.findById(req.params.id)
      .populate('buyer', 'firstName lastName email phone address')
      .populate('seller', 'firstName lastName email phone address')
      .populate('supervisor', 'firstName lastName email phone')
      .populate('messages.sender', 'firstName lastName email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    // Verificar permisos
    const canAccess = 
      transaction.buyer._id.toString() === req.user._id.toString() ||
      transaction.seller._id.toString() === req.user._id.toString() ||
      transaction.supervisor?._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta transacción'
      });
    }

    res.json({
      success: true,
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error obteniendo transacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/escrow/transactions/:id/accept
// @desc    Aceptar términos de la transacción
// @access  Private (Seller)
router.put('/transactions/:id/accept', protect, authorize('seller'), validateObjectId('id'), async (req, res) => {
  try {
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aceptar esta transacción'
      });
    }

    if (transaction.status !== 'pending_agreement') {
      return res.status(400).json({
        success: false,
        message: 'La transacción no está pendiente de acuerdo'
      });
    }

    // Aceptar términos
    transaction.status = 'pending_payment';
    transaction.agreementDate = new Date();

    // Agregar mensaje
    await transaction.addMessage(req.user._id, 'Términos aceptados. Esperando pago del comprador.');

    await transaction.save();

    res.json({
      success: true,
      message: 'Términos aceptados exitosamente',
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error aceptando transacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/escrow/transactions/:id/pay
// @desc    Realizar pago
// @access  Private (Buyer)
router.put('/transactions/:id/pay', protect, authorize('buyer'), validateObjectId('id'), async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para pagar esta transacción'
      });
    }

    if (transaction.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'La transacción no está pendiente de pago'
      });
    }

    // TODO: Aquí se integraría con Stripe para procesar el pago real
    // Por ahora, simulamos un pago exitoso

    // Actualizar estado de pago
    transaction.status = 'payment_received';
    transaction.paymentDate = new Date();
    transaction.payment = {
      method: paymentMethod,
      amount: transaction.terms.totalAmount,
      status: 'completed',
      processedAt: new Date()
    };

    // Agregar mensaje
    await transaction.addMessage(req.user._id, 'Pago realizado exitosamente. Fondos en custodia.');

    await transaction.save();

    res.json({
      success: true,
      message: 'Pago realizado exitosamente',
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error procesando pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/escrow/transactions/:id/ship
// @desc    Marcar artículo como enviado
// @access  Private (Seller)
router.put('/transactions/:id/ship', protect, authorize('seller'), validateObjectId('id'), async (req, res) => {
  try {
    const { trackingNumber, carrier } = req.body;
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    if (transaction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para marcar como enviado'
      });
    }

    if (transaction.status !== 'payment_received') {
      return res.status(400).json({
        success: false,
        message: 'El pago debe estar confirmado antes de enviar'
      });
    }

    // Marcar como enviado
    transaction.status = 'item_shipped';
    transaction.shippingDate = new Date();
    transaction.evidence.shipping = {
      trackingNumber,
      carrier,
      shippingDate: new Date()
    };

    // Agregar mensaje
    await transaction.addMessage(req.user._id, `Artículo enviado. Número de seguimiento: ${trackingNumber}`);

    await transaction.save();

    res.json({
      success: true,
      message: 'Artículo marcado como enviado',
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error marcando como enviado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/escrow/transactions/:id/deliver
// @desc    Marcar artículo como entregado
// @access  Private (Buyer)
router.put('/transactions/:id/deliver', protect, authorize('buyer'), validateObjectId('id'), async (req, res) => {
  try {
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para marcar como entregado'
      });
    }

    if (transaction.status !== 'item_shipped') {
      return res.status(400).json({
        success: false,
        message: 'El artículo debe estar enviado antes de marcar como entregado'
      });
    }

    // Marcar como entregado e iniciar período de inspección
    transaction.status = 'inspection_period';
    transaction.deliveryDate = new Date();
    transaction.inspectionStartDate = new Date();
    transaction.inspectionEndDate = new Date(Date.now() + transaction.terms.inspectionPeriod * 24 * 60 * 60 * 1000);

    // Agregar mensaje
    await transaction.addMessage(req.user._id, 'Artículo recibido. Iniciando período de inspección.');

    await transaction.save();

    res.json({
      success: true,
      message: 'Artículo marcado como entregado. Período de inspección iniciado.',
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error marcando como entregado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/escrow/transactions/:id/approve
// @desc    Aprobar transacción (comprador)
// @access  Private (Buyer)
router.put('/transactions/:id/approve', protect, authorize('buyer'), validateObjectId('id'), async (req, res) => {
  try {
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    if (transaction.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aprobar esta transacción'
      });
    }

    if (transaction.status !== 'inspection_period') {
      return res.status(400).json({
        success: false,
        message: 'La transacción debe estar en período de inspección'
      });
    }

    // Aprobar transacción
    transaction.status = 'buyer_approved';
    transaction.buyerApprovedAt = new Date();

    // Agregar mensaje
    await transaction.addMessage(req.user._id, 'Transacción aprobada. Liberando fondos al vendedor.');

    // Si el vendedor también aprobó, completar transacción
    if (transaction.sellerApprovedAt) {
      transaction.status = 'funds_released';
      transaction.completionDate = new Date();
    }

    await transaction.save();

    res.json({
      success: true,
      message: 'Transacción aprobada exitosamente',
      data: {
        transaction
      }
    });

  } catch (error) {
    console.error('Error aprobando transacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/escrow/transactions/:id/messages
// @desc    Agregar mensaje a la transacción
// @access  Private
router.post('/transactions/:id/messages', protect, validateObjectId('id'), async (req, res) => {
  try {
    const { message, isInternal = false } = req.body;
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    // Verificar permisos
    const canAccess = 
      transaction.buyer.toString() === req.user._id.toString() ||
      transaction.seller.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      req.user.role === 'supervisor';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar mensajes a esta transacción'
      });
    }

    // Agregar mensaje
    await transaction.addMessage(req.user._id, message, isInternal);

    res.json({
      success: true,
      message: 'Mensaje agregado exitosamente'
    });

  } catch (error) {
    console.error('Error agregando mensaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/escrow/transactions/:id/dispute
// @desc    Iniciar disputa
// @access  Private
router.post('/transactions/:id/dispute', protect, validateObjectId('id'), async (req, res) => {
  try {
    const { reason, description } = req.body;
    const transaction = await EscrowTransaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transacción no encontrada'
      });
    }

    // Verificar permisos
    const canDispute = 
      transaction.buyer.toString() === req.user._id.toString() ||
      transaction.seller.toString() === req.user._id.toString();

    if (!canDispute) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para iniciar una disputa en esta transacción'
      });
    }

    if (transaction.dispute.isDisputed) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una disputa activa para esta transacción'
      });
    }

    // Iniciar disputa
    await transaction.initiateDispute(req.user._id, reason, description);

    res.json({
      success: true,
      message: 'Disputa iniciada exitosamente',
      data: {
        dispute: transaction.dispute
      }
    });

  } catch (error) {
    console.error('Error iniciando disputa:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/escrow/stats/overview
// @desc    Obtener estadísticas generales
// @access  Private (Admin, Supervisor)
router.get('/stats/overview', protect, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const stats = await EscrowTransaction.getStats(startDate, endDate);

    res.json({
      success: true,
      data: {
        totalTransactions: stats[0]?.totalTransactions || 0,
        totalValue: stats[0]?.totalValue || 0,
        totalFees: stats[0]?.totalFees || 0,
        averageTransactionValue: stats[0]?.totalValue / stats[0]?.totalTransactions || 0
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
