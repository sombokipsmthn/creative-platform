'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  FilePlus,
  FileSignature,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

import TableFilterBar from '@/components/admin/TableFilterBar';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { StandardCreationDialog } from '@/components/admin/StandardCreationDialog';
import AdminDataTable from '@/components/admin/AdminDataTable';

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
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
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
    };
    fetchData();
  }, [search, status, clientId]);

  function formatStatus(status: string) {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'draft':
        return 'ui-badge';
      case 'sent':
        return 'ui-badge ui-badge-accent';
      case 'viewed':
        return 'ui-badge ui-badge-accent';
      case 'awaiting_signature':
        return 'ui-badge ui-badge-info';
      case 'signed':
        return 'ui-badge ui-badge-success';
      case 'declined':
        return 'ui-badge ui-badge-danger';
      case 'expired':
        return 'ui-badge ui-badge-warning';
      case 'cancelled':
        return 'ui-badge ui-badge-danger';
      default:
        return 'ui-badge';
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          title="Contracts"
          description="Create, send and manage agreements with your clients."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              variant="primary"
              className="text-xs font-sans uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" />
              New Contract
            </Button>
          }
        />

        {error && !loading && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
            <Button type="button" onClick={() => window.location.assign('/admin/contracts/new')}>Continue to contract builder <ArrowUpRight aria-hidden="true" /></Button>
          </div>
        </StandardCreationDialog>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Total Contracts</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.draft}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Sent</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.sent}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Viewed</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.viewed}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Awaiting Signature</p>
            <p className="text-2xl font-bold text-primary dark:text-primary">
              {stats.awaiting_signature}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Signed</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.signed}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Declined</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.declined}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Expired</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.expired}
            </p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.cancelled}
            </p>
          </div>
        </div>

        {/* Table Filter Bar */}
        <TableFilterBar
          search={search}
          onSearchChange={setSearch}
          filters={{ status, clientId }}
          onFiltersChange={(filters) => {
            setSearch(filters.search ?? '');
            setStatus(filters.status ?? 'all');
            setClientId(filters.clientId ?? 'all');
          }}
          onAddItem={() => {
            // We'll handle the "New Contract" button in the header
          }}
          filterOptions={ [
            {
              label: 'Status',
              value: 'status',
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
              ]
            },
            {
              label: 'Client',
              value: 'clientId',
              options: [
                { label: 'All Clients', value: 'all' },
                ...clients.map(client => ({
                  label: client.name + (client.company ? ` (${client.company})` : ''),
                  value: client.id,
                })),
              ]
            }
          ] }
          itemLabel="Contract"
        />

        {/* TABLE */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-xs font-sans uppercase tracking-widest">
                Loading contracts…
              </p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FilePlus className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">No contracts yet</h2>

              <p className="text-sm text-muted-foreground">
                Create your first contract or browse templates.
              </p>

              <div className="flex justify-center mt-4">
                <Button
                  variant="primary"
                  className="mt-6"
                >
                  Create First Contract
                </Button>
              </div>
            </div>
          ) : (
            <AdminDataTable
              rows={contracts}
              getRowLabel={(contract) => contract.title}
              columns={[
                { id: 'contract', header: 'Contract', cell: (contract) => <div><p className="font-medium">{contract.title}</p><p className="text-xs text-muted-foreground">#{contract.contractNumber}</p></div>, accessor: (contract) => contract.title, sortable: true },
                { id: 'client', header: 'Client', accessor: (contract) => contract.clientName },
                { id: 'project', header: 'Project', accessor: (contract) => contract.projectName || 'None', hideOnMobile: true },
                { id: 'status', header: 'Status', cell: (contract) => <span className={getStatusBadgeClass(contract.status)}>{formatStatus(contract.status)}</span>, accessor: (contract) => contract.status },
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