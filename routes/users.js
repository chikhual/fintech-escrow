const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { validateProfileUpdate, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', protect, validateProfileUpdate, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user._id);

    // Actualizar campos permitidos
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    await user.save();

    // Remover contraseña de la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Obtener usuario por ID (solo para admin)
// @access  Private (Admin)
router.get('/:id', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users
// @desc    Obtener lista de usuarios (solo para admin)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters = {};
    if (role) filters.role = role;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const users = await User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filters);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    Cambiar estado de usuario (solo para admin)
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: {
        user: {
          id: user._id,
          isActive: user.isActive
        }
      }
    });

  } catch (error) {
    console.error('Error cambiando estado de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Cambiar rol de usuario (solo para admin)
// @access  Private (Admin)
router.put('/:id/role', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!['borrower', 'lender', 'broker', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'Rol actualizado exitosamente',
      data: {
        user: {
          id: user._id,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Error cambiando rol de usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Obtener estadísticas de usuarios
// @access  Private (Admin)
router.get('/stats/overview', protect, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isIdentityVerified', true] }, 1, 0] }
          },
          roleCounts: {
            $push: '$role'
          }
        }
      }
    ]);

    // Contar usuarios por rol
    const roleCounts = {};
    if (stats.length > 0) {
      stats[0].roleCounts.forEach(role => {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        totalUsers: stats[0]?.totalUsers || 0,
        activeUsers: stats[0]?.activeUsers || 0,
        verifiedUsers: stats[0]?.verifiedUsers || 0,
        roleCounts
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas de usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
