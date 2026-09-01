import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let db: NodePgDatabase<typeof schema>;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && dbUrl.startsWith("postgres")) {
  try {
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes("neon.tech") || dbUrl.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
    });
    db = drizzle(pool, {
      schema,
    });
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ [Database] Connection failed:", err);
    throw new Error(
      `Database connection error: ${err instanceof Error ? err.message : String(err)}. Please check DATABASE_URL.`
    );
  }
} else {
  console.error("❌ [Database] DATABASE_URL not set. This is required for production.");
  throw new Error(
    "DATABASE_URL environment variable is not set. Cannot initialize database."
  );
}

export { db };
