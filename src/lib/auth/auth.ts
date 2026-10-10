import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { passkey } from "@better-auth/passkey";
import { dash } from "@better-auth/infra";
import { db } from "@/db";
import { sendEmail } from "@/lib/email";
import { users, sessions, accounts, verifications, passkeys } from "@/db/schema";

const appUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
const googleProvider = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  ? { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }
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

const baseURL = process.env.NODE_ENV === "development"
  ? "http://localhost:3005"
  : appUrl;

export const auth = betterAuth({
  appName: "KIPSMTHN Creative Platform",
  baseURL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
      passkey: passkeys,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Creative Platform password",
        text: `Reset your password by opening this link: ${url}`,
        html: `<p>Reset your password by clicking <a href="${url}">this link</a>.</p>`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Creative Platform email",
        text: `Verify your email address by opening this link: ${url}`,
        html: `<p>Verify your email address by clicking <a href="${url}">this link</a>.</p>`,
      });
    },
  },
  ...(Object.keys(socialProviders).length > 0 ? { socialProviders } : {}),
  account: {
    accountLinking: {
      trustedProviders: ["google"],
      requireLocalEmailVerified: true,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  advanced: {
    cookiePrefix: "kipsmthn",
    crossSubDomainCookies: { enabled: true },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  },
  trustedOrigins: [baseURL],
  plugins: [
    dash({ apiKey: process.env.BETTER_AUTH_API_KEY }),
    passkey({
      rpID: new URL(baseURL).hostname,
      rpName: "KIPSMTHN Creative Platform",
      origin: baseURL,
      schema: { passkey: { modelName: "passkey" } },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
