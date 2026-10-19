'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface Props { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number; onPageChange: (page: number) => void }
export default function AdminPagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: Props) {
  if (totalItems <= 0 || totalPages <= 1) return totalItems > 0 ? <p className="admin-result-count">{totalItems} result{totalItems === 1 ? '' : 's'}</p> : null;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index).filter(page => page <= totalPages);
  return <nav className="admin-pagination" aria-label="Pagination"><span className="admin-result-count">Showing {start}–{end} of {totalItems}</span><div className="admin-pagination-controls"><Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}><ChevronLeft aria-hidden="true" />Previous</Button>{pages.map(page => <Button key={page} variant={page === currentPage ? 'default' : 'outline'} size="sm" onClick={() => onPageChange(page)} aria-current={page === currentPage ? 'page' : undefined} aria-label={`Go to page ${page}`}>{page}</Button>)}<Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next<ChevronRight aria-hidden="true" /></Button></div></nav>;
}
