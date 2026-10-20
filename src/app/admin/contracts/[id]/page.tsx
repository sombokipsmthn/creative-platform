'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FilePlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import type { Contract, ContractEvent } from '@/lib/types/contracts';
import { ContractDocument } from '@/components/contracts/ContractDocument';
import { ContractBuilder } from '@/components/contracts/ContractBuilder';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contractRes, eventsRes] = await Promise.all([
          fetch(`/api/contracts/${id}`, { cache: 'no-store' }),
          fetch(`/api/contracts/${id}/events`, { cache: 'no-store' }),
        ]);
        if (!contractRes.ok) throw new Error('Failed to fetch contract');
        if (!eventsRes.ok) throw new Error('Failed to fetch contract events');
        const contractData = await contractRes.json();
        const eventsData = await eventsRes.json();
        setContract(contractData);
        setEvents(eventsData);
        setIsDraft(contractData.status === 'draft');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="admin-empty-state" role="status"><Loader2 aria-hidden="true" /><p>Loading contract…</p></div></div></div>
    );
  }

  if (error) {
    return (
      <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="ui-card admin-empty-state" role="alert"><AlertCircle aria-hidden="true" /><p>{error}</p><Button asChild variant="outline"><Link href="/admin/contracts">Back to contracts</Link></Button></div></div></div>
    );
  }

  if (!contract) {
    return (
      <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="admin-empty-state"><p>Contract not found.</p><Button asChild variant="outline"><Link href="/admin/contracts">Back to contracts</Link></Button></div></div></div>
    );
  }

  // If contract is a draft, show the editor
  if (isDraft || contract.status === 'draft' || !contract.status) {
    return (
      <ContractBuilder
        mode="edit"
        contractId={id}
        initialContract={contract}
      />
    );
  }

  // Otherwise, show read-only detail view


  const handleSend = async () => {
    if (!window.confirm('Are you sure you want to send this contract?')) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/contracts/${id}/send`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send contract');
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending contract');
      setIsSending(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    const name = window.prompt('Enter template name:');
    if (!name) return;
    const description = window.prompt('Enter template description (optional):');
    try {
      const res = await fetch(`/api/contracts/${id}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error('Failed to save as template');
      alert('Contract saved as template');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving as template');
    }
  };

  const publicLink = typeof window !== 'undefined'
    ? `${window.location.origin}/contract/${contract.token}`
    : `/contract/${contract.token}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicLink);
    alert('Signing link copied.');
  };

  return (
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader title={contract.title} description={`Contract #${contract.contractNumber}`} breadcrumb={{ label: 'Contracts', href: '/admin/contracts' }} primaryAction={<div className="admin-page-actions"><Button type="button" onClick={handleSend} disabled={contract.status !== 'draft' || isSending}>{isSending ? <Loader2 aria-hidden="true" /> : 'Send contract'}</Button><Button type="button" variant="outline" onClick={handleCopyLink}>Copy signing link</Button><Button type="button" variant="outline" onClick={handleSaveAsTemplate}>Save as template</Button></div>} />

      {/* Status cards */}
      <div className="">
        <div className="ui-card">
          <h3 className="">Status</h3>
          <p className="">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              getStatusColor(contract.status)
            }`}>
              {formatStatus(contract.status)}
            </span>
          </p>
          {contract.sentAt && (
            <p className="">
              Sent: {new Date(contract.sentAt).toLocaleDateString()}
            </p>
          )}
          {contract.signedAt && (
            <p className="">
              Signed: {new Date(contract.signedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="ui-card">
          <h3 className="">Client</h3>
          <p className="">
            {contract.client?.name || 'Unknown'}
          </p>
          {contract.client?.company && (
            <p className="">{contract.client.company}</p>
          )}
        </div>

        <div className="ui-card">
          <h3 className="">Project</h3>
          <p className="">
            {contract.project ? contract.project.name : 'None'}
          </p>
        </div>

        <div className="ui-card">
          <h3 className="">Financials</h3>
          <p className="">
            {contract.currency}
            {contract.totalAmount != null ? ` ${formatCurrency(contract.totalAmount)}` : ' —'}
          </p>
        </div>
      </div>

      {/* Public signing section */}
      <div className="ui-card">
        <h2 className="">Client signing link</h2>
        <p className="">
          Share this secure link with the client to view and sign the contract.
        </p>
        <div className="">
          <input readOnly value={publicLink} className="ui-input" aria-label="Client signing link" />
          <button onClick={handleCopyLink} className="ui-button ui-button-primary">
            Copy link
          </button>
        </div>
      </div>

      {/* Contract content */}
      <div className="ui-card">
        <h2 className="">Contract Document</h2>
        <div className="">
          <ContractDocument content={contract.content || ''} />
        </div>
      </div>

      {/* Activity history */}
      {events.length > 0 && (
        <div className="ui-card">
          <h2 className="">Activity History</h2>
          <div className="">
            {events.map((event) => (
              <div key={event.id} className="">
                <div className="">
                  <FilePlus className="" />
                </div>
                <div className="">
                  <p className="">{formatEventType(event.eventType)}</p>
                  <p className="">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    case 'sent':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200';
    case 'viewed':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    case 'awaiting_signature':
      return 'bg-muted text-foreground';
    case 'signed':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    case 'declined':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    case 'expired':
      return 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    case 'cancelled':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  }
}

function formatStatus(status: string | null | undefined) {
  return (status || 'draft')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatEventType(type: string) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
