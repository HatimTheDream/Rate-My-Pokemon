import { cls } from '../lib/utils';
import { useEffect, useRef, useState } from 'react';
import { Pressable } from './Atoms';
import type { AuthUser } from '../lib/auth';
import type { UserProfile } from '../lib/gamification';

interface ToolbarProps {
  q: string;
  setQ: (s: string) => void;
  user: AuthUser | null;
  userProfile: UserProfile | null;
  userLoading: boolean;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onOpenProfile?: () => void;
  onOpenShop?: () => void;
}

export function Toolbar({ 
  q, 
  setQ, 
  user, 
  userProfile,
  userLoading, 
  onOpenAuth, 
  onSignOut,
  onOpenProfile,
  onOpenShop 
}: ToolbarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [qLocal, setQLocal] = useState(q);
  const debounceRef = useRef<number | null>(null);

  // Keep local state in sync if parent resets query
  useEffect(() => { setQLocal(q); }, [q]);

  // Debounce updates to parent query
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setQ(qLocal);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [qLocal]);

  // Keyboard shortcut: '/' focuses the search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
    
  return (
  <div className="sticky top-0 z-30 bg-[#C62828] border-b border-[#E0E0E0] shadow-sm">
      <div className="header">
        <div className="bar">
          <div className="search-wrap">
            <input
              ref={inputRef}
              value={qLocal}
              onChange={(e) => setQLocal(e.target.value)}
              placeholder="Search name or #"
              aria-label="Search"
              className="search w-full h-11 px-3 rounded-[10px] text-sm bg-white text-[#2C2C2C] placeholder:text-[#666666] border border-[#E0E0E0] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(229,57,53,0.25)]"
            />
          </div>
        
        {/* Coin display & shop button */}
        {user && userProfile && (
          <>
            <button
              type="button"
              onClick={onOpenShop}
              className="btn btn-pill btn-secondary text-xs px-3 py-1 font-bold flex items-center gap-1.5"
              title="Open Shop"
            >
              <span className="text-base">🪙</span>
              <span>{userProfile.coins.toLocaleString()}</span>
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(41,121,255,0.12)] text-[#2979FF] border border-[#2979FF]/30">
                <span className="text-sm">⚡</span>
                <span className="font-medium">Lvl {userProfile.level}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white text-[#2C2C2C] border border-[#E0E0E0] shadow-sm" title={`${userProfile.ratings_today}/50 ratings today`}>
                <span className="text-sm">🎯</span>
                <span className="font-medium">{userProfile.ratings_today}/50</span>
              </div>
              {userProfile.streak_days > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(229,57,53,0.12)] text-[#E53935] border border-[#E53935]/30">
                  <span className="text-sm">🔥</span>
                  <span className="font-medium">{userProfile.streak_days}d</span>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="flex items-center">
          {userLoading ? (
            <div className="w-10 h-10 rounded-full bg-white border border-[#E0E0E0] shadow-sm animate-pulse" aria-label="Loading user" />
          ) : user ? (
            <div className="relative">
              <details className="group">
                <summary className="list-none btn btn-ghost btn-pill px-2 py-1 flex items-center gap-2" aria-haspopup="menu">
                  <span className="w-7 h-7 rounded-full overflow-hidden bg-white border border-[#E0E0E0] flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] text-[#2C2C2C]">{(user.email || '?').slice(0, 1).toUpperCase()}</span>
                    )}
                  </span>
                  <span className="hidden sm:inline text-xs max-w-[160px] truncate text-white">{user.email}</span>
                </summary>
                <div className="absolute right-0 mt-2 min-w-[220px] p-2 z-40 shadow-lg bg-white border border-[#E0E0E0] rounded-lg" role="menu">
                  {userProfile && (
                    <div className="px-2 py-2 border-b border-[#E0E0E0] mb-2">
                      <div className="text-xs font-medium text-[#2C2C2C] truncate">{userProfile.display_name || user.email}</div>
                      <div className="text-[11px] text-[#666666] mt-1">Level {userProfile.level} • {userProfile.total_ratings} ratings</div>
                      {dailyProgress < 100 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-[#666666] mb-1">
                            <span>Daily Progress</span>
                            <span>{userProfile.ratings_today}/50</span>
                          </div>
                          <div className="h-1.5 bg-[#F2F6FA] rounded-full overflow-hidden relative border border-[#E0E0E0]">
                            <div 
                              className={`h-full bg-[#2979FF] rounded-full transition-all duration-300 absolute left-0 top-0 progress-bar-${Math.floor(dailyProgress / 10) * 10}`}
                              role="progressbar"
                              aria-valuenow={dailyProgress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <span className="sr-only">{dailyProgress}% complete</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {onOpenProfile && (
                    <button
                      type="button"
                      className="w-full text-left btn btn-ghost px-3 py-2 text-sm"
                      onClick={onOpenProfile}
                      role="menuitem"
                    >
                      👤 Profile
                    </button>
                  )}
                  {onOpenShop && (
                    <button
                      type="button"
                      className="w-full text-left btn btn-ghost px-3 py-2 text-sm"
                      onClick={onOpenShop}
                      role="menuitem"
                    >
                      🏪 Shop
                    </button>
                  )}
                  <button
                    type="button"
                    className="w-full text-left btn btn-ghost px-3 py-2 mt-1 text-sm"
                    onClick={onSignOut}
                    role="menuitem"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              </details>
            </div>
          ) : (
            <Pressable as="button" onClick={onOpenAuth} className="btn btn-accent btn-pill signin-btn text-xs px-4">
              Sign In
            </Pressable>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
