const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Sales report
router.get('/sales', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to, group_by = 'day' } = req.query;
    
    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (date_from) {
      dateFilter += ` AND DATE(o.created_at) >= $${paramIndex++}`;
      params.push(date_from);
    }

    if (date_to) {
      dateFilter += ` AND DATE(o.created_at) <= $${paramIndex++}`;
      params.push(date_to);
    }

    // Group by clause based on group_by parameter
    let groupByClause;
    let selectClause;
    
    switch (group_by) {
      case 'month':
        selectClause = `TO_CHAR(DATE_TRUNC('month', o.created_at), 'YYYY-MM') as period`;
        groupByClause = `DATE_TRUNC('month', o.created_at)`;
        break;
      case 'week':
        selectClause = `TO_CHAR(DATE_TRUNC('week', o.created_at), 'YYYY-MM-DD') as period`;
        groupByClause = `DATE_TRUNC('week', o.created_at)`;
        break;
      case 'day':
      default:
        selectClause = `TO_CHAR(DATE(o.created_at), 'YYYY-MM-DD') as period`;
        groupByClause = `DATE(o.created_at)`;
    }

    const salesResult = await query(`
      SELECT 
        ${selectClause},
        COUNT(*) as total_orders,
        SUM(o.subtotal) as subtotal,
        SUM(o.delivery_fee) as delivery_fees,
        SUM(o.discount_amount) as discounts,
        SUM(o.tax_amount) as taxes,
        SUM(o.total) as total_revenue,
        AVG(o.total) as average_order_value
      FROM orders o
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY ${groupByClause}
      ORDER BY ${groupByClause} DESC
    `, params);

    // Summary
    const summaryResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(subtotal) as subtotal,
        SUM(delivery_fee) as delivery_fees,
        SUM(discount_amount) as discounts,
        SUM(tax_amount) as taxes,
        SUM(total) as total_revenue,
        AVG(total) as average_order_value
      FROM orders
      WHERE status != 'cancelled' ${dateFilter}
    `, params);

    res.json({
      sales: salesResult.rows,
      summary: summaryResult.rows[0]
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ message: 'Error al generar reporte de ventas' });
  }
});

// Top products report
router.get('/top-products', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to, limit = 10 } = req.query;
    
    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (date_from) {
      dateFilter += ` AND DATE(o.created_at) >= $${paramIndex++}`;
      params.push(date_from);
    }

    if (date_to) {
      dateFilter += ` AND DATE(o.created_at) <= $${paramIndex++}`;
      params.push(date_to);
    }

    params.push(limit);

    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.image,
        c.name as category_name,
        COUNT(*) as times_ordered,
        SUM((item->>'quantity')::int) as total_quantity,
        SUM((item->>'price')::decimal * (item->>'quantity')::int) as total_revenue
      FROM orders o,
      LATERAL jsonb_array_elements(o.items) as item
      JOIN products p ON (item->>'product_id')::int = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE o.status != 'cancelled' ${dateFilter}
      GROUP BY p.id, p.name, p.image, c.name
      ORDER BY total_quantity DESC
      LIMIT $${paramIndex}
    `, params);

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Top products report error:', error);
    res.status(500).json({ message: 'Error al generar reporte de productos' });
  }
});

// Orders by status report
router.get('/orders-by-status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (date_from) {
      dateFilter += ` AND DATE(created_at) >= $${paramIndex++}`;
      params.push(date_from);
    }

    if (date_to) {
      dateFilter += ` AND DATE(created_at) <= $${paramIndex++}`;
      params.push(date_to);
    }

    const result = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total) as total_value
      FROM orders
      WHERE 1=1 ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `, params);

    res.json({ status_breakdown: result.rows });
  } catch (error) {
    console.error('Orders by status report error:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
});

// Payment methods report
router.get('/payment-methods', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (date_from) {
      dateFilter += ` AND DATE(created_at) >= $${paramIndex++}`;
      params.push(date_from);
    }

    if (date_to) {
      dateFilter += ` AND DATE(created_at) <= $${paramIndex++}`;
      params.push(date_to);
    }

    const result = await query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total) as total_value
      FROM orders
      WHERE status != 'cancelled' ${dateFilter}
      GROUP BY payment_method
      ORDER BY count DESC
    `, params);

    res.json({ payment_methods: result.rows });
  } catch (error) {
    console.error('Payment methods report error:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
});

// Delivery performance report
router.get('/delivery', authenticate, requireAdmin, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (date_from) {
      dateFilter += ` AND DATE(created_at) >= $${paramIndex++}`;
      params.push(date_from);
    }

    if (date_to) {
      dateFilter += ` AND DATE(created_at) <= $${paramIndex++}`;
      params.push(date_to);
    }

    const result = await query(`
      SELECT 
        order_type,
        COUNT(*) as total_orders,
        AVG(distance_km) as avg_distance,
        AVG(delivery_fee) as avg_delivery_fee,
        SUM(delivery_fee) as total_delivery_fees
      FROM orders
      WHERE status != 'cancelled' ${dateFilter}
      GROUP BY order_type
    `, params);

    // Distance ranges
    const distanceResult = await query(`
      SELECT 
        CASE 
          WHEN distance_km <= 1 THEN '0-1 km'
          WHEN distance_km <= 3 THEN '1-3 km'
          WHEN distance_km <= 5 THEN '3-5 km'
          WHEN distance_km <= 10 THEN '5-10 km'
          ELSE '10+ km'
        END as distance_range,
        COUNT(*) as orders
      FROM orders
      WHERE order_type = 'delivery' AND status != 'cancelled' ${dateFilter}
      GROUP BY 1
      ORDER BY MIN(distance_km)
    `, params);

    res.json({
      delivery_summary: result.rows,
      distance_ranges: distanceResult.rows
    });
  } catch (error) {
    console.error('Delivery report error:', error);
    res.status(500).json({ message: 'Error al generar reporte de delivery' });
  }
});

// Dashboard stats
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // Today's stats
    const todayResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'preparing' THEN 1 END) as preparing_orders,
        COUNT(CASE WHEN status = 'out_for_delivery' THEN 1 END) as delivering_orders
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // This week's stats
    const weekResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue
      FROM orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      AND status != 'cancelled'
    `);

    // This month's stats
    const monthResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total) as total_revenue
      FROM orders 
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      AND status != 'cancelled'
    `);

    // Recent orders
    const recentOrders = await query(`
      SELECT o.*, 
        (SELECT COUNT(*) FROM reviews r WHERE r.order_id = o.id) as has_review
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 10
    `);

    // Low stock products (if you add stock tracking)
    const lowStockProducts = await query(`
      SELECT id, name, is_available
      FROM products
      WHERE is_available = false
      ORDER BY name
      LIMIT 5
    `);

    res.json({
      today: todayResult.rows[0],
      this_week: weekResult.rows[0],
      this_month: monthResult.rows[0],
      recent_orders: recentOrders.rows,
      unavailable_products: lowStockProducts.rows
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
