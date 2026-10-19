'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCreator } from '@/context/CreatorContext';
import { formatCurrency } from '@/lib/utils';
import {
  AlertCircle,
  ArrowUpRight,
  Clock3,
  FileText,
  FolderKanban,
  GalleryHorizontalEnd,
  Receipt,
  Sparkles,
  Users,
  Wallet,
  X,
  Plus,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Range = '7d' | '30d' | '90d' | '12m' | 'all';

type DashboardStats = {
  range: Range;
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
};

const ranges: Array<{ value: Range; label: string }> = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '12m', label: '12 months' },
  { value: 'all', label: 'All time' },
];

function number(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function date(value: string) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  detail,
  href,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="transition-all hover:border-ring/50 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
          {value}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        <Button asChild variant="ghost" size="sm" className="mt-3 -ml-2 h-7 px-2 text-xs font-normal text-muted-foreground hover:text-foreground">
          <Link href={href}>
            <span>View all</span>
            <ChevronRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function QuickActionButton({
  href,
  label,
  detail,
  icon: Icon,
}: {
  href: string;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link href={href} className="group block">
      <Card className="transition-all hover:border-primary hover:shadow-sm">
        <CardContent className="flex items-center gap-3.5 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {label}
            </p>
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}

function ActivityRow({
  item,
}: {
  item: DashboardStats['activity'][number];
}) {
  const icons = {
    client: Users,
    project: FolderKanban,
    quote: FileText,
    invoice: Receipt,
    gallery: GalleryHorizontalEnd,
  };
  const Icon = icons[item.type] || FileText;

  return (
    <div className="flex items-center gap-3.5 py-3 transition-colors hover:bg-muted/30 px-3 rounded-lg">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
      </div>
      <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {date(item.date)}
      </time>
    </div>
  );
}

export default function CreativeOSDashboardPage() {
  const { activeCreator } = useCreator();
  const [range, setRange] = useState<Range>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    async function load() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/dashboard/stats?range=${range}`, {
          cache: 'no-store',
          credentials: 'include',
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            typeof data?.error === 'string'
              ? data.error
              : `Dashboard request failed (HTTP ${response.status}).`;
          throw new Error(message);
        }

        if (!data || typeof data !== 'object' || !data.overview || !data.finance) {
          throw new Error('The dashboard API returned an invalid response.');
        }

        if (!cancelled) setStats(data as DashboardStats);
      } catch (err) {
        if (cancelled) return;

        if (err instanceof DOMException && err.name === 'AbortError') {
          setError('The dashboard request timed out. Please try again.');
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [range, retryCount]);

  if (loading && !stats) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-hidden p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back, {activeCreator?.name || 'Creator'}
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex text-xs">
              Studio Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete overview of clients, quotations, active productions, and invoices.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 p-1 pl-0 bg-muted rounded-lg border">
          {ranges.map((option) => (
            <Button
              key={option.value}
              variant={range === option.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRange(option.value)}
              className={`h-7 px-2.5 text-xs font-medium rounded-md ${
                range === option.value ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground'
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading dashboard</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryCount((c) => c + 1)}
              className="ml-4 h-7 text-xs"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* METRICS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Key Performance Metrics
          </h2>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Clients"
            value={number(stats?.overview.clients || 0)}
            detail={`+${number(stats?.overview.newClients || 0)} in period`}
            href="/admin/clients"
            icon={Users}
          />
          <MetricCard
            label="Active Galleries"
            value={number(stats?.overview.galleries || 0)}
            detail={`${number(stats?.attention.activeGalleries || 0)} delivering proofs`}
            href="/admin/galleries"
            icon={GalleryHorizontalEnd}
          />
          <MetricCard
            label="Quotations"
            value={number(stats?.overview.quotes || 0)}
            detail={`${number(stats?.quotes.conversionRate || 0)}% conversion rate`}
            href="/admin/quotes"
            icon={FileText}
          />
          <MetricCard
            label="Invoices"
            value={number(stats?.overview.invoices || 0)}
            detail={`${stats?.finance.periodPaidValue ? Math.round((stats.finance.periodPaidValue / (stats.finance.periodInvoicedValue || 1)) * 100) : 0}% collected`}
            href="/admin/invoices"
            icon={Receipt}
          />
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Quick Workflows
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionButton
            href="/admin/clients"
            label="Client Directory"
            detail="Manage CRM & contacts"
            icon={Users}
          />
          <QuickActionButton
            href="/admin/quotes/new"
            label="Create Quote"
            detail="Estimate equipment & crew"
            icon={FileText}
          />
          <QuickActionButton
            href="/admin/invoices/new"
            label="Issue Invoice"
            detail="eTIMS & payment tracking"
            icon={Receipt}
          />
          <QuickActionButton
            href="/admin/galleries"
            label="Client Galleries"
            detail="Deliver proofs with PIN"
            icon={GalleryHorizontalEnd}
          />
        </div>
      </section>

      {/* FINANCIAL & PIPELINE TWO-COLUMN */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Money Flow Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Financial Movement
              </CardTitle>
              <Badge variant="secondary" className="gap-1 text-xs">
                <TrendingUp className="h-3 w-3 text-primary" />
                Revenue Pipeline
              </Badge>
            </div>
            <CardDescription>
              Quoted proposals vs issued invoices and received payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              ['Quoted', stats?.finance.periodQuotedValue || 0],
              ['Invoiced', stats?.finance.periodInvoicedValue || 0],
              ['Collected', stats?.finance.periodPaidValue || 0],
            ].map(([label, value]) => {
              const max = Math.max(
                stats?.finance.periodQuotedValue || 0,
                stats?.finance.periodInvoicedValue || 0,
                stats?.finance.periodPaidValue || 0,
                1
              );
              const percentage = Math.round(((value as number) / max) * 100);

              return (
                <div key={label as string} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(value as number)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.max(percentage > 0 ? 4 : 0, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Accepted Quotes
                </p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {formatCurrency(stats?.finance.acceptedQuoteValue || 0)}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Overdue Invoices
                </p>
                <p className="mt-1 text-lg font-bold text-destructive">
                  {number(stats?.finance.overdueInvoices || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Pipeline Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Quotation Pipeline
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {number(stats?.overview.quotes || 0)} Total
              </Badge>
            </div>
            <CardDescription>
              Conversion flow of quotes through creation to invoiced
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {[
              ['Draft', 'draft'],
              ['Sent', 'sent'],
              ['Accepted', 'accepted'],
              ['Rejected', 'rejected'],
              ['Invoiced', 'invoiced'],
            ].map(([label, key]) => {
              const count = stats?.quotes.statuses[key] || 0;
              const total = Math.max(stats?.overview.quotes || 0, 1);
              const percentage = Math.round((count / total) * 100);

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">
                      {number(count)}{' '}
                      <span className="text-[11px] text-muted-foreground font-normal">
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY & ATTENTION REQUIRED */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Studio Activity
              </CardTitle>
              <CardDescription>
                Real-time chronological events across your workspace
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
              <Link href="/admin">Refresh</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {stats?.activity && stats.activity.length > 0 ? (
              stats.activity.slice(0, 7).map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Clock3 className="mx-auto mb-2 h-5 w-5 opacity-40" />
                No recent activity recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items / Attention List */}
        <Card className="lg:col-span-5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Action Items
            </CardTitle>
            <CardDescription>
              Tasks and status milestones requiring creator review
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {[
              {
                label: 'Overdue Invoices',
                count: stats?.attention.overdueInvoices || 0,
                href: '/admin/invoices',
                icon: Wallet,
                badgeVariant: 'destructive' as const,
              },
              {
                label: 'Pending Quotes',
                count: stats?.attention.pendingQuotes || 0,
                href: '/admin/quotes',
                icon: FileText,
                badgeVariant: 'secondary' as const,
              },
              {
                label: 'Active Productions',
                count: stats?.attention.activeProjects || 0,
                href: '/admin/projects',
                icon: FolderKanban,
                badgeVariant: 'secondary' as const,
              },
              {
                label: 'Client Proof Galleries',
                count: stats?.attention.activeGalleries || 0,
                href: '/admin/galleries',
                icon: GalleryHorizontalEnd,
                badgeVariant: 'secondary' as const,
              },
            ].map((actionItem) => {
              const Icon = actionItem.icon;
              return (
                <Link
                  key={actionItem.label}
                  href={actionItem.href}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {actionItem.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Review in workspace
                      </p>
                    </div>
                  </div>
                  <Badge variant={actionItem.badgeVariant} className="font-mono">
                    {number(actionItem.count)}
                  </Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
