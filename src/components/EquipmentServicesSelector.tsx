'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { SERVICE_CATALOG, ServiceCatalogItem } from '@/lib/serviceCatalog';

export type QuoteLineItem = {
  id: string;
  section: string;
  category: string;
  item: string;
  qty: number;
  days: number;
  rate: number;
  notes: string;
};

interface EquipmentRecord {
  id: string;
  name: string;
  dailyRate: number;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  sectionName: string;
  defaultRate: number;
  defaultUnit: 'day' | 'item' | 'output' | 'set';
  defaultNotes?: string;
}

interface EquipmentServicesSelectorProps {
  onAddItem: (item: QuoteLineItem) => void;
  currency?: string;
}

const categories = [
  { key: 'all', label: 'All Catalog' },
  { key: 'professional', label: 'Crew & Prof Fees' },
  { key: 'camera', label: 'Cameras & Lenses' },
  { key: 'audio', label: 'Audio & Wireless' },
  { key: 'lighting', label: 'Lighting' },
  { key: 'grip', label: 'Grip & Motion' },
  { key: 'drones', label: 'Drones' },
  { key: 'data', label: 'DIT & Storage' },
  { key: 'logistics', label: 'Travel & Logistics' },
  { key: 'postproduction', label: 'Postproduction' },
];

function mapEquipmentCategory(category: string): string {
  switch (category.trim().toLowerCase()) {
    case 'cameras':
    case 'lenses':
      return 'camera';
    case 'sound':
    case 'audio':
      return 'audio';
    case 'lights':
    case 'lighting':
    case 'modifiers':
      return 'lighting';
    case 'drones':
      return 'drones';
    case 'stands':
    case 'focus pulling systems':
    case 'grips & motion':
    case 'photography / video accessories':
      return 'grip';
    default:
      return 'grip';
  }
}

function mapEquipmentSection(category: string): string {
  switch (mapEquipmentCategory(category)) {
    case 'camera':
      return 'Camera Package';
    case 'audio':
      return 'Audio Package';
    case 'lighting':
      return 'Lighting Package';
    case 'drones':
      return 'Drones & Action';
    default:
      return 'Grips & Motion';
  }
}

function toCatalogItem(item: EquipmentRecord): CatalogItem {
  const category = mapEquipmentCategory(item.category);
  const specs = [item.brand, item.specs].filter(Boolean).join(' · ');

  return {
    id: `equipment-${item.id}`,
    name: item.name,
    category,
    sectionName: mapEquipmentSection(item.category),
    defaultRate: Math.max(0, Number(item.dailyRate) || 0),
    defaultUnit: 'day',
    defaultNotes: specs || item.subcategory || undefined,
  };
}

function toServiceCatalogItem(item: ServiceCatalogItem): CatalogItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    sectionName: item.sectionName,
    defaultRate: item.defaultRate,
    defaultUnit: item.defaultUnit,
    defaultNotes: item.defaultNotes,
  };
}

