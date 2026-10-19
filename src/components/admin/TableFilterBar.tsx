'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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
    <div className="">
      {/* Search Input */}
      <div className="">
        <Search className="" />
        <Input
          type="search"
          placeholder={`Search ${itemLabel.toLowerCase()}...`}
          value={search}
          onChange={handleSearchChange}
          className=""
          aria-label={`Search ${itemLabel}`}
        />
      </div>

      {/* Filter Options & Controls */}
      <div className="">
        {filterOptions.map((option) => {
          if (option.type === 'pills') {
            return (
              <div key={option.value} className="">
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
                      {active && <Check className="" />}
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
              className=""
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
          <div ref={actionsRef} className="">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionsOpen((current) => !current)}
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              className=""
            >
              <span>Actions</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${actionsOpen ? 'rotate-180' : ''}`} />
            </Button>

            {actionsOpen && (
              <div
                className=""
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
            className=""
          >
            <Plus className="" />
            <span>New {itemLabel}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
