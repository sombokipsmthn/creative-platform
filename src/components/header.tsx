"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogIn, LogOut, LayoutDashboard, ArrowRight, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/workflow", label: "Workflow" },
];

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleSignOut() {
    setMobileOpen(false);
    await authClient.signOut();
    router.push("/");
  }

  return (
    <header className="relative z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:sticky lg:top-0">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-lg" className="lg:hidden" aria-label="Open navigation">
                <Menu aria-hidden="true" className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(88vw,24rem)] overflow-y-auto p-0">
              <SheetHeader className="border-b border-border px-6 py-5 text-left">
                <SheetTitle>KIPSMTHN</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile navigation" className="flex flex-col gap-1 px-4 py-5">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 border-t border-border pt-4">
                  <Button asChild className="w-full justify-start" onClick={() => setMobileOpen(false)}>
                    <Link href="/admin">Open Studio Workspace</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">K</span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">KIPSMTHN</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {!isPending && isSignedIn ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/admin"><LayoutDashboard aria-hidden="true" /><span>Dashboard</span></Link>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleSignOut} className="hidden sm:inline-flex">
                <LogOut aria-hidden="true" /><span>Sign out</span>
              </Button>
            </>
          ) : !isPending ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-in"><LogIn aria-hidden="true" /><span>Sign in</span></Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/admin"><span>Get started</span><ArrowRight aria-hidden="true" /></Link>
              </Button>
            </>
          ) : null}
          <ThemeToggle showLabel={false} />
        </div>
      </div>
    </header>
  );
}
