import React, { useState, useEffect } from 'react';
import { Sparkles, Play, ShieldCheck, Zap } from 'lucide-react';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface SplashScreenProps {
  onFinish: () => void;
  language?: 'es' | 'en';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, language = 'es' }) => {
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Iniciando motores cósmicos...');
  const [isReady, setIsReady] = useState(false);

  const tips = language === 'en' ? [
    'Initializing cosmic engines...',
    'Loading star textures & nebulas...',
    'Connecting to Google AdMob & Cloud Sync...',
    'Calibrating laser sensors...',
    'Universe ready to play!'
  ] : [
    'Iniciando motores cósmicos...',
    'Cargando texturas estelares y nebulosas...',
    'Sincronizando Google AdMob y Nube...',
    'Calibrando sensores galácticos...',
    '¡Universo listo para jugar!'
  ];

  useEffect(() => {
    // Progressive simulated loading for smooth professional entry
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 18) + 12;
        if (next >= 100) {
          clearInterval(interval);
          setStatusMessage(tips[tips.length - 1]);
          setIsReady(true);
          // Auto-advance after brief delay
          setTimeout(() => {
            handleEnter();
          }, 450);
          return 100;
        }

        const tipIndex = Math.min(
          tips.length - 2,
          Math.floor((next / 100) * (tips.length - 1))
        );
        setStatusMessage(tips[tipIndex]);
        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    onFinish();
  };

  return (
    <div 
      onClick={isReady ? handleEnter : undefined}
      className="fixed inset-0 z-[250] bg-slate-950 text-white flex flex-col justify-between items-center p-6 select-none overflow-hidden animate-fade-in font-sans cursor-pointer"
    >
      {/* Deep Space Background Glow & Nebula Flares */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-amber-500/25 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
        
        {/* Star Dots Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header Studio Tag */}
      <div className="relative z-10 pt-4 flex flex-col items-center gap-1.5 opacity-80">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full text-[11px] font-black tracking-widest uppercase text-amber-300 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
          <span>COSMIC ARCADE STUDIOS</span>
        </div>
      </div>

      {/* Center Hero Logo & Visual Animation */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 my-auto max-w-sm">
        {/* Glowing 3D Star Emblem */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 via-yellow-300 to-orange-500 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-6xl sm:text-7xl shadow-2xl shadow-amber-500/40 transform hover:scale-105 transition-transform duration-300">
            <span className="drop-shadow-[0_10px_25px_rgba(245,158,11,0.8)] animate-bounce">
              ⭐
            </span>
            <span className="absolute -top-1 -right-1 text-2xl animate-spin">✨</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-lg uppercase">
            STAR TAP LEGENDS
          </h1>
          <p className="text-xs sm:text-sm font-bold text-slate-300 tracking-wider uppercase flex items-center justify-center gap-1.5">
            <span className="text-amber-400">ARCADE EDITION</span>
            <span className="text-slate-600">•</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-md font-mono">
              v2.4.0 PRO
            </span>
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress & Ready CTA */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center space-y-3 pb-4">
        {isReady ? (
          <button
            onClick={handleEnter}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/30 border border-yellow-200 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase animate-pulse"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{language === 'en' ? 'TAP TO ENTER GALAXY' : 'TOCA PARA ENTRAR A LA GALAXIA'}</span>
          </button>
        ) : (
          <div className="w-full space-y-2">
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-200 ease-out shadow-[0_0_12px_rgba(251,191,36,0.9)]"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
              <span className="truncate max-w-[210px] text-slate-300 font-semibold">{statusMessage}</span>
              <span className="font-mono text-amber-400 font-bold">{progress}%</span>
            </div>
          </div>
        )}

        {/* Security & Partner Footprint */}
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-semibold pt-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Google AdMob & Firebase
          </span>
          <span>•</span>
          <span>Guardado Seguro</span>
        </div>
      </div>
    </div>
  );
};