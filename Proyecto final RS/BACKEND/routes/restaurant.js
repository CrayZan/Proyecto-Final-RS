const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Get restaurant info (public)
router.get('/info', async (req, res) => {
  try {
    const result = await query('SELECT * FROM restaurant_settings LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    res.json({ restaurant: result.rows[0] });
  } catch (error) {
    console.error('Get restaurant info error:', error);
    res.status(500).json({ message: 'Error al obtener información' });
  }
});

// Get opening hours (public)
router.get('/hours', async (req, res) => {
  try {
    const result = await query('SELECT opening_hours FROM restaurant_settings LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    res.json({ opening_hours: result.rows[0].opening_hours });
  } catch (error) {
    console.error('Get hours error:', error);
    res.status(500).json({ message: 'Error al obtener horarios' });
  }
});

// Check if restaurant is open (public)
router.get('/status', async (req, res) => {
  try {
    const result = await query('SELECT opening_hours FROM restaurant_settings LIMIT 1');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    const openingHours = result.rows[0].opening_hours;
    const now = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todayHours = openingHours?.find(h => h.day === currentDay);
    
    let isOpen = false;
    if (todayHours && !todayHours.closed) {
      isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
    }

    res.json({
      is_open: isOpen,
      current_day: currentDay,
      current_time: currentTime,
      today_hours: todayHours || null
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ message: 'Error al obtener estado' });
  }
});

// Update restaurant settings (admin only)
router.put('/settings', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name, description, logo, favicon, phone, email, address,
      latitude, longitude, opening_hours,
      delivery_enabled, pickup_enabled,
      delivery_base_fee, delivery_fee_per_km, max_delivery_distance,
      free_delivery_threshold, tax_rate, currency, timezone,
      social_media, seo_title, seo_description
    } = req.body;

    // Check if settings exist
    const existing = await query('SELECT id FROM restaurant_settings LIMIT 1');

    let result;
    if (existing.rows.length === 0) {
      // Create new settings
      result = await query(`
        INSERT INTO restaurant_settings (
          name, description, logo, favicon, phone, email, address,
          latitude, longitude, opening_hours,
          delivery_enabled, pickup_enabled,
          delivery_base_fee, delivery_fee_per_km, max_delivery_distance,
          free_delivery_threshold, tax_rate, currency, timezone,
          social_media, seo_title, seo_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING *
      `, [
        name, description, logo, favicon, phone, email, address,
        latitude, longitude, JSON.stringify(opening_hours),
        delivery_enabled, pickup_enabled,
        delivery_base_fee, delivery_fee_per_km, max_delivery_distance,
        free_delivery_threshold, tax_rate, currency, timezone,
        JSON.stringify(social_media), seo_title, seo_description
      ]);
    } else {
      // Update existing settings
      result = await query(`
        UPDATE restaurant_settings SET
          name = $1, description = $2, logo = $3, favicon = $4, phone = $5, email = $6, address = $7,
          latitude = $8, longitude = $9, opening_hours = $10,
          delivery_enabled = $11, pickup_enabled = $12,
          delivery_base_fee = $13, delivery_fee_per_km = $14, max_delivery_distance = $15,
          free_delivery_threshold = $16, tax_rate = $17, currency = $18, timezone = $19,
          social_media = $20, seo_title = $21, seo_description = $22, updated_at = CURRENT_TIMESTAMP
        WHERE id = $23
        RETURNING *
      `, [
        name, description, logo, favicon, phone, email, address,
        latitude, longitude, JSON.stringify(opening_hours),
        delivery_enabled, pickup_enabled,
        delivery_base_fee, delivery_fee_per_km, max_delivery_distance,
        free_delivery_threshold, tax_rate, currency, timezone,
        JSON.stringify(social_media), seo_title, seo_description,
        existing.rows[0].id
      ]);
    }

    res.json({
      message: 'Configuración actualizada exitosamente',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Error al actualizar configuración' });
  }
});

// Update logo only (admin only)
router.patch('/logo', authenticate, requireAdmin, async (req, res) => {
  try {
    const { logo } = req.body;

    const existing = await query('SELECT id FROM restaurant_settings LIMIT 1');
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    const result = await query(`
      UPDATE restaurant_settings SET logo = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING logo
    `, [logo, existing.rows[0].id]);

    res.json({
      message: 'Logo actualizado exitosamente',
      logo: result.rows[0].logo
    });
  } catch (error) {
    console.error('Update logo error:', error);
    res.status(500).json({ message: 'Error al actualizar logo' });
  }
});

// Update opening hours only (admin only)
router.patch('/hours', authenticate, requireAdmin, async (req, res) => {
  try {
    const { opening_hours } = req.body;

    const existing = await query('SELECT id FROM restaurant_settings LIMIT 1');
    
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Configuración no encontrada' });
    }

    const result = await query(`
      UPDATE restaurant_settings SET opening_hours = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING opening_hours
    `, [JSON.stringify(opening_hours), existing.rows[0].id]);

    res.json({
      message: 'Horarios actualizados exitosamente',
      opening_hours: result.rows[0].opening_hours
    });
  } catch (error) {
    console.error('Update hours error:', error);
    res.status(500).json({ message: 'Error al actualizar horarios' });
  }
});

module.exports = router;
