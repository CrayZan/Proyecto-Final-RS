const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

// Register
router.post('/register', registerValidation, async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if email exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, phone, password, role) 
       VALUES ($1, $2, $3, $4, 'customer') 
       RETURNING id, name, email, phone, role`,
      [name, email, phone, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, name, email, phone, password, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Usuario desactivado' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Remove password from response
    delete user.password;

    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// Guest login (for orders without account)
router.post('/guest', async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ message: 'Nombre y teléfono son requeridos' });
    }

    res.json({
      message: 'Sesión de invitado creada',
      guest: { name, phone }
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ message: 'Error al crear sesión de invitado' });
  }
});

module.exports = router;
