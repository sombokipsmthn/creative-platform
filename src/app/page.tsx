import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, FileText, FolderKanban, Images, LayoutDashboard, Users, Wallet } from "lucide-react";

import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: {
    template: "%s | KIPSMTHN",
    default: "KIPSMTHN - Creative Business Platform",
  },
  description: "KIPSMTHN is the operating system for your creative business. Bring your creative presence, clients, projects, quotes, invoices and delivery into one connected workspace — built for photographers, filmmakers, studios and creative teams.",
  openGraph: {
    title: "KIPSMTHN - Creative Business Platform",
    description: "KIPSMTHN is the operating system for your creative business. Bring your creative presence, clients, projects, quotes, invoices and delivery into one connected workspace — built for photographers, filmmakers, studios and creative teams.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://kipsmthn.com',
    siteName: "KIPSMTHN",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 800,
        alt: "Creative business platform with workspace and tools",
      },
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "KIPSMTHN Creative Business Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KIPSMTHN - Creative Business Platform",
    description: "KIPSMTHN is the operating system for your creative business. Bring your creative presence, clients, projects, quotes, invoices and delivery into one connected workspace — built for photographers, filmmakers, studios and creative teams.",
    images: ["https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80"],
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
};

const platformFeatures = [
  { number: "01", title: "Build your creative presence", description: "Create a polished portfolio that gives your work a professional home and makes it easier for the right clients to discover you." },
  { number: "02", title: "Manage clients in one place", description: "Keep client information, projects, quotes, invoices, and production details connected instead of scattered across different tools." },
  { number: "03", title: "Create professional quotes", description: "Build clean, branded quotations with equipment, services, production costs, deposits, discounts, tax, and payment terms." },
  { number: "04", title: "Deliver private galleries", description: "Give clients a simple private destination for reviewing, selecting, commenting on, and accessing their creative work." },
  { number: "05", title: "Keep your workflow moving", description: "Move from enquiry to project, quotation, production, delivery, and payment without rebuilding the same information every time." },
  { number: "06", title: "Stay in control", description: "Your creative business deserves a system designed around how you actually work — flexible, visual, and straightforward." },
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
    <div className="selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-20 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute -right-40 top-80 h-[360px] w-[360px] rounded-full bg-fuchsia-500/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-5xl">
              <p className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Creative Business Platform
              </p>
              <h1 className="mt-7 max-w-5xl text-5xl font-light leading-[0.94] tracking-tight text-slate-950 dark:text-white md:text-7xl lg:text-[6.5rem]">
                The operating system for your creative business.
              </h1>
              <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400 md:text-lg">
                Bring your creative presence, clients, projects, quotes, invoices and delivery into one connected workspace — built for photographers, filmmakers, studios and creative teams.
              </p>
              <div className="relative mt-10 h-48 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 md:h-64">
                <Image
                  src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80"
                  alt="Creative business platform with workspace and tools"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                  className="object-cover"
                />
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700">
                  Get started<ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#platform" className="inline-flex items-center rounded-full border border-slate-200 px-7 py-4 text-sm font-medium transition hover:border-purple-400 hover:text-purple-600 dark:border-zinc-800 dark:hover:border-purple-800 dark:hover:text-purple-400">
                  Explore the platform
                </Link>
              </div>
            </div>

            {/* FEATURES */}
            <div className="mt-20 grid gap-4 md:grid-cols-3">
              {[["01", "One workspace", "Stop stitching together disconnected tools."], ["02", "One workflow", "Move from client enquiry to delivery without losing context."], ["03", "One business", "Keep the creative and commercial sides of your work connected."]].map(([number, title, text]) => (
                <Card key={number} className="p-6 hover:border-purple-600/50 dark:hover:border-purple-600/50 transition-colors cursor-pointer">
                  <span className="font-sans text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">{number}</span>
                  <h2 className="mt-6 text-xl font-medium tracking-tight">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-500">{text}</p>
                </Card>
              ))}
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

        {/* PRICING */}
        <section id="pricing" className="border-t border-slate-200 dark:border-zinc-800">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400">Start here</p>
            <h2 className="mt-5 text-4xl font-light tracking-tight md:text-6xl">
              Spend less time managing the business. Spend more time making the work.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400">
              Explore the platform, create your account, and keep your creator workspace separate from the public-facing experience.
            </p>
            <div className="mt-9 flex justify-center gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700">
                Get started<ArrowRight className="h-4 w-4" />
              </Link>
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