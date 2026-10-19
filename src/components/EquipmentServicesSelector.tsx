'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { SERVICE_CATALOG, ServiceCatalogItem, type ServiceCategory } from '@/lib/serviceCatalog';
import { toCatalogItem, toServiceCatalogItem } from '@/lib/catalog';

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

interface ServiceResponse {
  id: string;
  name: string;
  category?: string | null;
  defaultRate: number;
  description?: string | null;
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


export default function EquipmentServicesSelector({
  onAddItem,
  currency = 'KES',
}: EquipmentServicesSelectorProps) {
  const [equipment, setEquipment] = useState<EquipmentRecord[]>([]);
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [equipmentError, setEquipmentError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

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

    async function loadCatalog() {
      try {
        setLoadingEquipment(true);
        setEquipmentError('');

        const [equipmentRes, servicesRes] = await Promise.all([
          fetch(`/api/equipment/search?q=${encodeURIComponent(debouncedSearch)}`),
          fetch(`/api/services/search?q=${encodeURIComponent(debouncedSearch)}`)
        ]);

        if (!equipmentRes.ok || !servicesRes.ok) {
          throw new Error('Failed to load catalog');
        }

        const equipmentData = await equipmentRes.json();
        const servicesData = await servicesRes.json() as { services?: ServiceResponse[] };

        const eqRows: EquipmentRecord[] = equipmentData.equipment || [];
        // Map creatorServices to ServiceCatalogItem format
        const svRows: ServiceCatalogItem[] = (servicesData.services || []).map((s) => ({
          id: `service-${s.id}`,
          name: s.name,
          category: (['professional', 'data', 'logistics', 'postproduction', 'extra'] as ServiceCategory[]).includes(s.category as ServiceCategory)
            ? s.category as ServiceCategory
            : 'professional',
          sectionName: s.category === 'professional' ? 'Professional Fees' : 'Services',
          defaultRate: s.defaultRate,
          defaultUnit: 'day',
          defaultNotes: s.description || undefined
        }));

        if (!cancelled) {
          setEquipment(eqRows);
          setServices(svRows);
        }
      } catch (error) {
        console.error('Failed to load catalog:', error);
        if (!cancelled) {
          setEquipmentError('Catalog could not be loaded. Custom items remain available.');
        }
      } finally {
        if (!cancelled) {
          setLoadingEquipment(false);
        }
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const catalog = useMemo<CatalogItem[]>(
    () => [
      ...equipment.map(toCatalogItem),
      ...services.map(toServiceCatalogItem),
      ...SERVICE_CATALOG.map(toServiceCatalogItem) // Append hardcoded ones as fallback
    ],
    [equipment, services]
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
    <div className="">
      <div className="">
        <div>
          <h3 className="">
            <span className="inline-block" />
            Equipment & Services Catalog
          </h3>
          <p className="">
            Equipment rates come from the database. Crew, logistics, data, and post services use the service catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCustomForm((previous) => !previous)}
          className=""
        >
          {showCustomForm ? '✕ Close Custom' : '+ Add Custom Gear/Service'}
        </button>
      </div>

      {equipmentError && (
        <div className="">
          {equipmentError}
        </div>
      )}

      {showCustomForm && (
        <form
          onSubmit={handleAddCustomItem}
          className=""
        >
          <div className="">
            Create Custom Line Item
          </div>

          <div className="">
            <div className="">
              <label className="block">
                Item Name / Description *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
                placeholder="e.g. Teleprompter Kit + Operator"
                className=""
                required
              />
            </div>

            <div>
              <label className="block">
                Target Section *
              </label>
              <select
                value={customSection}
                onChange={(event) => handleSectionChange(event.target.value)}
                className=""
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
              <label className="block">
                Rate ({currency}) *
              </label>
              <input
                type="number"
                min="0"
                value={customRate}
                onChange={(event) => setCustomRate(event.target.value === '' ? '' : Number(event.target.value))}
                className=""
                required
              />
            </div>

            <div>
              <label className="block">Quantity</label>
              <input
                type="number"
                min="1"
                value={customQty}
                onChange={(event) => setCustomQty(Math.max(1, Number(event.target.value) || 1))}
                className=""
              />
            </div>

            <div>
              <label className="block">Days / Units</label>
              <input
                type="number"
                min="1"
                value={customDays}
                onChange={(event) => setCustomDays(Math.max(1, Number(event.target.value) || 1))}
                className=""
              />
            </div>

            <div className="">
              <label className="block">Notes / Specs</label>
              <input
                type="text"
                value={customNotes}
                onChange={(event) => setCustomNotes(event.target.value)}
                placeholder="e.g. Dual wireless audio & field monitor included"
                className=""
              />
            </div>
          </div>

          <div className="">
            <button type="button" onClick={() => setShowCustomForm(false)} className="">
              Cancel
            </button>
            <button type="submit" className="">
              Insert Line Item →
            </button>
          </div>
        </form>
      )}

      <div className="">
        <div className="">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search equipment or service..."
            className=""
          />
          <span className="">🔍</span>
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className="">
              Clear
            </button>
          )}
        </div>

        <div className="no-scrollbar">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setSelectedCategory(category.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-sans text-[11px] transition ${
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

      <div className="">
        {loadingEquipment && (
          <div className="">
            Loading equipment catalog…
          </div>
        )}

        {!loadingEquipment && filteredCatalog.map((item) => {
          const state = getItemState(item.id);

          return (
            <div
              key={item.id}
              className=""
            >
              <div>
                <div className="">
                  <span className="">{item.name}</span>
                </div>
                <div className="">
                  <span className="">
                    {currency} {Number(item.defaultRate).toLocaleString()}
                  </span>
                  <span className="">/{item.defaultUnit}</span>
                </div>
                {item.defaultNotes && (
                  <p className="">{item.defaultNotes}</p>
                )}
              </div>

              <div className="">
                <div className="">
                  <label className="">Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={state.qty}
                    onChange={(event) => updateItemState(item.id, { qty: Math.max(1, parseInt(event.target.value, 10) || 1) })}
                    className=""
                  />
                  <label className="">Days:</label>
                  <input
                    type="number"
                    min="1"
                    value={state.days}
                    onChange={(event) => updateItemState(item.id, { days: Math.max(1, parseInt(event.target.value, 10) || 1) })}
                    className=""
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleAddCatalogItem(item)}
                  className=""
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}

        {!loadingEquipment && filteredCatalog.length === 0 && (
          <div className="">
            <p className="">No catalog items match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
