'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Settings2, Save, Bookmark, BookmarkMinus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  // Saved views
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
  filters: Record<string, any>;
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
  const visibleColumns = columns.filter((column) => columnVisibility?.[column.id] !== false);
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));
  const someSelected = rows.some((row) => selectedIds.has(row.id));

  // Saved views state
  const [showSaveViewDialog, setShowSaveViewDialog] = React.useState(false);
  const [newViewName, setNewViewName] = React.useState('');

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
    if (!column.sortable || !onSortChange) return;
    const direction = sort?.id === column.id && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(column.id, direction);
  }

  function handleSaveView() {
    if (!onSaveView || !newViewName.trim()) return;
    onSaveView({
      name: newViewName.trim(),
      filters: {}, // Parent component should provide current filters
      sort,
      columnVisibility,
      pageSize: pagination?.pageSize,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setNewViewName('');
    setShowSaveViewDialog(false);
  }

  function handleDeleteView(viewId: string) {
    onDeleteView?.(viewId);
  }

  function handleSetActiveView(viewId: string) {
    onSetActiveView?.(viewId);
  }

  const activeView = savedViews.find(v => v.id === activeViewId);

  if (loading) {
    return <div className="admin-list-state" role="status" aria-live="polite"><div className="admin-list-skeleton" /><div className="admin-list-skeleton" /><div className="admin-list-skeleton" /></div>;
  }

  if (error) {
    return <div className="admin-list-state" role="alert"><p className="font-medium">Unable to load this list</p><p className="text-sm text-muted-foreground">{error}</p></div>;
  }

  if (rows.length === 0) {
    return <div className="admin-list-state"><p className="font-medium">{emptyTitle}</p><p className="max-w-md text-sm text-muted-foreground">{emptyDescription}</p>{emptyAction}</div>;
  }

  const actionMenu = (row: T) => visibleActions ? <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon-sm" aria-label={`Actions for ${getRowLabel(row)}`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{rowActions.filter((action) => !action.hidden?.(row)).map((action, index) => <React.Fragment key={action.label}>{index > 0 && action.destructive && <DropdownMenuSeparator />}<DropdownMenuItem className={action.destructive ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : undefined} onSelect={() => action.onSelect(row)}>{action.label}</DropdownMenuItem></React.Fragment>)}</DropdownMenuContent></DropdownMenu> : null;

  return (
    <div className={cn('overflow-hidden rounded-xl border bg-card', className)}>
      {selectable && selectedIds.size > 0 && (
        <div className="flex items-center justify-between border-b bg-primary/5 px-4 py-3 text-sm">
          <span>{selectedIds.size} selected</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onSelectionChange?.(new Set())}>Clear selection</Button>
        </div>
      )}

      {/* Saved Views Toolbar */}
      {(savedViews.length > 0 || onSaveView) && (
        <div className="flex items-center gap-2 border-b px-4 py-2 bg-muted/20">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{viewName}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-8"
              >
                {activeView ? activeView.name : 'Default View'}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem
                className={!activeViewId ? 'bg-primary/5 text-primary' : ''}
                onSelect={() => handleSetActiveView('')}
              >
                <span className="flex items-center justify-between w-full">
                  Default View
                  {!activeViewId && <Bookmark className="h-3.5 w-3.5 text-primary" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {savedViews.map((view) => (
                <React.Fragment key={view.id}>
                  <DropdownMenuItem
                    className={activeViewId === view.id ? 'bg-primary/5 text-primary' : ''}
                    onSelect={() => handleSetActiveView(view.id)}
                  >
                    <span className="flex items-center justify-between w-full">
                      {view.name}{view.isDefault && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Default</span>}
                      {activeViewId === view.id && <Bookmark className="h-3.5 w-3.5 text-primary" />}
                    </span>
                  </DropdownMenuItem>
                  {onDeleteView && (
                    <DropdownMenuItem
                      className="text-red-600 hover:bg-red-50"
                      onSelect={(e) => { e.preventDefault(); handleDeleteView(view.id); }}
                    >
                      Delete view
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
              {onSaveView && (
                <DropdownMenuItem onSelect={() => setShowSaveViewDialog(true)}>
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Save current view…
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {onColumnVisibilityChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="ml-auto">
                  <Settings2 className="mr-2 h-4 w-4" />Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.map((column) => (
                  <DropdownMenuItem
                    key={column.id}
                    onSelect={(event) => {
                      event.preventDefault();
                      onColumnVisibilityChange({ ...columnVisibility, [column.id]: columnVisibility?.[column.id] === false });
                    }}
                  >
                    {columnVisibility?.[column.id] === false ? 'Show' : 'Hide'} {column.header}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}

      {onColumnVisibilityChange && !savedViews.length && !onSaveView && (
        <div className="flex justify-end border-b px-4 py-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  onSelect={(event) => {
                    event.preventDefault();
                    onColumnVisibilityChange({ ...columnVisibility, [column.id]: columnVisibility?.[column.id] === false });
                  }}
                >
                  {columnVisibility?.[column.id] === false ? 'Show' : 'Hide'} {column.header}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {mobileCard && <div className="space-y-3 p-3 md:hidden">{rows.map((row) => <div key={row.id} className="rounded-lg border p-4">{mobileCard(row, actionMenu(row))}</div>)}</div>}
      <div className={cn('overflow-x-auto', mobileCard && 'hidden md:block')}>
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {selectable && <th className="w-12 px-4 py-3"><Checkbox checked={allSelected ? true : someSelected ? 'indeterminate' : false} onCheckedChange={(checked) => toggleAll(checked === true)} aria-label="Select all rows" /></th>}
              {visibleColumns.map((column) => { 
                const active = sort?.id === column.id;
                return <th key={column.id} className={cn('whitespace-nowrap px-4 py-3 font-medium', column.align === 'right' && 'text-right', column.align === 'center' && 'text-center', column.hideOnMobile && 'hidden md:table-cell', column.className)}><button type="button" disabled={!column.sortable} onClick={() => sortColumn(column)} className={cn('inline-flex items-center gap-1.5 font-inherit', column.sortable && 'cursor-pointer hover:text-foreground')} aria-label={column.sortable ? `Sort by ${column.header}` : undefined}>{column.header}{column.sortable && (active ? sort?.direction === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />)}</button></th>;
              })}
              {visibleActions && <th className="w-12 px-4 py-3"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => {
              const rowInteractive = Boolean(onRowClick);
              return <tr key={row.id} className={cn('transition-colors hover:bg-muted/20', selectedIds.has(row.id) && 'bg-primary/5', rowInteractive && 'cursor-pointer')} onClick={() => onRowClick?.(row)}>{selectable && <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}><Checkbox checked={selectedIds.has(row.id)} onCheckedChange={(checked) => toggleRow(row, checked === true)} aria-label={`Select ${getRowLabel(row)}`} /></td>}{visibleColumns.map((column) => <td key={column.id} className={cn('px-4 py-4 align-middle', column.align === 'right' && 'text-right tabular-nums', column.align === 'center' && 'text-center', column.hideOnMobile && 'hidden md:table-cell', column.className)}>{column.cell ? column.cell(row) : valueFor(column, row)}</td>)}{visibleActions && <td className="px-4 py-4 text-right" onClick={(event) => event.stopPropagation()}>{actionMenu(row)}</td>}</tr>;
            })}
          </tbody>
        </table>
      </div>
      {pagination && pagination.total > pagination.pageSize && <div className="flex items-center justify-between border-t px-4 py-3 text-sm"><span className="text-muted-foreground">Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}</span><div className="flex gap-2"><Button type="button" variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => pagination.onPageChange(pagination.page - 1)}>Previous</Button><Button type="button" variant="secondary" size="sm" disabled={pagination.page * pagination.pageSize >= pagination.total} onClick={() => pagination.onPageChange(pagination.page + 1)}>Next</Button></div></div>}

      {/* Save View Dialog */}
      {showSaveViewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md p-6 bg-card border border-border rounded-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Save Current View</h3>
              <Button variant="ghost" size="icon" onClick={() => { setShowSaveViewDialog(false); setNewViewName(''); }}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Save the current filters, sorting, and column visibility as a named view for quick access later.</p>
            <Input
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              placeholder="Enter view name..."
              className="mb-4"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveView(); if (e.key === 'Escape') { setShowSaveViewDialog(false); setNewViewName(''); } }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => { setShowSaveViewDialog(false); setNewViewName(''); }}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveView} disabled={!newViewName.trim()}>Save View</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDataTable;
