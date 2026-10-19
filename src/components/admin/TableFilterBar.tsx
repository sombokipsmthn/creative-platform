'use client';

import * as React from 'react';
import { Check, ChevronDown, Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type FilterValue = string | undefined;
type FilterOption = { label: string; value: string; options?: Array<{ label: string; value: string }>; type?: 'select' | 'pills' };
type TableAction = { label: string; onClick: () => void; destructive?: boolean };
interface Props { search: string; onSearchChange: (value: string) => void; filters: Record<string, FilterValue>; onFiltersChange: (filters: Record<string, FilterValue>) => void; onAddItem?: () => void; filterOptions: FilterOption[]; itemLabel: string; actions?: TableAction[] }

export default function TableFilterBar({ search, onSearchChange, filters, onFiltersChange, onAddItem, filterOptions = [], itemLabel = 'Item', actions = [] }: Props) {
  const activeFilters = Object.entries(filters).filter(([, value]) => value && value !== 'all');
  const clear = () => { onSearchChange(''); onFiltersChange(Object.fromEntries(Object.keys(filters).map(key => [key, undefined]))); };
  return <section className="admin-filter-bar" aria-label={`${itemLabel} search and filters`}>
    <div className="admin-search"><Search aria-hidden="true" /><Input type="search" value={search} onChange={event => onSearchChange(event.target.value)} placeholder={`Search ${itemLabel.toLowerCase()}...`} aria-label={`Search ${itemLabel}`} /><button type="button" onClick={() => onSearchChange('')} className="admin-search-clear" aria-label="Clear search" hidden={!search}>{search && <X aria-hidden="true" />}</button></div>
    <div className="admin-filter-controls">{filterOptions.map(option => option.type === 'pills' ? <div key={option.value} className="admin-filter-pills" role="group" aria-label={option.label}>{option.options?.map(opt => { const active = (filters[option.value] ?? 'all') === opt.value; return <Button key={opt.value} type="button" variant={active ? 'secondary' : 'ghost'} size="sm" aria-pressed={active} onClick={() => onFiltersChange({ ...filters, [option.value]: opt.value === 'all' ? undefined : opt.value })}>{active && <Check aria-hidden="true" />}{opt.label}</Button>; })}</div> : <label key={option.value} className="admin-select-label"><span className="sr-only">{option.label}</span><select value={filters[option.value] ?? 'all'} onChange={event => onFiltersChange({ ...filters, [option.value]: event.target.value === 'all' ? undefined : event.target.value })} aria-label={option.label}><option value="all">All {option.label.toLowerCase()}</option>{option.options?.filter(opt => opt.value !== 'all').map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select><ChevronDown aria-hidden="true" /></label>)}</div>
    <div className="admin-filter-actions">{activeFilters.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear filters</Button>}{actions.length > 0 && <details className="admin-actions-menu"><summary><Button type="button" variant="outline" size="sm">Actions <ChevronDown aria-hidden="true" /></Button></summary><div role="menu">{actions.map(action => <button key={action.label} type="button" role="menuitem" className={action.destructive ? 'is-destructive' : ''} onClick={action.onClick}>{action.label}</button>)}</div></details>}{onAddItem && <Button type="button" size="sm" onClick={onAddItem}><Plus aria-hidden="true" />New {itemLabel}</Button>}</div>
    {activeFilters.length > 0 && <div className="admin-active-filters" aria-live="polite">{activeFilters.map(([key, value]) => <button type="button" key={key} onClick={() => onFiltersChange({ ...filters, [key]: undefined })}>{key}: {value}<X aria-hidden="true" /></button>)}</div>}
  </section>;
}
