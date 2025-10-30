const express = require('express');
const User = require('../models/User');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Obtener notificaciones del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (page - 1) * limit;

    // Obtener notificaciones del usuario
    const user = await User.findById(req.user._id).select('notifications');
    
    let notifications = user.notifications || [];
    
    // Filtrar solo no leídas si se solicita
    if (unreadOnly === 'true') {
      notifications = notifications.filter(notif => !notif.read);
    }

    // Ordenar por fecha de creación (más recientes primero)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginación
    const paginatedNotifications = notifications.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(notifications.length / limit),
          totalNotifications: notifications.length,
          unreadCount: notifications.filter(n => !n.read).length
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Marcar notificación como leída
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Error marcando notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Marcar todas las notificaciones como leídas
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    user.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date();
      }
    });

    await user.save();

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas'
    });

  } catch (error) {
    console.error('Error marcando todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Eliminar notificación
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    notification.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Notificación eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Actualizar preferencias de notificaciones
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { email, sms, push } = req.body;
    const user = await User.findById(req.user._id);

    if (email !== undefined) user.notificationPreferences.email = email;
    if (sms !== undefined) user.notificationPreferences.sms = sms;
    if (push !== undefined) user.notificationPreferences.push = push;

    await user.save();

    res.json({
      success: true,
      message: 'Preferencias de notificaciones actualizadas exitosamente',
      data: {
        preferences: user.notificationPreferences
      }
    });

  } catch (error) {
    console.error('Error actualizando preferencias de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/notifications/preferences
// @desc    Obtener preferencias de notificaciones
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notificationPreferences');

    res.json({
      success: true,
      data: {
        preferences: user.notificationPreferences
      }
    });

  } catch (error) {
    console.error('Error obteniendo preferencias de notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Función auxiliar para crear notificaciones
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const notification = {
      type,
      title,
      message,
      data,
      read: false,
      createdAt: new Date()
    };

    user.notifications.push(notification);
    await user.save();

    // TODO: Aquí se integraría con servicios de notificaciones push/email/SMS
    console.log(`Notificación creada para usuario ${userId}: ${title}`);

  } catch (error) {
    console.error('Error creando notificación:', error);
  }
};

// Función auxiliar para crear notificaciones de préstamo
const createLoanNotification = async (loanId, type, title, message, data = {}) => {
  try {
    const loan = await Loan.findById(loanId).populate('borrower lender');
    if (!loan) return;

    // Notificar al prestatario
    await createNotification(loan.borrower._id, type, title, message, {
      ...data,
      loanId: loan.loanId,
      loanAmount: loan.principalAmount
    });

    // Notificar al prestamista
    await createNotification(loan.lender._id, type, title, message, {
      ...data,
      loanId: loan.loanId,
      loanAmount: loan.principalAmount
    });

  } catch (error) {
    console.error('Error creando notificación de préstamo:', error);
  }
};

// Función auxiliar para crear notificaciones de pago
const createPaymentNotification = async (paymentId, type, title, message, data = {}) => {
  try {
    const payment = await Payment.findById(paymentId).populate('borrower lender loan');
    if (!payment) return;

    // Notificar al prestatario
    await createNotification(payment.borrower._id, type, title, message, {
      ...data,
      paymentId: payment.paymentId,
      amount: payment.amount,
      loanId: payment.loan.loanId
    });

    // Notificar al prestamista
    await createNotification(payment.lender._id, type, title, message, {
      ...data,
      paymentId: payment.paymentId,
      amount: payment.amount,
      loanId: payment.loan.loanId
    });

  } catch (error) {
    console.error('Error creando notificación de pago:', error);
  }
};

// Exportar funciones auxiliares para uso en otras rutas
module.exports = {
  router,
  createNotification,
  createLoanNotification,
  createPaymentNotification
};
