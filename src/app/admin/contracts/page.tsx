'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, FileSignature, Plus, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import type { Contract, ContractStats, Client } from '@/lib/types/contracts';

const statuses = ['all', 'draft', 'sent', 'viewed', 'awaiting_signature', 'signed', 'declined', 'expired', 'cancelled'];
const label = (value: string) => value.split('_').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
const date = (value?: Date | null) => value ? new Date(value).toLocaleDateString() : '—';
const badge = (status: string) => `ui-badge ${status === 'signed' ? 'ui-badge-success' : status === 'declined' || status === 'cancelled' ? 'ui-badge-danger' : status === 'expired' ? 'ui-badge-warning' : status === 'sent' || status === 'viewed' ? 'ui-badge-accent' : 'ui-badge'}`;

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ContractStats>({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [clientId, setClientId] = useState('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading'); setError('');
    try {
      const params = new URLSearchParams({ search, status, limit: '25', offset: String(page * 25) });
      if (clientId !== 'all') params.set('clientId', clientId);
      const response = await fetch(`/api/contracts?${params}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in to view contracts.' : 'Unable to load contracts.');
      const data = await response.json();
      setContracts(Array.isArray(data.contracts) ? data.contracts : []);
      setStats(data.stats || {}); setTotal(Number(data.total || 0)); setState('ready');
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load contracts.'); setState('error'); }
  }, [search, status, clientId, page]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { fetch('/api/clients', { cache: 'no-store' }).then((response) => response.ok ? response.json() : []).then((data) => setClients(Array.isArray(data) ? data : [])).catch(() => setClients([])); }, []);

  return <div className="ui-page ui-page-padded"><div className="ui-shell space-y-8">
    <AdminPageHeader title="Contracts" description="Manage reusable templates, agreements, signatures and terms." breadcrumb={{ label: 'Dashboard', href: '/admin' }} primaryAction={<Link href="/admin/contracts/new" className="ui-button ui-button-primary"><Plus className="h-4 w-4" /> New contract</Link>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[['Active agreements', stats.active], ['Awaiting signature', stats.awaiting_signature], ['Expiring soon', stats.expiring_soon], ['Signed this month', stats.signed_this_month]].map(([name, value]) => <div className="ui-stat-card" key={String(name)}><p className="ui-stat-label">{name}</p><p className="ui-stat-value">{value ?? 0}</p></div>)}
    </div>
    <div className="ui-card space-y-4 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="ui-section-title">Contract repository</h2><p className="ui-body">Search and filter persisted agreements.</p></div><Link href="/admin/contracts/templates" className="ui-button ui-button-secondary">Browse templates</Link></div>
      <div className="flex flex-wrap gap-3"><input className="ui-input min-w-64 flex-1" value={search} onChange={(event) => { setPage(0); setSearch(event.target.value); }} placeholder="Search title or contract number" /><select className="ui-input" value={clientId} onChange={(event) => { setPage(0); setClientId(event.target.value); }}><option value="all">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.company ? ` (${client.company})` : ''}</option>)}</select><select className="ui-input" value={status} onChange={(event) => { setPage(0); setStatus(event.target.value); }}>{statuses.map((item) => <option key={item} value={item}>{item === 'all' ? 'All statuses' : label(item)}</option>)}</select></div>
      {state === 'loading' && <div className="ui-loading-state p-12">Loading contracts…</div>}
      {state === 'error' && <div className="ui-empty-state p-12"><AlertCircle /><p>{error}</p><Button variant="outline" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Retry</Button></div>}
      {state === 'ready' && contracts.length === 0 && <div className="ui-empty-state p-12"><FileSignature /><h3 className="ui-section-title">No contracts found</h3><p className="ui-body">Create an agreement from a template or start from scratch.</p><Link href="/admin/contracts/new" className="ui-button ui-button-primary">Create contract</Link></div>}
      {state === 'ready' && contracts.length > 0 && <div className="overflow-x-auto"><table className="ui-table"><thead><tr><th className="ui-table-header">Agreement</th><th className="ui-table-header">Client / project</th><th className="ui-table-header">Status</th><th className="ui-table-header">Term</th><th className="ui-table-header">Updated</th><th className="ui-table-header" /></tr></thead><tbody>{contracts.map((contract) => <tr className="ui-table-row" key={contract.id}><td className="ui-table-cell"><Link className="font-medium" href={`/admin/contracts/${contract.id}`}>{contract.title}</Link><p className="ui-meta">#{contract.contractNumber}</p></td><td className="ui-table-cell">{contract.client?.name || 'Unknown'}<p className="ui-meta">{contract.project?.name || 'No project'}</p></td><td className="ui-table-cell"><span className={badge(contract.status)}>{label(contract.status)}</span></td><td className="ui-table-cell">{date(contract.termEndAt || contract.expiresAt)}</td><td className="ui-table-cell">{date(contract.updatedAt)}</td><td className="ui-table-cell text-right"><Link className="ui-button ui-button-secondary" href={`/admin/contracts/${contract.id}`}>Open</Link></td></tr>)}</tbody></table></div>}
      {state === 'ready' && total > 25 && <div className="flex items-center justify-between"><Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="ui-meta">Page {page + 1} of {Math.ceil(total / 25)}</span><Button variant="outline" disabled={(page + 1) * 25 >= total} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
    </div>
  </div></div>;
}
