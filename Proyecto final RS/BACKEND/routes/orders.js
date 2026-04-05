const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin, requireRole } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

// Generate order number
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD${year}${month}${day}-${random}`;
};

// Get all orders (admin/staff only)
router.get('/', authenticate, requireRole('admin', 'cashier', 'cook', 'delivery'), async (req, res) => {
  try {
    const { status, date_from, date_to, search, page = 1, limit = 20 } = req.query;
    
    let sql = `
      SELECT o.*, 
        (SELECT COUNT(*) FROM reviews r WHERE r.order_id = o.id) as has_review
      FROM orders o 
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND o.status = $${paramIndex++}`;
      params.push(status);
    }

    if (date_from) {
      sql += ` AND DATE(o.created_at) >= $${paramIndex++}`;
      params.push(date_from);
    }

    if (date_to) {
      sql += ` AND DATE(o.created_at) <= $${paramIndex++}`;
      params.push(date_to);
    }

    if (search) {
      sql += ` AND (o.order_number ILIKE $${paramIndex} OR o.customer_name ILIKE $${paramIndex} OR o.customer_phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ' ORDER BY o.created_at DESC';
    
    // Pagination
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    
    // Get total count
    const countResult = await query('SELECT COUNT(*) FROM orders');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error al obtener pedidos' });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM orders WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const order = result.rows[0];

    // Get status history
    const historyResult = await query(`
      SELECT osh.*, u.name as changed_by_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = $1
      ORDER BY osh.created_at ASC
    `, [req.params.id]);

    order.status_history = historyResult.rows;

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Error al obtener pedido' });
  }
});

// Create order (public)
router.post('/', orderValidation, async (req, res) => {
  const client = await require('../config/database').pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      customer_name, customer_phone, customer_email,
      items, subtotal, delivery_fee, discount_amount, tax_amount, total,
      coupon_code, order_type, address, address_details,
      latitude, longitude, distance_km,
      payment_method, notes
    } = req.body;

    const orderNumber = generateOrderNumber();

    // Validate coupon if provided
    let validCoupon = null;
    if (coupon_code) {
      const couponResult = await client.query(`
        SELECT * FROM coupons 
        WHERE code = $1 AND is_active = true 
        AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
        AND (usage_limit IS NULL OR usage_count < usage_limit)
      `, [coupon_code]);

      if (couponResult.rows.length > 0) {
        validCoupon = couponResult.rows[0];
        // Increment usage count
        await client.query('UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1', [validCoupon.id]);
      }
    }

    // Create order
    const orderResult = await client.query(`
      INSERT INTO orders (
        order_number, customer_name, customer_phone, customer_email,
        items, subtotal, delivery_fee, discount_amount, tax_amount, total,
        coupon_code, order_type, address, address_details,
        latitude, longitude, distance_km,
        payment_method, notes, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `, [
      orderNumber, customer_name, customer_phone, customer_email,
      JSON.stringify(items), subtotal, delivery_fee, discount_amount, tax_amount, total,
      coupon_code, order_type, address, address_details,
      latitude, longitude, distance_km,
      payment_method, notes,
      payment_method === 'cash' ? 'pending' : 'confirmed',
      payment_method === 'cash' ? 'pending' : 'processing'
    ]);

    const order = orderResult.rows[0];

    // Add status history
    await client.query(`
      INSERT INTO order_status_history (order_id, status, notes)
      VALUES ($1, $2, $3)
    `, [order.id, order.status, 'Pedido creado']);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      order
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error al crear pedido' });
  } finally {
    client.release();
  }
});

// Update order status (admin/staff only)
router.patch('/:id/status', authenticate, requireRole('admin', 'cashier', 'cook', 'delivery'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update order
      const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
      const params = [status];
      let paramIndex = 2;

      if (status === 'delivered') {
        updateFields.push(`delivered_at = CURRENT_TIMESTAMP`);
      }

      const result = await client.query(`
        UPDATE orders 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, [...params, req.params.id]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Pedido no encontrado' });
      }

      // Add status history
      await client.query(`
        INSERT INTO order_status_history (order_id, status, notes, changed_by)
        VALUES ($1, $2, $3, $4)
      `, [req.params.id, status, notes || `Estado cambiado a: ${status}`, req.user.id]);

      await client.query('COMMIT');

      res.json({
        message: 'Estado actualizado exitosamente',
        order: result.rows[0]
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment', authenticate, requireAdmin, async (req, res) => {
  try {
    const { payment_status, payment_reference } = req.body;
    
    const result = await query(`
      UPDATE orders 
      SET payment_status = $1, payment_reference = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `, [payment_status, payment_reference, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({
      message: 'Estado de pago actualizado exitosamente',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Error al actualizar pago' });
  }
});

// Upload payment proof (public)
router.post('/:id/payment-proof', async (req, res) => {
  try {
    const { payment_proof_url } = req.body;
    
    const result = await query(`
      UPDATE orders 
      SET payment_proof = $1, payment_status = 'processing', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [payment_proof_url, req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({
      message: 'Comprobante subido exitosamente',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({ message: 'Error al subir comprobante' });
  }
});

// Cancel order
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const result = await query(`
      UPDATE orders 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status IN ('pending', 'confirmed')
      RETURNING *
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ 
        message: 'No se puede cancelar el pedido. Verifique que esté en estado pendiente o confirmado.' 
      });
    }

    res.json({
      message: 'Pedido cancelado exitosamente',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Error al cancelar pedido' });
  }
});

// Get order statistics (admin only)
router.get('/stats/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    // Today's orders
    const todayResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // Orders by status
    const statusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY status
    `);

    // Revenue by day (last 7 days)
    const revenueResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      today: todayResult.rows[0],
      by_status: statusResult.rows,
      revenue_last_7_days: revenueResult.rows
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
