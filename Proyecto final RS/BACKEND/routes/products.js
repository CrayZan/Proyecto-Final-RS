const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, available, page = 1, limit = 50 } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND p.category_id = $${paramIndex++}`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (featured === 'true') {
      sql += ` AND p.is_featured = true`;
    }

    if (available === 'true') {
      sql += ` AND p.is_available = true`;
    }

    sql += ' ORDER BY p.sort_order ASC, p.name ASC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM products');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Get product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Get reviews
    const reviewsResult = await query(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_visible = true
      ORDER BY r.created_at DESC
    `, [req.params.id]);

    const product = result.rows[0];
    product.reviews = reviewsResult.rows;

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// Create product (admin only)
router.post('/', authenticate, requireAdmin, productValidation, async (req, res) => {
  try {
    const {
      name, description, price, category_id, image,
      ingredients, allergens, portion_size, preparation_time,
      is_available, is_featured, sort_order
    } = req.body;

    const result = await query(`
      INSERT INTO products (
        name, description, price, category_id, image,
        ingredients, allergens, portion_size, preparation_time,
        is_available, is_featured, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      name, description, price, category_id, image,
      ingredients, allergens, portion_size, preparation_time,
      is_available !== false, is_featured || false, sort_order || 0
    ]);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
});

// Update product (admin only)
router.put('/:id', authenticate, requireAdmin, productValidation, async (req, res) => {
  try {
    const {
      name, description, price, category_id, image,
      ingredients, allergens, portion_size, preparation_time,
      is_available, is_featured, sort_order
    } = req.body;

    const result = await query(`
      UPDATE products SET
        name = $1, description = $2, price = $3, category_id = $4, image = $5,
        ingredients = $6, allergens = $7, portion_size = $8, preparation_time = $9,
        is_available = $10, is_featured = $11, sort_order = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `, [
      name, description, price, category_id, image,
      ingredients, allergens, portion_size, preparation_time,
      is_available !== false, is_featured || false, sort_order || 0,
      req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
});

// Toggle product availability (admin only)
router.patch('/:id/availability', authenticate, requireAdmin, async (req, res) => {
  try {
    const { is_available } = req.body;

    const result = await query(`
      UPDATE products 
      SET is_available = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 
      RETURNING *
    `, [is_available, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({
      message: `Producto ${is_available ? 'habilitado' : 'deshabilitado'} exitosamente`,
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: 'Error al cambiar disponibilidad' });
  }
});

module.exports = router;
