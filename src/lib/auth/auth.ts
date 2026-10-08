import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/db";
import { emailOTP } from "better-auth/plugins";
import { sendEmail } from "@/lib/email";
import { users, sessions, accounts, verifications } from "@/db/schema";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3005";
const trustedOrigins = [baseURL, "http://localhost:3005"];

if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be configured with at least 32 characters.");
}

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: users, session: sessions, account: accounts, verification: verifications, users, sessions, accounts, verifications },
  }),
  user: { modelName: "users" },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 },
  },
  account: { modelName: "accounts" },
  verification: { modelName: "verifications" },
  plugins: [emailOTP({
    async sendVerificationOTP({ email, otp, type }) {
      await sendEmail({
        to: email,
        subject: type === "sign-in" ? "Your sign-in code" : "Your verification code",
        text: `Your one-time code is ${otp}. It expires soon.`,
      });
    },
  })],
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your KIPSMTHN password",
        text: `Reset your password using this link: ${url}`,
        html: `<p>Reset your KIPSMTHN password by clicking <a href="${url}">this secure link</a>.</p>`,
      });
    },
  },
  advanced: {
    database: { joins: false, validateSchema: false },
    cookiePrefix: "kipsmthn",
    defaultCookieAttributes: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" },
  },
});

export type Session = typeof auth.$Infer.Session;
