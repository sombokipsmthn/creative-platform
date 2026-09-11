'use client';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: AdminPaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="admin-pagination">
      <div className="text-xs text-[var(--color-text-muted)]">
        Showing {startItem} to {endItem} of {totalItems} items
      </div>

      <div className="admin-pagination-pages">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="ui-button ui-button-secondary ui-button-sm"
          aria-label="Previous page"
        >
          ← Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
          if (page > totalPages) return null;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={page === currentPage ? 'admin-pagination-current' : 'ui-button ui-button-secondary ui-button-sm'}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ui-button ui-button-secondary ui-button-sm"
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
