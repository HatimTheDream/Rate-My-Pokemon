import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Pagination({ currentPage, totalPages, onPageChange }) {
    const [inputValue, setInputValue] = useState('');
    // Generate page numbers to display - always show exactly 5 pages
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Always show exactly 5 page buttons
        if (totalPages <= maxVisible) {
            // Show all pages if total is 5 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        }
        else {
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
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleInputSubmit();
        }
    };
    return (_jsxs("div", { className: "max-w-6xl mx-auto px-4 pb-10", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => onPageChange(1), disabled: currentPage === 1, className: "pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed", title: "First page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 19l-7-7 7-7m8 14l-7-7 7-7" }) }) }), _jsx("button", { onClick: () => onPageChange(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed", title: "Previous page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) }) }), _jsx("div", { className: "flex items-center gap-1", children: getPageNumbers().map((page, idx) => (page === '...' ? (_jsx("span", { className: "px-2 text-[#666666]", children: "\u2026" }, `ellipsis-${idx}`)) : (_jsx("button", { onClick: () => onPageChange(page), className: `pagination-btn ${currentPage === page
                                        ? 'pagination-btn-active'
                                        : 'pagination-btn-number'}`, children: page }, page)))) }), _jsx("button", { onClick: () => onPageChange(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed", title: "Next page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) }) }), _jsx("button", { onClick: () => onPageChange(totalPages), disabled: currentPage === totalPages, className: "pagination-btn pagination-btn-nav disabled:opacity-40 disabled:cursor-not-allowed", title: "Last page", children: _jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 5l7 7-7 7M5 5l7 7-7 7" }) }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm text-[#666666]", children: "Go to:" }), _jsx("input", { type: "number", min: "1", max: totalPages, value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyPress: handleKeyPress, placeholder: `1-${totalPages}`, className: "pagination-input" }), _jsx("button", { onClick: handleInputSubmit, className: "pagination-btn pagination-btn-go", children: "Go" })] })] }), _jsx("div", { className: "text-center mt-3", children: _jsxs("span", { className: "text-xs text-[#999999]", children: ["Page ", currentPage, " of ", totalPages] }) })] }));
}
