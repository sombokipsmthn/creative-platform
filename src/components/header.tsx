"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogIn, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);

  useEffect(() => {}, [session]);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="ui-header"><div className="ui-shell"><nav className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-6 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70">
      <Link href="/" className="ui-logo text-lg font-semibold tracking-[0.35em] text-slate-900 dark:text-white">KIPSMTHN</Link>
      <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 dark:text-zinc-400 md:flex"><Link href="/#platform" className="ui-nav-link transition hover:text-purple-600">Platform</Link><Link href="/#workflow" className="ui-nav-link transition hover:text-purple-600">Workflow</Link><Link href="/#work" className="ui-nav-link transition hover:text-purple-600">Work</Link><Link href="/#pricing" className="ui-nav-link transition hover:text-purple-600">Pricing</Link></div>
      <div className="flex items-center gap-3">
        {!isPending && isSignedIn ? <><Link href="/admin" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium sm:inline-flex">Dashboard</Link><button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium" aria-label="Sign out"><LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sign out</span></button></> : !isPending ? <><Link href="/sign-in" className="inline-flex items-center gap-2 text-sm font-medium"><LogIn className="h-3.5 w-3.5 sm:hidden" /><span>Sign in</span></Link><Link href="/sign-up"><Button variant="primary" size="sm">Get started</Button></Link></> : <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-zinc-800" />}
        <ThemeToggle />
      </div>
    </nav></div></header>
  );
}
