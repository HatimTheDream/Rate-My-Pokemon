import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { TYPE_COLORS, artUrl, idFromUrl } from '../lib/pokemon';
import { cls, rangeFilter, formatName } from '../lib/utils';
import { Card, SkeletonBox, SkeletonLines, Stars10, TypeBadge } from './Atoms';
import { PokedexChrome } from './PokedexChrome';
import { EvoTree } from './EvoTree';
import { LineChart } from './LineChart';
export function PokemonPage({ mon, onBack, shiny, goToDex, nameForDex, myScore, onRate, series, }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [range, setRange] = useState('all');
    const src = artUrl(mon.dex, shiny, true);
    const head = TYPE_COLORS[mon.types[0]] || '#e11d48';
    const levels = mon.evoLevels || (mon.evoChain.length ? [mon.evoChain] : [[mon.dex]]);
    const showSkelEntry = !mon.pokedex || mon.pokedex.length < 3;
    const filteredSeries = useMemo(() => rangeFilter(series, range), [series, range]);
    // For mega evolutions, find the base dex number from evolution chain
    const [baseDex, setBaseDex] = useState(mon.dex);
    useEffect(() => {
        if (mon.flags.mega && mon.evoChain.length > 0) {
            // Mega evolution's base dex is the last non-mega in the chain
            const lastNonMega = mon.evoChain[mon.evoChain.length - 1];
            setBaseDex(lastNonMega);
        }
        else {
            setBaseDex(mon.dex);
        }
    }, [mon.dex, mon.flags.mega, mon.evoChain]);
    // Always show mega evolutions for any member in the evo chain
    const [megaIds, setMegaIds] = useState([]);
    const [megaToDexMap, setMegaToDexMap] = useState(new Map());
    useEffect(() => {
        let cancelled = false;
        const stageIds = Array.from(new Set(levels.flat()));
        (async () => {
            try {
                const megaSet = new Set();
                const existing = new Set(stageIds);
                const dexMap = new Map();
                await Promise.all(stageIds.map(async (dex) => {
                    try {
                        const r = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dex}`);
                        if (!r.ok)
                            return;
                        const js = await r.json();
                        const vars = js.varieties || [];
                        for (const v of vars) {
                            const nm = (v?.pokemon?.name || '').toLowerCase();
                            if (nm.includes('mega')) {
                                const vid = idFromUrl(v.pokemon.url || '');
                                if (vid && !existing.has(vid)) {
                                    megaSet.add(vid);
                                    dexMap.set(vid, dex); // Map mega ID to base dex number
                                }
                            }
                        }
                    }
                    catch { }
                }));
                if (!cancelled) {
                    setMegaIds(Array.from(megaSet));
                    setMegaToDexMap(dexMap);
                }
            }
            catch { }
        })();
        return () => {
            cancelled = true;
        };
    }, [levels]);
    const levelsWithMegas = useMemo(() => (megaIds.length ? [...levels, megaIds] : levels), [levels, megaIds]);
    return (_jsxs("div", { className: "min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]", children: [_jsx(PokedexChrome, { onHomeClick: onBack }), _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [_jsxs("button", { onClick: onBack, className: "btn btn-secondary px-4 py-2 mb-4 group focus-visible", "aria-label": "Go back", children: [_jsx("svg", { className: "w-5 h-5 transition-transform group-hover:-translate-x-1", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }), _jsx("span", { children: "Back" })] }), _jsxs("div", { className: "mt-2 rounded-2xl bg-white border border-[#E0E0E0] shadow-[0_3px_8px_rgba(0,0,0,0.08)] overflow-hidden", children: [_jsx("div", { className: cls('dex-bar h-1', `bar-${mon.types[0]}`) }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "grid md:grid-cols-[420px_1fr] gap-6", children: [_jsxs("div", { className: cls('w-full rounded-xl flex items-center justify-center overflow-hidden p-4 border border-[#E0E0E0]', `type-bg-${mon.types[0]}`), children: [!imgLoaded && _jsx(SkeletonBox, { className: "w-full h-full aspect-square" }), _jsx("img", { onLoad: () => setImgLoaded(true), src: src, alt: `${mon.name} art`, draggable: false, className: cls('sprite-pixel object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]', imgLoaded ? 'opacity-100' : 'opacity-0') })] }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-semibold tracking-wide text-[#2C2C2C]", children: formatName(mon.name) }), _jsxs("div", { className: "text-[#666666] text-sm font-medium mt-1", children: ["#", String(baseDex).padStart(4, '0'), " \u00B7 ", mon.region, " \u00B7 Gen ", mon.generation] })] }), _jsx("div", { className: "flex gap-2 flex-wrap", children: mon.types.map((t) => (_jsx(TypeBadge, { type: t }, t))) }), (mon.height !== undefined || mon.weight !== undefined) && (_jsxs("div", { className: "flex gap-4 text-sm text-[#666666]", children: [mon.height !== undefined && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-[#2C2C2C]", children: "Height:" }), " ", mon.height.toFixed(1), " m"] })), mon.weight !== undefined && (_jsxs("div", { children: [_jsx("span", { className: "font-medium text-[#2C2C2C]", children: "Weight:" }), " ", mon.weight.toFixed(1), " kg"] }))] })), _jsx("div", { className: "pt-3 border-t border-[#E0E0E0]", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("span", { className: "text-xs font-semibold text-[#2C2C2C] uppercase tracking-wide", children: "Rate This Pok\u00E9mon" }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(Stars10, { value: myScore || 0, onChange: onRate }), myScore > 0 && (_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium text-[#2C2C2C]", children: "Your rating:" }), ' ', _jsxs("span", { className: "font-bold text-[#2979FF]", children: [myScore, "/10"] })] }))] })] }) }), _jsxs("div", { className: "mt-2 p-4 bg-[#F2F6FA] rounded-lg border border-[#E0E0E0] flex-1 overflow-hidden", children: [_jsx("h2", { className: "text-xs font-semibold text-[#2C2C2C] uppercase tracking-wide mb-2", children: "Pok\u00E9dex Entry" }), _jsx("div", { className: "text-[#4F5E6B] text-sm leading-relaxed break-words", children: showSkelEntry ? _jsx(SkeletonLines, { lines: 4 }) : mon.pokedex })] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("h2", { className: "text-sm font-semibold text-[#2C2C2C] uppercase tracking-wide text-center mb-3", children: "Evolution Chain" }), _jsx("div", { className: "flex justify-center", children: _jsx(EvoTree, { levels: levelsWithMegas, goToDex: goToDex, nameForDex: nameForDex, megaToDexMap: megaToDexMap }) })] }), _jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h2", { className: "text-sm font-semibold text-[#2C2C2C] uppercase tracking-wide", children: "Coolness over time" }), _jsx("div", { className: "segmented", children: ['1d', '1w', '1m', '3m', 'all'].map((k) => (_jsx("button", { onClick: () => setRange(k), className: cls('segmented-btn', range === k && 'on'), children: k.toUpperCase() }, k))) })] }), _jsx(Card, { className: "p-4", children: _jsx(LineChart, { data: filteredSeries }) })] })] })] })] })] }));
}
