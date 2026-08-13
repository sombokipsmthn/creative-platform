// src/app/admin/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useCreator } from '@/context/CreatorContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { activeUser, logoutUser } = useCreator();
  const pathname = usePathname();
<<<<<<< HEAD
=======
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
>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

<<<<<<< HEAD
=======
  // 💡 Redirect to login if logged out and trying to access admin pages
  if (!activeUser && typeof window !== 'undefined') {
    router.push('/admin/login');
    return null;
  }

  const handleLogout = () => {
    logoutUser();
    router.push('/admin/login');
  };

>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047
  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Client CRM', href: '/admin/clients' },
    { name: 'Gallery Builder', href: '/admin/projects' },
    { name: 'Expenses', href: '/admin/expenses' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <header className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <Link href="/admin" className="text-sm font-bold tracking-wider text-slate-900 dark:text-white uppercase font-sans">
            KIPSMTHN<span className="text-purple-500">.</span>
          </Link>

<<<<<<< HEAD
            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

            {/* Public Site Link */}
            <Link
              href="/"
              className="text-xs font-mono text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-white transition-colors"
            >
              Public Site ↗
            </Link>

            <UserButton />
=======
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047
          </nav>

          {/* Active User Dropdown */}
          {activeUser && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full hover:border-purple-500 transition-all cursor-pointer"
              >
                <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-purple-400/50">
                  <Image src={activeUser.avatarUrl} alt={activeUser.name} fill className="object-cover" unoptimized />
                </div>
                <span className="text-slate-800 dark:text-zinc-200 text-xs font-mono font-medium">{activeUser.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">▼</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 space-y-1 text-xs font-mono">
                  <div className="p-3 border-b border-slate-100 dark:border-zinc-900 space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">{activeUser.name}</p>
                    <p className="text-[10px] text-purple-600 dark:text-purple-400">{activeUser.email}</p>
                  </div>

                  <Link href="/admin/profile" onClick={() => setIsDropdownOpen(false)} className="block p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl">👤 Creator Profile</Link>
                  <Link href="/admin/settings" onClick={() => setIsDropdownOpen(false)} className="block p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl">⚙️ Settings</Link>
                  <Link href="/" target="_blank" onClick={() => setIsDropdownOpen(false)} className="block p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl">🌐 Public Site ↗</Link>

                  <div className="border-t border-slate-100 dark:border-zinc-900 pt-1">
                    <button onClick={handleLogout} className="w-full text-left p-2.5 hover:bg-red-50 text-red-600 rounded-xl">🚪 Logout</button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 dark:border-zinc-900 py-6 px-6 max-w-7xl mx-auto flex justify-between items-center text-[11px] font-mono text-slate-500">
        <p>© {new Date().getFullYear()} Kipsmthn Creator Portal</p>
        <ThemeToggle />
      </footer>
    </div>
  );
}
