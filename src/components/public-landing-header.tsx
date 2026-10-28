"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Stack as Layers3, SignIn as LogIn, SignOut as LogOut, List as Menu, X } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

const navigation = [
  { label: "Platform", href: "#platform" },
  { label: "How it works", href: "#how-it-works" },
];

export default function PublicLandingHeader() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);

  async function handleSignOut() {
    await authClient.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl dark:border-neutral-800/80 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="KIPSMTHN home" className="inline-flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
            <Layers3 className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <span className="text-sm font-bold tracking-[0.17em] text-neutral-950 dark:text-white sm:text-base">KIPSMTHN</span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm font-medium text-neutral-500 transition hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {!isPending && isSignedIn ? (
            <>
              <Link href="/admin" className="text-sm font-medium text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white">Open workspace</Link>
              <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          ) : !isPending ? (
            <>
              <Link href="/sign-in" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/sign-up" className="group inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </>
          ) : (
            <div className="h-10 w-36 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-900" />
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!isPending && !isSignedIn && (
            <Link href="/sign-in" className="rounded-lg px-2 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Sign in</Link>
          )}
          {!isPending && isSignedIn && (
            <Link href="/admin" className="rounded-lg px-2 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">Workspace</Link>
          )}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-200 bg-white px-5 py-4 dark:border-neutral-800 dark:bg-neutral-950 md:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1">
            {navigation.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-900">
                {item.label}
              </Link>
            ))}
            {!isPending && isSignedIn ? (
              <button type="button" onClick={handleSignOut} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-3 text-left text-sm font-medium dark:border-neutral-800">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            ) : !isPending ? (
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-neutral-950">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </nav>
        </div>
      )}
    </header>
  );
}
