import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Sparkles, Play, Volume2, VolumeX, Star, Download, Coins, Gamepad2 } from 'lucide-react';
import { soundManager } from '../services/sound';
import { prepareAndShowConsentAd, ADMOB_CONSENT_AD_ID } from '../services/admob';

interface AppOpenAdModalProps {
  onClose: () => void;
  onRewardCoins?: (coins: number) => void;
  adUnitId?: string;
}

export const AppOpenAdModal: React.FC<AppOpenAdModalProps> = ({
  onClose,
  onRewardCoins,
  adUnitId = ADMOB_CONSENT_AD_ID,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [canSkip, setCanSkip] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  useEffect(() => {
    // Trigger native AdMob execution for consent ad unit ca-app-pub-4623925469377930/2039134652
    prepareAndShowConsentAd().then((shown) => {
      console.log(`[AdMob Consent Ad] Trigger result for unit ${adUnitId}: ${shown}`);
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const progressTimer = setInterval(() => {
      setVideoProgress((prev) => (prev >= 100 ? 100 : prev + 20));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(progressTimer);
    };
  }, [adUnitId]);

  const handleSkip = () => {
    soundManager.playButtonClick();
    if (onRewardCoins) {
      onRewardCoins(150);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-5 bg-slate-950/95 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-amber-500/50 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col items-center relative text-white">
        
        {/* Top AdMob Native SDK Header */}
        <div className="w-full px-4 py-2.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" /> Anuncio Google AdMob
            </span>
            <span className="text-[9px] font-mono text-amber-300 font-bold truncate max-w-[140px]">
              {adUnitId}
            </span>
          </div>

          {canSkip ? (
            <button
              onClick={handleSkip}
              className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1 animate-pulse border border-yellow-200/60"
            >
              <span>Saltar Anuncio</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
              Saltar en {countdown}s
            </span>
          )}
        </div>

        {/* Visual Ad Video / Image Media Screen */}
        <div className="w-full p-4 flex flex-col items-center text-center space-y-3">
          
          {/* Simulated Video Ad Canvas Frame */}
          <div className="w-full h-52 rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border-2 border-amber-500/40 relative overflow-hidden shadow-2xl group flex flex-col justify-between p-3">
            
            {/* Animated Space / Starburst Gameplay Media Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.35),transparent_70%)] animate-pulse" />
            
            {/* Floating Stars Video Simulation Effect */}
            <div className="absolute top-4 left-6 text-2xl animate-bounce">⭐</div>
            <div className="absolute top-12 right-8 text-3xl animate-pulse text-yellow-300">💥</div>
            <div className="absolute bottom-10 left-12 text-xl animate-spin">✨</div>
            <div className="absolute top-6 right-16 text-xs bg-red-600 text-white font-black px-2 py-0.5 rounded-md shadow uppercase tracking-wider">
              COMBO x10!
            </div>

            {/* Top Video Overlay Controls */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700/80 flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-amber-300" /> Video HD
              </span>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 bg-slate-950/80 hover:bg-slate-900 rounded-lg text-slate-300 border border-slate-700/80"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>

            {/* Center Visual Game Ad Showcase */}
            <div className="relative z-10 flex flex-col items-center my-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-3xl shadow-2xl border-2 border-yellow-200 group-hover:scale-105 transition-transform">
                🚀
              </div>
              <h4 className="text-base font-black text-white tracking-tight mt-1 drop-shadow-md">
                STAR TAP: COSMIC ODYSSEY
              </h4>
              <p className="text-[11px] text-amber-300 font-bold">
                ¡El juego arcade #1 de galaxias!
              </p>
            </div>

            {/* Video Timeline Progress Bar */}
            <div className="relative z-10 w-full space-y-1">
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-300">
                <span>Anuncio publicitario</span>
                <span>0:0{5 - countdown} / 0:05</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ad Sponsor App Info & Install Section */}
          <div className="w-full p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow font-bold text-slate-950 border border-yellow-200">
                ⭐
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white">Star Tap Official</span>
                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>4.9 ★★★★★ (1.2M)</span>
                </div>
              </div>
            </div>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleSkip}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-400/40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar</span>
            </a>
          </div>

          {/* Welcome Bonus Reward Banner */}
          <div className="w-full py-2 px-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center gap-2 text-xs font-black text-amber-300 shadow-inner">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Recompensa activa: +150 Monedas de Regalo</span>
          </div>

        </div>

        {/* Bottom CTA Action Button */}
        <div className="w-full p-3 bg-slate-950/95 border-t border-slate-800/80">
          <button
            onClick={handleSkip}
            disabled={!canSkip}
            className={`w-full py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
              canSkip
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-xl hover:brightness-110 active:scale-95 border border-yellow-300/60 uppercase'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <span>{canSkip ? 'Reclamar +150 🪙 y Jugar' : `Reproduciendo Anuncio... (${countdown}s)`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
