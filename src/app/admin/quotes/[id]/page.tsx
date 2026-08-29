'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';

/* =========================================================
   TYPES
========================================================= */

type Client = {
  id: string;
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
};

type QuoteItem = {
  id: string;
  category?: string | null;
  description?: string | null;
  quantity?: number | string | null;
  unit?: string | null;
  rate?: number | string | null;
  amount?: number | string | null;
  notes?: string | null;
};

type Quote = {
  id: string;
  creatorId?: string | null;
  clientId?: string | null;

  quoteNumber?: string | null;
  title: string;
  projectName?: string | null;

  status: string;

  subtotal: number | string;
  discountType?: string | null;
  discountValue?: number | string | null;
  discountAmount?: number | string | null;
  tax: number | string;
  total: number | string;

  currency: string;

  paymentTerms?: string | null;
  validUntil?: string | null;
  productionDays?: number | string | null;
  location?: string | null;
  clientContact?: string | null;
  depositPercentage?: number | string | null;
  notes?: string | null;

  invoiceId?: string | null;

  createdAt?: string;
  updatedAt?: string;

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

type InvoiceConflict = {
  existingInvoiceId: string;
  existingInvoiceNumber?: string | null;
};

type ApiObject = Record<string, unknown>;

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

function isObject(value: unknown): value is ApiObject {
  return typeof value === 'object' && value !== null;
}

function getApiError(value: unknown): string | null {
  if (!isObject(value)) {
    return null;
  }

  return typeof value.error === 'string'
    ? value.error
    : null;
}

function getStringProperty(
  value: unknown,
  key: string
): string | null {
  if (!isObject(value)) {
    return null;
  }

  return typeof value[key] === 'string'
    ? value[key]
    : null;
}

function getInvoiceId(value: unknown): string | null {
  if (!isObject(value)) {
    return null;
  }

  if (typeof value.id === 'string') {
    return value.id;
  }

  if (isObject(value.invoice)) {
    if (typeof value.invoice.id === 'string') {
      return value.invoice.id;
    }
  }

  return null;
}

function hasConflict(value: unknown): boolean {
  return (
    isObject(value) &&
    value.conflict === true &&
    typeof value.existingInvoiceId === 'string'
  );
}

function formatDate(date?: string | null) {
  if (!date) {
    return '—';
  }

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
  if (!date) {
    return '';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().slice(0, 10);
}

function formatAmount(
  amount: number | string | null | undefined,
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
  quantity: number | string | null | undefined,
  rate: number | string | null | undefined
) {
  return toNumber(quantity) * toNumber(rate);
}

function formatStatus(status?: string | null) {
  if (!status) {
    return 'Draft';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusClass(status?: string | null) {
  switch ((status || '').toLowerCase()) {
    case 'accepted':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';

    case 'sent':
      return 'border-blue-200 bg-blue-50 text-blue-700';

    case 'invoiced':
      return 'border-violet-200 bg-violet-50 text-violet-700';

    case 'draft':
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const quoteId = params?.id;

  const [quote, setQuote] = useState<Quote | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] =
    useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [equipmentSearch, setEquipmentSearch] =
    useState('');

  const [openEquipmentId, setOpenEquipmentId] =
    useState<string | null>(null);

  const [invoiceConflict, setInvoiceConflict] =
    useState<InvoiceConflict | null>(null);

  /* =======================================================
     LOAD QUOTE
  ======================================================= */

  useEffect(() => {
    if (!quoteId) {
      return;
    }

    let cancelled = false;

    async function loadQuote() {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/quotes/${quoteId}`,
          {
            cache: 'no-store',
          }
        );

        const data: unknown = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            getApiError(data) ||
              'Failed to load quote.'
          );
        }

        if (!isObject(data)) {
          throw new Error(
            'Invalid quote response.'
          );
        }

        if (!cancelled) {
          setQuote(data as unknown as Quote);
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

    void loadQuote();

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
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
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
      if (!current) {
        return current;
      }

      const items = (
        current.items || []
      ).map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const updated: QuoteItem = {
          ...item,
          [field]: value,
        };

        if (
          field === 'quantity' ||
          field === 'rate'
        ) {
          updated.amount =
            calculateItemAmount(
              updated.quantity,
              updated.rate
            );
        }

        return updated;
      });

      return {
        ...current,
        items,
      };
    });
  }

  function addItem() {
    setQuote((current) => {
      if (!current) {
        return current;
      }

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
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: (
          current.items || []
        ).filter(
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
      if (!current) {
        return current;
      }

      return {
        ...current,
        items: (
          current.items || []
        ).map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          const quantity =
            toNumber(item.quantity) || 1;

          return {
            ...item,
            category: equipment.category,
            description: equipment.name,
            unit: equipment.unit,
            rate: equipment.rate,
            amount:
              equipment.rate * quantity,
          };
        }),
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

    const subtotal = (
      quote.items || []
    ).reduce(
      (sum, item) =>
        sum +
        calculateItemAmount(
          item.quantity,
          item.rate
        ),
      0
    );

    const discountType =
      quote.discountType || 'none';

    const discountValue =
      toNumber(quote.discountValue);

    let discountAmount = 0;

    if (
      discountType === 'percentage'
    ) {
      discountAmount =
        subtotal *
        (discountValue / 100);
    }

    if (
      discountType === 'fixed'
    ) {
      discountAmount = discountValue;
    }

    discountAmount = Math.min(
      subtotal,
      Math.max(0, discountAmount)
    );

    const tax = Math.max(
      0,
      toNumber(quote.tax)
    );

    const total =
      subtotal -
      discountAmount +
      tax;

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
    if (!quote) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        title: quote.title,
        projectName:
          quote.projectName || null,
        quoteNumber:
          quote.quoteNumber || null,
        currency:
          quote.currency || 'KES',
        paymentTerms:
          quote.paymentTerms || null,
        validUntil:
          quote.validUntil || null,
        productionDays:
          toNumber(
            quote.productionDays
          ) || 1,
        location:
          quote.location || null,
        clientContact:
          quote.clientContact || null,
        depositPercentage:
          toNumber(
            quote.depositPercentage
          ),
        notes:
          quote.notes || null,
        discountType:
          quote.discountType || 'none',
        discountValue:
          toNumber(
            quote.discountValue
          ),
        tax:
          toNumber(quote.tax),
        clientId:
          quote.clientId || null,

        items: (
          quote.items || []
        ).map((item) => ({
          id: item.id.startsWith('new-')
            ? undefined
            : item.id,
          category:
            item.category || 'Other',
          description:
            item.description || '',
          quantity:
            Math.max(
              1,
              toNumber(item.quantity)
            ),
          unit:
            item.unit || 'unit',
          rate:
            Math.max(
              0,
              toNumber(item.rate)
            ),
          amount:
            calculateItemAmount(
              item.quantity,
              item.rate
            ),
          notes:
            item.notes || null,
        })),
      };

      const response = await fetch(
        `/api/quotes/${quote.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data: unknown =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(data) ||
            'Failed to save quote.'
        );
      }

      if (
        isObject(data)
      ) {
        setQuote(
          data as unknown as Quote
        );
      }

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
    if (!quote) {
      return;
    }

    try {
      setActionLoading(
        `status-${nextStatus}`
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

      const data: unknown =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiError(data) ||
            'Failed to update quote status.'
        );
      }

      if (isObject(data)) {
        setQuote(
          data as unknown as Quote
        );
      }

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
          : 'Unable to update quote status.'
      );
    } finally {
      setActionLoading('');
    }
  }

  /* =======================================================
     INVOICE
  ======================================================= */

  async function generateInvoice() {
    if (!quote) {
      return;
    }

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

    await createInvoice();
  }

  async function createInvoice(
    action?: 'update' | 'new'
  ) {
    if (!quote) {
      return;
    }

    try {
      setActionLoading('invoice');
      setError('');
      setSuccess('');
      setInvoiceConflict(null);

      const url = action
        ? `/api/quotes/${quote.id}/invoice?action=${action}`
        : `/api/quotes/${quote.id}/invoice`;

      const response = await fetch(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
        }
      );

      /*
       * IMPORTANT:
       *
       * Do not type this as:
       *
       * InvoiceConversionResponse | { error?: string }
       *
       * because that makes TypeScript reject
       * data.error and data.invoice.
       *
       * We intentionally treat the API response
       * as unknown and narrow it safely.
       */
      const data: unknown =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        if (
          response.status === 409 &&
          hasConflict(data)
        ) {
          const existingInvoiceId =
            getStringProperty(
              data,
              'existingInvoiceId'
            );

          if (
            existingInvoiceId
          ) {
            setInvoiceConflict({
              existingInvoiceId,
              existingInvoiceNumber:
                getStringProperty(
                  data,
                  'existingInvoiceNumber'
                ),
            });

            return;
          }
        }

        throw new Error(
          getApiError(data) ||
            'Failed to generate invoice.'
        );
      }

      const invoiceId =
        getInvoiceId(data);

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

  /* =======================================================
     EQUIPMENT SEARCH
  ======================================================= */

  const filteredEquipment =
    useMemo(() => {
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
     PRINT
  ======================================================= */

  function printQuote() {
    window.print();
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
            <Loader2
              className="mx-auto h-7 w-7 animate-spin"
              style={{
                color: PURPLE,
              }}
            />

            <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">
              Loading quote
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!quote) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />

            <h1 className="mt-5 text-lg font-medium text-slate-900">
              Quote not found
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              {error ||
                'This quote could not be loaded.'}
            </p>

            <Link
              href="/admin/quotes"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to quotes
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 print:bg-white print:p-0">
        <div className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-0">

          {/* HEADER */}

          <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between print:hidden">
            <div>
              <Link
                href="/admin/quotes"
                className="mb-4 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 transition hover:text-slate-900"
              >
                <ArrowLeft className="h-3 w-3" />
                Quotes
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.25em]"
                  style={{
                    color: PURPLE,
                  }}
                >
                  Quote
                </p>

                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-mono uppercase tracking-widest ${getStatusClass(
                    quote.status
                  )}`}
                >
                  {formatStatus(
                    quote.status
                  )}
                </span>
              </div>

              <h1 className="mt-2 text-3xl font-light tracking-tight text-slate-950 sm:text-4xl">
                {quote.title ||
                  'Untitled quote'}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {quote.quoteNumber ||
                  `Quote ${quote.id
                    .slice(0, 8)
                    .toUpperCase()}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={printQuote}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </button>

              <button
                type="button"
                onClick={saveQuote}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </button>

              {quote.status ===
                'accepted' && (
                <button
                  type="button"
                  onClick={
                    generateInvoice
                  }
                  disabled={
                    actionLoading ===
                    'invoice'
                  }
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor:
                      PURPLE,
                  }}
                >
                  {actionLoading ===
                  'invoice' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  Generate Invoice
                </button>
              )}
            </div>
          </header>

          {/* MESSAGES */}

          {(error || success) && (
            <div className="print:hidden">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && !error && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {success}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INVOICE CONFLICT */}

          {invoiceConflict && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 print:hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    An invoice already exists
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    {invoiceConflict
                      .existingInvoiceNumber ||
                      'An invoice has already been generated for this quote.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/invoices/${invoiceConflict.existingInvoiceId}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white"
                  >
                    View Invoice
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      void createInvoice(
                        'update'
                      )
                    }
                    disabled={
                      actionLoading ===
                      'invoice'
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-amber-800"
                  >
                    Update Existing
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void createInvoice(
                        'new'
                      )
                    }
                    disabled={
                      actionLoading ===
                      'invoice'
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-amber-800"
                  >
                    Create New
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setInvoiceConflict(
                        null
                      )
                    }
                    className="inline-flex items-center justify-center rounded-xl border border-transparent px-3 py-2 text-slate-500 hover:text-slate-900"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* PRINT DOCUMENT */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">

            {/* DOCUMENT HEADER */}

            <div className="border-b border-slate-200 p-6 sm:p-8 print:border-b print:px-12 print:py-10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-[0.25em]"
                    style={{
                      color: PURPLE,
                    }}
                  >
                    QUOTE
                  </p>

                  <h2 className="mt-2 text-3xl font-light tracking-tight text-slate-950">
                    {quote.title ||
                      'Untitled quote'}
                  </h2>

                  {quote.projectName && (
                    <p className="mt-2 text-sm text-slate-500">
                      {quote.projectName}
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-mono text-sm font-medium text-slate-900">
                    {quote.quoteNumber ||
                      `Q-${quote.id
                        .slice(0, 8)
                        .toUpperCase()}`}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Issued{' '}
                    {formatDate(
                      quote.createdAt
                    )}
                  </p>

                  {quote.validUntil && (
                    <p className="mt-1 text-xs text-slate-400">
                      Valid until{' '}
                      {formatDate(
                        quote.validUntil
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* DETAILS */}

            <div className="grid gap-6 border-b border-slate-200 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8 print:px-12 print:py-8">

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Client
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {quote.client
                    ?.company ||
                    quote.client
                      ?.name ||
                    'No client'}
                </p>

                {quote.client
                  ?.company &&
                  quote.client
                    ?.name && (
                    <p className="mt-1 text-xs text-slate-500">
                      {quote.client.name}
                    </p>
                  )}
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Contact
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {quote.clientContact ||
                    quote.client
                      ?.email ||
                    '—'}
                </p>

                {quote.client
                  ?.phone && (
                  <p className="mt-1 text-xs text-slate-400">
                    {quote.client.phone}
                  </p>
                )}
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Location
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {quote.location ||
                    '—'}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Production
                </p>

                <p className="mt-2 text-sm text-slate-700">
                  {quote.productionDays
                    ? `${quote.productionDays} day${
                        Number(
                          quote.productionDays
                        ) === 1
                          ? ''
                          : 's'
                      }`
                    : '—'}
                </p>
              </div>
            </div>

            {/* ITEMS */}

            <div className="p-6 sm:p-8 print:px-12 print:py-8">

              <div className="mb-5 flex items-center justify-between print:mb-4">
                <div>
                  <p
                    className="text-[10px] font-mono uppercase tracking-[0.25em]"
                    style={{
                      color: PURPLE,
                    }}
                  >
                    Line Items
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Equipment, crew and
                    production expenses
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-600 transition hover:border-slate-300 print:hidden"
                >
                  <Plus className="h-3 w-3" />
                  Add Item
                </button>
              </div>

              {/* DESKTOP TABLE */}

              <div className="hidden overflow-visible md:block">
                <div className="grid grid-cols-[1.2fr_2.5fr_0.7fr_0.9fr_1.2fr_32px] gap-3 border-b border-slate-200 px-3 pb-3">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Category
                  </p>

                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Description
                  </p>

                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Qty
                  </p>

                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Unit
                  </p>

                  <p className="text-right text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Amount
                  </p>

                  <span />
                </div>

                <div className="divide-y divide-slate-100">
                  {(quote.items || []).map(
                    (item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1.2fr_2.5fr_0.7fr_0.9fr_1.2fr_32px] items-center gap-3 py-4"
                      >

                        {/* CATEGORY */}

                        <select
                          value={
                            item.category ||
                            'Other'
                          }
                          onChange={(
                            event
                          ) =>
                            updateItem(
                              item.id,
                              'category',
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-purple-400 print:border-0 print:bg-transparent"
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

                        {/* DESCRIPTION / EQUIPMENT */}

                        <div className="relative">
                          <input
                            value={
                              item.description ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'description',
                                event
                                  .target
                                  .value
                              )
                            }
                            onFocus={() =>
                              setOpenEquipmentId(
                                item.id
                              )
                            }
                            placeholder="Search or enter equipment, crew or expense..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-400 print:border-0 print:bg-transparent"
                          />

                          {openEquipmentId ===
                            item.id && (
                            <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[320px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl print:hidden">
                              <input
                                autoFocus
                                value={
                                  equipmentSearch
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEquipmentSearch(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Search equipment..."
                                className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-purple-400"
                              />

                              <div className="max-h-56 overflow-y-auto">
                                {filteredEquipment.length ===
                                0 ? (
                                  <div className="px-3 py-5 text-center text-xs text-slate-400">
                                    No equipment found
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
                                        onMouseDown={(
                                          event
                                        ) =>
                                          event.preventDefault()
                                        }
                                        onClick={() =>
                                          selectEquipment(
                                            item.id,
                                            equipment
                                          )
                                        }
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
                                      >
                                        <div>
                                          <p className="text-xs font-medium text-slate-800">
                                            {
                                              equipment.name
                                            }
                                          </p>

                                          <p className="mt-0.5 text-[10px] text-slate-400">
                                            {
                                              equipment.category
                                            }{' '}
                                            ·{' '}
                                            {
                                              equipment.unit
                                            }
                                          </p>
                                        </div>

                                        <p className="font-mono text-xs text-slate-600">
                                          {formatAmount(
                                            equipment.rate,
                                            quote.currency
                                          )}
                                        </p>
                                      </button>
                                    )
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* QUANTITY */}

                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity ??
                            1
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
                                ) || 1
                              )
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-400 print:border-0 print:bg-transparent"
                        />

                        {/* UNIT */}

                        <input
                          value={
                            item.unit ||
                            'unit'
                          }
                          onChange={(
                            event
                          ) =>
                            updateItem(
                              item.id,
                              'unit',
                              event.target
                                .value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-400 print:border-0 print:bg-transparent"
                        />

                        {/* AMOUNT */}

                        <div className="text-right">
                          <p className="font-mono text-sm font-medium text-slate-900">
                            {formatAmount(
                              calculateItemAmount(
                                item.quantity,
                                item.rate
                              ),
                              quote.currency
                            )}
                          </p>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.rate ??
                              0
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
                                  ) || 0
                                )
                              )
                            }
                            className="mt-1 w-full border-0 bg-transparent p-0 text-right text-[10px] text-slate-400 outline-none print:hidden"
                          />
                        </div>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-50 hover:text-red-500 print:hidden"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* MOBILE ITEMS */}

              <div className="space-y-4 md:hidden print:hidden">
                {(quote.items || []).map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                            Description
                          </p>

                          <input
                            value={
                              item.description ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'description',
                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Equipment, crew or expense"
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-400"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                            Category
                          </p>

                          <select
                            value={
                              item.category ||
                              'Other'
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'category',
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
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

                        <div>
                          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                            Unit
                          </p>

                          <input
                            value={
                              item.unit ||
                              'day'
                            }
                            onChange={(
                              event
                            ) =>
                              updateItem(
                                item.id,
                                'unit',
                                event.target
                                  .value
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                            Quantity
                          </p>

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity ??
                              1
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
                                  ) || 1
                                )
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                            Rate
                          </p>

                          <input
                            type="number"
                            min="0"
                            value={
                              item.rate ??
                              0
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
                                  ) || 0
                                )
                              )
                            }
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
                          Amount
                        </span>

                        <span className="font-mono text-sm font-medium text-slate-900">
                          {formatAmount(
                            calculateItemAmount(
                              item.quantity,
                              item.rate
                            ),
                            quote.currency
                          )}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* TOTALS */}

            <div className="border-t border-slate-200 p-6 sm:p-8 print:px-12 print:py-8">
              <div className="ml-auto w-full max-w-md space-y-3">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-mono text-sm text-slate-700">
                    {formatAmount(
                      calculatedTotals.subtotal,
                      quote.currency
                    )}
                  </span>
                </div>

                {quote.discountType &&
                  quote.discountType !==
                    'none' && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs text-slate-500">
                        Discount
                      </span>

                      <span className="font-mono text-sm text-red-500">
                        -
                        {formatAmount(
                          calculatedTotals.discountAmount,
                          quote.currency
                        )}
                      </span>
                    </div>
                  )}

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    Tax
                  </span>

                  <span className="font-mono text-sm text-slate-700">
                    {formatAmount(
                      calculatedTotals.tax,
                      quote.currency
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                  <span className="text-sm font-medium text-slate-900">
                    Total
                  </span>

                  <span className="font-mono text-xl font-medium text-slate-950">
                    {formatAmount(
                      calculatedTotals.total,
                      quote.currency
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* TERMS / NOTES */}

            <div className="grid gap-6 border-t border-slate-200 p-6 sm:grid-cols-2 sm:p-8 print:px-12 print:py-8">

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Payment Terms
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {quote.paymentTerms ||
                    '—'}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {quote.notes ||
                    '—'}
                </p>
              </div>
            </div>
          </section>

          {/* EDITING PANEL */}

          <section className="grid gap-6 lg:grid-cols-2 print:hidden">

            {/* GENERAL */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.25em]"
                  style={{
                    color: PURPLE,
                  }}
                >
                  Quote Details
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Edit the quote information
                </p>
              </div>

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Title
                  </label>

                  <input
                    value={
                      quote.title || ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'title',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Project Name
                  </label>

                  <input
                    value={
                      quote.projectName ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'projectName',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                      Quote Number
                    </label>

                    <input
                      value={
                        quote.quoteNumber ||
                        ''
                      }
                      onChange={(
                        event
                      ) =>
                        updateQuoteField(
                          'quoteNumber',
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-mono text-sm outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                      Currency
                    </label>

                    <select
                      value={
                        quote.currency ||
                        'KES'
                      }
                      onChange={(
                        event
                      ) =>
                        updateQuoteField(
                          'currency',
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                    >
                      {currencyOptions.map(
                        (currency) => (
                          <option
                            key={
                              currency.value
                            }
                            value={
                              currency.value
                            }
                          >
                            {
                              currency.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                      Valid Until
                    </label>

                    <input
                      type="date"
                      value={toDateInputValue(
                        quote.validUntil
                      )}
                      onChange={(
                        event
                      ) =>
                        updateQuoteField(
                          'validUntil',
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                      Production Days
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        quote.productionDays ??
                        1
                      }
                      onChange={(
                        event
                      ) =>
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Location
                  </label>

                  <input
                    value={
                      quote.location ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'location',
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Client Contact
                  </label>

                  <input
                    value={
                      quote.clientContact ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'clientContact',
                        event.target.value
                      )
                    }
                    placeholder="Name, email or phone"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            {/* BILLING */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.25em]"
                  style={{
                    color: PURPLE,
                  }}
                >
                  Billing
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Payment and quote settings
                </p>
              </div>

              <div className="space-y-5">

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Payment Terms
                  </label>

                  <textarea
                    rows={4}
                    value={
                      quote.paymentTerms ||
                      ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'paymentTerms',
                        event.target.value
                      )
                    }
                    placeholder="e.g. 50% deposit, balance on completion"
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Discount
                  </label>

                  <div className="grid grid-cols-[1fr_1fr] gap-3">
                    <select
                      value={
                        quote.discountType ||
                        'none'
                      }
                      onChange={(
                        event
                      ) =>
                        updateQuoteField(
                          'discountType',
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                    >
                      <option value="none">
                        No discount
                      </option>

                      <option value="percentage">
                        Percentage
                      </option>

                      <option value="fixed">
                        Fixed amount
                      </option>
                    </select>

                    <input
                      type="number"
                      min="0"
                      value={
                        quote.discountValue ??
                        0
                      }
                      onChange={(
                        event
                      ) =>
                        updateQuoteField(
                          'discountValue',
                          Math.max(
                            0,
                            Number(
                              event.target
                                .value
                            ) || 0
                          )
                        )
                      }
                      disabled={
                        !quote.discountType ||
                        quote.discountType ===
                          'none'
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400 disabled:opacity-40"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Tax
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      quote.tax ?? 0
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'tax',
                        Math.max(
                          0,
                          Number(
                            event.target
                              .value
                          ) || 0
                        )
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Deposit Percentage
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={
                        quote.depositPercentage ??
                        0
                      }
                      onChange={(
                        event
                      ) =>
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm outline-none focus:border-purple-400"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">
                    Notes
                  </label>

                  <textarea
                    rows={5}
                    value={
                      quote.notes || ''
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuoteField(
                        'notes',
                        event.target.value
                      )
                    }
                    placeholder="Additional notes for the client..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* STATUS CONTROLS */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

              <div>
                <p
                  className="text-[10px] font-mono uppercase tracking-[0.25em]"
                  style={{
                    color: PURPLE,
                  }}
                >
                  Quote Status
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Move the quote through the
                  approval workflow.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map(
                  (option) => {
                    const active =
                      quote.status ===
                      option.value;

                    const loadingStatus =
                      actionLoading ===
                      `status-${option.value}`;

                    return (
                      <button
                        key={
                          option.value
                        }
                        type="button"
                        onClick={() =>
                          void updateQuoteStatus(
                            option.value
                          )
                        }
                        disabled={
                          active ||
                          actionLoading !== ''
                        }
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest transition disabled:cursor-not-allowed ${
                          active
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {loadingStatus && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}

                        {!loadingStatus &&
                          active && (
                            <Check className="h-3 w-3" />
                          )}

                        {
                          option.label
                        }
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          {/* BOTTOM ACTIONS */}

          <div className="flex flex-col gap-3 pb-10 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <Link
              href="/admin/quotes"
              className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to quotes
            </Link>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-slate-500"
              >
                <RefreshCw className="h-3 w-3" />
                Reload
              </button>

              <button
                type="button"
                onClick={saveQuote}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white disabled:opacity-50"
                style={{
                  backgroundColor:
                    PURPLE,
                }}
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                Save Quote
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================
          PRINT STYLES
      ====================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: white !important;
          }

          body {
            color: #0f172a !important;
          }

          button,
          input,
          select,
          textarea {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          input,
          select,
          textarea {
            box-shadow: none !important;
          }

          * {
            border-radius: 0 !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}