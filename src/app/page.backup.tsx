"use client";

import Link from "next/link";
import Image from "next/image";

import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80";

function resolveImage(source?: string | null) {
  if (!source) {
    return FALLBACK_IMAGE;
  }

  if (
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  return `https://lh3.googleusercontent.com/d/${source}`;
}

const platformFeatures = [
  {
    number: "01",
    title: "Build your creative presence",
    description:
      "Create a polished portfolio that gives your work a professional home and makes it easier for the right clients to discover you.",
  },
  {
    number: "02",
    title: "Manage clients in one place",
    description:
      "Keep client information, projects, quotes, invoices, and production details connected instead of scattered across different tools.",
  },
  {
    number: "03",
    title: "Create professional quotes",
    description:
      "Build clean, branded quotations with equipment, services, production costs, deposits, discounts, tax, and payment terms.",
  },
  {
    number: "04",
    title: "Deliver private galleries",
    description:
      "Give clients a simple private destination for reviewing, selecting, commenting on, and accessing their creative work.",
  },
  {
    number: "05",
    title: "Keep your workflow moving",
    description:
      "Move from enquiry to project, quotation, production, delivery, and payment without rebuilding the same information every time.",
  },
  {
    number: "06",
    title: "Stay in control",
    description:
      "Your creative business deserves a system designed around how you actually work — flexible, visual, and straightforward.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Create",
    text: "Build your profile and showcase the work you want clients to see.",
  },
  {
    step: "02",
    title: "Connect",
    text: "Manage clients and turn enquiries into organized projects.",
  },
  {
    step: "03",
    title: "Quote",
    text: "Create professional quotations using your own services and equipment.",
  },
  {
    step: "04",
    title: "Deliver",
    text: "Give clients a private, polished place to receive their work.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-20 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 text-xs font-medium tracking-wide">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Creative Operating System
              </div>

              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                  KIPSMTHN
                </p>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] text-slate-950 dark:text-white">
                  One platform for your creative practice.
                </h1>

                <p className="max-w-xl text-base md:text-lg leading-8 text-slate-600 dark:text-zinc-400">
                  Connect your portfolio, client management, project quotes, invoices, and private delivery galleries in one unified ecosystem.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                >
                  Get Started — Free
                </Link>

                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center px-7 py-4 rounded-full border border-slate-200 dark:border-zinc-800 text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-colors"
                >
                  Sign In ↗
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-square max-w-xl mx-auto rounded-[2rem] overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-2xl">
                <Image
                  src={FALLBACK_IMAGE}
                  alt="KIPSMTHN Creative Platform"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 px-6 border-t border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold mb-3">
              Features
            </p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-slate-950 dark:text-white">
              Designed for visual creators and studios.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((f) => (
              <div
                key={f.number}
                className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 space-y-4 shadow-sm"
              >
                <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
                  {f.number}
                </span>
                <h3 className="text-xl font-medium text-slate-950 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="py-24 px-6 border-t border-slate-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold mb-3">
              Workflow
            </p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-slate-950 dark:text-white">
              How it works.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflow.map((w) => (
              <div key={w.step} className="space-y-3">
                <span className="text-2xl font-light text-purple-600 dark:text-purple-400">
                  {w.step}
                </span>
                <h3 className="text-lg font-medium text-slate-950 dark:text-white">
                  {w.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {w.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-slate-100 dark:border-zinc-900 text-center text-xs text-slate-500 dark:text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-purple-600 transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-purple-600 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
