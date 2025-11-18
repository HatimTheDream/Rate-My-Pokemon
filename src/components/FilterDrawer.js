import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { cls } from '../lib/utils';
export function FilterDrawer({ isOpen, onClose, title = 'Filters', children }) {
    useEffect(() => {
        if (isOpen) {
            const onKey = (e) => {
                if (e.key === 'Escape')
                    onClose();
            };
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', onKey);
            return () => {
                window.removeEventListener('keydown', onKey);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen, onClose]);
    return (_jsxs("div", { "aria-hidden": !isOpen, className: cls('fixed inset-0 z-50', isOpen ? 'pointer-events-auto' : 'pointer-events-none'), children: [_jsx("div", { className: cls('absolute inset-0 bg-black/30 transition-opacity', isOpen ? 'opacity-100' : 'opacity-0'), onClick: onClose }), _jsxs("aside", { role: "dialog", "aria-modal": "true", "aria-label": "Filters", className: cls('absolute top-0 right-0 h-full w-[92vw] sm:w-[420px] bg-white shadow-2xl border-l border-[#E0E0E0] flex flex-col', 'transform transition-transform duration-200 ease-out', isOpen ? 'translate-x-0' : 'translate-x-full'), children: [_jsxs("div", { className: "flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[#E0E0E0]", children: [_jsx("h2", { className: "text-sm sm:text-base font-semibold text-[#2C2C2C]", children: title }), _jsx("button", { type: "button", className: "btn btn-ghost btn-pill px-2 py-1 text-xs", onClick: onClose, "aria-label": "Close filters", children: "\u2715" })] }), _jsx("div", { className: "flex-1 overflow-auto p-4 sm:p-5", children: children })] })] }));
}
