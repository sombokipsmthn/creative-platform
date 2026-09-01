"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { useCreator } from "@/context/CreatorContext";
import { Button } from "@/components/ui/Button";

const resolveImage = (
  source?: string | null,
  fallbackUrl?: string
) => {
  if (!source) {
    return (
      fallbackUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
    );
  }

  if (
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  return `https://lh3.googleusercontent.com/d/${source}`;
};

export default function AboutPage() {
  const { activeUser } = useCreator();

  const profile = activeUser?.profile;

  const bio =
    profile?.bio ||
    "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform.";

  const location =
    profile?.location || "Nairobi, Kenya";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* HERO */}
      <section className="relative pt-36 pb-16 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          {activeUser
            ? `ABOUT ${activeUser.name}`
            : "ABOUT KIPSMTHN PLATFORM"}
        </p>

        <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto">
          {activeUser
            ? activeUser.name
            : "Multi-Creator Portfolio & Client Delivery Engine"}
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          {bio}
        </p>
      </section>

      {/* CREATOR PROFILE */}
      {!activeUser ? (
        <section className="py-12 px-6 max-w-4xl mx-auto">
          <div className="border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              No Creator Logged In
            </h2>

            <p className="text-sm text-slate-500 dark:text-zinc-500">
              Log in to your creator account to view your
              profile and portfolio information.
            </p>

            <Link
              href="/admin/login"
              className="Button Button--primary mt-4 w-full"
            >
              Creator Login →
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-mono bg-purple-600/20 text-purple-700 dark:text-purple-300 rounded-full">
                  {activeUser.name} — {location}
                </span>
              </div>

              <h2 className="text-3xl font-light text-slate-900 dark:text-white">
                About {activeUser.name}
              </h2>

              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                {bio}
              </p>

              {profile?.website && (
                <div className="mt-4">
                  <Link
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="Button Button--primary"
                  >
                    Visit Website ↗
                  </Link>
                </div>
              )}
            </div>

            <div className="relative aspect-square w-full max-w-md mx-auto rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden">
              <Image
                src={resolveImage(profile?.avatarUrl)}
                alt={activeUser.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-100 dark:bg-zinc-950 rounded-t-xl pt-16 pb-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            {activeUser?.handle || "KIPSMTHN"}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <span>{location}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
