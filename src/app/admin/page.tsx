'use client';

import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  AlertCircle, ArrowUpRight, CheckCircle2, Clock3, FileText, GalleryHorizontalEnd,
  LayoutDashboard, Receipt, Users, Wallet, CalendarDays, ChevronLeft, ChevronRight,
  ExternalLink, TrendingUp
} from 'lucide-react';

import { useCreator } from '@/context/CreatorContext';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import CreatorOnboardingModal from '@/components/CreatorOnboardingModal';
import DashboardTour from '@/components/DashboardTour';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import StatusBadge from '@/components/admin/StatusBadge';

// Types
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
  activity: Array<{ id: string; type: 'client' | 'project' | 'quote' | 'invoice' | 'gallery'; title: string; description: string; date: string }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  category: 'Project' | 'Quotation' | 'Invoice' | 'Gallery' | 'Contract' | 'Studio event';
  status: string;
  sourceType: string;
  sourceId: string;
  relatedClientId?: string | null;
  relatedProjectId?: string | null;
  relatedQuoteId?: string | null;
  relatedInvoiceId?: string | null;
  relatedGalleryId?: string | null;
  isTentative?: boolean;
}

type Range = '7d' | '30d' | '90d' | '12m' | 'all';

const ranges: Array<{ value: Range; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
  { value: 'all', label: 'all time' },
];

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
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function formatDateShort(value: string) {
  return new Intl.DateTimeFormat('en-KE', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-KE', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function localDateKey(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function eventHref(event: CalendarEvent) {
  switch (event.sourceType) {
    case 'project': return `/admin/projects/${event.sourceId}`;
    case 'quote': return `/admin/quotes/${event.sourceId}`;
    case 'invoice': return `/admin/invoices/${event.sourceId}`;
    case 'gallery': return `/admin/galleries/${event.sourceId}`;
    case 'contract': return `/admin/contracts/${event.sourceId}`;
    default: return '/admin/calendar';
  }
}

function isToday(dateString: string) {
  const today = new Date();
  const date = new Date(dateString);
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isTomorrow(dateString: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateString);
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();
}

// Components
function Panel({ eyebrow, title, action, children, className = '' }: { eyebrow?: string; title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          {eyebrow && (
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        </div>
        {action}
      </div>
      <div className="min-w-0 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function QuickAction({ href, label, icon, detail }: { href: string; label: string; icon: React.ReactNode; detail?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {detail && <span className="block truncate text-xs text-muted-foreground">{detail}</span>}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function MetricCard({ label, value, detail, href, icon, trend }: { label: string; value: string; detail: string; href: string; icon: React.ReactNode; trend?: { value: number; label: string } }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary/50"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary">{icon}</span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
        </div>
        <p className="mt-4 text-[10px] font-sans uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-foreground tabular-nums [overflow-wrap:anywhere]">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        {trend && (
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </Link>
  );
}

function AttentionItem({ icon, title, detail, count, href, urgent }: { icon: React.ReactNode; title: string; detail: string; count: number | string; href: string; urgent?: boolean }) {
  return (
    <Link
      href={href}
      className="flex min-w-0 items-center justify-between gap-3 px-4 py-4 transition hover:bg-muted/50 sm:gap-4 sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${urgent ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-300'}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="break-words text-sm text-muted-foreground">{detail}</p>
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${urgent ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'}`}>
        {count}
      </span>
    </Link>
  );
}

function ActivityRow({ type, title, description, date }: { type: string; title: string; description: string; date: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    client: <Users className="h-4 w-4" />,
    project: <LayoutDashboard className="h-4 w-4" />,
    quote: <FileText className="h-4 w-4" />,
    invoice: <Receipt className="h-4 w-4" />,
    gallery: <GalleryHorizontalEnd className="h-4 w-4" />,
  };

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/50 last:border-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">{iconMap[type]}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-sm text-muted-foreground">{description}</p>
      </div>
      <time className="shrink-0 text-[10px] font-sans text-muted-foreground">{formatDate(date)}</time>
    </div>
  );
}

function CalendarEventItem({ event, onClick }: { event: CalendarEvent; onClick?: () => void }) {
  const categoryMeta: Record<string, { icon: typeof LayoutDashboard; tone: string }> = {
    Project: { icon: LayoutDashboard, tone: 'bg-primary/10 text-primary' },
    Quotation: { icon: FileText, tone: 'bg-secondary/10 text-secondary-foreground' },
    Invoice: { icon: Receipt, tone: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
    Gallery: { icon: GalleryHorizontalEnd, tone: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
    Contract: { icon: FileText, tone: 'bg-muted text-muted-foreground' },
    'Studio event': { icon: CalendarDays, tone: 'bg-primary/10 text-primary' },
  };

  const meta = categoryMeta[event.category] ?? categoryMeta.Project;
  const Icon = meta.icon;
  const startDate = new Date(event.startDate);
  const isAllDay = !event.endDate || new Date(event.endDate).getTime() - startDate.getTime() >= 24 * 60 * 60 * 1000;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full min-w-0 items-start gap-2 rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-muted/50 sm:gap-3"
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words text-left text-sm font-medium text-foreground">{event.title}</p>
        <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-left text-xs text-muted-foreground">
          <span>{event.category}</span>
          <span>·</span>
          <span>{isAllDay ? 'All day' : formatTime(event.startDate)}</span>
          {event.description && (
            <>
              <span>·</span>
              <span className="truncate max-w-[200px]">{event.description}</span>
            </>
          )}
        </p>
      </div>
      <StatusBadge status={event.status} />
    </button>
  );
}

function DateStrip({ selectedDate, onDateChange, eventsByDay }: { selectedDate: Date; onDateChange: (date: Date) => void; eventsByDay: Map<string, CalendarEvent[]> }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5" role="tablist" aria-label="Upcoming days">
      {days.map((date) => {
        const key = localDateKey(date);
        const dayEvents = eventsByDay.get(key) ?? [];
        const isSelected = localDateKey(selectedDate) === key;
        const isToday = date.toDateString() === today.toDateString();

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onDateChange(date)}
            className={`flex min-w-[64px] shrink-0 flex-col items-center gap-1.5 rounded-xl px-3 py-3 transition sm:px-4 ${isSelected ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'}`}
          >
            <span className={`text-[10px] font-sans uppercase tracking-widest ${isToday && !isSelected ? 'text-primary' : isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {isToday ? 'Today' : format(date, 'EEE')}
            </span>
            <span className={`text-xl font-semibold ${isSelected ? 'text-primary-foreground' : isToday ? 'text-primary' : 'text-foreground'}`}>
              {date.getDate()}
            </span>
            {dayEvents.length > 0 && (
              <span className={`text-[10px] font-medium ${isSelected ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'} rounded-full px-1.5 py-0.5`}>
                {dayEvents.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof CalendarDays; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

// Main Dashboard Page
export default function StudioCommandCenterPage() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;
  const { activeCreator } = useCreator();
  const [range, setRange] = useState<'7d' | '30d' | '90d' | '12m' | 'all'>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [showDashboardTour, setShowDashboardTour] = useState(false);

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const name = activeCreator?.name || user?.name || 'Creator';
  const email = activeCreator?.email || user?.email || '';
  const avatar = activeCreator?.profile?.avatarUrl || user?.image || '';

  // Fetch dashboard stats
  useEffect(() => {
    if (isPending || !user) return;
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/dashboard/stats?range=${range}`, { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load dashboard data.');
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    void loadStats();
  }, [isPending, user, range]);

  // Fetch calendar events for next 7 days
  useEffect(() => {
    if (!user) return;
    const loadCalendarEvents = async () => {
      setCalendarLoading(true);
      setCalendarError('');
      try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        end.setHours(23, 59, 59, 999);

        const params = new URLSearchParams({
          start: start.toISOString(),
          end: end.toISOString(),
        });

        const res = await fetch(`/api/calendar?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load calendar events');
        const data = await res.json();
        setCalendarEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        setCalendarError(err instanceof Error ? err.message : 'Failed to load calendar events.');
      } finally {
        setCalendarLoading(false);
      }
    };
    void loadCalendarEvents();
  }, [user]);

  // Check onboarding eligibility
  useEffect(() => {
    if (!user || onboardingDismissed) return;
    let cancelled = false;

    async function checkOnboarding() {
      try {
        const res = await fetch("/api/onboarding", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          // Only show onboarding if status is explicitly "incomplete" AND user has an established account
          // Don't show if user is newly provisioned (no local record yet)
          if (data.eligible === true && data.user?.id) {
            setShowOnboarding(true);
          }
        }
      } catch {
        // Onboarding eligibility is non-blocking; keep dashboard data visible.
      }
    }

    void checkOnboarding();
    return () => { cancelled = true; };
  }, [user, onboardingDismissed]);

  // Add guided dashboard tour after first onboarding dismissal
  useEffect(() => {
    if (!onboardingDismissed) return;
    let cancelled = false;

    async function startTour() {
      try {
        // Small delay to let dashboard render first
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Show tour steps - this will render overlay tour after dismissal
        setShowDashboardTour(true);
      } catch {
        // Ignore tour errors.
      }
    }

    void startTour();
    return () => { cancelled = true; };
  }, [onboardingDismissed]);

  const invoicePaidRate = useMemo(() => {
    if (!stats) return 0;
    const total = Object.values(stats.invoices.statuses).reduce((sum, v) => sum + (v || 0), 0);
    const paid = stats.invoices.statuses.paid || 0;
    return total > 0 ? Math.round((paid / total) * 100) : 0;
  }, [stats]);

  // Group events by day for the selected date
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    calendarEvents.forEach(event => {
      const date = new Date(event.startDate);
      if (isNaN(date.getTime())) return;
      const key = localDateKey(date);
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    });
    return grouped;
  }, [calendarEvents]);

  const selectedDayEvents = useMemo(() => {
    const key = localDateKey(selectedDate);
    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, selectedDate]);

  const allUpcomingEvents = useMemo(() => {
    return [...calendarEvents].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [calendarEvents]);

  if (isPending) {
    // Don't replace server-rendered content during hydration
    // Return null to preserve the SSR output; client will hydrate seamlessly
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="ui-shell py-6">
          <AdminPageHeader
            title="Studio Command Center"
            description={`Welcome back, ${name.split(' ')[0]}. Here's what's happening across your studio.`}
            breadcrumb={{ label: 'Dashboard', href: '/admin' }}
            primaryAction={
              <div className="flex flex-wrap items-center gap-2">
                {ranges.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    onClick={() => setRange(opt.value)}
                    variant={range === opt.value ? 'primary' : 'secondary'}
                    size="sm"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            }
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="ui-shell py-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Welcome & Quick Actions */}
        <section className="mb-8">
          <div className="mb-4">
            <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">Start here</p>
            <h2 className="text-2xl font-semibold tracking-tight">Quick actions</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction href="/admin/clients?new=true" label="Add Client" icon={<Users className="h-4 w-4" />} detail="Create new client record" />
            <QuickAction href="/admin/quotes/new" label="Create Quote" icon={<FileText className="h-4 w-4" />} detail="Build a production quote" />
            <QuickAction href="/admin/invoices/new" label="New Invoice" icon={<Receipt className="h-4 w-4" />} detail="Bill for completed work" />
            <QuickAction href="/admin/calendar" label="Schedule Event" icon={<CalendarDays className="h-4 w-4" />} detail="Add to studio calendar" />
          </div>
        </section>

        {/* Loading Skeleton */}
        {loading && !stats && <LoadingSkeleton count={8} />}

        {stats && (
          <>
            {/* Top Row: Business Pulse + Attention Queue */}
            <div className="mb-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
              {/* Business Pulse - Left Column */}
              <div className="space-y-6">
                <Panel
                  eyebrow="Business pulse"
                  title={`Performance ${rangeLabels[range]}`}
                  action={
                    <Link href="/admin/invoices" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ExternalLink className="h-3 w-3" />
                    </Link>
                  }
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <MetricCard
                      label="Quoted in period"
                      value={formatCurrency(stats.finance.periodQuotedValue)}
                      detail="Value of quotes created in this range"
                      href="/admin/quotes"
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Invoiced in period"
                      value={formatCurrency(stats.finance.periodInvoicedValue)}
                      detail={`${stats.overview.newInvoices} invoices created in this range`}
                      href="/admin/invoices"
                      icon={<Receipt className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Collected revenue"
                      value={formatCurrency(stats.finance.periodPaidValue)}
                      detail={`${stats.overview.newInvoices} invoices in period`}
                      href="/admin/invoices"
                      icon={<Wallet className="h-4 w-4" />}
                      trend={{ value: invoicePaidRate, label: 'paid rate' }}
                    />
                    <MetricCard
                      label="Active projects"
                      value={formatNumber(stats.overview.activeProjects)}
                      detail={`${stats.overview.completedProjects} completed`}
                      href="/admin/projects"
                      icon={<LayoutDashboard className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Quote pipeline"
                      value={formatCurrency(stats.finance.acceptedQuoteValue)}
                      detail={`${stats.quotes.conversionRate}% conversion rate`}
                      href="/admin/quotes"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Overdue invoices"
                      value={formatNumber(stats.finance.overdueInvoices)}
                      detail="Invoices past their due date"
                      href="/admin/invoices"
                      icon={<Clock3 className="h-4 w-4" />}
                    />
                  </div>
                </Panel>

                {/* Entity Counts */}
                <Panel
                  eyebrow="Studio overview"
                  title="Entity counts"
                  action={
                    <Link href="/admin/clients" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ExternalLink className="h-3 w-3" />
                    </Link>
                  }
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                      label="Clients"
                      value={formatNumber(stats.overview.clients)}
                      detail={`${stats.overview.activeClients} active · ${stats.overview.newClients} new`}
                      href="/admin/clients"
                      icon={<Users className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Projects"
                      value={formatNumber(stats.overview.projects)}
                      detail={`${stats.overview.activeProjects} active · ${stats.overview.completedProjects} done`}
                      href="/admin/projects"
                      icon={<LayoutDashboard className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Quotes"
                      value={formatNumber(stats.overview.quotes)}
                      detail={`${stats.overview.newQuotes} new · ${stats.quotes.statuses.sent || 0} sent`}
                      href="/admin/quotes"
                      icon={<FileText className="h-4 w-4" />}
                    />
                    <MetricCard
                      label="Galleries"
                      value={formatNumber(stats.overview.galleries)}
                      detail={`${stats.attention.activeGalleries} active`}
                      href="/admin/galleries"
                      icon={<GalleryHorizontalEnd className="h-4 w-4" />}
                    />
                  </div>
                </Panel>
              </div>

              {/* Needs Your Attention - Right Column (Prominent) */}
              <Panel
                eyebrow="Priority queue"
                title="Needs your attention"
                className="lg:sticky lg:top-24 lg:self-start"
              >
                <div className="divide-y divide-border">
                  {stats.attention.overdueInvoices > 0 && (
                    <AttentionItem
                      urgent
                      icon={<Receipt className="h-4 w-4" />}
                      title="Overdue invoices"
                      detail={`${stats.finance.overdueInvoices} invoice${stats.finance.overdueInvoices !== 1 ? 's' : ''} past due — follow up on payments`}
                      count={stats.finance.overdueInvoices}
                      href="/admin/invoices?status=overdue"
                    />
                  )}
                  {((stats.quotes.statuses.sent || 0) + (stats.quotes.statuses.draft || 0)) > 0 && (
                    <AttentionItem
                      icon={<FileText className="h-4 w-4" />}
                      title="Quotes awaiting action"
                      detail={`${stats.quotes.statuses.draft || 0} draft${stats.quotes.statuses.draft !== 1 ? 's' : ''}, ${stats.quotes.statuses.sent || 0} sent — review and follow up`}
                      count={(stats.quotes.statuses.sent || 0) + (stats.quotes.statuses.draft || 0)}
                      href="/admin/quotes"
                    />
                  )}
                  {stats.attention.activeProjects > 0 && (
                    <AttentionItem
                      icon={<LayoutDashboard className="h-4 w-4" />}
                      title="Active projects"
                      detail={`${stats.attention.activeProjects} project${stats.attention.activeProjects !== 1 ? 's' : ''} in production — monitor progress`}
                      count={stats.attention.activeProjects}
                      href="/admin/projects?status=active"
                    />
                  )}
                  {stats.attention.activeGalleries > 0 && (
                    <AttentionItem
                      icon={<GalleryHorizontalEnd className="h-4 w-4" />}
                      title="Active galleries"
                      detail={`${stats.attention.activeGalleries} gallery${stats.attention.activeGalleries !== 1 ? 'ies' : 'y'} live — check client delivery`}
                      count={stats.attention.activeGalleries}
                      href="/admin/galleries"
                    />
                  )}
                  {stats.attention.overdueInvoices === 0 &&
                    (stats.quotes.statuses.sent || 0) + (stats.quotes.statuses.draft || 0) === 0 &&
                    stats.attention.activeProjects === 0 &&
                    stats.attention.activeGalleries === 0 && (
                      <div className="px-5 py-8 text-center">
                        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                        <p className="mt-3 text-sm font-medium text-foreground">All caught up</p>
                        <p className="mt-1 text-sm text-muted-foreground">No items require immediate attention.</p>
                      </div>
                    )}
                </div>
              </Panel>
            </div>

            {/* Upcoming Schedule - Full Width */}
            <Panel
              eyebrow="Upcoming schedule"
              title="Next 7 days"
              action={
                <Link href="/admin/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
                  Open full calendar <ExternalLink className="h-3 w-3" />
                </Link>
              }
            >
              {calendarLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl border border-border bg-card" />
                  ))}
                </div>
              ) : calendarError ? (
                <EmptyState
                  icon={AlertCircle}
                  title="Calendar unavailable"
                  description={calendarError}
                  action={<Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>}
                />
              ) : allUpcomingEvents.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No upcoming events"
                  description="No events scheduled for the next 7 days. Events from projects, quotes, invoices, galleries, and contracts will appear here."
                  action={<Link href="/admin/calendar"><Button>Open calendar</Button></Link>}
                />
              ) : (
                <>
                  {/* Date Strip */}
                  <DateStrip
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    eventsByDay={eventsByDay}
                  />

                  {/* Selected Day Events or Upcoming List */}
                  <div className="mt-4">
                    {selectedDayEvents.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''} on {formatDateShort(selectedDate.toISOString())}
                        </p>
                        <div className="mt-2 space-y-2">
                          {selectedDayEvents.map(event => (
                            <CalendarEventItem key={event.id} event={event} onClick={() => { window.location.href = eventHref(event); }} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">No events on {formatDateShort(selectedDate.toISOString())}</p>
                        <p className="text-sm text-muted-foreground">
                          Showing next {Math.min(allUpcomingEvents.length, 5)} upcoming event{allUpcomingEvents.length !== 1 ? 's' : ''}:
                        </p>
                        <div className="mt-2 space-y-2">
                          {allUpcomingEvents.slice(0, 5).map(event => (
                            <CalendarEventItem key={event.id} event={event} onClick={() => { window.location.href = eventHref(event); }} />
                          ))}
                        </div>
                        {allUpcomingEvents.length > 5 && (
                          <Link href="/admin/calendar" className="mt-3 block text-center text-sm text-primary hover:underline">
                            View all {allUpcomingEvents.length} upcoming events
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Panel>

            {/* Bottom Row: Recent Activity + Quote Pipeline */}
            <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
              <Panel
                eyebrow="Workspace"
                title="Recent activity"
                action={
                  <span className="text-[9px] font-sans uppercase tracking-widest text-muted-foreground">
                    Live from your account
                  </span>
                }
              >
                <div className="divide-y divide-border">
                  {stats.activity.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className="text-sm font-medium text-foreground">No activity yet</p>
                      <p className="text-sm text-muted-foreground">Create a client, project or quote to get started.</p>
                    </div>
                  ) : (
                    stats.activity.map((item) => <ActivityRow key={item.id} {...item} />)
                  )}
                </div>
              </Panel>

              <Panel
                eyebrow="Commercial health"
                title="Quote pipeline"
              >
                <div className="space-y-4">
                  {([
                    ['Draft', Number(stats.quotes.statuses.draft || 0)],
                    ['Sent', Number(stats.quotes.statuses.sent || 0)],
                    ['Accepted', Number(stats.quotes.statuses.accepted || 0)],
                    ['Rejected', Number(stats.quotes.statuses.rejected || 0)],
                    ['Invoiced', Number(stats.quotes.statuses.invoiced || 0)],
                  ] as Array<[string, number]>).filter(([, v]) => v > 0).map(([label, value]) => {
                    const numValue = Number(value);
                    return (
                      <div key={label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-semibold text-foreground">{formatNumber(numValue)}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, Math.round((numValue / Math.max(stats.overview.quotes, 1)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t border-border">
                    <p className="text-[10px] font-sans uppercase tracking-widest text-muted-foreground">Conversion</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{stats.quotes.conversionRate}%</p>
                    <p className="text-sm text-muted-foreground">Accepted vs. decided quotes.</p>
                  </div>
                </div>
              </Panel>
            </div>
          </>
        )}

        {showOnboarding && (
          <CreatorOnboardingModal
            isOpen={showOnboarding}
            onClose={() => {
              setShowOnboarding(false);
              setOnboardingDismissed(true);
            }}
            onComplete={() => {
              setShowOnboarding(false);
              setOnboardingDismissed(true);
            }}
            onDismiss={() => {
              setShowOnboarding(false);
              setOnboardingDismissed(true);
            }}
          />
        )}

        {showDashboardTour && (
          <DashboardTour onClose={() => setShowDashboardTour(false)} />
        )}
      </div>
    </main>
  );
}