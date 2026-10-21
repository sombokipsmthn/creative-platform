import Link from "next/link";
import type { Metadata } from "next";
import PublicLandingHeader from "@/components/PublicLandingHeader";
import ProductPreview from "@/components/ProductPreview";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  FolderKanban,
  FileText,
  Wallet,
  Camera,
  Zap,
  Globe,
  BarChart3,
  Shield,
  Target,
  Building2,
  Briefcase,
  Layers,
  RefreshCw,
  Sparkles,
  LayoutDashboard,
  Image as ImageIcon,
  FileText as FileTextIcon,
  Users as UsersIcon,
  Wallet as WalletIcon,
  Camera as CameraIcon,
  Layers as LayersIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kipsmthn.com";

export const metadata: Metadata = {
  title: {
    template: "%s | KIPSMTHN",
    default: "KIPSMTHN — Creative Business Platform",
  },
  description: "The operating system for your creative business. Bring clients, projects, quotes, invoices, and delivery into one connected workspace — built for photographers, filmmakers, studios, and creative teams.",
  openGraph: {
    title: "KIPSMTHN — Creative Business Platform",
    description: "Bring your creative business into one connected workspace. Clients, projects, quotes, invoices, and delivery — all connected.",
    url: appUrl,
    siteName: "KIPSMTHN",
    locale: "en_US",
    type: "website",
    images: [
      { url: "/og-image.svg", width: 1200, height: 630, alt: "KIPSMTHN Creative Business Platform" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KIPSMTHN — Creative Business Platform",
    description: "Bring your creative business into one connected workspace. Clients, projects, quotes, invoices, and delivery — all connected.",
    images: ["/og-image.svg"],
  },
};

const workflowSteps = [
  {
    number: "01",
    title: "Enquiry & Quote",
    description: "A potential client reaches out. Create a professional quote with services, equipment, production costs, deposits, taxes, and payment terms — all branded to your studio.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80",
    icon: FileTextIcon,
  },
  {
    number: "02",
    title: "Project Creation",
    description: "Convert the accepted quote into a project. Associate media, set milestones, assign team members, and track progress from brief to production — all in one place.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    icon: FolderKanban,
  },
  {
    number: "03",
    title: "Production & Collaboration",
    description: "Manage production schedules, equipment, and client feedback. Keep every detail connected — no more scattered spreadsheets, email threads, or lost context.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    icon: LayersIcon,
  },
  {
    number: "04",
    title: "Gallery Delivery",
    description: "Deliver final work through a private, branded client gallery. Clients review, select favorites, and download — with your watermark, custom domain, and access controls.",
    image: "https://images.unsplash.com/photo-1492052729918-2c65ce1ab121?auto=format&fit=crop&w=800&q=80",
    icon: CameraIcon,
  },
  {
    number: "05",
    title: "Invoice & Payment",
    description: "Generate invoices from quotes or projects. Track payments, manage expenses, and stay on top of your business finances with built-in revenue analytics.",
    image: "https://images.unsplash.com/photo-1554224154-26032fffe0de?auto=format&fit=crop&w=800&q=80",
    icon: WalletIcon,
  },
];

const benefits = [
  {
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    title: "Eliminate Administrative Friction",
    description: "Stop copying data between tools. Quotes become projects. Projects become galleries. Galleries become invoices. Every step carries context forward automatically.",
  },
  {
    image: "https://images.unsplash.com/photo-1504384308090-c894fbcc568d?auto=format&fit=crop&w=800&q=80",
    title: "Maintain Project Context",
    description: "Every client conversation, file, decision, and approval lives with the project. No more searching through email threads or disconnected folders to find what you agreed on.",
  },
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    title: "Improve Client Handoffs",
    description: "Give clients a professional experience: branded galleries, clear approval workflows, secure downloads. Impress them with how organized your process feels — not just the final work.",
  },
  {
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    title: "See Your Business Clearly",
    description: "Track quote conversion rates, overdue invoices, project velocity, and client engagement from a single dashboard. Make decisions with data, not guesswork.",
  },
  {
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    title: "Built for Local Compliance",
    description: "KRA PIN fields, WHT rates, KES currency defaults, M-Pesa references, eTIMS invoicing — the tax and payment details that matter for creative businesses in Kenya and East Africa.",
  },
  {
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    title: "Scale Without the Chaos",
    description: "Whether you're a solo creative or a growing studio, the platform grows with you. Add team members, manage multiple brands, and handle increasing volume without rebuilding your workflow.",
  },
];

const audiences = [
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    title: "Independent Creatives",
    description: "Photographers, filmmakers, designers, and solo practitioners who need professional business tools without enterprise complexity.",
    traits: ["Solo operation", "Client-facing delivery", "Quote-to-invoice workflow", "Portfolio presentation"],
  },
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    title: "Small Studios & Agencies",
    description: "Growing creative teams managing multiple clients, projects, and team members who need shared context and streamlined collaboration.",
    traits: ["Team collaboration", "Multi-project management", "Shared client database", "Role-based access"],
  },
  {
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
    title: "Creative Production Teams",
    description: "In-house creative departments and production companies handling high-volume workflows with complex approval chains and compliance requirements.",
    traits: ["High-volume workflows", "Approval chains", "Equipment planning", "Compliance & reporting"],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen selection:bg-primary selection:text-white">
      <PublicLandingHeader />
      <main id="main">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 lg:pt-28 pb-20 lg:pb-28">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/2 top-20 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-[300px] w-[300px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute left-0 bottom-0 h-[200px] w-[200px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:text-primary">
                The creative business platform
              </p>
              <h1 className="mt-6 text-4xl font-light leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6rem]">
                The operating system for your
                <br />
                <span className="font-medium">creative business.</span>
              </h1>
              <p className="mt-8 max-w-2xl mx-auto text-base leading-8 text-slate-600 dark:text-zinc-400 md:text-lg">
                Bring clients, projects, quotes, invoices, and delivery into one connected workspace — built for photographers, filmmakers, studios, and creative teams.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#platform"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-8 py-4 text-sm font-medium text-slate-700 dark:border-zinc-800 dark:text-zinc-300 transition-colors hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Explore the platform
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-500 dark:text-zinc-500">
                No credit card required · 14-day free trial · Cancel anytime
              </p>
            </div>

            <div className="relative mt-16">
              <ProductPreview className="max-w-7xl mx-auto" />
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto text-center">
              {[
                ["One workspace", "Stop stitching together disconnected tools."],
                ["One workflow", "Move from client enquiry to delivery with full context."],
                ["One business", "Keep creative work and business operations connected."],
              ].map(([title, description], index) => (
                <Card key={title} className="p-6 transition-colors hover:border-primary/50 border-slate-200/50 dark:border-zinc-800/50">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-primary dark:text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-4 text-lg font-medium tracking-tight text-slate-950 dark:text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* WORKFLOW EXPLANATION */}
        <section id="workflow" className="border-y border-slate-200/50 dark:border-zinc-800/50 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:text-primary">How it works</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Your creative workflow, connected end to end.
              </h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-zinc-400">
                Spend less time moving information between tools and more time doing the work your clients came to you for.
              </p>
            </div>

            <div className="mt-16">
              <div className="space-y-16 lg:space-y-24">
                {workflowSteps.map((step, index) => (
                  <div
                    key={step.number}
                    className="relative grid gap-8 lg:grid-cols-2 lg:gap-12 items-center"
                  >
                    <div
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-zinc-800/50"
                    >
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                    <div className="lg:pl-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-semibold tracking-[0.2em] text-primary dark:text-primary">
                          Step {step.number}
                        </span>
                        <h3 className="text-xl font-medium tracking-tight text-slate-950 dark:text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-base leading-7 text-slate-600 dark:text-zinc-400 max-w-2xl">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT PREVIEW / PLATFORM SECTION */}
        <section id="platform" className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 items-start">
              <div className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:text-primary">Built around your workflow</p>
                <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                  Less admin. More room for the work.
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-slate-600 dark:text-zinc-400">
                  The tools you need to run a creative business, designed to work together instead of in isolation.
                </p>
                <Link
                  href="/sign-up"
                  className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Start your workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", title: "Dashboard", description: "See your business at a glance with real-time metrics and key indicators." },
                  { image: "https://images.unsplash.com/photo-1504384308090-c894fbcc568d?auto=format&fit=crop&w=800&q=80", title: "Client CRM", description: "Keep relationships, contact details, and project history together in one place." },
                  { image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", title: "Projects", description: "Organize work from brief to final delivery with progress tracking and milestones." },
                  { image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80", title: "Quotes & Contracts", description: "Prepare professional documents with branded templates and e-signature support." },
                  { image: "https://images.unsplash.com/photo-1554224154-26032fffe0de?auto=format&fit=crop&w=800&q=80", title: "Invoices & Expenses", description: "Track billing, payments, expenses, and revenue with built-in analytics." },
                  { image: "https://images.unsplash.com/photo-1492052729918-2c65ce1ab121?auto=format&fit=crop&w=800&q=80", title: "Client Galleries", description: "Deliver work through branded, private galleries with selection and download controls." },
                ].map(({ image, title, description }) => (
                  <article key={title} className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-colors hover:border-primary/50">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-medium text-slate-950 dark:text-white">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT BENEFITS */}
        <section id="benefits" className="border-y border-slate-200/50 dark:border-zinc-800/50 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:text-primary">Why teams choose KIPSMTHN</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Meaningful outcomes, not just features.
              </h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-zinc-400">
                We focus on what changes for your business when the admin work disappears.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <article key={benefit.title} className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-colors hover:border-primary/50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={benefit.image}
                      alt={benefit.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-6 lg:p-8">
                    <div className="absolute top-4 right-4 text-[10px] font-semibold tracking-[0.2em] text-primary/50 dark:text-primary/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-2 py-1 rounded">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <h3 className="text-xl font-medium tracking-tight text-slate-950 dark:text-white mb-3">{benefit.title}</h3>
                    <p className="text-base leading-7 text-slate-600 dark:text-zinc-400">{benefit.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AUDIENCE & USE CASES */}
        <section id="audience" className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:text-primary">Who it&apos;s for</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                Built for creative businesses of every size.
              </h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-zinc-400">
                Whether you&apos;re a solo creative or a growing studio, the platform adapts to how you work.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {audiences.map((audience) => (
                <article key={audience.title} className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-colors hover:border-primary/50">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={audience.image}
                      alt={audience.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  <div className="p-6 lg:p-8">
                    <h3 className="text-xl font-medium tracking-tight text-white mb-2">{audience.title}</h3>
                    <p className="text-base leading-7 text-slate-300 mb-6">{audience.description}</p>
                    <ul className="space-y-2" role="list">
                      {audience.traits.map((trait) => (
                        <li key={trait} className="flex items-center gap-2 text-sm text-white">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST / COMPLIANCE SECTION */}
        <section className="border-y border-slate-200/50 dark:border-zinc-800/50 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-20 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary dark:text-primary">Built for creative businesses in Africa</p>
                <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Local compliance, global standards.
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-slate-600 dark:text-zinc-400">
                  KIPSMTHN includes the tax and payment details that matter for creative businesses operating in Kenya and across East Africa — so you can focus on the work, not the paperwork.
                </p>
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {[
                    { image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80", title: "KRA eTIMS Invoicing", desc: "Official tax-compliant invoices generated automatically." },
                    { image: "https://images.unsplash.com/photo-1554224154-26032fffe0de?auto=format&fit=crop&w=800&q=80", title: "Multi-Currency Billing", desc: "KES, USD, EUR support for international clients." },
                    { image: "https://images.unsplash.com/photo-1504384308090-c894fbcc568d?auto=format&fit=crop&w=800&q=80", title: "WHT & VAT Handling", desc: "Automatic withholding tax and VAT calculations." },
                    { image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", title: "M-Pesa References", desc: "Track mobile money payments alongside invoices." },
                  ].map((item) => (
                    <article key={item.title} className="relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 transition-colors hover:border-primary/50">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        <p className="text-sm text-slate-300 mt-1">{item.desc}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square max-w-md mx-auto rounded-2xl border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                        <Globe className="h-12 w-12 text-primary" aria-hidden="true" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-950 dark:text-white mb-2">Kenya-First Design</h3>
                      <p className="text-slate-600 dark:text-zinc-400">
                        Built by Kenyan creatives, for Kenyan creatives — with the compliance features that actually matter.
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" aria-hidden="true" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2" aria-hidden="true">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur text-white border border-white/30">KRA eTIMS</span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur text-white border border-white/30">WHT / VAT</span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur text-white border border-white/30">M-Pesa</span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/20 backdrop-blur text-white border border-white/30">Multi-Currency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white dark:bg-zinc-900 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
              <div className="absolute inset-0" aria-hidden="true">
                <div className="absolute -top-20 -right-20 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-[200px] w-[200px] rounded-full bg-primary/10 blur-3xl" />
              </div>
              <div className="relative max-w-3xl z-10">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Ready to simplify your creative business?</p>
                <h2 className="mt-5 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                  Your business deserves a workflow that works as hard as you do.
                </h2>
                <p className="mt-5 max-w-2xl leading-7 text-slate-300">
                  Bring your clients, projects, documents, and delivery into one place — and get back to creating.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Get started free <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    Sign in to your workspace
                  </Link>
                </div>
                <p className="mt-6 text-sm text-slate-400">
                  14-day free trial · No credit card required · Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <Footer />
      </main>
    </div>
  );
}