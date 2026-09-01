"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { LogIn, LogOut } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const { isLoaded, isSignedIn, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 pt-5">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
          {/* LOGO */}
          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.35em] text-slate-900 dark:text-white"
          >
            KIPSMTHN
          </Link>

          {/* PUBLIC NAVIGATION */}
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 dark:text-zinc-400 md:flex">
            <Link href="/#platform" className="transition hover:text-purple-600">
              Platform
            </Link>
            <Link href="/#workflow" className="transition hover:text-purple-600">
              Workflow
            </Link>
            <Link href="/#work" className="transition hover:text-purple-600">
              Work
            </Link>
            <Link href="/#pricing" className="transition hover:text-purple-600">
              Pricing
            </Link>
          </div>

          {/* AUTH + THEME */}
          <div className="flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <>
                <Link
                  href="/admin"
                  className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-600 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-purple-800 dark:hover:text-purple-400 sm:inline-flex"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-300 hover:text-red-600 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-red-900 dark:hover:text-red-400"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : isLoaded ? (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-purple-600 dark:text-zinc-300 dark:hover:text-purple-400"
                >
                  <LogIn className="h-3.5 w-3.5 sm:hidden" />
                  <span>Sign in</span>
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700"
                >
                  Get started
                </Link>
              </>
            ) : (
              <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-800" />
            )}

            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
