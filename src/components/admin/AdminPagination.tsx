'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="">
      <div className="">
        Showing <span className="">{totalItems > 0 ? startItem : 0}</span> to{' '}
        <span className="">{endItem}</span> of{' '}
        <span className="">{totalItems}</span> results
      </div>

      <div className="">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className=""
        >
          <ChevronLeft className="" />
          <span>Previous</span>
        </Button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = currentPage > 3 ? currentPage - 2 + i : i + 1;
          if (page > totalPages) return null;
          const isActive = page === currentPage;
          return (
            <Button
              key={page}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className=""
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Go to page ${page}`}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className=""
        >
          <span>Next</span>
          <ChevronRight className="" />
        </Button>
      </div>
    </div>
  );
}
