import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });

import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

let _db: NodePgDatabase<typeof schema> | null = null;
let _initError: Error | null = null;

function initDb(): NodePgDatabase<typeof schema> {
  if (_db) return _db;
  if (_initError) throw _initError;

  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || !dbUrl.startsWith("postgres")) {
    _initError = new Error(
      "DATABASE_URL environment variable is not set. Cannot initialize database."
    );
    console.error("❌ [Database] DATABASE_URL not set.");
    throw _initError;
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

  _db = drizzle(pool, {
    schema,
  });

  console.log("✅ Database connected successfully");
  return _db;
}

// Export a proxy that lazily initializes the database on first access
const dbProxy = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(target, prop, receiver) {
    const db = initDb();
    const value = Reflect.get(db, prop, receiver);
    return value;
  },
});

export const db = dbProxy;