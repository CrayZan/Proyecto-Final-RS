const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Helper function for queries
const query = (text, params) => pool.query(text, params);

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    client.release();
  } catch (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.message);
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
