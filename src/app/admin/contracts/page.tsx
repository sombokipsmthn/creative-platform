'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, CheckCircle as CheckCircle2, FilePlus, Signature as FileSignature, CircleNotch as Loader2, Plus, ArrowsClockwise as RefreshCw, Trash as Trash2 } from "@phosphor-icons/react";

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { StandardCreationDialog } from '@/components/admin/StandardCreationDialog';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import StatusBadge from '@/components/admin/StatusBadge';
import StatCards from '@/components/admin/StatCards';

type Contract = {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  clientName: string;
  projectName?: string | null;
  createdAt: string;
  sentAt?: string | null;
  signedAt?: string | null;
};

type Client = {
  id: string;
  name: string;
  company?: string | null;
};

type Stats = {
  total: number;
  draft: number;
  sent: number;
  viewed: number;
  awaiting_signature: number;
  signed: number;
  declined: number;
  expired: number;
  cancelled: number;
};

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    sent: 0,
    viewed: 0,
    awaiting_signature: 0,
    signed: 0,
    declined: 0,
    expired: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [clientId, setClientId] = useState<string>('all');

  // Fetch clients for the filter
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data = await res.json();
        setClients(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch clients:', err);
      }
    };
    fetchClients();
  }, []);

  // Fetch contracts, stats, and templates (we only need contracts and stats here)
  const loadContracts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set('search', search);
      params.set('status', status);
      if (clientId !== 'all') params.set('clientId', clientId);

      const res = await fetch(`/api/contracts?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.status === 401) {
        throw new Error('Please sign in to view your contracts.');
      }
      if (!res.ok) throw new Error('Failed to fetch contracts data');
      const data = await res.json();
      setContracts(data.contracts || []);
      setStats(data.stats || {
        total: 0,
        draft: 0,
        sent: 0,
        viewed: 0,
        awaiting_signature: 0,
        signed: 0,
        declined: 0,
        expired: 0,
        cancelled: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [search, status, clientId]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  return (
    <div className="admin-data-page font-sans transition-colors duration-300">
      <div className="admin-data-page__content space-y-6">
        <AdminPageHeader
          title="Contracts"
          description="Create, send and manage agreements with your clients."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsCreateOpen(true)}
              className="text-xs font-sans uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" />
              New Contract
            </Button>
          }
        />

        {error && !loading && (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadContracts()}>Retry</Button>
          </div>
        )}

        <StandardCreationDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Start a new contract" description="Choose the client and template in the existing contract builder before creating a draft.">
          <div className="space-y-4 pr-8">
            <p className="ui-eyebrow">LEGAL</p>
            <h2 className="ui-section-title">Start a new contract</h2>
            <p className="text-sm text-muted-foreground">The contract builder preserves templates, clauses, associations, and draft status in one supported workflow.</p>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => router.push('/admin/contracts/builder')}>Continue to contract builder <ArrowUpRight aria-hidden="true" /></Button>
          </div>
        </StandardCreationDialog>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <StatCards
            stats={[
              { label: 'Total Contracts', value: String(stats.total), detail: '', color: 'default' },
              { label: 'Drafts', value: String(stats.draft), detail: '', color: 'default' },
              { label: 'Sent', value: String(stats.sent), detail: '', color: 'accent' },
              { label: 'Awaiting Signature', value: String(stats.awaiting_signature), detail: '', color: 'info' },
            ]}
            columns={4}
          />
        </div>

        {/* Admin Resource Toolbar */}
        <AdminResourceToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search contracts by title, client, number…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: status,
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Draft', value: 'draft' },
                { label: 'Sent', value: 'sent' },
                { label: 'Viewed', value: 'viewed' },
                { label: 'Awaiting Signature', value: 'awaiting_signature' },
                { label: 'Signed', value: 'signed' },
                { label: 'Declined', value: 'declined' },
                { label: 'Expired', value: 'expired' },
                { label: 'Cancelled', value: 'cancelled' },
              ],
            },
            {
              id: 'clientId',
              label: 'Client',
              value: clientId,
              options: [
                { label: 'All Clients', value: 'all' },
                ...clients.map((client) => ({
                  label: client.name + (client.company ? ` (${client.company})` : ''),
                  value: client.id,
                })),
              ],
            },
          ] as AdminFilterConfig[]}
          onFilterChange={(id, value) => {
            if (id === 'status') setStatus(value ?? 'all');
            if (id === 'clientId') setClientId(value ?? 'all');
          }}
          onClearAll={() => {
            setSearch('');
            setStatus('all');
            setClientId('all');
          }}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: () => void loadContracts(true),
              variant: 'ghost',
              size: 'icon',
              icon: <RefreshCw className="h-4 w-4" />,
            } as AdminToolbarAction,
          ]}
          resultCount={stats.total}
          filteredCount={contracts.length}
          resultLabel="Contracts"
          loading={loading}
        />

        {/* TABLE */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          {loading ? (
            <div className="space-y-4 p-6" role="status" aria-label="Loading contracts">
              <span className="sr-only">Loading contracts…</span>
              {[0, 1, 2, 3, 4].map((row) => <div key={row} className="flex gap-4">{[0, 1, 2, 3, 4].map((column) => <Skeleton key={column} className="h-8 flex-1" />)}</div>)}
            </div>
          ) : contracts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center sm:p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FilePlus className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-xl font-semibold tracking-tight">{Number(stats.total) === 0 ? 'No contracts yet' : 'No matching contracts'}</h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {Number(stats.total) === 0
                  ? 'Create a contract or browse templates to get started.'
                  : 'Try changing your search or filters to find a contract.'}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {Number(stats.total) === 0 ? (
                  <>
                    <Button type="button" variant="primary" onClick={() => setIsCreateOpen(true)}>
                      Create first contract
                    </Button>
                    <Button type="button" variant="outline" onClick={() => window.location.assign('/admin/contracts/templates')}>
                      Browse templates
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="outline" onClick={() => { setSearch(''); setStatus('all'); setClientId('all'); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <AdminDataTable
              rows={contracts}
              getRowLabel={(contract) => contract.title}
              mobileCard={(contract, actions) => (
                <div className="min-w-0 space-y-3">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{contract.title}</p>
                      <p className="break-all text-xs text-muted-foreground">#{contract.contractNumber}</p>
                    </div>
                    {actions}
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
                    <span className="min-w-0 break-words">{contract.clientName}</span>
                    <StatusBadge status={contract.status} />
                  </div>
                  {contract.projectName && <p className="break-words text-xs text-muted-foreground">{contract.projectName}</p>}
                </div>
              )}
              columns={[
                { id: 'contract', header: 'Contract', cell: (contract) => <div><p className="font-medium">{contract.title}</p><p className="text-xs text-muted-foreground">#{contract.contractNumber}</p></div>, accessor: (contract) => contract.title, sortable: true },
                { id: 'client', header: 'Client', accessor: (contract) => contract.clientName },
                { id: 'project', header: 'Project', accessor: (contract) => contract.projectName || 'None', hideOnMobile: true },
                { id: 'status', header: 'Status', cell: (contract) => <StatusBadge status={contract.status} />, accessor: (contract) => contract.status },
                { id: 'created', header: 'Created', cell: (contract) => new Date(contract.createdAt).toLocaleDateString(), accessor: (contract) => contract.createdAt, hideOnMobile: true },
                { id: 'signed', header: 'Signed', cell: (contract) => contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : '—', accessor: (contract) => contract.signedAt, hideOnMobile: true },
              ]}
              rowActions={[
                { label: 'View', onSelect: (contract) => window.location.assign(`/admin/contracts/${contract.id}`) },
                { label: 'Edit', onSelect: (contract) => window.location.assign(`/admin/contracts/${contract.id}/edit`) },
                { label: 'Send', hidden: (contract) => contract.status !== 'draft', onSelect: (contract) => window.location.assign(`/admin/contracts/${contract.id}/send`) },
                { label: 'Duplicate', hidden: (contract) => contract.status !== 'draft', onSelect: (contract) => window.location.assign(`/admin/contracts/${contract.id}/duplicate`) },
                { label: 'Delete', destructive: true, onSelect: () => window.location.reload() },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}