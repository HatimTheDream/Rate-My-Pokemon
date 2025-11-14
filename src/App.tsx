import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getCurrentUser, onAuthStateChange, signInWithGoogle, signOut, type AuthUser } from './lib/auth';
import { getRatingsForUser, getRatingEvents, saveRating, addRatingEvent } from './lib/supabase';
import { getUserProfile, awardCoinsForRating, type UserProfile } from './lib/gamification';
import { bayes, cls, goto, saveScroll, restoreScroll, loadJSON, saveJSON } from './lib/utils';
import { Mon, SEED, streamNationalDex, REGION_OPTIONS } from './lib/pokemon';
import { useHashRoute } from './lib/hooks';
import { PokedexChrome } from './components/PokedexChrome';
import { Toolbar } from './components/Toolbar';
import { Filters } from './components/Filters';
import { SortBar } from './components/SortBar';
import { FilterDrawer } from './components/FilterDrawer';
import { SortDialog } from './components/SortDialog';
import { PokemonCard } from './components/PokemonCard';
import { EmptyState } from './components/EmptyState';
import { ErrorPanel } from './components/ErrorPanel';
import { PokemonPage } from './components/PokemonPage';
import { ProfilePage } from './components/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { Pressable } from './components/Atoms';
import { Pagination } from './components/Pagination';

const ALL_TYPES = Object.keys({
  FIRE: '#F08030',
  WATER: '#6890F0',
  GRASS: '#78C850',
  ELECTRIC: '#F8D030',
  ICE: '#98D8D8',
  FIGHTING: '#C03028',
  POISON: '#A040A0',
  GROUND: '#E0C068',
  FLYING: '#A890F0',
  PSYCHIC: '#F85888',
  BUG: '#A8B820',
  ROCK: '#B8A038',
  GHOST: '#705898',
  DARK: '#705848',
  DRAGON: '#7038F8',
  STEEL: '#B8B8D0',
  FAIRY: '#EE99AC',
  NORMAL: '#A8A878',
});

