'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 shadow-xs md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={`Search ${itemLabel.toLowerCase()}...`}
          value={search}
          onChange={handleSearchChange}
          className="pl-8 h-9 text-sm"
          aria-label={`Search ${itemLabel}`}
        />
      </div>

      {/* Filter Options & Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {filterOptions.map((option) => {
          if (option.type === 'pills') {
            return (
              <div key={option.value} className="flex items-center gap-1 bg-muted p-1 rounded-md">
                {option.options?.map((opt) => {
                  const active = (filters[option.value] ?? 'all') === opt.value;

                  return (
                    <Button
                      key={opt.value}
                      variant={active ? 'secondary' : 'ghost'}
                      size="sm"
                      className={`h-7 px-2.5 text-xs font-medium ${
                        active ? 'bg-background shadow-xs font-semibold' : 'text-muted-foreground'
                      }`}
                      onClick={() => {
                        onFiltersChange({
                          ...filters,
                          [option.value]: opt.value === 'all' ? undefined : opt.value,
                        });
                      }}
                      aria-pressed={active}
                    >
                      {active && <Check className="mr-1 h-3 w-3" />}
                      {opt.label}
                    </Button>
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
              className="flex h-9 items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionsOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              className="gap-1.5 h-9"
            >
              <span>Actions</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} />
            </Button>

            {actionsOpen && (
              <div
                className="absolute right-0 top-[calc(100%+0.25rem)] z-30 min-w-44 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
                role="menu"
              >
                {actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    role="menuitem"
                    className={`flex w-full cursor-pointer items-center rounded-sm px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${
                      action.destructive ? 'text-destructive' : 'text-foreground'
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
          <Button
            size="sm"
            onClick={onAddItem}
            className="gap-1.5 h-9 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New {itemLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
