const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, phone, password, role)
      VALUES ('Administrador', 'admin@restaurant.com', '1234567890', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

    // Insert default restaurant settings
    await client.query(`
      INSERT INTO restaurant_settings (
        name, description, phone, email, address, opening_hours,
        delivery_enabled, pickup_enabled, delivery_base_fee, 
        delivery_fee_per_km, max_delivery_distance, tax_rate
      ) VALUES (
        'Mi Restaurante',
        'El mejor restaurante de la ciudad',
        '123-456-7890',
        'info@restaurant.com',
        'Calle Principal 123, Ciudad',
        '[
          {"day": "Lunes", "open": "09:00", "close": "22:00", "closed": false},
          {"day": "Martes", "open": "09:00", "close": "22:00", "closed": false},
          {"day": "Miércoles", "open": "09:00", "close": "22:00", "closed": false},
          {"day": "Jueves", "open": "09:00", "close": "22:00", "closed": false},
          {"day": "Viernes", "open": "09:00", "close": "23:00", "closed": false},
          {"day": "Sábado", "open": "10:00", "close": "23:00", "closed": false},
          {"day": "Domingo", "open": "10:00", "close": "21:00", "closed": false}
        ]'::jsonb,
        true, true, 2.00, 0.50, 15.00, 8.00
      )
      ON CONFLICT DO NOTHING
    `);

    // Insert sample categories
    const categories = [
      { name: 'Entradas', description: 'Deliciosas entradas para comenzar', sort_order: 1 },
      { name: 'Platos Principales', description: 'Nuestros platos estrella', sort_order: 2 },
      { name: 'Postres', description: 'Dulces tentaciones', sort_order: 3 },
      { name: 'Bebidas', description: 'Refrescantes bebidas', sort_order: 4 }
    ];

    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (name, description, sort_order)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [cat.name, cat.description, cat.sort_order]);
    }

    // Insert sample products
    const products = [
      {
        name: 'Ensalada César',
        description: 'Lechuga romana, crutones, queso parmesano y aderezo césar',
        price: 8.99,
        category_id: 1,
        ingredients: 'Lechuga romana, crutones, parmesano, aderezo césar',
        allergens: 'Lácteos, Gluten',
        portion_size: 'Individual',
        is_available: true
      },
      {
        name: 'Nachos Supreme',
        description: 'Nachos con queso, jalapeños, guacamole y sour cream',
        price: 10.99,
        category_id: 1,
        ingredients: 'Nachos, queso cheddar, jalapeños, guacamole, sour cream',
        allergens: 'Lácteos',
        portion_size: 'Para compartir',
        is_available: true
      },
      {
        name: 'Hamburguesa Clásica',
        description: 'Carne de res 200g, lechuga, tomate, cebolla y queso',
        price: 14.99,
        category_id: 2,
        ingredients: 'Carne de res, pan, lechuga, tomate, cebolla, queso cheddar',
        allergens: 'Gluten, Lácteos',
        portion_size: '200g',
        is_featured: true,
        is_available: true
      },
      {
        name: 'Pasta Alfredo',
        description: 'Fettuccine en salsa cremosa de queso parmesano',
        price: 16.99,
        category_id: 2,
        ingredients: 'Fettuccine, crema, mantequilla, parmesano',
        allergens: 'Gluten, Lácteos',
        portion_size: '350g',
        is_available: true
      },
      {
        name: 'Pizza Margherita',
        description: 'Salsa de tomate, mozzarella fresca y albahaca',
        price: 18.99,
        category_id: 2,
        ingredients: 'Masa, tomate, mozzarella, albahaca, aceite de oliva',
        allergens: 'Gluten, Lácteos',
        portion_size: 'Mediana (8 porciones)',
        is_featured: true,
        is_available: true
      },
      {
        name: 'Tiramisú',
        description: 'Clásico postre italiano con café y mascarpone',
        price: 7.99,
        category_id: 3,
        ingredients: 'Mascarpone, café, bizcochos, cacao, huevos',
        allergens: 'Huevos, Lácteos, Gluten',
        portion_size: 'Individual',
        is_available: true
      },
      {
        name: 'Cheesecake',
        description: 'Cheesecake de Nueva York con salsa de frutos rojos',
        price: 8.99,
        category_id: 3,
        ingredients: 'Queso crema, galletas, mantequilla, frutos rojos',
        allergens: 'Lácteos, Gluten',
        portion_size: 'Porción',
        is_available: true
      },
      {
        name: 'Coca-Cola',
        description: 'Refresco 500ml',
        price: 2.99,
        category_id: 4,
        ingredients: 'Agua carbonatada, azúcar, cafeína',
        allergens: '',
        portion_size: '500ml',
        is_available: true
      },
      {
        name: 'Agua Mineral',
        description: 'Agua mineral sin gas 500ml',
        price: 1.99,
        category_id: 4,
        ingredients: 'Agua mineral',
        allergens: '',
        portion_size: '500ml',
        is_available: true
      }
    ];

    for (const product of products) {
      await client.query(`
        INSERT INTO products (
          name, description, price, category_id, ingredients, 
          allergens, portion_size, is_featured, is_available
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT DO NOTHING
      `, [
        product.name, product.description, product.price, product.category_id,
        product.ingredients, product.allergens, product.portion_size,
        product.is_featured || false, product.is_available
      ]);
    }

    // Insert sample coupon
    await client.query(`
      INSERT INTO coupons (code, type, value, min_purchase, valid_from, valid_until, usage_limit)
      VALUES ('BIENVENIDO20', 'percentage', 20, 20.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100)
      ON CONFLICT DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('✅ Datos iniciales insertados exitosamente');
    console.log('👤 Admin: admin@restaurant.com / admin123');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error insertando datos:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

seedData();
