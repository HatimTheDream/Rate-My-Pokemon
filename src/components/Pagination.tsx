import { useState, KeyboardEvent } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState('');

  // Generate page numbers to display - always show exactly 5 pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Always show exactly 5 page buttons

    if (totalPages <= maxVisible) {
      // Show all pages if total is 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate the range to show 5 pages centered on current page
      let start = currentPage - 2;
      let end = currentPage + 2;

      // Adjust if we're near the beginning
      if (start < 1) {
        end += (1 - start);
        start = 1;
      }

      // Adjust if we're near the end
      if (end > totalPages) {
        start -= (end - totalPages);
        end = totalPages;
      }

      // Ensure we show exactly 5 pages
      start = Math.max(1, start);
      end = Math.min(totalPages, end);

      // Add ellipsis before if not starting at 1
      if (start > 1) {
        pages.push('...');
      }

      // Add the page numbers
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after if not ending at last page
      if (end < totalPages) {
        pages.push('...');
      }
    }

    return pages;
  };

  const handleInputSubmit = () => {
    const pageNum = parseInt(inputValue, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          {/* First page button */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed"
            title="First page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Previous button */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => (
              page === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-[#666666]">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`pagination-btn ${
                    currentPage === page 
                      ? 'pagination-btn-active' 
                      : 'pagination-btn-number'
                  }`}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Next button */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Last page button */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed"
            title="Last page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Page input */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#666666]">Go to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`1-${totalPages}`}
            className="pagination-input"
          />
          <button
            onClick={handleInputSubmit}
            className="pagination-btn pagination-btn-go"
          >
            Go
          </button>
        </div>
      </div>

      {/* Page info */}
      <div className="text-center mt-3">
        <span className="text-xs text-[#999999]">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
}
