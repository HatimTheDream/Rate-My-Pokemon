import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Pressable } from './Atoms';
export function Toolbar({ q, setQ, user, userProfile, userLoading, onOpenAuth, onSignOut, onOpenProfile, onOpenShop }) {
    const inputRef = useRef(null);
    const [qLocal, setQLocal] = useState(q);
    const debounceRef = useRef(null);
    // Keep local state in sync if parent resets query
    useEffect(() => { setQLocal(q); }, [q]);
    // Debounce updates to parent query
    useEffect(() => {
        if (debounceRef.current)
            window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setQ(qLocal);
        }, 300);
        return () => {
            if (debounceRef.current)
                window.clearTimeout(debounceRef.current);
        };
    }, [qLocal]);
    // Keyboard shortcut: '/' focuses the search
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === '/') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    const dailyProgress = userProfile
        ? Math.min((userProfile.ratings_today / 50) * 100, 100)
        : 0;
    return (_jsx("div", { className: "sticky top-0 z-30 bg-[#C62828] border-b border-[#E0E0E0] shadow-sm", children: _jsx("div", { className: "header", children: _jsxs("div", { className: "bar", children: [_jsx("div", { className: "search-wrap", children: _jsx("input", { ref: inputRef, value: qLocal, onChange: (e) => setQLocal(e.target.value), placeholder: "Search name or #", "aria-label": "Search", className: "search w-full h-11 px-3 rounded-[10px] text-sm bg-white text-[#2C2C2C] placeholder:text-[#666666] border border-[#E0E0E0] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(229,57,53,0.25)]" }) }), user && userProfile && (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: onOpenShop, className: "btn btn-pill btn-secondary text-xs px-3 py-1 font-bold flex items-center gap-1.5", title: "Open Shop", children: [_jsx("span", { className: "text-base", children: "\uD83E\uDE99" }), _jsx("span", { children: userProfile.coins.toLocaleString() })] }), _jsxs("div", { className: "hidden md:flex items-center gap-2 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(41,121,255,0.12)] text-[#2979FF] border border-[#2979FF]/30", children: [_jsx("span", { className: "text-sm", children: "\u26A1" }), _jsxs("span", { className: "font-medium", children: ["Lvl ", userProfile.level] })] }), _jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-white text-[#2C2C2C] border border-[#E0E0E0] shadow-sm", title: `${userProfile.ratings_today}/50 ratings today`, children: [_jsx("span", { className: "text-sm", children: "\uD83C\uDFAF" }), _jsxs("span", { className: "font-medium", children: [userProfile.ratings_today, "/50"] })] }), userProfile.streak_days > 0 && (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(229,57,53,0.12)] text-[#E53935] border border-[#E53935]/30", children: [_jsx("span", { className: "text-sm", children: "\uD83D\uDD25" }), _jsxs("span", { className: "font-medium", children: [userProfile.streak_days, "d"] })] }))] })] })), _jsx("div", { className: "flex items-center", children: userLoading ? (_jsx("div", { className: "w-10 h-10 rounded-full bg-white border border-[#E0E0E0] shadow-sm animate-pulse", "aria-label": "Loading user" })) : user ? (_jsx("div", { className: "relative", children: _jsxs("details", { className: "group", children: [_jsxs("summary", { className: "list-none btn btn-ghost btn-pill px-2 py-1 flex items-center gap-2", "aria-haspopup": "menu", children: [_jsx("span", { className: "w-7 h-7 rounded-full overflow-hidden bg-white border border-[#E0E0E0] flex items-center justify-center", children: user.avatarUrl ? (_jsx("img", { src: user.avatarUrl, alt: "Avatar", className: "w-full h-full object-cover" })) : (_jsx("span", { className: "text-[11px] text-[#2C2C2C]", children: (user.email || '?').slice(0, 1).toUpperCase() })) }), _jsx("span", { className: "hidden sm:inline text-xs max-w-[160px] truncate text-white", children: user.email })] }), _jsxs("div", { className: "absolute right-0 mt-2 min-w-[220px] p-2 z-40 shadow-lg bg-white border border-[#E0E0E0] rounded-lg", role: "menu", children: [userProfile && (_jsxs("div", { className: "px-2 py-2 border-b border-[#E0E0E0] mb-2", children: [_jsx("div", { className: "text-xs font-medium text-[#2C2C2C] truncate", children: userProfile.display_name || user.email }), _jsxs("div", { className: "text-[11px] text-[#666666] mt-1", children: ["Level ", userProfile.level, " \u2022 ", userProfile.total_ratings, " ratings"] }), dailyProgress < 100 && (_jsxs("div", { className: "mt-2", children: [_jsxs("div", { className: "flex justify-between text-[10px] text-[#666666] mb-1", children: [_jsx("span", { children: "Daily Progress" }), _jsxs("span", { children: [userProfile.ratings_today, "/50"] })] }), _jsx("div", { className: "h-1.5 bg-[#F2F6FA] rounded-full overflow-hidden relative border border-[#E0E0E0]", children: _jsx("div", { className: `h-full bg-[#2979FF] rounded-full transition-all duration-300 absolute left-0 top-0 progress-bar-${Math.floor(dailyProgress / 10) * 10}`, role: "progressbar", "aria-valuenow": dailyProgress, "aria-valuemin": 0, "aria-valuemax": 100, children: _jsxs("span", { className: "sr-only", children: [dailyProgress, "% complete"] }) }) })] }))] })), onOpenProfile && (_jsx("button", { type: "button", className: "w-full text-left btn btn-ghost px-3 py-2 text-sm", onClick: onOpenProfile, role: "menuitem", children: "\uD83D\uDC64 Profile" })), onOpenShop && (_jsx("button", { type: "button", className: "w-full text-left btn btn-ghost px-3 py-2 text-sm", onClick: onOpenShop, role: "menuitem", children: "\uD83C\uDFEA Shop" })), _jsx("button", { type: "button", className: "w-full text-left btn btn-ghost px-3 py-2 mt-1 text-sm", onClick: onSignOut, role: "menuitem", children: "\uD83D\uDEAA Sign Out" })] })] }) })) : (_jsx(Pressable, { as: "button", onClick: onOpenAuth, className: "btn btn-accent btn-pill signin-btn text-xs px-4", children: "Sign In" })) })] }) }) }));
}
