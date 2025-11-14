import { useState, useEffect, useMemo } from 'react';
import { cls } from '../lib/utils';
import { Pressable } from './Atoms';
import type { AuthUser } from '../lib/auth';
import type { UserProfile, CoinTransaction } from '../lib/gamification';
import { updateUserProfile, getCoinTransactions } from '../lib/gamification';
import { Mon, SPRITE, SPRITE_SHINY } from '../lib/pokemon';

interface ProfilePageProps {
  user: AuthUser;
  userProfile: UserProfile;
  onBack: () => void;
  onProfileUpdate: (profile: UserProfile) => void;
  ratings: Record<number, number>;
  mons: Mon[];
  goToDex: (dex: number) => void;
}

type TabType = 'overview' | 'stats' | 'history' | 'settings';

export function ProfilePage({ 
  user, 
  userProfile, 
  onBack, 
  onProfileUpdate,
  ratings,
  mons,
  goToDex
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile.display_name || user.email || '');
  const [savingName, setSavingName] = useState(false);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Load transactions when history tab is opened
  useEffect(() => {
    if (activeTab === 'history' && transactions.length === 0) {
      setLoadingTransactions(true);
      getCoinTransactions(user.id).then((txs) => {
        setTransactions(txs);
        setLoadingTransactions(false);
      });
    }
  }, [activeTab, user.id]);

  // Calculate stats from ratings
  const stats = useMemo(() => {
    const ratingEntries = Object.entries(ratings);
    const validRatings = ratingEntries.filter(([_, score]) => score > 0);
    
    if (validRatings.length === 0) {
      return {
        totalRated: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        favorites: [],
        typeBreakdown: {},
        scoreDistribution: [0, 0, 0, 0, 0]
      };
    }

    const scores = validRatings.map(([_, score]) => score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Find favorite Pokémon (top 6 by score)
    const favorites = validRatings
      .map(([dex, score]) => ({
        dex: Math.abs(Number(dex)),
        score,
        isShiny: Number(dex) < 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // Type breakdown
    const typeBreakdown: Record<string, { count: number; avgScore: number }> = {};
    validRatings.forEach(([dex, score]) => {
      const mon = mons.find(m => m.dex === Math.abs(Number(dex)));
      if (mon) {
        mon.types.forEach(type => {
          if (!typeBreakdown[type]) {
            typeBreakdown[type] = { count: 0, avgScore: 0 };
          }
          typeBreakdown[type].count++;
          typeBreakdown[type].avgScore += score;
        });
      }
    });
    Object.keys(typeBreakdown).forEach(type => {
      typeBreakdown[type].avgScore /= typeBreakdown[type].count;
    });

    // Score distribution (1-20, 21-40, 41-60, 61-80, 81-100)
    const scoreDistribution = [0, 0, 0, 0, 0];
    scores.forEach(score => {
      if (score <= 20) scoreDistribution[0]++;
      else if (score <= 40) scoreDistribution[1]++;
      else if (score <= 60) scoreDistribution[2]++;
      else if (score <= 80) scoreDistribution[3]++;
      else scoreDistribution[4]++;
    });

    return {
      totalRated: validRatings.length,
      avgScore: Math.round(avgScore * 10) / 10,
      highestScore,
      lowestScore,
      favorites,
      typeBreakdown,
      scoreDistribution
    };
  }, [ratings, mons]);

  // Level progress
  const XP_PER_LEVEL = 100;
  const currentLevelXP = (userProfile.level - 1) * XP_PER_LEVEL;
  const nextLevelXP = userProfile.level * XP_PER_LEVEL;
  const xpInLevel = userProfile.xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const levelProgress = (xpInLevel / xpNeeded) * 100;

  async function handleSaveName() {
    if (!displayName.trim()) return;
    setSavingName(true);
    const success = await updateUserProfile(user.id, { display_name: displayName.trim() });
    if (success) {
      onProfileUpdate({ ...userProfile, display_name: displayName.trim() });
      setEditingName(false);
    }
    setSavingName(false);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }

  const topTypes = useMemo(() => {
    return Object.entries(stats.typeBreakdown)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  }, [stats.typeBreakdown]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-800 via-red-800 to-rose-950 text-white">
      <div className="sticky top-0 z-30 bg-[#C62828] border-b border-[#E0E0E0] shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="btn btn-ghost btn-pill px-3 py-1.5 text-sm"
            aria-label="Go back"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="dex-panel p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E53935] to-[#C62828] flex items-center justify-center text-4xl border-4 border-white shadow-lg">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold">{(displayName || user.email || '?').slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#2979FF] text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow">
                Lvl {userProfile.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white text-[#2C2C2C] border border-[#E0E0E0] text-sm"
                    placeholder="Display name"
                    maxLength={30}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={savingName || !displayName.trim()}
                    className="btn btn-accent btn-pill text-xs px-3 py-1.5"
                  >
                    {savingName ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setDisplayName(userProfile.display_name || user.email || '');
                    }}
                    className="btn btn-ghost btn-pill text-xs px-3 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-white">{userProfile.display_name || user.email}</h2>
                  <button
                    onClick={() => setEditingName(true)}
                    className="text-xs text-rose-200 hover:text-white"
                    title="Edit name"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <div className="text-sm text-rose-200/80 mb-3">{user.email}</div>

              {/* Level Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-rose-200/80 mb-1">
                  <span>Level {userProfile.level}</span>
                  <span>{xpInLevel} / {xpNeeded} XP</span>
                </div>
                <div className="h-2 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(levelProgress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(41,121,255,0.2)] text-[#90CAF9]">
                  <span>🪙</span>
                  <span className="font-bold">{userProfile.coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(76,175,80,0.2)] text-[#A5D6A7]">
                  <span>⭐</span>
                  <span className="font-bold">{userProfile.total_ratings} ratings</span>
                </div>
                {userProfile.streak_days > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(255,152,0,0.2)] text-[#FFCC80]">
                    <span>🔥</span>
                    <span className="font-bold">{userProfile.streak_days}d streak</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/20 pb-2">
          {(['overview', 'stats', 'history', 'settings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cls(
                'px-4 py-2 rounded-t-lg text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-white text-[#C62828]'
                  : 'text-rose-200 hover:text-white hover:bg-white/10'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Daily Progress */}
            <div className="dex-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Daily Progress</h3>
              <div className="flex justify-between text-xs text-rose-200/80 mb-2">
                <span>Ratings today</span>
                <span>{userProfile.ratings_today} / 50</span>
              </div>
              <div className="h-3 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-[#2979FF] to-[#1976D2] rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((userProfile.ratings_today / 50) * 100, 100)}%` }}
                />
              </div>
              {userProfile.ratings_today < 50 && (
                <p className="text-xs text-rose-200/60 mt-2">
                  Rate {50 - userProfile.ratings_today} more Pokémon today to earn coins! (10 coins each + streak bonus)
                </p>
              )}
              {userProfile.ratings_today >= 50 && (
                <p className="text-xs text-rose-200/60 mt-2">
                  Daily limit reached! Come back tomorrow for more coins.
                </p>
              )}
            </div>

            {/* Favorite Pokémon */}
            {stats.favorites.length > 0 && (
              <div className="dex-panel p-4">
                <h3 className="text-sm font-bold text-white mb-3">Favorite Pokémon</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {stats.favorites.map(({ dex, score, isShiny }) => {
                    const mon = mons.find(m => m.dex === dex);
                    if (!mon) return null;
                    return (
                      <button
                        key={`${dex}-${isShiny}`}
                        onClick={() => goToDex(dex)}
                        className="relative group cursor-pointer"
                      >
                        <div className="aspect-square bg-white/10 rounded-lg p-2 flex flex-col items-center justify-center hover:bg-white/20 transition-colors border border-white/20">
                          <img 
                            src={isShiny ? SPRITE_SHINY(mon.dex) : SPRITE(mon.dex)} 
                            alt={mon.name}
                            className="w-full h-auto pixelated"
                          />
                          {isShiny && (
                            <span className="absolute top-1 right-1 text-xs" title="Shiny">✨</span>
                          )}
                        </div>
                        <div className="text-[10px] text-center text-rose-200 mt-1 truncate">{mon.name}</div>
                        <div className="text-[10px] text-center text-[#FFC107] font-bold">{score}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="dex-panel p-4">
                <div className="text-xs text-rose-200/60 mb-1">Total Rated</div>
                <div className="text-2xl font-bold text-white">{stats.totalRated}</div>
              </div>
              <div className="dex-panel p-4">
                <div className="text-xs text-rose-200/60 mb-1">Average Score</div>
                <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
              </div>
              <div className="dex-panel p-4">
                <div className="text-xs text-rose-200/60 mb-1">Highest Score</div>
                <div className="text-2xl font-bold text-[#4CAF50]">{stats.highestScore}</div>
              </div>
              <div className="dex-panel p-4">
                <div className="text-xs text-rose-200/60 mb-1">Total Coins Earned</div>
                <div className="text-2xl font-bold text-[#FFC107]">{userProfile.coins.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Type Preferences */}
            {topTypes.length > 0 && (
              <div className="dex-panel p-4">
                <h3 className="text-sm font-bold text-white mb-3">Top Types</h3>
                <div className="space-y-2">
                  {topTypes.map(([type, data]) => (
                    <div key={type}>
                      <div className="flex justify-between text-xs text-rose-200/80 mb-1">
                        <span className="font-medium">{type}</span>
                        <span>{data.count} rated (avg: {Math.round(data.avgScore * 10) / 10})</span>
                      </div>
                      <div className="h-2 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20">
                        <div 
                          className={`h-full rounded-full type-${type}`}
                          style={{ width: `${(data.count / stats.totalRated) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score Distribution */}
            <div className="dex-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Score Distribution</h3>
              <div className="space-y-2">
                {['1-20', '21-40', '41-60', '61-80', '81-100'].map((range, idx) => (
                  <div key={range}>
                    <div className="flex justify-between text-xs text-rose-200/80 mb-1">
                      <span>{range}</span>
                      <span>{stats.scoreDistribution[idx]} Pokémon</span>
                    </div>
                    <div className="h-2 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[#E53935] to-[#F06292]"
                        style={{ width: `${(stats.scoreDistribution[idx] / stats.totalRated) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements Preview */}
            <div className="dex-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.totalRated >= 10 && (
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-2xl mb-1">🎯</div>
                    <div className="text-[10px] text-rose-200">First 10</div>
                  </div>
                )}
                {stats.totalRated >= 50 && (
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-2xl mb-1">⭐</div>
                    <div className="text-[10px] text-rose-200">Half Century</div>
                  </div>
                )}
                {stats.totalRated >= 100 && (
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-2xl mb-1">💯</div>
                    <div className="text-[10px] text-rose-200">Centurion</div>
                  </div>
                )}
                {userProfile.streak_days >= 7 && (
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-2xl mb-1">🔥</div>
                    <div className="text-[10px] text-rose-200">Week Streak</div>
                  </div>
                )}
                {stats.highestScore >= 95 && (
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-2xl mb-1">💖</div>
                    <div className="text-[10px] text-rose-200">True Love</div>
                  </div>
                )}
                {userProfile.level >= 5 && (
                  <div className="text-center p-3 bg-white/10 rounded-lg border border-white/20">
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-[10px] text-rose-200">Level 5</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="dex-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Recent Transactions</h3>
              {loadingTransactions ? (
                <div className="text-center py-8 text-rose-200/60 text-sm">Loading...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-rose-200/60 text-sm">No transactions yet</div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div className="flex-1">
                        <div className="text-sm text-white">{tx.description || tx.transaction_type}</div>
                        <div className="text-xs text-rose-200/60">{formatDate(tx.created_at)}</div>
                      </div>
                      <div className={cls(
                        'text-sm font-bold',
                        tx.amount > 0 ? 'text-[#4CAF50]' : 'text-[#F44336]'
                      )}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="dex-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Account</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-rose-200/60 mb-1">User ID</div>
                  <div className="text-white font-mono text-xs break-all">{user.id}</div>
                </div>
                <div>
                  <div className="text-xs text-rose-200/60 mb-1">Email</div>
                  <div className="text-white">{user.email}</div>
                </div>
                <div>
                  <div className="text-xs text-rose-200/60 mb-1">Joined</div>
                  <div className="text-white">{new Date(userProfile.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="dex-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Preferences</h3>
              <p className="text-xs text-rose-200/60">More settings coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
