const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Loan = require('../models/Loan');
const { protect, requireVerification } = require('../middleware/auth');
const { validateDocumentUpload, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
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

const fileFilter = (req, file, cb) => {
  // Permitir solo archivos de imagen y PDF
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG) y documentos (PDF, DOC, DOCX)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  },
  fileFilter: fileFilter
});

// @route   POST /api/documents/upload
// @desc    Subir documento de usuario
// @access  Private
router.post('/upload', protect, requireVerification, upload.single('document'), validateDocumentUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const { type, description } = req.body;
    const user = await User.findById(req.user._id);

    // Crear entrada de documento
    const document = {
      type,
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
      status: 'pending',
      description
    };

    user.documents.push(document);
    await user.save();

    res.json({
      success: true,
      message: 'Documento subido exitosamente',
      data: {
        document: {
          id: document._id,
          type: document.type,
          fileName: document.fileName,
          status: document.status,
          uploadedAt: document.uploadedAt
        }
      }
    });

  } catch (error) {
    console.error('Error subiendo documento:', error);
    
    // Limpiar archivo si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/documents
// @desc    Obtener documentos del usuario
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('documents');
    
    res.json({
      success: true,
      data: {
        documents: user.documents
      }
    });

  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/documents/:id/download
// @desc    Descargar documento
// @access  Private
router.get('/:id/download', protect, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const document = user.documents.id(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el servidor'
      });
    }

    // Enviar archivo
    res.download(document.filePath, document.fileName);

  } catch (error) {
    console.error('Error descargando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Eliminar documento
// @access  Private
router.delete('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const document = user.documents.id(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Eliminar archivo del servidor
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Eliminar entrada de la base de datos
    document.remove();
    await user.save();

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/documents/:id/status
// @desc    Cambiar estado de documento (solo para admin)
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario requerido'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const document = user.documents.id(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Actualizar estado
    document.status = status;
    if (notes) {
      document.adminNotes = notes;
    }
    document.reviewedAt = new Date();
    document.reviewedBy = req.user._id;

    await user.save();

    res.json({
      success: true,
      message: 'Estado de documento actualizado exitosamente',
      data: {
        document: {
          id: document._id,
          status: document.status,
          reviewedAt: document.reviewedAt
        }
      }
    });

  } catch (error) {
    console.error('Error actualizando estado de documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   POST /api/documents/loan/:loanId
// @desc    Subir documento de préstamo
// @access  Private
router.post('/loan/:loanId', protect, authorize('borrower', 'lender', 'admin'), upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const { type, description } = req.body;
    const loan = await Loan.findById(req.params.loanId);

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
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para subir documentos a este préstamo'
      });
    }

    // Crear entrada de documento
    const document = {
      type,
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
      status: 'pending',
      description,
      uploadedBy: req.user._id
    };

    loan.documents.push(document);
    await loan.save();

    res.json({
      success: true,
      message: 'Documento de préstamo subido exitosamente',
      data: {
        document: {
          id: document._id,
          type: document.type,
          fileName: document.fileName,
          status: document.status,
          uploadedAt: document.uploadedAt
        }
      }
    });

  } catch (error) {
    console.error('Error subiendo documento de préstamo:', error);
    
    // Limpiar archivo si hubo error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/documents/loan/:loanId
// @desc    Obtener documentos de un préstamo
// @access  Private
router.get('/loan/:loanId', protect, validateObjectId('loanId'), async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId);

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
      req.user.role === 'admin';

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a los documentos de este préstamo'
      });
    }

    res.json({
      success: true,
      data: {
        documents: loan.documents
      }
    });

  } catch (error) {
    console.error('Error obteniendo documentos de préstamo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/documents/pending
// @desc    Obtener documentos pendientes de revisión (solo para admin)
// @access  Private (Admin)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Obtener usuarios con documentos pendientes
    const users = await User.find({
      'documents.status': 'pending'
    })
    .select('firstName lastName email documents')
    .skip(skip)
    .limit(parseInt(limit));

    // Filtrar solo documentos pendientes
    const pendingDocuments = [];
    users.forEach(user => {
      user.documents.forEach(doc => {
        if (doc.status === 'pending') {
          pendingDocuments.push({
            id: doc._id,
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            type: doc.type,
            fileName: doc.fileName,
            uploadedAt: doc.uploadedAt
          });
        }
      });
    });

    res.json({
      success: true,
      data: {
        documents: pendingDocuments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(pendingDocuments.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo documentos pendientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
