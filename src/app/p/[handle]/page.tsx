import { notFound } from "next/navigation";
import { getPublishedPortfolio } from "./data";
import { PortfolioRenderer } from "@/components/portfolio-renderer";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) { const { handle } = await params; const data = await getPublishedPortfolio(handle); if (!data) return { title: "Portfolio not found | KIPSMTHN" }; return { title: `${data.user.name} | KIPSMTHN`, description: data.portfolio.headline || data.profile?.bio || `Selected work by ${data.user.name}`, alternates: { canonical: `/p/${handle}` }, openGraph: { title: data.user.name, description: data.portfolio.headline || data.profile?.bio || "Selected creative work" } }; }
export default async function PublicPortfolio({ params }: { params: Promise<{ handle: string }> }) { const data = await getPublishedPortfolio((await params).handle); if (!data) notFound(); return <PortfolioRenderer data={data} />; }
