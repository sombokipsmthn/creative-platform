'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  FileText,
  GalleryHorizontalEnd,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings2,
  SlidersHorizontal,
  Users,
  WalletCards,
  FileSignature,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { SplitViewProvider, useSplitView } from '@/context/SplitViewContext';
import './admin.css';

async function fetchBadgeCounts(): Promise<Record<string, number>> {
  try {
    const res = await fetch('/api/badge-counts', { cache: 'no-store' });
    if (!res.ok) return {};
    return await res.json();
  } catch {
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
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition ${
        isActive
          ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]'
      }`}
    >
      {isActive && <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[var(--color-accent)]" />}
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-faint)] group-hover:text-[var(--color-text-secondary)]'}`} />
      <span>{item.name}</span>
      {badgeCount > 0 && (
        <span className="ui-badge ui-badge-accent ms-auto">{badgeCount}</span>
      )}
    </Link>
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
      { name: 'Clients', href: '/admin/clients', icon: Users },
      { name: 'Galleries', href: '/admin/galleries', icon: GalleryHorizontalEnd },
    ],
  },
  {
    label: 'Sales & Billing',
    items: [
      { name: 'Quotes', href: '/admin/quotes', icon: FileText },
      { name: 'Contracts', href: '/admin/contracts', icon: FileSignature },
      { name: 'Invoices', href: '/admin/invoices', icon: Receipt },
      { name: 'Payments', href: '/admin/payments', icon: WalletCards },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'Creator settings', href: '/admin/profile', icon: UserRound },
      { name: 'Platform settings', href: '/admin/settings', icon: Settings2 },
    ],
  },
];

function SignOutButton({ compact }: { compact?: boolean }) {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: '/admin/login' });
    router.push('/admin/login');
  };

  if (compact) {
    return (
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-[12px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text-primary)]"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign out</span>
    </button>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const isLoginPage = pathname === '/admin/login';
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});
  const [loadingBadgeCounts, setLoadingBadgeCounts] = useState(true);
  const splitView = useSplitView();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let isMounted = true;

    async function loadBadgeCounts() {
      try {
        setLoadingBadgeCounts(true);
        const counts = await fetchBadgeCounts();
        if (isMounted) {
          setBadgeCounts(counts);
        }
      } catch {
        if (isMounted) {
          setBadgeCounts({});
        }
      } finally {
        if (isMounted) {
          setLoadingBadgeCounts(false);
        }
      }
    }

    loadBadgeCounts();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, pathname]);

  if (isLoginPage) {
    return (
      <SplitViewProvider>
        <>{children}</>
      </SplitViewProvider>
    );
  }

  if (!isLoaded) {
    return (
      <SplitViewProvider>
        <div className="ui-page flex min-h-screen items-center justify-center">
          <div className="flex items-center gap-3 os-pulse">
            <span className="ui-icon-box h-8 w-8">
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </span>
            <p className="ui-meta uppercase">
              Loading Creative OS
            </p>
          </div>
        </div>
      </SplitViewProvider>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <SplitViewProvider>
      <div className="ui-page min-h-screen text-[var(--color-text-primary)] relative">
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[248px] border-r border-[var(--color-border-subtle)] bg-[color-mix(in_srgb,var(--color-bg-page)_92%,transparent)] backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex h-[calc(100%-3rem)] flex-col">
            <div className="flex h-16 items-center border-b border-[var(--color-border-subtle)] px-5">
              <Link href="/admin" className="group flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white shadow-lg shadow-purple-500/10">
                  <BarChart3 className="h-3.5 w-3.5" />
                </span>
                <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
                  KIPSMTHN<span className="text-[var(--color-accent)]">.</span>
                </span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
              <nav className="space-y-6 flex-1" aria-label="Creator platform navigation">
                {sections.map((section) => (
                  <div key={section.label}>
                    <p className="mb-2 px-3 ui-meta uppercase">
                      {section.label}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));

                        const badgeCount = loadingBadgeCounts ? 0 : (badgeCounts[item.href] ?? 0);

                        return (
                          <NavItemWithBadge
                            key={item.href}
                            item={item}
                            isActive={isActive}
                            badgeCount={badgeCount}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </aside>

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
              className={
                splitView.content
                  ? 'lg:flex lg:w-[35%] lg:border-l lg:border-[var(--color-border-subtle)] lg:bg-[var(--color-bg-page)] ui-fade-in'
                  : 'hidden'
              }
            >
              <div className="lg:h-full lg:p-6 lg:overflow-y-auto">
                {splitView.content}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SplitViewProvider>
  );
}
