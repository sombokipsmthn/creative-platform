// src/app/admin/invoices/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import QuotationDocument, {
  QuotationData,
  QuoteLineItem,
  formatCurrency,
} from '@/components/QuotationDocument';
import EquipmentServicesSelector from '@/components/EquipmentServicesSelector';

type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
};

type InvoiceItem = {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  title: string;
  status: string;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  client: Client | null;
  items: InvoiceItem[];
};

// Initial Tech Safari Sample Template matching user's PDF
const DEFAULT_TECH_SAFARI_ITEMS: QuoteLineItem[] = [
  // A. Professional Fees (Core)
  {
    id: 'ts-prof-1',
    section: 'A. Professional Fees (Core)',
    category: 'professional',
    item: 'Photographers',
    qty: 2,
    days: 1,
    rate: 25000,
    notes: 'Photographers professional fee',
  },
  {
    id: 'ts-prof-2',
    section: 'A. Professional Fees (Core)',
    category: 'professional',
    item: 'Videographer (Director & DOP)',
    qty: 1,
    days: 1,
    rate: 45000,
    notes: 'Video DOP',
  },
  {
    id: 'ts-prof-3',
    section: 'A. Professional Fees (Core)',
    category: 'professional',
    item: 'Videographer (AD)',
    qty: 1,
    days: 1,
    rate: 25000,
    notes: 'Podcast Video AD',
  },

  // Camera Package (Podcast Video)
  {
    id: 'ts-cam-pod-1',
    section: 'Camera Package (Podcast Video)',
    category: 'camera',
    item: 'Main Video Cameras (Sony A7sIII )',
    qty: 3,
    days: 1,
    rate: 8000,
    notes: 'Primary camera',
  },
  {
    id: 'ts-cam-pod-2',
    section: 'Camera Package (Podcast Video)',
    category: 'camera',
    item: 'Lenses (16-35mm, 2- 50 mm)',
    qty: 3,
    days: 1,
    rate: 3000,
  },
  {
    id: 'ts-cam-pod-3',
    section: 'Camera Package (Podcast Video)',
    category: 'camera',
    item: 'Tripods (heavy duty)',
    qty: 3,
    days: 1,
    rate: 1000,
    notes: 'Support equipment',
  },

  // Camera Package (Coverage Video)
  {
    id: 'ts-cam-cov-1',
    section: 'Camera Package (Coverage Video)',
    category: 'camera',
    item: 'Main Video Cameras ( Sony A7 IV )',
    qty: 2,
    days: 1,
    rate: 8000,
    notes: 'Primary camera',
  },
  {
    id: 'ts-cam-cov-2',
    section: 'Camera Package (Coverage Video)',
    category: 'camera',
    item: 'Lenses ( 24-70 mm)',
    qty: 2,
    days: 1,
    rate: 3000,
  },
  {
    id: 'ts-cam-cov-3',
    section: 'Camera Package (Coverage Video)',
    category: 'camera',
    item: 'DJI RS5 Pro Gimble',
    qty: 1,
    days: 1,
    rate: 4000,
    notes: 'Support equipment',
  },

  // Camera Package (Photo)
  {
    id: 'ts-cam-photo-1',
    section: 'Camera Package (Photo)',
    category: 'camera',
    item: 'Main Photo Cameras ( Sony A74 )',
    qty: 2,
    days: 1,
    rate: 8000,
    notes: 'Primary camera',
  },
  {
    id: 'ts-cam-photo-2',
    section: 'Camera Package (Photo)',
    category: 'camera',
    item: 'Lenses ( 24-70mm, 70-200 mm)',
    qty: 2,
    days: 1,
    rate: 3000,
  },

  // Audio Package
  {
    id: 'ts-aud-1',
    section: 'Audio Package',
    category: 'audio',
    item: 'Wireless Lavalier Mic (Dual set - DJI/Rode)',
    qty: 1,
    days: 1,
    rate: 2000,
    notes: 'Primary audio',
  },
  {
    id: 'ts-aud-2',
    section: 'Audio Package',
    category: 'audio',
    item: 'Shotgun Mic + Boom',
    qty: 1,
    days: 1,
    rate: 1500,
    notes: 'Backup / environmental capture',
  },
  {
    id: 'ts-aud-3',
    section: 'Audio Package',
    category: 'audio',
    item: 'Audio Recorder (Zoom H5/H6)',
    qty: 1,
    days: 1,
    rate: 1000,
    notes: 'Podcast backup recording',
  },

  // Lighting Package
  {
    id: 'ts-light-1',
    section: 'Lighting Package',
    category: 'lighting',
    item: 'Amaran 400D (bicolor)',
    qty: 4,
    days: 1,
    rate: 4000,
    notes: 'Portable lighting',
  },
  {
    id: 'ts-light-2',
    section: 'Lighting Package',
    category: 'lighting',
    item: 'Godox V1 Speedlights',
    qty: 1,
    days: 1,
    rate: 3000,
    notes: 'Flash Lighting',
  },
  {
    id: 'ts-light-3',
    section: 'Lighting Package',
    category: 'lighting',
    item: 'Light stands & modifiers',
    qty: 2,
    days: 1,
    rate: 500,
    notes: '',
  },

  // Data & Storage
  {
    id: 'ts-data-1',
    section: 'Data & Storage',
    category: 'data',
    item: 'HDD Drives(1 TB) + backup storage',
    qty: 1,
    days: 1,
    rate: 13000,
    notes: 'Primary and backup media',
  },
  {
    id: 'ts-data-2',
    section: 'Data & Storage',
    category: 'data',
    item: 'DIT',
    qty: 1,
    days: 1,
    rate: 500,
    notes: 'Offload, verification, backup handling',
  },

  // C. Travel & Logistics
  {
    id: 'ts-log-1',
    section: 'C. Travel & Logistics',
    category: 'logistics',
    item: 'Ground + Equipment transport',
    qty: 1,
    days: 1,
    rate: 2000,
    notes: 'Fuel, taxis, local movement',
  },

  // Postproduction
  {
    id: 'ts-post-1',
    section: 'Postproduction (Per output billing)',
    category: 'postproduction',
    item: 'Photo Postproduction',
    qty: 1,
    days: 1,
    rate: 10000,
    notes: 'Batch Processing (Same day Delivery)',
  },
  {
    id: 'ts-post-2',
    section: 'Postproduction (Per output billing)',
    category: 'postproduction',
    item: 'Video Postproduction',
    qty: 7,
    days: 1,
    rate: 7000,
    notes: 'Event Coverage + Highlight video + Podcast Output',
  },
];

