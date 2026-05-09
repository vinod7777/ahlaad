import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage?: (page: number) => void;
  className?: string;
}

/**
 * Reusable pagination controls component
 */
export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPrevPage,
  onNextPage,
  onGoToPage,
  className = '',
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display (show current page and adjacent pages)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center justify-between gap-4 p-4 border-t border-white/10 ${className}`}>
      <div className="text-xs text-white/60 uppercase tracking-wider">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={onPrevPage}
          disabled={currentPage === 1}
          className="p-1.5 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {page === '...' ? (
                <span className="text-white/30 text-xs px-1">...</span>
              ) : (
                <button
                  onClick={() => onGoToPage?.(page as number)}
                  disabled={page === currentPage}
                  className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                    page === currentPage
                      ? 'bg-[#C9A84C] text-[#080614]'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="p-1.5 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
