import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X, Gift, Tv, Coins, Check, RotateCw } from 'lucide-react';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface LuckySpinModalProps {
  playerState: PlayerState;
  language?: 'es' | 'en';
  onSpinRewardEarned: (reward: { coins: number; xp: number; label: string; icon: string }) => void;
  onWatchAdForSpin: () => void;
  onClose: () => void;
}

interface WheelSegment {
  label: string;
  coins: number;
  xp: number;
  icon: string;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '+40 🪙', coins: 40, xp: 20, icon: '🪙', color: '#f59e0b', textColor: '#0f172a' },
  { label: '+50 XP ✨', coins: 15, xp: 50, icon: '✨', color: '#8b5cf6', textColor: '#ffffff' },
  { label: '+80 🪙', coins: 80, xp: 35, icon: '🪙', color: '#eab308', textColor: '#0f172a' },
  { label: '🧲 Imán +1', coins: 30, xp: 30, icon: '🧲', color: '#ec4899', textColor: '#ffffff' },
  { label: '+150 🪙', coins: 150, xp: 60, icon: '💰', color: '#10b981', textColor: '#ffffff' },
  { label: '+120 XP ✨', coins: 25, xp: 120, icon: '🌟', color: '#3b82f6', textColor: '#ffffff' },
  { label: '🛡️ Escudo +1', coins: 40, xp: 40, icon: '🛡️', color: '#06b6d4', textColor: '#0f172a' },
  { label: '👑 ¡JACKPOT!', coins: 350, xp: 200, icon: '👑', color: '#ef4444', textColor: '#ffffff' },
];

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  playerState,
  language = 'es',
  onSpinRewardEarned,
  onWatchAdForSpin,
  onClose,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonReward, setWonReward] = useState<WheelSegment | null>(null);

  const lang = language === 'en' ? 'en' : 'es';

  // Check if player used their free spin today
  const lastSpinDate = localStorage.getItem('star_tap_last_spin_date');
  const todayStr = new Date().toISOString().split('T')[0];
  const hasFreeSpin = lastSpinDate !== todayStr;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonReward(null);

    soundManager.playButtonClick();
    hapticManager.heavyTap();

    // Pick random segment with weighted or uniform probability
    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length;
    // Calculate final angle to land on target segment (pointer is at top = 270 deg or 0 deg offset)
    const extraTurns = 5 * 360; // 5 full rotations
    // Top pointer points to angle (360 - index * segmentAngle - segmentAngle / 2)
    const targetAngle = extraTurns + (360 - targetIndex * segmentAngle - segmentAngle / 2);

    const newRotation = rotation + targetAngle;
    setRotation(newRotation);

    // Audio tick sound loop
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundManager.playWheelSpin();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const chosen = SEGMENTS[targetIndex];
      setWonReward(chosen);
      localStorage.setItem('star_tap_last_spin_date', todayStr);

      soundManager.playLevelUp();
      soundManager.playCoin();
      hapticManager.success();

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // fallback
      }

      onSpinRewardEarned({
        coins: chosen.coins,
        xp: chosen.xp,
        label: chosen.label,
        icon: chosen.icon,
      });
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border-2 border-amber-500/40 rounded-[2.5rem] p-5 sm:p-6 text-white shadow-[0_0_60px_rgba(245,158,11,0.25)] relative overflow-hidden flex flex-col items-center text-center animate-scale-up">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
            <Gift className="w-4 h-4" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow">
            {lang === 'en' ? 'COSMIC LUCKY WHEEL' : 'RULETA CÓSMICA'}
          </h3>
        </div>

        <p className="text-xs text-slate-300 font-medium mb-3">
          {lang === 'en' ? 'Spin to win coins, XP, boosters and cosmic prizes!' : '¡Gira la ruleta y gana monedas, experiencia y premios estelares!'}
        </p>

        {/* The Wheel Stage */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-1 flex items-center justify-center">
          {/* Top Pointer Indicator Arrow */}
          <div className="absolute -top-1 z-30 flex flex-col items-center">
            <div className="w-6 h-7 bg-gradient-to-b from-amber-300 to-amber-500 clip-triangle shadow-lg border-x-2 border-slate-900 filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
          </div>

          {/* Outer Glowing Border Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.4)] pointer-events-none z-20" />

          {/* Rotating Wheel Disc */}
          <div
            className="w-full h-full rounded-full overflow-hidden relative shadow-2xl transition-transform duration-[3800ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {SEGMENTS.map((seg, i) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = i * angle;
                const endAngle = (i + 1) * angle;
                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const textX = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                const textY = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                return (
                  <g key={i}>
                    <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="0.8" />
                    <text
                      x={textX}
                      y={textY}
                      fill={seg.textColor}
                      fontSize="3.8"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center Hub Button */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleSpin}
            className="absolute z-30 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 border-4 border-slate-900 flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer"
          >
            <RotateCw className={`w-5 h-5 text-slate-950 stroke-[3] ${isSpinning ? 'animate-spin' : ''}`} />
            <span className="text-[9px] font-black text-slate-950 uppercase tracking-tighter mt-0.5">
              {isSpinning ? '...' : (hasFreeSpin ? 'GIRAR' : 'GIRAR')}
            </span>
          </button>
        </div>

        {/* Won Reward Banner */}
        {wonReward && (
          <div className="w-full mt-2 p-2.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 rounded-2xl border border-amber-400/50 flex items-center justify-center gap-2 animate-bounce">
            <span className="text-xl">{wonReward.icon}</span>
            <span className="text-xs font-black text-amber-300">
              {lang === 'en' ? `¡You won ${wonReward.label}!` : `¡Has ganado ${wonReward.label}!`}
            </span>
          </div>
        )}

        {/* Spin Actions Footer */}
        <div className="w-full flex flex-col gap-2 mt-3">
          {hasFreeSpin ? (
            <button
              type="button"
              disabled={isSpinning}
              onClick={handleSpin}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-200 uppercase tracking-wider cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{lang === 'en' ? 'FREE DAILY SPIN!' : '¡GIRO GRATIS DEL DÍA!'}</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full">
              {/* Extra Spin with AdMob */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => {
                  onWatchAdForSpin();
                }}
                className="py-3 px-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 active:scale-95 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 border border-pink-400/40 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 fill-amber-300 text-slate-950" />
                <span>{lang === 'en' ? 'Spin with Ad' : 'Girar con Anuncio'}</span>
              </button>

              {/* Extra Spin with 150 Coins */}
              <button
                type="button"
                disabled={isSpinning || playerState.coins < 150}
                onClick={handleSpin}
                className={`py-3 px-2 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border ${
                  playerState.coins >= 150
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 active:scale-95 cursor-pointer shadow-md'
                    : 'bg-slate-950 text-slate-500 border-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Spin (150 🪙)' : 'Girar (150 🪙)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
