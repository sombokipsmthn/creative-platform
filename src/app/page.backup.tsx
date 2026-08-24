
"use client";

import Link from "next/link";
import Image from "next/image";

import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { useCreator } from "@/context/CreatorContext";

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
  const { activeUser, loading } = useCreator();

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
        <Header />

        <main className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />

            <p className="mt-5 text-sm text-slate-500 dark:text-zinc-400">
              Loading creator profile...
            </p>
          </div>
        </main>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * LOGGED-IN CREATOR EXPERIENCE
   * -------------------------------------------------------
   */

  if (activeUser) {
    const profile = activeUser.profile;

    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
        <Header />

        {/* CREATOR HERO */}
        <section className="relative overflow-hidden pt-32 pb-20 px-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 text-xs font-medium tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />

                  {activeUser.handle
                    ? `@${activeUser.handle}`
                    : "Active Creator"}
                </div>

                <div className="space-y-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                    Active Creator
                  </p>

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] text-slate-950 dark:text-white">
                    {activeUser.name}
                  </h1>

                  <p className="max-w-xl text-base md:text-lg leading-8 text-slate-600 dark:text-zinc-400">
                    {profile?.bio ||
                      "Build your creative presence, manage your clients, and deliver exceptional work from one place."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
                  >
                    Open Creator Dashboard
                  </Link>

                  {profile?.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-7 py-4 rounded-full border border-slate-200 dark:border-zinc-800 text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-colors"
                    >
                      Visit Website ↗
                    </a>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-square max-w-xl mx-auto rounded-[2rem] overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-2xl">
                  <Image
                    src={resolveImage(
                      profile?.avatarUrl
                    )}
                    alt={activeUser.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />

                  <div className="absolute bottom-0 inset-x-0 p-8">
                    {profile?.location && (
                      <p className="text-xs uppercase tracking-[0.2em] text-purple-300 mb-2">
                        {profile.location}
                      </p>
                    )}

                    <h2 className="text-3xl md:text-4xl font-light text-white">
                      {activeUser.name}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CREATOR PROFILE */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-[2rem] border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-8 md:p-14">
              <div className="grid md:grid-cols-2 gap-14 items-center">
                <div className="space-y-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                    Your Profile
                  </p>

                  <h2 className="text-4xl md:text-6xl font-light tracking-tight">
                    Your creative business starts here.
                  </h2>

                  <p className="text-base leading-8 text-slate-600 dark:text-zinc-400">
                    {profile?.bio ||
                      "Complete your creator profile so clients can understand who you are, what you do, and where you work."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/admin"
                      className="inline-flex px-6 py-3 rounded-full bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                      Edit Profile
                    </Link>

                    {profile?.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex px-6 py-3 rounded-full border border-slate-300 dark:border-zinc-700 text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-colors"
                      >
                        Website ↗
                      </a>
                    )}
                  </div>
                </div>

                <div className="relative aspect-square max-w-md w-full mx-auto rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-zinc-800">
                  <Image
                    src={resolveImage(
                      profile?.avatarUrl
                    )}
                    alt={activeUser.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW */}
        <section className="py-24 px-6 border-t border-slate-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                Workflow
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-light tracking-tight">
                From first contact to final delivery.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-slate-200 dark:border-zinc-800 p-7"
                >
                  <span className="text-xs font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                    {item.step}
                  </span>

                  <h3 className="mt-6 text-2xl font-light">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-zinc-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLATFORM FEATURES */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                Creative Platform
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-light tracking-tight">
                Everything your creative business needs.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map(
                (feature) => (
                  <div
                    key={feature.number}
                    className="group rounded-[1.5rem] border border-slate-200 dark:border-zinc-800 p-7 hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
                  >
                    <span className="text-xs font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                      {feature.number}
                    </span>

                    <h3 className="mt-8 text-2xl font-light">
                      {feature.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* ACCOUNT */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-[2rem] bg-purple-600 text-white p-8 md:p-14">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.25em] text-purple-200 font-semibold">
                  Creator Account
                </p>

                <h2 className="mt-4 text-4xl md:text-6xl font-light tracking-tight">
                  {activeUser.name}
                </h2>

                <p className="mt-5 text-purple-100 leading-7">
                  {activeUser.email}
                </p>

                {profile?.location && (
                  <p className="mt-2 text-purple-200 text-sm">
                    {profile.location}
                  </p>
                )}

                <Link
                  href="/admin"
                  className="inline-flex mt-8 px-7 py-3 rounded-full bg-white text-purple-700 text-sm font-semibold hover:bg-purple-50 transition-colors"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CREATOR FOOTER */}
        <footer className="border-t border-slate-200 dark:border-zinc-800 px-6 py-10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6 items-center">
            <div>
              <p className="text-xl font-medium">
                {activeUser.handle ||
                  activeUser.name}

                <span className="text-purple-600">
                  .
                </span>
              </p>

              <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                {activeUser.email}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/portal"
                className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-zinc-800 text-xs"
              >
                Client Portal
              </Link>

              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs"
              >
                Dashboard
              </Link>

              <ThemeToggle />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * PUBLIC PLATFORM LANDING PAGE
   * -------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <Header />

      <main>
        <section className="relative overflow-hidden pt-32 pb-24 px-6">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-purple-600/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 font-semibold">
              Creative Business Platform
            </p>

            <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] max-w-5xl mx-auto">
              Your creative work.
              <br />
              <span className="text-purple-600">
                Your business.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl mx-auto text-base md:text-lg leading-8 text-slate-600 dark:text-zinc-400">
              Build your portfolio, manage clients, create
              professional quotes, and deliver creative work
              from one focused platform.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex px-7 py-4 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Create Creator Account
              </Link>

              <Link
                href="/sign-in"
                className="inline-flex px-7 py-4 rounded-full border border-slate-200 dark:border-zinc-800 text-sm font-medium hover:border-purple-400 hover:text-purple-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-6 border-t border-slate-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                How it works
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-light tracking-tight">
                One workflow for the whole creative business.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-slate-200 dark:border-zinc-800 p-7"
                >
                  <span className="text-xs font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                    {item.step}
                  </span>

                  <h3 className="mt-8 text-2xl font-light">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-zinc-400">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-2xl mb-14">
              <p className="text-xs uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
                Platform
              </p>

              <h2 className="mt-4 text-4xl md:text-6xl font-light tracking-tight">
                Built around how creators actually work.
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platformFeatures.map(
                (feature) => (
                  <div
                    key={feature.number}
                    className="rounded-[1.5rem] border border-slate-200 dark:border-zinc-800 p-7"
                  >
                    <span className="text-xs font-semibold tracking-[0.2em] text-purple-600 dark:text-purple-400">
                      {feature.number}
                    </span>

                    <h3 className="mt-8 text-2xl font-light">
                      {feature.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-zinc-400">
                      {feature.description}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-zinc-800 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6 items-center">
          <div>
            <p className="text-xl font-medium">
              Creative Platform
              <span className="text-purple-600">
                .
              </span>
            </p>

            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
              A focused operating system for creative businesses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-5 py-2.5 rounded-full border border-slate-200 dark:border-zinc-800 text-xs"
            >
              Sign In
            </Link>

            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-xs"
            >
              Get Started
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}
