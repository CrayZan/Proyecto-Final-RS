const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_available = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.name ASC
    `);

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
});

// Get category by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Get products in category
    const productsResult = await query(`
      SELECT * FROM products 
      WHERE category_id = $1 AND is_available = true
      ORDER BY sort_order ASC, name ASC
    `, [req.params.id]);

    const category = result.rows[0];
    category.products = productsResult.rows;

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Error al obtener categoría' });
  }
});

// Create category (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, image, sort_order } = req.body;

    const result = await query(`
      INSERT INTO categories (name, description, image, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, description, image, sort_order || 0]);

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Error al crear categoría' });
  }
});

// Update category (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, image, sort_order, is_active } = req.body;

    const result = await query(`
      UPDATE categories 
      SET name = $1, description = $2, image = $3, sort_order = $4, is_active = $5
      WHERE id = $6
      RETURNING *
    `, [name, description, image, sort_order, is_active, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({
      message: 'Categoría actualizada exitosamente',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Check if category has products
    const productsCheck = await query('SELECT COUNT(*) FROM products WHERE category_id = $1', [req.params.id]);
    const productCount = parseInt(productsCheck.rows[0].count);

    if (productCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
});

module.exports = router;
