const { body, param, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Error de validación',
      errors: errors.array()
    });
  }
  next();
};

// Auth validations
const registerValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Product validations
const productValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('category_id').optional().isInt().withMessage('ID de categoría inválido'),
  body('is_available').optional().isBoolean(),
  handleValidationErrors
];

// Order validations
const orderValidation = [
  body('customer_name').trim().notEmpty().withMessage('El nombre del cliente es requerido'),
  body('customer_phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un item'),
  body('items.*.product_id').isInt().withMessage('ID de producto inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Cantidad inválida'),
  body('order_type').isIn(['delivery', 'pickup']).withMessage('Tipo de orden inválido'),
  body('payment_method').isIn(['mercadopago', 'transfer', 'cash']).withMessage('Método de pago inválido'),
  handleValidationErrors
];

// Review validations
const reviewValidation = [
  body('product_id').isInt().withMessage('ID de producto inválido'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
  body('comment').optional().trim(),
  handleValidationErrors
];

// Coupon validations
const couponValidation = [
  body('code').trim().notEmpty().withMessage('El código es requerido'),
  body('type').isIn(['percentage', 'fixed']).withMessage('Tipo de cupón inválido'),
  body('value').isFloat({ min: 0 }).withMessage('El valor debe ser positivo'),
  body('valid_until').isISO8601().withMessage('Fecha de vencimiento inválida'),
  handleValidationErrors
];

// Restaurant settings validations
const restaurantSettingsValidation = [
  body('name').trim().notEmpty().withMessage('El nombre del restaurante es requerido'),
  body('phone').trim().notEmpty().withMessage('El teléfono es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  productValidation,
  orderValidation,
  reviewValidation,
  couponValidation,
  restaurantSettingsValidation
};
