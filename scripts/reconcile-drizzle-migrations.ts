import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: ".env.local" });

const migrationDir = path.join(process.cwd(), "drizzle");
const baselineFile = path.join(migrationDir, "0000_current_schema_baseline.sql");
const databaseUrl = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!databaseUrl) throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL is required.");
if (!fs.existsSync(baselineFile)) throw new Error(`Missing current-schema baseline: ${baselineFile}`);

const hash = crypto.createHash("sha256").update(fs.readFileSync(baselineFile)).digest("hex");
const createdAt = JSON.parse(
  fs.readFileSync(path.join(migrationDir, "meta", "_journal.json"), "utf8"),
).entries[0].when as number;

const client = new Client({ connectionString: databaseUrl });
await client.connect();
try {
  await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id serial primary key,
      hash text not null,
      created_at bigint
    )
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS drizzle.__local_baselines (
      name text primary key,
      hash text not null,
      applied_at timestamptz not null default now()
    )
  `);

  const required = ["users", "sessions", "accounts", "verifications"];
  const result = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' and table_name = any($1)",
    [required],
  );
  const present = new Set(result.rows.map((row: { table_name: string }) => row.table_name));
  const missing = required.filter((table) => !present.has(table));
  if (missing.length) {
    throw new Error(`Refusing reconciliation; missing required tables: ${missing.join(", ")}`);
  }

  const baselineExists = await client.query(
    "SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = $1 LIMIT 1",
    [hash],
  );
  if (!baselineExists.rowCount) {
    await client.query(
      "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
      [hash, createdAt],
    );
  }
  await client.query(
    `INSERT INTO drizzle.__local_baselines (name, hash)
     VALUES ('0031_local_init', $1)
     ON CONFLICT (name) DO UPDATE SET hash = EXCLUDED.hash, applied_at = now()`,
    [crypto.createHash("sha256").update(fs.readFileSync(path.join(migrationDir, "local", "0031_local_init.sql"))).digest("hex")],
  );
  console.log(`Reconciled current schema baseline ${path.basename(baselineFile)} (${hash})`);
} finally {
  await client.end();
}
