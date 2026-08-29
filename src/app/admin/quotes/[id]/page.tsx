'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react';

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

type CatalogOption = {
  id: string;
  name: string;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
  unit: string;
  rate: number;
  source: 'equipment' | 'service';
};

type ApiObject = Record<string, unknown>;

type InvoiceConflict = {
  existingInvoiceId: string;
  existingInvoiceNumber?: string | null;
};

const PURPLE = '#6D5DFB';

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

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
];

const currencyOptions = [
  { value: 'KES', label: 'KES — Kenya' },
  { value: 'USD', label: 'USD — United States' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
];

function isObject(value: unknown): value is ApiObject {
  return typeof value === 'object' && value !== null;
}

function apiError(value: unknown) {
  return isObject(value) && typeof value.error === 'string'
    ? value.error
    : null;
}

function stringValue(value: unknown, key: string) {
  return isObject(value) && typeof value[key] === 'string'
    ? value[key]
    : null;
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatAmount(
  value: number | string | null | undefined,
  currency: string
) {
  return `${currency} ${numberValue(value).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function calculateItemAmount(item: QuoteItem) {
  return numberValue(item.quantity || 1) * numberValue(item.rate);
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function toDateInputValue(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function formatStatus(value?: string | null) {
  return (value || 'draft')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(value?: string | null) {
  switch ((value || '').toLowerCase()) {
    case 'accepted':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'sent':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'invoiced':
      return 'border-violet-200 bg-violet-50 text-violet-700';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

function normalize(value?: string | null) {
  return (value || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
}

function displayServiceCategory(value?: string | null) {
  const category = normalize(value);
  if (['professional', 'crew', 'professional fees'].includes(category)) return 'Crew';
  if (['camera', 'cameras'].includes(category)) return 'Camera';
  if (['audio', 'audio wireless'].includes(category)) return 'Audio';
  if (category === 'lighting') return 'Lighting';
  if (['grip', 'motion', 'grip motion'].includes(category)) return 'Grip';
  if (['logistics', 'travel', 'travel logistics', 'transport'].includes(category)) return 'Transport';
  if (['postproduction', 'post production', 'editing'].includes(category)) return 'Post Production';
  return value?.trim() || 'Other';
}

function categoryMatches(option: CatalogOption, selectedCategory: string) {
  if (selectedCategory === 'Equipment') return true;

  const wanted = normalize(selectedCategory);
  const values = [
    normalize(option.category),
    normalize(option.subcategory),
    normalize(option.name),
    normalize(option.source === 'service' ? displayServiceCategory(option.category) : ''),
  ];

  if (wanted === 'post production') {
    return values.some((value) => ['post production', 'postproduction', 'editing'].includes(value));
  }

  if (wanted === 'editing') {
    return values.some((value) => ['editing', 'post production', 'postproduction'].includes(value));
  }

  if (wanted === 'crew') {
    return values.some((value) => ['crew', 'professional', 'professional fees'].includes(value));
  }

  if (wanted === 'transport') {
    return values.some((value) => ['transport', 'logistics', 'travel', 'travel logistics'].includes(value));
  }

  return values.includes(wanted);
}

function equipmentFromApi(value: unknown): CatalogOption | null {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    category: typeof value.category === 'string' ? value.category : 'Other',
    subcategory: typeof value.subcategory === 'string' ? value.subcategory : null,
    brand: typeof value.brand === 'string' ? value.brand : null,
    specs: typeof value.specs === 'string' ? value.specs : null,
    unit: 'day',
    rate: Math.max(0, numberValue(value.dailyRate)),
    source: 'equipment',
  };
}

function serviceFromApi(value: unknown): CatalogOption | null {
  if (!isObject(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }

  return {
    id: `service-${value.id}`,
    name: value.name,
    category: typeof value.category === 'string' ? value.category : 'Other',
    subcategory: typeof value.description === 'string' ? value.description : null,
    unit: 'day',
    rate: Math.max(0, numberValue(value.defaultRate)),
    source: 'service',
  };
}

export default function QuoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const quoteId = params?.id;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [catalog, setCatalog] = useState<CatalogOption[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [invoiceConflict, setInvoiceConflict] = useState<InvoiceConflict | null>(null);

  useEffect(() => {
    if (!quoteId) return;
    let cancelled = false;

    async function loadQuote() {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(`/api/quotes/${quoteId}`, { cache: 'no-store' });
        const data: unknown = await response.json().catch(() => null);
        if (!response.ok) throw new Error(apiError(data) || 'Failed to load quote.');
        if (!isObject(data)) throw new Error('Invalid quote response.');
        if (!cancelled) setQuote(data as Quote);
      } catch (err) {
        console.error('Failed to load quote:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load quote.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadQuote();
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        const [equipmentResponse, servicesResponse] = await Promise.all([
          fetch('/api/equipment', { cache: 'no-store' }),
          fetch('/api/services/search', { cache: 'no-store' }),
        ]);

        const equipmentData: unknown = await equipmentResponse.json().catch(() => null);
        const servicesData: unknown = await servicesResponse.json().catch(() => null);

        const equipmentRows = Array.isArray(equipmentData)
          ? equipmentData
          : isObject(equipmentData) && Array.isArray(equipmentData.equipment)
            ? equipmentData.equipment
            : [];

        const serviceRows =
          isObject(servicesData) && Array.isArray(servicesData.services)
            ? servicesData.services
            : [];

        const nextCatalog = [
          ...equipmentRows.map(equipmentFromApi).filter((item): item is CatalogOption => item !== null),
          ...serviceRows.map(serviceFromApi).filter((item): item is CatalogOption => item !== null),
        ];

        if (!cancelled) setCatalog(nextCatalog);
      } catch (err) {
        console.error('Failed to load quote catalog:', err);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateQuoteField(field: keyof Quote, value: unknown) {
    setQuote((current) => (current ? { ...current, [field]: value } : current));
  }

  function updateItem(itemId: string, field: keyof QuoteItem, value: unknown) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        items: (current.items || []).map((item) => {
          if (item.id !== itemId) return item;

          const updated: QuoteItem = { ...item, [field]: value };

          if (field === 'quantity' || field === 'rate') {
            updated.amount = calculateItemAmount(updated);
          }

          if (field === 'amount') {
            updated.amount = Math.max(0, numberValue(value));
            const quantity = Math.max(1, numberValue(updated.quantity) || 1);
            updated.rate = updated.amount / quantity;
          }

          return updated;
        }),
      };
    });
  }

  function changeCategory(itemId: string, category: string) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        items: (current.items || []).map((item) =>
          item.id === itemId
            ? {
                ...item,
                category,
                description: '',
                rate: 0,
                amount: 0,
                unit: category === 'Post Production' || category === 'Editing' ? 'project' : 'day',
              }
            : item
        ),
      };
    });

    setOpenItemId(itemId);
    setEquipmentSearch('');
  }

  function selectCatalogItem(itemId: string, option: CatalogOption) {
    setQuote((current) => {
      if (!current) return current;

      return {
        ...current,
        items: (current.items || []).map((item) => {
          if (item.id !== itemId) return item;

          const quantity = Math.max(1, numberValue(item.quantity) || 1);

          return {
            ...item,
            description: option.name,
            unit: option.unit,
            rate: option.rate,
            amount: option.rate * quantity,
          };
        }),
      };
    });

    setOpenItemId(null);
    setEquipmentSearch('');
  }

  function addItem() {
    setQuote((current) =>
      current
        ? {
            ...current,
            items: [
              ...(current.items || []),
              {
                id: `new-${Date.now()}`,
                category: 'Equipment',
                description: '',
                quantity: 1,
                unit: 'day',
                rate: 0,
                amount: 0,
                notes: null,
              },
            ],
          }
        : current
    );
  }

  function removeItem(itemId: string) {
    setQuote((current) =>
      current
        ? {
            ...current,
            items: (current.items || []).filter((item) => item.id !== itemId),
          }
        : current
    );
  }

  const filteredCatalog = useMemo(() => {
    if (!quote || !openItemId) return [];

    const activeItem = (quote.items || []).find((item) => item.id === openItemId);
    if (!activeItem) return [];

    const query = equipmentSearch.trim().toLowerCase();

    return catalog
      .filter((option) => categoryMatches(option, activeItem.category || 'Equipment'))
      .filter((option) => {
        if (!query) return true;
        return [
          option.name,
          option.category,
          option.subcategory,
          option.brand,
          option.specs,
          option.source === 'service' ? displayServiceCategory(option.category) : '',
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .slice(0, 100);
  }, [catalog, equipmentSearch, openItemId, quote]);

  const totals = useMemo(() => {
    if (!quote) return { subtotal: 0, discount: 0, tax: 0, total: 0 };

    const subtotal = (quote.items || []).reduce(
      (sum, item) => sum + calculateItemAmount(item),
      0
    );

    const discountType = quote.discountType || 'none';
    const discountValue = numberValue(quote.discountValue);

    let discount = 0;
    if (discountType === 'percentage') discount = subtotal * (discountValue / 100);
    if (discountType === 'fixed') discount = discountValue;
    discount = Math.min(subtotal, Math.max(0, discount));

    const tax = Math.max(0, numberValue(quote.tax));

    return {
      subtotal,
      discount,
      tax,
      total: subtotal - discount + tax,
    };
  }, [quote]);

  async function saveQuote() {
    if (!quote) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        title: quote.title,
        projectName: quote.projectName || null,
        quoteNumber: quote.quoteNumber || null,
        currency: quote.currency || 'KES',
        paymentTerms: quote.paymentTerms || null,
        validUntil: quote.validUntil || null,
        productionDays: Math.max(1, numberValue(quote.productionDays) || 1),
        location: quote.location || null,
        clientContact: quote.clientContact || null,
        depositPercentage: Math.min(100, Math.max(0, numberValue(quote.depositPercentage))),
        notes: quote.notes || null,
        discountType: quote.discountType || 'none',
        discountValue: Math.max(0, numberValue(quote.discountValue)),
        tax: Math.max(0, numberValue(quote.tax)),
        clientId: quote.clientId || null,
        items: (quote.items || []).map((item) => ({
          id: item.id.startsWith('new-') ? undefined : item.id,
          category: item.category || 'Other',
          description: item.description || '',
          quantity: Math.max(1, numberValue(item.quantity) || 1),
          unit: item.unit || 'unit',
          rate: Math.max(0, numberValue(item.rate)),
          amount: calculateItemAmount(item),
          notes: item.notes || null,
        })),
      };

      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(apiError(data) || 'Failed to save quote.');

      if (isObject(data)) setQuote(data as Quote);
      setSuccess('Quote saved successfully.');
    } catch (err) {
      console.error('Failed to save quote:', err);
      setError(err instanceof Error ? err.message : 'Unable to save quote.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(nextStatus: string) {
    if (!quote) return;

    try {
      setActionLoading(`status-${nextStatus}`);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(apiError(data) || 'Failed to update quote status.');

      if (isObject(data)) setQuote(data as Quote);
      setSuccess(`Quote marked as ${formatStatus(nextStatus)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update quote status.');
    } finally {
      setActionLoading('');
    }
  }

  async function createInvoice(action?: 'update' | 'new') {
    if (!quote) return;

    try {
      setActionLoading('invoice');
      setError('');
      setInvoiceConflict(null);

      const url = action
        ? `/api/quotes/${quote.id}/invoice?action=${action}`
        : `/api/quotes/${quote.id}/invoice`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        if (
          response.status === 409 &&
          isObject(data) &&
          data.conflict === true &&
          typeof data.existingInvoiceId === 'string'
        ) {
          setInvoiceConflict({
            existingInvoiceId: data.existingInvoiceId,
            existingInvoiceNumber: stringValue(data, 'existingInvoiceNumber'),
          });
          return;
        }

        throw new Error(apiError(data) || 'Failed to generate invoice.');
      }

      let invoiceId: string | null = null;
      if (isObject(data) && typeof data.id === 'string') invoiceId = data.id;
      if (
        !invoiceId &&
        isObject(data) &&
        isObject(data.invoice) &&
        typeof data.invoice.id === 'string'
      ) {
        invoiceId = data.invoice.id;
      }

      if (!invoiceId) throw new Error('Invoice was created but no invoice ID was returned.');
      router.push(`/admin/invoices/${invoiceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate invoice.');
    } finally {
      setActionLoading('');
    }
  }

  function printQuote() {
    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
          <Loader2 className="mx-auto h-7 w-7 animate-spin" style={{ color: PURPLE }} />
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.22em] text-slate-400">Loading quote</p>
        </div>
      </main>
    );
  }

  if (!quote) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
          <FileText className="mx-auto h-8 w-8 text-slate-300" />
          <h1 className="mt-5 text-lg font-medium text-slate-900">Quote not found</h1>
          <p className="mt-2 text-sm text-slate-400">{error || 'This quote could not be loaded.'}</p>
          <Link href="/admin/quotes" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to quotes
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 print:bg-white print:p-0">
        <div className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-0">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between print:hidden">
            <div>
              <Link href="/admin/quotes" className="mb-4 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-slate-900">
                <ArrowLeft className="h-3 w-3" /> Quotes
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: PURPLE }}>Quote</p>
                <span className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-mono uppercase tracking-widest ${getStatusClass(quote.status)}`}>
                  {formatStatus(quote.status)}
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-light tracking-tight text-slate-950 sm:text-4xl">{quote.title || 'Untitled quote'}</h1>
              <p className="mt-2 text-sm text-slate-500">{quote.quoteNumber || `Quote ${quote.id.slice(0, 8).toUpperCase()}`}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={printQuote} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-600 shadow-sm">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button type="button" onClick={saveQuote} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-700 shadow-sm disabled:opacity-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
              </button>
              {quote.status === 'accepted' && (
                <button type="button" onClick={() => void createInvoice()} disabled={actionLoading === 'invoice'} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white shadow-sm disabled:opacity-50" style={{ backgroundColor: PURPLE }}>
                  {actionLoading === 'invoice' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Generate Invoice
                </button>
              )}
            </div>
          </header>

          {(error || success) && (
            <div className="print:hidden">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              {success && !error && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"><div className="flex items-center gap-2"><Check className="h-4 w-4" />{success}</div></div>}
            </div>
          )}

          {invoiceConflict && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 print:hidden">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-900">An invoice already exists</p>
                  <p className="mt-1 text-xs text-amber-700">{invoiceConflict.existingInvoiceNumber || 'An invoice has already been generated for this quote.'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/invoices/${invoiceConflict.existingInvoiceId}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-white">View Invoice <ArrowRight className="h-3.5 w-3.5" /></Link>
                  <button type="button" onClick={() => void createInvoice('update')} disabled={actionLoading === 'invoice'} className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-amber-800">Update Existing</button>
                  <button type="button" onClick={() => void createInvoice('new')} disabled={actionLoading === 'invoice'} className="rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-mono uppercase tracking-widest text-amber-800">Create New</button>
                  <button type="button" onClick={() => setInvoiceConflict(null)} className="rounded-xl px-3 py-2 text-slate-500" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
            <div className="border-b border-slate-200 p-6 sm:p-8 print:px-12 print:py-10">
              <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: PURPLE }}>QUOTE</p>
                  <h2 className="mt-2 text-3xl font-light tracking-tight text-slate-950">{quote.title || 'Untitled quote'}</h2>
                  {quote.projectName && <p className="mt-2 text-sm text-slate-500">{quote.projectName}</p>}
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-mono text-sm font-medium text-slate-900">{quote.quoteNumber || `Q-${quote.id.slice(0, 8).toUpperCase()}`}</p>
                  <p className="mt-2 text-xs text-slate-400">Issued {formatDate(quote.createdAt)}</p>
                  {quote.validUntil && <p className="mt-1 text-xs text-slate-400">Valid until {formatDate(quote.validUntil)}</p>}
                </div>
              </div>
            </div>

            <div className="grid gap-6 border-b border-slate-200 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8 print:px-12 print:py-8">
              <div><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Client</p><p className="mt-2 text-sm font-medium text-slate-900">{quote.client?.company || quote.client?.name || 'No client'}</p>{quote.client?.company && quote.client?.name && <p className="mt-1 text-xs text-slate-500">{quote.client.name}</p>}</div>
              <div><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Contact</p><p className="mt-2 text-sm text-slate-700">{quote.clientContact || quote.client?.email || '—'}</p>{quote.client?.phone && <p className="mt-1 text-xs text-slate-400">{quote.client.phone}</p>}</div>
              <div><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Location</p><p className="mt-2 text-sm text-slate-700">{quote.location || '—'}</p></div>
              <div><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Production</p><p className="mt-2 text-sm text-slate-700">{quote.productionDays ? `${quote.productionDays} day${numberValue(quote.productionDays) === 1 ? '' : 's'}` : '—'}</p></div>
            </div>

            <div className="p-6 sm:p-8 print:px-12 print:py-8">
              <div className="mb-5 flex items-center justify-between">
                <div><p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: PURPLE }}>Line Items</p><p className="mt-1 text-xs text-slate-400">Equipment, crew and production expenses</p></div>
                <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-slate-600 print:hidden"><Plus className="h-3 w-3" /> Add Item</button>
              </div>

              <div className="hidden overflow-visible md:block">
                <div className="grid grid-cols-[1.2fr_2.5fr_0.7fr_0.9fr_1.2fr_32px] gap-3 border-b border-slate-200 px-3 pb-3">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Category</p><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Description</p><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Qty</p><p className="text-[9px] font-mono uppercase tracking-widest text-slate-400">Unit</p><p className="text-right text-[9px] font-mono uppercase tracking-widest text-slate-400">Amount</p><span />
                </div>

                <div className="divide-y divide-slate-100">
                  {(quote.items || []).map((item) => (
                    <div key={item.id} className="grid grid-cols-[1.2fr_2.5fr_0.7fr_0.9fr_1.2fr_32px] items-center gap-3 py-4">
                      <select value={item.category || 'Other'} onChange={(event) => changeCategory(item.id, event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-700 outline-none focus:border-purple-400 print:border-0 print:bg-transparent">
                        {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>

                      <div className="relative">
                        <input value={item.description || ''} onChange={(event) => updateItem(item.id, 'description', event.target.value)} onFocus={() => { setOpenItemId(item.id); setEquipmentSearch(''); }} placeholder="Search item in selected category..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-400 print:border-0 print:bg-transparent" />

                        {openItemId === item.id && (
                          <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[360px] rounded-xl border border-slate-200 bg-white p-2 shadow-xl print:hidden">
                            <input autoFocus value={equipmentSearch} onChange={(event) => setEquipmentSearch(event.target.value)} placeholder={`Search ${item.category || 'items'}...`} className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-purple-400" />
                            <div className="max-h-60 overflow-y-auto">
                              {catalogLoading && <div className="flex items-center justify-center gap-2 px-3 py-5 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading catalog</div>}
                              {!catalogLoading && filteredCatalog.length === 0 && <div className="px-3 py-5 text-center text-xs text-slate-400">No {item.category || ''} items found.</div>}
                              {!catalogLoading && filteredCatalog.map((option) => (
                                <button key={option.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectCatalogItem(item.id, option)} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-slate-50">
                                  <div className="min-w-0"><p className="truncate text-xs font-medium text-slate-800">{option.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{option.source === 'service' ? displayServiceCategory(option.category) : option.category}{option.subcategory ? ` · ${option.subcategory}` : ''}{option.brand ? ` · ${option.brand}` : ''}</p></div>
                                  <p className="ml-3 shrink-0 font-mono text-xs text-slate-600">{formatAmount(option.rate, quote.currency)}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <input type="number" min="1" value={item.quantity ?? 1} onChange={(event) => updateItem(item.id, 'quantity', Math.max(1, numberValue(event.target.value) || 1))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-400 print:border-0 print:bg-transparent" />
                      <input value={item.unit || 'unit'} onChange={(event) => updateItem(item.id, 'unit', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-purple-400 print:border-0 print:bg-transparent" />

                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400">{quote.currency}</span>
                        <input type="number" min="0" value={Math.round(numberValue(item.amount))} onChange={(event) => updateItem(item.id, 'amount', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-12 pr-3 text-right font-mono text-sm font-medium text-slate-900 outline-none focus:border-purple-400 print:border-0 print:bg-transparent" />
                      </div>

                      <button type="button" onClick={() => removeItem(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 print:hidden" aria-label="Remove item"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 md:hidden print:hidden">
                {(quote.items || []).map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Category</label>
                        <select value={item.category || 'Other'} onChange={(event) => changeCategory(item.id, event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none">
                          {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>

                    <div className="relative mt-4">
                      <label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Description</label>
                      <input value={item.description || ''} onChange={(event) => updateItem(item.id, 'description', event.target.value)} onFocus={() => { setOpenItemId(item.id); setEquipmentSearch(''); }} placeholder="Search item in selected category..." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-400" />
                      {openItemId === item.id && (
                        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                          <input autoFocus value={equipmentSearch} onChange={(event) => setEquipmentSearch(event.target.value)} placeholder={`Search ${item.category || 'items'}...`} className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none" />
                          <div className="max-h-52 overflow-y-auto">
                            {filteredCatalog.map((option) => <button key={option.id} type="button" onClick={() => selectCatalogItem(item.id, option)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-50"><div><p className="text-xs font-medium text-slate-800">{option.name}</p><p className="text-[10px] text-slate-400">{option.source === 'service' ? displayServiceCategory(option.category) : option.category}</p></div><span className="font-mono text-xs text-slate-600">{formatAmount(option.rate, quote.currency)}</span></button>)}
                            {!catalogLoading && filteredCatalog.length === 0 && <div className="px-3 py-4 text-center text-xs text-slate-400">No {item.category || ''} items found.</div>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Qty</label><input type="number" min="1" value={item.quantity ?? 1} onChange={(event) => updateItem(item.id, 'quantity', Math.max(1, numberValue(event.target.value) || 1))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" /></div>
                      <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Unit</label><input value={item.unit || 'unit'} onChange={(event) => updateItem(item.id, 'unit', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" /></div>
                      <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Amount</label><input type="number" min="0" value={Math.round(numberValue(item.amount))} onChange={(event) => updateItem(item.id, 'amount', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 p-6 sm:p-8 print:px-12 print:py-8">
              <div className="ml-auto w-full max-w-md space-y-3">
                <div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">Subtotal</span><span className="font-mono text-sm text-slate-700">{formatAmount(totals.subtotal, quote.currency)}</span></div>
                {quote.discountType && quote.discountType !== 'none' && <div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">Discount</span><span className="font-mono text-sm text-red-500">-{formatAmount(totals.discount, quote.currency)}</span></div>}
                <div className="flex items-center justify-between gap-4"><span className="text-xs text-slate-500">Tax</span><span className="font-mono text-sm text-slate-700">{formatAmount(totals.tax, quote.currency)}</span></div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4"><span className="text-sm font-medium text-slate-900">Total</span><span className="font-mono text-xl font-medium text-slate-950">{formatAmount(totals.total, quote.currency)}</span></div>
              </div>
            </div>

            <div className="grid gap-6 border-t border-slate-200 p-6 sm:grid-cols-2 sm:p-8 print:px-12 print:py-8">
              <div><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Payment Terms</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{quote.paymentTerms || '—'}</p></div>
              <div><p className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">Notes</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{quote.notes || '—'}</p></div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6"><p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: PURPLE }}>Quote Details</p><p className="mt-1 text-xs text-slate-400">Edit the quote information</p></div>
              <div className="space-y-5">
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Title</label><input value={quote.title || ''} onChange={(event) => updateQuoteField('title', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Project Name</label><input value={quote.projectName || ''} onChange={(event) => updateQuoteField('projectName', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Quote Number</label><input value={quote.quoteNumber || ''} onChange={(event) => updateQuoteField('quoteNumber', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 font-mono text-sm outline-none focus:border-purple-400" /></div>
                  <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Currency</label><select value={quote.currency || 'KES'} onChange={(event) => updateQuoteField('currency', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400">{currencyOptions.map((currency) => <option key={currency.value} value={currency.value}>{currency.label}</option>)}</select></div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Valid Until</label><input type="date" value={toDateInputValue(quote.validUntil)} onChange={(event) => updateQuoteField('validUntil', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
                  <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Production Days</label><input type="number" min="1" value={quote.productionDays ?? 1} onChange={(event) => updateQuoteField('productionDays', Math.max(1, numberValue(event.target.value) || 1))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
                </div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Location</label><input value={quote.location || ''} onChange={(event) => updateQuoteField('location', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Client Contact</label><input value={quote.clientContact || ''} onChange={(event) => updateQuoteField('clientContact', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6"><p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: PURPLE }}>Billing</p><p className="mt-1 text-xs text-slate-400">Payment and quote settings</p></div>
              <div className="space-y-5">
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Payment Terms</label><textarea rows={4} value={quote.paymentTerms || ''} onChange={(event) => updateQuoteField('paymentTerms', event.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 outline-none focus:border-purple-400" /></div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Discount</label><div className="grid grid-cols-2 gap-3"><select value={quote.discountType || 'none'} onChange={(event) => updateQuoteField('discountType', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400"><option value="none">No discount</option><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select><input type="number" min="0" value={quote.discountValue ?? 0} disabled={!quote.discountType || quote.discountType === 'none'} onChange={(event) => updateQuoteField('discountValue', Math.max(0, numberValue(event.target.value)))} className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400 disabled:opacity-40" /></div></div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Tax</label><input type="number" min="0" value={quote.tax ?? 0} onChange={(event) => updateQuoteField('tax', Math.max(0, numberValue(event.target.value)))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none focus:border-purple-400" /></div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Deposit Percentage</label><div className="relative"><input type="number" min="0" max="100" value={quote.depositPercentage ?? 0} onChange={(event) => updateQuoteField('depositPercentage', Math.min(100, Math.max(0, numberValue(event.target.value))))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-sm outline-none focus:border-purple-400" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span></div></div>
                <div><label className="mb-2 block text-[9px] font-mono uppercase tracking-widest text-slate-400">Notes</label><textarea rows={5} value={quote.notes || ''} onChange={(event) => updateQuoteField('notes', event.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm leading-6 outline-none focus:border-purple-400" /></div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:hidden">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div><p className="text-[10px] font-mono uppercase tracking-[0.25em]" style={{ color: PURPLE }}>Quote Status</p><p className="mt-1 text-xs text-slate-400">Move the quote through the approval workflow.</p></div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => {
                  const active = quote.status === option.value;
                  const loadingStatus = actionLoading === `status-${option.value}`;
                  return <button key={option.value} type="button" onClick={() => void updateStatus(option.value)} disabled={active || actionLoading !== ''} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest transition disabled:cursor-not-allowed ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{loadingStatus && <Loader2 className="h-3 w-3 animate-spin" />}{!loadingStatus && active && <Check className="h-3 w-3" />}{option.label}</button>;
                })}
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-3 pb-10 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <Link href="/admin/quotes" className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 hover:text-slate-900"><ArrowLeft className="h-3 w-3" /> Back to quotes</Link>
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-slate-500"><RefreshCw className="h-3 w-3" /> Reload</button><button type="button" onClick={saveQuote} disabled={saving} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest text-white disabled:opacity-50" style={{ backgroundColor: PURPLE }}>{saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Quote</button></div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: white !important; }
          body { color: #0f172a !important; }
          input, select, textarea { box-shadow: none !important; }
          * { border-radius: 0 !important; }
          .print\\:hidden { display: none !important; }
          .print\\:border-0 { border: 0 !important; }
        }
      `}</style>
    </>
  );
}
