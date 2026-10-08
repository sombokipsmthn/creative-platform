import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dash } from "@better-auth/infra";
import { headers } from "next/headers";
import { db } from "@/db";

export const betterAuthInstance = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [dash({ apiUrl: process.env.BETTER_AUTH_API_URL, kvUrl: process.env.BETTER_AUTH_KV_URL, apiKey: process.env.BETTER_AUTH_API_KEY })],
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
});

export async function auth(): Promise<any> {
  const result = await betterAuthInstance.api.getSession({ headers: await headers() });
  return { userId: result?.user?.id || null, sessionClaims: result?.session || null, user: result?.user || null };
}

export async function currentUser(): Promise<any> {
  const result = await betterAuthInstance.api.getSession({ headers: await headers() });
  return result?.user || null;
}
