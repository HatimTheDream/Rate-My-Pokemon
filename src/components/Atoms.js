import { jsx as _jsx } from "react/jsx-runtime";
import React, { useRef } from 'react';
import { cls } from '../lib/utils';
import { TYPE_COLORS } from '../lib/pokemon';
export function Star({ filled = false, onClick }) {
    return (_jsx("button", { type: "button", "aria-label": filled ? 'rating-star-filled' : 'rating-star', onClick: onClick, className: cls('w-6 h-6 flex items-center justify-center rounded-md relative transition-all', 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2979FF]', 'hover:scale-[1.08] active:scale-90', filled ? 'text-[#FFB74D] drop-shadow-[0_0_6px_rgba(255,183,77,0.5)]' : 'text-[#B0BEC5]'), children: _jsx("span", { className: "text-lg leading-none select-none", children: "\u2605" }) }));
}
export function Stars10({ value = 0, onChange, disabled = false }) {
    const [hoverValue, setHoverValue] = React.useState(null);
    const handleKeyDown = (e, currentValue) => {
        if (disabled)
            return;
        if (e.key === 'ArrowRight' && currentValue < 10) {
            e.preventDefault();
            onChange(currentValue + 1);
        }
        else if (e.key === 'ArrowLeft' && currentValue > 1) {
            e.preventDefault();
            onChange(currentValue - 1);
        }
        else if (e.key === 'Home') {
            e.preventDefault();
            onChange(1);
        }
        else if (e.key === 'End') {
            e.preventDefault();
            onChange(10);
        }
        else if (e.key >= '0' && e.key <= '9') {
            const num = parseInt(e.key);
            if (num >= 1 && num <= 10) {
                e.preventDefault();
                onChange(num);
            }
        }
    };
    const displayValue = hoverValue ?? value;
    return (_jsx("div", { className: "flex gap-1.5", role: "group", "aria-label": `Rating: ${value} out of 10 stars`, onMouseLeave: () => setHoverValue(null), children: Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (_jsx("button", { type: "button", disabled: disabled, onClick: () => !disabled && onChange(n), onMouseEnter: () => !disabled && setHoverValue(n), onKeyDown: (e) => handleKeyDown(e, n), "aria-label": `Rate ${n} out of 10`, "aria-pressed": n === value, className: cls('w-8 h-8 flex items-center justify-center rounded-md relative transition-all', 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2979FF]', !disabled && 'hover:scale-110 active:scale-95 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', n <= displayValue
                ? 'text-[#FFB74D] drop-shadow-[0_0_8px_rgba(255,183,77,0.6)]'
                : 'text-[#B0BEC5]'), children: _jsx("span", { className: "text-2xl leading-none select-none", children: "\u2605" }) }, n))) }));
}
export function TypeBadge({ type, compact = false }) {
    const t = (type || '').toUpperCase();
    const clsType = TYPE_COLORS[t] ? `type-${t}` : 'type-default';
    return _jsx("span", { className: cls('badge badge-vibrant select-none', clsType, compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'), children: type });
}
export function Pressable({ as: Comp = 'div', className, onClick, onKeyDown, tabIndex, children, }) {
    const ref = useRef(null);
    const lastTouch = useRef(0);
    function onTouchEnd(e) {
        if (!onClick)
            return;
        const now = Date.now();
        if (now - (lastTouch.current || 0) < 300)
            return;
        lastTouch.current = now;
        e.preventDefault();
        e.stopPropagation();
        onClick();
    }
    const Any = Comp;
    return (_jsx(Any, { ref: ref, onClick: onClick, onTouchEnd: onTouchEnd, className: cls('relative overflow-hidden touch-manipulation', className), role: onClick ? 'button' : undefined, tabIndex: tabIndex !== undefined ? tabIndex : (onClick ? 0 : undefined), onKeyDown: (e) => {
            if (onKeyDown) {
                onKeyDown(e);
            }
            else if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onClick();
            }
        }, children: children }));
}
export function SkeletonBox({ className }) {
    return _jsx("div", { className: cls('bg-[#EEF2F6] rounded animate-pulse', className) });
}
export function SkeletonLines({ lines = 3 }) {
    return (_jsx("div", { className: "space-y-2", children: Array.from({ length: lines }).map((_, i) => (_jsx("div", { className: "h-3 bg-[#EEF2F6] rounded animate-pulse" }, i))) }));
}
export function Card({ children, onClick, className, onKeyDown, tabIndex }) {
    return (_jsx(Pressable, { as: "div", onClick: onClick, onKeyDown: onKeyDown, tabIndex: tabIndex, className: cls('card card-hover relative', 'transition-all', onClick && 'cursor-pointer', className), children: children }));
}
