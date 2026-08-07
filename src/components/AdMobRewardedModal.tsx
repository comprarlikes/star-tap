import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Tv, Sparkles, Volume2, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../services/sound';
import { t, Language } from '../i18n';

interface AdMobRewardedModalProps {
  bonusCoins: number;
  language?: Language;
  onRewardEarned: () => void;
  onClose: () => void;
}

export const ADMOB_APP_ID = 'ca-app-pub-4623925469377930~9302870404';
export const ADMOB_REWARDED_AD_UNIT_ID = 'ca-app-pub-4623925469377930/5770819509';

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  bonusCoins,
  language = 'es',
  onRewardEarned,
  onClose,
}) => {
  const lang: Language = language === 'en' ? 'en' : 'es';
  const [countdown, setCountdown] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Simulate loading AdMob Rewarded Video Ad SDK
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(loadTimer);
  }, []);

  // Countdown timer once loaded
  useEffect(() => {
    if (isLoading || isCompleted) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsCompleted(true);
      soundManager.playLevelUp();
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // fallback
      }
    }
  }, [isLoading, countdown, isCompleted]);

  const handleClaim = () => {
    soundManager.playPowerup();
    onRewardEarned();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-purple-500/40 rounded-[2rem] text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Top Header Bar with AdMob Branding */}
        <div className="w-full bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
              <Tv className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black text-amber-400 tracking-wide uppercase flex items-center gap-1">
                Google AdMob <ShieldCheck className="w-3 h-3 text-emerald-400" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {language === 'en' ? 'Rewarded Video Placement' : 'Emplazamiento Bonificado'}
              </span>
            </div>
          </div>

          {isCompleted && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Video Player Canvas View */}
        <div className="w-full p-5 flex flex-col items-center">
          <div className="w-full aspect-video bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 rounded-2xl border border-purple-500/30 relative overflow-hidden flex flex-col items-center justify-center p-4 shadow-inner">
            {/* Background Animated Particles simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-purple-600/10 to-transparent animate-pulse pointer-events-none" />

            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-amber-300 animate-pulse">
                  {language === 'en' ? 'Loading AdMob Rewarded Video...' : 'Cargando vídeo bonificado de AdMob...'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">ID: {ADMOB_REWARDED_AD_UNIT_ID}</span>
              </div>
            ) : !isCompleted ? (
              <div className="flex flex-col items-center justify-between h-full w-full py-2 z-10">
                <div className="w-full flex items-center justify-between text-xs">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Star Tap Arcade AD
                  </span>
                  <div className="flex items-center gap-1 text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-700 text-[11px] font-mono">
                    <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>0:0{countdown}</span>
                  </div>
                </div>

                {/* Animated Game Trailer Promo Banner */}
                <div className="flex flex-col items-center text-center my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-3xl shadow-lg border border-yellow-200/50 mb-2 animate-bounce">
                    ⭐
                  </div>
                  <h4 className="text-base font-black text-white tracking-tight">
                    {language === 'en' ? 'Star Tap Arcade Edition' : 'Star Tap Edición Galáctica'}
                  </h4>
                  <p className="text-[11px] text-amber-300/90 font-medium mt-0.5">
                    {language === 'en' ? 'Watch until end to claim x2 coins!' : '¡Mira el anuncio para reclamar el bonus x2 de monedas!'}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900/80 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 z-10 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl border border-emerald-200/50">
                  <CheckCircle2 className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-base font-black text-emerald-400 tracking-tight">
                  {language === 'en' ? 'AdMob Reward Unlocked!' : '¡Recompensa AdMob Desbloqueada!'}
                </h4>
                <p className="text-xs text-slate-300 font-medium">
                  +{bonusCoins} {language === 'en' ? 'Bonus Coins Granted' : 'Monedas Extra Concedidas'}
                </p>
              </div>
            )}
          </div>

          {/* Detailed AdMob Metadata Footer */}
          <div className="w-full bg-slate-950/80 p-3 rounded-xl border border-slate-800 mt-4 text-[10px] font-mono text-slate-400 space-y-1 text-left">
            <div className="flex justify-between items-center text-slate-300 font-bold border-b border-slate-800/80 pb-1 mb-1">
              <span>Google AdMob Specs</span>
              <span className="text-emerald-400">SDK Status: Ready</span>
            </div>
            <div className="truncate">
              <span className="text-slate-500">App ID:</span> {ADMOB_APP_ID}
            </div>
            <div className="truncate">
              <span className="text-slate-500">Unit ID:</span> {ADMOB_REWARDED_AD_UNIT_ID}
            </div>
            <div>
              <span className="text-slate-500">Placement:</span> Bonificadoca-app-pub-4623925469377930/5770819509
            </div>
          </div>

          {/* Action Button */}
          {isCompleted ? (
            <button
              onClick={handleClaim}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-200/40"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>
                {language === 'en'
                  ? `CLAIM +${bonusCoins} DOUBLE COINS`
                  : `RECLAMAR +${bonusCoins} MONEDAS (x2)`}
              </span>
            </button>
          ) : (
            <div className="w-full mt-4 py-3 bg-slate-950/60 border border-slate-800 text-slate-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-2">
              <Play className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>
                {language === 'en'
                  ? `Reward ready in ${countdown}s...`
                  : `Recompensa disponible en ${countdown}s...`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
