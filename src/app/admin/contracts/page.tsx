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
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

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
    <div className="">
      <div className="">
        <AdminPageHeader
          title="Contracts"
          description="Create, send and manage agreements with your clients."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              variant="primary"
              className=""
            >
              <Plus className="" />
              New Contract
            </Button>
          }
        />

        {error && !loading && (
          <div className="ui-card">
            <p className="">{error}</p>
          </div>
        )}

        {/* SUMMARY */}
        <div className="">
          <div className="ui-stat-card">
            <p className="ui-stat-label">Total Contracts</p>
            <p className="ui-stat-value">{stats.total}</p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Drafts</p>
            <p className="ui-stat-value">
              {stats.draft}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Sent</p>
            <p className="ui-stat-value">
              {stats.sent}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Viewed</p>
            <p className="ui-stat-value">
              {stats.viewed}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Awaiting Signature</p>
            <p className="ui-stat-value">
              {stats.awaiting_signature}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Signed</p>
            <p className="ui-stat-value">
              {stats.signed}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Declined</p>
            <p className="ui-stat-value">
              {stats.declined}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Expired</p>
            <p className="ui-stat-value">
              {stats.expired}
            </p>
          </div>

          <div className="ui-stat-card">
            <p className="ui-stat-label">Cancelled</p>
            <p className="ui-stat-value">
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
        <div className="ui-card">
          {loading ? (
            <div className="ui-loading-state">
              <p className="">
                Loading contracts…
              </p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="ui-empty-state">
              <div className="ui-empty-icon">
                <FilePlus className="" />
              </div>

              <h2 className="ui-section-title">No contracts yet</h2>

              <p className="ui-body">
                Create your first contract or browse templates.
              </p>

              <div className="">
                <Button
                  variant="primary"
                  className=""
                >
                  Create First Contract
                </Button>
              </div>
            </div>
          ) : (
            <div className="">
              <table className="ui-table">
                <thead>
                  <tr>
                    <th className="ui-table-header">Contract</th>
                    <th className="ui-table-header">Client</th>
                    <th className="ui-table-header">Project</th>
                    <th className="ui-table-header">Status</th>
                    <th className="ui-table-header">Created</th>
                    <th className="ui-table-header">Sent</th>
                    <th className="ui-table-header">Signed</th>
                    <th className="ui-table-header" />
                  </tr>
                </thead>

                <tbody>
                  {contracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="ui-table-row"
                    >
                      {/* CONTRACT */}
                      <td className="ui-table-cell">
                        <div className="">
                          <div className="">
                            <FileSignature className="" />
                          </div>
                          <div className="">
                            <p className="">
                              {contract.title}
                            </p>
                            <p className="ui-meta">
                              #{contract.contractNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CLIENT */}
                      <td className="ui-table-cell">
                        <p className="">
                          {contract.clientName}
                        </p>
                      </td>

                      {/* PROJECT */}
                      <td className="ui-table-cell">
                        {contract.projectName ?? (
                          <span className="ui-caption">
                            None
                          </span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="ui-table-cell">
                        <div className="">
                          <span
                            className={`${getStatusBadgeClass(contract.status)}`}
                          >
                            {formatStatus(contract.status)}
                          </span>
                        </div>
                      </td>

                      {/* CREATED */}
                      <td className="ui-table-cell">
                        <p className="">
                          {new Date(contract.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* SENT */}
                      <td className="ui-table-cell">
                        <p className="">
                          {contract.sentAt ? new Date(contract.sentAt).toLocaleDateString() : '-'}
                        </p>
                      </td>

                      {/* SIGNED */}
                      <td className="ui-table-cell">
                        <p className="">
                          {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString() : '-'}
                        </p>
                      </td>

                      {/* ACTION */}
                      <td className="ui-table-cell">
                        <div className="">
                          <Link
                            href={`/admin/contracts/${contract.id}`}
                            className="ui-button ui-button-secondary"
                          >
                            View
                            <ArrowUpRight className="" />
                          </Link>
                          <Link
                            href={`/admin/contracts/${contract.id}/edit`}
                            className="ui-button ui-button-secondary"
                          >
                            Edit
                            <Plus className="" />
                          </Link>
                          {contract.status === 'draft' && (
                            <>
                              <Link
                                href={`/admin/contracts/${contract.id}/send`}
                                className="ui-button ui-button-success"
                              >
                                Send
                                <CheckCircle2 className="" />
                              </Link>
                              <Link
                                href={`/admin/contracts/${contract.id}/duplicate`}
                                className="ui-button ui-button-secondary"
                              >
                                Duplicate
                                <FilePlus className="" />
                              </Link>
                            </>
                          )}
                          <button
                            onClick={() => {
                              if (!window.confirm('Delete this contract?')) return;
                              // Note: Delete logic would go here - keeping inline for now as it's complex to extract
                              // In a real refactor, this would be moved to a service function
                              window.location.reload(); // Placeholder - actual delete would fetch API
                            }}
                            className="ui-button ui-button-destructive"
                          >
                            <Trash2 className="" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
