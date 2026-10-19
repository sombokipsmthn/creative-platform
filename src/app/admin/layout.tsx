"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  GalleryHorizontalEnd,
  FileText,
  Receipt,
  WalletCards,
  Calendar,
  FileSignature,
  UserRound,
  Settings2,
  Menu,
  LogOut,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Separator } from "@/components/ui/Separator";
import {
  SplitViewProvider,
  useSplitView,
} from "@/context/SplitViewContext";

async function fetchBadgeCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch("/api/badge-counts", { cache: "no-store" });
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Clients", href: "/admin/clients", icon: Users },
      { name: "Projects", href: "/admin/projects", icon: FolderKanban },
      { name: "Galleries", href: "/admin/galleries", icon: GalleryHorizontalEnd },
      { name: "Quotes", href: "/admin/quotes", icon: FileText },
      { name: "Invoices", href: "/admin/invoices", icon: Receipt },
      { name: "Payments", href: "/admin/payments", icon: WalletCards },
      { name: "Calendar", href: "/admin/calendar", icon: Calendar },
      { name: "Contracts", href: "/admin/contracts", icon: FileSignature },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Creator Profile", href: "/admin/profile", icon: UserRound },
      { name: "Platform Settings", href: "/admin/settings", icon: Settings2 },
    ],
  },
];

function NavLink({
  item,
  isActive,
  badgeCount = 0,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  badgeCount?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}`} />
        <span>{item.name}</span>
      </div>
      {badgeCount > 0 && (
        <Badge
          variant={isActive ? "secondary" : "outline"}
          className="ml-auto text-[10px] px-1.5 py-0 h-4 font-mono"
        >
          {badgeCount}
        </Badge>
      )}
    </Link>
  );
}

function SidebarContent({
  pathname,
  badgeCounts,
  onNavigate,
}: {
  pathname: string;
  badgeCounts: Record<string, number>;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center  px-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex items-center gap-2.5 font-bold tracking-tight text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-mono font-bold text-primary-foreground">
            K
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">KIPSMTHN</span>
            <span className="text-[10px] font-normal text-muted-foreground mt-0.5">Creative OS</span>
          </div>
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
            v2.0
          </Badge>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/70">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                const count = badgeCounts[item.href] ?? 0;

                return (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    badgeCount={count}
                    onClick={onNavigate}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="border-t p-3 space-y-2">
        <div className="flex items-center justify-between px-2 py-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Website</span>
          </Link>
          <ThemeToggle compact />
        </div>
      </div>
    </div>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content: splitViewContent } = useSplitView();
  const { data: session } = authClient.useSession();
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keep local development bypass support
  const localAuthBypass =
    (typeof window !== "undefined" &&
      process.env.NODE_ENV === "development" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".run.app") ||
        window.location.hostname.includes("aistudio")) &&
      document.cookie.includes("local-auth-bypass=1")) ||
    (typeof window === "undefined" &&
      process.env.NODE_ENV === "development" &&
      pathname.startsWith("/admin"));

  const isAuthenticated = localAuthBypass || Boolean(session?.user);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    fetchBadgeCounts().then((counts) => {
      if (!cancelled) setBadgeCounts(counts);
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-30 border-r bg-card">
        <SidebarContent pathname={pathname} badgeCounts={badgeCounts} />
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between  bg-background/95 backdrop-blur px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-card">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent
                  pathname={pathname}
                  badgeCounts={badgeCounts}
                  onNavigate={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb Section Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Creative Platform</span>
              <span>/</span>
              <span className="capitalize">
                {pathname === "/admin"
                  ? "Dashboard"
                  : pathname.replace("/admin/", "").split("/")[0]}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Link href="/admin/settings" title="Settings">
                <Settings2 className="h-4 w-4" />
                <span className="sr-only">Settings</span>
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <ProfileMenu showLabel />
          </div>
        </header>

        {/* Content Body with optional SplitView */}
        <div className="flex-1 flex">
          <main
            data-admin-content
            className={`flex-1 min-w-0 ${
              splitViewContent ? "lg:w-[65%]" : "w-full"
            }`}
          >
            {children}
          </main>

          {splitViewContent && (
            <aside className="hidden lg:block lg:w-[35%] border-l bg-card p-6 overflow-y-auto">
              {splitViewContent}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SplitViewProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SplitViewProvider>
  );
}
