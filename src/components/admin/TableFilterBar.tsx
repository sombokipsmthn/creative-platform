import { useState } from 'react';
import { Search, Sliders, Plus } from 'lucide-react';

interface TableFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  onAddItem: () => void;
  filterOptions: {
    label: string;
    value: string;
    options?: Array<{ label: string; value: string | number }>;
    type?: 'select' | 'pills';
  }[];
  itemLabel: string;
}

export default function TableFilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onAddItem,
  filterOptions = [],
  itemLabel = 'Item',
}: TableFilterBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFiltersChange(prev => ({
      ...prev,
      [name]: value === 'all' ? undefined : value
    }));
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          type="search"
          placeholder={`Search ${itemLabel.toLowerCase()}...`}
          value={search}
          onChange={handleSearchChange}
          className="ui-input w-full pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 md:flex-nowrap">
        {filterOptions.map((option) => (
          <div key={option.value} className="relative">
            <label className="block ui-meta mb-1">{option.label}</label>
            {option.type === 'pills' ? (
              <div className="ui-tab-pills">
                {option.options?.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`ui-tab-pill ${filters[option.value] === opt.value ? 'ui-tab-pill-active' : ''}`}
                    onClick={() => {
                      onFiltersChange(prev => ({
                        ...prev,
                        [option.value]: opt.value === 'all' ? undefined : opt.value
                      }));
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={filters[option.value] ?? 'all'}
                onChange={handleFilterChange}
                className="ui-select w-[180px]"
              >
                <option value="all">All {option.label}</option>
                {option.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onAddItem}
          className="ui-button ui-button-primary"
        >
          New {itemLabel}
          <Plus className="h-3.5 w-3.5 ml-2" />
        </button>
        <button
          type="button"
          className="ui-button ui-button-secondary"
        >
          Actions
          <Sliders className="h-3.5 w-3.5 ml-2" />
        </button>
      </div>
    </div>
  );
}
