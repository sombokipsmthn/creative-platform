import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  FolderKanban,
  Images,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

import Header from "@/components/header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "KIPSMTHN — Creative Platform & Operating System",
  description:
    "The operating system for commercial photographers, filmmakers, and creative studios. Manage clients, contracts, quotes, equipment, invoices, and private delivery galleries in one unified workspace.",
};

const platformFeatures = [
  {
    icon: Users,
    title: "Client & CRM Hub",
    description:
      "Maintain verified contact records, company profiles, KRA PIN compliance, and engagement histories in one structured view.",
  },
  {
    icon: FileText,
    title: "Production Quotations",
    description:
      "Generate itemized estimates mapped directly to your local camera kits, lighting gear, crew day rates, and post-production deliverables.",
  },
  {
    icon: Wallet,
    title: "Invoices & eTIMS Readiness",
    description:
      "Convert accepted quotes into structured invoices with automated VAT/WHT calculations, payment tracking, and audit-ready records.",
  },
  {
    title: "House of Light",
    type: "Residential · Karen",
    year: "2024",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Kijani Courtyard",
    type: "Hospitality · Naivasha",
    year: "2023",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Atelier No. 09",
    type: "Workplace · Nairobi",
    year: "2022",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85",
  },
];

const principles = [
  ["01", "Context", "We begin with what is already there: the climate, the light, the landscape, and the people who will inhabit it."],
  ["02", "Material", "Honest materials, carefully detailed. Every surface is chosen to age with grace and tell a story over time."],
  ["03", "Meaning", "The best spaces do more than perform. They create a sense of belonging that lasts long after the first impression."],
];

export const metadata = {
  title: "Hously — Modern Architecture Studio",
  description: "Hously is an architecture and interiors studio creating enduring spaces across East Africa.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-7">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  The operating system for your{" "}
                  <span className="text-primary underline decoration-muted-foreground/30 underline-offset-8">
                    creative studio
                  </span>
                  .
                </h1>

                <p className="max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl leading-relaxed">
                  Bring your portfolio showcase, client CRM, production quotes,
                  eTIMS invoices, and private delivery galleries into one
                  seamless, unified workspace.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild size="lg" className="gap-2">
                    <Link href="/admin">
                      <span>Launch Studio Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button asChild variant="outline" size="lg">
                    <Link href="/equipment">Browse Production Kit</Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Nairobi & East Africa Production Hub</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>KRA eTIMS & 5% WHT Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Private Client Portals</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <Card className="overflow-hidden border-2 shadow-xl">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <Image
                      src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80"
                      alt="Production studio workspace overview"
                      fill
                      priority
                      referrerPolicy="no-referrer"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                        Live Client Production
                      </p>
                      <h2 className="text-lg font-bold">
                        Clean Energy Impact & Ecosystem Media
                      </h2>
                      <p className="text-xs text-white/70">
                        Nairobi, Kenya · Sony FX Cinema Package
                      </p>
                    </div>
                  </div>

                  <CardContent className="grid grid-cols-3 divide-x p-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Equipment</p>
                      <p className="text-lg font-bold text-foreground">12+ Units</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Deliverables</p>
                      <p className="text-lg font-bold text-foreground">4K + RAW</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Gallery</p>
                      <p className="text-lg font-bold text-foreground">Active PIN</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <div className="hously-hero-image">
            <Image src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=90" alt="Warm modern living room with sculptural furniture" fill priority sizes="(max-width: 768px) 100vw, 58vw" className="object-cover" />
            <div className="hously-image-note"><span>01</span><span>House of Light<br />Karen, Kenya</span></div>
          </div>
        </section>

        <section id="studio" className="hously-statement">
          <p className="hously-kicker">The studio</p>
          <div>
            <h2>We design for the way <em>life unfolds.</em></h2>
            <p>Our work is rooted in a belief that architecture should feel inevitable — grounded in its place, generous in its details, and quietly expressive. From a first sketch to the final joinery, we make spaces that invite you to stay a little longer.</p>
            <Link href="/about" className="hously-text-link">Discover Hously <ArrowRight className="size-4" /></Link>
          </div>
        </section>

        <section id="work" className="hously-work">
          <div className="flex items-end justify-between gap-4">
            <div><p className="hously-kicker">Selected work</p><h2>Recent <em>projects.</em></h2></div>
            <Link href="/work" className="hously-text-link hidden sm:flex">View all work <ArrowRight className="size-4" /></Link>
          </div>
          <div className="hously-project-grid">
            {projects.map((project, index) => (
              <Link href="/work" key={project.title} className={`hously-project ${index === 0 ? "hously-project-featured" : ""}`}>
                <div className="relative aspect-[4/5] overflow-hidden"><Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 hover:scale-105" /></div>
                <div className="mt-4 flex items-start justify-between gap-4"><div><h3>{project.title}</h3><p>{project.type}</p></div><span>{project.year}</span></div>
              </Link>
            ))}
          </div>
        </section>

        <section id="approach" className="hously-approach">
          <div><p className="hously-kicker">Our approach</p><h2>Less noise.<br /><em>More feeling.</em></h2></div>
          <div className="hously-principles">{principles.map(([number, title, description]) => <div className="hously-principle" key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><Plus className="size-4" /></div>)}</div>
        </section>

        <section className="hously-cta"><p className="hously-kicker">Have a project in mind?</p><h2>Let&apos;s make<br /><em>room for it.</em></h2><Link href="/contact" className="hously-cta-link">Begin a conversation <ArrowRight className="size-4" /></Link></section>
      </main>

      <footer className="hously-footer"><span>HOUSLY®</span><span>Architecture for considered living</span><span>Nairobi · Kenya</span></footer>
    </div>
  );
}
