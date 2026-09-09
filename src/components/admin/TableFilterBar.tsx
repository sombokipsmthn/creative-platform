'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';

type FilterValue = string | undefined;

type FilterOption = {
  label: string;
  value: string;
  options?: Array<{ label: string; value: string }>;
  type?: 'select' | 'pills';
};

type TableAction = {
  label: string;
  onClick: () => void;
  destructive?: boolean;
};

interface TableFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: Record<string, FilterValue>;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
  onAddItem?: () => void;
  filterOptions: FilterOption[];
  itemLabel: string;
  actions?: TableAction[];
}

export default function TableFilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onAddItem,
  filterOptions = [],
  itemLabel = 'Item',
  actions = [],
}: TableFilterBarProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actionsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [actionsOpen]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    onFiltersChange({
      ...filters,
      [name]: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="admin-filter-bar ui-fade-in">
      <div className="admin-filter-search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-faint)]" />
          <input
            type="search"
            placeholder={`Search ${itemLabel.toLowerCase()} by name, client, status...`}
            value={search}
            onChange={handleSearchChange}
            className="ui-input w-full pl-10"
            aria-label={`Search ${itemLabel}`}
          />
        </div>
      </div>

      <div className="admin-filter-controls">
        {filterOptions.map((option) => {
          if (option.type === 'pills') {
            return (
              <div key={option.value} className="ui-tab-pills">
                {option.options?.map((opt) => {
                  const active = (filters[option.value] ?? 'all') === opt.value;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ui-tab-pill ${active ? 'ui-tab-pill-active' : ''}`}
                      onClick={() => {
                        onFiltersChange({
                          ...filters,
                          [option.value]: opt.value === 'all' ? undefined : opt.value,
                        });
                      }}
                      aria-pressed={active}
                    >
                      {active && <Check className="h-3 w-3" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            );
          }

          return (
            <select
              key={option.value}
              name={option.value}
              value={filters[option.value] ?? 'all'}
              onChange={handleFilterChange}
              className="ui-select min-w-[9.5rem]"
              aria-label={option.label}
            >
              <option value="all">All {option.label.toLowerCase()}</option>
              {option.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        })}

        {actions.length > 0 && (
          <div ref={actionsRef} className="relative">
            <button
              type="button"
              className="ui-button ui-button-secondary"
              onClick={() => setActionsOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
            >
              Actions
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} />
            </button>

            {actionsOpen && (
              <div
                className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-48 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-1 shadow-xl"
                role="menu"
              >
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    role="menuitem"
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-xs font-medium transition hover:bg-[var(--color-bg-soft)] ${
                      action.destructive ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'
                    }`}
                    onClick={() => {
                      setActionsOpen(false);
                      action.onClick();
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {onAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            className="ui-button ui-button-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            New {itemLabel}
          </button>
        )}
      </div>
    </div>
  );
}
