import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Redirect uppercase /Portal requests to the canonical lowercase /portal
  try {
    const url = new URL(request.url);
    url.pathname = url.pathname.replace(/^\/Portal(.*)$/i, (m, p1) => `/portal${p1}`);
    return NextResponse.redirect(url.toString(), 301);
  } catch (err) {
    return NextResponse.redirect('/portal', 301);
  }
}
