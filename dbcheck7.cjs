require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000 });
(async () => {
  try {
    const client = await pool.connect();
    // Check contracts table structure
    try {
      const cols = await client.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name='contracts' ORDER BY ordinal_position`);
      console.log('contracts exists:', cols.rows.length > 0);
      cols.rows.forEach(r => console.log('  ' + r.column_name + ': ' + r.data_type + ' ' + (r.is_nullable==='NO'?'':'NULL ') + (r.column_default?'default: '+r.column_default:'')));
    } catch(e) { console.log('contracts:', e.message); }
    // Check quote_amendments
    try {
      const ca = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='quote_amendments')`);
      console.log('quote_amendments exists:', ca.rows[0].exists);
    } catch(e) {}
    // Check passkeys, account, session, verification
    ['passkeys', 'account', 'session', 'verification'].forEach(t => {
      (async () => {
        const r = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name=$1)`, [t]);
        console.log(t + ' exists:', r.rows[0].exists);
      })();
    });
    // Check creators_id vs user_id in clients
    const ci = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='clients' ORDER BY ordinal_position`);
    console.log('\nclients columns:');
    ci.rows.forEach(r => console.log('  ' + r.column_name + ': ' + r.data_type));
    client.release();
  } catch (e) { console.error('ERR:', e.message); }
  finally { await pool.end(); }
})();
