'use client';

import { MagnifyingGlass as Search, X } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type AdminListFilter = { id: string; label: string; value: string; options: Array<{ label: string; value: string }> };

export function AdminListToolbar({ search, onSearchChange, searchPlaceholder = 'Search…', filters = [], onFilterChange, onClear, primaryAction, secondaryActions, className }: { search?: string; onSearchChange?: (value: string) => void; searchPlaceholder?: string; filters?: AdminListFilter[]; onFilterChange?: (id: string, value: string) => void; onClear?: () => void; primaryAction?: React.ReactNode; secondaryActions?: React.ReactNode; className?: string }) {
  const hasFilters = Boolean(search) || filters.some((filter) => filter.value && filter.value !== 'all');
  return <div className={cn('flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:p-4 lg:flex-row lg:items-center', className)}><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input type="search" value={search ?? ''} onChange={(event) => onSearchChange?.(event.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="pl-9" /></div><div className="flex flex-wrap items-center gap-2">{filters.map((filter) => <select key={filter.id} aria-label={filter.label} value={filter.value || 'all'} onChange={(event) => onFilterChange?.(filter.id, event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="all">All {filter.label.toLowerCase()}</option>{filter.options.filter((option) => option.value !== 'all').map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>)}{hasFilters && onClear && <Button type="button" variant="ghost" size="sm" onClick={onClear}><X className="mr-1 h-3.5 w-3.5" />Clear</Button>}{secondaryActions}{primaryAction}</div></div>;
}

export default AdminListToolbar;
