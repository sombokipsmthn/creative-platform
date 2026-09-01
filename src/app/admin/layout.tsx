'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

function SignOutButton({ compact = false }: { compact?: boolean }) {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => void signOut({ redirectUrl: '/' })}
      aria-label="Log out"
      className={compact ? 'admin-signout admin-signout-compact' : 'admin-signout'}
    >
      <LogOut className="admin-icon-sm" />
      {!compact && <span>Log out</span>}
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

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="os-page admin-ui admin-loading">
        <div className="admin-loading-content os-pulse">
          <span className="os-icon-box admin-loading-icon">
            <SlidersHorizontal className="admin-icon-sm" />
          </span>
          <p className="admin-eyebrow-text">Loading Creative OS</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="os-page admin-ui">
      <aside className="admin-sidebar">
        <div className="admin-brandbar">
          <Link href="/admin" className="admin-brand">
            <span className="admin-brand-mark">
              <BarChart3 className="admin-icon-sm" />
            </span>
            <span className="admin-brand-name">
              KIPSMTHN<span>.</span>
            </span>
          </Link>
        </div>

        <div className="admin-sidebar-scroll">
          <div className="admin-workspace-card">
            <div className="admin-workspace-status">
              <span className="admin-status-dot os-pulse" />
              <span>Creative OS</span>
            </div>
            <p>Command center</p>
          </div>

          <nav className="admin-nav" aria-label="Creator platform navigation">
            {sections.map((section) => (
              <div key={section.label} className="admin-nav-section">
                <p className="admin-nav-label">{section.label}</p>
                <div className="admin-nav-items">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-link${isActive ? ' is-active' : ''}`}
                      >
                        {isActive && <span className="admin-nav-active-bar" />}
                        <Icon className="admin-icon" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-appearance">
            <span>Appearance</span>
            <ThemeToggle />
          </div>
          <ProfileMenu />
          <SignOutButton />
        </div>
      </aside>

      <header className="admin-mobile-header">
        <Link href="/admin" className="admin-brand admin-brand-mobile">
          <span className="admin-brand-mark">
            <BarChart3 className="admin-icon-sm" />
          </span>
          <span className="admin-brand-name">
            KIPSMTHN<span>.</span>
          </span>
        </Link>
        <div className="admin-mobile-actions">
          <ProfileMenu />
          <SignOutButton compact />
        </div>
      </header>

      <main className="admin-main">{children}</main>
    </div>
  );
}
