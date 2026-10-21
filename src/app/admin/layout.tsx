'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Sparkles,
  ExternalLink,
  Menu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  SplitViewProvider,
  useSplitView,
} from '@/context/SplitViewContext';

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
      { name: "Command Center", href: "/admin", icon: LayoutDashboard },
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
      { name: "Contracts", href: "/admin/contracts", icon: FileSignature },
    ],
  },
  {
    label: "Settings",
    items: [
      { name: "Account & Profile", href: "/admin/profile", icon: UserRound },
      { name: "Creator Portfolio", href: "/admin/portfolio", icon: Sparkles },
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
      className={`group relative flex min-h-10 items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-none before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-sidebar-primary"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"}`} />
        <span>{item.name}</span>
      </div>
      {badgeCount > 0 && (
        <Badge
          variant={isActive ? "secondary" : "outline"}
          className="ml-auto h-5 min-w-5 rounded-md px-1.5 text-[11px] font-medium tabular-nums"
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
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand */}
      <div className="flex h-[4.25rem] items-center border-b border-sidebar-border px-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-sm">
            K
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none tracking-tight">KIPSMTHN</span>
            <span className="text-[10px] font-normal text-muted-foreground mt-0.5">Creative OS</span>
          </div>
          <Badge variant="secondary" className="ml-auto shrink-0 rounded-md border border-sidebar-border bg-background/60 px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
            v2.0
          </Badge>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-6">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="px-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-sidebar-foreground/45">
              {section.label}
            </p>
            <div className="space-y-1">
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
      <div className="space-y-2 border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between rounded-lg px-2 py-2">
          <Link
            href="/"
            className="flex min-h-9 items-center gap-2 rounded-md px-2 text-xs font-medium text-sidebar-foreground/65 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { content: splitViewContent } = useSplitView();
  const { data: session, isPending: authPending } = authClient.useSession();
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const bootstrapStarted = useRef(false);

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
    if (
      authPending ||
      !localAuthBypass ||
      session?.user ||
      bootstrapStarted.current
    ) {
      return;
    }

    bootstrapStarted.current = true;
    void fetch("/api/dev-auth/bootstrap", {
      method: "POST",
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          window.location.reload();
        } else {
          console.error("Local auth bootstrap failed with status:", response.status);
        }
      })
      .catch((error) => console.error("Local auth bootstrap request failed:", error));
  }, [authPending, localAuthBypass, session?.user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

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
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent pathname={pathname} badgeCounts={badgeCounts} />
      </aside>

      {/* Main Workspace Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px]">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileOpen}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
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
                  ? "Command Center"
                  : pathname.replace("/admin/", "").split("/")[0]}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Separator orientation="vertical" className="h-5 mx-1" />
            <ProfileMenu showLabel />
          </div>
        </header>

        {/* Content Body with optional SplitView */}
        <div className="flex-1 flex">
          <main
            data-admin-content
            className={`min-w-0 flex-1 ${
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