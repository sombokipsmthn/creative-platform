// src/components/EquipmentServicesSelector.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { QUOTATION_CATALOG, CatalogItem } from '@/lib/quotationCatalog';
import { QuoteLineItem } from './QuotationDocument';

interface EquipmentServicesSelectorProps {
  onAddItem: (item: QuoteLineItem) => void;
  currency?: string;
}

export default function EquipmentServicesSelector({
  onAddItem,
  currency = 'KES',
}: EquipmentServicesSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Custom Item Form State
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<CatalogItem['category']>('camera');
  const [customSection, setCustomSection] = useState('Camera Package (Coverage Video)');
  const [customRate, setCustomRate] = useState<number | ''>(5000);
  const [customQty, setCustomQty] = useState(1);
  const [customDays, setCustomDays] = useState(1);
  const [customNotes, setCustomNotes] = useState('');

  // Quick quantities for catalog items
  const [itemQuantities, setItemQuantities] = useState<Record<string, { qty: number; days: number }>>({});

  const categories = [
    { key: 'all', label: 'All Catalog' },
    { key: 'professional', label: 'Crew & Prof Fees' },
    { key: 'camera', label: 'Cameras & Lenses' },
    { key: 'audio', label: 'Audio & Wireless' },
    { key: 'lighting', label: 'Lighting & Grip' },
    { key: 'data', label: 'DIT & Storage' },
    { key: 'logistics', label: 'Travel & Logistics' },
    { key: 'postproduction', label: 'Postproduction' },
  ];

  const filteredCatalog = useMemo(() => {
    return QUOTATION_CATALOG.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sectionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.defaultNotes && item.defaultNotes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ? true : item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  const getItemState = (id: string) => {
    return itemQuantities[id] || { qty: 1, days: 1 };
  };

  const updateItemQty = (id: string, qty: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { qty: 1, days: 1 }), qty: Math.max(1, qty) },
    }));
  };

  const updateItemDays = (id: string, days: number) => {
    setItemQuantities((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { qty: 1, days: 1 }), days: Math.max(1, days) },
    }));
  };

  const handleAddCatalogItem = (catalogItem: CatalogItem) => {
    const { qty, days } = getItemState(catalogItem.id);
    const lineItem: QuoteLineItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      section: catalogItem.sectionName,
      category: catalogItem.category,
      item: catalogItem.name,
      qty,
      days,
      rate: catalogItem.defaultRate,
      notes: catalogItem.defaultNotes || '',
    };
    onAddItem(lineItem);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || customRate === '') return;

    const lineItem: QuoteLineItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      section: customSection,
      category: customCategory,
      item: customName.trim(),
      qty: customQty,
      days: customDays,
      rate: Number(customRate),
      notes: customNotes.trim(),
    };
    onAddItem(lineItem);

    // Reset custom form
    setCustomName('');
    setCustomNotes('');
    setShowCustomForm(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
            Equipment & Services Catalog
          </h3>
          <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
            Search camera rigs, lighting, audio gear, crew rates, and post services to insert into the quotation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="text-xs font-mono uppercase font-semibold px-3 py-1.5 rounded-full border border-purple-500/50 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white transition"
        >
          {showCustomForm ? '✕ Close Custom' : '+ Add Custom Gear/Service'}
        </button>
      </div>

      {/* Custom Item Form Modal/Collapsible */}
      {showCustomForm && (
        <form
          onSubmit={handleAddCustomItem}
          className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 space-y-4"
        >
          <div className="text-xs font-bold font-mono text-purple-700 dark:text-purple-400 uppercase">
            Create Custom Line Item
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                Item Name / Description *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Teleprompter Kit + Operator"
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                Target Section *
              </label>
              <select
                value={customSection}
                onChange={(e) => {
                  setCustomSection(e.target.value);
                  if (e.target.value.includes('Professional')) setCustomCategory('professional');
                  else if (e.target.value.includes('Camera')) setCustomCategory('camera');
                  else if (e.target.value.includes('Audio')) setCustomCategory('audio');
                  else if (e.target.value.includes('Lighting')) setCustomCategory('lighting');
                  else if (e.target.value.includes('Data')) setCustomCategory('data');
                  else if (e.target.value.includes('Travel')) setCustomCategory('logistics');
                  else if (e.target.value.includes('Postproduction')) setCustomCategory('postproduction');
                  else setCustomCategory('extra');
                }}
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
              >
                <option value="A. Professional Fees (Core)">A. Professional Fees (Core)</option>
                <option value="Camera Package (Podcast Video)">Camera Package (Podcast Video)</option>
                <option value="Camera Package (Coverage Video)">Camera Package (Coverage Video)</option>
                <option value="Camera Package (Photo)">Camera Package (Photo)</option>
                <option value="Audio Package">Audio Package</option>
                <option value="Lighting Package">Lighting Package</option>
                <option value="Data & Storage">Data & Storage</option>
                <option value="Extra costs">Extra costs</option>
                <option value="C. Travel & Logistics">C. Travel & Logistics</option>
                <option value="Postproduction (Per output billing)">Postproduction (Per output)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                Rate ({currency}) *
              </label>
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={customQty}
                onChange={(e) => setCustomQty(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                Days / Units
              </label>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(e) => setCustomDays(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-zinc-400 mb-1 font-mono uppercase text-[10px]">
                Notes / Specs (Optional)
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Dual wireless audio & field monitor included"
                className="w-full rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-3 py-1 text-xs font-mono text-slate-500 hover:text-slate-700 dark:text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs uppercase font-semibold transition"
            >
              Insert Line Item →
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equipment or service (e.g. Sony A7sIII, Amaran, Lavalier, DOP, DIT, Color Grading...)"
            className="w-full rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 px-4 py-2.5 pl-10 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-purple-500 transition"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            🔍
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap transition ${
                selectedCategory === cat.key
                  ? 'bg-purple-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-purple-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
        {filteredCatalog.map((item) => {
          const state = getItemState(item.id);
          return (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 hover:border-purple-400 dark:hover:border-purple-600/60 transition flex flex-col justify-between gap-2.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-zinc-200 line-clamp-1">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {currency} {item.defaultRate.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">/{item.defaultUnit}</span>
                </div>
                {item.defaultNotes && (
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 line-clamp-1 mt-1">
                    {item.defaultNotes}
                  </p>
                )}
              </div>

              {/* Action row with Qty & Days selectors */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-1">
                  <label className="text-[10px] text-slate-400 uppercase">Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={state.qty}
                    onChange={(e) => updateItemQty(item.id, parseInt(e.target.value) || 1)}
                    className="w-10 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1 py-0.5 text-center text-xs"
                  />
                  <label className="text-[10px] text-slate-400 uppercase ml-1">Days:</label>
                  <input
                    type="number"
                    min="1"
                    value={state.days}
                    onChange={(e) => updateItemDays(item.id, parseInt(e.target.value) || 1)}
                    className="w-10 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1 py-0.5 text-center text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCatalogItem(item)}
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono text-[11px] font-semibold uppercase tracking-wider transition shadow-sm"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
