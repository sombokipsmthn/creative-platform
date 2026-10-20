import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
<<<<<<< HEAD
  CheckCircle2,
  Plus,
=======
  Check,
>>>>>>> c898786fba874637680566941fd0b37ceea58254
  FileText,
  FolderKanban,
  Images,
  LayoutDashboard,
  Users,
  Wallet,
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
  { number: "01", title: "Build your creative presence", description: "Give your work a professional home with a portfolio that helps the right clients discover you." },
  { number: "02", title: "Manage clients in one place", description: "Keep client information, projects, production details, quotes, and invoices connected." },
  { number: "03", title: "Create professional quotes", description: "Prepare branded quotations with services, equipment, production costs, deposits, taxes, and payment terms." },
  { number: "04", title: "Deliver private galleries", description: "Give clients a private place to review, select, comment on, and access their creative work." },
  { number: "05", title: "Keep your workflow moving", description: "Move from enquiry to project, production, delivery, and payment without repeating the same work." },
  { number: "06", title: "Stay in control", description: "Run the creative and commercial sides of your business from one flexible workspace." },
];

<<<<<<< HEAD
const projects = platformFeatures.filter(
  (feature): feature is { title: string; type: string; year: string; image: string } =>
    "image" in feature
);
=======
const workspaceTools = [
  { icon: LayoutDashboard, title: "Dashboard", description: "See your business at a glance." },
  { icon: Users, title: "Client management", description: "Keep relationships and project details together." },
  { icon: FolderKanban, title: "Projects", description: "Organise work from brief to delivery." },
  { icon: FileText, title: "Quotes & contracts", description: "Prepare and manage production documents." },
  { icon: Wallet, title: "Invoices & expenses", description: "Keep track of billing and business costs." },
  { icon: Images, title: "Client galleries", description: "Deliver work through a dedicated client experience." },
];
>>>>>>> c898786fba874637680566941fd0b37ceea58254

export default function HomePage() {
  return (
    <div className="min-h-screen selection:bg-purple-600 selection:text-white">
      <Header />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-1/2 top-12 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute -right-40 top-72 h-[340px] w-[340px] rounded-full bg-fuchsia-500/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pt-28">
            <div className="max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">The creative business platform</p>
              <h1 className="mt-7 max-w-5xl text-5xl font-light leading-[0.98] tracking-tight text-slate-950 dark:text-white sm:text-6xl md:text-7xl lg:text-[6.25rem]">The operating system for your creative business.</h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400 md:text-lg">Bring your creative presence, clients, projects, quotes, invoices, and delivery into one connected workspace — built for photographers, filmmakers, studios, and creative teams.</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700">Get started <ArrowRight className="h-4 w-4" /></Link>
                <Link href="#platform" className="inline-flex items-center rounded-full border border-slate-200 px-7 py-4 text-sm font-medium transition hover:border-purple-400 hover:text-purple-600 dark:border-zinc-800 dark:hover:border-purple-800 dark:hover:text-purple-400">Explore the platform</Link>
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
                <Card key={title} className="p-6 transition-colors hover:border-purple-600/50">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="mt-5 text-xl font-medium tracking-tight">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">{description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="platform" className="border-y border-slate-200/80 dark:border-zinc-800">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Built around your workflow</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">Less admin. More room for the work.</h2>
              <p className="mt-5 leading-7 text-slate-600 dark:text-zinc-400">The tools you need to run a creative business, designed to work together instead of in isolation.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platformFeatures.map((feature) => (
                <Card key={feature.number} className="p-6 transition-colors hover:border-purple-600/50 sm:p-7">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">{feature.number}</span>
                  <h3 className="mt-6 text-xl font-medium tracking-tight text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-zinc-400">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Your working toolkit</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight text-slate-950 dark:text-white sm:text-4xl md:text-5xl">Everything connected, from first brief to final delivery.</h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600 dark:text-zinc-400">Spend less time moving information between tools and more time doing the work your clients came to you for.</p>
              <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">Start your workspace <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {workspaceTools.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-slate-200 p-5 dark:border-zinc-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400"><Icon className="h-5 w-5" aria-hidden="true" /></div>
                  <h3 className="mt-4 font-medium text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white dark:bg-zinc-900 sm:px-10 sm:py-16 lg:px-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">Make space for your work</p>
              <h2 className="mt-5 text-3xl font-light tracking-tight sm:text-4xl md:text-5xl">Your business deserves a workflow that works as hard as you do.</h2>
              <p className="mt-5 max-w-2xl leading-7 text-slate-300">Bring your clients, projects, documents, and delivery into one place — and get back to creating.</p>
              <Link href="/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-purple-100">Get started <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span className="font-semibold tracking-[0.12em] text-slate-900 dark:text-white">KIPSMTHN</span>
          <span>Creative work, connected.</span>
          <span>Built for creative businesses in Africa and beyond.</span>
        </div>
      </footer>
    </div>
  );
}
