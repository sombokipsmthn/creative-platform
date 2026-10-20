'use client';

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  BarChart3,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  Settings2,
  LogOut,
} from "lucide-react";

import type { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { SplitViewProvider, useSplitView } from "@/context/SplitViewContext";

async function fetchBadgeCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/badge-counts');
    if (!res.ok) throw new Error('Failed to fetch badge counts');
    return await res.json();
  } catch (error) {
    console.error('Error fetching badge counts:', error);
    return {};
  }
}

function NavItemWithBadge({
  item,
  isActive,
  badgeCount = 0,
}: {
  item: { name: string; href: string; icon: LucideIcon };
  isActive: boolean;
  badgeCount?: number;
}) {
  return (
    <li className="flex h-10 w-full items-center gap-3 px-3 py-2 rounded-md">
      {isActive && <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[var(--color-accent)]" />}
      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-faint)] group-hover:text-[var(--color-text-secondary)]'}`} />
      <span>{item.name}</span>
      {badgeCount > 0 && (
        <Badge variant="default" className="ms-auto">{badgeCount}</Badge>
      )}
    </li>
  );
}

const sections = [
  {
    label: 'Dashboard',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Galleries', href: '/admin/galleries', icon: GalleryHorizontalEnd },
      { name: 'Quotes', href: '/admin/quotes', icon: FileText },
      { name: 'Invoices', href: '/admin/invoices', icon: FileText },
      { name: 'Projects', href: '/admin/projects', icon: FileText },
      { name: 'Clients', href: '/admin/clients', icon: FileText },
    ],
  },
  {
    label: 'Platform settings',
    href: '/admin/settings',
    icon: Settings2,
  },
];

function SignOutButton({ compact }: { compact?: boolean }) {
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        window.location.href = '/';
      }}
      className={compact
        ? 'h-8 w-8 flex items-center justify-center rounded-md bg-[var(--color-bg-muted)] px-2 hover:bg-[var(--color-bg-hover)]'
        : 'flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-bg-muted)] px-3 hover:bg-[var(--color-bg-hover)]'
      }
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const splitView = useSplitView();
  const { data: session, isPending: authPending } = authClient.useSession();
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const [loadingBadgeCounts, setLoadingBadgeCounts] = useState(false);

  // During SSR, document.cookie is not available, so we check if we SHOULD have the bypass cookie
  // based on environment and route. During client, we check the actual cookie.
  const localAuthBypass =
    (typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      document.cookie.includes('local-auth-bypass=1')) ||
    // During SSR, assume we have the bypass cookie if we're on an admin route in dev mode
    (typeof window === 'undefined' &&
      process.env.NODE_ENV === 'development' &&
      pathname.startsWith('/admin') &&
      process.env.LOCAL_AUTH_BYPASS === 'true');

  // Check localAuthBypass first (for dev bypass), then fall back to session auth
  const isAuthenticated = localAuthBypass || Boolean(session?.user);

  useEffect(() => {
    if (isAuthenticated) {
      setLoadingBadgeCounts(true);
      fetchBadgeCounts()
        .then(setBadgeCounts)
        .finally(() => setLoadingBadgeCounts(false));
    }
  }, [isAuthenticated]);

  const isOnboardingRoute = (pathname: string) =>
    pathname.startsWith('/admin/onboarding');

  const isAdminRoute = (pathname: string) => pathname.startsWith('/admin');

  return (
      <>
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-header-bg)] px-4 backdrop-blur-xl lg:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            KIPSMTHN<span className="text-[var(--color-accent)]">.</span>
          </Link>
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
            <span className="mx-1 h-6 w-px bg-[var(--color-border-subtle)]" aria-hidden="true" />
            <ProfileMenu />
            <SignOutButton compact />
          </div>
        </header>

        <main className="lg:pl-[248px] lg:min-h-[calc(100vh-56px)] relative">
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
            <span className="mx-1 h-6 w-px bg-[var(--color-border-subtle)]" aria-hidden="true" />
            <ProfileMenu showLabel />
            <SignOutButton compact />
          </header>
          <div className="lg:flex lg:h-full">
            <div
              data-admin-content
              className={splitView.content ? 'lg:w-[65%] lg:pr-6' : 'lg:w-full'}
            >
              {children}
            </div>

            <div
              className={splitView.content
                ? 'lg:flex lg:w-[35%] lg:border-l lg:border-[var(--color-border-subtle)] lg:bg-[var(--color-bg-page)] animate-fade-in'
                : 'hidden'}
            >
              <div className="lg:h-full lg:p-6 lg:overflow-y-auto">
                {splitView.content}
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