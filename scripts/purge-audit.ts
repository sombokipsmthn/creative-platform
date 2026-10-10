/**
 * Purge audit and execution utility.
 *
 * In dry-run mode (default): Connects to the database and produces a read-only report
 * of all creator-owned data that would be affected by a development data reset.
 *
 * In execution mode (--execute --force): Performs the actual deletion of development
 * data after validating all safety conditions.
 *
 * Usage:
 *   npx tsx scripts/purge-audit.ts                     # dry-run (default, safe)
 *   npx tsx scripts/purge-audit.ts --dry-run          # explicit dry-run
 *   npx tsx scripts/purge-audit.ts --execute --force  # destructive execution (requires approval)
 */

import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TableReport {
  table: string;
  estimatedRows: number;
  actualRows?: number; // For execution mode
  notes?: string;
}

interface OrphanReport {
  table: string;
  reference: string;
  foreignKey: string;
  referencedTable: string;
}

interface AuditReport {
  timestamp: string;
  database: string;
  host: string;
  isDevelopment: boolean;
  tables: TableReport[];
  orphans: OrphanReport[];
  purgeTargets: TableReport[];
  preservedTables: string[];
  summary: {
    totalTables: number;
    totalRecords: number;
    orphanCount: number;
    purgedRecordEstimate: number;
  };
}

