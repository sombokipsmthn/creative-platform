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

const pool = new Pool({
  connectionString: dbUrl,
  ssl:
    dbUrl.includes("neon.tech") || dbUrl.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
});

export const db: NodePgDatabase<typeof schema> = drizzle(pool, {
  schema,
});

console.log("✅ Database connected successfully");