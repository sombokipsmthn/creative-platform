require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 20000 });
(async () => {
  try {
    const client = await pool.connect();
    const test = await client.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='galleries') AS galleries_exists,
             EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='contracts') AS contracts_exists,
             EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='gallery_photo_actions') AS photo_actions_exists,
             EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='gallery_themes') AS themes_exists,
             EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='gallery_activity') AS activity_exists,
             EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='upload_audit') AS audit_exists
    `);
    console.log(JSON.stringify(test.rows[0]));
    const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='__drizzle_migrations' ORDER BY ordinal_position`);
    console.log('__drizzle_migrations cols:', cols.rows.map(r=>r.column_name).join(', '));
    client.release();
  } catch (e) { console.error('ERR:', e.message); }
  finally { await pool.end(); }
})();
