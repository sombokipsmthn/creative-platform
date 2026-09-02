'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  FilePlus,
  FileSignature,
  Loader2,
  Plus,
  Trash2,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

export default function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<any>>([]);

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
      <div className="min-h-screen p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p>Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6">
        <p>Contract not found.</p>
        <Link href="/admin/contracts" className="Button Button--secondary">
          Back to Contracts
        </Link>
      </div>
    );
  }

  const handleSend = async () => {
    if (!window.confirm('Are you sure you want to send this contract?')) return;
    try {
      const res = await fetch(`/api/contracts/${id}/send`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send contract');
      // Refetch
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error sending contract');
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/contracts/${id}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to duplicate contract');
      const data = await res.json();
      router.push(`/admin/contracts/${data.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error duplicating contract');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete contract');
      router.push('/admin/contracts');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error deleting contract');
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

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-sm text-gray-500">Contract #{contract.contractNumber}</p>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
            <Link
              href={`/admin/contracts/${id}/edit`}
              className="Button Button--secondary"
            >
              Edit Contract
            </Link>
            <button
              onClick={handleSend}
              className="Button Button--primary"
              disabled={contract.status !== 'draft'}
            >
              Send Contract
            </button>
            <button
              onClick={handleSaveAsTemplate}
              className="Button Button--outline"
            >
              Save as Template
            </button>
            <Link
              href="/admin/contracts"
              className="Button Button--ghost"
            >
              Back to Contracts
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Status</h2>
          <p className="mt-2">
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              getStatusColor(contract.status)
            }`}>
              {formatStatus(contract.status)}
            </span>
          </p>
          {contract.sentAt && (
            <p className="mt-1 text-sm text-gray-500">
              Sent: {new Date(contract.sentAt).toLocaleDateString()}
            </p>
          )}
          {contract.signedAt && (
            <p className="mt-1 text-sm text-gray-500">
              Signed: {new Date(contract.signedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Client</h2>
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-900">
              {contract.client?.name || 'Unknown'}
            </p>
            {contract.client?.company && (
              <p className="text-xs text-gray-500">{contract.client.company}</p>
            )}
            <p className="text-xs text-gray-500">
              {contract.client?.email || 'No email'}
            </p>
            <p className="text-xs text-gray-500">
              {contract.client?.phone || 'No phone'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Project</h2>
          <p className="mt-2 text-sm text-gray-500">
            {contract.project ? contract.project.name : 'None'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Financials</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              Currency: {contract.currency}
            </p>
            <p className="text-sm text-gray-500">
              Total Amount: {contract.totalAmount !== null ? formatCurrency(contract.totalAmount) : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900">Contract Content</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="whitespace-pre-wrap text-sm text-gray-900">
            {contract.content}
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity History</h2>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 text-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-600">
                  <FilePlus className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{formatEventType(event.eventType)}</p>
                  <p className="text-xs text-gray-500">
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
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'viewed':
      return 'bg-yellow-100 text-yellow-800';
    case 'awaiting_signature':
      return 'bg-purple-100 text-purple-800';
    case 'signed':
      return 'bg-green-100 text-green-800';
    case 'declined':
      return 'bg-red-100 text-red-800';
    case 'expired':
      return 'bg-gray-300 text-gray-600';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