export default function App() {
  // Redirect to clean domain if on the long Vercel URL
  useEffect(() => {
    if (typeof window !== 'undefined' && 
        window.location.hostname === 'rate-my-pokemon-hatimthedreams-projects.vercel.app') {
      window.location.replace(`https://ratemypokemon.vercel.app${window.location.pathname}${window.location.hash}`);
    }
  }, []);

  const [shiny, setShiny] = useState(false);
  const [showMegas, setShowMegas] = useState(true);
  const [q, setQ] = useState('');
  const [ratings, setRatings] = useState<Record<number, number>>(() => loadJSON('ratings', {}));
  const [ratingEvents, setRatingEvents] = useState<Record<number, { t: number; y: number }[]>>(() =>
    loadJSON('rating_events', {})
  );
  useEffect(() => saveJSON('ratings', ratings), [ratings]);
  useEffect(() => saveJSON('rating_events', ratingEvents), [ratingEvents]);

  const [mons, setMons] = useState<Mon[]>(SEED);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const route = useHashRoute();
  const byDexRef = useRef<Map<number, Mon>>(new Map(SEED.map((m) => [m.dex, m])));

  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [coinNotification, setCoinNotification] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Initialize auth state on mount and listen for changes
  useEffect(() => {
    // Check for existing session on mount
    (async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setUserLoading(false);
      
      if (currentUser) {
        try {
          const userRatings = await getRatingsForUser(currentUser.id);
          setRatings(userRatings);
          
          // Load user profile
          const profile = await getUserProfile(currentUser.id);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user data:', err);
        }
      }
    })();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((authUser) => {
      setUser(authUser);
      setUserLoading(false);

      if (authUser) {
        (async () => {
          try {
            const userRatings = await getRatingsForUser(authUser.id);
            setRatings(userRatings);
            
            // Load user profile
            const profile = await getUserProfile(authUser.id);
            setUserProfile(profile);
          } catch (err) {
            console.error('Failed to load user data:', err);
          }
        })();
      } else {
        setUserProfile(null);
      }
    });

    return unsubscribe;
  }, []);

  async function handleLoadAll() {
    setLoading(true);
    setLoadErr(null);
    try {
      const byDex = byDexRef.current;
      setMons(Array.from(byDex.values()).sort((a, b) => a.dex - b.dex));
      const ctrl = new AbortController();
      await streamNationalDex((batch) => {
        batch.forEach((m) => byDex.set(m.dex, m));
        setMons(Array.from(byDex.values()).sort((a, b) => a.dex - b.dex));
      }, ctrl.signal);
    } catch (e: any) {
      setLoadErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await handleLoadAll();
      } catch {}
    })();
  }, []);

  const [typeSet, setTypeSet] = useState<Set<string>>(new Set());
  const toggleType = (t: string) => setTypeSet((prev) => {
    const s = new Set(prev);
    s.has(t) ? s.delete(t) : s.add(t);
    return s;
  });
  const [genSet, setGenSet] = useState<Set<string>>(new Set());
  const toggleGen = (g: string) => setGenSet((prev) => {
    const s = new Set(prev);
    s.has(g) ? s.delete(g) : s.add(g);
    return s;
  });
  const [catSet, setCatSet] = useState<Set<string>>(new Set());
  const toggleCat = (c: string) => setCatSet((prev) => {
    const s = new Set(prev);
    s.has(c) ? s.delete(c) : s.add(c);
    return s;
  });
  const [sortBy, setSortBy] = useState<string>('dex');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [perPage, setPerPage] = useState<number>(0); // 0 = All (infinite scroll)
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let arr = mons.filter((m) => {
      // Filter out megas if showMegas is false
      if (!showMegas && m.flags.mega) return false;
      
      if (term) {
        const dexStr = String(m.dex);
        const termClean = term.replace(/^#/, '');
        const dexMatch = dexStr === termClean;
        const nameMatch = m.name.toLowerCase().includes(term);
        if (!(dexMatch || nameMatch)) return false;
      }
      if (genSet.size > 0 && !genSet.has(String(m.generation))) return false;
      if (typeSet.size > 0 && !Array.from(typeSet).every((t) => m.types.includes(t))) return false;
      if (catSet.size > 0) {
        const inCat =
          (catSet.has('regular') && !m.flags.legendary && !m.flags.mythical && !m.flags.pseudo && !m.flags.mega) ||
          (catSet.has('legendary') && m.flags.legendary) ||
          (catSet.has('mythical') && m.flags.mythical) ||
          (catSet.has('pseudo') && m.flags.pseudo) ||
          (catSet.has('mega') && m.flags.mega) ||
          (catSet.has('stage1') && m.evoChain.length > 0 && m.evoChain[0] === m.dex && !m.flags.mega) ||
          (catSet.has('stage2') && m.evoChain.length > 1 && m.evoChain.indexOf(m.dex) === 1 && !m.flags.mega) ||
          (catSet.has('final') && m.evoChain.length > 0 && m.evoChain[m.evoChain.length - 1] === m.dex && !m.flags.mega);
        if (!inCat) return false;
      }
      return true;
    });

    // Helper function to get display dex (use base dex for megas)
    const getDisplayDex = (m: Mon) => {
      if (m.flags.mega && m.evoChain.length > 0) {
        return m.evoChain[m.evoChain.length - 1];
      }
      return m.dex;
    };

    switch (sortBy) {
      case 'name':
        arr.sort((a, b) => sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
        );
        break;
      case 'dex':
        arr.sort((a, b) => {
          const aDex = getDisplayDex(a);
          const bDex = getDisplayDex(b);
          if (aDex !== bDex) {
            return sortDirection === 'asc' ? aDex - bDex : bDex - aDex;
          }
          // If same base dex (megas), sort by actual ID to keep them after base form
          return a.dex - b.dex;
        });
        break;
      case 'gen':
        arr.sort((a, b) => {
          const genDiff = a.generation - b.generation;
          if (genDiff !== 0) {
            return sortDirection === 'asc' ? genDiff : -genDiff;
          }
          // Within same gen, use display dex
          const aDex = getDisplayDex(a);
          const bDex = getDisplayDex(b);
          if (aDex !== bDex) {
            return aDex - bDex;
          }
          return a.dex - b.dex;
        });
        break;
      case 'type':
        arr.sort((a, b) => {
          // Sort by primary type, then by dex within each type
          const typeA = (a.types[0] || '').toUpperCase();
          const typeB = (b.types[0] || '').toUpperCase();
          const typeCompare = typeA.localeCompare(typeB);
          if (typeCompare !== 0) {
            return sortDirection === 'asc' ? typeCompare : -typeCompare;
          }
          // Within same type, sort by dex
          const aDex = getDisplayDex(a);
          const bDex = getDisplayDex(b);
          if (aDex !== bDex) {
            return aDex - bDex;
          }
          return a.dex - b.dex;
        });
        break;
      default:
        // Coolness - always descending (best first)
        arr.sort((a, b) => bayes(b.seedAvg, b.seedCount) - bayes(a.seedAvg, a.seedCount));
    }
    return arr;
  }, [q, genSet, typeSet, catSet, sortBy, sortDirection, mons, showMegas]);

  useEffect(() => {
    if (route === '' || route === '/') {
      restoreScroll();
    }
  }, [route]);

  function goHome() {
    goto('/');
  }

  function goDex(dex: number) {
    saveScroll();
    goto(`/pokemon/${dex}`);
  }

  function findMon(dex: number): Mon | undefined {
    return byDexRef.current.get(dex);
  }

  // Reset to page 1 when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [q, genSet, typeSet, catSet, sortBy, perPage]);

  // Infinite scroll state for "All" mode (perPage = 0)
  const [infiniteCount, setInfiniteCount] = useState<number>(60);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    setInfiniteCount(60); // reset when filters change
  }, [q, genSet, typeSet, catSet, sortBy]);
  
  useEffect(() => {
    if (perPage !== 0) return; // Only for infinite scroll mode
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInfiniteCount((v) => v + 60);
          }
        }
      },
      { rootMargin: '600px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [perPage, infiniteCount, filtered.length]);

  // Calculate visible items based on mode
  const totalPages = perPage === 0 ? 1 : Math.ceil(filtered.length / perPage);
  const displayItems = useMemo(() => {
    if (perPage === 0) {
      // Infinite scroll mode
      return filtered.slice(0, infiniteCount);
    }
    // Paginated mode
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, perPage, infiniteCount]);

  function nameForDex(dex: number) {
    return byDexRef.current.get(dex)?.name || `#${dex}`;
  }

  function seriesForDex(dex: number): { t: number; y: number }[] {
    return (ratingEvents[dex] || []).slice().sort((a, b) => a.t - b.t);
  }

  async function rateDex(dex: number, score: number, shinyVariant: boolean) {
    const key = shinyVariant ? -dex : dex;
    setRatings((r) => ({ ...r, [key]: score }));
    setRatingEvents((ev) => {
      const arr = (ev[key] || []).concat([{ t: Date.now(), y: score }]);
      return { ...ev, [key]: arr };
    });
    if (user) {
      try {
        await saveRating(user.id, dex, score, shinyVariant);
        // encode dex sign in events as well
        await addRatingEvent(user.id, shinyVariant ? -dex : dex, score);
        
        // Award coins for rating
        const result = await awardCoinsForRating(user.id);
        if (result.success) {
          // Update profile state
          const updatedProfile = await getUserProfile(user.id);
          setUserProfile(updatedProfile);
          
          // Show coin notification
          setCoinNotification(result.message);
          setTimeout(() => setCoinNotification(null), 3000);
        } else if (result.hitDailyLimit) {
          setCoinNotification(result.message);
          setTimeout(() => setCoinNotification(null), 4000);
        }
      } catch (err) {
        console.error('Failed to save rating:', err);
      }
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
      setAuthError(null);
    } catch (e) {
      console.error('Google sign-in failed:', e);
      setAuthError('Google sign-in was cancelled or failed. Please try again.');
    }
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
  }

  // Profile route
  if (route === '/profile') {
    if (!user || !userProfile) {
      // Redirect to home if not logged in
      goto('/');
      return null;
    }
    return (
      <ProfilePage
        user={user}
        userProfile={userProfile}
        onBack={goHome}
        onProfileUpdate={(profile) => setUserProfile(profile)}
        ratings={ratings}
        mons={mons}
        goToDex={goDex}
      />
    );
  }

  const routeRe = new RegExp('^\\/pokemon\\/(\\d+)$');
  const match = routeRe.exec(route);

  if (match) {
    const dex = Number(match[1]);
    const mon = findMon(dex);
    if (mon) {
      return (
        <PokemonPage
          mon={mon}
          onBack={goHome}
          shiny={shiny}
          goToDex={goDex}
          nameForDex={nameForDex}
          myScore={ratings[dex] || 0}
          onRate={(n) => rateDex(dex, n, shiny)}
          series={seriesForDex(dex)}
        />
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-800 via-red-800 to-rose-950 text-white">
        <PokedexChrome />
        <div className="max-w-4xl mx-auto px-4 py-6">Loading #{dex}…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="dex-noise" />
      <PokedexChrome onHomeClick={goHome} />
      <Toolbar
        q={q}
        setQ={setQ}
        user={user}
        userProfile={userProfile}
        userLoading={userLoading}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenProfile={() => goto('/profile')}
        onOpenShop={() => goto('/shop')}
      />

      {/* Tip Banner */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-900 mb-4">
          <span className="font-semibold">💡 Tip:</span> Click any Pokémon to rate it! Your ratings help build the ultimate coolness ranking.
          {!user && <span> <a onClick={() => setAuthModalOpen(true)} className="underline cursor-pointer font-semibold">Sign in</a> to save ratings across devices.</span>}
        </div>
      </div>

      {/* Top sort bar + Filters button */}
      <div className="max-w-6xl mx-auto px-4">
        {/* compute active filters count locally */}
        <SortBar
          itemsCount={filtered.length}
          activeCount={typeSet.size + genSet.size + catSet.size}
          onOpenFilters={() => setFiltersOpen(true)}
          onOpenSort={() => setSortOpen(true)}
        />
        
        {/* Active Filter Chips */}
        {(typeSet.size > 0 || genSet.size > 0 || catSet.size > 0) && (
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            <span className="text-xs font-semibold text-gray-600 uppercase">Filters:</span>
            {Array.from(typeSet).map((t) => (
              <button
                key={`type-${t}`}
                onClick={() => toggleType(t)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>{t}</span>
                <span className="text-gray-400 hover:text-gray-600">✕</span>
              </button>
            ))}
            {Array.from(genSet).map((g) => (
              <button
                key={`gen-${g}`}
                onClick={() => toggleGen(g)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>Gen {g}</span>
                <span className="text-gray-400 hover:text-gray-600">✕</span>
              </button>
            ))}
            {Array.from(catSet).map((c) => (
              <button
                key={`cat-${c}`}
                onClick={() => toggleCat(c)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="capitalize">{c}</span>
                <span className="text-gray-400 hover:text-gray-600">✕</span>
              </button>
            ))}
            <button
              onClick={() => {
                setTypeSet(new Set());
                setGenSet(new Set());
                setCatSet(new Set());
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className={cls("max-w-6xl mx-auto px-4 pb-10 grid", 
        perPage === 10 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5" :
        perPage === 20 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4" :
        perPage === 50 ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" :
        "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5"
      )}>
        {loadErr && <ErrorPanel error={loadErr} onRetry={handleLoadAll} />}
        {displayItems.map((mon) => (
          <PokemonCard
            key={shiny ? `${mon.id}-shiny` : mon.id}
            mon={mon}
            shiny={shiny}
            myScore={shiny ? (ratings[-mon.id] || 0) : (ratings[mon.id] || 0)}
            onOpen={() => goDex(mon.dex)}
          />
        ))}
        {!loadErr && filtered.length === 0 && (
          <EmptyState
            message="Try adjusting types, generation or category filters, or clear them to see everything again."
            action={
              <button
                type="button"
                onClick={() => {
                  setTypeSet(new Set());
                  setGenSet(new Set());
                  setCatSet(new Set());
                  setQ('');
                }}
                className="btn btn-accent text-xs"
              >
                Clear filters
              </button>
            }
          />
        )}
        {/* Sentinel for infinite scroll (All mode only) */}
        {perPage === 0 && infiniteCount < filtered.length && (
          <div ref={sentinelRef} className="col-span-full h-24 flex items-center justify-center text-xs text-[#666666]">
            Loading more…
          </div>
        )}
      </div>

      {/* Pagination controls (only for paginated modes) */}
      {perPage > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <footer className="py-8 text-center text-[#666666] text-xs">
        Web prototype · Sprites © respective owners.
      </footer>

      {/* Floating Action: Random Pokémon */}
      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 rounded-full w-14 h-14 bg-[#E53935] hover:bg-[#D32F2F] text-white text-2xl shadow-[0_6px_18px_rgba(0,0,0,0.15)] transition-transform hover:scale-110"
        aria-label="Open random Pokémon"
        onClick={() => {
          const list = filtered.length ? filtered : mons;
          if (!list.length) return;
          const r = list[Math.floor(Math.random() * list.length)];
          goDex(r.dex);
        }}
        title="Random Pokémon"
      >
        🎲
      </button>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Slide-out Filters Drawer */}
      <FilterDrawer isOpen={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Filters
          typeSet={typeSet}
          toggleType={toggleType}
          genSet={genSet}
          toggleGen={toggleGen}
          catSet={catSet}
          toggleCat={toggleCat}
          mons={mons}
          stacked
        />
      </FilterDrawer>

      {/* Sort dialog */}
      <SortDialog
        isOpen={sortOpen}
        onClose={() => setSortOpen(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        shiny={shiny}
        setShiny={setShiny}
        showMegas={showMegas}
        setShowMegas={setShowMegas}
        perPage={perPage}
        setPerPage={setPerPage}
      />

      {authError && (
        <div className="fixed bottom-4 right-4 dex-panel px-4 py-3 text-sm shadow-lg border border-[#E0E0E0]/20" role="status">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span className="text-[#E0E0E0]">{authError}</span>
            <button className="btn btn-ghost btn-pill px-2 py-1 text-xs" onClick={() => setAuthError(null)}>Dismiss</button>
          </div>
        </div>
      )}
      
      {/* Coin notification */}
      {coinNotification && (
        <div className="fixed top-20 right-4 bg-white text-[#2C2C2C] px-4 py-3 rounded-lg shadow-[0_6px_18px_rgba(0,0,0,0.15)] text-sm font-bold border border-[#E0E0E0]" role="status">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span>{coinNotification}</span>
          </div>
        </div>
      )}
    </div>
  );
}
