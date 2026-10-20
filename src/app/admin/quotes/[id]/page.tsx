'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
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
      return 'lue-200 bg-blue-50 text-blue-700';
    case 'invoiced':
      return 'border-primary bg-primary/10 text-primary';
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
      <main className="ui-page ui-page-padded"><div className="ui-shell"><div className="admin-empty-state" role="status"><Loader2 aria-hidden="true" /><p>Loading quote…</p></div></div></main>
    );
  }

  if (!quote) {
    return (
      <main className="ui-page ui-page-padded"><div className="ui-shell"><div className="ui-card admin-empty-state" role="alert"><FileText aria-hidden="true" /><h1>Quote not found</h1><p>{error || 'This quote could not be loaded.'}</p><Button asChild variant="outline"><Link href="/admin/quotes">Back to quotes</Link></Button></div></div></main>
    );
  }

  return (
    <>
      <main className="ui-page ui-page-padded">
        <div className="ui-shell">
          <AdminPageHeader title={quote.title || 'Untitled quote'} description={quote.quoteNumber || `Quote ${quote.id.slice(0, 8).toUpperCase()}`} breadcrumb={{ label: 'Quotes', href: '/admin/quotes' }} />

          {(error || success) && (
            <div className="">
              {error && <div className="">{error}</div>}
              {success && !error && <div className=""><div className=""><Check className="" />{success}</div></div>}
            </div>
          )}

          {invoiceConflict && (
            <section className="">
              <div className="">
                <div>
                  <p className="">An invoice already exists</p>
                  <p className="">{invoiceConflict.existingInvoiceNumber || 'An invoice has already been generated for this quote.'}</p>
                </div>
                <div className="">
                  <Link href={`/admin/invoices/${invoiceConflict.existingInvoiceId}`} className="">View Invoice <ArrowRight className="" /></Link>
                  <button type="button" onClick={() => void createInvoice('update')} disabled={actionLoading === 'invoice'} className="">Update Existing</button>
                  <button type="button" onClick={() => void createInvoice('new')} disabled={actionLoading === 'invoice'} className="">Create New</button>
                  <button type="button" onClick={() => setInvoiceConflict(null)} className="" aria-label="Close"><X className="" /></button>
                </div>
              </div>
            </section>
          )}

          <section className="">
            <div className="">
              <div className="">
                <div>
                  <p className="">QUOTE</p>
                  <h2 className="">{quote.title || 'Untitled quote'}</h2>
                  {quote.projectName && <p className="">{quote.projectName}</p>}
                </div>
                <div className="">
                  <p className="">{quote.quoteNumber || `Q-${quote.id.slice(0, 8).toUpperCase()}`}</p>
                  <p className="">Issued {formatDate(quote.createdAt)}</p>
                  {quote.validUntil && <p className="">Valid until {formatDate(quote.validUntil)}</p>}
                </div>
              </div>
            </div>

            <div className="">
              <div><p className="">Client</p><p className="">{quote.client?.company || quote.client?.name || 'No client'}</p>{quote.client?.company && quote.client?.name && <p className="">{quote.client.name}</p>}</div>
              <div><p className="">Contact</p><p className="">{quote.clientContact || quote.client?.email || '—'}</p>{quote.client?.phone && <p className="">{quote.client.phone}</p>}</div>
              <div><p className="">Location</p><p className="">{quote.location || '—'}</p></div>
              <div><p className="">Production</p><p className="">{quote.productionDays ? `${quote.productionDays} day${numberValue(quote.productionDays) === 1 ? '' : 's'}` : '—'}</p></div>
            </div>

            <div className="">
              <div className="">
                <div><p className="">Line Items</p><p className="">Equipment, crew and production expenses</p></div>
                <button type="button" onClick={addItem} className=""><Plus className="" /> Add Item</button>
              </div>

              <div className="hidden">
                <div className="">
                  <p className="">Category</p><p className="">Description</p><p className="">Qty</p><p className="">Unit</p><p className="">Amount</p><span />
                </div>

                <div className="">
                  {(quote.items || []).map((item) => (
                    <div key={item.id} className="">
                      <select value={item.category || 'Other'} onChange={(event) => changeCategory(item.id, event.target.value)} className="">
                        {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                      </select>

                      <div className="">
                        <input value={item.description || ''} onChange={(event) => updateItem(item.id, 'description', event.target.value)} onFocus={() => { setOpenItemId(item.id); setEquipmentSearch(''); }} placeholder="Search item in selected category..." className="placeholder:text-slate-400" />

                        {openItemId === item.id && (
                          <div className="">
                            <input autoFocus value={equipmentSearch} onChange={(event) => setEquipmentSearch(event.target.value)} placeholder={`Search ${item.category || 'items'}...`} className="" />
                            <div className="">
                              {catalogLoading && <div className=""><Loader2 className="" /> Loading catalog</div>}
                              {!catalogLoading && filteredCatalog.length === 0 && <div className="">No {item.category || ''} items found.</div>}
                              {!catalogLoading && filteredCatalog.map((option) => (
                                <button key={option.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectCatalogItem(item.id, option)} className="">
                                  <div className=""><p className="">{option.name}</p><p className="">{option.source === 'service' ? displayServiceCategory(option.category) : option.category}{option.subcategory ? ` · ${option.subcategory}` : ''}{option.brand ? ` · ${option.brand}` : ''}</p></div>
                                  <p className="">{formatAmount(option.rate, quote.currency)}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <input type="number" min="1" value={item.quantity ?? 1} onChange={(event) => updateItem(item.id, 'quantity', Math.max(1, numberValue(event.target.value) || 1))} className="" />
                      <input value={item.unit || 'unit'} onChange={(event) => updateItem(item.id, 'unit', event.target.value)} className="" />

                      <div className="">
                        <span className="">{quote.currency}</span>
                        <input type="number" min="0" value={Math.round(numberValue(item.amount))} onChange={(event) => updateItem(item.id, 'amount', event.target.value)} className="" />
                      </div>

                      <button type="button" onClick={() => removeItem(item.id)} className="" aria-label="Remove item"><Trash2 className="" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="">
                {(quote.items || []).map((item) => (
                  <div key={item.id} className="">
                    <div className="">
                      <div className="">
                        <label className="block">Category</label>
                        <select value={item.category || 'Other'} onChange={(event) => changeCategory(item.id, event.target.value)} className="">
                          {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
                        </select>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className=""><Trash2 className="" /></button>
                    </div>

                    <div className="">
                      <label className="block">Description</label>
                      <input value={item.description || ''} onChange={(event) => updateItem(item.id, 'description', event.target.value)} onFocus={() => { setOpenItemId(item.id); setEquipmentSearch(''); }} placeholder="Search item in selected category..." className="" />
                      {openItemId === item.id && (
                        <div className="">
                          <input autoFocus value={equipmentSearch} onChange={(event) => setEquipmentSearch(event.target.value)} placeholder={`Search ${item.category || 'items'}...`} className="" />
                          <div className="">
                            {filteredCatalog.map((option) => <button key={option.id} type="button" onClick={() => selectCatalogItem(item.id, option)} className=""><div><p className="">{option.name}</p><p className="">{option.source === 'service' ? displayServiceCategory(option.category) : option.category}</p></div><span className="">{formatAmount(option.rate, quote.currency)}</span></button>)}
                            {!catalogLoading && filteredCatalog.length === 0 && <div className="">No {item.category || ''} items found.</div>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="">
                      <div><label className="block">Qty</label><input type="number" min="1" value={item.quantity ?? 1} onChange={(event) => updateItem(item.id, 'quantity', Math.max(1, numberValue(event.target.value) || 1))} className="" /></div>
                      <div><label className="block">Unit</label><input value={item.unit || 'unit'} onChange={(event) => updateItem(item.id, 'unit', event.target.value)} className="" /></div>
                      <div><label className="block">Amount</label><input type="number" min="0" value={Math.round(numberValue(item.amount))} onChange={(event) => updateItem(item.id, 'amount', event.target.value)} className="" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="">
              <div className="">
                <div className=""><span className="">Subtotal</span><span className="">{formatAmount(totals.subtotal, quote.currency)}</span></div>
                {quote.discountType && quote.discountType !== 'none' && <div className=""><span className="">Discount</span><span className="">-{formatAmount(totals.discount, quote.currency)}</span></div>}
                <div className=""><span className="">Tax</span><span className="">{formatAmount(totals.tax, quote.currency)}</span></div>
                <div className=""><span className="">Total</span><span className="">{formatAmount(totals.total, quote.currency)}</span></div>
              </div>
            </div>

            <div className="">
              <div><p className="">Payment Terms</p><p className="">{quote.paymentTerms || '—'}</p></div>
              <div><p className="">Notes</p><p className="">{quote.notes || '—'}</p></div>
            </div>
          </section>

          <section className="">
            <div className="">
              <div className=""><p className="">Quote Details</p><p className="">Edit the quote information</p></div>
              <div className="">
                <div><label className="block">Title</label><input value={quote.title || ''} onChange={(event) => updateQuoteField('title', event.target.value)} className="" /></div>
                <div><label className="block">Project Name</label><input value={quote.projectName || ''} onChange={(event) => updateQuoteField('projectName', event.target.value)} className="" /></div>
                <div className="">
                  <div><label className="block">Quote Number</label><input value={quote.quoteNumber || ''} onChange={(event) => updateQuoteField('quoteNumber', event.target.value)} className="" /></div>
                  <div><label className="block">Currency</label><select value={quote.currency || 'KES'} onChange={(event) => updateQuoteField('currency', event.target.value)} className="">{currencyOptions.map((currency) => <option key={currency.value} value={currency.value}>{currency.label}</option>)}</select></div>
                </div>
                <div className="">
                  <div><label className="block">Valid Until</label><input type="date" value={toDateInputValue(quote.validUntil)} onChange={(event) => updateQuoteField('validUntil', event.target.value)} className="" /></div>
                  <div><label className="block">Production Days</label><input type="number" min="1" value={quote.productionDays ?? 1} onChange={(event) => updateQuoteField('productionDays', Math.max(1, numberValue(event.target.value) || 1))} className="" /></div>
                </div>
                <div><label className="block">Location</label><input value={quote.location || ''} onChange={(event) => updateQuoteField('location', event.target.value)} className="" /></div>
                <div><label className="block">Client Contact</label><input value={quote.clientContact || ''} onChange={(event) => updateQuoteField('clientContact', event.target.value)} className="" /></div>
              </div>
            </div>

            <div className="">
              <div className=""><p className="">Billing</p><p className="">Payment and quote settings</p></div>
              <div className="">
                <div><label className="block">Payment Terms</label><textarea rows={4} value={quote.paymentTerms || ''} onChange={(event) => updateQuoteField('paymentTerms', event.target.value)} className="" /></div>
                <div><label className="block">Discount</label><div className=""><select value={quote.discountType || 'none'} onChange={(event) => updateQuoteField('discountType', event.target.value)} className=""><option value="none">No discount</option><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option></select><input type="number" min="0" value={quote.discountValue ?? 0} disabled={!quote.discountType || quote.discountType === 'none'} onChange={(event) => updateQuoteField('discountValue', Math.max(0, numberValue(event.target.value)))} className="" /></div></div>
                <div><label className="block">Tax</label><input type="number" min="0" value={quote.tax ?? 0} onChange={(event) => updateQuoteField('tax', Math.max(0, numberValue(event.target.value)))} className="" /></div>
                <div><label className="block">Deposit Percentage</label><div className=""><input type="number" min="0" max="100" value={quote.depositPercentage ?? 0} onChange={(event) => updateQuoteField('depositPercentage', Math.min(100, Math.max(0, numberValue(event.target.value))))} className="" /><span className="">%</span></div></div>
                <div><label className="block">Notes</label><textarea rows={5} value={quote.notes || ''} onChange={(event) => updateQuoteField('notes', event.target.value)} className="" /></div>
              </div>
            </div>
          </section>

          <section className="">
            <div className="">
              <div><p className="">Quote Status</p><p className="">Move the quote through the approval workflow.</p></div>
              <div className="">
                {statusOptions.map((option) => {
                  const active = quote.status === option.value;
                  const loadingStatus = actionLoading === `status-${option.value}`;
                  return <button key={option.value} type="button" onClick={() => void updateStatus(option.value)} disabled={active || actionLoading !== ''} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[10px] font-sans uppercase tracking-widest transition disabled:cursor-not-allowed ${active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{loadingStatus && <Loader2 className="" />}{!loadingStatus && active && <Check className="" />}{option.label}</button>;
                })}
              </div>
            </div>
          </section>

          <div className="">
            <Link href="/admin/quotes" className=""><ArrowLeft className="" /> Back to quotes</Link>
            <div className=""><button type="button" onClick={() => window.location.reload()} className=""><RefreshCw className="" /> Reload</button><button type="button" onClick={saveQuote} disabled={saving} className="">{saving ? <Loader2 className="" /> : <Save className="" />} Save Quote</button></div>
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
