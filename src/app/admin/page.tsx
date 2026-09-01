'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useCreator } from '@/context/CreatorContext';
import { formatCurrency } from '@/lib/utils';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  GalleryHorizontalEnd,
  Plus,
  Receipt,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react';

type Range = '7d' | '30d' | '90d' | '12m' | 'all';

type DashboardStats = {
  range: Range;
  overview: {
    clients: number; newClients: number; activeClients: number;
    projects: number; newProjects: number; activeProjects: number; completedProjects: number;
    quotes: number; newQuotes: number; invoices: number; newInvoices: number;
    galleries: number; newGalleries: number;
  };
  finance: {
    periodQuotedValue: number; acceptedQuoteValue: number;
    periodInvoicedValue: number; periodPaidValue: number; overdueInvoices: number;
  };
  quotes: { statuses: Record<string, number>; conversionRate: number };
  invoices: { statuses: Record<string, number> };
  galleries: { statuses: Record<string, number> };
  attention: { overdueInvoices: number; pendingQuotes: number; activeProjects: number; activeGalleries: number };
  activity: Array<{ id: string; type: 'client' | 'project' | 'quote' | 'invoice' | 'gallery'; title: string; description: string; date: string }>;
};

const ranges: Array<{ value: Range; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
  { value: 'all', label: 'all time' },
];

const tourSteps = [
  { title: 'Your command center', body: 'This is your business overview. The cards show clients, projects, quotes, invoices and the money moving through your studio.', target: 'tour-overview' },
  { title: 'Clients', body: 'Keep every client, contact and relationship in one place. This is the first thing we recommend setting up.', target: 'tour-clients' },
  { title: 'Quotes', body: 'Build production quotes, select equipment and services, and track what has been sent or accepted.', target: 'tour-quotes' },
  { title: 'Invoices', body: 'Turn accepted work into invoices and keep track of what is paid or overdue.', target: 'tour-invoices' },
  { title: 'Projects & galleries', body: 'Manage production projects and eventually deliver client work through your private galleries.', target: 'tour-projects' },
] as const;

function number(value: number) { return new Intl.NumberFormat('en-US').format(value); }
function date(value: string) { return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value)); }

function Metric({ label, value, detail, href, icon, target }: { label: string; value: string; detail: string; href: string; icon: React.ReactNode; target?: string }) {
  return <Link data-tour={target} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
    <div className="flex items-start justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">{icon}</span><ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-purple-500" /></div>
    <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">{detail}</p>
  </Link>;
}

function QuickAction({ href, label, detail, icon, target }: { href: string; label: string; detail: string; icon: React.ReactNode; target?: string }) {
  return <Link data-tour={target} href={href} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300">{icon}</span>
    <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-slate-800 dark:text-zinc-100">{label}</span><span className="block truncate text-xs text-slate-500 dark:text-zinc-500">{detail}</span></span>
    <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-purple-500" />
  </Link>;
}

