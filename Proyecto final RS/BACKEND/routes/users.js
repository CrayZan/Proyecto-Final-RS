const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// Update current user
router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    
    const result = await query(
      `UPDATE users 
       SET name = $1, phone = $2, email = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING id, name, email, phone, role`,
      [name, phone, email, req.user.id]
    );

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
});

// Change password
router.put('/me/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current password
    const userResult = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const currentHashedPassword = userResult.rows[0].password;

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, currentHashedPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
});

// Get all users (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    
    let sql = 'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (role) {
      sql += ` AND role = $${paramIndex++}`;
      params.push(role);
    }

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY created_at DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM users');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// Create user (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if email exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, phone, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, is_active`,
      [name, email, phone, hashedPassword, role || 'customer']
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

// Update user (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, role, is_active } = req.body;

    const result = await query(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, role = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING id, name, email, phone, role, is_active`,
      [name, email, phone, role, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
