'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

  const handleFilterChange = (name: string, value: string) => {
    onFiltersChange({
      ...filters,
      [name]: value === 'all' ? undefined : value,
    });
  };

  return (
    <div className="admin-filter-bar ui-fade-in">
      <div className="flex flex-col items-stretch gap-4 rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-zinc-800/80 dark:bg-zinc-900/40 md:flex-row md:items-center md:justify-between">
        <div className="admin-filter-search">
          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-faint)]" />
            <Input
              type="search"
              placeholder={`Search ${itemLabel.toLowerCase()} by name, client, status...`}
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10"
              aria-label={`Search ${itemLabel}`}
            />
          </div>
        </div>

        <div className="admin-filter-controls flex-1 flex flex-wrap gap-2 text-xs font-sans">
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
              <Select
                key={option.value}
                value={filters[option.value] ?? 'all'}
                onValueChange={(value) => handleFilterChange(option.value, value)}
              >
                <SelectTrigger className="min-w-[9.5rem]" aria-label={option.label}>
                  <SelectValue placeholder={`All ${option.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {option.label.toLowerCase()}</SelectItem>
                  {option.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}

          {actions.length > 0 && (
            <div ref={actionsRef} className="relative">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActionsOpen((current) => !current)}
                aria-haspopup="menu"
                aria-expanded={actionsOpen}
              >
                Actions
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} />
              </Button>

              {actionsOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-48 overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-1 shadow-xl"
                  role="menu"
                >
                  {actions.map((action) => (
                    <Button
                      key={action.label}
                      type="button"
                      variant="ghost"
                      role="menuitem"
                      className={`w-full justify-start rounded-lg px-3 py-2.5 text-left text-xs font-medium ${action.destructive ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'}`}
                      onClick={() => {
                        setActionsOpen(false);
                        action.onClick();
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {onAddItem && (
            <Button
              type="button"
              onClick={onAddItem}
              variant="primary"
              className="text-xs font-sans uppercase tracking-widest"
            >
              <Plus className="h-3.5 w-3.5" />
              New {itemLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
