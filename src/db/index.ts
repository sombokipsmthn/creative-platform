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
  } catch (err) {
    console.warn("[AI Studio] Database connection error:", err);
    db = createFallbackDb();
  }
} else {
  db = createFallbackDb();
}

function createFallbackDb(): NodePgDatabase<typeof schema> {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: { data?: unknown }) => d?.data ?? {},
    update: async (d: { data?: unknown }) => d?.data ?? {},
    delete: async () => ({}),
  };

  const chainable = () => ({
    from: () => ({
      where: () => ({
        orderBy: () => Promise.resolve([]),
      }),
      orderBy: () => Promise.resolve([]),
    }),
    where: () => ({
      orderBy: () => Promise.resolve([]),
    }),
    values: () => ({
      returning: () => Promise.resolve([]),
      onConflictDoNothing: () => ({
        returning: () => Promise.resolve([]),
      }),
    }),
    orderBy: () => Promise.resolve([]),
    then: (resolve: (val: unknown[]) => void) => resolve([]),
  });

  return new Proxy({} as NodePgDatabase<typeof schema>, {
    get: (_, prop) => {
      if (prop === "query") {
        return new Proxy({}, { get: () => noOp });
      }
      if (prop === "select" || prop === "insert" || prop === "update" || prop === "delete") {
        return chainable;
      }
      return chainable;
    },
  });
}

export { db };
