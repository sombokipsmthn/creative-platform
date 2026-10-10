require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000 });
(async () => {
  try {
    const client = await pool.connect();
    // Check if quotes exists with creator_id
    try {
      const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='quotes' ORDER BY ordinal_position`);
      console.log('quotes columns:', cols.rows.map(r=>r.column_name).join(', '));
    } catch(e) { console.log('quotes table:', e.message); }
    try {
      const cols2 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='contracts' ORDER BY ordinal_position`);
      console.log('contracts columns:', cols2.rows.map(r=>r.column_name).join(', '));
    } catch(e) { console.log('contracts table:', e.message); }
    try {
      const cols3 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='users' ORDER BY ordinal_position`);
      console.log('users columns:', cols3.rows.map(r=>r.column_name).join(', '));
    } catch(e) { console.log('users table:', e.message); }
    client.release();
  } catch (e) { console.error('ERR:', e.message); }
  finally { await pool.end(); }
})();
