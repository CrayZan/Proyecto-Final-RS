const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');

// Get all reviews (public - only approved and visible)
router.get('/', async (req, res) => {
  try {
    const { product_id, user_id, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT r.*, u.name as user_name, u.avatar as user_avatar, p.name as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = true AND r.is_visible = true
    `;
    const params = [];
    let paramIndex = 1;

    if (product_id) {
      sql += ` AND r.product_id = $${paramIndex++}`;
      params.push(product_id);
    }

    if (user_id) {
      sql += ` AND r.user_id = $${paramIndex++}`;
      params.push(user_id);
    }

    sql += ' ORDER BY r.created_at DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get average rating if product_id is provided
    let averageRating = null;
    if (product_id) {
      const avgResult = await query(`
        SELECT AVG(rating) as average, COUNT(*) as total
        FROM reviews
        WHERE product_id = $1 AND is_approved = true AND is_visible = true
      `, [product_id]);
      averageRating = avgResult.rows[0];
    }

    res.json({
      reviews: result.rows,
      average_rating: averageRating,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
});

// Get review by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT r.*, u.name as user_name, p.name as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE r.id = $1 AND r.is_visible = true
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({ review: result.rows[0] });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ message: 'Error al obtener reseña' });
  }
});

// Create review (authenticated users only)
router.post('/', authenticate, reviewValidation, async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;

    // Check if user has already reviewed this product for this order
    const existingReview = await query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2 AND order_id = $3',
      [req.user.id, product_id, order_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ message: 'Ya has reseñado este producto de este pedido' });
    }

    // Verify the order belongs to the user and is delivered
    const orderCheck = await query(
      'SELECT id FROM orders WHERE id = $1 AND (user_id = $2 OR customer_phone = $3) AND status = $4',
      [order_id, req.user.id, req.user.phone, 'delivered']
    );

    if (orderCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Solo puedes reseñar productos de pedidos entregados' });
    }

    const result = await query(`
      INSERT INTO reviews (user_id, product_id, order_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [req.user.id, product_id, order_id, rating, comment]);

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Error al crear reseña' });
  }
});

// Update review (owner only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if review belongs to user
    const reviewCheck = await query('SELECT user_id FROM reviews WHERE id = $1', [req.params.id]);
    
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    if (reviewCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para editar esta reseña' });
    }

    const result = await query(`
      UPDATE reviews 
      SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [rating, comment, req.params.id]);

    res.json({
      message: 'Reseña actualizada exitosamente',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Error al actualizar reseña' });
  }
});

// Delete review (owner or admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Check if review belongs to user or user is admin
    const reviewCheck = await query('SELECT user_id FROM reviews WHERE id = $1', [req.params.id]);
    
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    if (reviewCheck.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reseña' });
    }

    await query('DELETE FROM reviews WHERE id = $1', [req.params.id]);

    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Error al eliminar reseña' });
  }
});

// ============ ADMIN ROUTES FOR MODERATION ============

// Get all reviews for moderation (admin only)
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    let sql = `
      SELECT r.*, u.name as user_name, u.email as user_email, p.name as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status === 'pending') {
      sql += ` AND r.is_approved = false`;
    } else if (status === 'approved') {
      sql += ` AND r.is_approved = true`;
    } else if (status === 'hidden') {
      sql += ` AND r.is_visible = false`;
    }

    sql += ' ORDER BY r.created_at DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get stats
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_approved = false THEN 1 END) as pending,
        COUNT(CASE WHEN is_visible = false THEN 1 END) as hidden
      FROM reviews
    `);

    res.json({
      reviews: result.rows,
      stats: statsResult.rows[0],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
});

// Approve review (admin only)
router.patch('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      UPDATE reviews 
      SET is_approved = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({
      message: 'Reseña aprobada exitosamente',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ message: 'Error al aprobar reseña' });
  }
});

// Hide/Show review (admin only) - For moderation
router.patch('/:id/visibility', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_visible } = req.body;

    const result = await query(`
      UPDATE reviews 
      SET is_visible = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [is_visible, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({
      message: `Reseña ${is_visible ? 'visible' : 'ocultada'} exitosamente`,
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ message: 'Error al cambiar visibilidad' });
  }
});

// Respond to review (admin only)
router.patch('/:id/respond', authenticate, requireAdmin, async (req, res) => {
  try {
    const { admin_response } = req.body;

    const result = await query(`
      UPDATE reviews 
      SET admin_response = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [admin_response, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({
      message: 'Respuesta agregada exitosamente',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({ message: 'Error al responder reseña' });
  }
});

module.exports = router;
