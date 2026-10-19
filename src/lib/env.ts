/** Environment variable validation and typed accessors. */

const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
};

const optionalEnvVars = {
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  SVIX_AUTH_TOKEN: process.env.SVIX_AUTH_TOKEN,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_PHONE: process.env.NEXT_PUBLIC_PHONE,
  NODE_ENV: process.env.NODE_ENV,
};

export function validateEnv() {
  const missing = Object.entries(requiredEnvVars).filter(([, value]) => !value).map(([key]) => key);

  if (missing.length > 0) {
    const message = `Missing environment variables: ${missing.join(", ")}. Set them before starting the application.`;
    console.warn(`⚠️ ${message}`);
    return;
  }

  console.log("✅ All required environment variables are set");
}

export const env = {
  database: { url: requiredEnvVars.DATABASE_URL || "" },
  betterAuth: { secret: requiredEnvVars.BETTER_AUTH_SECRET || "" },
  blob: { token: optionalEnvVars.BLOB_READ_WRITE_TOKEN },
  svix: { token: optionalEnvVars.SVIX_AUTH_TOKEN },
  analytics: { gaId: optionalEnvVars.NEXT_PUBLIC_GA_ID },
  contact: { phone: optionalEnvVars.NEXT_PUBLIC_PHONE || "+254722145776" },
  node: { env: optionalEnvVars.NODE_ENV || "development" },
};
