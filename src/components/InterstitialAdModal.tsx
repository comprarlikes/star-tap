import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Sparkles, Play, Volume2, VolumeX, Star, Download, Gamepad2, Tv, Trophy, Loader2 } from 'lucide-react';
import { soundManager } from '../services/sound';
import { prepareAndShowInterstitialAd, subscribeAdState } from '../services/admob';

interface InterstitialAdModalProps {
  onClose: () => void;
}

export const InterstitialAdModal: React.FC<InterstitialAdModalProps> = ({ onClose }) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [canClose, setCanClose] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isAdReady, setIsAdReady] = useState<boolean>(false);
  const [isAdLoadingState, setIsAdLoadingState] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to AdMob state updates
    const unsubscribe = subscribeAdState((ready, loading) => {
      setIsAdReady(ready);
      setIsAdLoadingState(loading);
    });

    // Trigger native or web ad preparation
    prepareAndShowInterstitialAd().then((shownNatively) => {
      console.log(`[AdMob Interstitial] Native SDK trigger result: ${shownNatively}`);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAdReady) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdReady]);

  const handleClose = () => {
    soundManager.playButtonClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex flex-col items-center justify-between bg-slate-950 text-white animate-fade-in p-3 sm:p-5 overflow-hidden select-none">
      
      {/* Top AdMob Interstitial Full-Screen Header */}
      <div className="w-full max-w-lg flex items-center justify-between pt-1 px-2 z-20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Intersticial Bonificado AdMob
          </span>
          <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
            ca-app-pub-4623925469377930/5770819509
          </span>
        </div>

        {canClose ? (
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-xl border border-yellow-200 transition-all active:scale-90 font-black"
            aria-label="Cerrar Anuncio"
          >
            <X className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-400">
            <span>{isAdReady ? `El anuncio termina en ${countdown}s` : 'Cargando AdMob...'}</span>
          </div>
        )}
      </div>

      {/* Loading Ad State Indicator */}
      {!isAdReady ? (
        <div className="w-full max-w-md my-auto flex flex-col items-center justify-center text-center bg-slate-900 border-2 border-amber-500/30 rounded-[2.5rem] shadow-2xl p-8 space-y-5 min-h-[380px]">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <Loader2 className="w-8 h-8 text-amber-400 animate-pulse absolute" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white tracking-wide">Cargando Anuncio... / Loading Ad...</h3>
            <p className="text-xs text-slate-400 font-mono">Conectando con red publicitaria de Google AdMob</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-[11px] text-amber-300 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Esperando confirmación onAdLoaded...</span>
          </div>
        </div>
      ) : (
        /* Main Full-Screen Video Ad Creative Canvas */
        <div
          id="admob-ad-container"
          style={{ minHeight: '500px', width: '100%' }}
          className="w-full max-w-md my-auto flex flex-col items-center text-center bg-slate-900 border-2 border-amber-500/40 rounded-[2.5rem] shadow-2xl relative overflow-hidden min-h-[500px]"
        >
          
          {/* Animated Video Stream Visual Container */}
          <div
            id="admob-video-stream-container"
            style={{ minHeight: '256px', width: '100%' }}
            className="w-full h-64 min-h-[256px] bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950 relative overflow-hidden flex flex-col justify-between p-4 border-b border-slate-800"
          >
            
            {/* Cosmic Nebula & Starburst Background Simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.3),transparent_70%)] animate-pulse" />
            
            {/* Gameplay Action Floating Items in Ad Video */}
            <div className="absolute top-6 left-8 text-3xl animate-bounce">⭐</div>
            <div className="absolute top-16 right-10 text-4xl animate-pulse text-amber-300">💎</div>
            <div className="absolute bottom-12 left-12 text-2xl animate-spin">🌟</div>
            
            <div className="absolute top-8 right-8 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-lg shadow-lg border border-yellow-200">
              RECORD +99,990!
            </div>

            {/* Top Video Overlay Bar */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/80 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 shadow">
                <Tv className="w-3 h-3 text-amber-400" /> Anuncio de Video HD
              </span>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 bg-slate-950/80 hover:bg-slate-900 rounded-lg text-slate-300 border border-slate-700"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>
            </div>

            {/* Center Visual Ad Showcase Hero */}
            <div className="relative z-10 flex flex-col items-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center text-4xl shadow-2xl border-2 border-yellow-200 animate-pulse">
                🌌
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-2 drop-shadow-md">
                GALAXY CONQUEST 3D
              </h3>
              <p className="text-xs text-amber-300 font-bold mt-0.5">
                ¡Batallas Espaciales en Tiempo Real!
              </p>
            </div>

            {/* Video Playback Progress Bar */}
            <div className="relative z-10 w-full space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-300">
                <span>Reproduciendo Video Ad...</span>
                <span>0:0{5 - countdown} / 0:05</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-amber-400 transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Ad Details & Screenshot Gallery */}
          <div className="p-5 w-full flex flex-col items-center space-y-4">
            
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-2xl shadow border border-pink-400/50">
                  🎮
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black text-white">Galaxy Conquest</span>
                  <span className="text-xs text-slate-400 font-medium">Estudio Patrocinador AdMob</span>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-extrabold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>4.9 ★ (5,000,000+ jugadores)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gameplay Screenshot Previews */}
            <div className="grid grid-cols-3 gap-2 w-full">
              <div className="h-16 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-2xl shadow">
                🚀
              </div>
              <div className="h-16 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-2xl shadow">
                👾
              </div>
              <div className="h-16 rounded-xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-2xl shadow">
                💥
              </div>
            </div>

            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClose}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-emerald-400/40 transition-all active:scale-95 uppercase tracking-wide"
            >
              <Download className="w-4 h-4" />
              <span>Instalar Gratis en Google Play</span>
            </a>

            <button
              onClick={handleClose}
              disabled={!canClose}
              className={`w-full py-3 rounded-2xl font-black text-xs tracking-wide transition-all shadow-md ${
                canClose
                  ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              {canClose ? 'Volver al Juego' : `Cerrando en ${countdown}s...`}
            </button>

          </div>
        </div>
      )}

      {/* Bottom Legal SDK Identifier */}
      <div className="w-full max-w-md pb-1 text-center text-[10px] text-slate-500 font-mono">
        Google Mobile Ads SDK • Ad Unit ID: ca-app-pub-4623925469377930/5770819509
      </div>
    </div>
  );
};

