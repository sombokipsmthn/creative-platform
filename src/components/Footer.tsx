import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/70 px-6 pb-8 pt-16 dark:border-zinc-800 dark:bg-zinc-950/70">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-block text-xl font-medium tracking-[0.2em]">
              KIPSMTHN<span className="text-purple-600">.</span>
            </Link>
            <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-zinc-400">
              Creative infrastructure for photographers, filmmakers, studios, and creative teams — from first enquiry to final delivery.
            </p>
            <Link href="/sign-up" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
              Create your workspace<ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-zinc-100">Platform</h2>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-500 dark:text-zinc-400">
              <Link href="#platform" className="transition hover:text-purple-600 dark:hover:text-purple-400">Features</Link>
              <Link href="#workflow" className="transition hover:text-purple-600 dark:hover:text-purple-400">Workflow</Link>
              <Link href="#work" className="transition hover:text-purple-600 dark:hover:text-purple-400">Workspace</Link>
              <Link href="#pricing" className="transition hover:text-purple-600 dark:hover:text-purple-400">Get started</Link>
            </nav>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-zinc-100">Company</h2>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-500 dark:text-zinc-400">
              <Link href="/about" className="transition hover:text-purple-600 dark:hover:text-purple-400">About</Link>
              <Link href="/services" className="transition hover:text-purple-600 dark:hover:text-purple-400">Services</Link>
              <Link href="/work" className="transition hover:text-purple-600 dark:hover:text-purple-400">Work</Link>
              <Link href="/contact" className="transition hover:text-purple-600 dark:hover:text-purple-400">Contact</Link>
            </nav>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 dark:text-zinc-100">Account</h2>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-500 dark:text-zinc-400">
              <Link href="/sign-in" className="transition hover:text-purple-600 dark:hover:text-purple-400">Sign in</Link>
              <Link href="/sign-up" className="transition hover:text-purple-600 dark:hover:text-purple-400">Create account</Link>
            </nav>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-5 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-purple-600 dark:hover:text-purple-400">Privacy</Link>
            <span>Creative Business Platform</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
