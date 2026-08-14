import React, { useState, useEffect } from 'react';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { t, Language } from '../i18n';
import { Sparkles, ArrowRight, ArrowLeft, X, Rocket, Compass, CheckCircle2 } from 'lucide-react';
import { getAvatarById } from '../data/avatars';

interface TutorialOverlayProps {
  playerState: PlayerState;
  onComplete: () => void;
  onStartGame: () => void;
}

interface StepConfig {
  id: string;
  selector: string;
  titleKey: keyof typeof import('../i18n').translations['es'];
  descKey: keyof typeof import('../i18n').translations['es'];
  emoji: string;
  cardPosition: 'top' | 'center' | 'bottom';
}

const STEPS: StepConfig[] = [
  {
    id: 'profile',
    selector: 'data-tutorial="profile-hud"',
    titleKey: 'tutorialStep1Title',
    descKey: 'tutorialStep1Desc',
    emoji: '🧑‍🚀',
    cardPosition: 'center',
  },
  {
    id: 'modes',
    selector: 'data-tutorial="mode-selector"',
    titleKey: 'tutorialStep2Title',
    descKey: 'tutorialStep2Desc',
    emoji: '🎮',
    cardPosition: 'center',
  },
  {
    id: 'shop',
    selector: 'data-tutorial="shop-buttons"',
    titleKey: 'tutorialStep3Title',
    descKey: 'tutorialStep3Desc',
    emoji: '🛍️',
    cardPosition: 'center',
  },
  {
    id: 'play',
    selector: 'data-tutorial="play-button"',
    titleKey: 'tutorialStep4Title',
    descKey: 'tutorialStep4Desc',
    emoji: '⚡',
    cardPosition: 'center',
  },
];

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  playerState,
  onComplete,
  onStartGame,
}) => {
  const lang: Language = playerState.language || 'es';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = STEPS[currentStepIndex];
  const avatar = getAvatarById(playerState.avatar);

  // Dynamically track position of highlighted DOM element
  useEffect(() => {
    const updateTargetPosition = () => {
      const el = document.querySelector(`[${currentStep.selector}]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateTargetPosition();
    const interval = setInterval(updateTargetPosition, 200);
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStepIndex, currentStep]);

  const handleNext = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinishAndPlay();
    }
  };

  const handlePrev = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    soundManager.playButtonClick();
    onComplete();
  };

  const handleFinishAndPlay = () => {
    soundManager.playButtonClick();
    hapticManager.mediumTap();
    onComplete();
    onStartGame();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center animate-fade-in overflow-hidden select-none">
      {/* Semi-transparent Darkened Background Layer */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs transition-all duration-300"
        onClick={handleNext}
      />

      {/* Target Highlight Box (Spotlight Ring) */}
      {targetRect && (
        <div
          className="absolute z-10 pointer-events-none rounded-2xl transition-all duration-300 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.6)] ring-4 ring-amber-400/20 animate-pulse"
          style={{
            left: `${targetRect.left - 6}px`,
            top: `${targetRect.top - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
          }}
        >
          {/* Animated Glowing Corner Accent Dots */}
          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-300 rounded-full shadow-[0_0_10px_#f59e0b]" />
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-300 rounded-full shadow-[0_0_10px_#f59e0b]" />
          <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-300 rounded-full shadow-[0_0_10px_#f59e0b]" />
          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-300 rounded-full shadow-[0_0_10px_#f59e0b]" />
        </div>
      )}

      {/* Interactive Guidance Modal Card */}
      <div className="relative z-20 w-full max-w-md mx-4 bg-slate-900/95 border-2 border-amber-500/50 rounded-[2rem] text-white shadow-2xl p-5 flex flex-col gap-4 backdrop-blur-xl animate-scale-up text-left">
        {/* Top Card Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] rounded-full uppercase tracking-wider shadow">
              {t('tutorialWelcomeSub', lang)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 bg-slate-800/80 hover:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 transition-all cursor-pointer"
          >
            <span>{t('tutorialSkipBtn', lang)}</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mascot / Avatar Greeting Box */}
        <div className="flex items-start gap-3.5 bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 p-3.5 rounded-2xl border border-amber-500/30">
          <div
            className={`relative w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatar.gradient} flex items-center justify-center text-3xl shadow-xl border-2 ${avatar.borderColor} shrink-0 animate-bounce`}
          >
            <span>{currentStep.emoji}</span>
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber-200" />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
              <Compass className="w-3 h-3 text-amber-300" />
              PASO {currentStepIndex + 1} DE {STEPS.length}
            </span>
            <h3 className="text-base font-black text-white tracking-wide truncate mt-0.5">
              {t(currentStep.titleKey, lang)}
            </h3>
          </div>
        </div>

        {/* Step Explanation Text */}
        <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
          {t(currentStep.descKey, lang)}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 my-1">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => {
                soundManager.playButtonClick();
                setCurrentStepIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStepIndex
                  ? 'w-8 bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                  : idx < currentStepIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-slate-700'
              }`}
              title={`Paso ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pt-1">
          {currentStepIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-extrabold text-xs border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('tutorialPrevBtn', lang)}</span>
            </button>
          )}

          {currentStepIndex < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border border-yellow-200/50"
            >
              <span>{t('tutorialNextBtn', lang)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishAndPlay}
              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-102 active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-200/60 animate-pulse"
            >
              <Rocket className="w-4 h-4 stroke-[3]" />
              <span>{t('tutorialStartGameBtn', lang)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
