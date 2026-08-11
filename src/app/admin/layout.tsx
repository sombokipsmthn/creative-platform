// src/app/admin/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    document.cookie = 'creator_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/admin/login');
  };

  // 💡 CLEAN MAIN HEADER: ONLY OPERATIONAL MODULES
  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Client CRM', href: '/admin/clients' },
    { name: 'Gallery Builder', href: '/admin/projects' },
    { name: 'Expenses', href: '/admin/expenses' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      {/* Creator Top Navigation Header */}
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/admin" className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans">
            KIPSMTHN<span className="text-purple-500">.</span>
          </Link>

          {/* Main Navigation Links (Cleaned Up) */}
          <nav className="hidden md:flex items-center gap-8">
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
          </nav>

          {/* 💡 FAR RIGHT: CREATOR DROPDOWN (SETTINGS & PROFILE NESTED HERE) */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full hover:border-purple-500 transition-all cursor-pointer shadow-xs"
            >
              <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-purple-400/50">
                <Image
                  src="https://unavatar.io/linkedin/sombo09?fallback=https://github.com/sombokipsmthn.png"
                  alt="Somboriot Kipchilat"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-slate-800 dark:text-zinc-200 text-xs font-mono font-medium">
                Somboriot Kipchilat
              </span>
              <svg className="w-3 h-3 stroke-current fill-none stroke-2 text-slate-400 dark:text-zinc-500" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown Menu Drawer */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 space-y-1 text-xs font-mono">
                <div className="p-3 border-b border-slate-100 dark:border-zinc-900 space-y-0.5">
                  <p className="font-bold text-slate-900 dark:text-white">Somboriot Kipchilat</p>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400">Creator Account</p>
                </div>

                <Link
                  href="/admin/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Creator Profile</span>
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Platform Settings</span>
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>Public Portfolio ↗</span>
                </Link>

                <div className="border-t border-slate-100 dark:border-zinc-900 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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