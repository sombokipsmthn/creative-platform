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

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

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
    <Card className="">
      <CardHeader className="">
        <CardTitle className="">
          {label}
        </CardTitle>
        <div className="">
          <Icon className="" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="tabular-nums">
          {value}
        </div>
        <p className="">{detail}</p>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={href}>
            <span>View all</span>
            <ChevronRight className="" />
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
    <Link href={href} className="block">
      <Card className="">
        <CardContent className="">
          <div className="">
            <Icon className="" />
          </div>
          <div className="">
            <p className="">
              {label}
            </p>
            <p className="">{detail}</p>
          </div>
          <ArrowUpRight className="" />
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
    <div className="">
      <div className="">
        <Icon className="" />
      </div>
      <div className="">
        <p className="">{item.title}</p>
        <p className="">{item.description}</p>
      </div>
      <time className="tabular-nums">
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
      <div className="">
        <div className="">
          <Skeleton className="" />
          <Skeleton className="" />
        </div>
        <div className="">
          <Skeleton className="" />
          <Skeleton className="" />
          <Skeleton className="" />
          <Skeleton className="" />
        </div>
        <div className="">
          <Skeleton className="" />
          <Skeleton className="" />
        </div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Top Welcome Header */}
      <div className="">
        <div>
          <div className="">
            <h1 className="">
              Welcome back, {activeCreator?.name || 'Creator'}
            </h1>
            <Badge variant="outline" className="hidden">
              Studio Active
            </Badge>
          </div>
          <p className="">
            Complete overview of clients, quotations, active productions, and invoices.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="">
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
          <AlertCircle className="" />
          <AlertTitle>Error loading dashboard</AlertTitle>
          <AlertDescription className="">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryCount((c) => c + 1)}
              className=""
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* METRICS GRID */}
      <section className="">
        <div className="">
          <h2 className="">
            Key Performance Metrics
          </h2>
          <span className="">Updated in real-time</span>
        </div>

        <div className="">
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
      <section className="">
        <h2 className="">
          Quick Workflows
        </h2>

        <div className="">
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
      <div className="">
        {/* Money Flow Card */}
        <Card>
          <CardHeader>
            <div className="">
              <CardTitle className="">
                Financial Movement
              </CardTitle>
              <Badge variant="secondary" className="">
                <TrendingUp className="" />
                Revenue Pipeline
              </Badge>
            </div>
            <CardDescription>
              Quoted proposals vs issued invoices and received payments
            </CardDescription>
          </CardHeader>
          <CardContent className="">
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
                <div key={label as string} className="">
                  <div className="">
                    <span className="">{label}</span>
                    <span className="">
                      {formatCurrency(value as number)}
                    </span>
                  </div>
                  <div className="">
                    <div
                      className=""
                      style={{ width: `${Math.max(percentage > 0 ? 4 : 0, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="">
              <div className="">
                <p className="">
                  Accepted Quotes
                </p>
                <p className="">
                  {formatCurrency(stats?.finance.acceptedQuoteValue || 0)}
                </p>
              </div>
              <div className="">
                <p className="">
                  Overdue Invoices
                </p>
                <p className="">
                  {number(stats?.finance.overdueInvoices || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quote Pipeline Status */}
        <Card>
          <CardHeader>
            <div className="">
              <CardTitle className="">
                Quotation Pipeline
              </CardTitle>
              <Badge variant="outline" className="">
                {number(stats?.overview.quotes || 0)} Total
              </Badge>
            </div>
            <CardDescription>
              Conversion flow of quotes through creation to invoiced
            </CardDescription>
          </CardHeader>
          <CardContent className="">
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
                <div key={key} className="">
                  <div className="">
                    <span className="">{label}</span>
                    <span className="">
                      {number(count)}{' '}
                      <span className="">
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                  <div className="">
                    <div
                      className=""
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
      <div className="">
        {/* Recent Activity Feed */}
        <Card className="">
          <CardHeader className="">
            <div>
              <CardTitle className="">
                Recent Studio Activity
              </CardTitle>
              <CardDescription>
                Real-time chronological events across your workspace
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="">
              <Link href="/admin">Refresh</Link>
            </Button>
          </CardHeader>
          <CardContent className="">
            {stats?.activity && stats.activity.length > 0 ? (
              stats.activity.slice(0, 7).map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))
            ) : (
              <div className="">
                <Clock3 className="" />
                No recent activity recorded yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Items / Attention List */}
        <Card className="">
          <CardHeader className="">
            <CardTitle className="">
              Action Items
            </CardTitle>
            <CardDescription>
              Tasks and status milestones requiring creator review
            </CardDescription>
          </CardHeader>
          <CardContent className="">
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
                  className=""
                >
                  <div className="">
                    <div className="">
                      <Icon className="" />
                    </div>
                    <div>
                      <p className="">
                        {actionItem.label}
                      </p>
                      <p className="">
                        Review in workspace
                      </p>
                    </div>
                  </div>
                  <Badge variant={actionItem.badgeVariant} className="">
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
