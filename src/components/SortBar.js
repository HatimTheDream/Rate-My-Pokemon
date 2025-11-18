import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const toAriaBoolean = (value) => (value ? 'true' : 'false');
export function SortBar({ itemsCount, activeCount, onOpenFilters, onOpenSort, }) {
    return (_jsxs("div", { className: "sticky top-[56px] z-20 bg-white/90 backdrop-blur border border-[#E0E0E0] rounded-xl shadow-sm px-3 sm:px-4 py-3 mb-4 flex flex-wrap items-center gap-3", children: [_jsxs("button", { type: "button", onClick: onOpenFilters, className: "btn btn-secondary px-3 py-1 text-xs", "aria-label": "Open filters", children: ["\u2630 Filters", activeCount > 0 ? ` (${activeCount})` : ''] }), _jsx("button", { type: "button", onClick: onOpenSort, className: "btn btn-secondary px-3 py-1 text-xs", "aria-label": "Open sort and display", children: "\u21C5 Sort" }), _jsxs("div", { className: "ml-auto text-[11px] text-[#666666]", children: [itemsCount.toLocaleString(), " results \u00B7 ", activeCount, " filters"] })] }));
}
