'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useCreator } from '@/context/CreatorContext';

const dashboardItems = [
  {
    name: 'Projects',
    href: '/admin/projects',
    description: 'Manage galleries, productions, and case studies.',
  },
  {
    name: 'Clients',
    href: '/admin/clients',
    description: 'Manage client profiles and relationships.',
  },
  {
    name: 'Quotes',
    href: '/admin/quotes',
    description: 'Create and manage project quotations.',
  },
  {
    name: 'Invoices',
    href: '/admin/invoices',
    description: 'Track invoices and payment status.',
  },
  {
    name: 'Equipment',
    href: '/admin/equipment',
    description: 'Manage your production equipment.',
  },
  {
    name: 'Expenses',
    href: '/admin/expenses',
    description: 'Track production and business expenses.',
  },
];

export default function AdminDashboardPage() {
  const { isLoaded, user } = useUser();
  const { activeCreator } = useCreator();

  if (!isLoaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#09090b]">
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">
          Loading Creator Portal...
        </p>
      </main>
    );
  }

  const name =
    activeCreator?.name ||
    user?.fullName ||
    user?.firstName ||
    'Creator';

  const email =
    activeCreator?.email ||
    user?.primaryEmailAddress?.emailAddress ||
    '';

  const avatar =
    activeCreator?.avatarUrl ||
    user?.imageUrl ||
    '';

  const projectCount =
    activeCreator?.projects?.length ?? 0;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">

      {/* Dashboard Header */}
      <section className="border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 font-semibold mb-3">
                Creator Dashboard
              </p>

              <h1 className="text-4xl md:text-5xl font-light text-slate-900 dark:text-white">
                Welcome back, {name.split(' ')[0]}.
              </h1>

              <p className="mt-3 text-sm text-slate-500 dark:text-zinc-500">
                Your KIPSMTHN creator management workspace.
              </p>
            </div>

            <div className="flex items-center gap-4">

              {avatar && (
                <div className="relative w-14 h-14 rounded-full overflow-hidden border border-purple-500/30">
                  <Image
                    src={avatar}
                    alt={name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium">
                  {name}
                </p>

                <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                  {email}
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Overview */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Published Projects
            </p>

            <p className="mt-3 text-4xl font-light text-slate-900 dark:text-white">
              {projectCount}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Portfolio productions
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Creator Status
            </p>

            <p className="mt-3 text-xl font-medium text-purple-600 dark:text-purple-400">
              Active
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Clerk authenticated
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Location
            </p>

            <p className="mt-3 text-xl font-light text-slate-900 dark:text-white">
              {activeCreator?.location || 'Nairobi, Kenya'}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Creator profile
            </p>
          </div>

        </div>

      </section>

      {/* Management */}
      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div className="flex items-end justify-between mb-6">

          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-600 dark:text-purple-400 font-semibold">
              Workspace
            </p>

            <h2 className="mt-1 text-2xl font-light text-slate-900 dark:text-white">
              Manage your platform
            </h2>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {dashboardItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 transition-all hover:border-purple-500/50 hover:shadow-lg"
            >

              <div className="flex items-start justify-between gap-4">

                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {item.name}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
                    {item.description}
                  </p>
                </div>

                <span className="w-9 h-9 shrink-0 rounded-full border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-sm group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all">
                  ↗
                </span>

              </div>

            </Link>
          ))}

        </div>

      </section>

      {/* Profile */}
      <section className="max-w-7xl mx-auto px-6 pb-20">

        <div className="rounded-3xl border border-purple-500/20 bg-purple-50 dark:bg-purple-950/20 p-8 md:p-10">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-semibold">
                Creator Profile
              </p>

              <h2 className="mt-2 text-2xl font-light text-slate-900 dark:text-white">
                Keep your public profile up to date.
              </h2>

              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 max-w-xl">
                Your name, bio, social links, location, and portfolio
                information power the public KIPSMTHN profile.
              </p>
            </div>

            <Link
              href="/admin/profile"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-mono uppercase tracking-widest transition-colors"
            >
              Edit Profile →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}