'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { AlertCircle, ArrowUpRight, BriefcaseBusiness, CheckCircle2, Clock3, FileCheck2, FileText, GalleryHorizontalEnd, Receipt, RefreshCw, Users, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCreator } from '@/context/CreatorContext';

type Range = '7d' | '30d' | '90d' | '12m' | 'all';
type DashboardStats = {
  range: Range;
  overview: { clients: number; newClients: number; activeClients: number; projects: number; newProjects: number; activeProjects: number; completedProjects: number; quotes: number; newQuotes: number; invoices: number; newInvoices: number; galleries: number; newGalleries: number };
  finance: { periodQuotedValue: number; acceptedQuoteValue: number; periodInvoicedValue: number; periodPaidValue: number; overdueInvoices: number };
  quotes: { statuses: Record<string, number>; conversionRate: number };
  invoices: { statuses: Record<string, number> };
  galleries: { statuses: Record<string, number> };
  attention: { overdueInvoices: number; pendingQuotes: number; activeProjects: number; activeGalleries: number };
  activity: Array<{ id: string; type: 'client' | 'project' | 'quote' | 'invoice' | 'gallery'; title: string; description: string; date: string }>;
};

const ranges: Array<{ value: Range; label: string }> = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '12m', label: '12 Months' },
  { value: 'all', label: 'All Time' },
];

const rangeLabels: Record<Range, string> = { '7d': 'last 7 days', '30d': 'last 30 days', '90d': 'last 90 days', '12m': 'last 12 months', all: 'all time' };

function formatNumber(value: number) { return new Intl.NumberFormat('en-US').format(value); }
function formatMoney(value: number) { return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value); }
function formatDate(value: string) { return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value)); }

function getActivityIcon(type: DashboardStats['activity'][number]['type']) {
  const className = 'h-4 w-4';
  switch (type) {
    case 'client': return <Users className={className} />;
    case 'project': return <BriefcaseBusiness className={className} />;
    case 'quote': return <FileText className={className} />;
    case 'invoice': return <Receipt className={className} />;
    case 'gallery': return <GalleryHorizontalEnd className={className} />;
  }
}

function StatCard({ label, value, detail, href, icon }: { label: string; value: string; detail: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start justify-between gap-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">{icon}</div><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-purple-500" /></div>
      <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">{detail}</p>
    </Link>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"><div className="border-b border-slate-100 px-5 py-4 dark:border-zinc-900">{eyebrow && <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400">{eyebrow}</p>}<h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{title}</h2></div>{children}</section>;
}

