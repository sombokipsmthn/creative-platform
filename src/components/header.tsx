"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const clientNavLinks = [
  { href: "/portal", label: "Gallery" },
];

function isLinkActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ variant = "public" }: { variant?: "public" | "client" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isClientHeader = variant === "client";
  const navLinks = isClientHeader ? clientNavLinks : publicNavLinks;
  const isSignedIn = Boolean(session?.user);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    setMobileOpen(false);
    await authClient.signOut();
    router.push("/");
  }

  function renderNavLink(link: (typeof publicNavLinks)[number], mobile = false) {
    const active = isLinkActive(pathname, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={mobile ? () => setMobileOpen(false) : undefined}
        aria-current={active ? "page" : undefined}
        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        }`}
      >
        {link.label}
      </Link>
    );
  }

  return (
    <header className="relative z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl lg:sticky lg:top-0">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href={isClientHeader ? "/portal" : "/"}
          aria-label="KIPSMTHN home"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            K
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">KIPSMTHN</span>
        </Link>

        <nav aria-label={isClientHeader ? "Client navigation" : "Main navigation"} className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => renderNavLink(link))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          {!isClientHeader && !isPending && isSignedIn && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/admin" aria-label="Open creator workspace">
                <LayoutDashboard aria-hidden="true" />
                <span>Workspace</span>
              </Link>
            </Button>
          )}
          {!isClientHeader && !isPending && !isSignedIn && (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
          {!isClientHeader && !isPending && isSignedIn && (
            <Button type="button" variant="outline" size="sm" className="hidden sm:inline-flex" onClick={handleSignOut}>
              <LogOut aria-hidden="true" />
              <span>Sign out</span>
            </Button>
          )}
          <ThemeToggle showLabel={false} />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="lg:hidden"
                aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={mobileOpen}
                aria-controls="public-mobile-navigation"
              >
                {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </Button>
            </SheetTrigger>
            <SheetContent id="public-mobile-navigation" side="right" className="w-[min(88vw,24rem)] overflow-y-auto p-0">
              <SheetHeader className="border-b border-border px-6 py-5 pr-16 text-left">
                <SheetTitle>KIPSMTHN navigation</SheetTitle>
              </SheetHeader>
              <nav aria-label={isClientHeader ? "Client navigation" : "Main navigation"} className="flex flex-col gap-1 px-4 py-5">
                {navLinks.map((link) => renderNavLink(link, true))}
                {!isClientHeader && !isPending && (
                  <div className="mt-4 grid gap-2 border-t border-border pt-4">
                    {isSignedIn ? (
                      <>
                        <Button asChild className="justify-start" onClick={() => setMobileOpen(false)}>
                          <Link href="/admin"><LayoutDashboard aria-hidden="true" />Workspace</Link>
                        </Button>
                        <Button type="button" variant="outline" className="justify-start" onClick={handleSignOut}>
                          <LogOut aria-hidden="true" />Sign out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline" className="justify-start" onClick={() => setMobileOpen(false)}>
                          <Link href="/sign-in"><LogIn aria-hidden="true" />Sign in</Link>
                        </Button>
                        <Button asChild className="justify-start" onClick={() => setMobileOpen(false)}>
                          <Link href="/sign-up"><ArrowRight aria-hidden="true" />Get started</Link>
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
