import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Zap, Repeat, Sparkles, Check, Swords, Ghost, Tv, Home, Share2 } from 'lucide-react';
import { t, Language } from '../i18n';
import { AdMobRewardedModal } from './AdMobRewardedModal';
import { soundManager } from '../services/sound';

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
  const [copied, setCopied] = useState<boolean>(false);

  const handleShare = async () => {
    soundManager.playButtonClick();
    const shareTitle = isNewHighScore
      ? (lang === 'en' ? '🌟 New High Score in Star Tap Arcade!' : '🌟 ¡Nuevo Récord en Star Tap Arcade!')
      : (lang === 'en' ? '🎮 My Score in Star Tap Arcade!' : '🎮 ¡Mi Puntuación en Star Tap Arcade!');
    
    const shareText = lang === 'en'
      ? `🎮 I scored ${score.toLocaleString()} points in Star Tap Arcade! 🌟 Can you beat my score? Play now!`
      : `🎮 ¡He conseguido ${score.toLocaleString()} puntos en Star Tap Arcade! 🌟 ¿Puedes superar mi récord? ¡Juega ahora!`;
    
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Web Share cancelled or failed:', err);
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Clipboard write failed:', err);
      }
    }
  };

  useEffect(() => {
    // Fire festive confetti on high score or level up
    try {
      confetti({
        particleCount: isNewHighScore || didLevelUp ? 130 : 65,
        spread: 80,
        origin: { y: 0.55 },
      });
    } catch {
      // fallback
    }
  }, [isNewHighScore, didLevelUp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-amber-500/30 rounded-[2.5rem] p-5 sm:p-6 text-white shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden flex flex-col items-center text-center">
        
        {/* Ambient Top & Bottom Radial Glows */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Trophy / Crown Badge with Glow Ring */}
        <div className="relative mb-3.5 group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-orange-500 blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 flex items-center justify-center text-4xl shadow-2xl border-2 border-yellow-100/50 transform group-hover:scale-105 transition-transform duration-300">
            {isNewHighScore ? '👑' : '🏆'}
          </div>

          {isNewHighScore && (
            <span className="absolute -bottom-2.5 -right-2 bg-gradient-to-r from-red-600 to-pink-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow-xl border border-red-300/40 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
              {lang === 'en' ? 'RECORD!' : '¡RÉCORD!'}
            </span>
          )}
        </div>

        {/* Modal Title */}
        <h3 className="text-2xl font-black tracking-tight text-white mb-1 drop-shadow-md">
          {duelResult 
            ? (duelResult.isVictory ? t('duelVictoryTitle', lang) : t('duelDefeatTitle', lang)) 
            : (isNewHighScore ? t('newRecordTitle', lang) : t('gameOverTitle', lang))}
        </h3>

        {/* Duel Ghost Result Box */}
        {duelResult && (
          <div className={`w-full my-2.5 p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 shadow-lg relative overflow-hidden ${
            duelResult.isVictory
              ? 'bg-gradient-to-br from-purple-950/90 via-slate-950 to-pink-950/90 border-purple-500/50 text-purple-200'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-1.5 font-black text-xs">
              <Swords className="w-4 h-4 text-pink-400 animate-pulse" />
              <span>
                {duelResult.isVictory 
                  ? t('beatGhostMsg', lang).replace('{name}', duelResult.ghostName)
                  : t('ghostKeptVictoryMsg', lang).replace('{name}', duelResult.ghostName)}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-slate-300 bg-slate-900/60 px-3 py-1 rounded-xl border border-slate-800">
              {t('yourScore', lang)}: <span className="text-amber-300 font-bold">{score.toLocaleString()}</span> {t('vsGhost', lang)}: <span className="text-cyan-300 font-bold">{duelResult.ghostScore.toLocaleString()}</span>
            </div>
            {duelResult.isVictory && (
              <span className="mt-0.5 text-[10px] font-black text-emerald-300 bg-emerald-950/90 px-3 py-0.5 rounded-full border border-emerald-500/50 animate-bounce shadow-md">
                {t('duelBonusWon', lang).replace('{coins}', duelResult.bonusCoins.toString()).replace('{xp}', duelResult.bonusXp.toString())}
              </span>
            )}
          </div>
        )}

        {/* Level Up Banner */}
        {didLevelUp && (
          <div className="my-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 text-slate-950 font-black px-4 py-1.5 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg animate-pulse border border-yellow-200">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>{t('levelUp', lang).replace('{level}', newLevel.toString())}</span>
          </div>
        )}

        {/* Main Score Showcase Card */}
        <div className="w-full my-2.5 py-3.5 px-4 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex flex-col items-center shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-yellow-500/10 to-amber-500/5 opacity-50" />
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase relative z-10 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" />
            {lang === 'en' ? 'Final Score' : 'Puntuación Final'}
          </span>
          <span className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.3)] mt-0.5 relative z-10 tracking-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Gameplay Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 my-2.5 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm hover:border-amber-500/30 transition-colors">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">⭐ {t('starsTapped', lang)}</span>
            <span className="text-amber-300 font-extrabold text-base mt-0.5">{stats.starsTapped}</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm hover:border-yellow-500/30 transition-colors">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">⚡ {lang === 'en' ? 'Max Combo' : 'Combo Máximo'}</span>
            <span className="text-yellow-300 font-extrabold text-base mt-0.5">{stats.maxCombo}x</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm hover:border-cyan-500/30 transition-colors">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">💎 {lang === 'en' ? 'Diamonds' : 'Diamantes'}</span>
            <span className="text-cyan-300 font-extrabold text-base mt-0.5">{stats.diamond}</span>
          </div>

          <div className="bg-slate-950/70 p-2.5 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm hover:border-emerald-500/30 transition-colors">
            <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">💣 {lang === 'en' ? 'Bombs Avoided' : 'Bombas Evitadas'}</span>
            <span className="text-emerald-300 font-extrabold text-base mt-0.5">{stats.bombsAvoided}</span>
          </div>
        </div>

        {/* Rewards Earned Box */}
        <div className="w-full bg-slate-950/90 p-3 rounded-2xl border border-amber-500/20 flex items-center justify-around my-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow">🪙</span>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{t('rewardCoins', lang)}</span>
              <span className="text-base font-black text-amber-400">+{coinsEarned}</span>
            </div>
          </div>

          <div className="h-7 w-px bg-slate-800" />

          <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow">✨</span>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">{t('rewardXp', lang)}</span>
              <span className="text-base font-black text-purple-400">+{xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Double Coins Action Button */}
        {!hasDoubledCoins ? (
          <button
            type="button"
            onClick={() => setShowAdMobModal(true)}
            className="w-full mb-3 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 active:scale-95 text-white font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 border border-pink-400/40 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Tv className="w-4 h-4 fill-amber-300 text-slate-950 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide uppercase">{t('doubleCoinsBtn', lang).replace('{coins}', coinsEarned.toString())}</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase tracking-wider ml-1 shadow">
              AdMob
            </span>
          </button>
        ) : (
          <div className="w-full mb-3 py-2.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-inner">
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{t('doubledBadge', lang)}</span>
          </div>
        )}

        {/* Modal Action Footer Buttons */}
        <div className="w-full flex flex-col gap-2 pt-1">
          {/* Primary Action: Replay Game */}
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-200/60 uppercase tracking-wider whitespace-nowrap cursor-pointer"
          >
            <Repeat className="w-4 h-4 stroke-[2.5]" />
            <span>{t('playAgainBtn', lang)}</span>
          </button>

          {/* Secondary Actions: Home & Share */}
          <div className="w-full flex items-center gap-2">
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="flex-1 py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-slate-200 font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 border border-slate-700/80 whitespace-nowrap cursor-pointer"
                title={t('homeBtn', lang)}
              >
                <Home className="w-4 h-4 text-amber-400" />
                <span>{t('homeBtn', lang)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:brightness-110 active:scale-95 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 border border-blue-400/30 whitespace-nowrap cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300 stroke-[3]" /> : <Share2 className="w-4 h-4 text-cyan-300" />}
              <span className="uppercase tracking-wider">{copied ? t('shareCopied', lang) : t('shareBtn', lang)}</span>
            </button>
          </div>
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
