import React, { useEffect } from 'react';
import { Trophy, Target, X, Sparkles } from 'lucide-react';
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
  lang?: Language;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
  item,
  onClose,
  lang = 'es',
}) => {
  const currentLang: Language = lang === 'en' ? 'en' : 'es';
  const isQuest = item.type === 'quest';

  useEffect(() => {
    // Play celebratory sound & haptics when unlocked
    if (isQuest) {
      soundManager.playPowerup();
    } else {
      soundManager.playLevelUp();
    }
    hapticManager.heavyTap();

    // Auto-dismiss toast after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose, isQuest]);

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-[250] w-[94%] max-w-md pointer-events-auto animate-slide-down-toast">
      <div
        className={`relative overflow-hidden bg-slate-900/98 border-2 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-white flex items-center justify-between gap-3.5 ${
          isQuest
            ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.45)]'
            : 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
        }`}
      >
        {/* Glow ambient background details */}
        <div
          className={`absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
            isQuest ? 'bg-cyan-500/25' : 'bg-amber-500/25'
          }`}
        />
        <div
          className={`absolute -bottom-10 -right-10 w-28 h-28 rounded-full blur-2xl pointer-events-none ${
            isQuest ? 'bg-teal-400/20' : 'bg-yellow-400/20'
          }`}
        />

        {/* Icon Container */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-2xl p-0.5 shadow-xl flex items-center justify-center animate-pulse ${
              isQuest
                ? 'bg-gradient-to-br from-cyan-400 via-teal-400 to-blue-600'
                : 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600'
            }`}
          >
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center text-2xl relative">
              {item.icon || (isQuest ? '🎯' : '🏆')}
              {isQuest ? (
                <Target className="w-3.5 h-3.5 text-cyan-400 absolute -bottom-1 -right-1 drop-shadow" />
              ) : (
                <Trophy className="w-3.5 h-3.5 text-amber-400 absolute -bottom-1 -right-1 drop-shadow" />
              )}
            </div>
          </div>
        </div>

        {/* Text & Content details (non-truncated, clean line wraps) */}
        <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
          <div
            className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider ${
              isQuest ? 'text-cyan-400' : 'text-amber-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>
              {isQuest ? '🎯 ¡MISIÓN COMPLETADA!' : `🏆 ${t('achievementUnlocked', currentLang)}`}
            </span>
          </div>

          <h4 className="text-sm font-black text-white leading-snug mt-0.5 break-words">
            {item.title}
          </h4>

          {item.description && (
            <p className="text-[11px] text-slate-300 leading-normal mt-0.5 break-words">
              {item.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5 text-xs font-extrabold">
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1 border ${
                isQuest
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
              }`}
            >
              🪙 +{item.rewardCoins}
            </span>
            <span className="bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 rounded-full text-[11px] text-purple-300 flex items-center gap-1">
              ✨ +{item.rewardXp} XP
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all active:scale-90"
          aria-label="Close Toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
