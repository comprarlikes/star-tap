import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Tv, Sparkles, Volume2, VolumeX, X, Download, ShieldCheck, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { t, Language } from '../i18n';

interface AdMobRewardedModalProps {
  bonusCoins?: number;
  rewardCoins?: number;
  language?: Language;
  onRewardEarned?: () => void;
  onRewardClaimed?: (rewardCoins: number) => void;
  onClose: () => void;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  bonusCoins,
  rewardCoins,
  language = 'es',
  onRewardEarned,
  onRewardClaimed,
  onClose,
}) => {
  const coinsAmount = bonusCoins || rewardCoins || 100;
  const lang: Language = language === 'en' ? 'en' : 'es';

  const TOTAL_DURATION = 5; // 5-second rewarded video ad
  const [countdown, setCountdown] = useState<number>(TOTAL_DURATION);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [installClicked, setInstallClicked] = useState<boolean>(false);

  useEffect(() => {
    soundManager.playButtonClick();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCompleted(true);
          soundManager.playLevelUp();
          hapticManager.success();
          try {
            confetti({
              particleCount: 90,
              spread: 80,
              origin: { y: 0.5 },
            });
          } catch {
            // fallback if confetti fails
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClaim = () => {
    soundManager.playCoin();
    hapticManager.success();
    if (onRewardEarned) onRewardEarned();
    if (onRewardClaimed) onRewardClaimed(coinsAmount);
    onClose();
  };

  const handleAttemptClose = () => {
    if (isCompleted) {
      handleClaim();
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    soundManager.playButtonClick();
    onClose();
  };

  const handleInstallClick = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    setInstallClicked(true);
    setTimeout(() => setInstallClicked(false), 2500);
  };

  const progressPercent = Math.min(100, Math.max(0, ((TOTAL_DURATION - countdown) / TOTAL_DURATION) * 100));

  return (
    <div className="fixed inset-0 z-[300] bg-black text-white flex flex-col justify-between select-none overflow-hidden animate-fade-in font-sans">
      {/* Top AdMob Header & Video Progress Line */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/95 via-black/70 to-transparent p-3 sm:p-4">
        {/* Top Progress Line Bar */}
        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 h-full transition-all duration-1000 ease-linear shadow-[0_0_12px_rgba(251,191,36,0.9)]"
            style={{ width: `${isCompleted ? 100 : progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Ad Label & Status */}
          <div className="flex items-center gap-2">
            <span className="bg-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded tracking-wider uppercase">
              Anuncio
            </span>

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 px-2.5 py-1 rounded-full text-xs font-bold text-slate-200 shadow-md">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Google AdMob</span>
              <span className="text-slate-600">|</span>
              {isCompleted ? (
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Recompensa lista
                </span>
              ) : (
                <span className="text-amber-300 font-mono">0:0{countdown}</span>
              )}
            </div>
          </div>

          {/* Controls: Mute & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-slate-900/90 hover:bg-slate-800 rounded-full border border-slate-700 text-slate-300 transition-all active:scale-95"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              type="button"
              onClick={handleAttemptClose}
              className={`p-2 rounded-full border transition-all active:scale-95 flex items-center gap-1 ${
                isCompleted
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-yellow-200 font-black text-xs px-3 shadow-lg shadow-amber-500/30 animate-pulse'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
              {isCompleted && <span>RECLAMAR</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Screen Simulated Mobile Ad View */}
      <div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
        {/* Ambient Glowing Orbs */}
        <div className="absolute inset-0 opacity-35 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-purple-600/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        </div>

        {/* Ad Video Experience Frame */}
        <div className="w-full max-w-sm px-6 flex flex-col items-center text-center z-10 space-y-5">
          {/* Simulated Video Player */}
          <div className="w-full aspect-video bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-1 shadow-2xl relative overflow-hidden group">
            <div className="w-full h-full rounded-[1.2rem] bg-gradient-to-tr from-purple-900 via-indigo-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden p-4">
              <div className="text-6xl mb-2 animate-bounce drop-shadow-[0_10px_20px_rgba(245,158,11,0.6)]">
                ⭐
              </div>
              <div className="text-base font-black text-amber-300 tracking-wider uppercase">
                STAR TAP LEGENDS 3D
              </div>
              <p className="text-[11px] text-slate-200 max-w-[220px] mt-1 font-medium leading-tight">
                ¡Conquista el cosmos en el juego #1 de habilidad arcade!
              </p>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400 font-mono bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Play className="w-3 h-3 fill-emerald-400" /> VÍDEO EN VIVO HD
                </span>
                <span>4.9 ★★★★★</span>
              </div>
            </div>
          </div>

          {/* Reward Notification Banner */}
          {isCompleted ? (
            <div className="w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 p-4 rounded-2xl shadow-xl shadow-emerald-500/30 border border-emerald-200 flex flex-col items-center gap-1 animate-fade-in">
              <div className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wide">
                <Sparkles className="w-5 h-5 fill-slate-950 animate-spin" />
                <span>¡ANUNCIO COMPLETADO!</span>
              </div>
              <p className="text-xs font-bold">
                ¡Has ganado la recompensa de <span className="underline">+{coinsAmount} Monedas (x2)</span>!
              </p>
            </div>
          ) : (
            <div className="bg-slate-900/90 border border-amber-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs text-slate-200 shadow-lg">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>
                Mira <strong className="text-amber-300">{countdown}s</strong> más para reclamar <strong className="text-emerald-400">+{coinsAmount} Monedas</strong>.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Conversion Dock */}
      <div className="relative z-20 bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 p-0.5 shadow-lg flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              ⭐
            </div>
          </div>
          <div className="min-w-0 text-left">
            <h4 className="text-sm font-black text-white truncate">Star Tap Legends 3D</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span className="text-amber-400 font-bold">4.9 ★</span>
              <span>•</span>
              <span>10M+ Descargas</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isCompleted ? (
            <button
              type="button"
              onClick={handleClaim}
              className="py-3 px-5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/30 border border-yellow-200 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 uppercase"
            >
              <span>RECLAMAR +{coinsAmount}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleInstallClick}
              className="py-3 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 uppercase"
            >
              {installClicked ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ABRIENDO PLAY STORE</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>INSTALAR</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog if User tries to Exit Early */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[350] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-2xl border border-rose-500/30">
              ⚠️
            </div>
            <div>
              <h4 className="text-base font-black text-white">¿Salir sin recompensa?</h4>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                Si cierras el anuncio ahora, perderás las <strong className="text-amber-400">+{coinsAmount} Monedas</strong> extra.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowExitConfirm(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider active:scale-95 transition-all"
              >
                SEGUIR VIENDO ANUNCIO
              </button>

              <button
                type="button"
                onClick={handleConfirmExit}
                className="w-full py-2.5 text-xs text-rose-400 hover:text-rose-300 font-extrabold hover:bg-rose-950/40 rounded-xl transition-all"
              >
                Salir y Perder Recompensa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
