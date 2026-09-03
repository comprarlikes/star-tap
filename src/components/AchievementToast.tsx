import React, { useEffect, useState } from 'react';
import { Trophy, Target, X, Sparkles, ChevronRight, Award } from 'lucide-react';
import { t, Language } from '../i18n';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

export interface ToastItem {
  id: string;
  type?: 'achievement' | 'quest';
  title: string;
  description?: string;
  icon?: string;
  rewardCoins: number;
  rewardXp: number;
}

interface AchievementToastProps {
  item: ToastItem;
  onClose: () => void;
  onOpenModal?: (type: 'achievement' | 'quest') => void;
  lang?: Language;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  item,
  onClose,
  onOpenModal,
  lang = 'es',
}) => {
  const currentLang: Language = lang === 'en' ? 'en' : 'es';
  const isQuest = item.type === 'quest';
  const isEn = currentLang === 'en';
  const [progressPercent, setProgressPercent] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Play celebratory modern console sound & haptics
    if (isQuest) {
      soundManager.playPowerup();
    } else {
      soundManager.playTrophyUnlock();
    }
    hapticManager.heavyTap();

    const DURATION = 4600;
    const intervalTime = 50;
    const decrement = (intervalTime / DURATION) * 100;

    const progressTimer = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return Math.max(0, prev - decrement);
      });
    }, intervalTime);

    // Auto-dismiss toast after duration
    const dismissTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 350);
    }, DURATION);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(dismissTimer);
    };
  }, [onClose, isQuest]);

  const handleBannerClick = () => {
    if (onOpenModal && item.type) {
      soundManager.playButtonClick();
      onOpenModal(item.type);
    }
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed top-12 sm:top-14 left-1/2 -translate-x-1/2 z-[300] w-[94%] max-w-lg pointer-events-auto transition-all duration-300 ${
        isExiting
          ? 'opacity-0 -translate-y-6 scale-95'
          : 'animate-pop-in-3d'
      }`}
      style={{ perspective: '1200px' }}
    >
      {/* 3D Console Achievement Card */}
      <div
        onClick={handleBannerClick}
        className={`relative overflow-hidden rounded-3xl p-3.5 sm:p-4 text-white flex items-center justify-between gap-3 sm:gap-4 cursor-pointer select-none group border-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-transform active:scale-[0.98] ${
          isQuest
            ? 'bg-gradient-to-r from-slate-950 via-cyan-950/90 to-slate-950 border-cyan-400/80 shadow-[0_0_40px_rgba(6,182,212,0.45)]'
            : 'bg-gradient-to-r from-slate-950 via-amber-950/90 to-slate-950 border-yellow-400/90 shadow-[0_0_50px_rgba(245,158,11,0.55)]'
        }`}
      >
        {/* 1. Golden Rotating Sunburst Flare (Console Starburst Effect) */}
        <div className="absolute left-10 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none opacity-40 overflow-hidden">
          <div
            className={`w-full h-full rounded-full animate-sunburst-rotate ${
              isQuest
                ? 'bg-[conic-gradient(from_0deg,transparent_0_30deg,#06b6d4_45deg,transparent_60_90deg,#38bdf8_105deg,transparent_120_180deg,#22d3ee_210deg,transparent_240_360deg)]'
                : 'bg-[conic-gradient(from_0deg,transparent_0_30deg,#fbbf24_45deg,transparent_60_90deg,#f59e0b_105deg,transparent_120_180deg,#fef08a_210deg,transparent_240_360deg)]'
            }`}
          />
        </div>

        {/* 2. Sweeping Golden Light Sheen Beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          <div
            className={`absolute -inset-full w-[250%] h-[250%] animate-golden-sheen opacity-40 ${
              isQuest
                ? 'bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent'
                : 'bg-gradient-to-r from-transparent via-amber-200/50 to-transparent'
            }`}
          />
        </div>

        {/* 3. Outer Radial Ambient Glows */}
        <div
          className={`absolute -top-12 -left-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
            isQuest ? 'bg-cyan-500/40' : 'bg-amber-500/45'
          }`}
        />
        <div
          className={`absolute -bottom-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none ${
            isQuest ? 'bg-teal-400/30' : 'bg-yellow-400/35'
          }`}
        />

        {/* 4. Console Cyber Corner Accents */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-yellow-300/80 pointer-events-none" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-yellow-300/80 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-yellow-300/80 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-yellow-300/80 pointer-events-none" />

        {/* Left: 3D Emblem Container with Golden Pulsing Glow */}
        <div className="relative flex-shrink-0 z-10">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 shadow-2xl flex items-center justify-center animate-trophy-pulse ${
              isQuest
                ? 'bg-gradient-to-tr from-cyan-500 via-teal-300 to-blue-600'
                : 'bg-gradient-to-tr from-amber-500 via-yellow-200 to-orange-600'
            }`}
          >
            <div className="w-full h-full bg-slate-950/95 rounded-[14px] flex items-center justify-center text-3xl sm:text-4xl relative overflow-hidden shadow-inner">
              {/* Inner glow flare */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15 pointer-events-none" />
              
              <span className="relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                {item.icon || (isQuest ? '🎯' : '🏆')}
              </span>

              {/* Sub-badge corner icon */}
              {isQuest ? (
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-cyan-950 rounded-full border border-cyan-400 shadow">
                  <Target className="w-3.5 h-3.5 text-cyan-300 fill-cyan-400" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-950 rounded-full border border-yellow-300 shadow">
                  <Trophy className="w-3.5 h-3.5 text-yellow-300 fill-amber-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center: Console Header, Title & Reward Chips */}
        <div className="flex-1 min-w-0 flex flex-col justify-center text-left z-10">
          {/* Top Console Telemetry Banner */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm ${
                isQuest
                  ? 'bg-cyan-950/80 border-cyan-400/60 text-cyan-300'
                  : 'bg-amber-950/80 border-yellow-400/70 text-yellow-300'
              }`}
            >
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>
                {isQuest
                  ? (isEn ? 'MISSION COMPLETED' : 'MISIÓN COMPLETADA')
                  : (isEn ? 'TROPHY UNLOCKED' : 'TROFEO DESBLOQUEADO')}
              </span>
            </div>

            {/* Rarity / Tier Tag */}
            <div className="flex items-center gap-1 text-[9px] font-black text-amber-200/90 tracking-widest uppercase bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Award className="w-2.5 h-2.5 text-yellow-400" />
              <span>{isQuest ? (isEn ? 'DAILY' : 'DIARIA') : (isEn ? 'GOLD TIER' : 'CATEGORÍA ORO')}</span>
            </div>
          </div>

          {/* Achievement Title with Glowing Contrast */}
          <h4 className="text-sm sm:text-base font-black text-white leading-tight mt-1 truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] tracking-tight">
            {item.title}
          </h4>

          {/* Description */}
          {item.description && (
            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug line-clamp-1 mt-0.5 font-medium">
              {item.description}
            </p>
          )}

          {/* Reward Badges */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs font-black">
            {item.rewardCoins > 0 && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] flex items-center gap-1.5 border shadow-sm ${
                  isQuest
                    ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                    : 'bg-amber-500/20 border-yellow-400/50 text-amber-200'
                }`}
              >
                <span className="text-xs">🪙</span>
                <span>+{item.rewardCoins.toLocaleString()}</span>
              </span>
            )}
            {item.rewardXp > 0 && (
              <span className="bg-purple-950/80 border border-purple-400/60 px-2.5 py-0.5 rounded-full text-[11px] text-purple-200 flex items-center gap-1.5 shadow-sm">
                <span className="text-xs">✨</span>
                <span>+{item.rewardXp.toLocaleString()} XP</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action Chevron & Dismiss Button */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          <div className="hidden sm:flex items-center text-slate-400 group-hover:text-white transition-colors text-xs font-bold gap-0.5">
            <span className="text-[10px] text-amber-300/80 uppercase font-black tracking-wider">
              {isEn ? 'VIEW' : 'VER'}
            </span>
            <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <button
            type="button"
            onClick={handleCloseClick}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/90 rounded-xl transition-all active:scale-90 cursor-pointer border border-transparent hover:border-slate-700 ml-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom Progress Timer Line */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              isQuest
                ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-300'
                : 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.9)]'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
