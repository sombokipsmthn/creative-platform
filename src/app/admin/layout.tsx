'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname, useEffect, useState } from 'next/navigation';
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings2,
  SlidersHorizontal,
  Users,
  WalletCards,
  Bell,
  Activity,
  Search,
  Sliders,
  FileSignature,
} from 'lucide-react';

import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { SplitViewProvider, useSplitView } from '@/context/SplitViewContext';

// Try to fetch real badge counts, fallback to mock
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
  item: { name: string; href: string; icon: React.ComponentType<any> };
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

  // Fetch badge counts on mount and when pathname changes (to refresh if needed)
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
      } catch (err) {
        console.error('Failed to fetch badge counts:', err);
        if (isMounted) {
          // Keep empty counts on error
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
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-[248px] border-r border-[var(--color-border-subtle)] bg-[color-mix(in_srgb,var(--color-bg-page)_92%,transparent)] backdrop-blur-xl lg:flex lg:flex-col">
          {/* Sidebar Content */}
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
              <div className="mb-5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] px-3 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="os-pulse h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                  <span className="ui-meta uppercase">
                    Creative OS
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--color-text-primary)]">Command center</p>
              </div>

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

            {/* Promotion Banner (sticky bottom) with animation */}
            <div className="border-t border-[var(--color-border-subtle)] p-4">
              <div className="ui-card bg-[var(--color-accent)] text-white ui-fade-in">
                <div className="ui-card-content">
                  <h3 className="font-semibold mb-2">Unlock All Features</h3>
                  <p className="ui-meta mb-3">
                    Access advanced analytics, custom branding, and priority support
                  </p>
                  <Link href="/admin/settings" className="ui-button ui-button-primary w-full">
                    Go Pro Today
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance section at bottom */}
          <div className="border-t border-[var(--color-border-subtle)] p-3">
            <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--color-bg-soft)] px-3 py-2">
              <span className="ui-meta uppercase">Appearance</span>
              <ThemeToggle />
            </div>
            <ProfileMenu />
            <SignOutButton />
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border-subtle)] bg-[var(--color-header-bg)] px-4 backdrop-blur-xl lg:hidden">
          <Link href="/admin" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            KIPSMTHN<span className="text-[var(--color-accent)]">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <ProfileMenu />
            <SignOutButton compact />
          </div>
        </header>

        {/* Main Content with Split-View Container */}
        <main className="lg:pl-[248px] lg:min-h-[calc(100vh-56px)] relative">
          <div className="lg:flex lg:h-full">
            {/* Main Content */}
            <div className="lg:w-[65%] lg:pr-6">{children}</div>
            
            {/* Split-View Drawer (Persistent Right Panel) with animation */}
            <div className="lg:w-[35%] lg:border-l lg:border-[var(--color-border-subtle)] lg:bg-[var(--color-bg-page)] lg:hidden ui-fade-in">
              {/* This will be populated by individual pages that need the detail view */}
              <div className="lg:h-full lg:p-6 lg:overflow-y-auto">
                {useSplitView().content}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SplitViewProvider>
  );
}
