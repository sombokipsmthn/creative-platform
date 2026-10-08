const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
};

const optionalEnvVars = {
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  SVIX_AUTH_TOKEN: process.env.SVIX_AUTH_TOKEN,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_PHONE: process.env.NEXT_PUBLIC_PHONE,
  NODE_ENV: process.env.NODE_ENV,
};

export function validateEnv() {
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const missing = Object.entries(requiredEnvVars).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length === 0) return;
  const message = `Missing required environment variables: ${missing.join(", ")}`;
  if (isBuildPhase) { console.warn(`⚠️ ${message}`); return; }
  throw new Error(message);
}

export const env = {
  database: { url: requiredEnvVars.DATABASE_URL! },
  betterAuth: {
    secret: requiredEnvVars.BETTER_AUTH_SECRET!,
    url: requiredEnvVars.BETTER_AUTH_URL!,
    apiKey: process.env.BETTER_AUTH_API_KEY,
  },
  blob: { token: optionalEnvVars.BLOB_READ_WRITE_TOKEN },
  svix: { token: optionalEnvVars.SVIX_AUTH_TOKEN },
  analytics: { gaId: optionalEnvVars.NEXT_PUBLIC_GA_ID },
  contact: { phone: optionalEnvVars.NEXT_PUBLIC_PHONE || "+254722145776" },
  node: { env: optionalEnvVars.NODE_ENV || "development" },
};
