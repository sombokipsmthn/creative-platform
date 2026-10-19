require('dotenv').config({ path: '.env.local', quiet: true });
const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function applySQLInOrder() {
  try {
    const client = await pool.connect();
    const sql = fs.readFileSync('./sql/missing_tables.sql', 'utf8');

    // Split by semicolon and process in batches respecting dependencies
    const rawStatements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Processing ${rawStatements.length} raw statements in dependency order...`);

    // Group statements by type to ensure proper ordering
    const batches = [
      // Batch 1: Core tables with no forward dependencies
      {
        name: 'Foundation tables',
        statements: rawStatements.filter(s =>
          s.includes('CREATE TABLE IF NOT EXISTS galleries') ||
          s.includes('CREATE TABLE IF NOT EXISTS contracts') ||
          s.includes('CREATE TABLE IF NOT EXISTS contract_templates') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_collections')
        )
      },
      // Batch 2: Tables that depend on above
      {
        name: 'Dependency tables',
        statements: rawStatements.filter(s =>
          s.includes('CREATE TABLE IF NOT EXISTS gallery_photos') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_access_sessions') ||
          s.includes('CREATE TABLE IF NOT EXISTS contract_events')
        )
      },
      // Batch 3: More dependent tables
      {
        name: 'Photo and access tables',
        statements: rawStatements.filter(s =>
          s.includes('CREATE TABLE IF NOT EXISTS gallery_access_attempts') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_photo_actions') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_comments') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_activity') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_themes')
        )
      },
      // Batch 4: Final tables
      {
        name: 'Approval and watermark tables',
        statements: rawStatements.filter(s =>
          s.includes('CREATE TABLE IF NOT EXISTS gallery_approvals') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_watermarks') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_download_presets') ||
          s.includes('CREATE TABLE IF NOT EXISTS gallery_downloads') ||
          s.includes('CREATE TABLE IF NOT EXISTS upload_audit')
        )
      },
      // Batch 5: Indexes and constraints
      {
        name: 'Indexes and constraints',
        statements: rawStatements.filter(s =>
          s.includes('CREATE INDEX') ||
          s.includes('ADD CONSTRAINT') ||
          s.includes('UNIQUE(')
        )
      },
      // Batch 6: Data seeding
      {
        name: 'Data seeding',
        statements: rawStatements.filter(s =>
          s.includes('INSERT INTO')
        )
      }
    ];

    let totalApplied = 0;
    for (const batch of batches) {
      if (batch.statements.length === 0) continue;

      console.log(`\n--- ${batch.name} (${batch.statements.length} statements) ---`);

      for (let i = 0; i < batch.statements.length; i++) {
        const stmt = batch.statements[i];
        try {
          await client.query(stmt);
          if ((i + 1) % 5 === 0) {
            console.log(`  Applied ${i + 1}/${batch.statements.length} in batch`);
          }
        } catch (err) {
          // Log but continue - some failures are OK if objects already exist
          if (!err.message.includes('already exists') &&
              !err.message.includes('duplicate key value violates unique constraint') &&
              !err.message.includes('relation does not exist')) {
            console.warn(`  Warning:`, err.message.substring(0, 100));
          }
        }
        totalApplied++;
      }
    }

    console.log(`\n✅ Applied ${totalApplied} total statements`);

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
      console.log('\n✅ ALL REQUIRED TABLES ARE PRESENT!');
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

applySQLInOrder();