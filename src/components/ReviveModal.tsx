import React, { useState, useEffect } from 'react';
import { Heart, Tv, Coins, Sparkles, X, Clock } from 'lucide-react';
import { GameMode } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface ReviveModalProps {
  score: number;
  gameMode: GameMode;
  userCoins: number;
  language?: 'es' | 'en';
  onReviveWithAd: () => void;
  onReviveWithCoins: () => void;
  onSkip: () => void;
}

export const ReviveModal: React.FC<ReviveModalProps> = ({
  score,
  gameMode,
  userCoins,
  language = 'es',
  onReviveWithAd,
  onReviveWithCoins,
  onSkip,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const lang = language === 'en' ? 'en' : 'es';
  const coinCost = 75;
  const canAffordCoins = userCoins >= coinCost;

  useEffect(() => {
    soundManager.playCountdownTick();
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSkip();
          return 0;
        }
        soundManager.playCountdownTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onSkip]);

  const reviveBenefit = gameMode === 'endless' ? '+2 Vidas ❤️' : '+15 Segundos ⏱️';
  const reviveBenefitEn = gameMode === 'endless' ? '+2 Lives ❤️' : '+15 Seconds ⏱️';

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-red-500/50 rounded-[2.5rem] p-5 sm:p-6 text-white shadow-[0_0_60px_rgba(239,68,68,0.25)] relative overflow-hidden flex flex-col items-center text-center animate-scale-up">
        {/* Pulsing Alert Top Aura */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Circular Animated Countdown Badge */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-400 flex items-center justify-center text-3xl font-black shadow-2xl border-4 border-red-300/60 animate-pulse">
            <span className="font-mono text-slate-950 drop-shadow">{countdown}</span>
          </div>
          <Heart className="absolute -top-1 -right-1 w-7 h-7 text-red-400 fill-red-500 animate-bounce" />
        </div>

        <h3 className="text-2xl font-black tracking-tight text-white mb-1 drop-shadow">
          {lang === 'en' ? 'SAVE YOUR RUN!' : '¡SEGUNDA OPORTUNIDAD!'}
        </h3>
        <p className="text-xs text-slate-300 font-medium mb-3 leading-relaxed">
          {lang === 'en'
            ? `Don't lose your streak of ${score.toLocaleString()} pts! Revive now with ${reviveBenefitEn}:`
            : `¡No pierdas tu gran racha de ${score.toLocaleString()} pts! Revive ahora con ${reviveBenefit}:`}
        </p>

        {/* Action 1: AdMob Rewarded Video */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            hapticManager.heavyTap();
            onReviveWithAd();
          }}
          className="w-full mb-2.5 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border border-pink-300/50 cursor-pointer group"
        >
          <Tv className="w-4 h-4 fill-amber-300 text-slate-950 group-hover:scale-110 transition-transform" />
          <span className="uppercase tracking-wide">
            {lang === 'en' ? 'WATCH AD TO REVIVE (FREE)' : 'VER ANUNCIO PARA REVIVIR (GRATIS)'}
          </span>
          <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase shadow">
            AdMob
          </span>
        </button>

        {/* Action 2: Spend Coins */}
        <button
          type="button"
          disabled={!canAffordCoins}
          onClick={() => {
            if (!canAffordCoins) return;
            soundManager.playButtonClick();
            hapticManager.heavyTap();
            onReviveWithCoins();
          }}
          className={`w-full mb-3 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border ${
            canAffordCoins
              ? 'bg-slate-850 hover:bg-slate-800 text-amber-300 border-amber-500/40 hover:border-amber-400 active:scale-95 shadow-md cursor-pointer'
              : 'bg-slate-950/70 text-slate-500 border-slate-800 opacity-50 cursor-not-allowed'
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <span>
            {lang === 'en'
              ? `REVIVE WITH ${coinCost} COINS (YOU HAVE ${userCoins})`
              : `REVIVIR CON ${coinCost} MONEDAS (TIENES ${userCoins})`}
          </span>
        </button>

        {/* Skip Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onSkip();
          }}
          className="text-xs text-slate-400 hover:text-white font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer py-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'No thanks, give up' : 'No gracias, terminar partida'}</span>
        </button>
      </div>
    </div>
  );
};
