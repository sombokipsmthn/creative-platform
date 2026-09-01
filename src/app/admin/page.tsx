'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  GalleryHorizontalEnd,
  ImagePlus,
  Plus,
  Receipt,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';

import { useCreator } from '@/context/CreatorContext';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  range: '7d' | '30d' | '90d' | '12m' | 'all';
  overview: {
    clients: number;
    newClients: number;
    activeClients: number;
    projects: number;
    newProjects: number;
    activeProjects: number;
    completedProjects: number;
    quotes: number;
    newQuotes: number;
    invoices: number;
    newInvoices: number;
    galleries: number;
    newGalleries: number;
  };
  finance: {
    periodQuotedValue: number;
    acceptedQuoteValue: number;
    periodInvoicedValue: number;
    periodPaidValue: number;
    overdueInvoices: number;
  };
  quotes: { statuses: Record<string, number>; conversionRate: number };
  invoices: { statuses: Record<string, number> };
  galleries: { statuses: Record<string, number> };
  attention: {
    overdueInvoices: number;
    pendingQuotes: number;
    activeProjects: number;
    activeGalleries: number;
  };
  activity: Array<{
    id: string;
    type: 'client' | 'project' | 'quote' | 'invoice' | 'gallery';
    title: string;
    description: string;
    date: string;
  }>;
}

const ranges = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
  { value: 'all', label: 'all time' },
] as const;

const rangeLabels: Record<string, string> = {
  '7d': 'last 7 days',
  '30d': 'last 30 days',
  '90d': 'last 90 days',
  '12m': 'last 12 months',
  all: 'all time',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="os-eyebrow">{eyebrow}</p>
        <h2 className="os-title">{title}</h2>
        {description && <p className="os-subtitle">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  action,
  children,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`os-card ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5">
        <div>
          {eyebrow && <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">{eyebrow}</p>}
          <h3 className="mt-1 text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return <span className="os-icon-box shrink-0">{children}</span>;
}

function MetricCard({
  label,
  value,
  detail,
  href,
  icon,
  accent = 'purple',
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  icon: React.ReactNode;
  accent?: 'purple' | 'cyan' | 'green' | 'amber';
}) {
  const accentClasses = {
    purple: 'text-[var(--accent)] bg-[var(--accent-soft)] border-[color-mix(in_srgb,var(--accent)_20%,var(--border-subtle))]',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <Link href={href} className="os-card os-card-interactive os-card-glow block">
      <div className="os-metric">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${accentClasses[accent]}`}>{icon}</div>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="os-metric-label">{label}</p>
            <p className="os-metric-value">{value}</p>
            <p className="os-metric-detail">{detail}</p>
          </div>
          <ArrowUpRight className="mb-1 h-4 w-4 shrink-0 text-[var(--text-faint)] transition group-hover:text-[var(--accent)]" />
        </div>
      </div>
    </Link>
  );
}

function QuickAction({ href, label, detail, icon }: { href: string; label: string; detail: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="group os-card os-card-interactive flex items-center gap-3 px-3.5 py-3">
      <IconBox>{icon}</IconBox>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{detail}</p>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-faint)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
    </Link>
  );
}

function MoneyFlow({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: 'Quoted', value: stats.finance.periodQuotedValue },
    { label: 'Invoiced', value: stats.finance.periodInvoicedValue },
    { label: 'Paid', value: stats.finance.periodPaidValue },
  ];
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-[var(--text-muted)]">Commercial movement</p>
          <p className="mt-1 text-xs text-[var(--text-faint)]">{rangeLabels[stats.range]}</p>
        </div>
        <span className="os-pill"><span className="os-pill-dot text-[var(--accent)]" /> live</span>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = Math.max(5, Math.round((item.value / max) * 100));
          return (
            <div key={item.label} className="group">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)]">{item.label}</span>
                <span className="text-xs font-semibold text-[var(--text-primary)]">{formatCurrency(item.value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-soft)]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${index === 2 ? 'bg-[var(--accent)]' : 'bg-[color-mix(in_srgb,var(--accent)_45%,var(--border-strong))]'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3">
          <p className="os-metric-label">Accepted</p>
          <p className="mt-1 text-base font-semibold tracking-tight">{formatCurrency(stats.finance.acceptedQuoteValue)}</p>
        </div>
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3">
          <p className="os-metric-label">Overdue</p>
          <p className="mt-1 text-base font-semibold tracking-tight">{formatNumber(stats.finance.overdueInvoices)}</p>
        </div>
      </div>
    </div>
  );
}

