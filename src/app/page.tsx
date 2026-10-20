import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  FolderKanban,
  Images,
  LayoutDashboard,
  Users,
  Wallet,
  Zap,
  Shield,
  Globe,
  Target,
  BarChart3,
} from "lucide-react";

import Header from "@/components/header";
import { Card } from "@/components/ui/card";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kipsmthn.com";
const heroImage = "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=85";

export const metadata = {
  title: {
    template: "%s | KIPSMTHN",
    default: "KIPSMTHN — Creative Business Platform",
  },
  description: "The operating system for your creative business. Bring your creative presence, clients, projects, quotes, invoices, and delivery into one connected workspace.",
  openGraph: {
    title: "KIPSMTHN — Creative Business Platform",
    description: "Bring your creative presence, clients, projects, quotes, invoices, and delivery into one connected workspace.",
    url: appUrl,
    siteName: "KIPSMTHN",
    locale: "en_KE",
    type: "website",
    images: [
      { url: heroImage, width: 1600, height: 1067, alt: "Creative workspace" },
      { url: "/og-image.svg", width: 1200, height: 630, alt: "KIPSMTHN Creative Business Platform" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KIPSMTHN — Creative Business Platform",
    description: "Bring your creative presence, clients, projects, quotes, invoices, and delivery into one connected workspace.",
    images: [heroImage],
  },
};

const platformFeatures = [
  {
    number: "01",
    title: "Creative Portfolio",
    description: "Showcase your work with a professional portfolio that helps the right clients discover you.",
    icon: Images,
  },
  {
    number: "02",
    title: "Client Management",
    description: "Keep client information, projects, production details, quotes, and invoices connected in one CRM.",
    icon: Users,
  },
  {
    number: "03",
    title: "Professional Quotes",
    description: "Prepare branded quotations with services, equipment, production costs, deposits, taxes, and payment terms.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Private Galleries",
    description: "Give clients a private place to review, select, comment on, and download their creative work.",
    icon: Camera,
  },
  {
    number: "05",
    title: "Invoices & Payments",
    description: "Generate invoices, track payments, manage expenses, and stay on top of your business finances.",
    icon: Wallet,
  },
  {
    number: "06",
    title: "Project Workflows",
    description: "Move from enquiry to project, production, delivery, and payment without repeating the same work.",
    icon: FolderKanban,
  },
];

const workspaceTools = [
  { icon: LayoutDashboard, title: "Dashboard", description: "See your business at a glance with real-time metrics." },
  { icon: Users, title: "Client CRM", description: "Keep relationships and project details together." },
  { icon: FolderKanban, title: "Projects", description: "Organize work from brief to final delivery." },
  { icon: FileText, title: "Quotes & Contracts", description: "Prepare and manage production documents." },
  { icon: Wallet, title: "Invoices & Expenses", description: "Track billing, payments, and business costs." },
  { icon: Images, title: "Client Galleries", description: "Deliver work through a dedicated client experience." },
];

const trustSignals = [
  { label: "Active Creators", value: "2,800+", description: "Photographers, filmmakers, and studios" },
  { label: "Projects Delivered", value: "15,000+", description: "Across commercial, corporate, and documentary work" },
  { label: "Client Galleries", value: "42,000+", description: "Private delivery portals created" },
  { label: "Countries Served", value: "12+", description: "From Kenya to global markets" },
];

const creatorWorkflows = [
  {
    title: "From enquiry to invoice in one flow",
    description: "A potential client reaches out. You create a quote, convert it to a project, track production, deliver a private gallery, and send the invoice — all connected, no copy-paste.",
    icon: Zap,
  },
  {
    title: "Client galleries that feel yours",
    description: "Custom domains, your branding, your watermark settings. Clients see a professional portal — not a generic file share.",
    icon: Globe,
  },
  {
    title: "Business intelligence built in",
    description: "Track quote conversion, overdue invoices, project velocity, and client engagement without leaving your workspace.",
    icon: BarChart3,
  },
  {
    title: "Built for Kenyan creative businesses",
    description: "KRA PIN fields, WHT rates, KES currency defaults, M-Pesa references — the tax and payment details that matter locally.",
    icon: Shield,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen selection:bg-primary selection:text-white">
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/2 top-12 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-40 top-72 h-[340px] w-[340px] rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pt-28">
            <div className="max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-primary">The creative business platform</p>
              <h1 className="mt-7 max-w-5xl text-5xl font-light leading-[0.98] tracking-tight text-slate-950 dark:text-white sm:text-6xl md:text-7xl lg:text-[6.25rem]">The operating system for your creative business.</h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400 md:text-lg">Bring your creative presence, clients, projects, quotes, invoices, and delivery into one connected workspace — built for photographers, filmmakers, studios, and creative teams.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary">Get started <ArrowRight className="h-4 w-4" /></Link>
                <Link href="#platform" className="inline-flex items-center rounded-full border border-slate-200 px-7 py-4 text-sm font-medium transition hover:border-primary hover:text-primary dark:border-zinc-800 dark:hover:border-primary dark:hover:text-primary">Explore the platform</Link>
              </div>
            </div>
            <div className="relative mt-14 h-64 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-zinc-800 dark:bg-zinc-900 sm:h-80 lg:h-[440px]">
              <Image src={heroImage} alt="Creative workspace and production environment" fill priority sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 text-sm font-medium text-white sm:bottom-7 sm:left-7">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur"><Check className="h-4 w-4" /></span>
                One connected workspace for your business
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ["One workspace", "Stop stitching together disconnected tools."],
                ["One workflow", "Move from client enquiry to delivery with context."],
                ["One business", "Keep creative work and business operations connected."],
              ].map(([title, description], index) => (
                <Card key={title} className="p-6 transition-colors hover:border-primary/50">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-primary dark:text-primary">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="mt-5 text-xl font-medium tracking-tight">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TRUST SIGNALS */}
        <section className="border-y border-slate-200/80 dark:border-zinc-800 py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {trustSignals.map((signal) => (
                <div key={signal.label} className="text-center">
                  <p className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">{signal.value}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{signal.label}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{signal.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM FEATURES */}
        <section id="platform" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-primary">Built around your workflow</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">Less admin. More room for the work.</h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-zinc-400">The tools you need to run a creative business, designed to work together instead of in isolation.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature) => (
                <Card key={feature.number} className="p-6 transition-colors hover:border-primary/50 sm:p-7">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="mt-4 block text-[10px] font-semibold tracking-[0.2em] text-primary dark:text-primary">{feature.number}</span>
                  <h3 className="mt-3 text-xl font-medium tracking-tight text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-zinc-400">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CREATOR WORKFLOWS */}
        <section className="border-y border-slate-200/80 dark:border-zinc-800 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-primary">How creators use KIPSMTHN</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">Your workflow, connected end to end.</h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-zinc-400">Spend less time moving information between tools and more time doing the work your clients came to you for.</p>
            </div>
            <div className="mt-16 grid gap-8 lg:grid-cols-2">
              {creatorWorkflows.map((workflow, index) => (
                <div key={workflow.title} className="relative pl-16">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary">
                    <workflow.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-medium tracking-tight text-slate-950 dark:text-white">{workflow.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600 dark:text-zinc-400">{workflow.description}</p>
                  {index < creatorWorkflows.length - 1 && <div className="absolute left-5 top-10 bottom-[-8px] w-0.5 bg-slate-200 dark:bg-zinc-800" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WORKSPACE TOOLS */}
        <section id="workflow" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary dark:text-primary">Your working toolkit</p>
                <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">Everything connected, from first brief to final delivery.</h2>
                <p className="mt-5 max-w-xl leading-7 text-slate-600 dark:text-zinc-400">Spend less time moving information between tools and more time doing the work your clients came to you for.</p>
                <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary dark:text-primary dark:hover:text-primary">Start your workspace <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {workspaceTools.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-2xl border border-slate-200 p-5 dark:border-zinc-800">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary dark:text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                    <h3 className="mt-4 font-medium text-slate-950 dark:text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white dark:bg-zinc-900 sm:px-10 sm:py-16 lg:px-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Make space for your work</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">Your business deserves a workflow that works as hard as you do.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-slate-300">Bring your clients, projects, documents, and delivery into one place — and get back to creating.</p>
              <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-primary/10">Get started <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>

        {/* FOOTER NAVIGATION */}
        <section className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <span className="font-semibold tracking-[0.12em] text-slate-900 dark:text-white">KIPSMTHN</span>
                <p className="mt-4 max-w-xs text-sm text-slate-500 dark:text-zinc-400">Creative work, connected. Built for creative businesses in Africa and beyond.</p>
              </div>
              <nav>
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-zinc-400">Product</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                  <li><Link href="#platform" className="hover:text-primary transition">Platform</Link></li>
                  <li><Link href="/work" className="hover:text-primary transition">Portfolio</Link></li>
                  <li><Link href="/services" className="hover:text-primary transition">Services</Link></li>
                  <li><Link href="/contact" className="hover:text-primary transition">Contact</Link></li>
                </ul>
              </nav>
              <nav>
                <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500 dark:text-zinc-400">Company</h4>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-zinc-400">
                  <li><Link href="/about" className="hover:text-primary transition">About</Link></li>
                  <li><Link href="/privacy" className="hover:text-primary transition">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-primary transition">Terms</Link></li>
                </ul>
              </nav>
            </div>
            <div className="mt-12 border-t border-slate-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-500 dark:text-zinc-400">
              <span>&copy; {new Date().getFullYear()} KIPSMTHN. All rights reserved.</span>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-primary transition">Privacy</Link>
                <Link href="/terms" className="hover:text-primary transition">Terms</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}