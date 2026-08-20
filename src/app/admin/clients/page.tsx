// src/app/admin/clients/page.tsx
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type FeedbackStatus =
  | 'AWAITING_FEEDBACK'
  | 'FEEDBACK_RECEIVED'
  | 'IN_PRODUCTION'
  | 'COMPLETED';

type ContractStatus =
  | 'NOT_SENT'
  | 'SENT'
  | 'SIGNED';

type EtimsInvoiceStatus =
  | 'NOT_SENT'
  | 'SENT'
  | 'PAID';

type TaxCertificateStatus =
  | 'NOT_RECEIVED'
  | 'RECEIVED'
  | 'NOT_APPLICABLE';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  website?: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  feedbackStatus: FeedbackStatus;
  contractStatus: ContractStatus;
  etimsInvoiceStatus: EtimsInvoiceStatus;
  taxCertificateStatus: TaxCertificateStatus;
  createdAt: string;
  updatedAt?: string;
}

interface ClientApiResponse {
  clients?: Client[];
  data?: Client[];
  client?: Client;
  error?: string;
  message?: string;
}

type FilterCategory =
  | 'ALL'
  | 'AWAITING_FEEDBACK'
  | 'PENDING_TAX_CERT'
  | 'PENDING_CONTRACT';

const DEFAULT_LOCATION = 'Nairobi, Kenya';

