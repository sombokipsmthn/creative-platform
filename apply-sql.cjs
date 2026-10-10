require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applySQL() {
  try {
    const client = await pool.connect();
    const sql = fs.readFileSync('./sql/missing_tables.sql', 'utf8');

    // Split by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Applying ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        if ((i + 1) % 10 === 0) {
          console.log(`Applied ${i + 1}/${statements.length} statements`);
        }
      } catch (err) {
        // Some statements might fail if objects already exist, which is OK
        if (!err.message.includes('already exists') &&
            !err.message.includes('duplicate key value violates unique constraint')) {
          console.warn(`Warning on statement ${i + 1}:`, err.message.substring(0, 100));
        }
      }
    }

    console.log('All statements processed');

    // Final verification
    const tablesRes = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE'
      ORDER BY table_name
    `);
    console.log(`\nDatabase now has ${tablesRes.rows.length} tables:`);
    tablesRes.rows.forEach(r => console.log('  ' + r.table_name));

    const needTables = ['galleries','contracts','gallery_photo_actions','gallery_themes','gallery_activity','upload_audit'];
    const haveTables = tablesRes.rows.map(r => r.table_name);
    const missingTables = needTables.filter(t => !haveTables.includes(t));

    if (missingTables.length === 0) {
      console.log('\n✅ All required tables are present!');
    } else {
      console.log('\n❌ Still missing tables:', missingTables.join(', '));
    }

    client.release();
  } catch (err) {
    console.error('Failed to apply SQL:', err.message);
  } finally {
    await pool.end();
  }
}

applySQL();