import { useEffect, useMemo, useState } from 'react';
import { Mon, TYPE_COLORS, artUrl, idFromUrl } from '../lib/pokemon';
import { cls, rangeFilter, formatName, getVariantLabel } from '../lib/utils';
import { Card, SkeletonBox, SkeletonLines, Stars10, TypeBadge, Pressable } from './Atoms';
import { PokedexChrome } from './PokedexChrome';
import { EvoTree } from './EvoTree';
import { LineChart } from './LineChart';

export function PokemonPage({
  mon,
  onBack,
  shiny,
  goToDex,
  nameForDex,
  myScore,
  onRate,
  series,
}: {
  mon: Mon;
  onBack: () => void;
  shiny: boolean;
  goToDex: (dex: number) => void;
  nameForDex: (dex: number) => string;
  myScore: number;
  onRate: (n: number) => void;
  series: { t: number; y: number }[];
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [range, setRange] = useState<string>('all');
  const src = artUrl(mon.dex, shiny, true);
  const head = TYPE_COLORS[mon.types[0]] || '#e11d48';
  const levels = mon.evoLevels || (mon.evoChain.length ? [mon.evoChain] : [[mon.dex]]);
  const [pokedexEntry, setPokedexEntry] = useState<string>(mon.pokedex);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const showSkelEntry = loadingEntry || !pokedexEntry || pokedexEntry.length < 3;
  const filteredSeries = useMemo(() => rangeFilter(series, range), [series, range]);
  
  // For mega evolutions, find the base dex number from evolution chain
  const [baseDex, setBaseDex] = useState<number>(mon.dex);
  
  useEffect(() => {
    if (mon.flags.mega && mon.evoChain.length > 0) {
      // Mega evolution's base dex is the last non-mega in the chain
      const lastNonMega = mon.evoChain[mon.evoChain.length - 1];
      setBaseDex(lastNonMega);
    } else {
      setBaseDex(mon.dex);
    }
  }, [mon.dex, mon.flags.mega, mon.evoChain]);

  // Fetch specific Pokédex entry for mega evolutions
  useEffect(() => {
    if (!mon.flags.mega) {
      setPokedexEntry(mon.pokedex);
      return;
    }

    // Hardcoded entries for Mega X/Y variants
    const megaVariantEntries: Record<string, string> = {
      'charizard-mega-x': 'The overwhelming power that fills its entire body causes it to turn black and creates intense blue flames.',
      'charizard-mega-y': 'Its bond with its Trainer is the source of its power. It boasts speed and maneuverability greater than that of a jet fighter.',
      'mewtwo-mega-x': 'Psychic power has augmented its muscles. It has a grip strength of one ton and can sprint a hundred meters in two seconds flat!',
      'mewtwo-mega-y': 'Despite its diminished size, its mental power has grown phenomenally. With a mere thought, it can smash a skyscraper to smithereens.',
    };

    let cancelled = false;
    setLoadingEntry(true);

    (async () => {
      try {
        // Use the pokemon's name to fetch data (works better for megas)
        const pokemonName = mon.name.toLowerCase().replace(/\s+/g, '-');
        
        // Check if we have a hardcoded entry for this specific variant
        if (megaVariantEntries[pokemonName]) {
          if (!cancelled) {
            setPokedexEntry(megaVariantEntries[pokemonName]);
            setLoadingEntry(false);
          }
          return;
        }
        
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        
        if (!pokemonRes.ok) {
          if (!cancelled) {
            setPokedexEntry(mon.pokedex);
            setLoadingEntry(false);
          }
          return;
        }
        
        const pokemonData = await pokemonRes.json();
        const speciesUrl = pokemonData.species?.url;
        
        if (!speciesUrl) {
          if (!cancelled) {
            setPokedexEntry(mon.pokedex);
            setLoadingEntry(false);
          }
          return;
        }

        // Fetch species data which contains flavor text
        const speciesRes = await fetch(speciesUrl);
        if (!speciesRes.ok) {
          if (!cancelled) {
            setPokedexEntry(mon.pokedex);
            setLoadingEntry(false);
          }
          return;
        }

        const speciesData = await speciesRes.json();
        const flavorEntries = speciesData.flavor_text_entries || [];
        
        // Find English flavor text entry, preferably from recent games
        const englishEntries = flavorEntries.filter((entry: any) => entry.language.name === 'en');
        const englishEntry = englishEntries.length > 0 ? englishEntries[englishEntries.length - 1] : null;
        
        if (englishEntry && !cancelled) {
          const cleanedText = String(englishEntry.flavor_text).replace(/\s+/g, ' ').trim();
          setPokedexEntry(cleanedText);
        } else if (!cancelled) {
          setPokedexEntry(mon.pokedex);
        }
        
        if (!cancelled) {
          setLoadingEntry(false);
        }
      } catch (err) {
        console.warn('Failed to fetch mega pokedex entry:', err);
        if (!cancelled) {
          setPokedexEntry(mon.pokedex);
          setLoadingEntry(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mon.name, mon.flags.mega, mon.pokedex]);

  // Always show mega evolutions for any member in the evo chain
  const [megaIds, setMegaIds] = useState<number[]>([]);
  const [megaToDexMap, setMegaToDexMap] = useState<Map<number, number>>(new Map());
  
  useEffect(() => {
    let cancelled = false;
    const stageIds = Array.from(new Set(levels.flat()));
    (async () => {
      try {
        const megaSet = new Set<number>();
        const existing = new Set<number>(stageIds);
        const dexMap = new Map<number, number>();
        
        await Promise.all(
          stageIds.map(async (dex) => {
            try {
              const r = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${dex}`);
              if (!r.ok) return;
              const js = await r.json();
              const vars = js.varieties || [];
              
              // Known Pokémon with official Mega Evolutions
              const validMegaBaseNames = new Set([
                'venusaur', 'charizard', 'blastoise', 'alakazam', 'gengar', 'kangaskhan',
                'pinsir', 'gyarados', 'aerodactyl', 'mewtwo', 'ampharos', 'scizor',
                'heracross', 'houndoom', 'tyranitar', 'blaziken', 'gardevoir', 'mawile',
                'aggron', 'medicham', 'manectric', 'banette', 'absol', 'garchomp',
                'lucario', 'abomasnow', 'beedrill', 'pidgeot', 'slowbro', 'steelix',
                'sceptile', 'swampert', 'sableye', 'sharpedo', 'camerupt', 'altaria',
                'glalie', 'salamence', 'metagross', 'latias', 'latios', 'rayquaza',
                'lopunny', 'gallade', 'audino', 'diancie'
              ]);
              
              const baseName = js.name.toLowerCase();
              
              // Only process if this Pokémon can have Mega Evolutions
              if (!validMegaBaseNames.has(baseName)) {
                return;
              }
              
              for (const v of vars) {
                const nm = (v?.pokemon?.name || '').toLowerCase();
                // Only include variants with 'mega' in name (but not 'gigantamax' or other false positives)
                if (nm.includes('mega') && !nm.includes('gmax') && !nm.includes('gigantamax')) {
                  const vid = idFromUrl(v.pokemon.url || '');
                  if (vid && !existing.has(vid)) {
                    // Verify the pokemon actually exists and has sprites
                    try {
                      const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${nm}`);
                      if (pokemonRes.ok) {
                        const pokemonData = await pokemonRes.json();
                        // Check if it has a front_default sprite
                        if (pokemonData.sprites?.front_default) {
                          megaSet.add(vid);
                          dexMap.set(vid, dex); // Map mega ID to base dex number
                        }
                      }
                    } catch {
                      // If verification fails, skip this variant
                    }
                  }
                }
              }
            } catch {}
          })
        );
        if (!cancelled) {
          setMegaIds(Array.from(megaSet));
          setMegaToDexMap(dexMap);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [levels]);

  const levelsWithMegas = useMemo(() => (megaIds.length ? [...levels, megaIds] : levels), [levels, megaIds]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)]">
      <PokedexChrome onHomeClick={onBack} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="btn btn-secondary px-4 py-2 mb-4 group focus-visible"
          aria-label="Go back"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
        <div className="mt-2 rounded-2xl bg-white border border-[#E0E0E0] shadow-[0_3px_8px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className={cls('dex-bar h-1', `bar-${mon.types[0]}`)} />
          <div className="p-6">
            <div className="grid md:grid-cols-[420px_1fr] gap-6">
              {/* Left: Sprite */}
              <div className={cls('w-full rounded-xl flex items-center justify-center overflow-hidden p-4 border border-[#E0E0E0]', `type-bg-${mon.types[0]}`)}>
                {!imgLoaded && <SkeletonBox className="w-full h-full aspect-square" />}
                <img
                  onLoad={() => setImgLoaded(true)}
                  src={src}
                  alt={`${mon.name} art`}
                  draggable={false}
                  className={cls('sprite-pixel object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)]', imgLoaded ? 'opacity-100' : 'opacity-0')}
                />
              </div>

              {/* Right: Header + Types + Rating + Pokédex Entry */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-semibold tracking-wide text-[#2C2C2C] flex-1">{formatName(mon.name)}</h1>
                    <span className="text-[#666666] font-mono text-lg font-medium flex-shrink-0">#{String(baseDex).padStart(4, '0')}</span>
                  </div>
                  <div className="text-[#666666] text-sm font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="whitespace-nowrap">Gen {mon.generation}</span>
                    <span className="text-[#D0D0D0]">•</span>
                    <span className="capitalize whitespace-nowrap">{mon.region}</span>
                    {getVariantLabel(mon.name) && (
                      <>
                        <span className="text-[#D0D0D0]">•</span>
                        <span className="text-[#FF6B9D] font-semibold whitespace-nowrap">{getVariantLabel(mon.name)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {mon.types.map((t) => (
                    <TypeBadge key={t} type={t} />
                  ))}
                </div>
                {(mon.height !== undefined || mon.weight !== undefined) && (
                  <div className="flex gap-4 text-sm text-[#666666]">
                    {mon.height !== undefined && (
                      <div>
                        <span className="font-medium text-[#2C2C2C]">Height:</span> {mon.height.toFixed(1)} m
                      </div>
                    )}
                    {mon.weight !== undefined && (
                      <div>
                        <span className="font-medium text-[#2C2C2C]">Weight:</span> {mon.weight.toFixed(1)} kg
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-3 border-t border-[#E0E0E0]">
                  <div className="flex flex-col gap-3">
                    <span className="text-xs font-semibold text-[#2C2C2C] uppercase tracking-wide">Rate This Pokémon</span>
                    <div className="flex flex-col gap-2">
                      <Stars10 value={myScore || 0} onChange={onRate} />
                      {myScore > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-[#2C2C2C]">Your rating:</span>{' '}
                          <span className="font-bold text-[#2979FF]">{myScore}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Pokédex Entry */}
                <div className="mt-2 p-4 bg-[#F2F6FA] rounded-lg border border-[#E0E0E0] flex-1 overflow-hidden">
                  <h2 className="text-xs font-semibold text-[#2C2C2C] uppercase tracking-wide mb-2">Pokédex Entry</h2>
                  <div className="text-[#4F5E6B] text-sm leading-relaxed break-words">
                    {showSkelEntry ? <SkeletonLines lines={4} /> : pokedexEntry}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-semibold text-[#2C2C2C] uppercase tracking-wide text-center mb-3">Evolution Chain</h2>
              <div className="flex justify-center">
                <EvoTree levels={levelsWithMegas} goToDex={goToDex} nameForDex={nameForDex} megaToDexMap={megaToDexMap} />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-[#2C2C2C] uppercase tracking-wide">Coolness over time</h2>
                <div className="segmented">
                  {['1d', '1w', '1m', '3m', 'all'].map((k) => (
                    <button
                      key={k}
                      onClick={() => setRange(k)}
                      className={cls('segmented-btn', range === k && 'on')}
                    >
                      {k.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <Card className="p-4">
                <LineChart data={filteredSeries} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
