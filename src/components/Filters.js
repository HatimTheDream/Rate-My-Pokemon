import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ALL_TYPES, GEN_OPTIONS } from '../lib/pokemon';
import { cls } from '../lib/utils';
import { Card } from './Atoms';
import { useMemo } from 'react';
const toAriaBoolean = (value) => value ? "true" : "false";
export function Filters({ typeSet, toggleType, genSet, toggleGen, catSet, toggleCat, mons, stacked = false, }) {
    const rarity = [
        { k: 'regular', label: 'Regular' },
        { k: 'legendary', label: 'Legendary' },
        { k: 'mythical', label: 'Mythical' },
        { k: 'pseudo', label: 'Pseudo' },
        { k: 'mega', label: 'Mega' },
    ];
    const stages = [
        { k: 'stage1', label: 'Stage 1' },
        { k: 'stage2', label: 'Stage 2' },
        { k: 'final', label: 'Stage 3' },
    ];
    // Sorting controls are now in the Sort dialog; Filters only handles filter facets
    // Dynamic cross-filtering: compute counts for each filter option based on OTHER active filters
    const typeCounts = useMemo(() => {
        const counts = {};
        ALL_TYPES.forEach((t) => {
            // Count mons that match this type AND all active gen/cat filters (but not other type filters)
            counts[t] = mons.filter((m) => {
                if (!m.types.includes(t))
                    return false;
                // Apply generation filters
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                // Apply category filters
                if (catSet.size > 0) {
                    const matchesCat = Array.from(catSet).some(c => {
                        if (c === 'regular')
                            return !m.flags.legendary && !m.flags.mythical && !m.flags.pseudo && !m.flags.mega;
                        if (c === 'legendary')
                            return m.flags.legendary;
                        if (c === 'mythical')
                            return m.flags.mythical;
                        if (c === 'pseudo')
                            return m.flags.pseudo;
                        if (c === 'mega')
                            return m.flags.mega;
                        if (c === 'stage1')
                            return !m.flags.mega && m.evoChain.length > 0 && m.evoChain[0] === m.dex;
                        if (c === 'stage2')
                            return !m.flags.mega && m.evoChain.length > 1 && m.evoChain.indexOf(m.dex) === 1;
                        if (c === 'final')
                            return !m.flags.mega && m.evoChain.length > 0 && m.evoChain[m.evoChain.length - 1] === m.dex;
                        return false;
                    });
                    if (!matchesCat)
                        return false;
                }
                return true;
            }).length;
        });
        return counts;
    }, [mons, genSet, catSet]);
    const genCounts = useMemo(() => {
        const counts = {};
        GEN_OPTIONS.forEach((g) => {
            // Count mons that match this gen AND all active type/cat filters (but not other gen filters)
            counts[String(g)] = mons.filter((m) => {
                if (m.generation !== g)
                    return false;
                // Apply type filters
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                // Apply category filters
                if (catSet.size > 0) {
                    const matchesCat = Array.from(catSet).some(c => {
                        if (c === 'regular')
                            return !m.flags.legendary && !m.flags.mythical && !m.flags.pseudo && !m.flags.mega;
                        if (c === 'legendary')
                            return m.flags.legendary;
                        if (c === 'mythical')
                            return m.flags.mythical;
                        if (c === 'pseudo')
                            return m.flags.pseudo;
                        if (c === 'mega')
                            return m.flags.mega;
                        if (c === 'stage1')
                            return !m.flags.mega && m.evoChain.length > 0 && m.evoChain[0] === m.dex;
                        if (c === 'stage2')
                            return !m.flags.mega && m.evoChain.length > 1 && m.evoChain.indexOf(m.dex) === 1;
                        if (c === 'final')
                            return !m.flags.mega && m.evoChain.length > 0 && m.evoChain[m.evoChain.length - 1] === m.dex;
                        return false;
                    });
                    if (!matchesCat)
                        return false;
                }
                return true;
            }).length;
        });
        return counts;
    }, [mons, typeSet, catSet]);
    const catCounts = useMemo(() => {
        // Count mons that match each category AND all active type/gen filters (but not other cat filters)
        const counts = {
            regular: mons.filter((m) => {
                if (m.flags.legendary || m.flags.mythical || m.flags.pseudo || m.flags.mega)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            legendary: mons.filter((m) => {
                if (!m.flags.legendary)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            mythical: mons.filter((m) => {
                if (!m.flags.mythical)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            pseudo: mons.filter((m) => {
                if (!m.flags.pseudo)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            mega: mons.filter((m) => {
                if (!m.flags.mega)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            stage1: mons.filter((m) => {
                if (m.flags.mega)
                    return false;
                if (m.evoChain.length === 0 || m.evoChain[0] !== m.dex)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            stage2: mons.filter((m) => {
                if (m.flags.mega)
                    return false;
                if (m.evoChain.length <= 1 || m.evoChain.indexOf(m.dex) !== 1)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
            final: mons.filter((m) => {
                if (m.flags.mega)
                    return false;
                if (m.evoChain.length === 0 || m.evoChain[m.evoChain.length - 1] !== m.dex)
                    return false;
                if (typeSet.size > 0 && !m.types.some(t => typeSet.has(t)))
                    return false;
                if (genSet.size > 0 && !genSet.has(String(m.generation)))
                    return false;
                return true;
            }).length,
        };
        return counts;
    }, [mons, typeSet, genSet]);
    // active count displayed in SortBar; keep Filters focused
    return (_jsx(Card, { className: "shadow-[0_2px_4px_rgba(0,0,0,0.05)]", children: _jsxs("div", { className: "p-6 text-sm text-[#2C2C2C] filters-wrap", children: [_jsxs("div", { className: cls(stacked ? 'flex flex-col gap-6' : 'grid gap-6 lg:grid-cols-[1.4fr_1fr_1.1fr] items-start'), children: [_jsxs("div", { children: [_jsx("div", { className: "filter-head", children: "Types" }), _jsx("div", { role: "group", "aria-label": "Filter by types", className: "grid grid-cols-3 gap-1.5 type-filter-group", children: ALL_TYPES.map((t) => (
                                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                                    _jsxs("button", { type: "button", "aria-pressed": toAriaBoolean(typeSet.has(t)), onClick: () => toggleType(t), className: cls('category-card badge', `type-${t}`, typeSet.has(t) && 'category-card-on'), title: typeSet.has(t) ? `Remove ${t}` : `Add ${t}`, children: [_jsx("span", { children: t }), _jsx("span", { className: "count-badge", children: typeCounts[t] || 0 })] }, t))) })] }), _jsxs("div", { children: [_jsx("div", { className: "filter-head", children: "Generations" }), _jsx("div", { role: "group", "aria-label": "Filter by generations", className: "grid grid-cols-3 gap-1.5 gen-filter-group", children: GEN_OPTIONS.map((g) => (
                                    // eslint-disable-next-line jsx-a11y/aria-proptypes
                                    _jsxs("button", { type: "button", "aria-pressed": toAriaBoolean(genSet.has(String(g))), onClick: () => toggleGen(String(g)), className: cls('category-card', genSet.has(String(g)) && 'category-card-on'), children: [_jsxs("span", { children: ["Gen ", g] }), _jsx("span", { className: "count-badge", children: genCounts[String(g)] || 0 })] }, g))) })] }), _jsxs("div", { children: [_jsx("div", { className: "filter-head", children: "Rarity" }), _jsx("div", { role: "group", "aria-label": "Filter by rarity", className: "grid grid-cols-3 gap-1.5 cat-filter-group", children: rarity.map(({ k, label }) => (_jsxs("button", { type: "button", "aria-pressed": toAriaBoolean(catSet.has(k)), onClick: () => toggleCat(k), className: cls('category-card', catSet.has(k) && 'category-card-on'), title: label, children: [_jsx("span", { className: "category-label", children: label }), _jsx("span", { className: "count-badge ml-auto", children: catCounts[k] || 0 })] }, k))) })] }), _jsxs("div", { children: [_jsx("div", { className: "filter-head", children: "Stages" }), _jsx("div", { role: "group", "aria-label": "Filter by evolution stage", className: "grid grid-cols-3 gap-1.5 cat-filter-group", children: stages.map(({ k, label }) => (_jsxs("button", { type: "button", "aria-pressed": toAriaBoolean(catSet.has(k)), onClick: () => toggleCat(k), className: cls('category-card', catSet.has(k) && 'category-card-on'), title: label, children: [_jsx("span", { className: "category-label", children: label }), _jsx("span", { className: "count-badge ml-auto", children: catCounts[k] || 0 })] }, k))) })] })] }), (typeSet.size > 0 || genSet.size > 0 || catSet.size > 0) && (_jsx("div", { className: "mt-4 pt-4 border-t border-[#E0E0E0] flex justify-center", children: _jsx("button", { onClick: () => {
                            typeSet.forEach(t => toggleType(t));
                            genSet.forEach(g => toggleGen(g));
                            catSet.forEach(c => toggleCat(c));
                        }, className: "btn btn-secondary text-xs px-4 py-2", children: "Reset filters" }) }))] }) }));
}
