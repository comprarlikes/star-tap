import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Smartphone, Trophy, Sparkles } from 'lucide-react';
import { t, Language } from '../i18n';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface InGamePauseModalProps {
  score: number;
  combo: number;
  maxCombo: number;
  starsTapped: number;
  diamondTapped: number;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  language?: Language;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  onToggleSound: () => void;
  onToggleHaptics: () => void;
}

export const InGamePauseModal: React.FC<InGamePauseModalProps> = ({
  score,
  combo,
  maxCombo,
  starsTapped,
  diamondTapped,
  soundEnabled,
  hapticsEnabled,
  language = 'es',
  onResume,
  onRestart,
  onExit,
  onToggleSound,
  onToggleHaptics,
}) => {
  const lang = language === 'en' ? 'en' : 'es';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-amber-500/40 rounded-[2.5rem] p-5 sm:p-6 text-white shadow-[0_0_50px_rgba(245,158,11,0.2)] relative overflow-hidden flex flex-col items-center text-center animate-scale-up">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Pause Icon Header */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-xl border border-yellow-200/50">
            ⏸️
          </div>
        </div>

        <h3 className="text-2xl font-black tracking-tight text-white mb-1 drop-shadow">
          {lang === 'en' ? 'GAME PAUSED' : 'JUEGO EN PAUSA'}
        </h3>
        <p className="text-xs text-slate-300 font-medium mb-3">
          {lang === 'en' ? 'Take a breath and continue when ready!' : '¡Toma un respiro y continúa cuando estés listo!'}
        </p>

        {/* Live Match Stats Snapshot */}
        <div className="w-full bg-slate-950/85 p-3.5 rounded-2xl border border-amber-500/30 mb-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              {lang === 'en' ? 'Current Score' : 'Puntuación Actual'}
            </span>
            <span className="text-base font-black text-amber-300 font-mono">
              {score.toLocaleString()} pts
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">Racha</span>
              <span className="text-yellow-300 font-black">{combo}x</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">Estrellas</span>
              <span className="text-amber-400 font-black">⭐ {starsTapped}</span>
            </div>
            <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-bold">Diamantes</span>
              <span className="text-cyan-300 font-black">💎 {diamondTapped}</span>
            </div>
          </div>
        </div>

        {/* Quick Audio & Haptics Toggles */}
        <div className="w-full grid grid-cols-2 gap-2 mb-3.5">
          <button
            type="button"
            onClick={() => {
              onToggleSound();
              soundManager.playButtonClick();
            }}
            className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black transition-all active:scale-95 cursor-pointer ${
              soundEnabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm'
                : 'bg-slate-950/80 text-slate-500 border-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundEnabled ? (lang === 'en' ? 'Audio ON' : 'Audio SI') : (lang === 'en' ? 'Audio OFF' : 'Audio NO')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleHaptics();
              soundManager.playButtonClick();
              if (!hapticsEnabled) hapticManager.mediumTap();
            }}
            className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-black transition-all active:scale-95 cursor-pointer ${
              hapticsEnabled
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-sm'
                : 'bg-slate-950/80 text-slate-500 border-slate-800'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${hapticsEnabled ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>{hapticsEnabled ? (lang === 'en' ? 'Vibration ON' : 'Vibración SI') : (lang === 'en' ? 'Vibration OFF' : 'Vibración NO')}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          {/* Resume Primary */}
          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              hapticManager.lightTap();
              onResume();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2 border border-emerald-300/50 uppercase tracking-wider cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>{lang === 'en' ? 'RESUME GAME' : 'REANUDAR JUEGO'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Restart Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.mediumTap();
                onRestart();
              }}
              className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 font-extrabold text-xs rounded-2xl border border-slate-700/80 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Restart' : 'Reiniciar'}</span>
            </button>

            {/* Exit to Menu Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.lightTap();
                onExit();
              }}
              className="py-2.5 px-3 bg-slate-950 hover:bg-rose-950/80 text-rose-300 hover:text-rose-100 font-extrabold text-xs rounded-2xl border border-rose-500/40 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Exit' : 'Salir'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
