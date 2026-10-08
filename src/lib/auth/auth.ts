import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";

import { db } from "@/db";
import { users, sessions, accounts, verifications } from "@/db/schema";

const appUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3005";

const trustedOrigins = Array.from(
  new Set([
    appUrl,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3005",
    "http://localhost:3000",
  ].filter((value): value is string => Boolean(value)))
);

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : undefined;

const appleProvider =
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_CLIENT_SECRET &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
    ? {
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
        teamId: process.env.APPLE_TEAM_ID,
        keyId: process.env.APPLE_KEY_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        scope: ["name", "email"],
      }
    : undefined;

const socialProviders = {
  ...(googleProvider ? { google: googleProvider } : {}),
  ...(appleProvider ? { apple: appleProvider } : {}),
};

export const auth = betterAuth({
  appName: "KIPSMTHN",
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  user: {
    modelName: "users",
    additionalFields: {
      authUserId: {
        type: "string",
        required: false,
        input: false,
      },
      onboardingStatus: {
        type: "string",
        required: false,
        input: false,
      },
      onboardingStep: {
        type: "number",
        required: false,
        input: false,
      },
      handle: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  ...(Object.keys(socialProviders).length > 0
    ? { socialProviders }
    : {}),

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            authUserId: user.id,
          },
        }),
      },
      update: {
        before: async (user) => ({
          data: {
            ...user,
            updatedAt: new Date(),
          },
        }),
      },
    },
  },

  trustedOrigins,

  advanced: {
    cookiePrefix: "kipsmthn",
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