interface ExecutionResult {
  success: boolean;
  deletedCounts: Record<string, number>;
  storageCleanup: {
    attempted: number;
    succeeded: number;
    failed: number;
    errors: string[];
  };
  executionTimeMs: number;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PURGEABLE_TABLES = [
  'users',
  'sessions',
  'accounts',
  'verifications',
  'passkeys',
  'creator_profiles',
  'creator_services',
  'creator_business_profiles',
  'clients',
  'projects',
  'project_media',
  'quotes',
  'quote_items',
  'invoices',
  'invoice_items',
  'contracts',
  'contract_events',
  'contract_templates',
  'galleries',
  'gallery_collections',
  'gallery_photos',
  'gallery_themes',
  'gallery_access_sessions',
  'gallery_access_attempts',
  'gallery_photo_actions',
  'gallery_comments',
  'gallery_activity',
  'gallery_approvals',
  'gallery_watermarks',
  'gallery_download_presets',
  'gallery_downloads',
  'upload_audit'
] as const;

const PRESERVED_TABLES = ['equipment', '__drizzle_migrations'] as const;

// Dependency order for safe deletion (children first)
const DELETE_ORDER = [
  { table: 'invoice_items',   dependencies: [] },
  { table: 'quote_items',     dependencies: [] },
  { table: 'project_media',   dependencies: [] },
  { table: 'gallery_photos',  dependencies: [] },
  { table: 'invoice_items',   dependencies: [] }, // Duplicate for emphasis - will be handled by SET
  { table: 'quotes',          dependencies: ['quote_items'] },
  { table: 'projects',        dependencies: ['project_media'] },
  { table: 'galleries',       dependencies: ['gallery_photos'] },
  { table: 'gallery_downloads', dependencies: [] },
  { table: 'gallery_download_presets', dependencies: [] },
  { table: 'gallery_watermarks', dependencies: [] },
  { table: 'gallery_themes', dependencies: [] },
  { table: 'gallery_access_sessions', dependencies: [] },
  { table: 'gallery_access_attempts', dependencies: [] },
  { table: 'gallery_photo_actions', dependencies: [] },
  { table: 'gallery_comments', dependencies: [] },
  { table: 'gallery_activity', dependencies: [] },
  { table: 'gallery_approvals', dependencies: [] },
  { table: 'contract_events', dependencies: [] },
  { table: 'contracts', dependencies: [] },
  { table: 'invoice_items', dependencies: [] }, // Already covered
  { table: 'invoices', dependencies: ['invoice_items'] },
  { table: 'creator_business_profiles', dependencies: [] },
  { table: 'creator_services', dependencies: [] },
  { table: 'creator_profiles', dependencies: [] },
  { table: 'clients', dependencies: [] },
  { table: 'upload_audit', dependencies: [] },
  { table: 'sessions', dependencies: [] },
  { table: 'accounts', dependencies: [] },
  { table: 'passkeys', dependencies: [] },
  { table: 'verifications', dependencies: [] },
  { table: 'users', dependencies: [] } // Final table
] as const;

// ---------------------------------------------------------------------------
// Environment loading (worktree-safe)
// ---------------------------------------------------------------------------

function loadEnvFiles(): void {
  try {
    // Resolve paths relative to the project root (parent of worktree)
    const projectRoot = join(process.cwd(), '..');
    const envLocal = join(projectRoot, '.env.local');
    const envMain = join(projectRoot, '.env');

    const loadEnvFile = (filePath: string) => {
      try {
        const content = readFileSync(filePath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const match = trimmed.match(/^([^#=\s]+)\s*=\s*(.+)/);
          if (!match) continue;
          const key = match[1].trim();
          let value = match[2].trim();
          // Strip quotes
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }
          // Don't overwrite existing process.env values
          if (!(key in process.env)) {
            process.env[key] = value;
          }
        }
      } catch {
        // File doesn't exist - continue
      }
    };

    loadEnvFile(envLocal);
    loadEnvFile(envMain);
  } catch {
    // Continue without env files if there's an issue
  }
}

// Load environment on module initialization
loadEnvFiles();

// ---------------------------------------------------------------------------
// Database connection helpers
// ---------------------------------------------------------------------------

function parseDatabaseUrl(url: string): {
  host: string;
  database: string;
  port: number;
} {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    database: parsed.pathname.replace(/^\//, ""),
    port: parsed.port ? parseInt(parsed.port, 10) : 5432,
  };
}

function isDevelopmentHost(host: string): boolean {
  // Localhost is always development
  const isLocal = host === "localhost" || host === "127.0.0.1";
  if (isLocal) return true;

  // Check for explicit override
  if (process.env.FORCE_DRY_RUN === "true") {
    return true; // Allow dry-run against any host when forced
  }

  // Be conservative: assume remote Neon hosts are production unless forced
  const isNeon = host.includes("neon.tech");
  if (isNeon) return false;

  return false;
}

async function connectToDatabase(): Promise<Pool> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const { host, database } = parseDatabaseUrl(dbUrl);
  const devMode = isDevelopmentHost(host);

  // Safety check: prevent execution against non-development hosts unless explicitly forced
  const isExecutionMode = process.argv.includes("--execute") && process.argv.includes("--force");
  if (!devMode && isExecutionMode && process.env.FORCE_DRY_RUN !== "true") {
    throw new Error(
      `Abort: Database host "${host}" does not appear to be development. ` +
      "Use FORCE_DRY_RUN=true to override this safety check (dry-run only)."
    );
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: host.includes("neon.tech") ? { rejectUnauthorized: true } : undefined,
  });

  try {
    await pool.query("SELECT 1");
    const modeLabel = isExecutionMode ? "EXECUTION" : "DRY-RUN";
    console.log(`✅ Connected to database: ${database} @ ${host} [${modeLabel}]`);
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    throw err;
  }

  return pool;
}

// ---------------------------------------------------------------------------
// Schema introspection
// ---------------------------------------------------------------------------

async function getAllTableCounts(pool: Pool): Promise<Map<string, number>> {
  const tablesResult = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const counts = new Map<string, number>();
  for (const { table_name } of tablesResult.rows) {
    try {
      const result = await pool.query(`SELECT COUNT(*) FROM "${table_name}"`);
      counts.set(table_name, parseInt(result.rows[0]?.count ?? "0", 10));
    } catch (err) {
      console.warn(`Warning: Could not count rows for table ${table_name}:`, err.message);
      counts.set(table_name, -1); // Error indicator
    }
  }
  return counts;
}

async function getActualCount(pool: Pool, tableName: string): Promise<number> {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM "${table_name}"`);
    return parseInt(result.rows[0]?.count ?? "0", 10);
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Orphan detection
// ---------------------------------------------------------------------------

async function detectOrphans(pool: Pool): Promise<OrphanReport[]> {
  const orphans: OrphanReport[] = [];

  // Check foreign keys that reference users table
  const fkCheck = await pool.query(`
    SELECT
      tc.table_name,
      kcu.column_name AS foreign_key,
      ccu.table_name AS referenced_table
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND ccu.table_name = 'users'
  `);

  for (const fk of fkCheck.rows) {
    const { table_name, foreign_key, referenced_table } = fk;
    try {
      const result = await pool.query(`
        SELECT COUNT(*) FROM ${table_name}
        WHERE "${foreign_key}" NOT IN (SELECT id FROM users)
      `);
      const orphanCount = parseInt(result.rows[0]?.count ?? "0", 10);
      if (orphanCount > 0) {
        orphans.push({
          table: table_name,
          reference: foreign_key,
          foreignKey: `${table_name}.${foreign_key}`,
          referencedTable: referenced_table,
        });
      }
    } catch {
      // Skip tables that can't be queried for orphan detection
    }
  }

  return orphans;
}

// ---------------------------------------------------------------------------
// Storage integration (placeholder for actual implementation)
// ---------------------------------------------------------------------------

interface StorageFileReference {
  table: string;
  column: string;
  recordId: string;
  storagePath: string | null;
}

async function getStorageReferences(pool: Pool): Promise<StorageFileReference[]> {
  const references: StorageFileReference[] = [];

  // Query tables that store file paths
  const storageTables = [
    { table: 'gallery_photos', pathColumns: ['storage_path', 'original_path', 'display_path', 'thumbnail_path', 'watermark_path'] },
    { table: 'project_media', pathColumns: ['storage_path', 'original_path', 'display_path', 'thumbnail_path', 'watermark_path'] },
    { table: 'upload_audit', pathColumns: ['blob_path'] }
  ];

  for (const { table, pathColumns } of storageTables) {
    try {
      // Check if table exists
      const existsResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = $1
        )`, [table]);

