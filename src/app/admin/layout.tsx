'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BriefcaseBusiness,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Settings2,
  SlidersHorizontal,
  Users,
  WalletCards,
} from 'lucide-react';

import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';

const sections = [
  {
    label: 'Workspace',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
      { name: 'Clients', href: '/admin/clients', icon: Users },
      { name: 'Projects', href: '/admin/projects', icon: FolderKanban },
    ],
  },
  {
    label: 'Business',
    items: [
      { name: 'Quotes', href: '/admin/quotes', icon: FileText },
      { name: 'Invoices', href: '/admin/invoices', icon: Receipt },
      { name: 'Expenses', href: '/admin/expenses', icon: WalletCards },
    ],
  },
  {
    label: 'Account',
    items: [
      { name: 'Profile', href: '/admin/profile', icon: BriefcaseBusiness },
      { name: 'Settings', href: '/admin/settings', icon: Settings2 },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="os-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 os-pulse">
          <span className="os-icon-box h-8 w-8">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </span>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Loading Creative OS
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="os-page min-h-screen text-[var(--text-primary)]">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[248px] border-r border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--bg-page)_92%,transparent)] backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-5">
          <Link href="/admin" className="group flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-lg shadow-purple-500/10">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <span className="text-[12px] font-bold uppercase tracking-[0.18em]">
              KIPSMTHN<span className="text-[var(--accent)]">.</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="os-pulse h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
              <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Creative OS
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-[var(--text-primary)]">Command center</p>
          </div>

          <nav className="space-y-6" aria-label="Creator platform navigation">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 font-mono text-[8px] font-semibold uppercase tracking-[0.22em] text-[var(--text-faint)]">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium transition ${
                          isActive
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                            : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {isActive && <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[var(--accent)]" />}
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-faint)] group-hover:text-[var(--text-secondary)]'}`} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-[var(--border-subtle)] p-3">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-[var(--bg-soft)] px-3 py-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--text-muted)]">Appearance</span>
            <ThemeToggle />
          </div>
          <ProfileMenu />
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--header-bg)] px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          KIPSMTHN<span className="text-[var(--accent)]">.</span>
        </Link>
        <ProfileMenu />
      </header>

      <main className="lg:pl-[248px]">{children}</main>
    </div>
  );
}
