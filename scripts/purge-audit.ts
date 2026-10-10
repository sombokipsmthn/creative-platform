/**
 * Dry-run purge audit utility.
 *
 * Connects to the development database and produces a read-only report
 * of all creator-owned data, orphaned records, and tables that would be
 * affected by a development data reset.
 *
 * Usage:
 *   npx tsx scripts/purge-audit.ts              # dry-run (default)
 *   npx tsx scripts/purge-audit.ts --dry-run    # explicit dry-run
 *   npx tsx scripts/purge-audit.ts --execute    # destructive (requires approval)
 */

import { Pool } from "pg";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { readFileSync } from "node:fs";

// ---------------------------------------------------------------------------
// Load environment variables (worktree-safe manual parsing)
// ---------------------------------------------------------------------------
function loadEnvFile(filePath: string): void {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
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
      process.env[key] = value;
    }
  } catch {
    // File doesn't exist or can't be read - continue without it
  }
}

// Resolve paths relative to the project root (parent of worktree)
const projectRoot = path.resolve(process.cwd(), "..");
loadEnvFile(path.join(projectRoot, ".env.local"));
loadEnvFile(path.join(projectRoot, ".env"));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TableReport {
  table: string;
  estimatedRows: number;
  orphans?: number;
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
  // Neon production hosts contain specific patterns; we flag anything else
  // or localhost as development for safety.
  const isLocal = host === "localhost" || host === "127.0.0.1";
  if (isLocal) return true;

  // Check for FORCE_DRY_RUN environment variable to allow testing
  // against non-local databases in dry-run mode
  if (process.env.FORCE_DRY_RUN === "true") {
    return true;
  }

  // Be conservative: assume all remote Neon hosts are production unless
  // explicitly forced
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

  if (!devMode) {
    console.error(
      "⚠️  WARNING: DATABASE_URL points to a non-development host:",
      host
    );
    console.error(
      "   This script is designed for development databases only."
    );
    console.error("   Set FORCE_DRY_RUN=true to bypass this check (still read-only).");
    if (process.env.FORCE_DRY_RUN !== "true") {
      throw new Error(
        `Abort: database host ${host} does not appear to be development.`
      );
    }
  }

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: host.includes("neon.tech") ? { rejectUnauthorized: true } : undefined,
  });

  try {
    await pool.query("SELECT 1");
    console.log(`✅ Connected to database: ${database} @ ${host}`);
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
    } catch {
      counts.set(table_name, -1); // Error counting
    }
  }
  return counts;
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
      // Skip tables that can't be queried
    }
  }

  return orphans;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

const PURGEABLE_TABLES = new Set([
  "users",
  "sessions",
  "accounts",
  "verifications",
  "passkeys",
  "creator_profiles",
  "creator_services",
  "creator_business_profiles",
  "clients",
  "projects",
  "project_media",
  "quotes",
  "quote_items",
  "invoices",
  "invoice_items",
  "contracts",
  "contract_events",
  "contract_templates",
  "galleries",
  "gallery_collections",
  "gallery_photos",
  "gallery_themes",
  "gallery_access_sessions",
  "gallery_access_attempts",
  "gallery_photo_actions",
  "gallery_comments",
  "gallery_activity",
  "gallery_approvals",
  "gallery_watermarks",
  "gallery_download_presets",
  "gallery_downloads",
  "upload_audit",
]);

const PRESERVED_TABLES = new Set([
  "equipment",
]);

// ---------------------------------------------------------------------------
// Main audit
// ---------------------------------------------------------------------------

async function runAudit(dryRun: boolean): Promise<AuditReport> {
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
      totalRecords += Math.max(0, rowCount);

      if (PRESERVED_TABLES.has(tableName)) {
        preservedTables.push(tableName);
        tables.push({
          table: tableName,
          estimatedRows: rowCount,
          notes: "Preserved (equipment/catalogue)",
        });
      } else if (PURGEABLE_TABLES.has(tableName)) {
        purgeTargets.push({
          table: tableName,
          estimatedRows: rowCount,
          notes: "Purge target (creator-owned data)",
        });
        purgedRecordEstimate += rowCount;
      } else {
        // Unknown tables - report but don't purge
        tables.push({
          table: tableName,
          estimatedRows: rowCount,
          notes: "Unclassified - manual review required",
        });
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
      },
    };
  } finally {
    await pool.end();
  }
}

// ---------------------------------------------------------------------------
// Output formatting
// ---------------------------------------------------------------------------

function formatReport(report: AuditReport): string {
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
    (t) => !PURGEABLE_TABLES.has(t.table) && !report.preservedTables.includes(t.table)
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

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes("--execute") ? "execute" : "dry-run";
  const force = args.includes("--force");

  console.log(`\n🔍 Purge Audit Utility [${mode.toUpperCase()}]\n`);

  try {
    const report = await runAudit(mode === "dry-run");
    const output = formatReport(report);
    console.log(output);

    // Write report to file for review
    const fs = await import("node:fs/promises");
    const reportPath = path.join("scripts", `purge-report-${Date.now()}.txt`);
    await fs.writeFile(reportPath, output);
    console.log(`\n📄 Report saved to: ${reportPath}`);

    if (mode === "execute" && !force) {
      console.log("\n⚠️  Destructive mode requested but not forced. Use --force to execute deletions.");
      process.exit(1);
    }

    if (mode === "execute" && force) {
      console.log("\n🔴 EXECUTE MODE ACTIVE - THIS WILL DELETE DATA");
      console.log("   This is a dry-run until deletion logic is implemented.");
    }

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Audit failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
