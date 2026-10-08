import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: ".env.local" });

async function main() {
const migrationDir = path.join(process.cwd(), "drizzle");
const files = fs.readdirSync(migrationDir)
  .filter((file) => /^\d+.*\.sql$/.test(file))
  .sort((a, b) => a.localeCompare(b));
const journal = JSON.parse(fs.readFileSync(path.join(migrationDir, "meta", "_journal.json"), "utf8"));
if (files.length !== journal.entries.length) throw new Error("Migration files and journal entries have different lengths.");
const createdAtByFile = new Map(files.map((file, index) => [file, journal.entries[index].when]));

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
await client.connect();
try {
  await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
  await client.query(`CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint)`);

  const required = ["users", "sessions", "accounts", "verifications"];
  const result = await client.query(
    "select table_name from information_schema.tables where table_schema = 'public' and table_name = any($1)",
    [required],
  );
  const present = new Set(result.rows.map((row: { table_name: string }) => row.table_name));
  const missing = required.filter((table) => !present.has(table));
  if (missing.length) throw new Error(`Refusing reconciliation; missing required tables: ${missing.join(", ")}`);

  for (const file of files) {
    const hash = crypto.createHash("sha256").update(fs.readFileSync(path.join(migrationDir, file))).digest("hex");
    const createdAt = createdAtByFile.get(file);
    if (!createdAt) throw new Error(`Missing journal entry for ${file}`);
    const exists = await client.query("select 1 from drizzle.__drizzle_migrations where hash = $1 limit 1", [hash]);
    if (!exists.rowCount) {
      await client.query("insert into drizzle.__drizzle_migrations (hash, created_at) values ($1, $2)", [hash, createdAt]);
      console.log(`Recorded ${file}`);
    } else {
      await client.query("update drizzle.__drizzle_migrations set created_at = $1 where hash = $2", [createdAt, hash]);
    }
  }
} finally {
  await client.end();
}
}

main().catch((error) => { console.error(error); process.exit(1); });
