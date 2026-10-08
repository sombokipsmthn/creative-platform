import { NextResponse, type NextRequest } from "next/server";
import { betterAuthInstance } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith("/admin") || path.startsWith("/admin/login") || path.startsWith("/admin/onboarding")) {
    return NextResponse.next();
  }
  const session = await betterAuthInstance.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"] };