function QuotePipeline({ stats }: { stats: DashboardStats }) {
  const items: Array<[string, number]> = [
    ['Draft', stats.quotes.statuses.draft || 0],
    ['Sent', stats.quotes.statuses.sent || 0],
    ['Accepted', stats.quotes.statuses.accepted || 0],
    ['Rejected', stats.quotes.statuses.rejected || 0],
    ['Invoiced', stats.quotes.statuses.invoiced || 0],
  ];
  const total = Math.max(stats.overview.quotes, 1);

  return (
    <div className="p-4 sm:p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight">{stats.quotes.conversionRate}%</p>
          <p className="mt-1 text-[10px] text-[var(--text-muted)]">quote conversion rate</p>
        </div>
        <span className="os-pill">{formatNumber(stats.overview.quotes)} total</span>
      </div>

      <div className="space-y-3">
        {items.map(([label, value]) => {
          const width = Math.max(value > 0 ? 4 : 0, Math.round((value / total) * 100));
          return (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[10px] text-[var(--text-secondary)]">{label}</span>
                <span className="font-mono text-[9px] text-[var(--text-muted)]">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-soft)]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-cyan))] transition-all duration-700" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityRow({ type, title, description, date }: DashboardStats['activity'][number]) {
  const icons: Record<DashboardStats['activity'][number]['type'], React.ReactNode> = {
    client: <Users className="h-3.5 w-3.5" />,
    project: <FolderKanban className="h-3.5 w-3.5" />,
    quote: <FileText className="h-3.5 w-3.5" />,
    invoice: <Receipt className="h-3.5 w-3.5" />,
    gallery: <GalleryHorizontalEnd className="h-3.5 w-3.5" />,
  };

  return (
    <div className="os-data-row">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-soft)] text-[var(--text-muted)]">
        {icons[type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-[var(--text-primary)]">{title}</p>
        <p className="truncate text-[10px] text-[var(--text-muted)]">{description}</p>
      </div>
      <time className="shrink-0 font-mono text-[8px] uppercase tracking-[0.08em] text-[var(--text-faint)]">{formatDate(date)}</time>
    </div>
  );
}

