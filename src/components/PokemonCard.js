import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { SPRITE, SPRITE_SHINY } from '../lib/pokemon';
import { cls, formatName } from '../lib/utils';
import { Card, SkeletonBox, TypeBadge } from './Atoms';
export function PokemonCard({ mon, shiny, myScore, onOpen, compact = true, }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [srcIndex, setSrcIndex] = useState(0);
    // Build a comprehensive candidate list. Start with preferred format,
    // then fall back to alternatives. Always try both shiny and non-shiny.
    // Memoize so it only changes when mon.dex, shiny, or useSprite changes.
    const candidates = useMemo(() => {
        // Sprite-only strategy: prefer Pokemon Showdown (name-based) then PokeAPI (numeric ID) sprites.
        const baseName = mon.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const showdown = (name) => `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`;
        const showdownShiny = (name) => `https://play.pokemonshowdown.com/sprites/gen5-shiny/${name}.png`;
        const list = [];
        if (shiny) {
            list.push(showdownShiny(baseName));
            list.push(SPRITE_SHINY(mon.dex));
            list.push(showdown(baseName)); // fallback to non-shiny showdown
            list.push(SPRITE(mon.dex)); // fallback to non-shiny PokeAPI
        }
        else {
            list.push(showdown(baseName));
            list.push(SPRITE(mon.dex));
        }
        return list;
    }, [mon.dex, shiny, mon.name]);
    const src = candidates[srcIndex];
    // Reset image state and index when the candidate list changes
    // (which happens when mon.dex, shiny, or useSprite changes)
    useEffect(() => {
        setSrcIndex(0);
        setImgLoaded(false);
        setImgError(false);
    }, [mon.dex, shiny]);
    useEffect(() => {
        // when trying a new src, reset loaded state
        setImgLoaded(false);
        setImgError(false);
    }, [srcIndex]);
    const headColors = useMemo(() => {
        const t1 = mon.types[0];
        const t2 = mon.types[1] || mon.types[0];
        return [t1, t2];
    }, [mon.types]);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen();
        }
    };
    // Calculate display dex (use base dex for megas)
    const displayDex = useMemo(() => {
        if (mon.flags.mega && mon.evoChain.length > 0) {
            return mon.evoChain[mon.evoChain.length - 1];
        }
        return mon.dex;
    }, [mon.dex, mon.flags.mega, mon.evoChain]);
    return (_jsx(Card, { onClick: onOpen, onKeyDown: handleKeyDown, tabIndex: 0, className: "p-0 overflow-hidden group bg-white pokemon-card transition-all", "aria-label": `${formatName(mon.name)} card`, children: _jsxs("div", { className: "relative flex flex-col h-full", children: [_jsx("div", { className: cls("card-head flex flex-col tracking-wide font-semibold bg-white", compact ? "pt-2 pb-1.5" : "pt-2 pb-1.5"), children: _jsxs("div", { className: "flex items-start justify-between w-full", children: [_jsxs("div", { className: "flex flex-col gap-0.5 flex-1", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [!compact && (_jsxs("span", { className: "inline-flex gap-1", children: [_jsx("span", { className: "led led-green" }), _jsx("span", { className: "led led-blue" }), _jsx("span", { className: "led led-amber" })] })), _jsx("span", { className: cls("font-bold", compact ? "text-[11px]" : "text-[13px]"), children: formatName(mon.name) })] }), _jsxs("div", { className: cls("text-[9px] text-[#999999] flex items-center gap-1.5", !compact && "ml-[44px]"), children: [_jsxs("span", { children: ["Gen ", mon.generation] }), _jsx("span", { className: "text-[#D0D0D0]", children: "\u2022" }), _jsx("span", { className: "capitalize", children: mon.region })] })] }), _jsxs("span", { className: cls("text-[#666666] font-mono flex-shrink-0 ml-2", compact ? "text-[9px]" : "text-xs"), children: ["#", String(displayDex).padStart(4, '0')] })] }) }), _jsxs("div", { className: cls("sprite-wrap w-full flex items-start justify-center relative overflow-hidden pt-1", `type-bg-${headColors[0]}`), children: [!imgLoaded && !imgError && _jsx(SkeletonBox, { className: "w-full h-full skeleton-shimmer" }), imgError && (_jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center text-[#E53935] text-[11px]", children: [_jsx("div", { children: "No sprite" }), _jsx("div", { children: "available" })] })), _jsx("img", { onLoad: () => setImgLoaded(true), onError: () => {
                                try {
                                    console.debug('image load failed', mon.name, src);
                                }
                                catch { }
                                if (srcIndex < candidates.length - 1) {
                                    setSrcIndex((i) => i + 1);
                                }
                                else
                                    setImgError(true);
                            }, src: src, alt: `${mon.name} sprite`, loading: "lazy", decoding: "async", width: 128, height: 128, draggable: false, className: cls('h-full object-contain transition-opacity duration-300 ease-out select-none pointer-events-none will-change-transform', imgLoaded && !imgError ? 'opacity-100 scale-100 group-hover:animate-float' : 'opacity-0 scale-95') }, `${src}-${shiny ? 'sh' : 'ns'}-${mon.dex}`), shiny && (_jsx("span", { className: "absolute top-1 right-1 badge badge-shiny shadow text-[9px] tracking-wider", children: "SHINY \u2727" }))] }), _jsx("div", { className: cls("meta pt-2 pb-1"), children: _jsx("div", { className: "types-row flex gap-1 justify-start", children: mon.types.map((t) => (_jsx(TypeBadge, { type: t, compact: compact }, t))) }) }), !compact && (_jsx("div", { className: "px-3 pb-2 text-[10px] uppercase tracking-wide text-[#666666] h-4 flex items-center", children: mon.flags.legendary
                        ? 'Legendary'
                        : mon.flags.mythical
                            ? 'Mythical'
                            : mon.flags.pseudo
                                ? 'Pseudo‑Legendary'
                                : '' })), _jsx("div", { className: cls("card-footer border-t border-[#E0E0E0] bg-white flex items-center justify-between", compact ? "px-3 py-2" : "px-4 py-3"), children: _jsx("div", { className: "flex items-center gap-2 flex-1", children: myScore > 0 ? (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-lg leading-none text-[#FFB74D]", children: "\u2605" }), _jsxs("span", { className: "text-sm font-semibold text-[#2C2C2C]", children: [myScore, "/10"] }), _jsx("span", { className: "text-xs text-[#999999]", children: "Your rating" })] })) : (_jsx("span", { className: "text-xs text-[#999999]", children: "Not rated yet" })) }) })] }) }));
}
