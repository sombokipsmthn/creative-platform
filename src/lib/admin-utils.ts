/**
 * Admin UI Utilities
 *
 * Shared helper functions for formatting, status mapping, and common admin operations.
 */

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  return `${currency} ${Number(amount || 0).toLocaleString('en-KE')}`;
}

export function statusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getInitials(name: string, company?: string | null): string {
  const value = company || name;
  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/**
 * Maps status strings to badge variant.
 * Used by StatusBadge component.
 */
export const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent'> = {
  active: 'success',
  inactive: 'warning',
  archived: 'default',
  draft: 'default',
  sent: 'info',
  viewed: 'info',
  accepted: 'success',
  declined: 'danger',
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
  completed: 'success',
  published: 'success',
  unpublished: 'default',
};

/**
 * Pagination helper to calculate start and end items.
 */
export function getPaginationInfo(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
): { startItem: number; endItem: number } {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  return { startItem, endItem };
}

/**
 * Generate page numbers for pagination display.
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxPages = 5
): number[] {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  const halfMax = Math.floor(maxPages / 2);

  if (currentPage <= halfMax + 1) {
    for (let i = 1; i <= maxPages; i++) {
      pages.push(i);
    }
  } else if (currentPage >= totalPages - halfMax) {
    for (let i = totalPages - maxPages + 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    for (let i = currentPage - halfMax; i <= currentPage + halfMax; i++) {
      pages.push(i);
    }
  }

  return pages;
}

/**
 * Filter and search helper.
 */
export interface FilterOptions<T> {
  items: T[];
  searchQuery: string;
  searchFields: (keyof T)[];
  filters?: Record<string, unknown>;
  filterFn?: (item: T, filters: Record<string, unknown>) => boolean;
}

export function filterAndSearch<T>({
  items,
  searchQuery,
  searchFields,
  filters = {},
  filterFn,
}: FilterOptions<T>): T[] {
  const query = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    // Search filter
    if (query) {
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(query);
      });
      if (!matchesSearch) return false;
    }

    // Custom filter function
    if (filterFn && !filterFn(item, filters)) {
      return false;
    }

    return true;
  });
}

/**
 * Get color class for a given status (legacy support).
 */
export function getStatusColorClass(status: string): string {
  const statusLower = status.toLowerCase();

  if (statusLower === 'active' || statusLower === 'paid' || statusLower === 'completed' || statusLower === 'accepted' || statusLower === 'published') {
    return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
  }

  if (statusLower === 'archived' || statusLower === 'unpublished') {
    return 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400';
  }

  if (statusLower === 'inactive' || statusLower === 'pending' || statusLower === 'overdue') {
    return 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300';
  }

  if (statusLower === 'declined' || statusLower === 'cancelled') {
    return 'bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-300';
  }

  return 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400';
}
