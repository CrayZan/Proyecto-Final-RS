const { pool } = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE,
        phone VARCHAR(20),
        password VARCHAR(255),
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'cashier', 'cook', 'delivery')),
        avatar VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        image VARCHAR(255),
        ingredients TEXT,
        allergens TEXT,
        portion_size VARCHAR(100),
        preparation_time INTEGER,
        is_available BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) CHECK (type IN ('percentage', 'fixed')),
        value DECIMAL(10,2) NOT NULL,
        min_purchase DECIMAL(10,2) DEFAULT 0,
        max_discount DECIMAL(10,2),
        valid_from TIMESTAMP,
        valid_until TIMESTAMP,
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_phone VARCHAR(20) NOT NULL,
        customer_email VARCHAR(100),
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        coupon_code VARCHAR(50),
        order_type VARCHAR(20) CHECK (order_type IN ('delivery', 'pickup')),
        address TEXT,
        address_details TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        distance_km DECIMAL(5,2),
        payment_method VARCHAR(20) CHECK (payment_method IN ('mercadopago', 'transfer', 'cash')),
        payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
        payment_reference VARCHAR(255),
        payment_proof VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
        notes TEXT,
        estimated_delivery_time TIMESTAMP,
        delivered_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        is_approved BOOLEAN DEFAULT true,
        is_visible BOOLEAN DEFAULT true,
        admin_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Restaurant settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurant_settings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        logo VARCHAR(255),
        favicon VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        opening_hours JSONB,
        delivery_enabled BOOLEAN DEFAULT true,
        pickup_enabled BOOLEAN DEFAULT true,
        delivery_base_fee DECIMAL(10,2) DEFAULT 0,
        delivery_fee_per_km DECIMAL(10,2) DEFAULT 0,
        max_delivery_distance DECIMAL(5,2) DEFAULT 10,
        free_delivery_threshold DECIMAL(10,2),
        tax_rate DECIMAL(5,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        timezone VARCHAR(50) DEFAULT 'America/New_York',
        social_media JSONB,
        seo_title VARCHAR(200),
        seo_description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order status history
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id)');

    await client.query('COMMIT');
    console.log('✅ Todas las tablas creadas exitosamente');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error creando tablas:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

createTables();
