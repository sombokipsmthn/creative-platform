
"use client";

import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { useCreator } from "@/context/CreatorContext";

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

        <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
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
        <section className="py-16 px-6 max-w-4xl mx-auto text-center">
          <div className="p-12 border-2 border-dashed border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl space-y-4">
            <h2 className="text-xl font-medium text-slate-900 dark:text-white">
              No Creator Logged In
            </h2>

            <p className="text-xs text-slate-500 font-mono">
              Log in to your creator account to view your
              profile and portfolio information.
            </p>

            <Link
              href="/admin/login"
              className="inline-block px-6 py-3 btn-primary text-xs font-mono uppercase tracking-widest rounded-full"
            >
              Creator Login →
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-12 px-6 max-w-7xl mx-auto">
          <div className="relative border border-slate-200 dark:border-zinc-800 bg-linear-to-r from-purple-100/80 via-slate-50 to-white dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-zinc-950 rounded-3xl p-8 md:p-16 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-flex px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold">
                {activeUser.name} — {location}
              </span>

              <h2 className="text-3xl md:text-5xl font-light text-slate-900 dark:text-white leading-tight">
                About {activeUser.name}
              </h2>

              <p className="text-sm text-slate-700 dark:text-zinc-300 font-light leading-relaxed">
                {bio}
              </p>

              {profile?.website && (
                <div className="pt-2">
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full"
                  >
                    Visit Website ↗
                  </a>
                </div>
              )}
            </div>

            <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
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
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6 mt-16">
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
