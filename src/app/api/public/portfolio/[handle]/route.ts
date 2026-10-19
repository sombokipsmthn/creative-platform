import { NextResponse } from "next/server";
import { getPublishedPortfolio } from "@/app/p/[handle]/data";
type Context = { params: Promise<{ handle: string }> };
export const dynamic = "force-dynamic";
export async function GET(_request: Request, context: Context) { const data = await getPublishedPortfolio((await context.params).handle); if (!data) return NextResponse.json({ error: "Portfolio not found" }, { status: 404, headers: { "Cache-Control": "no-store" } }); return NextResponse.json({ user: { name: data.user.name, handle: data.user.handle, image: data.user.image }, profile: data.profile, portfolio: data.portfolio, projects: data.projects }, { headers: { "Cache-Control": "no-store" } }); }
