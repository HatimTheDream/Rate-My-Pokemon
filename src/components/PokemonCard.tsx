import { useEffect, useMemo, useState } from 'react';
import { Mon, SPRITE, SPRITE_SHINY } from '../lib/pokemon';
import { cls, formatName } from '../lib/utils';
import { Card, SkeletonBox, Stars10, TypeBadge } from './Atoms';

export function PokemonCard({
  mon,
  shiny,
  myScore,
  onOpen,
  compact = true,
}: {
  mon: Mon;
  shiny: boolean;
  myScore: number;
  onOpen: () => void;
  compact?: boolean;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [srcIndex, setSrcIndex] = useState(0);
  
  // Build a comprehensive candidate list. Start with preferred format,
  // then fall back to alternatives. Always try both shiny and non-shiny.
  // Memoize so it only changes when mon.dex, shiny, or useSprite changes.
  const candidates = useMemo(() => {
    // Sprite-only strategy: prefer Pokemon Showdown (name-based) then PokeAPI (numeric ID) sprites.
    const baseName = mon.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const showdown = (name: string) => `https://play.pokemonshowdown.com/sprites/gen5/${name}.png`;
    const showdownShiny = (name: string) => `https://play.pokemonshowdown.com/sprites/gen5-shiny/${name}.png`;
    const list: string[] = [];
    if (shiny) {
      list.push(showdownShiny(baseName));
      list.push(SPRITE_SHINY(mon.dex));
      list.push(showdown(baseName)); // fallback to non-shiny showdown
      list.push(SPRITE(mon.dex));    // fallback to non-shiny PokeAPI
    } else {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  // Get dynamic color based on score (red -> orange -> yellow -> green)
  const getRatingColor = (score: number): string => {
    if (score <= 0) return '#E6F0FF';
    if (score <= 1) return '#D32F2F'; // Dark red for 0-1
    if (score <= 2) return '#E53935'; // Red for 1-2
    if (score <= 3) return '#EF5350'; // Light red for 2-3
    if (score <= 4) return '#FF5722'; // Deep orange for 3-4
    if (score <= 5) return '#FF7043'; // Orange-red for 4-5
    if (score <= 6) return '#FF9800'; // Orange for 5-6
    if (score <= 7) return '#FFA726'; // Light orange for 6-7
    if (score <= 8) return '#FFC107'; // Amber for 7-8
    if (score <= 9) return '#9CCC65'; // Yellow-green for 8-9
    return '#66BB6A'; // Green for 9-10
  };

  const barColor = useMemo(() => getRatingColor(myScore), [myScore]);

  return (
    <Card 
      onClick={onOpen} 
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className="p-0 overflow-hidden group bg-white pokemon-card transition-all" 
      aria-label={`${formatName(mon.name)} card`}
    >
      <div className="relative flex flex-col h-full">
        <div className={cls(
          "card-head flex flex-col tracking-wide font-semibold bg-white",
          compact ? "pt-2 pb-1.5" : "pt-2 pb-1.5"
        )}>
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col gap-0.5 flex-1">
              <div className="flex items-center gap-1.5">
                {!compact && (
                  <span className="inline-flex gap-1">
                    <span className="led led-green" />
                    <span className="led led-blue" />
                    <span className="led led-amber" />
                  </span>
                )}
                <span className={cls("font-bold", compact ? "text-[11px]" : "text-[13px]")}>{formatName(mon.name)}</span>
              </div>
              <div className={cls("text-[9px] text-[#999999] flex items-center gap-1.5", !compact && "ml-[44px]")}>
                <span>Gen {mon.generation}</span>
                <span className="text-[#D0D0D0]">•</span>
                <span className="capitalize">{mon.region}</span>
              </div>
            </div>
            <span className={cls("text-[#666666] font-mono flex-shrink-0 ml-2", compact ? "text-[9px]" : "text-xs")}>#{String(displayDex).padStart(4, '0')}</span>
          </div>
        </div>
        <div
          className={cls(
            "sprite-wrap w-full flex items-start justify-center relative overflow-hidden pt-1",
            `type-bg-${headColors[0]}`
          )}
        >
          {!imgLoaded && !imgError && <SkeletonBox className="w-full h-full skeleton-shimmer" />}
          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#E53935] text-[11px]">
              <div>No sprite</div>
              <div>available</div>
            </div>
          )}
          <img
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              try { console.debug('image load failed', mon.name, src); } catch {}
              if (srcIndex < candidates.length - 1) {
                setSrcIndex((i) => i + 1);
              } else setImgError(true);
            }}
            key={`${src}-${shiny ? 'sh' : 'ns'}-${mon.dex}`}
            src={src}
            alt={`${mon.name} sprite`}
            loading="lazy"
            decoding="async"
            width={128}
            height={128}
            draggable={false}
            className={cls(
              'h-full object-contain transition-opacity duration-300 ease-out select-none pointer-events-none will-change-transform',
              imgLoaded && !imgError ? 'opacity-100 scale-100 group-hover:animate-float' : 'opacity-0 scale-95'
            )}
          />
          {shiny && (
            <span className="absolute top-1 right-1 badge badge-shiny shadow text-[9px] tracking-wider">SHINY ✧</span>
          )}
        </div>
        <div className={cls("meta pt-2 pb-1")}>
          <div className="types-row flex gap-1 justify-start">
            {mon.types.map((t) => (
              <TypeBadge key={t} type={t} compact={compact} />
            ))}
          </div>
        </div>
        {!compact && (
          <div className="px-3 pb-2 text-[10px] uppercase tracking-wide text-[#666666] h-4 flex items-center">
            {mon.flags.legendary
              ? 'Legendary'
              : mon.flags.mythical
              ? 'Mythical'
              : mon.flags.pseudo
              ? 'Pseudo‑Legendary'
              : ''}
          </div>
        )}
        <div className={cls("card-footer border-t border-[#E0E0E0] bg-white flex items-center justify-between", compact ? "px-3 py-2" : "px-4 py-3")}>
          <div className="flex items-center gap-2 flex-1">
            {compact ? (
              <>
                <div
                  className="flex-1 h-2 rounded-full bg-[#F2F6FA] overflow-hidden border border-[#E0E0E0]"
                  role="progressbar"
                  aria-label="Your rating"
                  aria-valuemin={0}
                  aria-valuemax={10}
                  aria-valuenow={myScore || 0}
                >
                  {myScore > 0 ? (
                    <div 
                      className={cls('h-full transition-all duration-300', `progress-bar-${myScore * 10}`)} 
                      style={{ backgroundColor: barColor }}
                    />
                  ) : (
                    <div className="h-full w-full bg-[#E6F0FF]/40" />
                  )}
                </div>
                <span className="text-[11px] text-[#2C2C2C] font-medium w-12 text-right">
                  {myScore > 0 ? `${(myScore * 10).toFixed(2)}` : 'N/A'}
                </span>
              </>
            ) : (
              <Stars10 value={myScore} onChange={() => {}} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
