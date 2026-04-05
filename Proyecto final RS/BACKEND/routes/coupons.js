const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { couponValidation } = require('../middleware/validation');

// Validate coupon (public)
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    const result = await query(`
      SELECT * FROM coupons 
      WHERE code = $1 AND is_active = true
    `, [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    const coupon = result.rows[0];

    // Check expiration
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return res.status(400).json({ message: 'El cupón ha expirado' });
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'El cupón ha alcanzado el límite de uso' });
    }

    // Check minimum purchase
    if (subtotal < coupon.min_purchase) {
      return res.status(400).json({ 
        message: `El mínimo de compra para este cupón es $${coupon.min_purchase}` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = subtotal * (coupon.value / 100);
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.value;
    }

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: parseFloat(discount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ message: 'Error al validar cupón' });
  }
});

// Get all coupons (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT * FROM coupons WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (active === 'true') {
      sql += ` AND is_active = true AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)`;
    }

    sql += ' ORDER BY created_at DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    res.json({
      coupons: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({ message: 'Error al obtener cupones' });
  }
});

// Get coupon by ID (admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query('SELECT * FROM coupons WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    res.json({ coupon: result.rows[0] });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({ message: 'Error al obtener cupón' });
  }
});

// Create coupon (admin only)
router.post('/', authenticate, requireAdmin, couponValidation, async (req, res) => {
  try {
    const {
      code, type, value, min_purchase, max_discount,
      valid_from, valid_until, usage_limit
    } = req.body;

    // Check if code already exists
    const existing = await query('SELECT id FROM coupons WHERE code = $1', [code]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'El código de cupón ya existe' });
    }

    const result = await query(`
      INSERT INTO coupons (
        code, type, value, min_purchase, max_discount,
        valid_from, valid_until, usage_limit
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      code.toUpperCase(), type, value, min_purchase || 0, max_discount,
      valid_from, valid_until, usage_limit
    ]);

    res.status(201).json({
      message: 'Cupón creado exitosamente',
      coupon: result.rows[0]
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({ message: 'Error al crear cupón' });
  }
});

// Update coupon (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      code, type, value, min_purchase, max_discount,
      valid_from, valid_until, usage_limit, is_active
    } = req.body;

    const result = await query(`
      UPDATE coupons SET
        code = $1, type = $2, value = $3, min_purchase = $4, max_discount = $5,
        valid_from = $6, valid_until = $7, usage_limit = $8, is_active = $9
      WHERE id = $10
      RETURNING *
    `, [
      code.toUpperCase(), type, value, min_purchase, max_discount,
      valid_from, valid_until, usage_limit, is_active, req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    res.json({
      message: 'Cupón actualizado exitosamente',
      coupon: result.rows[0]
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({ message: 'Error al actualizar cupón' });
  }
});

// Delete coupon (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query('DELETE FROM coupons WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    res.json({ message: 'Cupón eliminado exitosamente' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({ message: 'Error al eliminar cupón' });
  }
});

module.exports = router;