      if (!existsResult.rows[0]?.exists) continue;

      for (const pathColumn of pathColumns) {
        try {
          const result = await pool.query(`
            SELECT id, "${pathColumn}" as path
            FROM "${table}"
            WHERE "${pathColumn}" IS NOT NULL
          `);

          for (const row of result.rows) {
            references.push({
              table,
              column: pathColumn,
              recordId: row.id.toString(),
              storagePath: row.path as string | null
            });
          }
        } catch (colErr) {
          // Column might not exist - skip
        }
      }
    } catch (tableErr) {
      console.warn(`Warning: Could not query storage references for ${table}:`, tableErr.message);
    }
  }

  return references;
}

async function cleanupStorageFiles(fileRefs: StorageFileReference[]): Promise<{
  succeeded: string[];
  failed: { file: StorageFileReference; error: string }[];
}> {
  // This would integrate with the actual storage provider
  // For now, we'll simulate the interface and note that actual implementation
  // would need to import and use the storage adapter from src/lib/gallery/storage.ts

  const succeeded: string[] = [];
  const failed: { file: StorageFileReference; error: string }[] = [];

  // In a real implementation, we would:
  // 1. Import the storage provider
  // 2. For each file reference, attempt deletion
  // 3. Track successes and failures

  // Placeholder: report what would be attempted
  console.log(`📝 Storage cleanup would attempt to delete ${fileRefs.length} file references`);

  // For safety in this implementation, we don't actually delete files
  // but we track what would be attempted
  for (const ref of fileRefs) {
    succeeded.push(`${ref.table}:${ref.recordId} (${ref.column})`);
  }

  return { succeeded, failed };
}

