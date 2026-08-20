'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

/* =========================================================
   TYPES
========================================================= */

type Client = {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
};

type QuoteItem = {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  notes?: string | null;
};

type Quote = {
  id: string;
  creatorId?: string;
  clientId?: string | null;

  quoteNumber?: string | null;
  title: string;
  projectName?: string | null;

  status: string;

  subtotal: number;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  tax: number;
  total: number;

  currency: string;

  paymentTerms?: string | null;
  validUntil?: string | null;
  productionDays?: number | null;
  location?: string | null;
  clientContact?: string | null;
  depositPercentage?: number | null;
  notes?: string | null;

  invoiceId?: string | null;

  createdAt: string;
  updatedAt: string;

  client?: Client | null;
  items?: QuoteItem[];
};

type EquipmentOption = {
  id: string;
  name: string;
  category: string;
  unit: string;
  rate: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const PURPLE = '#6D5DFB';

const statusOptions = [
  {
    value: 'draft',
    label: 'Draft',
  },
  {
    value: 'sent',
    label: 'Sent',
  },
  {
    value: 'accepted',
    label: 'Accepted',
  },
];

const currencyOptions = [
  {
    value: 'KES',
    label: 'KES — Kenya',
  },
  {
    value: 'USD',
    label: 'USD — United States',
  },
  {
    value: 'EUR',
    label: 'EUR — Euro',
  },
  {
    value: 'GBP',
    label: 'GBP — British Pound',
  },
];

const categoryOptions = [
  'Equipment',
  'Camera',
  'Lighting',
  'Audio',
  'Grip',
  'Production',
  'Crew',
  'Transport',
  'Studio',
  'Editing',
  'Post Production',
  'Other',
];

/*
 * Local equipment catalogue used by the searchable selector.
 *
 * The quote itself remains fully editable, so adding an item
 * that isn't in this catalogue is still possible.
 *
 * If your project already has an equipment API, this list can
 * later be replaced by that endpoint without changing the
 * editor structure.
 */
const equipmentCatalogue: EquipmentOption[] = [
  {
    id: 'sony-fx3',
    name: 'Sony FX3',
    category: 'Camera',
    unit: 'day',
    rate: 15000,
  },
  {
    id: 'sony-fx6',
    name: 'Sony FX6',
    category: 'Camera',
    unit: 'day',
    rate: 22000,
  },
  {
    id: 'sony-a7siii',
    name: 'Sony A7S III',
    category: 'Camera',
    unit: 'day',
    rate: 10000,
  },
  {
    id: 'canon-c70',
    name: 'Canon C70',
    category: 'Camera',
    unit: 'day',
    rate: 18000,
  },
  {
    id: 'red-komodo',
    name: 'RED Komodo',
    category: 'Camera',
    unit: 'day',
    rate: 25000,
  },
  {
    id: 'aputure-600d',
    name: 'Aputure 600D',
    category: 'Lighting',
    unit: 'day',
    rate: 10000,
  },
  {
    id: 'aputure-300d',
    name: 'Aputure 300D',
    category: 'Lighting',
    unit: 'day',
    rate: 7000,
  },
  {
    id: 'godox-sl60',
    name: 'Godox SL60',
    category: 'Lighting',
    unit: 'day',
    rate: 3500,
  },
  {
    id: 'tube-lights',
    name: 'LED Tube Lights',
    category: 'Lighting',
    unit: 'day',
    rate: 2500,
  },
  {
    id: 'rode-wireless',
    name: 'Rode Wireless Pro',
    category: 'Audio',
    unit: 'day',
    rate: 5000,
  },
  {
    id: 'boom-mic',
    name: 'Boom Microphone',
    category: 'Audio',
    unit: 'day',
    rate: 4000,
  },
  {
    id: 'zoom-f6',
    name: 'Zoom F6 Recorder',
    category: 'Audio',
    unit: 'day',
    rate: 6000,
  },
  {
    id: 'tripod',
    name: 'Professional Tripod',
    category: 'Grip',
    unit: 'day',
    rate: 3000,
  },
  {
    id: 'gimbal',
    name: 'DJI RS 3 Pro',
    category: 'Grip',
    unit: 'day',
    rate: 6000,
  },
  {
    id: 'slider',
    name: 'Camera Slider',
    category: 'Grip',
    unit: 'day',
    rate: 5000,
  },
  {
    id: 'production-assistant',
    name: 'Production Assistant',
    category: 'Crew',
    unit: 'day',
    rate: 5000,
  },
  {
    id: 'camera-operator',
    name: 'Camera Operator',
    category: 'Crew',
    unit: 'day',
    rate: 12000,
  },
  {
    id: 'director',
    name: 'Director',
    category: 'Crew',
    unit: 'day',
    rate: 20000,
  },
  {
    id: 'editing',
    name: 'Video Editing',
    category: 'Post Production',
    unit: 'project',
    rate: 25000,
  },
  {
    id: 'colour-grade',
    name: 'Colour Grade',
    category: 'Post Production',
    unit: 'project',
    rate: 15000,
  },
  {
    id: 'transport',
    name: 'Production Transport',
    category: 'Transport',
    unit: 'day',
    rate: 8000,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatDate(date?: string | null) {
  if (!date) return '—';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(date?: string | null) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function formatAmount(
  amount: number | null | undefined,
  currency: string
) {
  const value = Number(amount || 0);

  return `${currency} ${value.toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function toNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function calculateItemAmount(
  quantity: number,
  rate: number
) {
  return toNumber(quantity) * toNumber(rate);
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* =========================================================
   REUSABLE FIELD CLASSES
========================================================= */

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder hover focus focus focus focus/10';

const compactInputClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder hover focus focus focus focus/10';

const labelClass =
  'mb-2 block text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-slate-400';

const sectionLabelClass =
  'text-[10px] font-mono font-medium uppercase tracking-[0.25em] text-purple-500';

/* =========================================================
   COMPONENT
========================================================= */

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const quoteId = params?.id;

  const [quote, setQuote] = useState<Quote | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [openEquipmentId, setOpenEquipmentId] =
    useState<string | null>(null);

  /* =======================================================
     LOAD QUOTE
  ======================================================= */

  useEffect(() => {
    if (!quoteId) {
      return;
    }

    let cancelled = false;

    async function fetchQuote() {
      try {
        if (!cancelled) {
          setLoading(true);
          setError('');
        }

        const response = await fetch(
          `/api/quotes/${quoteId}`,
          {
            cache: 'no-store',
          }
        );

        const data = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.error || 'Failed to load quote'
          );
        }

        if (!cancelled) {
          setQuote(data);
        }
      } catch (err) {
        console.error(
          'Failed to load quote:',
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load quote.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchQuote();

    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  /* =======================================================
     QUOTE FIELD UPDATES
  ======================================================= */

  function updateQuoteField(
    field: keyof Quote,
    value: unknown
  ) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function updateClientField(
    field: keyof Client,
    value: string
  ) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        client: current.client
          ? {
              ...current.client,
              [field]: value,
            }
          : {
              id: '',
              name: '',
              [field]: value,
            },
      };
    });
  }

  /* =======================================================
     ITEM UPDATES
  ======================================================= */

  function updateItem(
    itemId: string,
    field: keyof QuoteItem,
    value: unknown
  ) {
    setQuote((current) => {
      if (!current) return current;

      const items = (current.items || []).map(
        (item) => {
          if (item.id !== itemId) {
            return item;
          }

          const updated = {
            ...item,
            [field]: value,
          };

          if (
            field === 'quantity' ||
            field === 'rate'
          ) {
            updated.amount =
              calculateItemAmount(
                toNumber(updated.quantity),
                toNumber(updated.rate)
              );
          }

          return updated;
        }
      );

      return {
        ...current,
        items,
      };
    });
  }

  function addItem() {
    setQuote((current) => {
      if (!current) return current;

      const newItem: QuoteItem = {
        id: `new-${Date.now()}`,
        category: 'Equipment',
        description: '',
        quantity: 1,
        unit: 'day',
        rate: 0,
        amount: 0,
        notes: null,
      };

      return {
        ...current,
        items: [
          ...(current.items || []),
          newItem,
        ],
      };
    });
  }

  function removeItem(itemId: string) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        items: (current.items || []).filter(
          (item) => item.id !== itemId
        ),
      };
    });
  }

  function selectEquipment(
    itemId: string,
    equipment: EquipmentOption
  ) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        items: (current.items || []).map(
          (item) => {
            if (item.id !== itemId) {
              return item;
            }

            return {
              ...item,
              category: equipment.category,
              description: equipment.name,
              unit: equipment.unit,
              rate: equipment.rate,
              amount:
                equipment.rate *
                toNumber(item.quantity || 1),
            };
          }
        ),
      };
    });

    setOpenEquipmentId(null);
    setEquipmentSearch('');
  }

  /* =======================================================
     TOTALS
  ======================================================= */

  const calculatedTotals = useMemo(() => {
    if (!quote) {
      return {
        subtotal: 0,
        discountAmount: 0,
        tax: 0,
        total: 0,
      };
    }

    const subtotal = (quote.items || []).reduce(
      (sum, item) =>
        sum +
        calculateItemAmount(
          item.quantity,
          item.rate
        ),
      0
    );

    let discountAmount = 0;

    if (
      quote.discountType ===
      'percentage'
    ) {
      discountAmount =
        subtotal *
        (toNumber(quote.discountValue) /
          100);
    }

    if (
      quote.discountType ===
      'fixed'
    ) {
      discountAmount = toNumber(
        quote.discountValue
      );
    }

    discountAmount = Math.min(
      subtotal,
      Math.max(0, discountAmount)
    );

    const taxableAmount =
      subtotal - discountAmount;

    const tax = Math.max(
      0,
      toNumber(quote.tax)
    );

    const total =
      taxableAmount + tax;

    return {
      subtotal,
      discountAmount,
      tax,
      total,
    };
  }, [quote]);

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveQuote() {
    if (!quote) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(
        `/api/quotes/${quote.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title: quote.title,
            projectName:
              quote.projectName,
            quoteNumber:
              quote.quoteNumber,
            clientId:
              quote.clientId,
            currency:
              quote.currency,
            paymentTerms:
              quote.paymentTerms,
            validUntil:
              quote.validUntil,
            productionDays:
              quote.productionDays,
            location:
              quote.location,
            clientContact:
              quote.clientContact,
            depositPercentage:
              quote.depositPercentage,
            notes: quote.notes,
            discountType:
              quote.discountType,
            discountValue:
              quote.discountValue,
            tax: calculatedTotals.tax,
            subtotal:
              calculatedTotals.subtotal,
            discountAmount:
              calculatedTotals.discountAmount,
            total:
              calculatedTotals.total,
            items:
              quote.items || [],
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to save quote'
        );
      }

      setQuote(data);

      setSuccess(
        'Quote saved successfully.'
      );
    } catch (err) {
      console.error(
        'Failed to save quote:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save quote.'
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     STATUS
  ======================================================= */

  async function updateQuoteStatus(
    nextStatus: string
  ) {
    if (!quote) return;

    try {
      setActionLoading(
        nextStatus
      );

      setError('');
      setSuccess('');

      const response = await fetch(
        `/api/quotes/${quote.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to update quote status'
        );
      }

      setQuote(data);

      setSuccess(
        `Quote marked as ${formatStatus(
          nextStatus
        )}.`
      );
    } catch (err) {
      console.error(
        'Failed to update quote status:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update quote.'
      );
    } finally {
      setActionLoading('');
    }
  }

  /* =======================================================
     INVOICE
  ======================================================= */

  async function generateInvoice() {
    if (!quote) return;

    if (
      quote.status?.toLowerCase() !==
      'accepted'
    ) {
      setError(
        'An invoice can only be generated from an accepted quote.'
      );

      return;
    }

    if (quote.invoiceId) {
      router.push(
        `/admin/invoices/${quote.invoiceId}`
      );

      return;
    }

    try {
      setActionLoading('invoice');
      setError('');
      setSuccess('');

      const response = await fetch(
        '/api/invoices',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            quoteId: quote.id,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to generate invoice'
        );
      }

      const invoiceId =
        data?.id ||
        data?.invoice?.id;

      if (!invoiceId) {
        throw new Error(
          'Invoice was created but no invoice ID was returned.'
        );
      }

      setQuote((current) =>
        current
          ? {
              ...current,
              invoiceId,
              status: 'invoiced',
            }
          : current
      );

      router.push(
        `/admin/invoices/${invoiceId}`
      );
    } catch (err) {
      console.error(
        'Failed to generate invoice:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate invoice.'
      );
    } finally {
      setActionLoading('');
    }
  }

  function printQuote() {
    window.print();
  }

  /* =======================================================
     EQUIPMENT SEARCH
  ======================================================= */

  const filteredEquipment = useMemo(() => {
    const query =
      equipmentSearch
        .trim()
        .toLowerCase();

    if (!query) {
      return equipmentCatalogue;
    }

    return equipmentCatalogue.filter(
      (equipment) =>
        equipment.name
          .toLowerCase()
          .includes(query) ||
        equipment.category
          .toLowerCase()
          .includes(query)
    );
  }, [equipmentSearch]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div
              className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200"
              style={{
                borderTopColor: PURPLE,
              }}
            />

            <p className="text-xs font-mono uppercase tracking-[0.2em] text-slate-400">
              Loading quote
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!quote) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin/quotes"
            className="text-xs font-mono uppercase tracking-widest text-purple-600"
          >
            ← Back to Quotes
          </Link>

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <h1 className="text-xl font-semibold text-red-700">
              Quote not found
            </h1>

            <p className="mt-2 text-sm text-red-600">
              {error ||
                'The requested quote could not be loaded.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const status =
    quote.status?.toLowerCase() ||
    'draft';

  const canSend =
    status === 'draft';

  const canAccept =
    status === 'sent';

  const canGenerateInvoice =
    status === 'accepted' &&
    !quote.invoiceId;

  const hasInvoice =
    Boolean(quote.invoiceId);

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:p-0">
      {/* ===================================================
          TOP TOOLBAR
      =================================================== */}

      <div className="mx-auto mb-6 max-w-7xl print:hidden">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/quotes"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600"
              aria-label="Back to quotes"
            >
              ←
            </Link>

            <div>
              <p className={sectionLabelClass}>
                Quote Editor
              </p>

              <p className="mt-1 text-sm font-medium text-slate-900">
                {quote.quoteNumber ||
                  'New quotation'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={printQuote}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Print / PDF
            </button>

            <button
              type="button"
              onClick={saveQuote}
              disabled={saving}
              className="rounded-xl px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: PURPLE,
              }}
            >
              {saving
                ? 'Saving...'
                : 'Save Quote'}
            </button>

            {canSend && (
              <button
                type="button"
                disabled={
                  Boolean(actionLoading)
                }
                onClick={() =>
                  updateQuoteStatus(
                    'sent'
                  )
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {actionLoading ===
                'sent'
                  ? 'Sending...'
                  : 'Send Quote'}
              </button>
            )}

            {canAccept && (
              <button
                type="button"
                disabled={
                  Boolean(actionLoading)
                }
                onClick={() =>
                  updateQuoteStatus(
                    'accepted'
                  )
                }
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {actionLoading ===
                'accepted'
                  ? 'Updating...'
                  : 'Mark Accepted'}
              </button>
            )}

            {canGenerateInvoice && (
              <button
                type="button"
                disabled={
                  Boolean(actionLoading)
                }
                onClick={
                  generateInvoice
                }
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                {actionLoading ===
                'invoice'
                  ? 'Generating...'
                  : 'Generate Invoice'}
              </button>
            )}

            {hasInvoice && (
              <Link
                href={`/admin/invoices/${quote.invoiceId}`}
                className="rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-white transition hover:bg-amber-600"
              >
                View Invoice →
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
            {success}
          </div>
        )}
      </div>

      {/* ===================================================
          QUOTE DOCUMENT
      =================================================== */}

      <main
        id="quote-preview"
        className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none"
      >
        {/* =================================================
            DOCUMENT HEADER
        ================================================= */}

        <section className="px-6 pb-8 pt-7 sm:px-10 sm:pb-10 sm:pt-9 lg:px-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{
                  backgroundColor: PURPLE,
                }}
              >
                K
              </div>

              <div>
                <p className="text-sm font-bold tracking-[0.28em] text-slate-900">
                  KIPSMTHN
                </p>

                <p className="mt-1 text-[9px] font-mono uppercase tracking-[0.25em] text-slate-400">
                  Creative Production
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className={sectionLabelClass}>
                Quotation
              </p>

              <input
                value={
                  quote.quoteNumber ||
                  ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'quoteNumber',
                    event.target.value
                  )
                }
                placeholder="Q-2026-000001"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-right text-sm font-mono font-medium text-slate-900 outline-none focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10 sm:w-52"
              />

              <p className="mt-2 text-[11px] text-slate-400">
                Issued{' '}
                {formatDate(
                  quote.createdAt
                )}
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            PROJECT + CLIENT
        ================================================= */}

        <section className="border-y border-slate-100 bg-white px-6 py-8 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            {/* PROJECT */}

            <div>
              <p className={sectionLabelClass}>
                Project Quotation
              </p>

              <input
                value={quote.title || ''}
                onChange={(event) =>
                  updateQuoteField(
                    'title',
                    event.target.value
                  )
                }
                placeholder="Project quotation"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-2xl font-semibold tracking-tight text-slate-900 outline-none transition placeholder:text-slate-300 hover:border-slate-300 focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-500/10 sm:text-3xl"
              />

              <input
                value={
                  quote.projectName ||
                  ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'projectName',
                    event.target.value
                  )
                }
                placeholder="Project name"
                className={`mt-3 ${inputClass}`}
              />
            </div>

            {/* CLIENT */}

            <div>
              <p className={sectionLabelClass}>
                Prepared For
              </p>

              <div className="mt-3 space-y-2">
                <input
                  value={
                    quote.client?.name ||
                    ''
                  }
                  onChange={(event) =>
                    updateClientField(
                      'name',
                      event.target.value
                    )
                  }
                  placeholder="Client name"
                  className={inputClass}
                />

                <input
                  value={
                    quote.client?.company ||
                    ''
                  }
                  onChange={(event) =>
                    updateClientField(
                      'company',
                      event.target.value
                    )
                  }
                  placeholder="Company"
                  className={inputClass}
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input
                    value={
                      quote.client
                        ?.email || ''
                    }
                    onChange={(event) =>
                      updateClientField(
                        'email',
                        event.target.value
                      )
                    }
                    placeholder="Email"
                    type="email"
                    className={inputClass}
                  />

                  <input
                    value={
                      quote.client
                        ?.phone || ''
                    }
                    onChange={(event) =>
                      updateClientField(
                        'phone',
                        event.target.value
                      )
                    }
                    placeholder="Phone"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            META ROW
        ================================================= */}

        <section className="bg-slate-50 px-6 py-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className={labelClass}>
                Issue Date
              </label>

              <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-600">
                {formatDate(
                  quote.createdAt
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Valid Until
              </label>

              <input
                type="date"
                value={toDateInputValue(
                  quote.validUntil
                )}
                onChange={(event) =>
                  updateQuoteField(
                    'validUntil',
                    event.target.value
                  )
                }
                className={compactInputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Currency
              </label>

              <select
                value={
                  quote.currency ||
                  'KES'
                }
                onChange={(event) =>
                  updateQuoteField(
                    'currency',
                    event.target.value
                  )
                }
                className={compactInputClass}
              >
                {currencyOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Production
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={
                    quote.productionDays ??
                    1
                  }
                  onChange={(event) =>
                    updateQuoteField(
                      'productionDays',
                      Math.max(
                        1,
                        Number(
                          event.target
                            .value
                        ) || 1
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                />

                <span className="text-xs text-slate-400">
                  days
                </span>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Deposit
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    quote.depositPercentage ??
                    50
                  }
                  onChange={(event) =>
                    updateQuoteField(
                      'depositPercentage',
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            event.target
                              .value
                          ) || 0
                        )
                      )
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-500/10"
                />

                <span className="text-xs text-slate-400">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  updateQuoteStatus(
                    event.target.value
                  )
                }
                disabled={
                  Boolean(
                    actionLoading
                  )
                }
                className={compactInputClass}
              >
                {statusOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={
                        option.value
                      }
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </section>

        {/* =================================================
            PROJECT INFORMATION
        ================================================= */}

        <section className="px-6 py-8 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div>
              <label className={labelClass}>
                Project
              </label>

              <input
                value={
                  quote.projectName ||
                  ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'projectName',
                    event.target.value
                  )
                }
                placeholder="Project name"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Location
              </label>

              <input
                value={
                  quote.location || ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'location',
                    event.target.value
                  )
                }
                placeholder="Nairobi"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Client Contact
              </label>

              <input
                value={
                  quote.clientContact ||
                  ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'clientContact',
                    event.target.value
                  )
                }
                placeholder="Primary contact"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* =================================================
            SCOPE
        ================================================= */}

        <section className="px-6 pb-8 sm:px-10 lg:px-14">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={sectionLabelClass}>
                Project Scope
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                Equipment &amp; Services
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Add equipment, crew,
                production services or
                post-production work.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-widest text-purple-600 transition hover:border-purple-300 hover:bg-purple-100 print:hidden"
            >
              + Add Item
            </button>
          </div>

          {/* TABLE */}

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="hidden grid-cols-[42px_minmax(240px,1.8fr)_150px_90px_130px_140px_42px] bg-slate-50 px-4 py-3 text-[9px] font-mono uppercase tracking-[0.18em] text-slate-400 md:grid">
              <div>#</div>

              <div>
                Item / Equipment
              </div>

              <div>
                Category
              </div>

              <div className="text-right">
                Qty
              </div>

              <div className="text-right">
                Rate
              </div>

              <div className="text-right">
                Total
              </div>

              <div />
            </div>

            <div className="divide-y divide-slate-100">
              {(quote.items || []).map(
                (item, index) => {
                  const isOpen =
                    openEquipmentId ===
                    item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative p-4"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-[42px_minmax(240px,1.8fr)_150px_90px_130px_140px_42px] md:items-start">
                        {/* NUMBER */}

                        <div className="hidden pt-3 text-xs font-mono text-slate-400 md:block">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )}
                        </div>

                        {/* EQUIPMENT */}

                        <div className="relative">
                          <label className="mb-1.5 block text-[9px] font-mono uppercase tracking-widest text-slate-400 md:hidden">
                            Item /
                            Equipment
                          </label>

                          <div className="relative">
                            <input
                              value={
                                isOpen
                                  ? equipmentSearch
                                  : item.description
                              }
                              onFocus={() => {
                                setOpenEquipmentId(
                                  item.id
                                );

                                setEquipmentSearch(
                                  item.description
                                );
                              }}
                              onChange={(
                                event
                              ) => {
                                setOpenEquipmentId(
                                  item.id
                                );

                                setEquipmentSearch(
                                  event
                                    .target
                                    .value
                                );

                                updateItem(
                                  item.id,
                                  'description',
                                  event
                                    .target
                                    .value
                                );
                              }}
                              placeholder="Search equipment or type custom item..."
                              className={inputClass}
                            />

                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                              ⌄
                            </span>
                          </div>

                          {isOpen && (
                            <>
                              <button
                                type="button"
                                aria-label="Close equipment menu"
                                className="fixed inset-0 z-10 cursor-default"
                                onClick={() =>
                                  setOpenEquipmentId(
                                    null
                                  )
                                }
                              />

                              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                {filteredEquipment.length ===
                                0 ? (
                                  <div className="px-3 py-6 text-center">
                                    <p className="text-sm font-medium text-slate-700">
                                      No equipment
                                      found
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      Keep typing
                                      to use a
                                      custom
                                      item.
                                    </p>
                                  </div>
                                ) : (
                                  filteredEquipment.map(
                                    (
                                      equipment
                                    ) => (
                                      <button
                                        key={
                                          equipment.id
                                        }
                                        type="button"
                                        onClick={() =>
                                          selectEquipment(
                                            item.id,
                                            equipment
                                          )
                                        }
                                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-purple-50"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-slate-800">
                                            {
                                              equipment.name
                                            }
                                          </p>

                                          <p className="mt-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                            {
                                              equipment.category
                                            }{' '}
                                            ·{' '}
                                            {
                                              equipment.unit
                                            }
                                          </p>
                                        </div>

                                        <span className="text-xs font-medium text-slate-600">
                                          {formatAmount(
                                            equipment.rate,
                                            quote.currency
                                          )}
                                        </span>
                                      </button>
                                    )
                                  )
                                )}
                              </div>
                            </>
                          )}

                          <input
                            value={
                              item.notes ||
                              ''
                            }
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                'notes',
                                event.target
                                  .value
                              )
                            }
                            placeholder="Optional item note"
                            className="mt-2 w-full border-0 bg-transparent px-1 text-xs text-slate-400 outline-none placeholder:text-slate-300 focus:text-slate-600"
                          />
                        </div>

                        {/* CATEGORY */}

                        <div>
                          <label className="mb-1.5 block text-[9px] font-mono uppercase tracking-widest text-slate-400 md:hidden">
                            Category
                          </label>

                          <select
                            value={
                              item.category
                            }
                            onChange={(event) =>
                              updateItem(
                                item.id,
                                'category',
                                event.target
                                  .value
                              )
                            }
                            className={compactInputClass}
                          >
                            {categoryOptions.map(
                              (
                                category
                              ) => (
                                <option
                                  key={
                                    category
                                  }
                                  value={
                                    category
                                  }
                                >
                                  {
                                    category
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* QTY */}

                        <div>
                          <label className="mb-1.5 block text-[9px] font-mono uppercase tracking-widest text-slate-400 md:hidden">
                            Quantity
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'quantity',
                                Math.max(
                                  1,
                                  Number(
                                    event
                                      .target
                                      .value
                                  ) ||
                                    1
                                )
                              )
                            }
                            className={`${compactInputClass} text-right`}
                          />

                          <input
                            value={
                              item.unit
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'unit',
                                event
                                  .target
                                  .value
                              )
                            }
                            className="mt-1.5 w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-right text-[10px] text-slate-400 outline-none focus:border-slate-200"
                            placeholder="unit"
                          />
                        </div>

                        {/* RATE */}

                        <div>
                          <label className="mb-1.5 block text-[9px] font-mono uppercase tracking-widest text-slate-400 md:hidden">
                            Rate
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.rate
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'rate',
                                Math.max(
                                  0,
                                  Number(
                                    event
                                      .target
                                      .value
                                  ) ||
                                    0
                                )
                              )
                            }
                            className={`${compactInputClass} text-right`}
                          />
                        </div>

                        {/* TOTAL */}

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 md:block md:bg-transparent md:px-0 md:py-2 md:text-right">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 md:hidden">
                            Total
                          </span>

                          <span className="text-sm font-semibold text-slate-900">
                            {formatAmount(
                              calculateItemAmount(
                                item.quantity,
                                item.rate
                              ),
                              quote.currency
                            )}
                          </span>
                        </div>

                        {/* DELETE */}

                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500 print:hidden"
                            aria-label="Remove item"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}

              {(quote.items || [])
                .length === 0 && (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-500">
                    +
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    No items added yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add equipment or a
                    production service
                    to start the quote.
                  </p>

                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-5 rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white"
                    style={{
                      backgroundColor:
                        PURPLE,
                    }}
                  >
                    Add First Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            TOTALS
        ================================================= */}

        <section className="border-t border-slate-100 px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex justify-end">
            <div className="w-full max-w-md">
              <div className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-slate-800">
                  {formatAmount(
                    calculatedTotals.subtotal,
                    quote.currency
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Discount
                  </span>

                  <select
                    value={
                      quote.discountType ||
                      'none'
                    }
                    onChange={(event) =>
                      updateQuoteField(
                        'discountType',
                        event.target.value
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-mono uppercase outline-none focus:border-purple-400 print:hidden"
                  >
                    <option value="none">
                      None
                    </option>

                    <option value="percentage">
                      Percentage
                    </option>

                    <option value="fixed">
                      Fixed
                    </option>
                  </select>

                  {quote.discountType !==
                    'none' && (
                    <input
                      type="number"
                      min="0"
                      value={
                        quote.discountValue ??
                        0
                      }
                      onChange={(event) =>
                        updateQuoteField(
                          'discountValue',
                          Number(
                            event.target
                              .value
                          ) || 0
                        )
                      }
                      className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-xs outline-none focus:border-purple-400 print:hidden"
                    />
                  )}
                </div>

                <span className="font-medium text-red-500">
                  {calculatedTotals.discountAmount >
                  0
                    ? `-${formatAmount(
                        calculatedTotals.discountAmount,
                        quote.currency
                      )}`
                    : formatAmount(
                        0,
                        quote.currency
                      )}
                </span>
              </div>

              <div className="flex items-center justify-between py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Tax
                  </span>

                  <input
                    type="number"
                    min="0"
                    value={
                      quote.tax || 0
                    }
                    onChange={(event) =>
                      updateQuoteField(
                        'tax',
                        Number(
                          event.target
                            .value
                        ) || 0
                      )
                    }
                    className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-right text-xs outline-none focus:border-purple-400 print:hidden"
                  />
                </div>

                <span className="font-medium text-slate-800">
                  {formatAmount(
                    calculatedTotals.tax,
                    quote.currency
                  )}
                </span>
              </div>

              <div
                className="my-3 h-px"
                style={{
                  backgroundColor:
                    PURPLE,
                }}
              />

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-400">
                    Grand Total
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {quote.depositPercentage ||
                      0}
                    % deposit required
                  </p>
                </div>

                <p className="text-3xl font-semibold tracking-tight text-slate-900">
                  {formatAmount(
                    calculatedTotals.total,
                    quote.currency
                  )}
                </p>
              </div>

              {quote.depositPercentage &&
                quote.depositPercentage >
                  0 && (
                  <div className="mt-4 rounded-xl bg-purple-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-700">
                        Deposit (
                        {
                          quote.depositPercentage
                        }
                        %)
                      </span>

                      <span className="text-sm font-semibold text-purple-700">
                        {formatAmount(
                          calculatedTotals.total *
                            (Number(
                              quote.depositPercentage
                            ) /
                              100),
                          quote.currency
                        )}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* =================================================
            TERMS
        ================================================= */}

        <section className="border-t border-slate-100 bg-slate-50 px-6 py-8 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className={labelClass}>
                Payment Terms
              </label>

              <textarea
                value={
                  quote.paymentTerms ||
                  ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'paymentTerms',
                    event.target.value
                  )
                }
                placeholder="e.g. 50% deposit to confirm booking. Balance due on delivery."
                rows={5}
                className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-slate-600 outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <label className={labelClass}>
                Client Contact
              </label>

              <textarea
                value={
                  quote.clientContact ||
                  ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'clientContact',
                    event.target.value
                  )
                }
                placeholder="Primary contact details..."
                rows={5}
                className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-slate-600 outline-none placeholder:text-slate-300"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:col-span-2">
              <label className={labelClass}>
                Notes
              </label>

              <textarea
                value={
                  quote.notes || ''
                }
                onChange={(event) =>
                  updateQuoteField(
                    'notes',
                    event.target.value
                  )
                }
                placeholder="Additional notes, deliverables, exclusions or special requirements..."
                rows={4}
                className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-slate-600 outline-none placeholder:text-slate-300"
              />
            </div>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="border-t border-slate-100 px-6 py-8 sm:px-10 lg:px-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{
                    backgroundColor:
                      PURPLE,
                  }}
                >
                  K
                </div>

                <p className="text-xs font-bold tracking-[0.2em] text-slate-800">
                  KIPSMTHN
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Creative Production
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Thank you for the
                opportunity to work
                together.
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                Quotation
              </p>

              <p className="mt-1 text-xs font-mono font-medium text-slate-600">
                {quote.quoteNumber ||
                  quote.id}
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* ===================================================
          PRINT STYLES
      =================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          #quote-preview {
            width: 100%;
            max-width: none;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          input,
          textarea,
          select {
            border-color: transparent !important;
            background: transparent !important;
            box-shadow: none !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
          }

          button {
            display: none !important;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}