'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/admin/StatusBadge';

type PaymentRow = { payment: { id: string; amount: number; currency: string; method: string; status: string; paidAt: string; reference: string }; invoice: { id: string; invoiceNumber: string; title: string }; client: { id: string; name: string; company?: string | null } };

export default function PaymentsPage() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/payments', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('Payments could not be loaded');
      setRows(await response.json());
    }).catch(cause => setError(cause instanceof Error ? cause.message : 'Payments could not be loaded.')).finally(() => setLoading(false));
  }, []);

  const confirmed = rows.filter(row => row.payment.status === 'confirmed');
  const pending = rows.filter(row => row.payment.status === 'pending_verification');

  return <div className="ui-page ui-page-padded"><div className="ui-shell"><AdminPageHeader title="Payments" description="Manual payment records and verification history." breadcrumb={{ label: 'Dashboard', href: '/admin' }} />
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Metric label="Confirmed receipts" value={confirmed.reduce((sum, row) => sum + row.payment.amount, 0)} detail="Mixed currencies are kept separate by row" /><Metric label="Pending verification" value={pending.length} detail="Reported, not settled" /><Metric label="Payment records" value={rows.length} detail="Manual ledger entries" /></div>
    <Card><CardContent className="p-0">{loading ? <div className="grid gap-3 p-6"><Skeleton className="h-12" /><Skeleton className="h-12" /></div> : error ? <div className="admin-empty-state"><h2>Payments unavailable</h2><p>{error}</p></div> : rows.length === 0 ? <div className="admin-empty-state"><h2>No payment records</h2><p>Record a payment from an invoice to start the ledger.</p></div> : <div className="divide-y">{rows.map(row => <div key={row.payment.id} className="flex flex-wrap items-center gap-4 p-4"><div className="min-w-48 flex-1"><p className="font-medium">{row.client.company || row.client.name}</p><Link href={`/admin/invoices/${row.invoice.id}`} className="text-sm text-primary hover:underline">{row.invoice.invoiceNumber}</Link></div><div className="text-sm">{row.payment.currency} {row.payment.amount.toLocaleString()}</div><div className="text-sm capitalize text-muted-foreground">{row.payment.method.replace('_', ' ')}</div><StatusBadge status={row.payment.status} /><div className="text-xs text-muted-foreground">{new Date(row.payment.paidAt).toLocaleDateString('en-KE')}</div></div>)}</div>}</CardContent></Card>
  </div></div>;
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) { return <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>; }