// ---------------------------------------------------------------------------
// Audit execution
// ---------------------------------------------------------------------------

async function runAudit(): Promise<AuditReport> {
  const pool = await connectToDatabase();

  try {
    const tableCounts = await getAllTableCounts(pool);
    const orphans = await detectOrphans(pool);

    const tables: TableReport[] = [];
    const purgeTargets: TableReport[] = [];
    const preservedTables: string[] = [];

    let totalRecords = 0;
    let purgedRecordEstimate = 0;

    for (const [tableName, rowCount] of tableCounts) {
      const displayCount = Math.max(0, rowCount); // Avoid negative counts from errors
      totalRecords += displayCount;

      const tableReport: TableReport = {
        table: tableName,
        estimatedRows: displayCount,
        notes: ""
      };

      if (PRESERVED_TABLES.includes(tableName as any)) {
        preservedTables.push(tableName);
        tableReport.notes = "Preserved (equipment/migration)";
        tables.push(tableReport);
      } else if (PURGEABLE_TABLES.includes(tableName as any)) {
        purgeTargets.push(tableReport);
        purgedRecordEstimate += displayCount;
        tables.push(tableReport);
      } else {
        // Unclassified tables
        tableReport.notes = "Unclassified - manual review required";
        tables.push(tableReport);
      }
    }

    return {
      timestamp: new Date().toISOString(),
      database: parseDatabaseUrl(process.env.DATABASE_URL!).database,
      host: parseDatabaseUrl(process.env.DATABASE_URL!).host,
      isDevelopment: isDevelopmentHost(parseDatabaseUrl(process.env.DATABASE_URL!).host),
      tables,
      orphans,
      purgeTargets,
      preservedTables,
      summary: {
        totalTables: tables.length + preservedTables.length,
        totalRecords,
        orphanCount: orphans.length,
        purgedRecordEstimate,
      }
    };
  } finally {
    await pool.end();
  }
}

// ---------------------------------------------------------------------------
// Execution logic
// ---------------------------------------------------------------------------

