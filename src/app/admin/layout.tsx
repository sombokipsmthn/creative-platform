// src/app/admin/layout.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';

import ThemeToggle from '@/components/ThemeToggle';
import { useCreator } from '@/context/CreatorContext';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeUser, logoutUser } = useCreator();

  const pathname = usePathname();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);


  // Allow login page without auth
  const isLoginPage = pathname === '/admin/login';


  // Redirect after render (fixes React error)
  useEffect(() => {
    if (!activeUser && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [activeUser, isLoginPage, router]);


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );

  }, []);


  if (isLoginPage) {
    return <>{children}</>;
  }


  if (!activeUser) {
    return null;
  }


  function handleLogout() {
    logoutUser();
    router.push('/admin/login');
  }


  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
    },
    {
      name: 'Clients',
      href: '/admin/clients',
    },
    {
      name: 'Invoices',
      href: '/admin/invoices',
    },
    {
      name: 'Quotes',
      href: '/admin/quotes',
    },
    {
      name: 'Equipment',
      href: '/admin/equipment',
    },
    {
      name: 'Projects',
      href: '/admin/projects',
    },
    {
      name: 'Settings',
      href: '/admin/settings',
    },
  ];


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">

      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">


          {/* Logo */}
          <Link
            href="/admin"
            className="text-sm font-bold tracking-widest uppercase"
          >
            KIPSMTHN
            <span className="text-purple-500">
              .
            </span>
          </Link>



          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-6">

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs font-mono uppercase tracking-widest transition ${
                  pathname === item.href
                    ? 'text-purple-600 font-bold'
                    : 'text-slate-500 hover:text-purple-600'
                }`}
              >
                {item.name}
              </Link>
            ))}


            <span className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />


            <Link
              href="/"
              className="text-xs font-mono text-slate-500 hover:text-purple-600"
            >
              Public Site ↗
            </Link>


            <UserButton />

          </nav>



          {/* User Dropdown */}
          <div
            className="relative"
            ref={dropdownRef}
          >

            <button
              onClick={() =>
                setIsDropdownOpen(!isDropdownOpen)
              }
              className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
            >

              <div className="relative w-6 h-6 rounded-full overflow-hidden">

                <Image
                  src={activeUser.avatarUrl}
                  alt={activeUser.name}
                  fill
                  className="object-cover"
                  unoptimized
                />

              </div>


              <span className="text-xs font-mono hidden sm:block">
                {activeUser.name}
              </span>

              <span className="text-xs">
                ▼
              </span>

            </button>



            {isDropdownOpen && (

              <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl p-3">


                <p className="font-bold text-sm">
                  {activeUser.name}
                </p>


                <p className="text-xs text-purple-600 mb-3">
                  {activeUser.email}
                </p>


                <Link
                  href="/admin/profile"
                  className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs"
                >
                  Profile
                </Link>


                <Link
                  href="/admin/settings"
                  className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-xs"
                >
                  Settings
                </Link>


                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-xs"
                >
                  Logout
                </button>


              </div>

            )}

          </div>


        </div>

      </header>



      <main>
        {children}
      </main>



      <footer className="border-t border-slate-200 dark:border-zinc-900 py-6 px-6 mt-10 flex justify-between text-xs font-mono text-slate-500">

        <span>
          © {new Date().getFullYear()} KIPSMTHN Creator Portal
        </span>

        <ThemeToggle />

      </footer>


    </div>
  );
}