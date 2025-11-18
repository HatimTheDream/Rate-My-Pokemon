import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { cls } from '../lib/utils';
import { updateUserProfile, getCoinTransactions } from '../lib/gamification';
import { SPRITE, SPRITE_SHINY } from '../lib/pokemon';
export function ProfilePage({ user, userProfile, onBack, onProfileUpdate, ratings, mons, goToDex }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [editingName, setEditingName] = useState(false);
    const [displayName, setDisplayName] = useState(userProfile.display_name || user.email || '');
    const [savingName, setSavingName] = useState(false);
    const [transactions, setTransactions] = useState([]);
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
        const typeBreakdown = {};
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
            if (score <= 20)
                scoreDistribution[0]++;
            else if (score <= 40)
                scoreDistribution[1]++;
            else if (score <= 60)
                scoreDistribution[2]++;
            else if (score <= 80)
                scoreDistribution[3]++;
            else
                scoreDistribution[4]++;
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
        if (!displayName.trim())
            return;
        setSavingName(true);
        const success = await updateUserProfile(user.id, { display_name: displayName.trim() });
        if (success) {
            onProfileUpdate({ ...userProfile, display_name: displayName.trim() });
            setEditingName(false);
        }
        setSavingName(false);
    }
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        if (diffHours < 24)
            return `${diffHours}h ago`;
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    const topTypes = useMemo(() => {
        return Object.entries(stats.typeBreakdown)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
    }, [stats.typeBreakdown]);
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-b from-rose-800 via-red-800 to-rose-950 text-white", children: [_jsx("div", { className: "sticky top-0 z-30 bg-[#C62828] border-b border-[#E0E0E0] shadow-sm", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-3 flex items-center gap-3", children: [_jsx("button", { onClick: onBack, className: "btn btn-ghost btn-pill px-3 py-1.5 text-sm", "aria-label": "Go back", children: "\u2190 Back" }), _jsx("h1", { className: "text-lg font-bold text-white", children: "Profile" })] }) }), _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6", children: [_jsx("div", { className: "dex-panel p-6 mb-6", children: _jsxs("div", { className: "flex items-start gap-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-24 h-24 rounded-full bg-gradient-to-br from-[#E53935] to-[#C62828] flex items-center justify-center text-4xl border-4 border-white shadow-lg", children: user.avatarUrl ? (_jsx("img", { src: user.avatarUrl, alt: "Avatar", className: "w-full h-full rounded-full object-cover" })) : (_jsx("span", { className: "text-white font-bold", children: (displayName || user.email || '?').slice(0, 2).toUpperCase() })) }), _jsxs("div", { className: "absolute -bottom-2 -right-2 bg-[#2979FF] text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow", children: ["Lvl ", userProfile.level] })] }), _jsxs("div", { className: "flex-1", children: [editingName ? (_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("input", { type: "text", value: displayName, onChange: (e) => setDisplayName(e.target.value), className: "flex-1 px-3 py-1.5 rounded-lg bg-white text-[#2C2C2C] border border-[#E0E0E0] text-sm", placeholder: "Display name", maxLength: 30 }), _jsx("button", { onClick: handleSaveName, disabled: savingName || !displayName.trim(), className: "btn btn-accent btn-pill text-xs px-3 py-1.5", children: savingName ? 'Saving...' : 'Save' }), _jsx("button", { onClick: () => {
                                                        setEditingName(false);
                                                        setDisplayName(userProfile.display_name || user.email || '');
                                                    }, className: "btn btn-ghost btn-pill text-xs px-3 py-1.5", children: "Cancel" })] })) : (_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: userProfile.display_name || user.email }), _jsx("button", { onClick: () => setEditingName(true), className: "text-xs text-rose-200 hover:text-white", title: "Edit name", children: "\u270F\uFE0F" })] })), _jsx("div", { className: "text-sm text-rose-200/80 mb-3", children: user.email }), _jsxs("div", { className: "mb-3", children: [_jsxs("div", { className: "flex justify-between text-xs text-rose-200/80 mb-1", children: [_jsxs("span", { children: ["Level ", userProfile.level] }), _jsxs("span", { children: [xpInLevel, " / ", xpNeeded, " XP"] })] }), _jsx("div", { className: "h-2 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20", children: _jsx("div", { className: "h-full bg-gradient-to-r from-[#FFC107] to-[#FF9800] rounded-full transition-all duration-300", style: { width: `${Math.min(levelProgress, 100)}%` } }) })] }), _jsxs("div", { className: "flex gap-3 text-xs", children: [_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(41,121,255,0.2)] text-[#90CAF9]", children: [_jsx("span", { children: "\uD83E\uDE99" }), _jsx("span", { className: "font-bold", children: userProfile.coins.toLocaleString() })] }), _jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(76,175,80,0.2)] text-[#A5D6A7]", children: [_jsx("span", { children: "\u2B50" }), _jsxs("span", { className: "font-bold", children: [userProfile.total_ratings, " ratings"] })] }), userProfile.streak_days > 0 && (_jsxs("div", { className: "flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(255,152,0,0.2)] text-[#FFCC80]", children: [_jsx("span", { children: "\uD83D\uDD25" }), _jsxs("span", { className: "font-bold", children: [userProfile.streak_days, "d streak"] })] }))] })] })] }) }), _jsx("div", { className: "flex gap-2 mb-6 border-b border-white/20 pb-2", children: ['overview', 'stats', 'history', 'settings'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: cls('px-4 py-2 rounded-t-lg text-sm font-medium transition-colors', activeTab === tab
                                ? 'bg-white text-[#C62828]'
                                : 'text-rose-200 hover:text-white hover:bg-white/10'), children: tab.charAt(0).toUpperCase() + tab.slice(1) }, tab))) }), activeTab === 'overview' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Daily Progress" }), _jsxs("div", { className: "flex justify-between text-xs text-rose-200/80 mb-2", children: [_jsx("span", { children: "Ratings today" }), _jsxs("span", { children: [userProfile.ratings_today, " / 50"] })] }), _jsx("div", { className: "h-3 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20", children: _jsx("div", { className: "h-full bg-gradient-to-r from-[#2979FF] to-[#1976D2] rounded-full transition-all duration-300", style: { width: `${Math.min((userProfile.ratings_today / 50) * 100, 100)}%` } }) }), userProfile.ratings_today < 50 && (_jsxs("p", { className: "text-xs text-rose-200/60 mt-2", children: ["Rate ", 50 - userProfile.ratings_today, " more Pok\u00E9mon today to earn coins! (10 coins each + streak bonus)"] })), userProfile.ratings_today >= 50 && (_jsx("p", { className: "text-xs text-rose-200/60 mt-2", children: "Daily limit reached! Come back tomorrow for more coins." }))] }), stats.favorites.length > 0 && (_jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Favorite Pok\u00E9mon" }), _jsx("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-3", children: stats.favorites.map(({ dex, score, isShiny }) => {
                                            const mon = mons.find(m => m.dex === dex);
                                            if (!mon)
                                                return null;
                                            return (_jsxs("button", { onClick: () => goToDex(dex), className: "relative group cursor-pointer", children: [_jsxs("div", { className: "aspect-square bg-white/10 rounded-lg p-2 flex flex-col items-center justify-center hover:bg-white/20 transition-colors border border-white/20", children: [_jsx("img", { src: isShiny ? SPRITE_SHINY(mon.dex) : SPRITE(mon.dex), alt: mon.name, className: "w-full h-auto pixelated" }), isShiny && (_jsx("span", { className: "absolute top-1 right-1 text-xs", title: "Shiny", children: "\u2728" }))] }), _jsx("div", { className: "text-[10px] text-center text-rose-200 mt-1 truncate", children: mon.name }), _jsx("div", { className: "text-[10px] text-center text-[#FFC107] font-bold", children: score })] }, `${dex}-${isShiny}`));
                                        }) })] })), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "dex-panel p-4", children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "Total Rated" }), _jsx("div", { className: "text-2xl font-bold text-white", children: stats.totalRated })] }), _jsxs("div", { className: "dex-panel p-4", children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "Average Score" }), _jsx("div", { className: "text-2xl font-bold text-white", children: stats.avgScore })] }), _jsxs("div", { className: "dex-panel p-4", children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "Highest Score" }), _jsx("div", { className: "text-2xl font-bold text-[#4CAF50]", children: stats.highestScore })] }), _jsxs("div", { className: "dex-panel p-4", children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "Total Coins Earned" }), _jsx("div", { className: "text-2xl font-bold text-[#FFC107]", children: userProfile.coins.toLocaleString() })] })] })] })), activeTab === 'stats' && (_jsxs("div", { className: "space-y-6", children: [topTypes.length > 0 && (_jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Top Types" }), _jsx("div", { className: "space-y-2", children: topTypes.map(([type, data]) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs text-rose-200/80 mb-1", children: [_jsx("span", { className: "font-medium", children: type }), _jsxs("span", { children: [data.count, " rated (avg: ", Math.round(data.avgScore * 10) / 10, ")"] })] }), _jsx("div", { className: "h-2 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20", children: _jsx("div", { className: `h-full rounded-full type-${type}`, style: { width: `${(data.count / stats.totalRated) * 100}%` } }) })] }, type))) })] })), _jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Score Distribution" }), _jsx("div", { className: "space-y-2", children: ['1-20', '21-40', '41-60', '61-80', '81-100'].map((range, idx) => (_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs text-rose-200/80 mb-1", children: [_jsx("span", { children: range }), _jsxs("span", { children: [stats.scoreDistribution[idx], " Pok\u00E9mon"] })] }), _jsx("div", { className: "h-2 bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-white/20", children: _jsx("div", { className: "h-full rounded-full bg-gradient-to-r from-[#E53935] to-[#F06292]", style: { width: `${(stats.scoreDistribution[idx] / stats.totalRated) * 100}%` } }) })] }, range))) })] }), _jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Achievements" }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [stats.totalRated >= 10 && (_jsxs("div", { className: "text-center p-3 bg-white/10 rounded-lg border border-white/20", children: [_jsx("div", { className: "text-2xl mb-1", children: "\uD83C\uDFAF" }), _jsx("div", { className: "text-[10px] text-rose-200", children: "First 10" })] })), stats.totalRated >= 50 && (_jsxs("div", { className: "text-center p-3 bg-white/10 rounded-lg border border-white/20", children: [_jsx("div", { className: "text-2xl mb-1", children: "\u2B50" }), _jsx("div", { className: "text-[10px] text-rose-200", children: "Half Century" })] })), stats.totalRated >= 100 && (_jsxs("div", { className: "text-center p-3 bg-white/10 rounded-lg border border-white/20", children: [_jsx("div", { className: "text-2xl mb-1", children: "\uD83D\uDCAF" }), _jsx("div", { className: "text-[10px] text-rose-200", children: "Centurion" })] })), userProfile.streak_days >= 7 && (_jsxs("div", { className: "text-center p-3 bg-white/10 rounded-lg border border-white/20", children: [_jsx("div", { className: "text-2xl mb-1", children: "\uD83D\uDD25" }), _jsx("div", { className: "text-[10px] text-rose-200", children: "Week Streak" })] })), stats.highestScore >= 95 && (_jsxs("div", { className: "text-center p-3 bg-white/10 rounded-lg border border-white/20", children: [_jsx("div", { className: "text-2xl mb-1", children: "\uD83D\uDC96" }), _jsx("div", { className: "text-[10px] text-rose-200", children: "True Love" })] })), userProfile.level >= 5 && (_jsxs("div", { className: "text-center p-3 bg-white/10 rounded-lg border border-white/20", children: [_jsx("div", { className: "text-2xl mb-1", children: "\uD83C\uDFC6" }), _jsx("div", { className: "text-[10px] text-rose-200", children: "Level 5" })] }))] })] })] })), activeTab === 'history' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Recent Transactions" }), loadingTransactions ? (_jsx("div", { className: "text-center py-8 text-rose-200/60 text-sm", children: "Loading..." })) : transactions.length === 0 ? (_jsx("div", { className: "text-center py-8 text-rose-200/60 text-sm", children: "No transactions yet" })) : (_jsx("div", { className: "space-y-2", children: transactions.map((tx) => (_jsxs("div", { className: "flex items-center justify-between py-2 border-b border-white/10 last:border-0", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm text-white", children: tx.description || tx.transaction_type }), _jsx("div", { className: "text-xs text-rose-200/60", children: formatDate(tx.created_at) })] }), _jsxs("div", { className: cls('text-sm font-bold', tx.amount > 0 ? 'text-[#4CAF50]' : 'text-[#F44336]'), children: [tx.amount > 0 ? '+' : '', tx.amount] })] }, tx.id))) }))] }) })), activeTab === 'settings' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Account" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "User ID" }), _jsx("div", { className: "text-white font-mono text-xs break-all", children: user.id })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "Email" }), _jsx("div", { className: "text-white", children: user.email })] }), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-rose-200/60 mb-1", children: "Joined" }), _jsx("div", { className: "text-white", children: new Date(userProfile.created_at).toLocaleDateString() })] })] })] }), _jsxs("div", { className: "dex-panel p-4", children: [_jsx("h3", { className: "text-sm font-bold text-white mb-3", children: "Preferences" }), _jsx("p", { className: "text-xs text-rose-200/60", children: "More settings coming soon!" })] })] }))] })] }));
}
