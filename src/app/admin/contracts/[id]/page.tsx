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
      <div className="ui-page min-h-screen p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p>Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-page p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="ui-page p-6">
        <p>Contract not found.</p>
        <Link href="/admin/contracts" className="ui-button ui-button-secondary">
          Back to Contracts
        </Link>
      </div>
    );
  }

  // If contract is a draft, show the editor
  if (isDraft) {
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
    <div className="ui-page min-h-screen p-6">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{contract.title}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contract #{contract.contractNumber}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSend}
              className="ui-button ui-button-primary"
              disabled={contract.status !== 'draft' || isSending}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Contract'}
            </button>
            <button onClick={handleCopyLink} className="ui-button ui-button-secondary">
              Copy Signing Link
            </button>
            <button
              onClick={handleSaveAsTemplate}
              className="ui-button ui-button-secondary"
            >
              Save as Template
            </button>
            <Link
              href="/admin/contracts"
              className="ui-button ui-button-ghost"
            >
              Back to Contracts
            </Link>
          </div>
        </div>
      </header>

      {/* Status cards */}
      <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ui-card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</h3>
          <p className="mt-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              getStatusColor(contract.status)
            }`}>
              {formatStatus(contract.status)}
            </span>
          </p>
          {contract.sentAt && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Sent: {new Date(contract.sentAt).toLocaleDateString()}
            </p>
          )}
          {contract.signedAt && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Signed: {new Date(contract.signedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="ui-card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Client</h3>
          <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-50">
            {contract.client?.name || 'Unknown'}
          </p>
          {contract.client?.company && (
            <p className="text-xs text-gray-600 dark:text-gray-400">{contract.client.company}</p>
          )}
        </div>

        <div className="ui-card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Project</h3>
          <p className="mt-2 text-sm text-gray-900 dark:text-gray-50">
            {contract.project ? contract.project.name : 'None'}
          </p>
        </div>

        <div className="ui-card">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Financials</h3>
          <p className="mt-2 text-sm text-gray-900 dark:text-gray-50">
            {contract.currency}
            {contract.totalAmount != null ? ` ${formatCurrency(contract.totalAmount)}` : ' —'}
          </p>
        </div>
      </div>

      {/* Public signing section */}
      <div className="ui-card mb-6 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/30">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Client signing link</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Share this secure link with the client to view and sign the contract.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input readOnly value={publicLink} className="ui-input flex-1 text-sm" aria-label="Client signing link" />
          <button onClick={handleCopyLink} className="ui-button ui-button-primary whitespace-nowrap">
            Copy link
          </button>
        </div>
      </div>

      {/* Contract content */}
      <div className="ui-card mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-6">Contract Document</h2>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ContractDocument content={contract.content || ''} />
        </div>
      </div>

      {/* Activity history */}
      {events.length > 0 && (
        <div className="ui-card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Activity History</h2>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 text-sm">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <FilePlus className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-50">{formatEventType(event.eventType)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
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

function formatStatus(status: string) {
  return status
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
