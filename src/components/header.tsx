"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogIn, LogOut, LayoutDashboard, ArrowRight, Menu } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/Sheet";

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
  }

  const navLinks = [
    { href: "/#platform", label: "Platform" },
    { href: "/#workflow", label: "Workflow" },
    { href: "/services", label: "Services" },
    { href: "/equipment", label: "Equipment" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {/* Mobile Sheet Navigation */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <SheetHeader>
                <SheetTitle className="text-left font-bold tracking-tight">
                  KIPSMTHN
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-2 flex flex-col gap-2">
                  <Button asChild size="sm" onClick={() => setMobileOpen(false)}>
                    <Link href="/admin">Open Studio Workspace</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground font-mono">
              K
            </span>
            <span className="text-base font-semibold">KIPSMTHN</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isPending && isSignedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin" className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : !isPending ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in" className="gap-1.5">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign in</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/admin">
                  <span>Get started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </>
          ) : (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}