export default function InvoicesAndQuotesPage() {
  const [activeTab, setActiveTab] = useState<'quote' | 'ledger'>('quote');
  const [viewMode, setViewMode] = useState<'builder' | 'preview'>('builder');

  // Quotation State
  const [quoteNumber, setQuoteNumber] = useState('QUO-2026-001');
  const [quoteDate, setQuoteDate] = useState('August 17, 2026');
  const [clientName, setClientName] = useState('Tech Safari');
  const [clientCompany, setClientCompany] = useState('Tech Safari Summit');
  const [clientLocation, setClientLocation] = useState('Nairobi, Kenya');
  const [projectFor, setProjectFor] = useState('Production Services');
  const [currency, setCurrency] = useState('KES');
  const [vatRate, setVatRate] = useState<number>(0);
  const [quoteItems, setQuoteItems] = useState<QuoteLineItem[]>(DEFAULT_TECH_SAFARI_ITEMS);

  // Invoices Ledger State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  // Initial Data Fetching
  useEffect(() => {
    let active = true;
    async function fetchData() {
      try {
        const [invoiceResponse, clientResponse] = await Promise.all([
          fetch('/api/invoices', { cache: 'no-store' }),
          fetch('/api/clients', { cache: 'no-store' }),
        ]);

        if (active && invoiceResponse.ok) {
          const invoiceData = await invoiceResponse.json();
          setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
        }

        if (active && clientResponse.ok) {
          const clientData = await clientResponse.json();
          if (Array.isArray(clientData)) {
            setClients(clientData);
          } else if (Array.isArray(clientData.clients)) {
            setClients(clientData.clients);
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError('Could not load data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  // Calculate Subtotals & Totals
  const calculatedTotal = useMemo(() => {
    const subtotal = quoteItems.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.days || 1) * (item.rate || 0),
      0
    );
    const vatAmount = (subtotal * vatRate) / 100;
    return {
      subtotal,
      vatAmount,
      grandTotal: subtotal + vatAmount,
    };
  }, [quoteItems, vatRate]);

  // Quote Item Handlers
  const handleAddLineItem = (newItem: QuoteLineItem) => {
    setQuoteItems((prev) => [...prev, newItem]);
    setSaveSuccess('Item added to quotation!');
    setTimeout(() => setSaveSuccess(''), 2500);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof QuoteLineItem,
    value: string | number
  ) => {
    setQuoteItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadTechSafariTemplate = () => {
    setClientName('Tech Safari');
    setClientCompany('Tech Safari Summit');
    setClientLocation('Nairobi, Kenya');
    setProjectFor('Production Services');
    setCurrency('KES');
    setVatRate(0);
    setQuoteDate('August 17, 2026');
    setQuoteItems(DEFAULT_TECH_SAFARI_ITEMS);
    setSaveSuccess('Loaded Tech Safari Quote Template!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleClearQuote = () => {
    setQuoteItems([]);
    setClientName('');
    setClientCompany('');
    setClientLocation('');
    setProjectFor('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsInvoice = async () => {
    if (!clientName.trim()) {
      setError('Please provide a client name.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Find or assign clientId
      let selectedClientId = clients.find(
        (c) => c.name.toLowerCase() === clientName.toLowerCase()
      )?.id;

      if (!selectedClientId && clients.length > 0) {
        selectedClientId = clients[0].id;
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId || 'client_01',
          invoiceNumber: quoteNumber,
          title: `${projectFor || 'Production Services'} Quotation`,
          status: 'sent',
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: null,
          currency,
          tax: Math.round(calculatedTotal.vatAmount * 100),
          notes: 'Quotation generated via Equipment & Services Catalog',
          items: quoteItems.map((item) => ({
            description: `${item.section} - ${item.item}${item.notes ? ` (${item.notes})` : ''}`,
            quantity: (item.qty || 1) * (item.days || 1),
            unitPrice: Math.round((item.rate || 0) * 100),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save quotation to database.');
      }

      setSaveSuccess('Quotation successfully saved to Invoices Ledger!');
      setTimeout(() => setSaveSuccess(''), 4000);

      // Refresh invoices
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error saving quote.');
    } finally {
      setSaving(false);
    }
  };

  const quotationData: QuotationData = {
    quoteNumber,
    date: quoteDate,
    clientName,
    clientCompany,
    clientLocation,
    projectFor,
    currency,
    vatRate,
    items: quoteItems,
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans transition-colors duration-300 pb-20">
      
      {/* Top Controls Header (Hidden on Print) */}
      <div className="print:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 sticky top-16 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-[#6B21A8] font-mono">✦</span> Quotation & Invoice Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-mono font-bold">
                Somboriot Kipchilat Spec
              </span>
            </div>
            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 mt-0.5">
              Select or search equipment, camera packages, audio, lighting & crew rates to generate structured PDF quotations.
            </p>
          </div>

          {/* Navigation & Action Switchers */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded-full border border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab('quote')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase transition ${
                  activeTab === 'quote'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600'
                }`}
              >
                Quotation Generator
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase transition ${
                  activeTab === 'ledger'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600'
                }`}
              >
                Invoices Ledger ({invoices.length})
              </button>
            </div>

            {activeTab === 'quote' && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-mono font-semibold uppercase hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
                >
                  <span>🖨 Print / Export PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsInvoice}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-xs font-mono font-semibold uppercase hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save to Invoices'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts (Hidden on Print) */}
      <div className="max-w-7xl mx-auto px-6 pt-4 print:hidden">
        {saveSuccess && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs font-mono text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
            <span>✓ {saveSuccess}</span>
            <button onClick={() => setSaveSuccess('')} className="text-sm">✕</button>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-xs font-mono text-rose-700 dark:text-rose-300 flex items-center justify-between">
            <span>⚠ {error}</span>
            <button onClick={() => setError('')} className="text-sm">✕</button>
          </div>
        )}
      </div>

      {/* TAB 1: Quotation Generator & Equipment Selector */}
      {activeTab === 'quote' && (
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
          
          {/* View Mode Toggle (Builder vs Exact PDF Preview) */}
          <div className="print:hidden flex items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-zinc-400">
                Mode:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('builder')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-semibold transition ${
                    viewMode === 'builder'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600'
                  }`}
                >
                  ✎ Equipment Selector & Builder
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-semibold transition ${
                    viewMode === 'preview'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-purple-600'
                  }`}
                >
                  👁 PDF Quotation Layout Preview
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLoadTechSafariTemplate}
                className="px-3 py-1 rounded-lg border border-purple-300 dark:border-purple-800/80 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-mono uppercase transition"
              >
                ⟳ Reset to Tech Safari Template
              </button>
              <button
                type="button"
                onClick={handleClearQuote}
                className="px-3 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-rose-600 text-xs font-mono uppercase transition"
              >
                Clear Items
              </button>
            </div>
          </div>

          {/* BUILDER VIEW (Search gear + Edit meta + Manage Line Items) */}
          {viewMode === 'builder' && (
            <div className="print:hidden space-y-8">
              
              {/* 1. Client & Quotation Metadata Form */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 font-mono mb-4 flex items-center gap-2">
                  <span>1.</span> Client & Quotation Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Client Contact / Org *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Tech Safari"
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Company / Event
                    </label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Tech Safari Summit"
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Location
                    </label>
                    <input
                      type="text"
                      value={clientLocation}
                      onChange={(e) => setClientLocation(e.target.value)}
                      placeholder="e.g. Nairobi, Kenya"
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      FOR (Project Type)
                    </label>
                    <input
                      type="text"
                      value={projectFor}
                      onChange={(e) => setProjectFor(e.target.value)}
                      placeholder="e.g. Production Services"
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Quotation / Doc #
                    </label>
                    <input
                      type="text"
                      value={quoteNumber}
                      onChange={(e) => setQuoteNumber(e.target.value)}
                      placeholder="QUO-2026-001"
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Quotation Date
                    </label>
                    <input
                      type="text"
                      value={quoteDate}
                      onChange={(e) => setQuoteDate(e.target.value)}
                      placeholder="August 17, 2026"
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    >
                      <option value="KES">KES (Kenyan Shillings)</option>
                      <option value="USD">USD ($ - US Dollars)</option>
                      <option value="EUR">EUR (€ - Euros)</option>
                      <option value="GBP">GBP (£ - Pounds)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      VAT %
                    </label>
                    <select
                      value={vatRate}
                      onChange={(e) => setVatRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-3 py-2 text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                    >
                      <option value={0}>0% (Excl. VAT / Standard)</option>
                      <option value={16}>16% VAT</option>
                      <option value={18}>18% VAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-zinc-400 uppercase text-[10px] mb-1 font-bold">
                      Grand Total Calculated
                    </label>
                    <div className="w-full rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 px-3 py-2 text-purple-700 dark:text-purple-300 font-bold text-sm">
                      {currency} {formatCurrency(calculatedTotal.grandTotal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Equipment & Services Search Selector */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 font-mono mb-3 flex items-center gap-2">
                  <span>2.</span> Search & Select Equipment or Services
                </h3>
                <EquipmentServicesSelector
                  onAddItem={handleAddLineItem}
                  currency={currency}
                />
              </div>

              {/* 3. Active Line Items Table Editor */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 font-mono flex items-center gap-2">
                      <span>3.</span> Quotation Items Ledger ({quoteItems.length} items)
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Live line items categorized in the quotation. Adjust quantities, days, rates or delete rows directly.
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                    Subtotal: {currency} {formatCurrency(calculatedTotal.subtotal)}
                  </span>
                </div>

                {quoteItems.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-slate-400">
                    No items in quote yet. Use the catalog above to add gear and services.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 uppercase text-[10px]">
                          <th className="px-3 py-2 text-left">Section & Item Name</th>
                          <th className="px-2 py-2 text-center w-16">Qty</th>
                          <th className="px-2 py-2 text-center w-16">Days</th>
                          <th className="px-3 py-2 text-right w-28">Rate ({currency})</th>
                          <th className="px-3 py-2 text-right w-28">Total ({currency})</th>
                          <th className="px-3 py-2 text-left">Notes</th>
                          <th className="px-2 py-2 text-center w-10">✕</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                        {quoteItems.map((item) => {
                          const rowTotal = (item.qty || 0) * (item.days || 1) * (item.rate || 0);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                              <td className="px-3 py-2">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {item.item}
                                </div>
                                <div className="text-[10px] text-purple-600 dark:text-purple-400">
                                  {item.section}
                                </div>
                              </td>
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.qty}
                                  onChange={(e) => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                                  className="w-12 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1 py-1 text-center"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.days}
                                  onChange={(e) => handleUpdateItem(item.id, 'days', parseInt(e.target.value) || 1)}
                                  className="w-12 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-1 py-1 text-center"
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-24 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1 text-right"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-slate-900 dark:text-white">
                                {formatCurrency(rowTotal)}
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={item.notes || ''}
                                  onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                                  placeholder="Notes..."
                                  className="w-full rounded border border-slate-200 dark:border-zinc-700 bg-transparent px-2 py-1 text-[11px]"
                                />
                              </td>
                              <td className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-slate-400 hover:text-rose-600 text-sm font-bold"
                                  title="Remove Item"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF DOCUMENT LAYOUT VIEW (Renders exact visual PDF from the screenshot) */}
          <div className={`${viewMode === 'preview' ? 'block' : 'print:block'} pt-2`}>
            <div className="print:hidden mb-4 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                Exact Print / PDF Quotation Document Representation:
              </span>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-semibold uppercase transition shadow-md flex items-center gap-1.5"
              >
                <span>🖨 Print or Save as PDF</span>
              </button>
            </div>

            {/* The Document Component */}
            <QuotationDocument data={quotationData} />
          </div>
        </div>
      )}

      {/* TAB 2: Invoices Ledger (Saved Invoices) */}
      {activeTab === 'ledger' && (
        <div className="max-w-7xl mx-auto px-6 py-6 print:hidden">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm backdrop-blur-sm">
            <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Commercial Invoices & Quotes Ledger
                </h3>
                <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                  All generated client invoices, delivery milestones, and payment receipts.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('quote');
                  setViewMode('builder');
                }}
                className="rounded-full bg-purple-600 px-4 py-2 text-xs font-mono uppercase font-semibold text-white hover:bg-purple-700 transition"
              >
                + New Quotation
              </button>
            </div>

            {loading ? (
              <div className="p-16 text-center text-xs font-mono text-slate-500">
                Loading invoices ledger...
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 text-xl font-mono flex items-center justify-center">
                  $
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  No invoices logged yet
                </h4>
                <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                  Build and save a quote from the Quotation Generator tab to log your first commercial record.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-xs font-sans">
                  <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80">
                    <tr className="text-left font-mono uppercase text-[11px] text-slate-500 dark:text-zinc-400">
                      <th className="px-6 py-3.5">Invoice / Quote #</th>
                      <th className="px-6 py-3.5">Client</th>
                      <th className="px-6 py-3.5">Issue Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20">
                        <td className="px-6 py-4">
                          <div className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                            {inv.invoiceNumber}
                          </div>
                          <div className="text-[11px] text-slate-500">{inv.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-zinc-200">
                            {inv.client?.name || 'Client Partner'}
                          </div>
                          {inv.client?.company && (
                            <div className="text-[10px] font-mono text-slate-400">
                              {inv.client.company}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-600 dark:text-zinc-400">
                          {inv.issueDate}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                          {inv.currency} {formatCurrency(inv.total / 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Print Stylesheet for 1:1 Clean PDF Generation */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, nav, .print\\:hidden {
            display: none !important;
          }
          .quotation-print-container {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 15mm 15mm;
          }
        }
      `}</style>
    </main>
  );
}
