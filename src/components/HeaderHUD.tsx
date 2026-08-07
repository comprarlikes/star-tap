import React from 'react';
import { PlayerState, GameMode } from '../types';
import { getXpForNextLevel } from '../services/storage';
import { t } from '../i18n';
import { 
  Trophy, 
  ShoppingBag, 
  Target, 
  Award, 
  BarChart2, 
  Volume2, 
  VolumeX, 
  Zap, 
  Clock, 
  Flame,
  Smile,
  Swords,
  Smartphone,
  Monitor,
  User
} from 'lucide-react';

interface HeaderHUDProps {
  playerState: PlayerState;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  isPlaying: boolean;
  onOpenShop: () => void;
  onOpenQuests: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  hasUnclaimedQuests?: boolean;
  hasUnclaimedAchievements?: boolean;
  onOpenAd?: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  playerState,
  gameMode,
  setGameMode,
  isPlaying,
  onOpenShop,
  onOpenQuests,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenStats,
  onOpenProfile,
  onToggleSound,
  isMobileFrame,
  onToggleMobileFrame,
  hasUnclaimedQuests = false,
  hasUnclaimedAchievements = false,
  onOpenAd,
}) => {
  const currentXpTarget = getXpForNextLevel(playerState.level);
  const xpPercent = Math.min(100, Math.floor((playerState.xp / currentXpTarget) * 100));
  const lang = playerState.language || 'es';

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-3 py-2.5 text-white shadow-xl flex flex-wrap items-center justify-between gap-2 z-20">
      {/* Left: Player Profile & Level XP Bento Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 bg-slate-950/70 p-1.5 pr-3 rounded-2xl border border-slate-800/80 shadow-inner hover:border-amber-500/50 hover:bg-slate-950 transition-all text-left active:scale-95 group"
          title={t('profile', lang)}
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 border border-yellow-200/50 text-slate-950 font-black text-xs shadow-md group-hover:scale-105 transition-transform">
            L{playerState.level}
          </div>
          
          <div className="flex flex-col min-w-[110px]">
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-0.5">
              <span className="truncate max-w-[85px] text-amber-300 group-hover:text-amber-200">{playerState.name}</span>
              <span className="text-[10px] text-slate-400 font-medium">{playerState.xp}/{currentXpTarget} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </button>

        {/* Coins Counter Bento Chip */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-1.5 rounded-2xl border border-amber-500/30 text-amber-400 font-extrabold text-xs shadow-inner">
          <span className="text-sm animate-pulse">🪙</span>
          <span>{playerState.coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Middle: Mode Selector (Bento Segmented Control) */}
      {!isPlaying && (
        <div className="flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
          <button
            onClick={() => setGameMode('blitz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'blitz'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>60s {t('blitzMode', lang)}</span>
          </button>
          
          <button
            onClick={() => setGameMode('endless')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'endless'
                ? 'bg-red-500 text-white shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('endlessMode', lang)}</span>
          </button>

          <button
            onClick={() => setGameMode('fever')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'fever'
                ? 'bg-purple-600 text-white shadow-md scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{t('feverMode', lang)}</span>
          </button>

          <button
            onClick={() => setGameMode('zen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'zen'
                ? 'bg-emerald-500 text-slate-950 shadow-md scale-105 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>{t('zenMode', lang)}</span>
          </button>

          <button
            onClick={() => setGameMode('duel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              gameMode === 'duel'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md scale-105 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{t('duelMode', lang)}</span>
          </button>
        </div>
      )}

      {/* Right Action Icons & Modals */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenQuests}
          className="relative p-2 bg-slate-800/70 hover:bg-slate-700/80 text-amber-300 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm"
          title={t('quests', lang)}
        >
          <Target className="w-4 h-4" />
          {hasUnclaimedQuests && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={onOpenShop}
          className="p-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-extrabold rounded-xl hover:brightness-110 shadow-md transition-transform active:scale-95 flex items-center gap-1 text-xs"
          title={t('shop', lang)}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">{t('shop', lang)}</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="relative p-2 bg-slate-800/70 hover:bg-slate-700/80 text-yellow-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm"
          title={t('achievements', lang)}
        >
          <Award className="w-4 h-4" />
          {hasUnclaimedAchievements && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="p-2 bg-slate-800/70 hover:bg-slate-700/80 text-cyan-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm"
          title={t('leaderboard', lang)}
        >
          <Trophy className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenStats}
          className="p-2 bg-slate-800/70 hover:bg-slate-700/80 text-emerald-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm"
          title={t('stats', lang)}
        >
          <BarChart2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenProfile}
          className="p-2 bg-slate-800/70 hover:bg-slate-700/80 text-amber-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm"
          title={t('profile', lang)}
        >
          <User className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl border transition-transform active:scale-95 shadow-sm ${
            playerState.soundEnabled 
              ? 'bg-slate-800/70 text-emerald-400 border-slate-700/60' 
              : 'bg-slate-800/70 text-slate-500 border-slate-700/60'
          }`}
          title={playerState.soundEnabled ? 'Sonido Activado' : 'Sonido Silenciado'}
        >
          {playerState.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleMobileFrame}
          className="p-2 bg-slate-800/70 hover:bg-slate-700/80 text-purple-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 hidden md:flex shadow-sm"
          title={isMobileFrame ? 'Pantalla Completa' : 'Modo Celular Android'}
        >
          {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
