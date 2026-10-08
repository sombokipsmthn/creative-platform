import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export { auth };

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}
