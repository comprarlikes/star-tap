import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Language, t, translations } from '../i18n';

interface GameTipBannerProps {
  lang?: Language | string;
  className?: string;
  autoRotateIntervalMs?: number;
}

const TIP_KEYS: (keyof typeof translations['es'])[] = [
  'tipCombo',
  'tipGoldenStar',
  'tipDiamondStar',
  'tipRainbowStar',
  'tipMagnetPowerup',
  'tipFreezeShield',
  'tipAvoidBombs',
];

export const GameTipBanner: React.FC<GameTipBannerProps> = ({
  lang = 'es',
  className = '',
  autoRotateIntervalMs = 5500,
}) => {
  const safeLang: Language = lang === 'en' ? 'en' : 'es';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (autoRotateIntervalMs <= 0) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % TIP_KEYS.length);
        setIsFading(false);
      }, 200);
    }, autoRotateIntervalMs);

    return () => clearInterval(timer);
  }, [autoRotateIntervalMs]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % TIP_KEYS.length);
      setIsFading(false);
    }, 150);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + TIP_KEYS.length) % TIP_KEYS.length);
      setIsFading(false);
    }, 150);
  };

  const currentTipKey = TIP_KEYS[currentIndex];

  return (
    <div
      className={`w-full max-w-sm mx-auto px-3.5 py-2.5 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-amber-500/35 shadow-[0_4px_20px_rgba(245,158,11,0.15)] flex items-center justify-between gap-2.5 transition-all duration-300 relative overflow-hidden group select-none ${className}`}
    >
      {/* Subtle background ambient shine */}
      <div className="absolute -left-10 -top-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
      <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Tip Icon Badge */}
      <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/20 to-orange-500/10 border border-amber-400/40 text-amber-300 shadow-sm flex-shrink-0 flex items-center justify-center">
        <Lightbulb className="w-4 h-4 animate-pulse stroke-[2.2]" />
      </div>

      {/* Tip Content Area */}
      <div className="flex-1 flex flex-col min-w-0 text-left">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400/90 font-mono flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            {t('gameTipLabel', safeLang)}
          </span>
          <span className="text-[9px] text-slate-500 font-bold ml-auto font-mono">
            {currentIndex + 1}/{TIP_KEYS.length}
          </span>
        </div>

        <p
          className={`text-[11px] leading-snug font-medium text-slate-200 transition-opacity duration-200 line-clamp-2 ${
            isFading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'
          }`}
        >
          {t(currentTipKey, safeLang)}
        </p>
      </div>

      {/* Quick Navigation Controls */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition-all active:scale-90 cursor-pointer"
          aria-label="Previous tip"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 transition-all active:scale-90 cursor-pointer"
          aria-label="Next tip"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
