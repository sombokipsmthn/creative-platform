// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Client CRM', href: '/admin/clients' },
    { name: 'Gallery Builder', href: '/admin/projects' },
    { name: 'Expenses', href: '/admin/expenses' },
    { name: 'Settings', href: '/admin/settings' },
    { name: 'Profile', href: '/admin/profile' }, // 👈 Added Profile link
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      {/* Creator Top Navigation Header */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Direct Link to Creator Profile */}
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans">
              KIPSMTHN<span className="text-purple-500">.</span>
            </Link>

            <Link
              href="/admin/profile"
              className="flex items-center gap-2 px-2.5 py-1 bg-purple-600/10 dark:bg-purple-600/20 border border-purple-500/30 dark:border-purple-500/40 rounded-full hover:border-purple-500 transition-all cursor-pointer group"
            >
              <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-purple-400/50">
                <Image
                  src="https://unavatar.io/linkedin/sombo09?fallback=https://github.com/sombokipsmthn.png"
                  alt="Somboriot Kipchilat Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-purple-700 dark:text-purple-300 text-[10px] font-mono font-semibold group-hover:underline">
                Creator: Somboriot Kipchilat 👤
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'text-purple-600 dark:text-purple-400 font-bold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

            {/* Public Site Link */}
            <Link
              href="/"
              className="text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white transition-colors"
            >
              Public Site ↗
            </Link>

            <UserButton />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main>{children}</main>

      {/* Admin Footer */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 py-6 px-6 max-w-7xl mx-auto flex justify-between items-center text-[11px] font-mono text-slate-500 dark:text-zinc-500">
        <p>© {new Date().getFullYear()} Kipsmthn Creator Portal</p>
        <ThemeToggle />
      </footer>
    </div>
  );
}
