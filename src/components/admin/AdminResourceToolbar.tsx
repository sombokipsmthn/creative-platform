'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, Filter, Check, LayoutList, LayoutGrid, RefreshCw, Settings, Download, Columns } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * Filter value types supported by the toolbar
 */
export type FilterValue = string | undefined;

/**
 * Configuration for a single filter control
 */
export interface AdminFilterConfig {
  /** Unique identifier for the filter */
  id: string;
  /** Human-readable label for the filter */
  label: string;
  /** Current value of the filter */
  value: FilterValue;
  /** Available options for select/pill filters */
  options: Array<{ label: string; value: string }>;
  /** Type of filter control to render */
  type?: 'select' | 'pills' | 'multi-select';
  /** Placeholder text for select controls */
  placeholder?: string;
  /** Whether to show 'All' option */
  showAllOption?: boolean;
  /** Custom all option label */
  allLabel?: string;
}

/**
 * Configuration for toolbar actions
 */
export interface AdminToolbarAction {
  /** Action label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Icon to display */
  icon?: React.ReactNode;
  /** Whether action is destructive */
  destructive?: boolean;
  /** Whether to show only on mobile */
  mobileOnly?: boolean;
  /** Whether to hide on mobile */
  hideOnMobile?: boolean;
}

/**
 * Toolbar state for selected records (bulk actions)
 */
export interface AdminToolbarSelectionState {
  /** Number of selected records */
  count: number;
  /** Label for selected items (e.g., "clients", "invoices") */
  itemLabel: string;
  /** Bulk actions available when items are selected */
  bulkActions: AdminToolbarAction[];
  /** Handler to clear selection */
  onClearSelection: () => void;
}

/**
 * View mode for list/grid switching
 */
export type ViewMode = 'list' | 'grid';

/**
 * Props for AdminResourceToolbar
 */