function Panel({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"><div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-zinc-900"><div>{eyebrow && <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400">{eyebrow}</p>}<h2 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{title}</h2></div>{action}</div>{children}</section>;
}

function ActivityRow({ item }: { item: DashboardStats['activity'][number] }) {
  const icons = { client: <Users className="h-4 w-4" />, project: <FolderKanban className="h-4 w-4" />, quote: <FileText className="h-4 w-4" />, invoice: <Receipt className="h-4 w-4" />, gallery: <GalleryHorizontalEnd className="h-4 w-4" /> };
  return <div className="flex items-center gap-3 px-5 py-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-300">{icons[item.type]}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="truncate text-xs text-slate-500 dark:text-zinc-500">{item.description}</p></div><time className="shrink-0 text-[10px] font-mono text-slate-400">{date(item.date)}</time></div>;
}

function Tour({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const current = tourSteps[step];
  useEffect(() => {
    document.querySelector(`[data-tour="${current.target}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [current.target]);

  return <div className="fixed inset-0 z-[80] bg-black/45 p-4 backdrop-blur-[1px]">
    <div className="absolute bottom-5 left-1/2 w-[min(440px,calc(100vw-32px))] -translate-x-1/2 rounded-2xl border border-white/20 bg-white p-5 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
      <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white"><Sparkles className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Platform tour · {step + 1}/{tourSteps.length}</p><button type="button" onClick={onSkip} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="h-4 w-4" /></button></div><h3 className="mt-1 text-base font-semibold">{current.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">{current.body}</p></div></div>
      <div className="mt-4 flex items-center justify-between"><button type="button" onClick={onSkip} className="text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-white">Skip tour</button><button type="button" onClick={onNext} className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white">{step === tourSteps.length - 1 ? 'Finish tour' : 'Next'}</button></div>
    </div>
  </div>;
}

function FirstClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (client: { name: string }) => void }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) { setError('Client name is required.'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to create client.');
      localStorage.setItem('creative-os-first-client-prompted', '1');
      onCreated({ name: data.name || form.name.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create client.');
    } finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300"><Users className="h-5 w-5" /></span><h2 className="mt-4 text-2xl font-semibold tracking-tight">Add your first client</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">Let&apos;s get your workspace started. You can add the rest of the details later.</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-medium">Client name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus placeholder="Jane Doe" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-900" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium">Company<input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-900" /></label><label className="text-sm font-medium">Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254..." className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-900" /></label></div><label className="block text-sm font-medium">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="client@example.com" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-purple-500 dark:border-zinc-800 dark:bg-zinc-900" /></label>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-300">{error}</p>}<div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500">Not now</button><button type="submit" disabled={saving} className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Adding...' : 'Add client'}</button></div></form></div></div>;
}

export default function CreativeOSDashboardPage() {
  const { isLoaded, user } = useUser();
  const { activeCreator } = useCreator();
  const [range, setRange] = useState<Range>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [showFirstClient, setShowFirstClient] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    const tourSeen = localStorage.getItem('creative-os-tour-seen') === '1';
    if (!tourSeen) setTourStep(0);
  }, [isLoaded, user]);

  useEffect(() => {
    if (!stats || tourStep !== null) return;
    const prompted = localStorage.getItem('creative-os-first-client-prompted') === '1';
    if (stats.overview.clients === 0 && !prompted) setShowFirstClient(true);
  }, [stats, tourStep]);

  useEffect(() => {
    if (!isLoaded || !user) return;
    let cancelled = false;
    async function load() {
      setLoading(true); setError('');
      try {
        const response = await fetch(`/api/dashboard/stats?range=${range}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load dashboard data.');
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally { if (!cancelled) setLoading(false); }
    }
    void load();
    return () => { cancelled = true; };
  }, [isLoaded, user, range]);

  const name = activeCreator?.name || user?.fullName || user?.firstName || 'Creator';
  const email = activeCreator?.email || user?.primaryEmailAddress?.emailAddress || '';
  const avatar = activeCreator?.profile?.avatarUrl || user?.imageUrl || '';
  const paidRate = useMemo(() => {
    if (!stats) return 0;
    const total = Object.values(stats.invoices.statuses).reduce((sum, value) => sum + (value || 0), 0);
    return total ? Math.round(((stats.invoices.statuses.paid || 0) / total) * 100) : 0;
  }, [stats]);

  function skipTour() {
    localStorage.setItem('creative-os-tour-seen', '1');
    setTourStep(null);
    if (stats?.overview.clients === 0 && localStorage.getItem('creative-os-first-client-prompted') !== '1') setShowFirstClient(true);
  }
  function nextTour() {
    if (tourStep === null) return;
    if (tourStep >= tourSteps.length - 1) { localStorage.setItem('creative-os-tour-seen', '1'); setTourStep(null); return; }
    setTourStep(tourStep + 1);
  }

<<<<<<< HEAD
  return (
    <main className="os-page min-h-screen">
      <div className="os-shell py-6 sm:py-8 lg:py-10">
        <header className="os-reveal mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex items-start gap-4">
            {avatar ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-soft)] shadow-sm">
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <span className="os-icon-box h-12 w-12 rounded-2xl"><BriefcaseBusiness className="h-5 w-5" /></span>
            )}
            <div>
              <p className="os-eyebrow">Creative · Command Center</p>
              <h1 className="mt-2 text-3xl font-medium tracking-[-0.05em] sm:text-4xl">Good to see you, {firstName}.</h1>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
                Your studio, client work and commercial operations in one view. Start with what needs attention, then move the work forward.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-1 shadow-sm">
            {ranges.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-lg px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] transition ${
                  range === option.value
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--text-primary)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs text-red-500">
            <Clock3 className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="os-reveal mb-9" style={{ animationDelay: '60ms' }}>
          <SectionHeading
            eyebrow="01 · Run"
            title="Your studio at a glance"
            description="The north-star numbers for the selected period."
          />

          {loading && !stats ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-36 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]" />
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Quoted value"
                value={formatCurrency(stats.finance.periodQuotedValue)}
                detail={`${stats.overview.newQuotes} new quotes · ${rangeLabels[range]}`}
                href="/admin/quotes"
                icon={<Wallet className="h-4 w-4" />}
              />
              <MetricCard
                label="Paid invoices"
                value={formatCurrency(stats.finance.periodPaidValue)}
                detail={`${invoicePaidRate}% of invoices paid`}
                href="/admin/invoices"
                icon={<CheckCircle2 className="h-4 w-4" />}
                accent="green"
              />
              <MetricCard
                label="Active projects"
                value={formatNumber(stats.overview.activeProjects)}
                detail={`${stats.overview.completedProjects} completed · ${stats.overview.projects} total`}
                href="/admin/projects"
                icon={<FolderKanban className="h-4 w-4" />}
                accent="cyan"
              />
              <MetricCard
                label="Clients"
                value={formatNumber(stats.overview.clients)}
                detail={`${stats.overview.activeClients} active · ${stats.overview.newClients} new`}
                href="/admin/clients"
                icon={<Users className="h-4 w-4" />}
                accent="amber"
              />
            </div>
          ) : null}
        </section>