export default function EquipmentServicesSelector({
  onAddItem,
  currency = 'KES',
}: EquipmentServicesSelectorProps) {
  const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(true);
  const [equipmentError, setEquipmentError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('extra');
  const [customSection, setCustomSection] = useState('Extra costs');
  const [customRate, setCustomRate] = useState<number | ''>(5000);
  const [customQty, setCustomQty] = useState(1);
  const [customDays, setCustomDays] = useState(1);
  const [customNotes, setCustomNotes] = useState('');

  const [itemQuantities, setItemQuantities] = useState<
    Record<string, { qty: number; days: number }>
  >({});

  useEffect(() => {
    let cancelled = false;

    async function loadEquipment() {
      try {
        setLoadingEquipment(true);
        setEquipmentError('');

        const response = await fetch('/api/equipment', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to load equipment');
        }

        const data = await response.json();
        const rows: EquipmentRecord[] = Array.isArray(data)
          ? data
          : Array.isArray(data.equipment)
            ? data.equipment
            : [];

        if (!cancelled) {
          setEquipment(rows);
        }
      } catch (error) {
        console.error('Failed to load equipment catalog:', error);

        if (!cancelled) {
          setEquipment([]);
          setEquipmentError(
            'Equipment could not be loaded. Services and custom items remain available.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingEquipment(false);
        }
      }
    }

    loadEquipment();

    return () => {
      cancelled = true;
    };
  }, []);

  const catalog = useMemo<CatalogItem[]>(
    () => [
      ...equipment.map(toCatalogItem),
      ...SERVICE_CATALOG.map(toServiceCatalogItem),
    ],
    [equipment]
  );

  const filteredCatalog = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return catalog.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.sectionName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        Boolean(item.defaultNotes?.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchTerm, selectedCategory]);

  function getItemState(id: string) {
    return itemQuantities[id] ?? { qty: 1, days: 1 };
  }

  function updateItemState(
    id: string,
    patch: Partial<{ qty: number; days: number }>
  ) {
    setItemQuantities((previous) => ({
      ...previous,
      [id]: {
        ...(previous[id] ?? { qty: 1, days: 1 }),
        ...patch,
      },
    }));
  }

  function createLineItem(
    item: Omit<QuoteLineItem, 'qty' | 'days' | 'rate'> & {
      qty: number;
      days: number;
      rate: number;
    }
  ): QuoteLineItem {
    return {
      ...item,
      qty: Math.max(1, item.qty),
      days: Math.max(1, item.days),
      rate: Math.max(0, item.rate),
    };
  }

  function handleAddCatalogItem(item: CatalogItem) {
    const state = getItemState(item.id);

    onAddItem(
      createLineItem({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: item.sectionName,
        category: item.category,
        item: item.name,
        qty: state.qty,
        days: state.days,
        rate: item.defaultRate,
        notes: item.defaultNotes || '',
      })
    );
  }

  function handleAddCustomItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customName.trim() || customRate === '') {
      return;
    }

    onAddItem(
      createLineItem({
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        section: customSection,
        category: customCategory,
        item: customName.trim(),
        qty: customQty,
        days: customDays,
        rate: Number(customRate) || 0,
        notes: customNotes.trim(),
      })
    );

    setCustomName('');
    setCustomNotes('');
    setCustomRate(5000);
    setCustomQty(1);
    setCustomDays(1);
    setShowCustomForm(false);
  }

  function handleSectionChange(section: string) {
    setCustomSection(section);

    if (section.includes('Professional')) setCustomCategory('professional');
    else if (section.includes('Camera')) setCustomCategory('camera');
    else if (section.includes('Audio')) setCustomCategory('audio');
    else if (section.includes('Lighting')) setCustomCategory('lighting');
    else if (section.includes('Data')) setCustomCategory('data');
    else if (section.includes('Travel')) setCustomCategory('logistics');
    else if (section.includes('Postproduction')) setCustomCategory('postproduction');
    else setCustomCategory('extra');
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-zinc-800">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-purple-600" />
            Equipment & Services Catalog
          </h3>
          <p className="font-mono text-xs text-slate-500 dark:text-zinc-400">
            Equipment rates come from the database. Crew, logistics, data, and post services use the service catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomForm((previous) => !previous)}
          className="rounded-full border border-purple-500/50 bg-purple-50 px-3 py-1.5 font-mono text-xs font-semibold uppercase text-purple-700 transition hover:bg-purple-600 hover:text-white dark:bg-purple-950/40 dark:text-purple-300"
        >
          {showCustomForm ? '✕ Close Custom' : '+ Add Custom Gear/Service'}
        </button>
      </div>

      {equipmentError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
          {equipmentError}
        </div>
      )}

      {showCustomForm && (
        <form
          onSubmit={handleAddCustomItem}
          className="space-y-4 rounded-xl border border-purple-200 bg-slate-50 p-4 dark:border-purple-900/50 dark:bg-zinc-950"
        >
          <div className="font-mono text-xs font-bold uppercase text-purple-700 dark:text-purple-400">
            Create Custom Line Item
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-[10px] uppercase text-slate-600 dark:text-zinc-400">
                Item Name / Description *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="e.g. Teleprompter Kit + Operator"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-slate-600 dark:text-zinc-400">
                Target Section *
              </label>
              <select
                value={customSection}
                onChange={(event) => handleSectionChange(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="A. Professional Fees (Core)">A. Professional Fees (Core)</option>
                <option value="Camera Package">Camera Package</option>
                <option value="Audio Package">Audio Package</option>
                <option value="Lighting Package">Lighting Package</option>
                <option value="Grips & Motion">Grips & Motion</option>
                <option value="Drones & Action">Drones & Action</option>
                <option value="Data & Storage">Data & Storage</option>
                <option value="C. Travel & Logistics">C. Travel & Logistics</option>
                <option value="Postproduction (Per output billing)">Postproduction (Per output billing)</option>
                <option value="Extra costs">Extra costs</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-slate-600 dark:text-zinc-400">
                Rate ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                value={customRate}
                onChange={(event) => setCustomRate(event.target.value === '' ? '' : Number(event.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-slate-600 dark:text-zinc-400">Quantity</label>
              <input
                type="number"
                min="1"
                value={customQty}
                onChange={(event) => setCustomQty(Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase text-slate-600 dark:text-zinc-400">Days / Units</label>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(event) => setCustomDays(Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 dark:border-zinc-700 dark:text-zinc-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block font-mono text-[10px] uppercase text-slate-600 dark:text-zinc-400">Notes / Specs</label>
              <input
                type="text"
                value={customNotes}
                onChange={(event) => setCustomNotes(event.target.value)}
                placeholder="e.g. Dual wireless audio & field monitor included"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCustomForm(false)} className="px-3 py-1 text-xs font-mono text-slate-500 hover:text-slate-700 dark:text-zinc-400">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-purple-600 px-4 py-1.5 font-mono text-xs font-semibold uppercase text-white transition hover:bg-purple-700">
              Insert Line Item →
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search equipment or service..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 pl-10 text-xs text-slate-900 outline-none transition focus:border-purple-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">🔍</span>
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-slate-400 hover:text-slate-600">
              Clear
            </button>
          )}
        </div>

        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setSelectedCategory(category.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-mono text-[11px] transition ${
                selectedCategory === category.key
                  ? 'bg-purple-600 font-bold text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-purple-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid max-h-105 grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2 lg:grid-cols-3">
        {loadingEquipment && (
          <div className="col-span-full py-10 text-center text-sm text-slate-500 dark:text-zinc-500">
            Loading equipment catalog…
          </div>
        )}

        {!loadingEquipment && filteredCatalog.map((item) => {
          const state = getItemState(item.id);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition hover:border-purple-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:hover:border-purple-600/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-xs font-semibold text-slate-900 dark:text-zinc-200">{item.name}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400">
                    {currency} {Number(item.defaultRate).toLocaleString()}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">/{item.defaultUnit}</span>
                </div>
                {item.defaultNotes && (
                  <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-500">{item.defaultNotes}</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2 text-xs font-mono dark:border-zinc-800">
                <div className="flex items-center gap-1">
                  <label className="text-[10px] uppercase text-slate-400">Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={state.qty}
                    onChange={(event) => updateItemState(item.id, { qty: Math.max(1, parseInt(event.target.value, 10) || 1) })}
                    className="w-10 rounded border border-slate-300 bg-white px-1 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <label className="ml-1 text-[10px] uppercase text-slate-400">Days:</label>
                  <input
                    type="number"
                    min="1"
                    value={state.days}
                    onChange={(event) => updateItemState(item.id, { days: Math.max(1, parseInt(event.target.value, 10) || 1) })}
                    className="w-10 rounded border border-slate-300 bg-white px-1 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCatalogItem(item)}
                  className="rounded-lg bg-purple-600 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-purple-700"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}

        {!loadingEquipment && filteredCatalog.length === 0 && (
          <div className="col-span-full py-10 text-center">
            <p className="text-sm text-slate-500 dark:text-zinc-500">No catalog items match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
