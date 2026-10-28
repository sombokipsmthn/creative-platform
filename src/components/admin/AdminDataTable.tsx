'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowsDownUp as ArrowUpDown, DotsThree as MoreHorizontal, SlidersHorizontal as Settings2, FloppyDisk as Save, Bookmark, CaretDown as ChevronDown } from "@phosphor-icons/react";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type SortDirection = 'asc' | 'desc';

export type AdminColumn<T> = {
  id: string;
  header: string;
  accessor?: (row: T) => string | number | null | undefined;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  className?: string;
  hideOnMobile?: boolean;
};

export type AdminRowAction<T> = {
  label: string;
  onSelect: (row: T) => void;
  destructive?: boolean;
  hidden?: (row: T) => boolean;
};

export type AdminDataTableProps<T extends { id: string }> = {
  rows: T[];
  columns: AdminColumn<T>[];
  getRowLabel?: (row: T) => string;
  rowActions?: AdminRowAction<T>[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: ReadonlySet<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sort?: { id: string; direction: SortDirection };
  onSortChange?: (id: string, direction: SortDirection) => void;
  loading?: boolean;
  error?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  className?: string;
  mobileCard?: (row: T, actions: React.ReactNode) => React.ReactNode;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  pagination?: { page: number; pageSize: number; total: number; onPageChange: (page: number) => void };
  savedViews?: SavedView<T>[];
  activeViewId?: string;
  onSaveView?: (view: Omit<SavedView<T>, 'id'>) => void;
  onDeleteView?: (viewId: string) => void;
  onSetActiveView?: (viewId: string) => void;
  viewName?: string;
};

export type SavedView<T extends { id: string }> = {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  sort?: { id: string; direction: SortDirection };
  columnVisibility?: Record<string, boolean>;
  pageSize?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
};

function valueFor<T>(column: AdminColumn<T>, row: T): string | number {
  const value = column.accessor?.(row);
  return value === null || value === undefined ? '' : value;
}

export function AdminDataTable<T extends { id: string }>({
  rows,
  columns,
  getRowLabel = () => 'row',
  rowActions = [],
  onRowClick,
  selectable = false,
  selectedIds = new Set<string>(),
  onSelectionChange,
  sort,
  onSortChange,
  loading = false,
  error,
  emptyTitle = 'No results',
  emptyDescription = 'There are no records to display.',
  emptyAction,
  className,
  mobileCard,
  columnVisibility,
  onColumnVisibilityChange,
  pagination,
  savedViews = [],
  activeViewId,
  onSaveView,
  onDeleteView,
  onSetActiveView,
  viewName = 'View',
}: AdminDataTableProps<T>) {
  const visibleActions = rowActions.some((action) => rows.some((row) => !action.hidden?.(row)));
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  const someSelected = rows.some((row) => selectedIds.has(row.id));
  const [showSaveViewDialog, setShowSaveViewDialog] = React.useState(false);
  const [newViewName, setNewViewName] = React.useState('');
  const [internalSort, setInternalSort] = React.useState<{ id: string; direction: SortDirection } | undefined>();
  const [internalVisibility, setInternalVisibility] = React.useState<Record<string, boolean>>({});
  const effectiveSort = sort ?? internalSort;
  const effectiveVisibility = columnVisibility ?? internalVisibility;
  const visibleColumns = columns.filter((column) => effectiveVisibility[column.id] !== false);

  function toggleAll(checked: boolean) {
    const next = new Set(selectedIds);
    rows.forEach((row) => (checked ? next.add(row.id) : next.delete(row.id)));
    onSelectionChange?.(next);
  }

  function toggleRow(row: T, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(row.id);
    else next.delete(row.id);
    onSelectionChange?.(next);
  }

  function sortColumn(column: AdminColumn<T>) {
    if (!column.sortable) return;
    const direction = effectiveSort?.id === column.id && effectiveSort.direction === 'asc' ? 'desc' : 'asc';
    if (onSortChange) onSortChange(column.id, direction);
    else setInternalSort({ id: column.id, direction });
  }

  function handleSaveView() {
    if (!onSaveView || !newViewName.trim()) return;
    const now = new Date().toISOString();
    onSaveView({
      name: newViewName.trim(),
      filters: {},
      sort: effectiveSort,
      columnVisibility: effectiveVisibility,
      pageSize: pagination?.pageSize,
      createdAt: now,
      updatedAt: now,
    });
    setNewViewName('');
    setShowSaveViewDialog(false);
  }

  const activeView = savedViews.find((view) => view.id === activeViewId);
  React.useEffect(() => {
    if (!sort) setInternalSort(activeView?.sort);
    if (!columnVisibility) setInternalVisibility(activeView?.columnVisibility ?? {});
  }, [activeView?.columnVisibility, activeView?.sort, activeViewId, columnVisibility, sort]);
  const sortedRows = React.useMemo(() => {
    if (!effectiveSort) return rows;
    const column = columns.find((item) => item.id === effectiveSort.id);
    if (!column?.sortable) return rows;
    const direction = effectiveSort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((left, right) => {
      const a = valueFor(column, left);
      const b = valueFor(column, right);
      const comparison = typeof a === 'number' && typeof b === 'number'
        ? a - b
        : String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
      return comparison * direction;
    });
  }, [columns, effectiveSort, rows]);
  const actionMenu = (row: T) => visibleActions ? <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${getRowLabel(row)}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{rowActions.filter((action) => !action.hidden?.(row)).map((action, index) => <React.Fragment key={action.label}>{index > 0 && action.destructive && <DropdownMenuSeparator />}<DropdownMenuItem className={action.destructive ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : undefined} onSelect={() => action.onSelect(row)}>{action.label}</DropdownMenuItem></React.Fragment>)}</DropdownMenuContent></DropdownMenu> : null;

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border bg-card p-4" role="status" aria-label="Loading records">
        <span className="sr-only">Loading records…</span>
        <div className="space-y-3 md:hidden">
          {[0, 1, 2].map((item) => <div key={item} className="rounded-lg border p-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-3 h-3 w-1/2" /><Skeleton className="mt-4 h-8 w-full" /></div>)}
        </div>
        <div className="hidden md:block">
          <div className="mb-4 flex gap-4 border-b pb-3">{columns.slice(0, 5).map((column) => <Skeleton key={column.id} className="h-4 flex-1" />)}</div>
          <div className="space-y-4">{[0, 1, 2, 3, 4].map((row) => <div key={row} className="flex gap-4">{columns.slice(0, 5).map((column) => <Skeleton key={column.id} className="h-8 flex-1" />)}</div>)}</div>
        </div>
      </div>
    );
  }

  if (error) return <div className="admin-list-state" role="alert"><p className="font-medium">Unable to load this list</p><p className="text-sm text-muted-foreground">{error}</p></div>;
  if (rows.length === 0) return <div className="admin-list-state"><p className="font-medium">{emptyTitle}</p><p className="max-w-md text-sm text-muted-foreground">{emptyDescription}</p>{emptyAction}</div>;

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      {selectable && selectedIds.size > 0 && <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3 text-sm"><span>{selectedIds.size} selected</span><Button type="button" variant="ghost" size="sm" onClick={() => onSelectionChange?.(new Set())}>Clear selection</Button></div>}

      {(savedViews.length > 0 || onSaveView) && (
        <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-4 py-2">
          <div className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-muted-foreground" /><span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{viewName}</span></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-8 gap-1">{activeView ? activeView.name : 'Default View'}<ChevronDown className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem className={!activeViewId ? 'bg-primary/5 text-primary' : ''} onSelect={() => onSetActiveView?.('')}><span className="flex w-full items-center justify-between">Default View{!activeViewId && <Bookmark className="h-3.5 w-3.5 text-primary" />}</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              {savedViews.map((view) => <React.Fragment key={view.id}>
                <DropdownMenuItem className={activeViewId === view.id ? 'bg-primary/5 text-primary' : ''} onSelect={() => onSetActiveView?.(view.id)}><span className="flex w-full items-center justify-between">{view.name}{view.isDefault && <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">Default</span>}{activeViewId === view.id && <Bookmark className="h-3.5 w-3.5 text-primary" />}</span></DropdownMenuItem>
                {onDeleteView && <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(event) => { event.preventDefault(); onDeleteView(view.id); }}>Delete {view.name}</DropdownMenuItem>}
                <DropdownMenuSeparator />
              </React.Fragment>)}
              {onSaveView && <DropdownMenuItem onSelect={() => setShowSaveViewDialog(true)}><Save className="mr-2 h-3.5 w-3.5" />Save current view…</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="sm" className="ml-auto"><Settings2 className="mr-2 h-4 w-4" />Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{columns.map((column) => <DropdownMenuItem key={column.id} onSelect={(event) => { event.preventDefault(); const next = { ...effectiveVisibility, [column.id]: effectiveVisibility[column.id] === false }; if (onColumnVisibilityChange) onColumnVisibilityChange(next); else setInternalVisibility(next); }}>{effectiveVisibility[column.id] === false ? 'Show' : 'Hide'} {column.header}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
        </div>
      )}

      {!savedViews.length && !onSaveView && <div className="flex justify-end border-b px-4 py-2"><DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="sm"><Settings2 className="mr-2 h-4 w-4" />Columns</Button></DropdownMenuTrigger><DropdownMenuContent align="end">{columns.map((column) => <DropdownMenuItem key={column.id} onSelect={(event) => { event.preventDefault(); const next = { ...effectiveVisibility, [column.id]: effectiveVisibility[column.id] === false }; if (onColumnVisibilityChange) onColumnVisibilityChange(next); else setInternalVisibility(next); }}>{effectiveVisibility[column.id] === false ? 'Show' : 'Hide'} {column.header}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu></div>}

      {mobileCard && <div className="space-y-3 p-3 md:hidden">{sortedRows.map((row) => <div key={row.id} className="min-w-0 rounded-lg border p-4">{mobileCard(row, actionMenu(row))}</div>)}</div>}
      <div className={cn('max-w-full overflow-x-auto', mobileCard && 'hidden md:block')}><table className="w-full text-sm"><thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr>{selectable && <th className="w-12 px-4 py-3"><Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onCheckedChange={(checked) => toggleAll(checked === true)} aria-label="Select all rows" /></th>}{visibleColumns.map((column) => { const active = effectiveSort?.id === column.id; return <th key={column.id} className={cn('whitespace-nowrap px-4 py-3 font-medium', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.hideOnMobile && 'hidden md:table-cell', column.className)}><button type="button" disabled={!column.sortable} onClick={() => sortColumn(column)} className={cn('inline-flex items-center gap-1.5 font-inherit', column.sortable && 'cursor-pointer hover:text-foreground')} aria-label={column.sortable ? `Sort by ${column.header}` : undefined}>{column.header}{column.sortable && (active ? effectiveSort?.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />)}</button></th>; })}{visibleActions && <th className="w-12 px-4 py-3"><span className="sr-only">Actions</span></th>}</tr></thead><tbody className="divide-y">{sortedRows.map((row) => <tr key={row.id} className={cn('transition-colors hover:bg-muted/20', selectedIds.has(row.id) && 'bg-primary/5', onRowClick && 'cursor-pointer')} onClick={() => onRowClick?.(row)}>{selectable && <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><Checkbox checked={selectedIds.has(row.id)} onCheckedChange={(checked) => toggleRow(row, checked === true)} aria-label={`Select ${getRowLabel(row)}`} /></td>}{visibleColumns.map((column) => <td key={column.id} className={cn('px-4 py-4 align-middle', column.align === 'right' && 'text-right tabular-nums', column.align === 'center' && 'text-center', column.hideOnMobile && 'hidden md:table-cell', column.className)}>{column.cell ? column.cell(row) : valueFor(column, row)}</td>)}{visibleActions && <td className="px-4 py-4 text-right" onClick={(event) => event.stopPropagation()}>{actionMenu(row)}</td>}</tr>)}</tbody></table></div>
      {pagination && pagination.total > pagination.pageSize && <div className="flex items-center justify-between border-t px-4 py-3 text-sm"><span className="text-muted-foreground">Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}</span><div className="flex gap-2"><Button type="button" variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => pagination.onPageChange(pagination.page - 1)}>Previous</Button><Button type="button" variant="secondary" size="sm" disabled={pagination.page * pagination.pageSize >= pagination.total} onClick={() => pagination.onPageChange(pagination.page + 1)}>Next</Button></div></div>}

      <Dialog open={showSaveViewDialog} onOpenChange={(open) => { setShowSaveViewDialog(open); if (!open) setNewViewName(''); }}><DialogContent className="w-[calc(100%-2rem)] max-w-md"><DialogHeader><DialogTitle>Save current view</DialogTitle><DialogDescription>Save this filtered and sorted view for quick access later.</DialogDescription></DialogHeader><form onSubmit={(event) => { event.preventDefault(); handleSaveView(); }} className="space-y-4"><Input aria-label="View name" value={newViewName} onChange={(event) => setNewViewName(event.target.value)} placeholder="Enter view name…" autoFocus maxLength={80} /><DialogFooter className="-mx-4 -mb-4 flex-row flex-wrap justify-end"><Button type="button" variant="secondary" onClick={() => setShowSaveViewDialog(false)}>Cancel</Button><Button type="submit" variant="primary" disabled={!newViewName.trim()}>Save view</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  );
}

export default AdminDataTable;
