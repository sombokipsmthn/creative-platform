'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

type Equipment = {
  id: string;
  name: string;
  dailyRate: number;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  specs?: string | null;
};

interface EquipmentSearchProps {
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function EquipmentSearch({
  value,
  onChange,
  placeholder = 'Search equipment...',
  disabled = false,
}: EquipmentSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Equipment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load selected item name
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    async function loadSelected() {
      if (!value) {
        setSelectedName('');
        return;
      }
      try {
        const res = await fetch(`/api/equipment?search=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          const item = Array.isArray(data)
            ? data.find((i: any) => i.id === value)
            : data.equipment?.find((i: any) => i.id === value);
          if (item) setSelectedName(item.name);
        }
      } catch (e) {
        console.error('Error loading selected equipment name', e);
      }
    }
    loadSelected();
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      if (!query) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/equipment?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : data.equipment || []);
        }
      } catch (e) {
        console.error('Equipment search error', e);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={isOpen ? query : selectedName}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          {isOpen && query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
          <Search className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg max-h-60 overflow-y-auto">
          {results.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-xs text-slate-500 text-center">
              No equipment found matching "{query}"
            </div>
          )}
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-zinc-900 transition border-b border-slate-100 dark:border-zinc-900 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                <span className="text-xs font-mono text-slate-500">{item.dailyRate} KES/day</span>
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {item.category} {item.subcategory ? `· ${item.subcategory}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