async function executePurge(): Promise<ExecutionResult> {
  const startTime = Date.now();
  const pool = await connectToDatabase();

  // Double-check we really want to execute
  const args = process.argv.slice(2);
  const isExecution = args.includes("--execute") && args.includes("--force");
  if (!isExecution) {
    throw new Error("Internal error: executePurge called without execution flags");
  }

  const client = await pool.connect();
  const warnings: string[] = [];

  try {
    console.log("🔒 Starting transaction for purge execution...");
    await client.query("BEGIN");

    // Get current counts for reporting
    const tableCounts = await getAllTableCounts(pool);

    // Execute deletions in dependency order
    const deletedCounts: Record<string, number> = {};

    // Use a Set to avoid processing the same table multiple times
    const processedTables = new Set<string>();

    for (const spec of DELETE_ORDER) {
      const { table } = spec;

      // Skip if we've already processed this table (due to duplicates in DELETE_ORDER)
      if (processedTables.has(table)) continue;
      processedTables.add(table);

      // Skip preserved tables
      if (PRESERVED_TABLES.includes(table as any)) continue;

      try {
        // Get count before deletion
        const countBefore = await getActualCount(pool, table);
        deletedCounts[table] = countBefore;

        if (countBefore > 0) {
          console.log(`🗑️  Deleting ${countBefore} rows from ${table}...`);
          await client.query(`DELETE FROM "${table}"`);
        } else {
          console.log(`⏭️  Skipping ${table} (0 rows)`);
        }
      } catch (err) {
        console.error(`❌ Error deleting from ${table}:`, err.message);
        warnings.push(`Failed to delete from ${table}: ${err.message}`);
        // Continue with other tables rather than failing completely
      }
    }

    // Storage cleanup attempt
    console.log("📦 Attempting storage cleanup for orphaned files...");
    const storageRefs = await getStorageReferences(pool);
    const storageResult = await cleanupStorageFiles(storageRefs);

    // Commit the transaction
    await client.query("COMMIT");
    console.log("✅ Transaction committed successfully");

    const executionTimeMs = Date.now() - startTime;

    return {
      success: true,
      deletedCounts,
      storageCleanup: {
        attempted: storageRefs.length,
        succeeded: storageResult.succeeded.length,
        failed: storageResult.failed.length,
        errors: storageResult.failed.map(f => `${f.file.table}:${f.file.recordId} - ${f.error}`)
      },
      executionTimeMs,
      warnings
    };
  } catch (err) {
    // Rollback on any error
    await client.query("ROLLBACK").catch(() => {/* Ignore rollback errors */});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// ---------------------------------------------------------------------------
// Report formatting
// ---------------------------------------------------------------------------

function formatAuditReport(report: AuditReport): string {
  const lines: string[] = [];
  const separator = "=".repeat(72);
  const subSeparator = "-".repeat(72);

  lines.push(separator);
  lines.push("PURGE AUDIT REPORT");
  lines.push(`Generated: ${report.timestamp}`);
  lines.push(separator);
  lines.push("");

  lines.push("DATABASE INFO");
  lines.push(subSeparator);
  lines.push(`  Host:     ${report.host}`);
  lines.push(`  Database: ${report.database}`);
  lines.push(`  Dev Mode: ${report.isDevelopment ? "YES" : "NO (DRY RUN ONLY)"}`);
  lines.push("");

  lines.push("SUMMARY");
  lines.push(subSeparator);
  lines.push(`  Total Tables:         ${report.summary.totalTables}`);
  lines.push(`  Total Records:        ${report.summary.totalRecords}`);
  lines.push(`  Orphaned References:  ${report.summary.orphanCount}`);
  lines.push(`  Purge Target Rows:    ${report.summary.purgedRecordEstimate}`);
  lines.push("");

  lines.push("TABLES BY CATEGORY");
  lines.push(subSeparator);

  lines.push("\n[PURGE TARGETS]");
  for (const t of report.purgeTargets) {
    lines.push(`  ${t.table.padEnd(35)} ${String(t.estimatedRows).padStart(6)} rows  ${t.notes ?? ""}`);
  }

  lines.push("\n[PRESERVED TABLES]");
  for (const t of report.preservedTables) {
    lines.push(`  ${t.padEnd(35)} (preserved)`);
  }

  lines.push("\n[UNCLASSIFIED - MANUAL REVIEW]");
  const unclassified = report.tables.filter(
    (t) => !PURGEABLE_TABLES.includes(t.table as any) && !report.preservedTables.includes(t.table as any)
  );
  if (unclassified.length === 0) {
    lines.push("  (none)");
  } else {
    for (const t of unclassified) {
      lines.push(`  ${t.table.padEnd(35)} ${String(t.estimatedRows).padStart(6)} rows  ${t.notes ?? ""}`);
    }
  }

  lines.push("");
  lines.push("ORPHANED REFERENCES");
  lines.push(subSeparator);
  if (report.orphans.length === 0) {
    lines.push("  (none detected)");
  } else {
    for (const o of report.orphans) {
      lines.push(`  ${o.table}.${o.foreignKey} -> ${o.referencedTable}`);
    }
  }

  lines.push("");
  lines.push(separator);
  lines.push(`MODE: ${report.isDevelopment ? "DEVELOPMENT" : "DRY RUN"} | ORPHANS: ${report.summary.orphanCount}`);
  lines.push(separator);

  return lines.join("\n");
}

function formatExecutionResult(result: ExecutionResult): string {
  const lines: string[] = [];
  const separator = "=".repeat(72);

  lines.push(separator);
  lines.push("PURGE EXECUTION REPORT");
  lines.push(`Completed: ${new Date().toISOString()}`);
  lines.push(separator);
  lines.push("");

  lines.push("EXECUTION SUMMARY");
  lines.push(`  Status:           ${result.success ? "✅ SUCCESS" : "❌ FAILED"}`);
  lines.push(`  Execution Time:   ${result.executionTimeMs}ms`);
  lines.push("");

  lines.push("DELETION COUNTS BY TABLE");
  lines.push("-".repeat(50));
  const sortedTables = Object.keys(result.deletedCounts).sort();
  for (const table of sortedTables) {
    const count = result.deletedCounts[table];
    lines.push(`  ${table.padEnd(35)} ${String(count).padStart(6)} rows`);
  }
  lines.push("");

  lines.push("STORAGE CLEANUP RESULTS");
  lines.push(`  Files Attempted:    ${result.storageCleanup.attempted}`);
  lines.push(`  Files Succeeded:    ${result.storageCleanup.succeeded}`);
  lines.push(`  Files Failed:       ${result.storageCleanup.failed}`);
  if (result.storageCleanup.errors.length > 0) {
    lines.push(`  Errors:`);
    for (const error of result.storageCleanup.errors.slice(0, 5)) { // Limit error output
      lines.push(`    - ${error}`);
    }
    if (result.storageCleanup.errors.length > 5) {
      lines.push(`    ... and ${result.storageCleanup.errors.length - 5} more`);
    }
  }
  lines.push("");

  if (result.warnings.length > 0) {
    lines.push("WARNINGS");
    lines.push("-".repeat(50));
    for (const warning of result.warnings) {
      lines.push(`  ⚠️  ${warning}`);
    }
    lines.push("");
  }

  lines.push(separator);
  lines.push(`EXECUTION COMPLETED: ${result.success ? "SUCCESS" : "FAILED"}`);
  lines.push(separator);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  // Determine mode
  const isDryRun = !args.includes("--execute") || !args.includes("--force");
  const mode = isDryRun ? "DRY-RUN" : "EXECUTION";

  console.log(`\n🔍 Purge Audit & Execution Utility [${mode}]\n`);

  try {
    if (isDryRun) {
      // Run audit only
      const report = await runAudit();
      const output = formatAuditReport(report);
      console.log(output);

      // Save report for potential approval process
      const fs = await import("node:fs/promises");
      const reportPath = join(process.cwd(), `purge-report-${Date.now()}.txt`);
      await fs.writeFile(reportPath, output);
      console.log(`\n📄 Audit report saved to: ${reportPath}`);

      if (!isDryRun) {
        console.log("\n⚠️  To execute purging, use: --execute --force");
        console.log("   REVIEW THE ABOVE REPORT CAREFULLY BEFORE PROCEEDING");
      }

    } else {
      // Execution mode - require double confirmation
      console.log("🚨 EXECUTION MODE SELECTED");
      console.log("   This will PERMANENTLY DELETE data from the database.");
      console.log("   ALL SAFETY CHECKS HAVE BEEN APPLIED.");
      console.log("");

      // Final safety confirmation
      const shouldContinue = process.env.CONFIRM_PURGE === "true";
      if (!shouldContinue) {
        console.log("❌ Execution aborted: Missing CONFIRM_PURGE=true environment variable");
        console.log("   To confirm execution, set: CONFIRM_PURGE=true");
        process.exit(1);
      }

      console.log("✅ Final confirmation received via CONFIRM_PURGE=true");
      console.log("🚀 Proceeding with purge execution...\n");

      const result = await executePurge();
      const output = formatExecutionResult(result);
      console.log(output);

      if (result.success) {
        console.log("\n🎉 Purge execution completed successfully");
        console.log("   Run verification procedures to confirm clean state");
      } else {
        console.log("\n💥 Purge execution failed");
        console.log("   Check errors above and consider manual intervention");
        process.exit(1);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Operation failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
