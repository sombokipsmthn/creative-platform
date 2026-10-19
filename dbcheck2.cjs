require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
(async () => {
  try {
    const client = await pool.connect();
    const mig = await client.query(`SELECT * FROM __drizzle_migrations ORDER BY applied_at`);
    console.log('__drizzle_migrations (' + mig.rows.length + '):');
    mig.rows.forEach(r => console.log('  ' + JSON.stringify(r)));
    const cols = await client.query(`
      SELECT table_name, column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name IN ('galleries','contracts','users','user','clients')
      ORDER BY table_name, ordinal_position
    `);
    console.log('\nColumns for key tables:');
    cols.rows.forEach(r => console.log('  ' + r.table_name + '.' + r.column_name + ' : ' + r.data_type));
    client.release();
  } catch (e) { console.error('DB ERROR:', e.message); }
  finally { await pool.end(); }
})();
