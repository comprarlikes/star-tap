import React, { useEffect, useState, useRef } from 'react';
import { Trophy, Swords, Zap, Flame, Shield, Sparkles, FastForward, Flag, Target, Crosshair, Radio } from 'lucide-react';
import { PlayerState, GhostRival } from '../types';
import { getAvatarById } from '../data/avatars';
import { AnimatedAvatar } from './AnimatedAvatar';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface DuelVersusShowdownProps {
  playerState: PlayerState;
  rival: GhostRival;
  isFriend?: boolean;
  language?: 'es' | 'en';
  onIntroComplete: () => void;
}

export const DuelVersusShowdown: React.FC<DuelVersusShowdownProps> = ({
  playerState,
  rival,
  isFriend = false,
  language = 'es',
  onIntroComplete,
}) => {
  const isEn = language === 'en';
  const [phase, setPhase] = useState<'showdown' | 'countdown'>('showdown');
  const [count, setCount] = useState<number>(3);
  const [hasImpactFlashed, setHasImpactFlashed] = useState<boolean>(true);
  const [screenShake, setScreenShake] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const completedRef = useRef<boolean>(false);

  // Safely trigger finish only once
  const triggerComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    soundManager.playButtonClick();
    onIntroComplete();
  };

  // Keyboard shortcut listener (Space, Enter, Escape to skip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
        e.preventDefault();
        triggerComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Flash & screen rumble cleanup
  useEffect(() => {
    const tFlash = setTimeout(() => setHasImpactFlashed(false), 220);
    const tShake = setTimeout(() => setScreenShake(false), 550);
    return () => {
      clearTimeout(tFlash);
      clearTimeout(tShake);
    };
  }, []);

  // High-performance AAA Particle, Lightning & Shockwave Canvas VFX
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // 1. Warp Speed Star Streaks
    const warpStars: Array<{
      x: number;
      y: number;
      z: number;
      pz: number;
      color: string;
    }> = [];

    const starColors = ['#38bdf8', '#818cf8', '#f43f5e', '#fbbf24', '#ffffff', '#c084fc'];
    const numStars = 65;
    for (let i = 0; i < numStars; i++) {
      warpStars.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * width,
        pz: width,
        color: starColors[i % starColors.length],
      });
    }

    // 2. High-energy Sparks & Embers
    const sparks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      life: number;
      maxLife: number;
    }> = [];

    const sparkColors = ['#f59e0b', '#fbbf24', '#f43f5e', '#38bdf8', '#ffffff'];
    for (let i = 0; i < 75; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      sparks.push({
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: Math.random() * 3 + 1.2,
        color: sparkColors[i % sparkColors.length],
        alpha: Math.random() * 0.9 + 0.3,
        life: Math.random() * 40,
        maxLife: Math.random() * 60 + 50,
      });
    }

    // 3. Shockwave Rings
    const shockwaves: Array<{
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      color: string;
      lineWidth: number;
      alpha: number;
    }> = [
      {
        x: width / 2,
        y: height / 2,
        radius: 10,
        maxRadius: Math.min(width, height) * 0.75,
        color: '#fbbf24',
        lineWidth: 6,
        alpha: 0.9,
      },
      {
        x: width / 2,
        y: height / 2,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.9,
        color: '#38bdf8',
        lineWidth: 4,
        alpha: 0.7,
      },
    ];

    // 4. Procedural Lightning Generator
    let lightningTimer = 0;
    const lightningArcs: Array<{
      points: Array<{ x: number; y: number }>;
      color: string;
      alpha: number;
    }> = [];

    const createLightningArc = () => {
      const startX = width / 2 + (Math.random() - 0.5) * 80;
      const startY = 0;
      const endX = width / 2 + (Math.random() - 0.5) * 80;
      const endY = height;

      const points: Array<{ x: number; y: number }> = [{ x: startX, y: startY }];
      const segments = 10;
      for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 45;
        const y = startY + (endY - startY) * t;
        points.push({ x, y });
      }
      points.push({ x: endX, y: endY });

      lightningArcs.push({
        points,
        color: Math.random() > 0.5 ? '#38bdf8' : '#f59e0b',
        alpha: 1.0,
      });
    };

    let startTime = performance.now();

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      // Draw Warp Speed Starfield
      warpStars.forEach((star) => {
        star.z -= 14;
        if (star.z <= 0) {
          star.z = width;
          star.pz = width;
          star.x = (Math.random() - 0.5) * width * 1.5;
          star.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 220 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const prevK = 220 / star.pz;
        const prevPx = star.x * prevK + cx;
        const prevPy = star.y * prevK + cy;
        star.pz = star.z;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.save();
          ctx.strokeStyle = star.color;
          ctx.lineWidth = Math.min(2.5, (1 - star.z / width) * 3);
          ctx.globalAlpha = Math.min(0.8, (1 - star.z / width) * 1.2);
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Draw Shockwaves
      shockwaves.forEach((sw) => {
        if (sw.radius < sw.maxRadius) {
          sw.radius += 10;
          sw.alpha *= 0.94;

          ctx.save();
          ctx.globalAlpha = sw.alpha;
          ctx.strokeStyle = sw.color;
          ctx.lineWidth = sw.lineWidth;
          ctx.shadowColor = sw.color;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Draw Procedural Lightning Arcs along Center Seam
      lightningTimer++;
      if (lightningTimer % 22 === 0) {
        createLightningArc();
      }

      for (let i = lightningArcs.length - 1; i >= 0; i--) {
        const arc = lightningArcs[i];
        arc.alpha -= 0.08;
        if (arc.alpha <= 0) {
          lightningArcs.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = arc.alpha;
        ctx.strokeStyle = arc.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        arc.points.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Draw Sparks and Embers
      sparks.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08; // subtle gravity
        s.vx *= 0.98; // air drag
        s.life++;

        if (s.life > s.maxLife || s.x < 0 || s.x > width || s.y > height) {
          s.x = cx + (Math.random() - 0.5) * 60;
          s.y = cy + (Math.random() - 0.5) * 60;
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6 + 1.5;
          s.vx = Math.cos(angle) * speed;
          s.vy = Math.sin(angle) * speed - 1;
          s.life = 0;
        }

        const alpha = (1 - s.life / s.maxLife) * s.alpha;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Anamorphic Horizontal Flare on Center Collision
      ctx.save();
      const grad = ctx.createLinearGradient(cx - 300, cy, cx + 300, cy);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.4)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.7, 'rgba(244, 63, 94, 0.4)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(cx - 300, cy - 1.5, 600, 3);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Showdown Cinematic Timings & Audio Sequences
  useEffect(() => {
    // Initial Clash Sound & Haptic
    soundManager.playVersusClash();
    hapticManager.heavyTap();

    // Transition to 3-2-1 Countdown after 2.5s
    const tShowdown = setTimeout(() => {
      setPhase('countdown');
      setCount(3);
      soundManager.playCountdownTick();
    }, 2500);

    const t2 = setTimeout(() => {
      setCount(2);
      soundManager.playCountdownTick();
      hapticManager.lightTap();
    }, 3400);

    const t1 = setTimeout(() => {
      setCount(1);
      soundManager.playCountdownTick();
      hapticManager.mediumTap();
    }, 4300);

    const tGo = setTimeout(() => {
      setCount(0);
      setScreenShake(true);
      soundManager.playCountdownGo();
      hapticManager.heavyTap();
    }, 5200);

    const tFinish = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onIntroComplete();
      }
    }, 5900);

    return () => {
      clearTimeout(tShowdown);
      clearTimeout(t2);
      clearTimeout(t1);
      clearTimeout(tGo);
      clearTimeout(tFinish);
    };
  }, [onIntroComplete]);

  // Find avatar item or fallback for rival
  const rivalAvatarItem = getAvatarById(rival.avatar);

  // Power Ratio calculation for dynamic telemetry bar
  const playerScore = Math.max(playerState.stats.highestScore || 100, 100);
  const rivalScore = Math.max(rival.score || 100, 100);
  const totalPower = playerScore + rivalScore;
  const playerPowerPercent = Math.round((playerScore / totalPower) * 100);
  const rivalPowerPercent = 100 - playerPowerPercent;

  // Dynamic tips for countdown screen
  const duelTips = isEn
    ? [
        'Build 4+ slice combos to trigger Cosmic Fever!',
        'Avoid hazardous space bombs to maintain your multiplier!',
        'Slice rainbow stars for instant high-score power surges!',
      ]
    : [
        '¡Encadena combos de 4+ para activar la Fiebre Cósmica!',
        '¡Evita las bombas estelares para proteger tu multiplicador!',
        '¡Corta estrellas arcoíris para obtener ráfagas de puntuación!',
      ];

  const currentTip = duelTips[count % duelTips.length];

  return (
    <div
      className={`fixed inset-0 z-[70] flex flex-col justify-between bg-slate-950 overflow-hidden select-none animate-fade-in ${
        screenShake ? 'animate-screen-rumble' : ''
      }`}
    >
      {/* 1. White Impact Flash Layer */}
      {hasImpactFlashed && (
        <div className="absolute inset-0 bg-white z-[80] pointer-events-none transition-opacity duration-300 opacity-90 animate-fade-out" />
      )}

      {/* 2. Visual FX Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />

      {/* 3. Cosmic Dual-Tone Ambient Backdrops with Hex & Grid Shading */}
      <div className="absolute inset-0 pointer-events-none flex z-0">
        <div className="w-1/2 h-full bg-gradient-to-br from-cyan-950/80 via-blue-950/40 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        </div>
        <div className="w-1/2 h-full bg-gradient-to-bl from-rose-950/80 via-purple-950/40 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        </div>
      </div>

      {/* 4. Diagonal Energy Seam Divider */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-cyan-400 via-amber-300 to-rose-500 pointer-events-none z-[2] animate-energy-divider opacity-70 hidden md:block" />

      {/* =========================================================================
          TOP ANAMORPHIC CINEMATIC LETTERBOX BAR
          ========================================================================= */}
      <div className="relative z-30 w-full px-4 sm:px-8 pt-3 pb-3 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent border-b border-slate-800/80 flex items-center justify-between backdrop-blur-md">
        {/* Match Tier & Mode Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-900/90 border border-purple-500/40 shadow-inner">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-purple-200 uppercase">
              {isFriend
                ? (isEn ? 'FRIEND 1v1 DIRECT CLASH' : 'DESAFÍO DIRECTO CON AMIGO')
                : (isEn ? 'GHOST RIVAL DUEL // TIER I' : 'DUELO 1v1 // RIVAL FANTASMA')}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SYNC: 60 FPS // LOW LATENCY</span>
          </div>
        </div>

        {/* Tactical Skip Button with Key Hint */}
        <button
          onClick={triggerComplete}
          className="group px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-slate-900/90 via-slate-800 to-slate-900/90 hover:from-amber-950/80 hover:to-slate-800 border border-slate-700/80 hover:border-amber-400/80 text-slate-300 hover:text-amber-300 font-black text-xs flex items-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer backdrop-blur"
          title={isEn ? 'Skip intro (Space / Esc)' : 'Saltar intro (Espacio / Esc)'}
        >
          <span>{isEn ? 'SKIP' : 'SALTAR'}</span>
          <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded bg-slate-950/80 border border-slate-700 text-[9px] text-slate-400 font-mono">
            ESC
          </kbd>
        </button>
      </div>

      {/* =========================================================================
          MAIN CINEMATIC ARENA SHOWDOWN VIEWPORT
          ========================================================================= */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-8 z-20 max-w-7xl mx-auto w-full">
        {phase === 'showdown' ? (
          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 my-auto">
            {/* -------------------------------------------------------------
                LEFT FIGHTER: PLAYER 1 (Cyan / Electric Blue Theme)
                ------------------------------------------------------------- */}
            <div className="w-full md:flex-1 flex flex-col items-center md:items-start animate-slide-in-left">
              {/* Fighter Calling Card */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/95 via-cyan-950/40 to-slate-950/90 border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.3)] backdrop-blur-xl overflow-hidden group">
                {/* Specular Card Shine Sweep */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-[120%] h-[300%] bg-gradient-to-r from-transparent via-cyan-300/15 to-transparent animate-card-shine" />
                </div>

                {/* Tactical Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-black text-[10px] uppercase tracking-widest">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>{isEn ? 'YOU (CHALLENGER)' : 'TÚ (DESAFIANTE)'}</span>
                  </span>

                  <span className="text-[10px] font-mono font-bold text-cyan-400/80">
                    ID #{playerState.name.slice(0, 4).toUpperCase()}
                  </span>
                </div>

                {/* Avatar with Floating Holographic Pedestal */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <div className="relative p-1.5 rounded-2xl bg-gradient-to-b from-cyan-400/30 to-blue-600/30 border border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                      <AnimatedAvatar avatarId={playerState.avatar} size="xl" showBadge={false} />
                    </div>

                    {/* Level Pill */}
                    <div className="absolute -bottom-2 -right-1 bg-slate-950 px-2 py-0.5 rounded-full border border-cyan-400 text-cyan-300 text-[10px] font-black shadow-lg flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-cyan-400 fill-cyan-400" />
                      <span>{playerState.level}</span>
                    </div>
                  </div>

                  {/* Player Credentials & Stats */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate drop-shadow-md">
                      {playerState.name}
                    </h3>

                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{playerState.stats.highestScore.toLocaleString()} pts</span>
                      </div>

                      {playerState.stats.highestCombo && playerState.stats.highestCombo > 4 ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-black text-orange-400">
                          <Flame className="w-3 h-3 fill-orange-400 shrink-0" />
                          <span>Max Combo x{playerState.stats.highestCombo}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Tactical Power Bar */}
                <div className="mt-3.5 pt-3 border-t border-cyan-900/40">
                  <div className="flex justify-between items-center text-[10px] font-mono text-cyan-300 mb-1">
                    <span className="font-bold uppercase tracking-wider">{isEn ? 'POWER RATING' : 'POTENCIA'}</span>
                    <span className="font-black text-cyan-200">{playerPowerPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-cyan-500/30 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_#06b6d4] transition-all duration-700"
                      style={{ width: `${playerPowerPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                CENTER: AAA 3D METALLIC VS EMBLEM & TARGET MISSION BADGE
                ------------------------------------------------------------- */}
            <div className="shrink-0 flex flex-col items-center justify-center my-2 md:my-0 relative z-30 animate-scale-up">
              {/* Dual Cosmic Glow Rings */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-r from-cyan-500 via-amber-500 to-rose-500 opacity-40 blur-2xl animate-avatar-pulse" />

                {/* 3D Metallic VS Emblem Medallion */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-500 p-1 shadow-[0_0_50px_rgba(245,158,11,0.85)] border-2 border-yellow-200/80 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center border border-amber-400/40 relative overflow-hidden">
                    {/* Rotating Radar Sweep */}
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.25)_60deg,transparent_120deg)] animate-radar-scan pointer-events-none" />

                    <span className="text-4xl sm:text-5xl font-black italic tracking-tighter bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      VS
                    </span>
                  </div>
                </div>
              </div>

              {/* Holographic Target Score Mission Badge */}
              <div className="mt-3 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/90 via-slate-900/95 to-rose-950/90 border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="text-center">
                  <div className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
                    {isEn ? 'TARGET TO BEAT' : 'META A SUPERAR'}
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white tracking-wider">
                    {rival.score.toLocaleString()} PTS
                  </div>
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                RIGHT FIGHTER: RIVAL / FRIEND (Ruby / Solar Gold Theme)
                ------------------------------------------------------------- */}
            <div className="w-full md:flex-1 flex flex-col items-center md:items-end animate-slide-in-right">
              {/* Fighter Calling Card */}
              <div className="relative w-full max-w-[340px] sm:max-w-[380px] p-4 sm:p-5 rounded-2xl bg-gradient-to-bl from-slate-900/95 via-rose-950/40 to-slate-950/90 border-2 border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.3)] backdrop-blur-xl overflow-hidden group">
                {/* Specular Card Shine Sweep */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-[120%] h-[300%] bg-gradient-to-r from-transparent via-rose-300/15 to-transparent animate-card-shine" />
                </div>

                {/* Tactical Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-rose-400/80">
                    {rival.flag || '🌍'} {isFriend ? 'FRIEND' : 'GHOST'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-400/40 text-rose-300 font-black text-[10px] uppercase tracking-widest">
                    <Shield className="w-3 h-3 text-rose-400" />
                    <span>{isFriend ? (isEn ? 'FRIEND RIVAL' : 'AMIGO RIVAL') : (isEn ? 'GHOST RIVAL' : 'RIVAL FANTASMA')}</span>
                  </span>
                </div>

                {/* Avatar with Floating Holographic Pedestal */}
                <div className="flex items-center gap-4 flex-row-reverse md:flex-row">
                  <div className="relative shrink-0">
                    <div className="relative p-1.5 rounded-2xl bg-gradient-to-b from-rose-400/30 to-purple-600/30 border border-rose-400/60 shadow-[0_0_25px_rgba(244,63,94,0.5)]">
                      <AnimatedAvatar
                        avatarItem={rivalAvatarItem}
                        avatarId={rival.avatar}
                        size="xl"
                        showBadge={false}
                      />
                    </div>

                    {/* Level Pill */}
                    <div className="absolute -bottom-2 -left-1 bg-slate-950 px-2 py-0.5 rounded-full border border-rose-400 text-rose-300 text-[10px] font-black shadow-lg flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
                      <span>{rival.level || 5}</span>
                    </div>
                  </div>

                  {/* Rival Credentials & Stats */}
                  <div className="flex-1 min-w-0 text-right md:text-left">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate drop-shadow-md">
                      {rival.name}
                    </h3>

                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-end md:justify-start gap-1.5 text-xs font-black text-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{rival.score.toLocaleString()} pts</span>
                      </div>

                      <div className="flex items-center justify-end md:justify-start gap-1.5 text-[11px] font-black text-rose-400">
                        <Target className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{isEn ? 'Record to Defeat' : 'Récord a Derrotar'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tactical Power Bar */}
                <div className="mt-3.5 pt-3 border-t border-rose-900/40">
                  <div className="flex justify-between items-center text-[10px] font-mono text-rose-300 mb-1">
                    <span className="font-black text-rose-200">{rivalPowerPercent}%</span>
                    <span className="font-bold uppercase tracking-wider">{isEn ? 'RIVAL POWER' : 'POTENCIA RIVAL'}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-rose-500/30 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-rose-500 to-amber-500 shadow-[0_0_10px_#f43f5e] transition-all duration-700"
                      style={{ width: `${rivalPowerPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             COUNTDOWN STAGE: 3 - 2 - 1 - ¡A JUGAR! / FIGHT!
             ========================================================================= */
          <div className="flex flex-col items-center justify-center text-center z-30 animate-scale-up select-none p-4 max-w-lg mx-auto">
            {/* Pulsing Core Shockwave Ring */}
            <div className="relative flex items-center justify-center mb-6">
              <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-rose-500 blur-2xl opacity-70 animate-ping" />

              {/* 3D Chrome Number Card */}
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-orange-500 p-1 shadow-[0_0_90px_rgba(245,158,11,0.95)] border-4 border-yellow-100">
                <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-orange-500 drop-shadow-2xl">
                    {count === 0 ? '⚔️' : count}
                  </div>
                </div>
              </div>
            </div>

            {/* Kinetic Typography Status */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-widest uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
              {count === 0
                ? (isEn ? 'COSMIC DUEL!' : '¡DUELO CÓSMICO!')
                : (isEn ? 'GET READY...' : '¡A POSICIONES...!')}
            </h1>

            {/* Tactical Pro-Tip Banner */}
            <div className="mt-4 px-5 py-2 rounded-2xl bg-slate-900/90 border border-yellow-400/40 text-yellow-300 font-bold text-xs sm:text-sm tracking-wide shadow-2xl flex items-center gap-2 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
              <span>{currentTip}</span>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM ANAMORPHIC CINEMATIC TELEMETRY BAR
          ========================================================================= */}
      <div className="relative z-30 w-full px-4 sm:px-8 py-2.5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Swords className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold text-slate-300">
            {isEn ? 'RULES: CLASSIC HIGH-SCORE SURPASS' : 'REGLAS: SUPERAR PUNTUACIÓN OBJETIVO'}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <span>{isEn ? 'ARENA: ORBITAL VOID' : 'ARENA: VACÍO ORBITAL'}</span>
          <span>•</span>
          <span className="text-amber-300 font-bold">REWARD: +50 🏆 + EXP</span>
        </div>
      </div>
    </div>
  );
};
