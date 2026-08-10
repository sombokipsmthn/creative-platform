// src/components/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoggedIn =
    typeof document !== 'undefined' &&
    document.cookie.split(';').some((c) => c.trim().startsWith('creator_session=authenticated'));

  const navItems = [
    { name: 'Work', href: '/work' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800/80 transition-colors duration-300 bg-white/85 dark:bg-[#09090b]/85">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* 1. Brand Logo + Conditional Creator Sub-Text */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="text-xl font-bold tracking-wider text-slate-900 dark:text-white font-sans uppercase">
            KIPSMTHN<span className="text-purple-500">.</span>
          </span>

          {/* 💡 Only appears when logged in as Creator */}
          {isLoggedIn && (
            <span className="text-[10px] font-mono tracking-widest text-purple-600 dark:text-purple-400 uppercase font-semibold border-l border-slate-200 dark:border-zinc-800 pl-3">
              Somboriot Kipchilat
            </span>
          )}
        </Link>

        {/* 2. Widescreen Center Links (lg:flex) */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-mono tracking-widest uppercase font-medium transition-colors ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* 3. Widescreen Action Buttons (Client Access + Creator Login/Dashboard) */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/portal"
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest font-semibold text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-600/20 dark:border dark:border-purple-500/50 dark:hover:bg-purple-600 rounded-full transition-all duration-300 shadow-sm"
          >
            Client Access
          </Link>

          <Link
            href={isLoggedIn ? '/admin' : '/admin/login'}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest font-semibold btn-secondary rounded-full transition-all duration-300"
          >
            {isLoggedIn ? 'Dashboard' : 'Creator Login'}
          </Link>
        </div>

        {/* 4. Mobile Hamburger Button */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-800 dark:text-white focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? (
              <span className="text-xl font-bold font-mono">✕</span>
            ) : (
              <span className="text-xl font-bold font-mono">☰</span>
            )}
          </button>
        </div>

      </div>

      {/* 5. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl px-6 py-6 space-y-6 shadow-2xl">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm font-mono uppercase tracking-widest py-2 border-b border-slate-100 dark:border-zinc-900 ${
                    isActive
                      ? 'text-purple-600 dark:text-purple-400 font-bold'
                      : 'text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/portal"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 text-xs font-mono uppercase tracking-widest font-semibold text-white bg-purple-600 rounded-full shadow-md"
            >
              Client Access
            </Link>

            <Link
              href={isLoggedIn ? '/admin' : '/admin/login'}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-3 text-xs font-mono uppercase tracking-widest font-semibold btn-secondary rounded-full"
            >
              {isLoggedIn ? 'Dashboard' : 'Creator Login'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}