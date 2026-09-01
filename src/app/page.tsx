import Link from "next/link";
import { ArrowRight, Check, FileText, FolderKanban, Images, LayoutDashboard, Users, Wallet } from "lucide-react";

import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

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

const workspaceModules = [
  {
    icon: Users,
    title: "Clients",
    text: "CRM and client records",
  },
  {
    icon: FolderKanban,
    title: "Projects",
    text: "Projects, portfolios and production",
  },
  {
    icon: FileText,
    title: "Quotes",
    text: "Professional production quotations",
  },
  {
    icon: Wallet,
    title: "Invoices",
    text: "Billing and payment tracking",
  },
  {
    icon: Images,
    title: "Galleries",
    text: "Private client delivery",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    text: "One view across the business",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 transition-colors duration-300 dark:bg-[#09090b] dark:text-zinc-100">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-6 pb-24 pt-36 md:pb-32 md:pt-44">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-20 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />
            <div className="absolute -right-40 top-80 h-[360px] w-[360px] rounded-full bg-fuchsia-500/5 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl">
            <div className="max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">
                Creative Business Platform
              </p>

              <h1 className="mt-7 max-w-5xl text-5xl font-light leading-[0.94] tracking-tight text-slate-950 dark:text-white md:text-7xl lg:text-[6.5rem]">
                The operating system for your creative business.
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400 md:text-lg">
                Bring your creative presence, clients, projects, quotes,
                invoices and delivery into one connected workspace — built for
                photographers, filmmakers, studios and creative teams.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="Button Button--primary"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="#platform"
                  className="Button Button--secondary"
                >
                  Explore the platform
                </Link>
              </div>
            </div>

            <div className="mt-20 grid gap-4 md:grid-cols-3">
              {[
                ["01", "One workspace", "Stop stitching together disconnected tools."],
                ["02", "One workflow", "Move from client enquiry to delivery without losing context."],
                ["03", "One business", "Keep the creative and commercial sides of your work connected."],
              ].map(([number, title, text]) => (
                <div
                  key={number}
                  className="rounded-xl border border-slate-200 bg-white/70 p-6 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70"
                >
                  <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                    {number}
                  </span>
                  <h2 className="mt-6 text-xl font-medium tracking-tight">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-500">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section id="platform" className="border-t border-slate-200 px-6 py-24 dark:border-zinc-800 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400">
                  The platform
                </p>
                <h2 className="mt-5 text-4xl font-light tracking-tight md:text-6xl">
                  Everything your creative business needs.
                </h2>
                <p className="mt-6 max-w-md text-base leading-8 text-slate-600 dark:text-zinc-400">
                  KIPSMTHN brings the systems behind your creative work into a
                  single place, so your tools support the way you work instead
                  of getting in the way.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {platformFeatures.map((feature) => (
                  <article
                    key={feature.number}
                    className="group rounded-xl border border-slate-200 p-7 transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-xl hover:shadow-purple-600/5 dark:border-zinc-800 dark:hover:border-purple-900"
                  >
                    <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                      {feature.number}
                    </span>
                    <h3 className="mt-8 text-2xl font-light tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section id="workflow" className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400">
                Workflow
              </p>
              <h2 className="mt-5 text-4xl font-light tracking-tight md:text-6xl">
                From first contact to final delivery.
              </h2>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {workflow.map((item) => (
                <article
                  key={item.step}
                  className="relative rounded-xl border border-slate-200 p-7 dark:border-zinc-800"
                >
                  <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                    {item.step}
                  </span>
                  <h3 className="mt-8 text-2xl font-light tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-zinc-400">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* WORKSPACE */}
        <section id="work" className="border-y border-slate-200 px-6 py-24 dark:border-zinc-800 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400">
                  Your workspace
                </p>
                <h2 className="mt-5 text-4xl font-light tracking-tight md:text-6xl">
                  One place for the work behind the work.
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {workspaceModules.map((module) => {
                  const Icon = module.icon;
                  return (
                    <div
                      key={module.title}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-purple-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-purple-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="mt-5 text-sm font-semibold">
                        {module.title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-500">
                        {module.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* PRIVATE CREATOR WORKSPACE */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-purple-600 p-8 text-white md:p-14">
              <div className="grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-200">
                    For creators
                  </p>
                  <h2 className="mt-5 max-w-3xl text-4xl font-light tracking-tight md:text-6xl">
                    Your workspace is private. Your business stays yours.
                  </h2>
                  <p className="mt-6 max-w-2xl text-base leading-8 text-purple-100">
                    Once you sign in, your creator workspace becomes the place
                    where your clients, projects, financial records and
                    production workflow live. It is separate from this public
                    platform homepage.
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl bg-white/10 p-5 backdrop-blur">
                  {[
                    "Private creator dashboard",
                    "Your clients and projects",
                    "Your quotes and invoices",
                    "Your galleries and delivery workflow",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-purple-50">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="Button Button--primary"
                >
                  Create your workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="Button Button--secondary"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING / CTA */}
        <section id="pricing" className="border-t border-slate-200 px-6 py-24 dark:border-zinc-800 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400">
              Start here
            </p>
            <h2 className="mt-5 text-4xl font-light tracking-tight md:text-6xl">
              Spend less time managing the business. Spend more time making the work.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-zinc-400">
              Explore the platform, create your account, and keep your creator
              workspace separate from the public-facing experience.
            </p>
            <div className="mt-9 flex justify-center gap-3">
              <Link
                href="/sign-up"
                className="Button Button--primary"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-10 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-medium tracking-[0.2em]">
              KIPSMTHN<span className="text-purple-600">.</span>
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
              Creative infrastructure for photographers, filmmakers and studios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="Button Button--secondary"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="Button Button--primary"
            >
              Get started
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
