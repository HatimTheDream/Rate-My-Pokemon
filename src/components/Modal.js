import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    useEffect(() => {
        if (isOpen) {
            // Store the element that had focus before opening
            previousFocusRef.current = document.activeElement;
            // Focus the modal after a brief delay to ensure it's rendered
            setTimeout(() => {
                const firstFocusable = modalRef.current?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                firstFocusable?.focus();
            }, 10);
        }
        else {
            // Return focus to the trigger element when closing
            previousFocusRef.current?.focus();
        }
    }, [isOpen]);
    useEffect(() => {
        if (!isOpen)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        const handleTab = (e) => {
            if (e.key !== 'Tab' || !modalRef.current)
                return;
            const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (e.shiftKey) {
                // Shift+Tab: moving backwards
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            }
            else {
                // Tab: moving forwards
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleTab);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTab);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { ref: modalRef, role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-title", className: `
          relative bg-white rounded-2xl shadow-2xl
          ${maxWidth} w-full
          transform transition-all
          animate-modal-in
        `, children: [_jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]", children: [_jsx("h2", { id: "modal-title", className: "text-lg font-semibold text-[#2C2C2C]", children: title }), _jsx("button", { onClick: onClose, className: "text-[#666666] hover:text-[#2C2C2C] transition-colors p-1 rounded-lg hover:bg-[#F2F6FA]", "aria-label": "Close dialog", children: _jsx("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M15 5L5 15M5 5l10 10" }) }) })] }), _jsx("div", { className: "px-6 py-5", children: children })] }), _jsx("style", { children: `
        @keyframes modal-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out;
        }
      ` })] }));
}
