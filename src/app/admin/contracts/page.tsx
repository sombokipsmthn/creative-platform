'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, FileSignature, Plus, RefreshCw } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Client, Contract, ContractStats } from '@/lib/types/contracts';

const statuses = ['all', 'draft', 'sent', 'viewed', 'awaiting_signature', 'signed', 'declined', 'expired', 'cancelled'];
const label = (value: string) => value.split('_').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' ');
const date = (value?: Date | null) => value ? new Date(value).toLocaleDateString() : '—';
const statusVariant = (status: string) => status === 'signed' ? 'success' : status === 'declined' || status === 'cancelled' ? 'destructive' : status === 'expired' ? 'warning' : status === 'sent' || status === 'viewed' ? 'secondary' : 'outline';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ContractStats>({});
  const [search, setSearch] = useState(''); const [status, setStatus] = useState('all'); const [clientId, setClientId] = useState('all'); const [page, setPage] = useState(0); const [total, setTotal] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading'); const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading'); setError('');
    try {
      const params = new URLSearchParams({ search, status, limit: '25', offset: String(page * 25) });
      if (clientId !== 'all') params.set('clientId', clientId);
      const response = await fetch(`/api/contracts?${params}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in to view contracts.' : 'Unable to load contracts.');
      const data = await response.json(); setContracts(Array.isArray(data.contracts) ? data.contracts : []); setStats(data.stats || {}); setTotal(Number(data.total || 0)); setState('ready');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load contracts.'); setState('error'); }
  }, [search, status, clientId, page]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { fetch('/api/clients', { cache: 'no-store' }).then((response) => response.ok ? response.json() : []).then((data) => setClients(Array.isArray(data) ? data : [])).catch(() => setClients([])); }, []);

  return <div className="ui-page ui-page-padded"><div className="ui-shell space-y-8">
    <AdminPageHeader title="Contracts" description="Manage reusable templates, agreements, signatures and terms." breadcrumb={{ label: 'Dashboard', href: '/admin' }} primaryAction={<Button asChild><Link href="/admin/contracts/new"><Plus /> New contract</Link></Button>} />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Active agreements', stats.active], ['Awaiting signature', stats.awaiting_signature], ['Expiring soon', stats.expiring_soon], ['Signed this month', stats.signed_this_month]].map(([name, value]) => <Card key={String(name)}><CardHeader><CardDescription>{name}</CardDescription><CardTitle className="text-3xl">{value ?? 0}</CardTitle></CardHeader></Card>)}</div>
    <Card><CardHeader className="gap-4 border-b sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Contract repository</CardTitle><CardDescription>Search and filter persisted agreements.</CardDescription></div><Button asChild variant="outline"><Link href="/admin/contracts/templates">Browse templates</Link></Button></CardHeader><CardContent className="space-y-4 pt-6">
      <div className="flex flex-wrap gap-3"><Input className="min-w-64 flex-1" value={search} onChange={(event) => { setPage(0); setSearch(event.target.value); }} placeholder="Search title or contract number" /><select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={clientId} onChange={(event) => { setPage(0); setClientId(event.target.value); }}><option value="all">All clients</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.company ? ` (${client.company})` : ''}</option>)}</select><select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={status} onChange={(event) => { setPage(0); setStatus(event.target.value); }}>{statuses.map((item) => <option key={item} value={item}>{item === 'all' ? 'All statuses' : label(item)}</option>)}</select></div>
      {state === 'loading' && <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">Loading contracts…</div>}
      {state === 'error' && <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center"><AlertCircle className="text-destructive" /><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" onClick={() => void load()}><RefreshCw /> Retry</Button></div>}
      {state === 'ready' && contracts.length === 0 && <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-center"><FileSignature className="size-8 text-muted-foreground" /><h3 className="font-medium">No contracts found</h3><p className="text-sm text-muted-foreground">Create an agreement from a template or start from scratch.</p><Button asChild><Link href="/admin/contracts/new">Create contract</Link></Button></div>}
      {state === 'ready' && contracts.length > 0 && <Table><TableHeader><TableRow><TableHead>Agreement</TableHead><TableHead>Client / project</TableHead><TableHead>Status</TableHead><TableHead>Term</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{contracts.map((contract) => <TableRow key={contract.id}><TableCell><Link className="font-medium hover:underline" href={`/admin/contracts/${contract.id}`}>{contract.title}</Link><p className="text-xs text-muted-foreground">#{contract.contractNumber}</p></TableCell><TableCell>{contract.client?.name || 'Unknown'}<p className="text-xs text-muted-foreground">{contract.project?.name || 'No project'}</p></TableCell><TableCell><Badge variant={statusVariant(contract.status)}>{label(contract.status)}</Badge></TableCell><TableCell className="text-muted-foreground">{date(contract.termEndAt || contract.expiresAt)}</TableCell><TableCell className="text-muted-foreground">{date(contract.updatedAt)}</TableCell><TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={`/admin/contracts/${contract.id}`}>Open <ArrowUpRight /></Link></Button></TableCell></TableRow>)}</TableBody></Table>}
      {state === 'ready' && total > 25 && <div className="flex items-center justify-between border-t pt-4"><Button variant="outline" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</Button><span className="text-sm text-muted-foreground">Page {page + 1} of {Math.ceil(total / 25)}</span><Button variant="outline" disabled={(page + 1) * 25 >= total} onClick={() => setPage((current) => current + 1)}>Next</Button></div>}
    </CardContent></Card>
  </div></div>;
}
