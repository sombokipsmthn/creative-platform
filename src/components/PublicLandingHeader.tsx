"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Menu, X, LogIn, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function PublicLandingHeader() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  const navItems = [
    { href: "#platform", label: "Platform" },
    { href: "#workflow", label: "Workflow" },
    { href: "#audience", label: "For Teams" },
    { href: "#benefits", label: "Benefits" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 shadow-sm"
          : "bg-transparent"
      }`}
      role="banner"
    >
      <nav className="ui-shell flex items-center justify-between h-16 lg:h-18" aria-label="Main navigation">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-[0.2em] text-slate-900 dark:text-white"
          aria-label="KIPSMTHN Home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">
            K
          </span>
          <span>KIPSMTHN</span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 dark:text-zinc-400 transition-colors hover:text-primary dark:hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>

          {!isPending && isSignedIn ? (
            <>
              <Link
                href="/admin"
                className="hidden lg:inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-zinc-800 dark:text-zinc-300 transition-colors hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-zinc-800 dark:text-zinc-300 transition-colors hover:border-primary dark:hover:border-primary hover:text-primary dark:hover:text-primary"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : !isPending ? (
            <>
              <Link
                href="/sign-in"
                className="hidden lg:inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-zinc-300 transition-colors hover:text-primary dark:hover:text-primary"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign in</span>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </>
          ) : (
            <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-800" aria-hidden="true" />
          )}

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`lg:hidden transition-all duration-200 ease-in-out overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 px-3 text-base font-medium text-slate-700 dark:text-zinc-300 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-primary dark:hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-slate-200 dark:border-zinc-800 my-4" />
          <ThemeToggle compact />
          {!isPending && isSignedIn ? (
            <>
              <Link
                href="/admin"
                className="block py-3 px-3 text-base font-medium text-slate-700 dark:text-zinc-300 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left py-3 px-3 text-base font-medium text-slate-700 dark:text-zinc-300 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-3"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : !isPending ? (
            <>
              <Link
                href="/sign-in"
                className="block py-3 px-3 text-base font-medium text-slate-700 dark:text-zinc-300 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="h-5 w-5" aria-hidden="true" />
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="block py-3 px-3 text-base font-medium text-white rounded-lg bg-primary transition-colors hover:bg-primary/90 text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Get started
              </Link>
            </>
          ) : (
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-zinc-800" aria-hidden="true" />
          )}
        </div>
      </div>
    </header>
  );
}