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
    { href: "/", label: "Home" },
    { href: "/workflow", label: "Workflow" },
  ];

  return (
    <header className="">
      <div className="">
        <div className="">
          {/* Mobile Sheet Navigation */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="">
                <Menu className="" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="">
              <SheetHeader>
                <SheetTitle className="">
                  KIPSMTHN
                </SheetTitle>
              </SheetHeader>
              <nav className="">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className=""
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="">
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
            className=""
          >
            <span className="">
              K
            </span>
            <span className="">KIPSMTHN</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className=""
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="">
          {!isPending && isSignedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin" className="">
                  <LayoutDashboard className="" />
                  <span className="hidden">Dashboard</span>
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className=""
              >
                <LogOut className="" />
                <span className="hidden">Sign out</span>
              </Button>
            </>
          ) : !isPending ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in" className="">
                  <LogIn className="" />
                  <span className="hidden">Sign in</span>
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/admin">
                  <span className="hidden">Get started</span>
                  <span className="" aria-hidden="true"><ArrowRight className="" /></span>
                </Link>
              </Button>
            </>
          ) : (
            <div className="" />
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
