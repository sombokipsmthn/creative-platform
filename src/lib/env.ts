/**
 * Environment variable validation schema
 * 
 * This file validates that all required environment variables are set
 * before the application starts.
 */

const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
};

const optionalEnvVars = {
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  SVIX_AUTH_TOKEN: process.env.SVIX_AUTH_TOKEN,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_PHONE: process.env.NEXT_PUBLIC_PHONE,
  NODE_ENV: process.env.NODE_ENV,
};

/**
 * Validate required environment variables
 * Throws an error if any required variable is missing
 */
export function validateEnv() {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const missingList = missing.join(', ');
    console.error(`❌ Missing required environment variables: ${missingList}`);
    throw new Error(
      `Missing required environment variables: ${missingList}. Please check your .env file.`
    );
  }

  console.log('✅ All required environment variables are set');
}

/**
 * Get environment variables with type safety
 */
export const env = {
  // Required
  database: {
    url: requiredEnvVars.DATABASE_URL!,
  },
  clerk: {
    publishableKey: requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: requiredEnvVars.CLERK_SECRET_KEY!,
    webhookSecret: requiredEnvVars.CLERK_WEBHOOK_SECRET!,
  },
  
  // Optional
  blob: {
    token: optionalEnvVars.BLOB_READ_WRITE_TOKEN,
  },
  svix: {
    token: optionalEnvVars.SVIX_AUTH_TOKEN,
  },
  analytics: {
    gaId: optionalEnvVars.NEXT_PUBLIC_GA_ID,
  },
  contact: {
    phone: optionalEnvVars.NEXT_PUBLIC_PHONE || '+254722145776',
  },
  node: {
    env: optionalEnvVars.NODE_ENV || 'development',
  },
};
