import React from 'react';
import { PlayerState, GameMode } from '../types';
import { getXpForNextLevel } from '../services/storage';
import { getAvatarById } from '../data/avatars';
import { AnimatedAvatar } from './AnimatedAvatar';
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
  Swords, 
  Smartphone, 
  Monitor, 
  User, 
  Gift,
  Users
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
  onOpenFriends?: () => void;
  onOpenStats: () => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  hasUnclaimedQuests?: boolean;
  hasUnclaimedAchievements?: boolean;
  hasUnclaimedDailyReward?: boolean;
  onOpenDailyRewards?: () => void;
  onOpenLuckySpin?: () => void;
  hasFreeLuckySpin?: boolean;
  onOpenMultiplayer?: () => void;
  onOpenCampaign?: () => void;
  onOpenTalents?: () => void;
  onOpenCosmicPass?: () => void;
  onOpenConstellations?: () => void;
  onOpenAd?: () => void;
  hasPendingChallenges?: boolean;
  hasPendingUpdate?: boolean;
  onOpenUpdateModal?: () => void;
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
  onOpenFriends,
  onOpenStats,
  onOpenProfile,
  onToggleSound,
  isMobileFrame,
  onToggleMobileFrame,
  hasUnclaimedQuests = false,
  hasUnclaimedAchievements = false,
  hasUnclaimedDailyReward = false,
  onOpenDailyRewards,
  onOpenLuckySpin,
  hasFreeLuckySpin = false,
  onOpenMultiplayer,
  onOpenCampaign,
  onOpenTalents,
  onOpenCosmicPass,
  onOpenConstellations,
  onOpenAd,
  hasPendingChallenges = false,
  hasPendingUpdate = false,
  onOpenUpdateModal,
}) => {
  const currentXpTarget = getXpForNextLevel(playerState.level);
  const xpPercent = Math.min(100, Math.floor((playerState.xp / currentXpTarget) * 100));
  const lang = playerState.language || 'es';
  const currentAvatar = getAvatarById(playerState.avatar);
  const talentPoints = playerState.talentPoints || 0;

  return (
    <header className="w-full bg-slate-950/85 backdrop-blur-2xl border-b border-cyan-500/20 px-2 sm:px-3.5 py-1.5 sm:py-2 text-white shadow-[0_4px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-1.5 sm:gap-2 z-20 shrink-0 select-none safe-pt safe-pl safe-pr relative overflow-hidden">
      {/* Top subtle cyan laser hairline */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />

      {/* Left: Player Profile & Level XP Bento Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0" data-tutorial="profile-hud">
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 sm:gap-2.5 bg-slate-950/90 p-1 sm:p-1.5 pr-2 sm:pr-3 rounded-2xl border border-slate-700/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all text-left active:scale-95 group cursor-pointer relative"
          title={t('profile', lang)}
        >
          <div className="relative flex items-center justify-center shrink-0">
            <AnimatedAvatar avatarItem={currentAvatar} size="sm" showBadge={false} />
            <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[8px] sm:text-[9px] px-1 py-0 rounded-full border border-yellow-200 shadow-md leading-none z-20">
              L{playerState.level}
            </span>
          </div>
          
          <div className="flex flex-col min-w-[70px] sm:min-w-[100px]">
            <div className="flex justify-between text-[11px] sm:text-xs font-black text-slate-300 mb-0.5">
              <span className="truncate max-w-[60px] sm:max-w-[85px] text-amber-300 group-hover:text-amber-200 tracking-tight">{playerState.name}</span>
              <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono hidden xs:inline">{playerState.xp}/{currentXpTarget} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </button>

        {/* Coins Counter Bento Chip */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-950/60 to-slate-950/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border border-amber-500/40 text-amber-300 font-black text-[11px] sm:text-xs shadow-[0_0_12px_rgba(245,158,11,0.15)] shrink-0">
          <span className="text-xs sm:text-sm animate-pulse drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">🪙</span>
          <span className="font-mono">{playerState.coins.toLocaleString()}</span>
        </div>

        {/* Active Boosters Chip */}
        {Object.values(playerState.activeBoosters || {}).some((charges) => Number(charges) > 0) && (
          <div
            onClick={onOpenShop}
            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-purple-950/90 via-fuchsia-950/80 to-slate-950 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl border border-purple-400/50 text-purple-200 font-black text-xs shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer hover:border-purple-300 transition-all shrink-0"
            title="Potenciadores activos de Caja de Sorpresas"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-bounce" />
            <span>
              {Object.values(playerState.activeBoosters || {}).reduce((a: number, b: number) => a + Number(b), 0)} Usos
            </span>
          </div>
        )}

        {/* Pending APK Update Indicator Button */}
        {hasPendingUpdate && onOpenUpdateModal && (
          <button
            type="button"
            onClick={onOpenUpdateModal}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500/30 via-purple-500/30 to-cyan-500/30 border border-cyan-400/60 hover:border-cyan-300 px-2 sm:px-2.5 py-1 rounded-2xl text-[10px] sm:text-[11px] font-black text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Nueva versión APK disponible"
          >
            <span>🚀</span>
            <span className="hidden xs:inline">{lang === 'es' ? 'Actualizar' : 'Update'}</span>
          </button>
        )}
      </div>

      {/* Right Action Icons & Modals (Horizontal Scrollable Strip on small viewports) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-[62vw] sm:max-w-none flex-nowrap" data-tutorial="shop-buttons">
        {/* Campaign Adventure Map Button */}
        {onOpenCampaign && (
          <button
            onClick={onOpenCampaign}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-black rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.35)] transition-all active:scale-95 flex items-center gap-1.5 text-xs border border-yellow-200/70 shrink-0 cursor-pointer"
            title={lang === 'en' ? 'Constellation Adventure Campaign' : 'Saga de Constelaciones / Campaña'}
          >
            <span className="text-xs sm:text-sm">🗺️</span>
            <span className="hidden xl:inline text-[11px] font-black uppercase tracking-wider">{lang === 'en' ? 'Campaign' : 'Campaña'}</span>
          </button>
        )}

        {/* Cosmic Talents Tree Button */}
        {onOpenTalents && (
          <button
            onClick={onOpenTalents}
            className={`relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs shrink-0 cursor-pointer ${
              talentPoints > 0
                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white border-fuchsia-300 animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.5)]'
                : 'bg-slate-900/90 hover:bg-slate-800 text-purple-300 border-purple-500/30'
            }`}
            title={lang === 'en' ? 'Cosmic Talents Tree' : 'Árbol de Talentos Cósmicos'}
          >
            <span className="text-xs sm:text-sm">🔮</span>
            <span className="hidden xl:inline text-[11px] font-black uppercase tracking-wider">{lang === 'en' ? 'Talents' : 'Talentos'}</span>
            {talentPoints > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-300 text-slate-950 font-black text-[9px] px-1 rounded-full border border-slate-950 leading-none shadow">
                {talentPoints}
              </span>
            )}
          </button>
        )}

        {/* Cosmic Season Pass Button */}
        {onOpenCosmicPass && (
          <button
            onClick={onOpenCosmicPass}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-black rounded-xl shadow-[0_4px_12px_rgba(236,72,153,0.35)] transition-all active:scale-95 flex items-center gap-1.5 text-xs border border-pink-300/50 shrink-0 cursor-pointer"
            title={lang === 'en' ? 'Cosmic Season Pass' : 'Pase de Temporada Cósmico'}
          >
            <span className="text-xs sm:text-sm">👑</span>
            <span className="hidden xl:inline text-[11px] font-black uppercase tracking-wider">{lang === 'en' ? 'Pass' : 'Pase'}</span>
          </button>
        )}

        {/* Constellations / Cosmic Clan Button */}
        {onOpenConstellations && (
          <button
            onClick={onOpenConstellations}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 hover:brightness-110 text-white font-black rounded-xl shadow-[0_4px_12px_rgba(6,182,212,0.35)] transition-all active:scale-95 flex items-center gap-1.5 text-xs border border-cyan-300/50 shrink-0 cursor-pointer"
            title={lang === 'en' ? 'Cosmic Constellations & Clans' : 'Constelaciones y Gremios Cósmicos'}
          >
            <span className="text-xs sm:text-sm">🛡️</span>
            <span className="hidden xl:inline text-[11px] font-black uppercase tracking-wider">{lang === 'en' ? 'Clans' : 'Gremios'}</span>
          </button>
        )}

        {onOpenMultiplayer && (
          <button
            onClick={onOpenMultiplayer}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-black rounded-xl shadow-[0_4px_12px_rgba(244,63,94,0.35)] transition-all active:scale-95 flex items-center gap-1.5 text-xs border border-pink-300/50 shrink-0 cursor-pointer"
            title="Multijugador 1v1 Online"
          >
            <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
            <span className="hidden lg:inline text-[11px] font-black">1v1</span>
          </button>
        )}
        {onOpenDailyRewards && (
          <button
            onClick={onOpenDailyRewards}
            className={`relative p-1.5 sm:p-2 rounded-xl border transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer ${
              hasUnclaimedDailyReward
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-amber-300 animate-pulse'
                : 'bg-slate-800/70 hover:bg-slate-700/80 text-amber-400 border-slate-700/60'
            }`}
            title="Recompensa Diaria de Acceso"
          >
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {hasUnclaimedDailyReward && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        )}

        {onOpenLuckySpin && (
          <button
            onClick={onOpenLuckySpin}
            className={`relative p-1.5 sm:p-2 rounded-xl border transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer ${
              hasFreeLuckySpin
                ? 'bg-gradient-to-tr from-purple-500 to-pink-500 text-white border-pink-300 animate-pulse'
                : 'bg-slate-800/70 hover:bg-slate-700/80 text-purple-300 border-slate-700/60'
            }`}
            title="Ruleta Cósmica de la Suerte"
          >
            <span className="text-xs sm:text-sm select-none">🎡</span>
            {hasFreeLuckySpin && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-ping" />
            )}
          </button>
        )}

        <button
          onClick={onOpenQuests}
          className="relative p-1.5 sm:p-2 bg-slate-800/70 hover:bg-slate-700/80 text-amber-300 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer"
          title={t('quests', lang)}
        >
          <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {hasUnclaimedQuests && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping" />
          )}
        </button>

        <button
          onClick={onOpenShop}
          className="p-1.5 sm:p-2 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 text-slate-950 font-extrabold rounded-xl hover:brightness-110 shadow-md transition-transform active:scale-95 flex items-center gap-1 text-xs shrink-0 cursor-pointer"
          title={t('shop', lang)}
        >
          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{t('shop', lang)}</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="relative p-1.5 sm:p-2 bg-slate-800/70 hover:bg-slate-700/80 text-yellow-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer"
          title={t('achievements', lang)}
        >
          <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {hasUnclaimedAchievements && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full" />
          )}
        </button>

        <button
          onClick={onOpenLeaderboard}
          className="p-1.5 sm:p-2 bg-slate-800/70 hover:bg-slate-700/80 text-cyan-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer"
          title={t('leaderboard', lang)}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {onOpenFriends && (
          <button
            onClick={onOpenFriends}
            className={`relative p-1.5 sm:p-2 rounded-xl border transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer ${
              hasPendingChallenges
                ? 'bg-gradient-to-tr from-pink-600 to-rose-600 text-white border-pink-300 animate-pulse'
                : 'bg-slate-800/70 hover:bg-slate-700/80 text-pink-300 border-slate-700/60'
            }`}
            title={t('friends', lang)}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {hasPendingChallenges && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            )}
          </button>
        )}

        <button
          onClick={onOpenStats}
          className="p-1.5 sm:p-2 bg-slate-800/70 hover:bg-slate-700/80 text-emerald-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer"
          title={t('stats', lang)}
        >
          <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={onOpenProfile}
          className="p-1.5 sm:p-2 bg-slate-800/70 hover:bg-slate-700/80 text-amber-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer"
          title={t('profile', lang)}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          onClick={onToggleSound}
          className={`p-1.5 sm:p-2 rounded-xl border transition-transform active:scale-95 shadow-sm shrink-0 cursor-pointer ${
            playerState.soundEnabled 
              ? 'bg-slate-800/70 text-emerald-400 border-slate-700/60' 
              : 'bg-slate-800/70 text-slate-500 border-slate-700/60'
          }`}
          title={playerState.soundEnabled ? 'Sonido Activado' : 'Sonido Silenciado'}
        >
          {playerState.soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>

        <button
          onClick={onToggleMobileFrame}
          className="p-1.5 sm:p-2 bg-slate-800/70 hover:bg-slate-700/80 text-purple-400 rounded-xl border border-slate-700/60 transition-transform active:scale-95 hidden md:flex shadow-sm shrink-0 cursor-pointer"
          title={isMobileFrame ? 'Pantalla Completa' : 'Modo Celular Android'}
        >
          {isMobileFrame ? <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>
    </header>
  );
};
