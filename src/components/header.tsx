// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Work', href: '/work' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="text-xl font-bold tracking-wider text-white font-sans">
            Kipsmthn<span className="text-purple-500">.</span>
          </span>
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-medium hidden sm:inline-block border-l border-zinc-800 pl-3">
            Somboriot Kipchilat
          </span>
        </Link>

        {/* Navigation Links + Theme Switcher */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-mono tracking-widest uppercase font-medium transition-colors ${
                  isActive
                    ? 'text-purple-400 font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Light / Dark Mode Toggle Icon */}
          <ThemeToggle />

          {/* Client Access Portal CTA */}
          <Link
            href="/portal"
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest font-semibold text-white bg-purple-600/20 border border-purple-500/50 rounded-full hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
          >
            Client Access
          </Link>
        </nav>
      </div>
    </header>
  );
}