export interface AdminResourceToolbarProps {
  /** Current search query */
  search: string;
  /** Search change handler */
  onSearchChange: (value: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Filter configurations */
  filters: AdminFilterConfig[];
  /** Filter change handler - receives filter ID and new value */
  onFilterChange: (id: string, value: FilterValue) => void;
  /** Handler to clear all filters and search */
  onClearAll?: () => void;
  /** Secondary actions (refresh, export, etc.) - primary creation actions should live in page header */
  secondaryActions?: AdminToolbarAction[];
  /** Selection/bulk action state */
  selection?: AdminToolbarSelectionState;
  /** Total result count (when available) */
  resultCount?: number;
  /** Filtered result count (when different from total) */
  filteredCount?: number;
  /** Result label (e.g., "Clients", "Invoices") */
  resultLabel?: string;
  /** Loading state */
  loading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show filter toggle on mobile */
  showFilterToggle?: boolean;
  /** Custom filter toggle label */
  filterToggleLabel?: string;
  /** Current view mode for list/grid toggle */
  viewMode?: ViewMode;
  /** Handler for view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;
  /** Whether to show the list/grid view toggle */
  showViewToggle?: boolean;
  /** Sort options */
  sortOptions?: Array<{ label: string; value: string }>;
  /** Current sort value */
  sortValue?: string;
  /** Sort change handler */
  onSortChange?: (value: string) => void;
}

/**
 * Internal filter state for managing active filters display
 */
interface ActiveFilter {
  id: string;
  label: string;
  value: string;
  displayValue: string;
}

/**
 * AdminResourceToolbar - Unified search, filter, and action toolbar for admin resources
 *
 * Consolidates patterns from AdminListToolbar and TableFilterBar into a single,
 * configurable component with consistent styling, active filter chips, and responsive layout.
 */
export function AdminResourceToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  filters,
  onFilterChange,
  onClearAll,
  secondaryActions = [],
  selection,
  resultCount,
  filteredCount,
  resultLabel = 'Items',
  loading = false,
  className,
  showFilterToggle = true,
  filterToggleLabel = 'Filters',
  viewMode = 'list',
  onViewModeChange,
  showViewToggle = false,
  sortOptions,
  sortValue,
  onSortChange,
}: AdminResourceToolbarProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  // Close filter menu when clicking outside
  useEffect(() => {
    if (!filterMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!filterMenuRef.current?.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [filterMenuOpen]);

  // Compute active filters for chip display
  useEffect(() => {
    const active: ActiveFilter[] = [];

    filters.forEach((filter) => {
      if (filter.value && filter.value !== 'all') {
        const option = filter.options.find((opt) => opt.value === filter.value);
        active.push({
          id: filter.id,
          label: filter.label,
          value: filter.value,
          displayValue: option?.label || filter.value,
        });
      }
    });

    if (search.trim()) {
      active.push({
        id: 'search',
        label: 'Search',
        value: search.trim(),
        displayValue: `"${search.trim()}"`,
      });
    }

    setActiveFilters(active);
  }, [filters, search]);

  const hasActiveFilters = activeFilters.length > 0;

  const handleFilterChange = useCallback(
    (id: string, value: string) => {
      const normalizedValue = value === 'all' ? undefined : value;
      onFilterChange(id, normalizedValue);
    },
    [onFilterChange]
  );

  const handleClearFilter = useCallback(
    (id: string) => {
      if (id === 'search') {
        onSearchChange('');
      } else {
        onFilterChange(id, undefined);
      }
    },
    [onFilterChange, onSearchChange]
  );

  const handleClearAll = useCallback(() => {
    onClearAll?.();
    filters.forEach((filter) => {
      if (filter.value && filter.value !== 'all') {
        onFilterChange(filter.id, undefined);
      }
    });
    if (search.trim()) {
      onSearchChange('');
    }
  }, [filters, onClearAll, onFilterChange, onSearchChange, search]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(event.target.value);
    },
    [onSearchChange]
  );

  // Render filter controls
  const renderFilterControl = (filter: AdminFilterConfig) => {
    const isActive = filter.value && filter.value !== 'all';
    const filterType = filter.type || 'select';

    if (filterType === 'pills') {
      return (
        <div key={filter.id} className="flex items-center gap-1" role="group" aria-label={filter.label}>
          {(filter.options || []).map((option) => {
            const active = (filter.value ?? 'all') === option.value;

            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  'ui-tab-pill',
                  active && 'ui-tab-pill-active',
                  'transition-all duration-150'
                )}
                onClick={() => handleFilterChange(filter.id, option.value)}
                aria-pressed={active}
                disabled={loading}
              >
                {active && <Check className="h-3 w-3" />}
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

    // Default: select dropdown
    return (
      <Select
        key={filter.id}
        value={filter.value ?? 'all'}
        onValueChange={(value) => handleFilterChange(filter.id, value)}
        disabled={loading}
      >
        <SelectTrigger className="min-w-[9.5rem] max-w-[14rem]" aria-label={filter.label}>
          <SelectValue placeholder={filter.placeholder ?? `All ${filter.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {filter.showAllOption !== false && (
            <SelectItem value="all">
              {filter.allLabel ?? `All ${filter.label.toLowerCase()}`}
            </SelectItem>
          )}
          {filter.options
            .filter((opt) => opt.value !== 'all' || filter.showAllOption !== false)
            .map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  };

  // Render active filter chips
  const renderActiveFilters = () => {
    if (!hasActiveFilters) return null;

    return (
      <div
        className="flex flex-wrap items-center gap-2 pt-2 border-t border-border"
        aria-label="Active filters"
      >
        {activeFilters.map((filter) => (
          <span
            key={filter.id}
            className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium"
          >
            <span className="font-medium text-muted-foreground">
              {filter.label}:
            </span>
            <span>{filter.displayValue}</span>
            <button
              type="button"
              onClick={() => handleClearFilter(filter.id)}
              className="p-0.5 rounded-full hover:bg-muted-foreground/10 transition-colors"
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </span>
        ))}
        {onClearAll && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs font-sans uppercase tracking-widest"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>
    );
  };

  // Render result count
  const renderResultCount = () => {
    if (resultCount === undefined && filteredCount === undefined) return null;

    const count = filteredCount ?? resultCount;
    const isFiltered = filteredCount !== undefined && filteredCount !== resultCount;

    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isFiltered ? (
          <>
            Showing <strong>{count}</strong> of <strong>{resultCount}</strong>{' '}
            {resultLabel.toLowerCase()}
          </>
        ) : (
          <>
            <strong>{count}</strong> {resultLabel.toLowerCase()}
          </>
        )}
      </div>
    );
  };

  // Render sort control
  const renderSortControl = () => {
    if (!sortOptions || sortOptions.length === 0 || !onSortChange) return null;

    return (
      <Select
        value={sortValue || sortOptions[0].value}
        onValueChange={onSortChange}
        disabled={loading}
      >
        <SelectTrigger className="min-w-[9.5rem] max-w-[14rem]" aria-label="Sort">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // Render view mode toggle
  const renderViewToggle = () => {
    if (!showViewToggle || !onViewModeChange) return null;

    return (
      <div className="flex items-center gap-1" role="group" aria-label="View mode">
        <Button
          type="button"
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
          aria-pressed={viewMode === 'list'}
          disabled={loading}
        >
          <LayoutList className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="icon"
          onClick={() => onViewModeChange('grid')}
          aria-label="Grid view"
          aria-pressed={viewMode === 'grid'}
          disabled={loading}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div
      ref={filterMenuRef}
      className={cn(
        'admin-filter-bar ui-fade-in flex flex-col gap-4 rounded-2xl border border-border bg-card p-4',
        'md:flex-row md:items-center md:justify-between',
        'gap-3 md:gap-4',
        className
      )}
      data-admin-toolbar
    >
      {/* Search Section - flex-1 with min-width for breathing room */}
      <div className="admin-filter-search relative flex-1 min-w-[280px] w-full md:max-w-[480px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-10"
          aria-label={searchPlaceholder}
          disabled={loading}
        />
      </div>

      {/* Filter Controls Section - compact, right-aligned */}
      <div className="admin-filter-controls flex flex-wrap items-center gap-2 md:gap-3">
        {/* Filters - inline on desktop, collapsible on mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => renderFilterControl(filter))}
        </div>

        {/* Mobile: Filter toggle button */}
        {showFilterToggle && filters.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-1.5"
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            aria-expanded={filterMenuOpen}
            aria-haspopup="menu"
            disabled={loading}
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{filterToggleLabel}</span>
            {hasActiveFilters && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {activeFilters.length}
              </span>
            )}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', filterMenuOpen && 'rotate-180')} />
          </Button>
        )}

        {/* Sort control */}
        {renderSortControl()}

        {/* View mode toggle */}
        {renderViewToggle()}

        {/* Result count */}
        {renderResultCount()}

        {/* Selection state (bulk actions) */}
        {selection && selection.count > 0 && (
          <div className="flex items-center gap-2 border-l border-border pl-3 ml-1">
            <span className="text-sm font-medium">
              {selection.count} {selection.itemLabel} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={selection.onClearSelection}
              className="text-xs"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
            {selection.bulkActions.map((action, index) => (
              <Button
                key={index}
                type="button"
                variant={action.variant || 'secondary'}
                size={action.size || 'sm'}
                onClick={action.onClick}
                className={cn(
                  action.destructive && 'text-destructive',
                  action.hideOnMobile && 'hidden md:inline-flex'
                )}
                disabled={loading}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Secondary actions - icon buttons where appropriate */}
        {secondaryActions.map((action, index) => (
          <Button
            key={index}
            type="button"
            variant={action.variant || (action.icon && !action.label ? 'ghost' : 'secondary')}
            size={action.size || (action.icon && !action.label ? 'icon' : 'default')}
            onClick={action.onClick}
            className={cn(
              action.destructive && 'text-destructive',
              action.hideOnMobile && 'hidden md:inline-flex',
              action.mobileOnly && 'md:hidden'
            )}
            disabled={loading}
            aria-label={action.label}
          >
            {action.icon}
            {action.label && !action.icon && action.label}
          </Button>
        ))}

        {/* No primary action - it belongs in the page header */}
      </div>

      {/* Active filters display */}
      {renderActiveFilters()}

      {/* Mobile filter menu */}
      {filterMenuOpen && filters.length > 0 && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setFilterMenuOpen(false)}
          aria-hidden="true"
        >
          <div
            className="fixed bottom-0 right-0 left-0 z-50 rounded-t-2xl border border-border bg-card p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">{filterToggleLabel}</h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFilterMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {filters.map((filter) => (
                <div key={filter.id} className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {filter.label}
                  </label>
                  {filter.type === 'pills' ? (
                    <div className="flex flex-wrap gap-1" role="listbox" aria-label={filter.label}>
                      {(filter.options || []).map((option) => {
                        const active = (filter.value ?? 'all') === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              handleFilterChange(filter.id, option.value);
                              setFilterMenuOpen(false);
                            }}
                            className={cn(
                              'ui-tab-pill',
                              active && 'ui-tab-pill-active'
                            )}
                            aria-selected={active}
                            disabled={loading}
                            role="option"
                          >
                            {active && <Check className="h-3 w-3" />}
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <Select
                      value={filter.value ?? 'all'}
                      onValueChange={(value) => {
                        handleFilterChange(filter.id, value);
                        setFilterMenuOpen(false);
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full" aria-label={filter.label}>
                        <SelectValue placeholder={filter.placeholder ?? `All ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {filter.showAllOption !== false && (
                          <SelectItem value="all">
                            {filter.allLabel ?? `All ${filter.label.toLowerCase()}`}
                          </SelectItem>
                        )}
                        {filter.options
                          .filter((opt) => opt.value !== 'all' || filter.showAllOption !== false)
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              {hasActiveFilters && onClearAll && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    handleClearAll();
                    setFilterMenuOpen(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminResourceToolbar;