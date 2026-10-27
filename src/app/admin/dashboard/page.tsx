'use client';

import { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Calendar, Users, FolderKanban, FileText, Receipt, WalletCards, Settings2, Sparkles, ExternalLink, GalleryHorizontalEnd } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useCreator } from '@/context/CreatorContext';
import { useQuery } from '@tanstack/react-query';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import StatCards from '@/components/admin/StatCards';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import StatusBadge from '@/components/admin/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardData {
  range: string;
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
  activity: Array<{ id: string; type: string; title: string; description: string; date: string }>;
}

function useDashboardData(range: '7d' | '30d' | '90d' | '12m' | 'all' = '30d') {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', range],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats?range=${range}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load dashboard data');
      return res.json() as Promise<DashboardData>;
    },
    refetchInterval: false,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
  return { data, isLoading, isError };
}

function formatAmount(amount: number | null | undefined, currency: string | null | undefined) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return `${formatCurrency(amount, currency || 'KES')}`;
}

export default function DashboardPage() {
  const pathname = usePathname();
  const { data, isLoading, isError } = useDashboardData();
  const { activeUser: me } = useCreator();

  const [range, setRange] = useState<'7d' | '30d' | '90d' | '12m' | 'all'>('30d');

  // KPI counts from dashboard data
  const overview = data?.overview ?? {
    clients: 0, newClients: 0, activeClients: 0,
    projects: 0, newProjects: 0, activeProjects: 0, completedProjects: 0,
    quotes: 0, newQuotes: 0,
    invoices: 0, newInvoices: 0,
    galleries: 0, newGalleries: 0,
  };

  const finance = data?.finance ?? {
    periodQuotedValue: 0, acceptedQuoteValue: 0,
    periodInvoicedValue: 0, periodPaidValue: 0, overdueInvoices: 0,
  };

  const attention = data?.attention ?? {
    overdueInvoices: 0, pendingQuotes: 0,
    activeProjects: 0, activeGalleries: 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Range selector skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="h-10 w-20 animate-pulse bg-muted rounded-lg" />
              <div className="h-10 w-20 animate-pulse bg-muted rounded-lg" />
              <div className="h-10 w-20 animate-pulse bg-muted rounded-lg" />
              <div className="h-10 w-20 animate-pulse bg-muted rounded-lg" />
              <div className="h-10 w-20 animate-pulse bg-muted rounded-lg" />
            </div>
            {/* Header skeleton */}
            <div className="mb-6">
              <div className="h-4 w-48 animate-pulse bg-muted rounded mb-2" />
              <div className="h-6 w-64 animate-pulse bg-muted rounded" />
            </div>
            {/* KPI Cards skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 mb-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 w-32 animate-pulse bg-muted rounded mb-2" />
                  <div className="h-8 w-24 animate-pulse bg-muted rounded" />
                  <div className="h-3 w-20 animate-pulse bg-muted rounded mt-1" />
                </div>
              ))}
            </div>
            {/* Financial Summary skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
                  <div className="h-4 w-24 animate-pulse bg-muted rounded mb-2" />
                  <div className="h-8 w-32 animate-pulse bg-muted rounded" />
                </div>
              ))}
            </div>
            {/* Attention Items skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl border bg-card p-4">
                  <div className="h-4 w-28 animate-pulse bg-muted rounded mb-2" />
                  <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                </div>
              ))}
            </div>
            {/* Recent Activity skeleton */}
            <div className="animate-pulse rounded-xl border bg-card p-6">
              <div className="h-5 w-32 animate-pulse bg-muted rounded mb-4" />
              <div className="space-y-3 max-h-80">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-6 w-6 animate-pulse bg-muted rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-40 animate-pulse bg-muted rounded mb-1" />
                      <div className="h-3 w-48 animate-pulse bg-muted rounded" />
                    </div>
                    <div className="h-3 w-24 animate-pulse bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
            {/* Upcoming Deadlines skeleton */}
            <div className="animate-pulse rounded-xl border bg-card p-6">
              <div className="h-5 w-32 animate-pulse bg-muted rounded mb-4" />
              <div className="space-y-4">
                <div className="h-4 w-40 animate-pulse bg-muted rounded mb-1" />
                <div className="h-3 w-32 animate-pulse bg-muted rounded" />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Range selector */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRange('7d')}
            className={range === '7d' ? 'bg-primary/10 text-primary' : ''}
          >
            7d
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRange('30d')}
            className={range === '30d' ? 'bg-primary/10 text-primary' : ''}
          >
            30d
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRange('90d')}
            className={range === '90d' ? 'bg-primary/10 text-primary' : ''}
          >
            90d
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRange('12m')}
            className={range === '12m' ? 'bg-primary/10 text-primary' : ''}
          >
            12m
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRange('all')}
            className={range === 'all' ? 'bg-primary/10 text-primary' : ''}
          >
            All
          </Button>
        </div>

        {/* Header */}
        <AdminPageHeader
          title="Command Center"
          description={`Welcome back, ${me?.name || 'Creative'}`}
          primaryAction={
            <Button
              variant="primary"
              className="text-xs font-sans uppercase tracking-widest"
              onClick={() => pathname !== '/admin/clients' && (window.location.href = '/admin/clients')}
            >
              + New Client
            </Button>
          }
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 mb-6">
          <StatCards
            stats={[
              { label: 'Total Clients', value: String(overview.clients), detail: 'New this period: ' + String(overview.newClients), color: 'default' },
              { label: 'Active', value: String(overview.activeClients), detail: 'Of ' + String(overview.clients), color: 'success' },
              { label: 'Projects', value: String(overview.projects), detail: 'New: ' + String(overview.newProjects), color: 'default' },
              { label: 'Active Projects', value: String(overview.activeProjects), detail: 'Of ' + String(overview.projects), color: 'success' },
              { label: 'Completed', value: String(overview.completedProjects), detail: 'Projects finished', color: 'default' },
              { label: 'Quotes', value: String(overview.quotes), detail: 'New: ' + String(overview.newQuotes), color: 'default' },
              { label: 'Invoices', value: String(overview.invoices), detail: 'New: ' + String(overview.newInvoices), color: 'default' },
              { label: 'Galleries', value: String(overview.galleries), detail: 'New: ' + String(overview.newGalleries), color: 'default' },
            ]}
            columns={4}
          />
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Period Quoted</p>
            <p className="text-2xl font-bold">{formatAmount(finance.periodQuotedValue, 'KES')}</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Accepted Value</p>
            <p className="text-2xl font-bold text-emerald-600">{formatAmount(finance.acceptedQuoteValue, 'KES')}</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Invoiced Value</p>
            <p className="text-2xl font-bold text-cyan-600">{formatAmount(finance.periodInvoicedValue, 'KES')}</p>
          </div>
        </div>

        {/* Attention Items */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-xl border bg-red-500/10 bg-card text-card-foreground p-4 shadow-sm border-red-500/20">
            <p className="text-sm font-medium text-red-600">Overdue Invoices</p>
            <p className="text-2xl font-bold">{String(attention.overdueInvoices)}</p>
          </div>
          <div className="rounded-xl border bg-amber-500/10 bg-card text-card-foreground p-4 shadow-sm border-amber-500/20">
            <p className="text-sm font-medium text-amber-600">Pending Quotes</p>
            <p className="text-2xl font-bold">{String(attention.pendingQuotes)}</p>
          </div>
          <div className="rounded-xl border bg-emerald-500/10 bg-card text-card-foreground p-4 shadow-sm border-emerald-500/20">
            <p className="text-sm font-medium text-emerald-600">Active Projects</p>
            <p className="text-2xl font-bold">{String(attention.activeProjects)}</p>
          </div>
          <div className="rounded-xl border bg-primary-soft bg-card text-card-foreground p-4 shadow-sm border-primary/20">
            <p className="text-sm font-medium text-primary">Active Galleries</p>
            <p className="text-2xl font-bold">{String(attention.activeGalleries)}</p>
          </div>
        </div>

        {/* Recent Activity */}
        {!isLoading && !isError && data && data.activity?.length > 0 && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="ui-section-title text-lg font-semibold tracking-tight mb-4">Recent Activity</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {data.activity.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/20 transition-colors"
                >
                  <StatusBadge status={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar / Upcoming Deadlines */}
        {!isLoading && data && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="ui-section-title text-lg font-semibold tracking-tight mb-4">Upcoming Deadlines</h2>
            <div className="space-y-4">
              {/* Invoices due */}
              {data?.finance?.overdueInvoices > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600">Overdue Invoices: {String(data.finance.overdueInvoices)}</p>
                  <p className="text-xs text-muted-foreground">Past due date</p>
                </div>
              )}
              {/* Pending quotes */}
              {(data?.quotes?.statuses?.sent ?? 0) > 0 && (
                <div>
                  <p className="text-sm font-medium text-amber-600">Pending Quotes: {String(data.quotes?.statuses?.sent ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">Awaiting client response</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Links / Navigation */}
        <div className="mt-8 pt-8 border-t border-border/70">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Navigation</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/clients'}
              className="flex items-center gap-2"
            >
              <Users className="h-3.5 w-3.5" />Clients
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/projects'}
              className="flex items-center gap-2"
            >
              <FolderKanban className="h-3.5 w-3.5" />Projects
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/quotes'}
              className="flex items-center gap-2"
            >
              <FileText className="h-3.5 w-3.5" />Quotes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/invoices'}
              className="flex items-center gap-2"
            >
              <Receipt className="h-3.5 w-3.5" />Invoices
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/galleries'}
              className="flex items-center gap-2"
            >
              <GalleryHorizontalEnd className="h-3.5 w-3.5" />Galleries
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/portfolio'}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5" />Portfolio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/settings'}
              className="flex items-center gap-2"
            >
              <Settings2 className="h-3.5 w-3.5" />Settings
            </Button>
          </div>
        </div>
      </>
        )}
      </div>
    </div>
  );
}