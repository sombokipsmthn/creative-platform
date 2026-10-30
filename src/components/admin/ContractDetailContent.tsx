import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus, CircleNotch as Loader2 } from "@phosphor-icons/react/ssr";

import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Contract, ContractEvent } from '@/lib/types/contracts';

interface ContractDetailContentProps {
  contractId: string;
}

export default function ContractDetailContent({
  contractId,
}: ContractDetailContentProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<ContractEvent[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [contractRes, eventsRes] = await Promise.all([
          fetch(`/api/contracts/${contractId}`, { cache: 'no-store' }),
          fetch(`/api/contracts/${contractId}/events`, { cache: 'no-store' }),
        ]);
        if (!contractRes.ok) throw new Error('Failed to fetch contract');
        if (!eventsRes.ok) throw new Error('Failed to fetch contract events');
        const contractData = await contractRes.json();
        const eventsData = await eventsRes.json();
        setContract(contractData);
        setEvents(eventsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [contractId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6">
        <p>Contract not found.</p>
        <Button asChild variant="secondary" className="mt-4">
          <Link href="/admin/contracts">Back to Contracts</Link>
        </Button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!window.confirm('Are you sure you want to send this contract?')) return;
    try {
      const res = await fetch(`/api/contracts/${contractId}/send`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send contract');
      // Refetch
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending contract');
    }
  };

  const handleSaveAsTemplate = async () => {
    const name = window.prompt('Enter template name:');
    if (!name) return;
    const description = window.prompt('Enter template description (optional):');
    try {
      const res = await fetch(`/api/contracts/${contractId}/template`, {
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

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{contract.title}</h1>
            <p className="text-sm text-muted-foreground">Contract #{contract.contractNumber}</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <Button asChild variant="secondary">
              <Link href={`/admin/contracts/${contractId}/edit`}>Edit Contract</Link>
            </Button>
            <Button
              onClick={handleSend}
              variant="primary"
              disabled={contract.status !== 'draft'}
            >
              Send Contract
            </Button>
            <Button onClick={handleSaveAsTemplate} variant="outline">
              Save as Template
            </Button>
            <Button asChild variant="ghost">
              <Link href="/admin/contracts">Back to Contracts</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Status</h2>
          <p className="mt-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              getStatusColor(contract.status)
            }`}>
              {formatStatus(contract.status)}
            </span>
          </p>
          {contract.sentAt && (
            <p className="mt-1 text-sm text-muted-foreground">
              Sent: {new Date(contract.sentAt).toLocaleDateString()}
            </p>
          )}
          {contract.signedAt && (
            <p className="mt-1 text-sm text-muted-foreground">
              Signed: {new Date(contract.signedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Client</h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {contract.client?.name || 'Unknown'}
            </p>
            {contract.client?.company && (
              <p className="text-xs text-muted-foreground">{contract.client.company}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {contract.client?.email || 'No email'}
            </p>
            <p className="text-xs text-muted-foreground">
              {contract.client?.phone || 'No phone'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Project</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {contract.project ? contract.project.name : 'None'}
          </p>
        </div>

        <div className="bg-white dark:bg-card rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Financials</h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Currency: {contract.currency}
            </p>
            <p className="text-sm text-muted-foreground">
              Total Amount: {contract.totalAmount != null ? formatCurrency(contract.totalAmount) : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border dark:border-border">
          <h2 className="text-xl font-semibold text-foreground">Contract Content</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="whitespace-pre-wrap text-sm text-foreground">
            {contract.content}
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Activity History</h2>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FilePlus className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{formatEventType(event.eventType)}</p>
                  <p className="text-xs text-muted-foreground">
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
      return 'bg-muted text-foreground';
    case 'sent':
      return 'bg-[var(--color-info)]/10 text-[var(--color-info)]';
    case 'viewed':
      return 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
    case 'awaiting_signature':
      return 'bg-primary/10 text-primary';
    case 'signed':
      return 'bg-[var(--color-success)]/10 text-[var(--color-success)]';
    case 'declined':
      return 'bg-destructive/10 text-destructive';
    case 'expired':
      return 'bg-muted text-muted-foreground';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive';
    default:
      return 'bg-muted text-foreground';
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
