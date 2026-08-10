// src/app/admin/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show the admin header
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
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Creator Top Navigation Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-bold tracking-wider text-white">
              SOMBO<span className="text-purple-500">.</span>
            </Link>
            <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono rounded-full">
              Creator Backend
            </span>
          </div>

          {/* Admin Links */}
          <nav className="flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive ? 'text-purple-400 font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="h-4 w-px bg-zinc-800" />

            <Link
              href="/"
              target="_blank"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Public Site ↗
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin Content */}
      <main>{children}</main>
    </div>
  );
}