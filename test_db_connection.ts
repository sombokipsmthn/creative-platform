const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    await pool.query('SELECT COUNT(*) FROM equipment;');
    console.log('Database connection successful');
    const result = await pool.query('SELECT * FROM equipment LIMIT 10;');
    console.log('Equipment records:', result.rows);
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
