const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado. Solo se permiten imágenes.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Upload single image (admin only)
router.post('/image', authenticate, requireAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      message: 'Imagen subida exitosamente',
      image: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error al subir imagen' });
  }
});

// Upload multiple images (admin only)
router.post('/images', authenticate, requireAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No se proporcionaron imágenes' });
    }

    const images = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));

    res.json({
      message: 'Imágenes subidas exitosamente',
      images
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error al subir imágenes' });
  }
});

// Delete uploaded image (admin only)
router.delete('/image/:filename', authenticate, requireAdmin, (req, res) => {
  try {
    const fs = require('fs');
    const filepath = path.join('uploads', req.params.filename);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ message: 'Imagen eliminada exitosamente' });
    } else {
      res.status(404).json({ message: 'Imagen no encontrada' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Error al eliminar imagen' });
  }
});

module.exports = router;
