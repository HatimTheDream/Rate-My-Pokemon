import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export function ToastContainer({ toasts, onDismiss }) {
    return (_jsx("div", { className: "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none", "aria-live": "polite", "aria-atomic": "true", children: toasts.map((toast) => (_jsx(ToastItem, { toast: toast, onDismiss: onDismiss }, toast.id))) }));
}
function ToastItem({ toast, onDismiss }) {
    const [isExiting, setIsExiting] = useState(false);
    useEffect(() => {
        const duration = toast.duration || 4000;
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300); // Wait for animation
        }, duration);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);
    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };
    const typeStyles = {
        success: 'bg-[#D4F4DD] border-[#A3E6B8] text-[#1B5E20]',
        error: 'bg-[#FFE5E5] border-[#FFB8B8] text-[#C62828]',
        info: 'bg-[#E3F2FD] border-[#90CAF9] text-[#1565C0]',
    };
    const icons = {
        success: '✓',
        error: '⚠',
        info: 'ⓘ',
    };
    return (_jsxs("div", { role: toast.type === 'error' ? 'alert' : 'status', className: `
        pointer-events-auto
        ${typeStyles[toast.type]}
        px-4 py-3 rounded-lg border-2 shadow-md
        flex items-center gap-3 min-w-[280px] max-w-[420px]
        transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `, children: [_jsx("span", { className: "text-lg font-bold flex-shrink-0", "aria-hidden": "true", children: icons[toast.type] }), _jsx("span", { className: "text-sm font-medium flex-1", children: toast.message }), _jsx("button", { onClick: handleDismiss, className: "flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity", "aria-label": "Dismiss notification", children: _jsx("svg", { width: "16", height: "16", viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "2", children: _jsx("path", { d: "M12 4L4 12M4 4l8 8" }) }) })] }));
}
// Hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState([]);
    const showToast = (message, type = 'info', duration) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    };
    const dismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    return {
        toasts,
        showToast,
        dismissToast,
        success: (message, duration) => showToast(message, 'success', duration),
        error: (message, duration) => showToast(message, 'error', duration),
        info: (message, duration) => showToast(message, 'info', duration),
    };
}
