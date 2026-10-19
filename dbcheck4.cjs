require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 30000, idleTimeoutMillis: 30000 });
(async () => {
  try {
    const client = await pool.connect();
    const mig = await client.query(`SELECT id, hash, created_at FROM __drizzle_migrations ORDER BY created_at`);
    console.log('__drizzle_migrations (' + mig.rows.length + '):');
    mig.rows.forEach(r => console.log('  id=' + r.id + ' hash=' + r.hash + ' ' + r.created_at.toISOString()));
    const cols = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`);
    console.log('\nTABLES (' + cols.rows.length + '):');
    cols.rows.forEach(r => console.log('  ' + r.table_name));
    client.release();
  } catch (e) { console.error('ERR:', e.message); }
  finally { await pool.end(); }
})();
