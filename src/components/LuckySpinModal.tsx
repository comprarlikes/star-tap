import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Users, 
  Info, 
  Check, 
  Zap, 
  Timer,
  X
} from 'lucide-react';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface LuckySpinModalProps {
  playerState: PlayerState;
  language?: 'es' | 'en';
  onSpinRewardEarned: (reward: { coins: number; xp: number; label: string; icon: string }) => void;
  onWatchAdForSpin: () => void;
  onClose: () => void;
  onOpenDailyRewards?: () => void;
  onOpenFriends?: () => void;
}

interface WheelSegment {
  id: number;
  label: string;
  subLabel: string;
  coins: number;
  xp: number;
  iconType: 'gold_chest_top' | 'blue_chest' | 'ice_cube' | 'magenta_chest' | 'coin' | 'lightning_cube' | 'purple_chest' | 'stars_cluster';
  bgColor: string;
  isJackpot?: boolean;
}

// 12 sectors matching the exact reference screenshot clockwise starting at 12 o'clock (top)
const SEGMENTS: WheelSegment[] = [
  {
    id: 0,
    label: '10000+',
    subLabel: 'COINS!',
    coins: 10000,
    xp: 500,
    iconType: 'gold_chest_top',
    bgColor: '#eab308',
    isJackpot: true,
  },
  {
    id: 1,
    label: 'X5',
    subLabel: '',
    coins: 1000,
    xp: 300,
    iconType: 'blue_chest',
    bgColor: '#0284c7',
  },
  {
    id: 2,
    label: 'X3',
    subLabel: '',
    coins: 600,
    xp: 200,
    iconType: 'ice_cube',
    bgColor: '#0ea5e9',
  },
  {
    id: 3,
    label: '10000+',
    subLabel: 'COINS!',
    coins: 5000,
    xp: 400,
    iconType: 'magenta_chest',
    bgColor: '#d946ef',
  },
  {
    id: 4,
    label: '1500',
    subLabel: '',
    coins: 1500,
    xp: 100,
    iconType: 'coin',
    bgColor: '#0284c7',
  },
  {
    id: 5,
    label: 'X2',
    subLabel: '',
    coins: 500,
    xp: 250,
    iconType: 'lightning_cube',
    bgColor: '#1d4ed8',
  },
  {
    id: 6,
    label: '2500',
    subLabel: '',
    coins: 2500,
    xp: 150,
    iconType: 'coin',
    bgColor: '#c026d3',
  },
  {
    id: 7,
    label: '2500',
    subLabel: '',
    coins: 2500,
    xp: 150,
    iconType: 'coin',
    bgColor: '#9333ea',
  },
  {
    id: 8,
    label: 'X3',
    subLabel: '',
    coins: 800,
    xp: 200,
    iconType: 'purple_chest',
    bgColor: '#6b21a8',
  },
  {
    id: 9,
    label: '1000',
    subLabel: '',
    coins: 1000,
    xp: 80,
    iconType: 'coin',
    bgColor: '#2563eb',
  },
  {
    id: 10,
    label: 'X5',
    subLabel: '',
    coins: 600,
    xp: 300,
    iconType: 'stars_cluster',
    bgColor: '#1e3a8a',
  },
  {
    id: 11,
    label: '500',
    subLabel: '',
    coins: 500,
    xp: 50,
    iconType: 'coin',
    bgColor: '#1e40af',
  },
];

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  playerState,
  language = 'es',
  onSpinRewardEarned,
  onClose,
  onOpenDailyRewards,
  onOpenFriends,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<WheelSegment | null>(null);
  const [cooldownSec, setCooldownSec] = useState<number>(10);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const lang = language === 'en' ? 'en' : 'es';

  // Check if player used free spin today
  const lastSpinDate = localStorage.getItem('star_tap_last_spin_date');
  const todayStr = new Date().toISOString().split('T')[0];
  const hasFreeSpin = lastSpinDate !== todayStr;

  // 10s cooldown timer simulation matching the UI badge
  useEffect(() => {
    if (cooldownSec > 0) {
      const timer = setTimeout(() => setCooldownSec((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSec]);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);
    setShowRewardModal(false);

    soundManager.playButtonClick();
    hapticManager.heavyTap();

    // Weighted random selection:
    const rand = Math.random();
    let targetIndex = 0;
    if (rand < 0.05) {
      targetIndex = 0; // Jackpot 10000+ Top
    } else if (rand < 0.15) {
      targetIndex = 3; // 10000+ Magenta Chest
    } else {
      targetIndex = Math.floor(Math.random() * (SEGMENTS.length - 1)) + 1;
    }

    // Mathematical formula for rotation:
    // Sector 0 is at 12:00 (-90°).
    // Sector k is at -90° + k * 30°.
    // To align sector k with the top arrow (12:00 / -90°):
    // targetAngle = (360 - k * 30) % 360
    const fullTurns = 6 * 360; // 6 dramatic rotations
    const currentNormalized = rotation % 360;
    const targetNormalized = (360 - targetIndex * 30) % 360;
    let delta = targetNormalized - currentNormalized;
    if (delta <= 0) delta += 360;

    const newRotation = rotation + fullTurns + delta;
    setRotation(newRotation);

    // Realistic ticking sound as wheel spins
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundManager.playWheelSpin();
      tickCount++;
      if (tickCount > 32) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const chosen = SEGMENTS[targetIndex];
      setWonReward(chosen);
      setShowRewardModal(true);
      setCooldownSec(10);
      localStorage.setItem('star_tap_last_spin_date', todayStr);

      soundManager.playLevelUp();
      soundManager.playCoin();
      hapticManager.success();

      try {
        confetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.52 },
          colors: ['#00e5ff', '#ffd700', '#ff007f', '#a855f7', '#38bdf8'],
        });
      } catch {
        // Confetti fallback
      }

      onSpinRewardEarned({
        coins: chosen.coins,
        xp: chosen.xp,
        label: `${chosen.label} ${chosen.subLabel || '🪙'}`,
        icon: chosen.iconType === 'ice_cube' ? '❄️' : chosen.iconType === 'lightning_cube' ? '⚡' : '🪙',
      });
    }, 4200);
  };

  // High-fidelity vector illustrations inside SVG for each slice icon
  const renderSliceGraphic = (type: WheelSegment['iconType']) => {
    switch (type) {
      case 'gold_chest_top':
        return (
          <g>
            {/* Ornate purple & gold chest matching screenshot top slice */}
            <rect x="-11" y="-4" width="22" height="15" rx="3" fill="#6b21a8" stroke="#facc15" strokeWidth="1.4" />
            {/* Arched lid */}
            <path d="M -12 -3 C -12 -12 12 -12 12 -3 Z" fill="#9333ea" stroke="#facc15" strokeWidth="1.4" />
            {/* Golden banding & corner brackets */}
            <line x1="-11" y1="2" x2="11" y2="2" stroke="#fef08a" strokeWidth="1.2" />
            <rect x="-4" y="-3" width="8" height="7" rx="1.5" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
            {/* Crescent moon lock emblem */}
            <path d="M 0.5 -1 C 2 -0.5 2 2 0.5 2.5 C -0.5 2 -0.5 -0.5 0.5 -1" fill="#451a03" />
            {/* Gem glow */}
            <circle cx="0" cy="-6" r="1.5" fill="#fef08a" />
          </g>
        );

      case 'blue_chest':
        return (
          <g>
            {/* Frosted cyan chest with star emblem matching 1:00 */}
            <rect x="-10" y="-3" width="20" height="13" rx="2.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.3" />
            <path d="M -11 -2 C -11 -9 11 -9 11 -2 Z" fill="#0ea5e9" stroke="#7dd3fc" strokeWidth="1.3" />
            <line x1="-10" y1="2" x2="10" y2="2" stroke="#e0f2fe" strokeWidth="1" />
            <rect x="-3.5" y="-2" width="7" height="6" rx="1.5" fill="#e0f2fe" stroke="#0369a1" strokeWidth="0.8" />
            <path d="M 0 -0.5 L 0.8 1 L 2 1 L 1 1.8 L 1.4 3 L 0 2.2 L -1.4 3 L -1 1.8 L -2 1 L -0.8 1 Z" fill="#0284c7" />
          </g>
        );

      case 'ice_cube':
        return (
          <g>
            {/* Glowing 3D ice crystal block with embedded white snowflake matching 2:00 */}
            {/* Faceted ice cube */}
            <polygon points="-10,-4 0,-9 10,-4 0,1" fill="#a5f3fc" stroke="#38bdf8" strokeWidth="1" />
            <polygon points="-10,-4 0,1 0,11 -10,6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
            <polygon points="0,1 10,-4 10,6 0,11" fill="#0284c7" stroke="#0369a1" strokeWidth="1" />
            {/* Embossed glowing snowflake */}
            <path d="M 0,-3 L 0,7 M -5,2 L 5,2 M -4,-1 L 4,5 M -4,5 L 4,-1" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="0" cy="2" r="1.3" fill="#ffffff" />
          </g>
        );

      case 'magenta_chest':
        return (
          <g>
            {/* Golden & magenta chest matching 3:00 */}
            <rect x="-10" y="-3" width="20" height="13" rx="2.5" fill="#9d174d" stroke="#facc15" strokeWidth="1.3" />
            <path d="M -11 -2 C -11 -9 11 -9 11 -2 Z" fill="#be185d" stroke="#fde047" strokeWidth="1.3" />
            <line x1="-10" y1="2" x2="10" y2="2" stroke="#fef08a" strokeWidth="1" />
            <rect x="-3" y="-2" width="6" height="6" rx="1.5" fill="#facc15" stroke="#854d0e" strokeWidth="0.8" />
            <circle cx="0" cy="1" r="1.2" fill="#0284c7" />
          </g>
        );

      case 'lightning_cube':
        return (
          <g>
            {/* Electric cyan/blue cube with glowing yellow lightning bolt matching 5:00 */}
            <polygon points="-9,-4 0,-9 9,-4 0,1" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1" />
            <polygon points="-9,-4 0,1 0,11 -9,6" fill="#38bdf8" stroke="#0369a1" strokeWidth="1" />
            <polygon points="0,1 9,-4 9,6 0,11" fill="#0284c7" stroke="#075985" strokeWidth="1" />
            {/* Jagged electric bolt */}
            <path d="M 1,-2 L -3,2 L 0,2 L -2,7 L 4,1 L 1,1 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="0.6" />
          </g>
        );

      case 'purple_chest':
        return (
          <g>
            {/* Royal purple chest matching 8:00 */}
            <rect x="-9.5" y="-3" width="19" height="13" rx="2.5" fill="#581c87" stroke="#c084fc" strokeWidth="1.3" />
            <path d="M -10 -2 C -10 -9 10 -9 10 -2 Z" fill="#7e22ce" stroke="#e9d5ff" strokeWidth="1.3" />
            <line x1="-9.5" y1="2" x2="9.5" y2="2" stroke="#f3e8ff" strokeWidth="1" />
            <rect x="-3" y="-2" width="6" height="6" rx="1.5" fill="#f3e8ff" stroke="#6b21a8" strokeWidth="0.8" />
            <circle cx="0" cy="1" r="1.2" fill="#c084fc" />
          </g>
        );

      case 'stars_cluster':
        return (
          <g>
            {/* 5 shooting golden stars spray matching 10:00 */}
            {/* Center big star */}
            <path d="M 0,-6 L 1.5,-2 L 5.5,-2 L 2.5,0.5 L 3.5,4.5 L 0,2 L -3.5,4.5 L -2.5,0.5 L -5.5,-2 L -1.5,-2 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="0.6" />
            {/* Flanking smaller stars */}
            <path d="M -6,1 L -5,3 L -3,3 L -4.5,4.5 L -4,6.5 L -6,5 L -8,6.5 L -7.5,4.5 L -9,3 L -7,3 Z" fill="#fde047" />
            <path d="M 6,1 L 7,3 L 9,3 L 7.5,4.5 L 8,6.5 L 6,5 L 4,6.5 L 4.5,4.5 L 3,3 L 5,3 Z" fill="#fde047" />
            <path d="M -4,-6 L -3.5,-4.5 L -2,-4.5 L -3,-3.5 L -2.5,-2 L -4,-3 L -5.5,-2 L -5,-3.5 L -6,-4.5 L -4.5,-4.5 Z" fill="#fef08a" />
            <path d="M 4,-6 L 4.5,-4.5 L 6,-4.5 L 5,-3.5 L 5.5,-2 L 4,-3 L 2.5,-2 L 3,-3.5 L 2,-4.5 L 3.5,-4.5 Z" fill="#fef08a" />
          </g>
        );

      case 'coin':
      default:
        return (
          <g>
            {/* 3D beveled golden coin with star matching 4:00, 6:00, 7:00, 9:00, 11:00 */}
            <circle cx="0" cy="0" r="9" fill="#eab308" stroke="#854d0e" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="7.2" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            {/* Embossed star */}
            <path d="M 0,-4.5 L 1.2,-1.2 L 4.5,-1.2 L 2,0.8 L 3,4 L 0,2 L -3,4 L -2,0.8 L -4.5,-1.2 L -1.2,-1.2 Z" fill="#fef08a" stroke="#a16207" strokeWidth="0.5" />
          </g>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none font-sans text-white">
      <div className="relative w-full max-w-lg max-h-[92dvh] overflow-y-auto no-scrollbar bg-slate-900/98 border border-amber-500/40 ring-1 ring-amber-400/20 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col">
        {/* Holographic Top Laser Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-shimmer z-30" />

        {/* AAA Corner Telemetry Brackets */}
        <div className="aaa-hud-corner-tl text-amber-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-tr text-amber-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-bl text-cyan-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-br text-cyan-400/80 pointer-events-none" />

        {/* Modal Header Bento Tile */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <span className="text-xl">🎡</span>
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2 uppercase">
                {lang === 'en' ? 'CELESTIAL WHEEL' : 'RULETA CÓSMICA'}
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono uppercase">
                  DIARIA
                </span>
              </h3>
              <span className="text-xs text-amber-300 font-medium">
                {lang === 'en' ? 'Spin to win legendary coins & cosmic stardust' : 'Gira la ruleta cósmica y gana recompensas estelares'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-950/90 px-3 py-1.5 rounded-2xl border border-amber-500/40 text-amber-400 font-extrabold text-xs shadow-inner">
              <span className="text-sm">🪙</span>
              <span>{(playerState.coins || 0).toLocaleString()}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl text-slate-400 hover:text-white border border-slate-700/80 transition-all active:scale-95 cursor-pointer shadow"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body with Cosmic Accents & Wheel */}
        <div className="p-4 sm:p-5 flex flex-col items-center relative z-10">
          {/* Soft cosmic glow fields */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* 🚀 TOP AREA: Player Resource Bar */}
          <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center">

        {/* 👤 Player Status / Resource Bar matching screenshot */}
        <div className="w-full mt-2.5 px-3 py-2 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-slate-900/90 border border-cyan-500/60 rounded-2xl flex items-center justify-between shadow-lg text-xs">
          {/* Player name & Level */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] border border-yellow-200">
              <span className="text-lg">⭐</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white tracking-wide text-[11px] leading-tight">
                {playerState.name ? playerState.name.toUpperCase() : 'STAR_PLAYER'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-bold text-cyan-300 font-mono">
                  LEVEL {playerState.level || 28}
                </span>
                <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/40">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(25, (playerState.xp % 100)))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resources: Coins, Gems, Energy */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Coins */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-amber-500/40">
              <span className="text-amber-400 text-xs">🟡</span>
              <span className="font-mono font-black text-amber-300 text-[11px]">
                {(playerState.coins || 14500).toLocaleString()}
              </span>
            </div>

            {/* Gems / Diamonds */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-cyan-500/40">
              <span className="text-cyan-400 text-xs">💎</span>
              <span className="font-mono font-black text-cyan-300 text-[11px]">
                {(playerState.stardust || 210).toLocaleString()}
              </span>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-1 bg-cyan-600/30 px-2 py-1 rounded-xl border border-cyan-400/60 shadow-[0_0_8px_rgba(56,189,248,0.35)]">
              <Zap className="w-3.5 h-3.5 text-cyan-300 fill-cyan-400" />
              <span className="font-mono font-black text-white text-[11px]">
                {playerState.energy ?? 18}/{playerState.maxEnergy ?? 20}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🎡 THE CELESTIAL WHEEL CABINET & STAGE */}
      <div className="relative z-10 w-full max-w-md mx-auto my-auto flex flex-col items-center justify-center">
        <div className="relative w-[340px] sm:w-[380px] flex flex-col items-center">
          {/* Four Corner Golden Stars on Cabinet */}
          <div className="absolute -top-3 left-3 text-yellow-300 text-2xl z-30 drop-shadow-[0_0_10px_#fde047]">✦</div>
          <div className="absolute -top-3 right-3 text-yellow-300 text-2xl z-30 drop-shadow-[0_0_10px_#fde047]">✦</div>

          {/* Arched Cabinet Shell */}
          <div className="w-full relative p-3 rounded-[3rem] bg-gradient-to-b from-indigo-950/95 via-slate-950 to-slate-950 border-2 border-cyan-400/90 shadow-[0_0_40px_rgba(56,189,248,0.3)] flex flex-col items-center">
            {/* Studded Marquee Bulb Lights along upper arch */}
            <div className="absolute inset-x-8 top-3 flex justify-between pointer-events-none z-20">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_8px_#fef08a] border border-amber-500 animate-pulse"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>

            {/* Wheel Container */}
            <div className="relative w-[285px] h-[285px] sm:w-[315px] sm:h-[315px] mt-3 flex items-center justify-center">
              {/* Outer Golden Studded Bezel Ring with Marquee Bulbs */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.5)] z-20 pointer-events-none flex items-center justify-center">
                {/* Secondary Cyan Concentric Ring */}
                <div className="w-[96%] h-[96%] rounded-full border-2 border-cyan-400/70" />
              </div>

              {/* ⭐ THE ACTIVE TOP GOLDEN TRAPEZOID WEDGE HIGHLIGHT at 12:00 */}
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Golden glowing border framing the 12 o'clock slot (-105° to -75°) */}
                  <defs>
                    <linearGradient id="topWedgeGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 100 100 L 74.6 4.3 A 99 99 0 0 1 125.4 4.3 Z"
                    fill="url(#topWedgeGlow)"
                    stroke="#fde047"
                    strokeWidth="2.5"
                    filter="drop-shadow(0 0 8px rgba(250,204,21,0.85))"
                  />
                </svg>
              </div>

              {/* 🎯 THE TOP GOLDEN POINTER WEDGE at 12:00 matching screenshot */}
              <div className="absolute -top-4 z-40 flex flex-col items-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] pointer-events-none">
                {/* Golden Star Hub */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 border-2 border-yellow-100 flex items-center justify-center shadow-[0_0_14px_#facc15]">
                  <span className="text-slate-950 text-xs font-black">✦</span>
                </div>
                {/* Sharp Golden Arrowhead pointing down */}
                <div 
                  className="w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[20px] border-t-amber-400 -mt-1"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.9))' }}
                />
              </div>

              {/* 🔄 ROTATING 12-SEGMENT SVG WHEEL */}
              <div
                className="w-full h-full rounded-full overflow-hidden relative shadow-2xl transition-transform duration-[4200ms] cubic-bezier(0.12, 0.95, 0.22, 1)"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="goldJackpotSlice" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>

                  {/* 12 Sectors */}
                  {SEGMENTS.map((seg, i) => {
                    const angle = 360 / SEGMENTS.length; // 30°
                    // Sector 0 center is at -90° (12:00)
                    const startAngle = i * angle - 90 - 15;
                    const endAngle = startAngle + angle;
                    const r = 99;
                    const cx = 100;
                    const cy = 100;

                    const rad1 = (Math.PI * startAngle) / 180;
                    const rad2 = (Math.PI * endAngle) / 180;

                    const x1 = cx + r * Math.cos(rad1);
                    const y1 = cy + r * Math.sin(rad1);
                    const x2 = cx + r * Math.cos(rad2);
                    const y2 = cy + r * Math.sin(rad2);

                    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                    // Sector Midpoint
                    const midAngle = startAngle + angle / 2;
                    const midRad = (Math.PI * midAngle) / 180;

                    // Icon position (~64px from center)
                    const iconDist = 65;
                    const iconX = cx + iconDist * Math.cos(midRad);
                    const iconY = cy + iconDist * Math.sin(midRad);

                    // Text position (~41px from center)
                    const textDist = 40;
                    const textX = cx + textDist * Math.cos(midRad);
                    const textY = cy + textDist * Math.sin(midRad);

                    const isTopJackpot = seg.isJackpot;

                    return (
                      <g key={seg.id}>
                        {/* Slice Body */}
                        <path
                          d={pathData}
                          fill={isTopJackpot ? 'url(#goldJackpotSlice)' : seg.bgColor}
                          stroke="#0a0f1d"
                          strokeWidth="1.2"
                        />

                        {/* Outer Edge Rim Accent */}
                        <path
                          d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                          fill="none"
                          stroke={isTopJackpot ? '#fef08a' : '#38bdf8'}
                          strokeWidth="2"
                          opacity="0.8"
                        />

                        {/* High-Fidelity Vector Graphic */}
                        <g transform={`translate(${iconX}, ${iconY}) rotate(${midAngle + 90}) scale(0.92)`}>
                          {renderSliceGraphic(seg.iconType)}
                        </g>

                        {/* Exact Radially Oriented Value Text */}
                        <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                          <text
                            x="0"
                            y={seg.subLabel ? '-2.5' : '1'}
                            fill={isTopJackpot ? '#451a03' : '#ffffff'}
                            fontSize={seg.label.length > 5 ? '6' : '7.5'}
                            fontWeight="900"
                            textAnchor="middle"
                            dominantBaseline="central"
                            stroke={isTopJackpot ? '#fef08a' : '#070b14'}
                            strokeWidth="1"
                            paintOrder="stroke fill"
                            className="font-mono tracking-tight"
                          >
                            {seg.label}
                          </text>
                          {seg.subLabel && (
                            <text
                              x="0"
                              y="5"
                              fill={isTopJackpot ? '#78350f' : '#38bdf8'}
                              fontSize="4.5"
                              fontWeight="900"
                              textAnchor="middle"
                              dominantBaseline="central"
                              stroke="#070b14"
                              strokeWidth="0.8"
                              paintOrder="stroke fill"
                              className="font-mono tracking-tighter"
                            >
                              {seg.subLabel}
                            </text>
                          )}
                        </g>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* 🌟 CENTER WHEEL HUB: Indigo plate + Gold bezel + 4-pointed Star */}
              <div className="absolute z-30 w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border-4 border-amber-400 shadow-[0_0_22px_rgba(245,158,11,0.65)] flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full border-2 border-cyan-400/80 flex items-center justify-center relative">
                  <div className="text-2xl sm:text-3xl text-yellow-300 drop-shadow-[0_0_12px_#fde047] filter animate-pulse">
                    ✦
                  </div>
                </div>
              </div>
            </div>

            {/* 🕹️ BOTTOM CONSOLE & SPIN BUTTON ASSEMBLY */}
            <div className="relative -mt-6 sm:-mt-7 z-40 flex flex-col items-center">
              <div className="flex items-center gap-3">
                {/* Left Flank Star Button */}
                <button
                  type="button"
                  onClick={() => soundManager.playButtonClick()}
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="text-yellow-300 text-lg">⭐</span>
                </button>

                {/* Central Large SPIN Button */}
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpin}
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-cyan-950 via-slate-950 to-indigo-950 border-4 border-cyan-400 shadow-[0_0_35px_rgba(56,189,248,0.7)] flex flex-col items-center justify-center transition-all ${
                    isSpinning ? 'opacity-80 scale-95' : 'hover:brightness-110 active:scale-95 cursor-pointer'
                  }`}
                >
                  {/* Inner Gold Bezel Ring */}
                  <div className="absolute inset-1 rounded-full border-2 border-amber-400/60" />

                  {/* Left & Right Chevrons */}
                  <div className="absolute inset-x-2.5 top-1/2 -translate-y-1/2 flex justify-between text-cyan-300 text-sm font-black pointer-events-none opacity-80">
                    <span>◀</span>
                    <span>▶</span>
                  </div>

                  {/* SPIN Text */}
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-wider drop-shadow-[0_0_14px_#38bdf8] font-mono leading-none">
                    {isSpinning ? '...' : 'SPIN'}
                  </span>
                  {/* Subtext Ribbon */}
                  <span className="text-[8px] sm:text-[9px] font-black text-cyan-300 uppercase tracking-tight mt-1 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40">
                    {hasFreeSpin ? 'FREE DAILY SPIN' : 'SPIN (150 🪙)'}
                  </span>
                </button>

                {/* Right Flank Star Button */}
                <button
                  type="button"
                  onClick={() => soundManager.playButtonClick()}
                  className="w-10 h-10 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-pink-400/80 shadow-[0_0_12px_rgba(244,114,182,0.4)] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <span className="text-pink-400 text-lg">🌟</span>
                </button>
              </div>

              {/* ⏱ 10s Timer Pill Badge */}
              <div className="mt-2 px-3 py-1 bg-slate-950/90 border border-cyan-500/50 rounded-full text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 shadow-md">
                <Timer className="w-3 h-3 text-cyan-400" />
                <span>{cooldownSec > 0 ? `${cooldownSec}s` : 'READY!'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📦 BOTTOM DOCK: DAILY REWARDS (7 Days) | INVENTORY (3 Slots) | FRIENDS */}
      <div className="relative z-10 w-full max-w-md mx-auto grid grid-cols-12 gap-2 mt-2">
        {/* 1. DAILY REWARDS (col-span-6) */}
        <div 
          onClick={() => {
            soundManager.playButtonClick();
            if (onOpenDailyRewards) onOpenDailyRewards();
          }}
          className="col-span-6 bg-slate-950/95 border border-cyan-500/60 rounded-2xl p-2.5 shadow-lg flex flex-col justify-between cursor-pointer hover:border-cyan-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-wider text-white uppercase font-mono">
              DAILY REWARDS
            </span>
            <Info className="w-3 h-3 text-cyan-400 opacity-80" />
          </div>

          {/* 7 Days Row */}
          <div className="grid grid-cols-7 gap-1 my-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => {
              const isCollected = day === 4; // Day 4 is checked in screenshot
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center ${
                    isCollected
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[7px] font-mono leading-none">DAY</span>
                  <span className="text-[9px] font-black leading-tight">{day}</span>
                  {isCollected && (
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3] mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase font-mono">
              COLLECTED
            </span>
          </div>
        </div>

        {/* 2. INVENTORY (col-span-4) */}
        <div className="col-span-4 bg-slate-950/95 border border-cyan-500/60 rounded-2xl p-2.5 shadow-lg flex flex-col justify-between">
          <span className="text-[10px] font-black tracking-wider text-white uppercase font-mono">
            INVENTORY
          </span>

          <div className="flex items-center justify-between gap-1 my-1.5">
            {/* Slot 1: Golden Chest */}
            <div className="relative flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-cyan-400/50">
              <span className="text-sm">🎁</span>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-black text-cyan-300 bg-slate-950 rounded px-1">
                x1
              </span>
            </div>

            {/* Slot 2: Ice Crystal */}
            <div className="relative flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-cyan-400/50">
              <span className="text-sm">❄️</span>
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-black text-cyan-300 bg-slate-950 rounded px-1">
                x3
              </span>
            </div>

            {/* Slot 3: Lightning Battery */}
            <div className="relative flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-slate-900 border border-cyan-400/50">
              <Zap className="w-4 h-4 text-amber-300 fill-amber-400" />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-black text-cyan-300 bg-slate-950 rounded px-1">
                x2
              </span>
            </div>
          </div>

          <div className="h-2" />
        </div>

        {/* 3. FRIENDS (col-span-2) */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            if (onOpenFriends) onOpenFriends();
          }}
          className="col-span-2 bg-slate-950/95 border border-cyan-500/60 rounded-2xl p-2 shadow-lg flex flex-col items-center justify-center gap-1 hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
        >
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black tracking-wider text-white uppercase font-mono">
            FRIENDS
          </span>
        </button>
      </div>
      </div>
      </div>

      {/* 🎉 Reward Claim Dialog Modal */}
      {showRewardModal && wonReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.5)] animate-scale-up flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-yellow-100 flex items-center justify-center text-4xl shadow-lg mb-3">
              {wonReward.iconType === 'ice_cube' ? '❄️' : wonReward.iconType === 'lightning_cube' ? '⚡' : '🪙'}
            </div>

            <h3 className="text-xl font-black text-white font-mono uppercase tracking-wide">
              {wonReward.isJackpot ? '¡GRAN PREMIO!' : '¡FELICITACIONES!'}
            </h3>

            <p className="text-amber-300 font-bold text-sm mt-1 font-mono">
              +{wonReward.coins} 🪙 Monedas & +{wonReward.xp} ✨ XP
            </p>

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setShowRewardModal(false);
              }}
              className="mt-5 w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:brightness-110 active:scale-95 uppercase tracking-wider font-mono cursor-pointer"
            >
              ¡RECLAMAR RECOMPENSA!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
