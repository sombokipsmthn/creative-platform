import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FilePlus,
  Loader2,
} from 'lucide-react';

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
      <div className="">
        <div className="">
          <Loader2 className="" />
          <p>Loading contract...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="">
        <div className="">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="">
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
    <div className="">
      <header className="">
        <div className="">
          <div className="">
            <h1 className="">{contract.title}</h1>
            <p className="">Contract #{contract.contractNumber}</p>
          </div>
          <div className="">
            <Link
              href={`/admin/contracts/${contractId}/edit`}
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

      <div className="">
        <div className="">
          <h2 className="">Status</h2>
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

        <div className="">
          <h2 className="">Client</h2>
          <div className="">
            <p className="">
              {contract.client?.name || 'Unknown'}
            </p>
            {contract.client?.company && (
              <p className="">{contract.client.company}</p>
            )}
            <p className="">
              {contract.client?.email || 'No email'}
            </p>
            <p className="">
              {contract.client?.phone || 'No phone'}
            </p>
          </div>
        </div>

        <div className="">
          <h2 className="">Project</h2>
          <p className="">
            {contract.project ? contract.project.name : 'None'}
          </p>
        </div>

        <div className="">
          <h2 className="">Financials</h2>
          <div className="">
            <p className="">
              Currency: {contract.currency}
            </p>
            <p className="">
              Total Amount: {contract.totalAmount != null ? formatCurrency(contract.totalAmount) : '-'}
            </p>
          </div>
        </div>
      </div>

      <div className="">
        <div className="">
          <h2 className="">Contract Content</h2>
        </div>
        <div className="">
          <div className="">
            {contract.content}
          </div>
        </div>
      </div>

      {events.length > 0 && (
        <div className="">
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
      return 'bg-primary/10 text-primary';
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
