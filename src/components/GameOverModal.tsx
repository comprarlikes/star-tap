import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Repeat, Sparkles, Check, Swords, Ghost, Tv, Home } from 'lucide-react';
import { t, Language } from '../i18n';
import { AdMobRewardedModal } from './AdMobRewardedModal';

interface GameOverModalProps {
  score: number;
  stats: {
    starsTapped: number;
    normal: number;
    golden: number;
    diamond: number;
    bombsHit: number;
    bombsAvoided: number;
    maxCombo: number;
  };
  coinsEarned: number;
  xpEarned: number;
  isNewHighScore: boolean;
  didLevelUp: boolean;
  newLevel: number;
  duelResult?: {
    isVictory: boolean;
    ghostName: string;
    ghostScore: number;
    bonusCoins: number;
    bonusXp: number;
  } | null;
  onPlayAgain: () => void;
  onGoHome?: () => void;
  onDoubleCoins: () => void;
  hasDoubledCoins: boolean;
  language?: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  stats,
  coinsEarned,
  xpEarned,
  isNewHighScore,
  didLevelUp,
  newLevel,
  duelResult,
  onPlayAgain,
  onGoHome,
  onDoubleCoins,
  hasDoubledCoins,
  language = 'es',
}) => {
  const lang: Language = language === 'en' ? 'en' : 'es';
  const [showAdMobModal, setShowAdMobModal] = useState<boolean>(false);

  useEffect(() => {
    // Fire festive confetti on high score or level up
    try {
      confetti({
        particleCount: isNewHighScore || didLevelUp ? 120 : 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  }, [isNewHighScore, didLevelUp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Decorative Top Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Title / Trophy Bento Icon */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-xl border border-yellow-200/40">
            {isNewHighScore ? '👑' : '🏆'}
          </div>
          {isNewHighScore && (
            <span className="absolute -bottom-2 -right-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow-md">
              {lang === 'en' ? 'RECORD!' : '¡RÉCORD!'}
            </span>
          )}
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight mb-1">
          {duelResult 
            ? (duelResult.isVictory ? t('duelVictoryTitle', lang) : t('duelDefeatTitle', lang)) 
            : (isNewHighScore ? t('newRecordTitle', lang) : t('gameOverTitle', lang))}
        </h3>

        {duelResult && (
          <div className={`w-full my-2 p-3 rounded-2xl border flex flex-col items-center gap-1 shadow-md ${
            duelResult.isVictory
              ? 'bg-gradient-to-r from-purple-950/90 via-slate-950 to-pink-950/90 border-purple-500/50 text-purple-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Swords className="w-4 h-4 text-pink-400" />
              <span>
                {duelResult.isVictory 
                  ? t('beatGhostMsg', lang).replace('{name}', duelResult.ghostName)
                  : t('ghostKeptVictoryMsg', lang).replace('{name}', duelResult.ghostName)}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-300">
              {t('yourScore', lang)}: <span className="text-amber-300 font-bold">{score.toLocaleString()}</span> {t('vsGhost', lang)}: <span className="text-cyan-300 font-bold">{duelResult.ghostScore.toLocaleString()}</span>
            </div>
            {duelResult.isVictory && (
              <span className="mt-1 text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 animate-bounce">
                {t('duelBonusWon', lang).replace('{coins}', duelResult.bonusCoins.toString()).replace('{xp}', duelResult.bonusXp.toString())}
              </span>
            )}
          </div>
        )}

        {didLevelUp && (
          <div className="my-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black px-4 py-1.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-md animate-pulse">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{t('levelUp', lang).replace('{level}', newLevel.toString())}</span>
          </div>
        )}

        {/* Big Score Display Bento Tile */}
        <div className="w-full my-3 py-3 px-6 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col items-center shadow-inner">
          <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">{lang === 'en' ? 'Final Score' : 'Puntuación Final'}</span>
          <span className="text-4xl font-black text-amber-400 drop-shadow">{score.toLocaleString()}</span>
        </div>

        {/* Stats Bento Grid */}
        <div className="w-full grid grid-cols-2 gap-2 my-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
            <span className="text-slate-400 font-medium text-[11px]">⭐ {t('starsTapped', lang)}</span>
            <span className="text-amber-300 font-extrabold text-base mt-0.5">{stats.starsTapped}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
            <span className="text-slate-400 font-medium text-[11px]">⚡ {lang === 'en' ? 'Max Combo' : 'Combo Máximo'}</span>
            <span className="text-yellow-400 font-extrabold text-base mt-0.5">{stats.maxCombo}x</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
            <span className="text-slate-400 font-medium text-[11px]">💎 {lang === 'en' ? 'Diamonds' : 'Diamantes'}</span>
            <span className="text-cyan-400 font-extrabold text-base mt-0.5">{stats.diamond}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
            <span className="text-slate-400 font-medium text-[11px]">💣 {lang === 'en' ? 'Bombs Avoided' : 'Bombas Evitadas'}</span>
            <span className="text-emerald-400 font-extrabold text-base mt-0.5">{stats.bombsAvoided}</span>
          </div>
        </div>

        {/* Rewards Earned Box (Bento Card) */}
        <div className="w-full bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/20 flex items-center justify-around my-2 shadow-inner">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">{t('rewardCoins', lang)}</span>
              <span className="text-base font-black text-amber-400">+{coinsEarned}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✨</span>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase">{t('rewardXp', lang)}</span>
              <span className="text-base font-black text-purple-400">+{xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Double Coins Action */}
        {!hasDoubledCoins ? (
          <button
            onClick={() => setShowAdMobModal(true)}
            className="w-full mb-3 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-pink-400/30 group"
          >
            <Tv className="w-4 h-4 fill-amber-300 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>{t('doubleCoinsBtn', lang).replace('{coins}', coinsEarned.toString())}</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase tracking-wider ml-1">
              AdMob
            </span>
          </button>
        ) : (
          <div className="w-full mb-3 py-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-1">
            <Check className="w-4 h-4" />
            <span>{t('doubledBadge', lang)}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2.5">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="py-3.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-1.5 border border-slate-700/80"
            >
              <Home className="w-4 h-4 text-amber-400" />
              <span>{t('homeBtn', lang)}</span>
            </button>
          )}
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-yellow-200/40"
          >
            <Repeat className="w-4 h-4" />
            <span>{t('playAgainBtn', lang)}</span>
          </button>
        </div>
      </div>

      {/* Google AdMob Rewarded Ad Modal */}
      {showAdMobModal && (
        <AdMobRewardedModal
          bonusCoins={coinsEarned}
          language={lang}
          onRewardEarned={() => {
            onDoubleCoins();
            setShowAdMobModal(false);
          }}
          onClose={() => setShowAdMobModal(false)}
        />
      )}
    </div>
  );
};
