// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = 'creator_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Client CRM', href: '/admin/clients' },
    { name: 'Gallery Builder', href: '/admin/projects' },
    { name: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans">
              KIPSMTHN<span className="text-purple-500">.</span>
            </Link>
            <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full">
              Creator: Somboriot Kipchilat
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

            <Link
              href="/"
              className="text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white transition-colors"
            >
              Public Site ↗
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-mono text-red-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 dark:border-zinc-900 py-6 px-6 max-w-7xl mx-auto flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-zinc-500">
        <p>© {new Date().getFullYear()} Kipsmthn Creator Portal</p>
        <ThemeToggle />
      </footer>
    </div>
  );
}