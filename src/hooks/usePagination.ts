import { useState, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setItemsPerPage: (perPage: number) => void;
  reset: () => void;
}

/**
 * Reusable pagination hook for managing paginated data
 * @param items - Array of items to paginate
 * @param itemsPerPage - Number of items per page (default: 10)
 * @returns Pagination state and control functions
 */
export const usePagination = <T,>(
  items: T[],
  itemsPerPage: number = 10
): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(itemsPerPage);

  const totalPages = useMemo(() => Math.ceil(items.length / perPage), [items.length, perPage]);
  
  // Reset to page 1 if current page exceeds total pages
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, perPage]);

  const goToPage = (page: number) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  const reset = () => {
    setCurrentPage(1);
    setPerPage(itemsPerPage);
  };

  return {
    currentPage,
    itemsPerPage: perPage,
    totalPages,
    totalItems: items.length,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage: setPerPage,
    reset,
  };
};
