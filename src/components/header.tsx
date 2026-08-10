// src/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Work', href: '/work' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-white">
            SOMBO<span className="text-purple-600">.</span>
          </span>
          <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-medium hidden sm:inline-block">
            / kipsmthn
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm tracking-wider uppercase font-medium transition-colors ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Direct Client Access Portal CTA */}
          <Link
            href="/portal"
            className="px-4 py-2 text-xs uppercase tracking-widest font-semibold text-white bg-purple-600/20 border border-purple-600/50 rounded-full hover:bg-purple-600 hover:border-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.2)]"
          >
            Client Access
          </Link>
        </nav>
      </div>
    </header>
  );
}