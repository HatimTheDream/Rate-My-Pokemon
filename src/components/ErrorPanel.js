import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cls } from '../lib/utils';
export function ErrorPanel({ error, onRetry, }) {
    if (!error)
        return null;
    return (_jsxs("div", { className: cls('error-panel col-span-full flex flex-col items-center justify-center rounded-xl border border-[#E53935] bg-[#FFE5E4] py-8 px-6'), role: "alert", "aria-live": "assertive", children: [_jsx("div", { className: "text-3xl mb-3", "aria-hidden": true, children: "\u26A0\uFE0F" }), _jsx("h2", { className: "text-sm font-semibold tracking-wide uppercase text-[#E53935] mb-2", children: "Load Error" }), _jsx("p", { className: "text-[#7A1F1D] text-sm mb-4 text-center max-w-md", children: error }), onRetry && (_jsx("button", { type: "button", onClick: onRetry, className: "btn btn-primary text-xs px-4 py-2", children: "Retry" }))] }));
}
