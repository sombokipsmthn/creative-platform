import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl || !dbUrl.startsWith("postgres")) {
  console.error("❌ [Database] DATABASE_URL not set.");

  throw new Error(
    "DATABASE_URL environment variable is not set. Cannot initialize database."
  );
}

const parsedDbUrl = new URL(dbUrl);
const usesTls =
  parsedDbUrl.hostname.endsWith(".neon.tech") ||
  parsedDbUrl.searchParams.get("sslmode") === "require";

if (usesTls && parsedDbUrl.searchParams.get("sslmode") === "require") {
  parsedDbUrl.searchParams.set("sslmode", "verify-full");
}

const pool = new Pool({
  connectionString: parsedDbUrl.toString(),
  ssl: usesTls ? { rejectUnauthorized: true } : undefined,
});

export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
  schema,
});

console.log("✅ Database connected successfully");