export default function CreativeOSDashboardPage() {
  const { isLoaded, user } = useUser();
  const { activeCreator } = useCreator();
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '12m' | 'all'>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded || !user) return;

    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/dashboard/stats?range=${range}`, { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load dashboard data.');
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, [isLoaded, user, range]);

  const name = activeCreator?.name || user?.fullName || user?.firstName || 'Creator';
  const firstName = name.split(' ')[0];
  const avatar = activeCreator?.profile?.avatarUrl || user?.imageUrl || '';

  const invoicePaidRate = useMemo(() => {
    if (!stats) return 0;
    const total = Object.values(stats.invoices.statuses).reduce((sum, value) => sum + (value || 0), 0);
    const paid = stats.invoices.statuses.paid || 0;
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  }, [stats]);

  if (!isLoaded) {
    return (
      <main className="os-page flex min-h-[70vh] items-center justify-center">
        <div className="os-pulse flex items-center gap-3">
          <span className="os-icon-box h-9 w-9"><Sparkles className="h-4 w-4" /></span>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Loading Creative OS</p>
        </div>
      </main>
    );
  }

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
              <p className="os-eyebrow">Creative OS · Command Center</p>
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

        {stats && (
          <>
            <section className="os-reveal mb-9" style={{ animationDelay: '120ms' }}>
              <SectionHeading
                eyebrow="02 · Move"
                title="Workflows, not just numbers"
                description="The core creative-business loop: win the work, make the work, deliver the work, get paid."
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <QuickAction href="/admin/clients" label="Build the client record" detail="Contacts, KRA PIN and client history" icon={<Users className="h-4 w-4" />} />
                <QuickAction href="/admin/quotes/new" label="Price the next project" detail="Quote production, services and equipment" icon={<FileText className="h-4 w-4" />} />
                <QuickAction href="/admin/projects" label="Move production forward" detail="Projects, galleries and delivery work" icon={<ImagePlus className="h-4 w-4" />} />
                <QuickAction href="/admin/invoices" label="Close the loop" detail="Invoices, payments and follow-up" icon={<Receipt className="h-4 w-4" />} />
              </div>
            </section>

            <section className="os-reveal mb-9" style={{ animationDelay: '180ms' }}>
              <SectionHeading
                eyebrow="03 · Signal"
                title="See where the business is moving"
                description="Cometly's strongest idea is not the chart itself — it is putting context around the number. This layer applies that principle to your studio."
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

            <section className="os-reveal mb-9" style={{ animationDelay: '240ms' }}>
              <SectionHeading
                eyebrow="04 · Attention"
                title="What needs a decision"
                description="Turn the dashboard into an action queue instead of another reporting screen."
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Overdue invoices', value: stats.attention.overdueInvoices, detail: 'Payment follow-up', href: '/admin/invoices', icon: <Receipt className="h-4 w-4" />, tone: 'text-red-500' },
                  { label: 'Quotes awaiting action', value: stats.attention.pendingQuotes, detail: 'Draft or sent', href: '/admin/quotes', icon: <FileText className="h-4 w-4" />, tone: 'text-amber-500' },
                  { label: 'Active projects', value: stats.attention.activeProjects, detail: 'Production workload', href: '/admin/projects', icon: <FolderKanban className="h-4 w-4" />, tone: 'text-cyan-500' },
                  { label: 'Active galleries', value: stats.attention.activeGalleries, detail: 'Client delivery', href: '/admin/projects', icon: <GalleryHorizontalEnd className="h-4 w-4" />, tone: 'text-[var(--accent)]' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="os-card os-card-interactive flex items-center gap-3 p-4">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] ${item.tone}`}>{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-[var(--text-muted)]">{item.label}</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight">{formatNumber(item.value)}</p>
                      <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--text-faint)]">{item.detail}</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="os-reveal grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]" style={{ animationDelay: '300ms' }}>
              <Panel
                eyebrow="Workspace"
                title="Recent activity"
                action={<span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--text-faint)]">account feed</span>}
              >
                <div>
                  {stats.activity.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <span className="os-icon-box mx-auto"><Sparkles className="h-4 w-4" /></span>
                      <p className="mt-4 text-xs font-medium">Your workspace is ready.</p>
                      <p className="mt-1 text-[10px] text-[var(--text-muted)]">Create a client, project or quote to start building activity.</p>
                    </div>
                  ) : (
                    stats.activity.map((item) => <ActivityRow key={item.id} {...item} />)
                  )}
                </div>
              </Panel>

              <Panel eyebrow="Start" title="Create something">
                <div className="grid gap-2 p-3">
                  <Link href="/admin/clients" className="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3 transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border-subtle))]">
                    <span className="os-icon-box"><Plus className="h-4 w-4" /></span>
                    <span className="flex-1 text-[11px] font-semibold">New client</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-faint)] group-hover:text-[var(--accent)]" />
                  </Link>
                  <Link href="/admin/quotes/new" className="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3 transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border-subtle))]">
                    <span className="os-icon-box"><FileText className="h-4 w-4" /></span>
                    <span className="flex-1 text-[11px] font-semibold">New quote</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-faint)] group-hover:text-[var(--accent)]" />
                  </Link>
                  <Link href="/admin/projects" className="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3 transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border-subtle))]">
                    <span className="os-icon-box"><GalleryHorizontalEnd className="h-4 w-4" /></span>
                    <span className="flex-1 text-[11px] font-semibold">Open projects</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-faint)] group-hover:text-[var(--accent)]" />
                  </Link>
                  <Link href="/admin/expenses" className="group flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-soft)] p-3 transition hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border-subtle))]">
                    <span className="os-icon-box"><Wallet className="h-4 w-4" /></span>
                    <span className="flex-1 text-[11px] font-semibold">Track an expense</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--text-faint)] group-hover:text-[var(--accent)]" />
                  </Link>
                </div>
              </Panel>
            </section>
          </>
        )}

        <footer className="mt-10 border-t border-[var(--border-subtle)] pt-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--text-faint)]">Creative OS · KIPSMTHN</p>
            <p className="text-[10px] text-[var(--text-faint)]">Built around the way a creative studio actually works.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