function normaliseClient(raw: Client): Client {
  return {
    ...raw,
    name: raw.name ?? '',
    email: raw.email ?? null,
    phone: raw.phone ?? null,
    company: raw.company ?? null,
    website: raw.website ?? null,
    location: raw.location ?? null,
    notes: raw.notes ?? null,
    status: raw.status ?? 'active',
    feedbackStatus:
      raw.feedbackStatus ?? 'AWAITING_FEEDBACK',
    contractStatus:
      raw.contractStatus ?? 'NOT_SENT',
    etimsInvoiceStatus:
      raw.etimsInvoiceStatus ?? 'NOT_SENT',
    taxCertificateStatus:
      raw.taxCertificateStatus ?? 'NOT_RECEIVED',
  };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] =
    useState<FilterCategory>('ALL');

  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [isAddClientOpen, setIsAddClientOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Form State
  |--------------------------------------------------------------------------
  */

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] =
    useState(DEFAULT_LOCATION);
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  const [feedbackStatus, setFeedbackStatus] =
    useState<FeedbackStatus>('AWAITING_FEEDBACK');

  const [contractStatus, setContractStatus] =
    useState<ContractStatus>('NOT_SENT');

  const [etimsInvoiceStatus, setEtimsInvoiceStatus] =
    useState<EtimsInvoiceStatus>('NOT_SENT');

  const [taxCertificateStatus, setTaxCertificateStatus] =
    useState<TaxCertificateStatus>('NOT_RECEIVED');

  /*
  |--------------------------------------------------------------------------
  | Load Clients
  |--------------------------------------------------------------------------
  */

  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/clients', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload: ClientApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ||
            payload.message ||
            'Failed to load clients.'
        );
      }

      const rawClients =
        payload.clients ??
        payload.data ??
        [];

      setClients(
        rawClients.map(normaliseClient)
      );
    } catch (err) {
      console.error('Failed to load clients:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load clients.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  /*
  |--------------------------------------------------------------------------
  | Derived / Filtered Clients
  |--------------------------------------------------------------------------
  */

  const filteredClients = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return clients.filter((client) => {
      const searchableText = [
        client.name,
        client.company,
        client.email,
        client.phone,
        client.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      if (!matchesSearch) {
        return false;
      }

      if (
        filterCategory ===
        'AWAITING_FEEDBACK'
      ) {
        return (
          client.feedbackStatus ===
          'AWAITING_FEEDBACK'
        );
      }

      if (
        filterCategory ===
        'PENDING_TAX_CERT'
      ) {
        return (
          client.taxCertificateStatus ===
          'NOT_RECEIVED'
        );
      }

      if (
        filterCategory ===
        'PENDING_CONTRACT'
      ) {
        return (
          client.contractStatus !==
          'SIGNED'
        );
      }

      return true;
    });
  }, [
    clients,
    searchQuery,
    filterCategory,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Create Client
  |--------------------------------------------------------------------------
  */

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setLocation(DEFAULT_LOCATION);
    setWebsite('');
    setNotes('');

    setFeedbackStatus(
      'AWAITING_FEEDBACK'
    );

    setContractStatus('NOT_SENT');
    setEtimsInvoiceStatus('NOT_SENT');
    setTaxCertificateStatus(
      'NOT_RECEIVED'
    );
  };

  const handleCreateClient = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError(
        'Please fill in Contact Name and Email.'
      );
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(
        '/api/clients',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone:
              phone.trim() || null,
            company:
              company.trim() || null,
            location:
              location.trim() ||
              DEFAULT_LOCATION,
            website:
              website.trim() || null,
            notes:
              notes.trim() || null,
            status: 'active',
            feedbackStatus,
            contractStatus,
            etimsInvoiceStatus,
            taxCertificateStatus,
          }),
        }
      );

      const payload: ClientApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ||
            payload.message ||
            'Failed to create client.'
        );
      }

      const createdClient =
        payload.client;

      if (createdClient) {
        const normalised =
          normaliseClient(
            createdClient
          );

        setClients((current) => [
          normalised,
          ...current.filter(
            (client) =>
              client.id !==
              normalised.id
          ),
        ]);
      } else {
        /*
         * If the API only returns a success
         * response, reload from the database.
         */
        await loadClients();
      }

      resetForm();
      setIsAddClientOpen(false);
    } catch (err) {
      console.error(
        'Failed to create client:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create client.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Update Client Status
  |--------------------------------------------------------------------------
  |
  | The current repository documents /api/clients
  | as GET/POST. Once PATCH support is added,
  | this function will persist CRM status changes.
  |
  */

  const updateClientStatus = async <
    K extends
      | 'feedbackStatus'
      | 'contractStatus'
      | 'etimsInvoiceStatus'
      | 'taxCertificateStatus'
  >(
    client: Client,
    field: K,
    value: Client[K]
  ) => {
    const previousClient = client;

    const updatedClient: Client = {
      ...client,
      [field]: value,
      updatedAt:
        new Date().toISOString(),
    };

    /*
     * Optimistic UI update.
     */
    setClients((current) =>
      current.map((item) =>
        item.id === client.id
          ? updatedClient
          : item
      )
    );

    setSelectedClient(updatedClient);

    try {
      setError(null);

      const response = await fetch(
        `/api/clients/${client.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            [field]: value,
          }),
        }
      );

      const payload: ClientApiResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ||
            payload.message ||
            'Client status could not be saved.'
        );
      }

      if (payload.client) {
        const savedClient =
          normaliseClient(
            payload.client
          );

        setClients((current) =>
          current.map((item) =>
            item.id ===
            savedClient.id
              ? savedClient
              : item
          )
        );

        setSelectedClient(
          savedClient
        );
      }
    } catch (err) {
      console.error(
        'Failed to update client:',
        err
      );

      /*
       * Roll back the optimistic update
       * if the API doesn't support the request
       * yet or another error occurs.
       */
      setClients((current) =>
        current.map((item) =>
          item.id ===
          previousClient.id
            ? previousClient
            : item
        )
      );

      setSelectedClient(
        previousClient
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to save client status.'
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Portal Link
  |--------------------------------------------------------------------------
  |
  | The current clients schema does not contain
  | gallery/token fields. Therefore the old
  | hard-coded gallery functionality is intentionally
  | not fabricated here.
  |
  */

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link
              href="/admin"
              className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">
              Client CRM & KRA Tax Compliance
            </h1>

            <p className="text-xs font-mono text-slate-500 dark:text-zinc-500 mt-2">
              Database-backed client records and business workflow tracking
            </p>
          </div>

          <button
            onClick={() =>
              setIsAddClientOpen(true)
            }
            className="px-5 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-sm"
          >
            <span>
              + Register New Client
            </span>
          </button>
        </div>

        {/* Error Banner */}

        {error && (
          <div className="flex items-start justify-between gap-4 p-4 border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-xl">
            <div>
              <p className="text-xs font-mono uppercase text-red-700 dark:text-red-400">
                CRM Error
              </p>

              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {error}
              </p>
            </div>

            <button
              onClick={() =>
                setError(null)
              }
              className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* CRM Metrics */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono uppercase">
              Awaiting Feedback
            </p>

            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {
                clients.filter(
                  (client) =>
                    client.feedbackStatus ===
                    'AWAITING_FEEDBACK'
                ).length
              }
            </p>
          </div>

          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-red-600 dark:text-red-400 font-mono uppercase">
              Pending Tax Certs
            </p>

            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {
                clients.filter(
                  (client) =>
                    client.taxCertificateStatus ===
                    'NOT_RECEIVED'
                ).length
              }
            </p>
          </div>

          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-mono uppercase">
              Contracts Signed
            </p>

            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {
                clients.filter(
                  (client) =>
                    client.contractStatus ===
                    'SIGNED'
                ).length
              }
            </p>
          </div>

          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono uppercase">
              eTIMS Invoices Shared
            </p>

            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {
                clients.filter(
                  (client) =>
                    client.etimsInvoiceStatus !==
                    'NOT_SENT'
                ).length
              }
            </p>
          </div>

        </div>

        {/* Toolbar */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 dark:bg-zinc-900/40 p-4 border border-slate-200 dark:border-zinc-800/80 rounded-2xl">

          <input
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            className="w-full md:w-80 px-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2 text-xs font-mono">

            <button
              onClick={() =>
                setFilterCategory('ALL')
              }
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'ALL'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'btn-secondary'
              }`}
            >
              All ({clients.length})
            </button>

            <button
              onClick={() =>
                setFilterCategory(
                  'AWAITING_FEEDBACK'
                )
              }
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory ===
                'AWAITING_FEEDBACK'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'btn-secondary'
              }`}
            >
              Awaiting Feedback (
              {
                clients.filter(
                  (client) =>
                    client.feedbackStatus ===
                    'AWAITING_FEEDBACK'
                ).length
              }
              )
            </button>

            <button
              onClick={() =>
                setFilterCategory(
                  'PENDING_TAX_CERT'
                )
              }
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory ===
                'PENDING_TAX_CERT'
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'btn-secondary'
              }`}
            >
              Pending Tax Certs (
              {
                clients.filter(
                  (client) =>
                    client.taxCertificateStatus ===
                    'NOT_RECEIVED'
                ).length
              }
              )
            </button>

            <button
              onClick={() =>
                setFilterCategory(
                  'PENDING_CONTRACT'
                )
              }
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory ===
                'PENDING_CONTRACT'
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'btn-secondary'
              }`}
            >
              Contracts Pending (
              {
                clients.filter(
                  (client) =>
                    client.contractStatus !==
                    'SIGNED'
                ).length
              }
              )
            </button>

          </div>
        </div>

        {/* Client List */}

        <div className="grid grid-cols-1 gap-4">

          {isLoading ? (
            <>
              {[1, 2, 3].map(
                (index) => (
                  <div
                    key={index}
                    className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 rounded-2xl animate-pulse"
                  >
                    <div className="h-4 w-40 bg-slate-200 dark:bg-zinc-800 rounded mb-4" />
                    <div className="h-6 w-64 bg-slate-200 dark:bg-zinc-800 rounded mb-3" />
                    <div className="h-3 w-96 max-w-full bg-slate-200 dark:bg-zinc-800 rounded" />
                  </div>
                )
              )}
            </>
          ) : filteredClients.length === 0 ? (
            <div className="p-12 border border-dashed border-slate-300 dark:border-zinc-800 rounded-2xl text-center">
              <p className="text-sm font-mono text-slate-600 dark:text-zinc-400">
                {clients.length === 0
                  ? 'No clients have been registered yet.'
                  : 'No clients match your search or filter.'}
              </p>

              {clients.length === 0 && (
                <button
                  onClick={() =>
                    setIsAddClientOpen(
                      true
                    )
                  }
                  className="mt-4 px-4 py-2 btn-primary text-xs font-mono rounded-lg"
                >
                  Register First Client
                </button>
              )}
            </div>
          ) : (
            filteredClients.map(
              (client) => (
                <div
                  key={client.id}
                  className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-purple-600/50 transition-all group shadow-sm dark:shadow-none"
                >

                  <div className="space-y-3 max-w-3xl">

                    <div className="flex flex-wrap items-center gap-2">

                      {client.company && (
                        <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
                          {client.company}
                        </span>
                      )}

                      {client.feedbackStatus ===
                        'AWAITING_FEEDBACK' && (
                        <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-mono rounded-full">
                          💬 Awaiting Feedback
                        </span>
                      )}

                      <span
                        className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                          client.contractStatus ===
                          'SIGNED'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : client.contractStatus ===
                              'SENT'
                            ? 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        Contract:{' '}
                        {client.contractStatus ===
                        'SIGNED'
                          ? 'Signed ✓'
                          : client.contractStatus ===
                            'SENT'
                          ? 'Sent ⏳'
                          : 'Not Sent'}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                          client.etimsInvoiceStatus ===
                          'PAID'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : client.etimsInvoiceStatus ===
                              'SENT'
                            ? 'bg-purple-600/20 border-purple-500/30 text-purple-700 dark:text-purple-300'
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        eTIMS Invoice:{' '}
                        {client.etimsInvoiceStatus}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                          client.taxCertificateStatus ===
                          'RECEIVED'
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                            : client.taxCertificateStatus ===
                              'NOT_RECEIVED'
                            ? 'bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-300'
                            : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        Tax Cert:{' '}
                        {client.taxCertificateStatus ===
                        'RECEIVED'
                          ? 'Received ✓'
                          : client.taxCertificateStatus ===
                            'NOT_APPLICABLE'
                          ? 'N/A'
                          : 'Pending ⚠️'}
                      </span>

                    </div>

                    <h3 className="text-xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {client.name}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                      {client.email ||
                        'No email'}
                      {' • '}
                      {client.phone ||
                        'No phone'}
                      {' • '}
                      {client.location ||
                        'No location'}
                    </p>

                    {client.website && (
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                        {client.website}
                      </p>
                    )}

                    {client.notes && (
                      <p className="text-xs text-slate-500 dark:text-zinc-500 font-light italic">
                        &quot;
                        {client.notes}
                        &quot;
                      </p>
                    )}

                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center shrink-0">

                    <button
                      onClick={() =>
                        setSelectedClient(
                          client
                        )
                      }
                      className="px-4 py-2.5 btn-secondary text-xs font-mono rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>
                        Edit Status / View
                      </span>
                    </button>

                  </div>

                </div>
              )
            )
          )}

        </div>

        {/* Register Client Modal */}

        {isAddClientOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">

            <div className="max-w-xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">

              <button
                onClick={() =>
                  setIsAddClientOpen(false)
                }
                className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="space-y-1">
                <p className="text-xs font-mono uppercase text-purple-600 dark:text-purple-400 tracking-widest">
                  CRM & Tax Setup
                </p>

                <h2 className="text-2xl font-light text-slate-900 dark:text-white">
                  Register New Client
                </h2>
              </div>

              <form
                onSubmit={
                  handleCreateClient
                }
                className="space-y-4"
              >

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                    Contact Name *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Jane Wanjiku"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    required
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                      Email Address *
                    </label>

                    <input
                      type="email"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      required
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                      Phone Number
                    </label>

                    <input
                      type="text"
                      placeholder="+254 700 000 000"
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                      Company / Organization
                    </label>

                    <input
                      type="text"
                      placeholder="e.g. Safaricom Spark"
                      value={company}
                      onChange={(event) =>
                        setCompany(
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                      Location
                    </label>

                    <input
                      type="text"
                      placeholder="Nairobi, Kenya"
                      value={location}
                      onChange={(event) =>
                        setLocation(
                          event.target.value
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                    Website
                  </label>

                  <input
                    type="url"
                    placeholder="https://company.com"
                    value={website}
                    onChange={(event) =>
                      setWebsite(
                        event.target.value
                      )
                    }
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">
                      Feedback Stage
                    </label>

                    <select
                      value={
                        feedbackStatus
                      }
                      onChange={(event) =>
                        setFeedbackStatus(
                          event.target
                            .value as FeedbackStatus
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="AWAITING_FEEDBACK">
                        Awaiting Client Feedback 💬
                      </option>

                      <option value="FEEDBACK_RECEIVED">
                        Feedback Received
                      </option>

                      <option value="IN_PRODUCTION">
                        In Production / Retouching
                      </option>

                      <option value="COMPLETED">
                        Completed & Delivered
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">
                      Contract Status
                    </label>

                    <select
                      value={
                        contractStatus
                      }
                      onChange={(event) =>
                        setContractStatus(
                          event.target
                            .value as ContractStatus
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NOT_SENT">
                        Not Sent
                      </option>

                      <option value="SENT">
                        Sent for Signature ⏳
                      </option>

                      <option value="SIGNED">
                        Signed & Active ✓
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">
                      KRA eTIMS Invoice
                    </label>

                    <select
                      value={
                        etimsInvoiceStatus
                      }
                      onChange={(event) =>
                        setEtimsInvoiceStatus(
                          event.target
                            .value as EtimsInvoiceStatus
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NOT_SENT">
                        Not Generated
                      </option>

                      <option value="SENT">
                        eTIMS Invoice Shared
                      </option>

                      <option value="PAID">
                        Invoice Paid ✓
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">
                      Withholding Tax Cert
                    </label>

                    <select
                      value={
                        taxCertificateStatus
                      }
                      onChange={(event) =>
                        setTaxCertificateStatus(
                          event.target
                            .value as TaxCertificateStatus
                        )
                      }
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NOT_RECEIVED">
                        Pending Tax Cert ⚠️
                      </option>

                      <option value="RECEIVED">
                        Tax Cert Received ✓
                      </option>

                      <option value="NOT_APPLICABLE">
                        Not Applicable
                      </option>
                    </select>
                  </div>

                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">
                    Internal Notes
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Project deliverables or billing notes..."
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? 'Saving Client...'
                    : '+ Add Client to CRM'}
                </button>

              </form>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}

        {selectedClient && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white">

            <div className="max-w-2xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">

              <button
                onClick={() =>
                  setSelectedClient(null)
                }
                className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>

              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4 pr-8">

                {selectedClient.company && (
                  <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
                    {selectedClient.company}
                  </span>
                )}

                <h2 className="text-2xl font-light text-slate-900 dark:text-white mt-2">
                  {selectedClient.name}
                </h2>

                <p className="text-xs font-mono text-slate-600 dark:text-zinc-400">
                  {selectedClient.email ||
                    'No email'}
                  {' • '}
                  {selectedClient.phone ||
                    'No phone'}
                  {' • '}
                  {selectedClient.location ||
                    'No location'}
                </p>

              </div>

              <div className="p-6 bg-slate-100 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-4 text-xs font-mono">

                <p className="text-purple-600 dark:text-purple-400 font-bold uppercase text-[10px]">
                  Update Business & Compliance Tracking
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Feedback */}

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-400 text-[10px] uppercase">
                      Feedback Status
                    </label>

                    <select
                      value={
                        selectedClient.feedbackStatus
                      }
                      onChange={(event) =>
                        void updateClientStatus(
                          selectedClient,
                          'feedbackStatus',
                          event.target
                            .value as FeedbackStatus
                        )
                      }
                      className="w-full p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg"
                    >
                      <option value="AWAITING_FEEDBACK">
                        Awaiting Client Feedback 💬
                      </option>

                      <option value="FEEDBACK_RECEIVED">
                        Feedback Received
                      </option>

                      <option value="IN_PRODUCTION">
                        In Production
                      </option>

                      <option value="COMPLETED">
                        Completed
                      </option>
                    </select>
                  </div>

                  {/* Contract */}

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-400 text-[10px] uppercase">
                      Contract Status
                    </label>

                    <select
                      value={
                        selectedClient.contractStatus
                      }
                      onChange={(event) =>
                        void updateClientStatus(
                          selectedClient,
                          'contractStatus',
                          event.target
                            .value as ContractStatus
                        )
                      }
                      className="w-full p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg"
                    >
                      <option value="NOT_SENT">
                        Not Sent
                      </option>

                      <option value="SENT">
                        Sent for Signature ⏳
                      </option>

                      <option value="SIGNED">
                        Signed & Active ✓
                      </option>
                    </select>
                  </div>

                  {/* eTIMS */}

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-400 text-[10px] uppercase">
                      KRA eTIMS Invoice
                    </label>

                    <select
                      value={
                        selectedClient.etimsInvoiceStatus
                      }
                      onChange={(event) =>
                        void updateClientStatus(
                          selectedClient,
                          'etimsInvoiceStatus',
                          event.target
                            .value as EtimsInvoiceStatus
                        )
                      }
                      className="w-full p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg"
                    >
                      <option value="NOT_SENT">
                        Not Generated
                      </option>

                      <option value="SENT">
                        eTIMS Invoice Shared
                      </option>

                      <option value="PAID">
                        Invoice Paid ✓
                      </option>
                    </select>
                  </div>

                  {/* Tax Certificate */}

                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-zinc-400 text-[10px] uppercase">
                      Withholding Tax Cert
                    </label>

                    <select
                      value={
                        selectedClient.taxCertificateStatus
                      }
                      onChange={(event) =>
                        void updateClientStatus(
                          selectedClient,
                          'taxCertificateStatus',
                          event.target
                            .value as TaxCertificateStatus
                        )
                      }
                      className="w-full p-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white rounded-lg"
                    >
                      <option value="NOT_RECEIVED">
                        Pending Tax Cert ⚠️
                      </option>

                      <option value="RECEIVED">
                        Tax Cert Received ✓
                      </option>

                      <option value="NOT_APPLICABLE">
                        Not Applicable
                      </option>
                    </select>
                  </div>

                </div>

                {/* Notes */}

                <div className="space-y-1 pt-2">
                  <label className="text-slate-600 dark:text-zinc-400 text-[10px] uppercase">
                    Internal Notes
                  </label>

                  <p className="text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {selectedClient.notes ||
                      'No internal notes.'}
                  </p>
                </div>

              </div>

              {/* Client Record Details */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl">
                  <p className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-500">
                    CRM Record ID
                  </p>

                  <p className="text-xs font-mono text-slate-700 dark:text-zinc-300 mt-1 break-all">
                    {selectedClient.id}
                  </p>
                </div>

                <div className="p-4 border border-slate-200 dark:border-zinc-800 rounded-xl">
                  <p className="text-[10px] font-mono uppercase text-slate-500 dark:text-zinc-500">
                    Client Status
                  </p>

                  <p className="text-xs font-mono text-slate-700 dark:text-zinc-300 mt-1">
                    {selectedClient.status}
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}