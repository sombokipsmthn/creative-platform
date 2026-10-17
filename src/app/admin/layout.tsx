"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  BarChart3,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  X,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import ProfileMenu from "@/components/ProfileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import {
  SplitViewProvider,
  useSplitView,
} from "@/context/SplitViewContext";

async function fetchBadgeCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch("/api/badge-counts");
    if (!res.ok) throw new Error("Failed to fetch badge counts");
    return await res.json();
  } catch (error) {
    console.error("Error fetching badge counts:", error);
    return {};
  }
}

function NavItemWithBadge({
  item,
  isActive,
  badgeCount = 0,
  onNavigate,
}: {
  item: { name: string; href: string; icon: LucideIcon };
  isActive: boolean;
  badgeCount?: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={`group relative flex h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-[var(--color-bg-muted)] font-medium text-[var(--color-text-primary)]"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[var(--color-accent)]" />
        )}
        <Icon
          className={`h-4 w-4 shrink-0 ${
            isActive
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-text-faint)] group-hover:text-[var(--color-text-secondary)]"
          }`}
        />
        <span className="min-w-0 flex-1">{item.name}</span>
        {badgeCount > 0 && (
          <span className="ui-badge ui-badge-accent">{badgeCount}</span>
        )}
      </Link>
    </li>
  );
}

const sections = [
  {
    label: "Dashboard",
    items: [{ name: "Overview", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { name: "Galleries", href: "/admin/galleries", icon: GalleryHorizontalEnd },
      { name: "Quotes", href: "/admin/quotes", icon: FileText },
      { name: "Invoices", href: "/admin/invoices", icon: FileText },
      { name: "Projects", href: "/admin/projects", icon: FileText },
      { name: "Clients", href: "/admin/clients", icon: FileText },
    ],
  },
  {
    label: "Platform settings",
    href: "/admin/settings",
    icon: Settings2,
  },
];

function SignOutButton({ compact }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
      aria-label="Sign out"
      title="Sign out"
      className={
        compact
          ? "flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-bg-muted)] px-2 hover:bg-[var(--color-bg-hover)]"
          : "flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-bg-muted)] px-3 hover:bg-[var(--color-bg-hover)]"
      }
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { content: splitViewContent } = useSplitView();
  const { data: session } = authClient.useSession();
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const [loadingBadgeCounts, setLoadingBadgeCounts] = useState(false);

  // Keep the development-only local bypass limited to local development.
  const localAuthBypass =
    (typeof window !== "undefined" &&
      process.env.NODE_ENV === "development" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1") &&
      document.cookie.includes("local-auth-bypass=1")) ||
    (typeof window === "undefined" &&
      process.env.NODE_ENV === "development" &&
      pathname.startsWith("/admin") &&
      process.env.LOCAL_AUTH_BYPASS === "true");

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
    setLoadingBadgeCounts(true);

    fetchBadgeCounts()
      .then((counts) => {
        if (!cancelled) setBadgeCounts(counts);
      })
      .finally(() => {
        if (!cancelled) setLoadingBadgeCounts(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Keep these route helpers available for the existing admin route behavior.
  const isOnboardingRoute = (route: string) =>
    route.startsWith("/admin/onboarding");
  const isAdminRoute = (route: string) => route.startsWith("/admin");

  void badgeCounts;
  void loadingBadgeCounts;
  void isOnboardingRoute;
  void isAdminRoute;
  void sections;
  void NavItemWithBadge;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] lg:flex lg:flex-col">
        <Link
          href="/admin"
          className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border-subtle)] px-6"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white">
            <BarChart3 className="h-4 w-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-text-primary)]">
            KIPSMTHN<span className="text-[var(--color-accent)]">.</span>
            <span className="mt-0.5 block text-[9px] font-medium tracking-[0.18em] text-[var(--color-text-faint)]">CREATIVE OS</span>
          </span>
        </Link>
        <nav aria-label="Dashboard navigation" className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-faint)]">{section.label}</p>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  const badgeKey = item.href === "/admin/quotes" ? "quotes"
                    : item.href === "/admin/invoices" ? "invoices"
                    : item.href === "/admin/clients" ? "clients"
                    : item.href === "/admin/galleries" ? "galleries" : "";
                  return (
                    <NavItemWithBadge
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      badgeCount={badgeKey ? badgeCounts[badgeKey] ?? 0 : 0}
                    />
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-[var(--color-border-subtle)] p-3">
          <Link
            href="/admin/settings"
            aria-current={pathname.startsWith("/admin/settings") ? "page" : undefined}
            className={`flex h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname.startsWith("/admin/settings")
                ? "bg-[var(--color-bg-muted)] font-medium text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Settings2 className="h-4 w-4 text-[var(--color-text-faint)]" />
            Platform settings
          </Link>
          <p className="px-3 pb-1 pt-4 text-[10px] text-[var(--color-text-faint)]">KIPSMTHN Creative OS</p>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-header-bg)] px-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open dashboard menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-bg-soft)]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
          href="/admin"
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          KIPSMTHN<span className="text-[var(--color-accent)]">.</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <Link
            href="/admin/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]"
            aria-label="Open settings"
            title="Platform settings"
          >
            <Settings2 className="h-4 w-4" />
          </Link>
          <span
            className="mx-1 h-6 w-px bg-[var(--color-border-subtle)]"
            aria-hidden="true"
          />
          <ProfileMenu />
          <SignOutButton compact />
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(300px,85vw)] flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-page)] shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b border-[var(--color-border-subtle)] px-5">
              <span className="text-xs font-bold uppercase tracking-[0.16em]">Dashboard menu</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close dashboard menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav aria-label="Mobile dashboard navigation" className="flex-1 overflow-y-auto px-3 py-5">
              {sections.map((section) => (
                <div key={section.label} className="mb-6">
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-faint)]">{section.label}</p>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href || pathname.startsWith(item.href + "/");
                      const badgeKey = item.href === "/admin/quotes" ? "quotes"
                        : item.href === "/admin/invoices" ? "invoices"
                        : item.href === "/admin/clients" ? "clients"
                        : item.href === "/admin/galleries" ? "galleries" : "";
                      return (
                        <NavItemWithBadge
                          key={item.href}
                          item={item}
                          isActive={isActive}
                          badgeCount={badgeKey ? badgeCounts[badgeKey] ?? 0 : 0}
                          onNavigate={() => setMobileMenuOpen(false)}
                        />
                      );
                    })}
                  </ul>
                </div>
              ))}
              <Link
                href="/admin/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-soft)]"
              >
                <Settings2 className="h-4 w-4" />
                Platform settings
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="relative lg:min-h-[calc(100vh-56px)] lg:pl-[248px]">
        <header className="hidden h-16 items-center justify-end gap-2 border-b border-[var(--color-border-subtle)] px-8 lg:flex">
          <ThemeToggle compact />
          <Link
            href="/admin/settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]"
            aria-label="Open settings"
            title="Platform settings"
          >
            <Settings2 className="h-4 w-4" />
          </Link>
          <span
            className="mx-1 h-6 w-px bg-[var(--color-border-subtle)]"
            aria-hidden="true"
          />
          <ProfileMenu showLabel />
          <SignOutButton compact />
        </header>

        <div className="lg:flex lg:h-full">
          <div
            data-admin-content
            className={
              splitViewContent ? "lg:w-[65%] lg:pr-6" : "lg:w-full"
            }
          >
            {children}
          </div>

          <div
            className={
              splitViewContent
                ? "ui-fade-in lg:flex lg:w-[35%] lg:border-l lg:border-[var(--color-border-subtle)] lg:bg-[var(--color-bg-page)]"
                : "hidden"
            }
          >
            <div className="lg:h-full lg:overflow-y-auto lg:p-6">
              {splitViewContent}
            </div>
          </div>
        </div>
      </main>
    </>
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
