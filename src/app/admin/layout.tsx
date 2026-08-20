
'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import ProfileMenu from '@/components/ProfileMenu';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useUser();

  const isLoginPage = pathname === '/admin/login';

  // Let the login page render without the admin shell.
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Clerk is still loading the session.
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Loading Creator Portal...
        </p>
      </div>
    );
  }

  // Middleware normally handles this redirect.
  // This is just a client-side fallback.
  if (!isSignedIn) {
    return null;
  }

  const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Clients', href: '/admin/clients' }, 
  { name: 'Quotes', href: '/admin/quotes' },
  { name: 'Invoices', href: '/admin/invoices' },
  { name: 'Projects', href: '/admin/projects' },
];


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/admin"
            className="shrink-0 text-sm font-bold tracking-widest uppercase"
          >
            KIPSMTHN<span className="text-purple-500">.</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-mono uppercase tracking-widest transition ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                      : 'text-slate-500 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <span className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

            <ProfileMenu />
          </nav>

          {/* Mobile profile menu */}
          <div className="lg:hidden">
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 dark:border-zinc-900 py-6 px-6 mt-10 flex justify-between items-center text-xs font-mono text-slate-500">
        <span>
          © {new Date().getFullYear()} KIPSMTHN Creator Portal
        </span>

        <ThemeToggle />
      </footer>
    </div>
  );
}
