import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Swords, Zap, Flame, Shield, Sparkles } from 'lucide-react';
import { PlayerState, MultiplayerArena, MultiplayerOpponent } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface MultiplayerVersusShowdownProps {
  playerState: PlayerState;
  opponent: MultiplayerOpponent;
  arena: MultiplayerArena;
  language?: 'es' | 'en';
  onIntroComplete: () => void;
}

export const MultiplayerVersusShowdown: React.FC<MultiplayerVersusShowdownProps> = ({
  playerState,
  opponent,
  arena,
  language = 'es',
  onIntroComplete,
}) => {
  const [phase, setPhase] = useState<'showdown' | 'countdown'>('showdown');
  const [count, setCount] = useState<number>(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background Cosmic Ray & Lightning Canvas Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Rays
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
    }> = [];

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 4 + 1,
        color: i % 2 === 0 ? '#38bdf8' : '#ec4899',
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle rays
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Showdown Cinematic Sequence
  useEffect(() => {
    // Initial VS Clash Impact Sound & Haptic
    soundManager.playVersusClash();
    hapticManager.heavyTap();

    // Transition to 3-2-1 Countdown after 2.4s
    const tShowdown = setTimeout(() => {
      setPhase('countdown');
      setCount(3);
      soundManager.playCountdownTick();
    }, 2400);

    const t2 = setTimeout(() => {
      setCount(2);
      soundManager.playCountdownTick();
      hapticManager.lightTap();
    }, 3300);

    const t1 = setTimeout(() => {
      setCount(1);
      soundManager.playCountdownTick();
      hapticManager.mediumTap();
    }, 4200);

    const tGo = setTimeout(() => {
      setCount(0);
      soundManager.playCountdownGo();
      hapticManager.heavyTap();
    }, 5100);

    const tFinish = setTimeout(() => {
      onIntroComplete();
    }, 5800);

    return () => {
      clearTimeout(tShowdown);
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tGo);
      clearTimeout(tFinish);
    };
  }, [onIntroComplete]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950 overflow-hidden select-none animate-fade-in">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />

      {/* Arena Title Badge on Top */}
      <div className="absolute top-6 inset-x-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-purple-500/40 text-purple-300 font-extrabold text-xs tracking-widest uppercase shadow-xl flex items-center gap-2">
          <span>{arena.icon}</span>
          <span>{language === 'en' ? arena.nameEn : arena.name}</span>
          <span>•</span>
          <span className="text-amber-300">Premio: {arena.prizeCoins} 🪙</span>
        </div>
      </div>

      {phase === 'showdown' ? (
        /* Cinematic VS Split Screen */
        <div className="relative w-full h-full flex flex-col sm:flex-row items-center justify-between p-4 sm:p-12 z-10 max-w-5xl">
          {/* Left Fighter: PLAYER (Cyan/Blue Theme) */}
          <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left animate-slide-in-left w-full sm:w-auto my-auto">
            <div className="relative mb-3">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-cyan-600 via-blue-500 to-indigo-600 p-1.5 shadow-[0_0_50px_rgba(6,182,212,0.6)] border-2 border-cyan-300 animate-pulse flex items-center justify-center text-5xl sm:text-6xl">
                {playerState.avatar || '⭐'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-950 px-3 py-1 rounded-full border border-cyan-400 text-cyan-300 text-xs font-black shadow">
                Nivel {playerState.level}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">TÚ (JUGADOR)</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow truncate max-w-[200px]">
                {playerState.name}
              </h2>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 shadow">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  {playerState.trophies || 0} 🏆
                </span>
                {playerState.stats.multiplayerStreak && playerState.stats.multiplayerStreak > 1 ? (
                  <span className="text-xs font-black text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-500/40 flex items-center gap-1 shadow">
                    <Flame className="w-3 h-3 fill-orange-400" />
                    x{playerState.stats.multiplayerStreak}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Center VS Emblem Explosion */}
          <div className="my-4 sm:my-auto flex flex-col items-center justify-center relative z-20 animate-scale-up">
            <div className="relative flex items-center justify-center">
              {/* Pulsing Aura Rings */}
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 opacity-40 blur-xl animate-ping" />
              
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-rose-600 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.8)] border-4 border-yellow-200">
                <span className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tighter italic drop-shadow">
                  VS
                </span>
              </div>
            </div>

            <div className="mt-3 px-4 py-1 rounded-full bg-slate-900/90 border border-yellow-400/40 text-yellow-300 font-black text-xs uppercase tracking-widest shadow-lg">
              ¡DUELO 1v1 EN VIVO!
            </div>
          </div>

          {/* Right Fighter: OPPONENT (Red/Magenta Theme) */}
          <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right animate-slide-in-right w-full sm:w-auto my-auto">
            <div className="relative mb-3">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-rose-600 via-pink-600 to-purple-600 p-1.5 shadow-[0_0_50px_rgba(244,63,94,0.6)] border-2 border-rose-300 animate-pulse flex items-center justify-center text-5xl sm:text-6xl">
                {opponent.avatar}
              </div>
              <div className="absolute -bottom-2 -left-2 bg-slate-950 px-3 py-1 rounded-full border border-rose-400 text-rose-300 text-xs font-black shadow flex items-center gap-1">
                <span>{opponent.flag}</span>
                <span>Nivel {opponent.level}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-black text-rose-400 uppercase tracking-widest">RIVAL ESTELAR</div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow truncate max-w-[200px]">
                {opponent.name}
              </h2>
              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <span className="text-xs font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 shadow">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  {opponent.trophies} 🏆
                </span>
                {opponent.winStreak > 1 && (
                  <span className="text-xs font-black text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-500/40 flex items-center gap-1 shadow">
                    <Flame className="w-3 h-3 fill-orange-400" />
                    x{opponent.winStreak}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dramatic 3-2-1-¡A JUGAR! Arena Countdown */
        <div className="flex flex-col items-center justify-center text-center z-20 animate-scale-up select-none">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-44 h-44 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-rose-500 blur-2xl opacity-60 animate-ping" />
            
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-6xl sm:text-7xl font-black text-slate-950 shadow-[0_0_80px_rgba(245,158,11,0.9)] border-4 border-yellow-200 animate-bounce">
              {count === 0 ? '⚔️' : count}
            </div>
          </div>

          <div className="text-3xl sm:text-5xl font-black text-white tracking-widest drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] uppercase">
            {count === 0
              ? (language === 'en' ? 'COSMIC DUEL!' : '¡DUELO CÓSMICO!')
              : (language === 'en' ? 'GET READY...' : '¡A POSICIONES...!')}
          </div>

          <p className="mt-2 text-sm text-yellow-300 font-extrabold tracking-wider uppercase">
            ¡El primer jugador en dominar las estrellas ganará el botín!
          </p>
        </div>
      )}
    </div>
  );
};