=======
  if (!isLoaded) return <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 dark:bg-[#09090b]"><p className="text-xs font-mono uppercase tracking-widest text-slate-500">Loading Creative OS...</p></main>;
>>>>>>> c9d8fc8c2d9c7f5075031d5febecb2a82da31770

  return <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-zinc-100">
    <header className="border-b border-slate-200 dark:border-zinc-800"><div className="mx-auto max-w-7xl px-6 py-8 lg:py-10"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-[10px] font-mono font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Creative OS Command Center</p><div className="flex items-center gap-4">{avatar && <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-purple-500/30"><img src={avatar} alt={name} className="h-full w-full object-cover" /></div>}<div><h1 className="text-3xl font-light tracking-tight md:text-4xl">Welcome back, {name.split(' ')[0]}.</h1><p className="mt-2 text-sm text-slate-500 dark:text-zinc-500">Run your creative business from one place.{email ? ` · ${email}` : ''}</p></div></div></div><div className="flex flex-wrap items-center gap-2">{ranges.map((option) => <button key={option.value} type="button" onClick={() => setRange(option.value)} className={`rounded-full px-3.5 py-2 text-[10px] font-mono uppercase tracking-widest transition ${range === option.value ? 'bg-purple-600 text-white' : 'border border-slate-200 bg-white text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400'}`}>{option.label}</button>)}</div></div></div></header>

<<<<<<< HEAD
            <section className="os-reveal mb-9" style={{ animationDelay: '180ms' }}>
              <SectionHeading
                eyebrow="03 · Signal"
                title="See where the business is moving"
                description="This platform's strongest idea is not the chart itself — it is putting context around the number. This layer applies that principle to your studio."
              />
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <Panel eyebrow="Money" title="Commercial flow" action={<Link href="/admin/invoices" className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--accent)]">Open ledger →</Link>}>
                  <MoneyFlow stats={stats} />
                </Panel>
                <Panel eyebrow="Quotes" title="Pipeline health" action={<span className="os-pill"><span className="os-pill-dot text-[var(--accent)]" /> live</span>}>
                  <QuotePipeline stats={stats} />
                </Panel>
              </div>
            </section>
=======
    <div className="mx-auto max-w-7xl px-6 py-8">
      {error && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-300"><AlertCircle className="h-4 w-4" />{error}</div>}
      <section data-tour="tour-overview" className="mb-8"><div className="mb-4"><p className="text-[9px] font-mono uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400">Overview</p><h2 className="mt-1 text-xl font-semibold">Your business at a glance</h2></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Clients" value={number(stats?.overview.clients || 0)} detail={`+${number(stats?.overview.newClients || 0)} in selected period`} href="/admin/clients" icon={<Users className="h-4 w-4" />} target="tour-clients" />
        <Metric label="Projects" value={number(stats?.overview.projects || 0)} detail={`${number(stats?.overview.activeProjects || 0)} active`} href="/admin/projects" icon={<FolderKanban className="h-4 w-4" />} target="tour-projects" />
        <Metric label="Quotes" value={number(stats?.overview.quotes || 0)} detail={`${number(stats?.quotes.conversionRate || 0)}% conversion`} href="/admin/quotes/new" icon={<FileText className="h-4 w-4" />} target="tour-quotes" />
        <Metric label="Invoices" value={number(stats?.overview.invoices || 0)} detail={`${paidRate}% paid`} href="/admin/invoices" icon={<Receipt className="h-4 w-4" />} target="tour-invoices" />
      </div></section>
>>>>>>> c9d8fc8c2d9c7f5075031d5febecb2a82da31770

      <section className="mb-8"><div className="mb-4"><p className="text-[9px] font-mono uppercase tracking-[0.22em] text-purple-600 dark:text-purple-400">Start here</p><h2 className="mt-1 text-xl font-semibold">Quick actions</h2></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"><QuickAction href="/admin/clients" label="Add / Manage Client" detail="Build your CRM" icon={<Users className="h-4 w-4" />} target="tour-clients" /><QuickAction href="/admin/quotes/new" label="Create Quote" detail="Price a new production" icon={<FileText className="h-4 w-4" />} target="tour-quotes" /><QuickAction href="/admin/invoices" label="Manage Invoices" detail="Track billing and payments" icon={<Receipt className="h-4 w-4" />} target="tour-invoices" /><QuickAction href="/admin/projects" label="Open Projects" detail="Manage production work" icon={<FolderKanban className="h-4 w-4" />} target="tour-projects" /></div></section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Commercial movement" title="Money flow"><div className="p-5 space-y-5">{[["Quoted", stats?.finance.periodQuotedValue || 0], ["Invoiced", stats?.finance.periodInvoicedValue || 0], ["Paid", stats?.finance.periodPaidValue || 0]].map(([label, value]) => { const max = Math.max(stats?.finance.periodQuotedValue || 0, stats?.finance.periodInvoicedValue || 0, stats?.finance.periodPaidValue || 0, 1); return <div key={label as string}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-semibold">{formatCurrency(value as number)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-900"><div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${Math.max((value as number) > 0 ? 4 : 0, Math.round(((value as number) / max) * 100))}%` }} /></div></div>; })}<div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Accepted quotes</p><p className="mt-1 text-lg font-semibold">{formatCurrency(stats?.finance.acceptedQuoteValue || 0)}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">Overdue invoices</p><p className="mt-1 text-lg font-semibold">{number(stats?.finance.overdueInvoices || 0)}</p></div></div></div></Panel>
        <Panel eyebrow="Quote pipeline" title="Quote status"><div className="p-5 space-y-3">{[['Draft', 'draft'], ['Sent', 'sent'], ['Accepted', 'accepted'], ['Rejected', 'rejected'], ['Invoiced', 'invoiced']].map(([label, key]) => { const value = stats?.quotes.statuses[key] || 0; const total = Math.max(stats?.overview.quotes || 0, 1); return <div key={key}><div className="mb-1.5 flex justify-between text-xs"><span className="text-slate-500">{label}</span><span className="font-semibold">{number(value)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-900"><div className="h-full rounded-full bg-purple-600" style={{ width: `${Math.round((value / total) * 100)}%` }} /></div></div>; })}</div></Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><Panel eyebrow="Latest" title="Recent activity" action={<Link href="/admin" className="text-[10px] font-medium text-purple-600">Refresh</Link>}><div className="divide-y divide-slate-100 dark:divide-zinc-900">{loading ? <div className="px-5 py-10 text-center text-xs text-slate-400"><Clock3 className="mx-auto mb-2 h-4 w-4 animate-pulse" />Loading activity...</div> : stats?.activity.length ? stats.activity.slice(0, 8).map((item) => <ActivityRow key={item.id} item={item} />) : <div className="px-5 py-10 text-center text-sm text-slate-400">No activity yet.</div>}</div></Panel>
        <Panel eyebrow="Attention" title="Things to review"><div className="divide-y divide-slate-100 dark:divide-zinc-900">{[
          ['Overdue invoices', stats?.attention.overdueInvoices || 0, '/admin/invoices', <Wallet className="h-4 w-4" />],
          ['Pending quotes', stats?.attention.pendingQuotes || 0, '/admin/quotes/new', <FileText className="h-4 w-4" />],
          ['Active projects', stats?.attention.activeProjects || 0, '/admin/projects', <FolderKanban className="h-4 w-4" />],
          ['Active galleries', stats?.attention.activeGalleries || 0, '/admin/projects', <GalleryHorizontalEnd className="h-4 w-4" />],
        ].map(([label, value, href, icon]) => <Link key={label as string} href={href as string} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-zinc-900/50"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300">{icon}</span><span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-slate-500">Review in workspace</span></span></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">{number(value as number)}</span></Link>)}</div></Panel></div>
    </div>

<<<<<<< HEAD
        <footer className="mt-10 border-t border-[var(--border-subtle)] pt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--text-faint)]">Creative · KIPSMTHN</p>
            <p className="text-[10px] text-[var(--text-faint)]">Built around the way a creative studio actually works.</p>
          </div>
        </footer>
      </div>
    </main>
  );
=======
    {tourStep !== null && <Tour step={tourStep} onNext={nextTour} onSkip={skipTour} />}
    {showFirstClient && <FirstClientModal onClose={() => { localStorage.setItem('creative-os-first-client-prompted', '1'); setShowFirstClient(false); }} onCreated={() => { setShowFirstClient(false); setRange((current) => current); }} />}
  </main>;
>>>>>>> c9d8fc8c2d9c7f5075031d5febecb2a82da31770
}
