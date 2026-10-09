import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export { auth };

export async function getCurrentSession() {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
}
