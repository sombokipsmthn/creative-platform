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

type EquipmentResponse = Equipment[] | { equipment?: Equipment[] };

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
          const data = await res.json() as EquipmentResponse;
          const item = Array.isArray(data)
            ? data.find((i) => i.id === value)
            : data.equipment?.find((i) => i.id === value);
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
    <div ref={containerRef} className="">
      <div className="">
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
          className=""
        />
        <div className="">
          {isLoading && <Loader2 className="" />}
          {isOpen && query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className=""
            >
              <X className="" />
            </button>
          )}
          <Search className="" />
        </div>
      </div>

      {isOpen && (
        <div className="">
          {results.length === 0 && !isLoading && (
            <div className="">
              No equipment found matching &quot;{query}&quot;
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
              className=""
            >
              <div className="">
                <span className="">{item.name}</span>
                <span className="">{item.dailyRate} KES/day</span>
              </div>
              <div className="">
                {item.category} {item.subcategory ? `· ${item.subcategory}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
