import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AuthModal({ isOpen, onClose, onGoogleSignIn, }) {
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-[#1a0f11]/95 border border-black/60 rounded-2xl p-6 max-w-md w-full shadow-lg dex-rim", children: [_jsx("h2", { className: "text-xl font-semibold mb-2", children: "Sign in" }), _jsx("p", { className: "text-sm text-rose-200/80 mb-4", children: "Use your Google account to save your ratings across devices." }), _jsxs("button", { onClick: onGoogleSignIn, className: "btn btn-primary btn-pill w-full", "aria-label": "Sign in with Google", children: [_jsx("span", { "aria-hidden": true, children: "\uD83D\uDFE1" }), _jsx("span", { children: "Continue with Google" })] }), _jsx("button", { onClick: onClose, className: "absolute top-4 right-4 text-rose-200/80 hover:text-rose-100", "aria-label": "Close sign in modal", children: "\u2715" })] }) }));
}
