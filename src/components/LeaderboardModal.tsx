import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { X, Trophy, Swords, Flame, Sparkles, Clock, Coins, Info, ShieldCheck } from 'lucide-react';
import { t } from '../i18n';

interface LeaderboardModalProps {
  leaderboard: LeaderboardEntry[];
  playerState: PlayerState;
  onClose: () => void;
  onStartDuel?: (entry: LeaderboardEntry) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  leaderboard,
  playerState,
  onClose,
  onStartDuel,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'tournament'>('tournament');
  const [showPrizeRules, setShowPrizeRules] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 3,
    hours: 14,
    minutes: 25,
    seconds: 40,
  });

  const lang = playerState.language || 'es';

  // Dynamic countdown for Weekly Tournament
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sort leaderboard high to low
  const sortedGlobal = [...leaderboard].sort((a, b) => b.score - a.score);

  // Calculate Weekly Tournament Entries & Prize Pool
  const basePrizePool = 50000;
  const jackpotPool = basePrizePool + sortedGlobal.length * 1250;

  // Calculate prize for each position
  const getEstimatedPrize = (rank: number): number => {
    if (rank === 1) return Math.floor(jackpotPool * 0.5); // 50%
    if (rank === 2) return Math.floor(jackpotPool * 0.25); // 25%
    if (rank === 3) return Math.floor(jackpotPool * 0.15); // 15%
    if (rank >= 4 && rank <= 10) return Math.floor((jackpotPool * 0.1) / 7); // 10% divided among 4-10
    return 0;
  };

  // Weekly tournament ranking entries
  const tournamentEntries = sortedGlobal.map((entry, index) => {
    const rank = index + 1;
    const estimatedCoins = getEstimatedPrize(rank);
    return {
      ...entry,
      rank,
      estimatedCoins,
    };
  });

  const userTournamentEntry = tournamentEntries.find((e) => e.isUser) || {
    rank: sortedGlobal.length + 1,
    estimatedCoins: 0,
    score: playerState.stats.highestScore,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md h-[85vh] bg-slate-900/95 border border-purple-500/30 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bento Tile */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950 rounded-2xl shadow-md">
              <Trophy className="w-5 h-5 fill-slate-950" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-black text-white tracking-tight leading-tight">
                {activeTab === 'tournament' ? t('tournamentTitle', lang) : t('leaderboardTitle', lang)}
              </h3>
              <span className="text-[11px] text-amber-300 font-medium">
                {activeTab === 'tournament' ? t('tournamentSubtitle', lang) : t('leaderboardSubtitle', lang)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="p-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('tournament');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tournament'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-md scale-[1.02]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>{t('tournamentTab', lang)}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('global');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md scale-[1.02]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{t('globalTab', lang)}</span>
          </button>
        </div>

        {/* Tournament Banner View */}
        {activeTab === 'tournament' && (
          <div className="p-3.5 bg-gradient-to-br from-purple-950/90 via-slate-950 to-amber-950/60 border-b border-amber-500/30 flex flex-col gap-2.5 shadow-inner relative overflow-hidden">
            <div className="flex items-center justify-between">
              {/* Prize Pool Display */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-xl shadow-lg border border-yellow-200/60 animate-bounce">
                  🪙
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    {t('prizePoolTitle', lang)} <Sparkles className="w-3 h-3" />
                  </span>
                  <span className="text-xl font-black text-white drop-shadow-md">
                    {jackpotPool.toLocaleString()} <span className="text-amber-300 text-xs font-bold">MONEDAS</span>
                  </span>
                </div>
              </div>

              {/* Countdown Ticker */}
              <div className="bg-slate-900/90 border border-purple-500/40 px-3 py-1.5 rounded-xl flex flex-col items-end">
                <span className="text-[9px] text-purple-300 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-pink-400" /> {t('endsIn', lang)}
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              </div>
            </div>

            {/* Rules Toggle & Prize Tiers breakdown */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tu Posición: <strong className="text-amber-300">#{userTournamentEntry.rank}</strong></span>
                {userTournamentEntry.estimatedCoins > 0 && (
                  <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-bold">
                    +{userTournamentEntry.estimatedCoins.toLocaleString()} 🪙
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowPrizeRules(!showPrizeRules)}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Premios</span>
              </button>
            </div>

            {/* Prize Rules Breakdown Sub-panel */}
            {showPrizeRules && (
              <div className="w-full bg-slate-950/90 border border-amber-500/30 p-3 rounded-xl text-xs space-y-1.5 animate-fade-in text-left">
                <div className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Reparto del Bote Semanal</span>
                  <span className="text-[10px] text-slate-400 font-mono">Total: 100% Bote</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-white font-bold">{t('rankTier1', lang)}</span>
                    <span className="text-amber-400 font-extrabold">{Math.floor(jackpotPool * 0.5).toLocaleString()} 🪙</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-slate-200 font-bold">{t('rankTier2', lang)}</span>
                    <span className="text-amber-300 font-extrabold">{Math.floor(jackpotPool * 0.25).toLocaleString()} 🪙</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-amber-200/90 font-bold">{t('rankTier3', lang)}</span>
                    <span className="text-amber-300/90 font-extrabold">{Math.floor(jackpotPool * 0.15).toLocaleString()} 🪙</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex justify-between">
                    <span className="text-slate-300 font-bold">{t('rankTierTop10', lang)}</span>
                    <span className="text-cyan-400 font-extrabold">~{Math.floor((jackpotPool * 0.1) / 7).toLocaleString()} 🪙</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Best Card in Global Tab */}
        {activeTab === 'global' && (
          <div className="p-3.5 bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-950/80 border-b border-cyan-500/30 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-md border border-amber-300">
                L{playerState.level}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-sm text-amber-300">{playerState.name} (Tú)</span>
                <span className="text-xs text-slate-400">Récord Personal</span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-base font-black text-cyan-400">
                {playerState.stats.highestScore.toLocaleString()} pts
              </span>
            </div>
          </div>
        )}

        {/* Entries List View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {activeTab === 'tournament' ? (
            /* Tournament Entries List */
            tournamentEntries.map((entry) => {
              const isTop3 = entry.rank <= 3;
              const hasPrize = entry.estimatedCoins > 0;

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
                    entry.isUser
                      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/50 shadow-md ring-1 ring-amber-400/30'
                      : isTop3
                      ? 'bg-slate-950/80 border-amber-500/30'
                      : 'bg-slate-950/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-7 flex justify-center">
                      {entry.rank === 1 && <span className="text-2xl animate-pulse">👑</span>}
                      {entry.rank === 2 && <span className="text-2xl">🥈</span>}
                      {entry.rank === 3 && <span className="text-2xl">🥉</span>}
                      {entry.rank > 3 && (
                        <span className="text-xs font-black text-slate-400">#{entry.rank}</span>
                      )}
                    </div>

                    <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-sm">
                      {entry.avatar}
                    </div>

                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white truncate max-w-[90px]">{entry.name}</span>
                        <span className="text-xs">{entry.flag}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">L{entry.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-sm text-amber-300">
                        {entry.score.toLocaleString()} <span className="text-[10px] text-slate-400">pts</span>
                      </span>
                      {hasPrize ? (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                          <Coins className="w-3 h-3 text-amber-400" />
                          +{entry.estimatedCoins.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">{entry.date}</span>
                      )}
                    </div>

                    {!entry.isUser && onStartDuel && (
                      <button
                        onClick={() => {
                          soundManager.playButtonClick();
                          onStartDuel(entry);
                        }}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-black text-[11px] rounded-xl shadow border border-pink-400/40 flex items-center gap-1 transition-transform active:scale-95"
                        title={`Desafiar a ${entry.name}`}
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Retar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            /* Global Leaderboard List */
            sortedGlobal.map((entry, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-sm ${
                    entry.isUser
                      ? 'bg-amber-500/15 border-amber-500/40 shadow-md'
                      : isTop3
                      ? 'bg-slate-950/70 border-slate-800'
                      : 'bg-slate-950/40 border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className="w-7 flex justify-center">
                      {rank === 1 && <span className="text-2xl">🥇</span>}
                      {rank === 2 && <span className="text-2xl">🥈</span>}
                      {rank === 3 && <span className="text-2xl">🥉</span>}
                      {rank > 3 && (
                        <span className="text-xs font-black text-slate-400">#{rank}</span>
                      )}
                    </div>

                    <div className="w-9 h-9 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg">
                      {entry.avatar}
                    </div>

                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white truncate max-w-[85px]">{entry.name}</span>
                        <span className="text-xs">{entry.flag}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">L{entry.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-sm text-cyan-400">
                        {entry.score.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500">{entry.date}</span>
                    </div>

                    {!entry.isUser && onStartDuel && (
                      <button
                        onClick={() => {
                          soundManager.playButtonClick();
                          onStartDuel(entry);
                        }}
                        className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-black text-[11px] rounded-xl shadow border border-pink-400/40 flex items-center gap-1 transition-transform active:scale-95"
                        title={`Desafiar el fantasma de ${entry.name}`}
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Retar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

