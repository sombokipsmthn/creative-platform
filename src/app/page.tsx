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
    icon: Images,
    title: "Private Client Delivery",
    description:
      "Deliver client galleries with secure PIN protection, proof watermarking, favorite curation, selection approvals, and batch downloads.",
  },
  {
    icon: FolderKanban,
    title: "Production Calendar & Projects",
    description:
      "Coordinate shoot schedules, call times, location logistics, gear allocation, and project status milestones from enquiry to wrap.",
  },
  {
    icon: ShieldCheck,
    title: "Legal Contract Builder",
    description:
      "Draft, sign, and archive standard commercial agreements with built-in licensing rights, revision policies, and audit logs.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Enquiry & Scoping",
    description:
      "Receive client briefs, catalog specific production requirements, and outline deliverables.",
  },
  {
    step: "02",
    title: "Quotation & Agreement",
    description:
      "Assemble gear and service line items, calculate fees, and issue branded proposals for approval.",
  },
  {
    step: "03",
    title: "Production Execution",
    description:
      "Track shoot dates, equipment inventory, location logistics, and daily team expenses.",
  },
  {
    step: "04",
    title: "Proofing & Delivery",
    description:
      "Share password-protected client galleries for photo selections, revisions, and final master downloads.",
  },
];

const workspaceModules = [
  { icon: Users, label: "Clients", href: "/admin/clients", count: "Verified CRM" },
  { icon: FolderKanban, label: "Projects", href: "/admin/projects", count: "Active Shoots" },
  { icon: FileText, label: "Quotes", href: "/admin/quotes", count: "Gear & Services" },
  { icon: Wallet, label: "Invoices", href: "/admin/invoices", count: "eTIMS Invoicing" },
  { icon: Images, label: "Galleries", href: "/admin/galleries", count: "Client Proofs" },
  { icon: LayoutDashboard, label: "Calendar", href: "/admin/calendar", count: "Call Sheets" },
];

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
        </section>

        {/* WORKSPACE MODULES QUICK STRIP */}
        <section className="border-b bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Workspace Architecture
                </p>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Built for your complete creative pipeline
                </h2>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1.5">
                <Link href="/admin">
                  Enter Command Center <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {workspaceModules.map((module) => {
                const Icon = module.icon;
                return (
                  <Link key={module.label} href={module.href}>
                    <Card className="group h-full transition-all hover:border-primary hover:shadow-md">
                      <CardContent className="flex flex-col items-start p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-foreground">
                          {module.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {module.count}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* PLATFORM FEATURES */}
        <section id="platform" className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <Badge variant="secondary">Platform Capabilities</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Everything required to run a high-caliber production business.
              </h2>
              <p className="text-base text-muted-foreground sm:text-lg">
                Stop juggling disjointed apps for proposals, cloud drives,
                invoices, and contracts. Run your creative business on a single,
                refined foundation.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="transition-all hover:shadow-md">
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* WORKFLOW ROADMAP */}
        <section id="workflow" className="border-t bg-muted/20 py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3">
              <Badge variant="secondary">Production Lifecycle</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                From initial client pitch to master delivery
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Standardized stages keep project details aligned so nothing gets
                lost between quotation and final invoice.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((item) => (
                <Card key={item.step} className="relative bg-card">
                  <CardHeader className="pb-2">
                    <span className="font-mono text-2xl font-bold text-primary/80">
                      {item.step}
                    </span>
                    <CardTitle className="mt-2 text-base font-semibold">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CREATOR WORKSPACE BANNER */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground shadow-2xl">
              <div className="grid gap-8 p-8 md:p-14 lg:grid-cols-12 lg:items-center">
                <div className="space-y-4 lg:col-span-8">
                  <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">
                    Private Creator Workspace
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    Your studio data is private. Your work stays protected.
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
                    Log in to access your confidential client rosters, pending
                    quotations, unpaid invoices, draft contracts, and upload
                    galleries. The admin dashboard is secured and personalized
                    for your creator profile.
                  </p>
                </div>

                <div className="flex flex-col gap-3 lg:col-span-4 lg:items-end">
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto font-semibold gap-2"
                  >
                    <Link href="/admin">
                      <span>Access Workspace</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Link href="/contact">Direct Collaboration</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
