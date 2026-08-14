import React, { useState } from 'react';
import { Sparkles, Check, Lock, Gift, Tv, X, Flame, Award, Star, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { PlayerState } from '../types';

interface DailyLoginBonusModalProps {
  playerState: PlayerState;
  onClaimReward: (reward: { coins: number; xp: number }) => void;
  onWatchAdDouble: (reward: { coins: number; xp: number }) => void;
  onClose: () => void;
  language?: 'es' | 'en';
}

export const DAILY_REWARDS = [
  { day: 1, coins: 35, xp: 25, icon: '🪙', label: 'Día 1' },
  { day: 2, coins: 65, xp: 45, icon: '✨', label: 'Día 2' },
  { day: 3, coins: 100, xp: 75, icon: '🌟', label: 'Día 3' },
  { day: 4, coins: 150, xp: 110, icon: '💎', label: 'Día 4' },
  { day: 5, coins: 220, xp: 160, icon: '🚀', label: 'Día 5' },
  { day: 6, coins: 320, xp: 220, icon: '🌌', label: 'Día 6' },
  { day: 7, coins: 500, xp: 350, icon: '👑', label: 'Día 7 (GRAN COFRE)', isGrand: true },
];

export const DailyLoginBonusModal: React.FC<DailyLoginBonusModalProps> = ({
  playerState,
  onClaimReward,
  onWatchAdDouble,
  onClose,
  language = 'es',
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = playerState.lastDailyClaim === todayStr;
  
  // Calculate current active day in 7-day cycle (0 to 6)
  const currentStreak = playerState.dailyStreak || 0;
  const activeDayIndex = isClaimedToday 
    ? ((currentStreak - 1) % 7 + 7) % 7
    : (currentStreak % 7);

  const todayReward = DAILY_REWARDS[activeDayIndex];
  const [claimedLocally, setClaimedLocally] = useState(false);

  const handleClaim = () => {
    if (isClaimedToday || claimedLocally) return;

    soundManager.playLevelUp();
    soundManager.playCoin();
    hapticManager.success();
    
    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch {
      // fallback
    }

    setClaimedLocally(true);
    onClaimReward({ coins: todayReward.coins, xp: todayReward.xp });
  };

  const handleWatchAd = () => {
    if (isClaimedToday || claimedLocally) return;
    soundManager.playButtonClick();
    onWatchAdDouble({ coins: todayReward.coins, xp: todayReward.xp });
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none font-sans">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col relative text-white">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between z-10 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🎁
              </div>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                {language === 'en' ? 'DAILY LOGIN REWARD' : 'RECOMPENSA DIARIA DE ACCESO'}
              </h3>
              <p className="text-xs text-amber-300 font-bold flex items-center gap-1.5 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                <span>
                  {language === 'en' 
                    ? `Current Streak: ${currentStreak} Days in a row` 
                    : `Racha Actual: ${currentStreak} Días seguidos`}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all active:scale-95 border border-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Rewards Bento Grid */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto z-10">
          
          {/* Calendar Grid (Days 1 to 6 in a 3-column grid, Day 7 as Grand Prize Bar) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {DAILY_REWARDS.slice(0, 6).map((item, idx) => {
              const isPast = isClaimedToday ? idx <= activeDayIndex : idx < activeDayIndex;
              const isCurrent = !isClaimedToday && !claimedLocally && idx === activeDayIndex;
              const isLocked = isClaimedToday ? idx > activeDayIndex : idx > activeDayIndex;

              return (
                <div
                  key={item.day}
                  className={`relative p-3 rounded-2xl border flex flex-col items-center text-center transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.03] animate-pulse ring-2 ring-amber-400/50'
                      : isPast
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  {/* Status Indicator */}
                  {isPast && (
                    <div className="absolute top-2 right-2 p-1 bg-emerald-500 text-slate-950 rounded-full text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute top-2 right-2 text-slate-600">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}

                  {isCurrent && (
                    <div className="absolute -top-2.5 bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow border border-yellow-200">
                      ¡HOY!
                    </div>
                  )}

                  <span className="text-[11px] font-extrabold text-slate-400 uppercase mt-1">
                    Día {item.day}
                  </span>

                  <div className="text-3xl my-1.5 filter drop-shadow">
                    {item.icon}
                  </div>

                  <div className="text-xs font-black text-amber-300">
                    +{item.coins} 🪙
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    +{item.xp} XP
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day 7: Grand Cosmic Chest Card */}
          {(() => {
            const item = DAILY_REWARDS[6];
            const isPast = isClaimedToday ? 6 <= activeDayIndex : 6 < activeDayIndex;
            const isCurrent = !isClaimedToday && !claimedLocally && activeDayIndex === 6;

            return (
              <div
                className={`w-full p-4 rounded-3xl border flex items-center justify-between relative overflow-hidden transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500/30 via-purple-900/40 to-slate-900 border-amber-300 shadow-xl shadow-amber-500/30 ring-2 ring-amber-400'
                    : isPast
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : 'bg-gradient-to-r from-purple-950/40 to-slate-900 border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-0.5 shadow-lg flex items-center justify-center text-3xl">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      👑
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        DÍA 7 · GRAN COFRE CÓSMICO
                      </span>
                      {isCurrent && (
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          ¡DISPONIBLE!
                        </span>
                      )}
                    </div>
                    <div className="text-base font-black text-white">
                      +{item.coins} Monedas 🪙
                    </div>
                    <div className="text-xs font-bold text-purple-300">
                      +{item.xp} XP + Caja Épica
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {isPast ? (
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Reclamado
                    </span>
                  ) : (
                    <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Action Footer Buttons */}
        <div className="p-4 sm:p-5 bg-slate-950/95 border-t border-slate-800/80 flex flex-col gap-2.5 z-10">
          {isClaimedToday || claimedLocally ? (
            <div className="w-full py-3.5 bg-slate-800/80 border border-slate-700 text-slate-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{language === 'en' ? 'Daily reward claimed! Return tomorrow.' : '¡Recompensa de hoy reclamada! Vuelve mañana.'}</span>
            </div>
          ) : (
            <>
              {/* x2 Doubled Ad Button */}
              <button
                onClick={handleWatchAd}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 border border-emerald-300 transition-all flex items-center justify-center gap-2 relative overflow-hidden group uppercase"
              >
                <div className="p-1 bg-slate-950/20 rounded-lg">
                  <Tv className="w-4 h-4 text-slate-950 animate-bounce" />
                </div>
                <span>DUPLICAR RECOMPENSA (x2)</span>
                <span className="bg-slate-950/20 px-2.5 py-0.5 rounded-xl font-extrabold text-xs">
                  +{todayReward.coins * 2} 🪙
                </span>
              </button>

              {/* Direct Normal Claim Button */}
              <button
                onClick={handleClaim}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 border border-yellow-200 transition-all flex items-center justify-center gap-1.5 uppercase"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Reclamar Normal (+{todayReward.coins} 🪙 y +{todayReward.xp} XP)</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