export default function AdminDashboardPage() {
  const { isLoaded, user } = useUser();
  const { activeCreator } = useCreator();
  const [range, setRange] = useState<Range>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async (selectedRange: Range) => {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/dashboard/stats?range=${selectedRange}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load dashboard statistics.');
      setStats(data as DashboardStats);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load dashboard statistics.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isLoaded && user) void loadStats(range); }, [isLoaded, user, range, loadStats]);

  const name = activeCreator?.name || user?.fullName || user?.firstName || 'Creator';
  const email = activeCreator?.email || user?.primaryEmailAddress?.emailAddress || '';
  const avatar = activeCreator?.profile?.avatarUrl || user?.imageUrl || '';
  const invoicePaidRate = useMemo(() => {
    if (!stats) return 0;
    const total = Object.values(stats.invoices.statuses).reduce((sum, value) => sum + value, 0);
    const paid = stats.invoices.statuses.paid ?? 0;
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  }, [stats]);

  if (!isLoaded) return <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-[#09090b]"><p className="text-xs font-mono uppercase tracking-widest text-slate-500">Loading Creator Portal...</p></main>;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100">
      <section className="border-b border-slate-200 dark:border-zinc-800"><div className="mx-auto max-w-7xl px-6 py-10"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Creator Dashboard</p><div className="flex items-center gap-4">{avatar && <div className="relative h-12 w-12 overflow-hidden rounded-full border border-purple-500/30"><Image src={avatar} alt={name} fill className="object-cover" unoptimized /></div>}<div><h1 className="text-3xl font-light tracking-tight md:text-4xl">Welcome back, {name.split(' ')[0]}.</h1><p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">Your business overview across the KIPSMTHN platform.{email ? ` · ${email}` : ''}</p></div></div></div><div className="flex flex-wrap items-center gap-2">{ranges.map((option) => <button key={option.value} type="button" onClick={() => setRange(option.value)} className={`rounded-full px-3.5 py-2 text-[10px] font-mono uppercase tracking-widest transition ${range === option.value ? 'bg-purple-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:border-purple-300 hover:text-purple-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'}`}>{option.label}</button>)}<button type="button" onClick={() => void loadStats(range)} className="ml-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-purple-300 hover:text-purple-600 dark:border-zinc-800 dark:bg-zinc-950" aria-label="Refresh dashboard"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div></div></div></section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-300"><AlertCircle className="h-4 w-4 shrink-0" /><span>{error}</span></div>}
        {loading && !stats ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950" />)}</div> : stats ? <>
          <section><div className="mb-4"><p className="text-[9px] font-mono uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400">Business Overview</p><h2 className="mt-1 text-xl font-semibold">Performance {rangeLabels[range]}</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Quoted Value" value={formatMoney(stats.finance.periodQuotedValue)} detail={`${stats.overview.newQuotes} new quotes`} href="/admin/quotes" icon={<Wallet className="h-4 w-4" />} />
            <StatCard label="Paid Invoices" value={formatMoney(stats.finance.periodPaidValue)} detail={`${invoicePaidRate}% paid across invoices`} href="/admin/invoices" icon={<CheckCircle2 className="h-4 w-4" />} />
            <StatCard label="Accepted Quotes" value={formatMoney(stats.finance.acceptedQuoteValue)} detail={`${stats.quotes.conversionRate}% conversion rate`} href="/admin/quotes" icon={<FileCheck2 className="h-4 w-4" />} />
            <StatCard label="Overdue Invoices" value={String(stats.finance.overdueInvoices)} detail="Invoices currently overdue" href="/admin/invoices" icon={<Clock3 className="h-4 w-4" />} />
          </div></section>

          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Clients" value={formatNumber(stats.overview.clients)} detail={`${stats.overview.newClients} added in period · ${stats.overview.activeClients} active`} href="/admin/clients" icon={<Users className="h-4 w-4" />} />
            <StatCard label="Projects" value={formatNumber(stats.overview.projects)} detail={`${stats.overview.activeProjects} active · ${stats.overview.completedProjects} completed`} href="/admin/projects" icon={<BriefcaseBusiness className="h-4 w-4" />} />
            <StatCard label="Quotes" value={formatNumber(stats.overview.quotes)} detail={`${stats.overview.newQuotes} created in period`} href="/admin/quotes" icon={<FileText className="h-4 w-4" />} />
            <StatCard label="Galleries" value={formatNumber(stats.overview.galleries)} detail={`${stats.overview.newGalleries} created in period · ${stats.attention.activeGalleries} active`} href="/admin/projects" icon={<GalleryHorizontalEnd className="h-4 w-4" />} />
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_0.65fr]">
            <Panel title="Needs attention" eyebrow="Action queue"><div className="divide-y divide-slate-100 dark:divide-zinc-900">
              <Link href="/admin/invoices" className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-900/50"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300"><Receipt className="h-4 w-4" /></div><div><p className="text-sm font-medium">Overdue invoices</p><p className="text-xs text-slate-500">Follow up on payments that have passed their due date.</p></div></div><span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-300">{stats.attention.overdueInvoices}</span></Link>
              <Link href="/admin/quotes" className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-900/50"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300"><FileText className="h-4 w-4" /></div><div><p className="text-sm font-medium">Quotes awaiting action</p><p className="text-xs text-slate-500">Draft and sent quotes that may need attention.</p></div></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">{stats.attention.pendingQuotes}</span></Link>
              <Link href="/admin/projects" className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-900/50"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-300"><BriefcaseBusiness className="h-4 w-4" /></div><div><p className="text-sm font-medium">Active projects</p><p className="text-xs text-slate-500">Your current production workload.</p></div></div><span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">{stats.attention.activeProjects}</span></Link>
              <Link href="/admin/projects" className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-900/50"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300"><GalleryHorizontalEnd className="h-4 w-4" /></div><div><p className="text-sm font-medium">Active galleries</p><p className="text-xs text-slate-500">Galleries currently available to clients.</p></div></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">{stats.attention.activeGalleries}</span></Link>
            </div></Panel>

            <Panel title="Quote pipeline" eyebrow="Commercial health"><div className="space-y-5 px-5 py-5">{[['Draft', stats.quotes.statuses.draft ?? 0], ['Sent', stats.quotes.statuses.sent ?? 0], ['Accepted', stats.quotes.statuses.accepted ?? 0], ['Rejected', stats.quotes.statuses.rejected ?? 0], ['Invoiced', stats.quotes.statuses.invoiced ?? 0]].map(([label, value]) => <div key={label as string}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-medium text-slate-800 dark:text-zinc-200">{value}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-900"><div className="h-full rounded-full bg-purple-500" style={{ width: `${Math.min(100, ((Number(value) || 0) / Math.max(stats.overview.quotes, 1)) * 100)}%` }} /></div></div>)}<div className="border-t border-slate-100 pt-4 dark:border-zinc-900"><div className="flex items-end justify-between"><div><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Conversion</p><p className="mt-1 text-2xl font-semibold">{stats.quotes.conversionRate}%</p></div><p className="text-xs text-slate-500">Accepted / decided quotes</p></div></div></div></Panel>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel title="Recent activity" eyebrow="Across your workspace">{stats.activity.length === 0 ? <div className="px-5 py-10 text-center text-sm text-slate-500">No recent activity yet.</div> : <div className="divide-y divide-slate-100 dark:divide-zinc-900">{stats.activity.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-3.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 dark:bg-zinc-900 dark:text-zinc-400">{getActivityIcon(item.type)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800 dark:text-zinc-200">{item.title}</p><p className="truncate text-xs text-slate-500">{item.description}</p></div><span className="shrink-0 text-[10px] font-mono text-slate-400">{formatDate(item.date)}</span></div>)}</div>}</Panel>
            <Panel title="Workspace snapshot" eyebrow="Platform totals"><div className="grid grid-cols-2 divide-x divide-y divide-slate-100 dark:divide-zinc-900"><div className="p-5"><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Invoiced</p><p className="mt-2 text-xl font-semibold">{formatMoney(stats.finance.periodInvoicedValue)}</p><p className="mt-1 text-xs text-slate-500">{rangeLabels[range]}</p></div><div className="p-5"><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Paid</p><p className="mt-2 text-xl font-semibold">{formatMoney(stats.finance.periodPaidValue)}</p><p className="mt-1 text-xs text-slate-500">{rangeLabels[range]}</p></div><div className="p-5"><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">New clients</p><p className="mt-2 text-xl font-semibold">{stats.overview.newClients}</p><p className="mt-1 text-xs text-slate-500">{rangeLabels[range]}</p></div><div className="p-5"><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">New projects</p><p className="mt-2 text-xl font-semibold">{stats.overview.newProjects}</p><p className="mt-1 text-xs text-slate-500">{rangeLabels[range]}</p></div></div></Panel>
          </section>

          <section className="mt-8 rounded-3xl border border-purple-500/20 bg-purple-50 p-6 dark:bg-purple-950/20 md:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[9px] font-mono font-semibold uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400">Quick actions</p><h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Keep the work moving.</h2><p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Jump straight into the parts of the platform you use most.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/quotes/new" className="rounded-full bg-purple-600 px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white transition hover:bg-purple-700">New Quote</Link><Link href="/admin/clients" className="rounded-full border border-purple-200 bg-white px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-purple-700 transition hover:border-purple-300 dark:border-purple-900 dark:bg-zinc-950 dark:text-purple-300">Add Client</Link><Link href="/admin/projects" className="rounded-full border border-purple-200 bg-white px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-purple-700 transition hover:border-purple-300 dark:border-purple-900 dark:bg-zinc-950 dark:text-purple-300">Projects</Link></div></div></section>
        </> : null}
      </div>
    </main>
  );
}
