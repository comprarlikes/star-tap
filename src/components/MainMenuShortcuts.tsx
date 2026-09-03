import React from 'react';
import { Trophy, ShoppingBag, Swords, Map, Gift, Radio, Crown, Flame, Zap } from 'lucide-react';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface MainMenuShortcutsProps {
  playerState: PlayerState;
  onOpenLuckySpin?: () => void;
  hasFreeLuckySpin?: boolean;
  onOpenCosmicPass?: () => void;
  onOpenShop?: () => void;
  onOpenCampaign?: () => void;
  onOpenMultiplayer?: () => void;
  onOpenQuests?: () => void;
  hasUnclaimedQuests?: boolean;
  hasUnclaimedDailyReward?: boolean;
  onOpenDailyRewards?: () => void;
}

export const MainMenuTopShortcuts: React.FC<MainMenuShortcutsProps> = ({
  playerState,
  onOpenLuckySpin,
  hasFreeLuckySpin = true,
  onOpenCosmicPass,
  onOpenShop,
}) => {
  const isEn = playerState.language === 'en';
  const passTier = playerState.cosmicPass?.currentTier || 1;

  const handleShortcutClick = (callback?: () => void) => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    if (callback) callback();
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between gap-2 px-1 sm:px-2 mb-2 z-30 shrink-0 select-none animate-fade-in">
      {/* 1. TOP-LEFT RED DOT: RULETA CÓSMICA */}
      <button
        onClick={() => handleShortcutClick(onOpenLuckySpin)}
        className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-amber-950/80 via-slate-900/90 to-slate-950/95 border-2 border-amber-400/60 hover:border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 transition-all cursor-pointer animate-float-widget-a flex-1 min-w-0"
        title={isEn ? 'Cosmic Lucky Spin' : 'Ruleta Cósmica'}
      >
        {/* Notification Pip */}
        {hasFreeLuckySpin && (
          <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 border border-yellow-200 text-slate-950 font-black text-[8px] sm:text-[9px] shadow-lg animate-badge-ping-pro uppercase tracking-wider">
            {isEn ? 'FREE!' : '¡GRATIS!'}
          </div>
        )}

        {/* Icon Orb */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-inner flex items-center justify-center mb-1 group-hover:rotate-12 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-lg">
            <span className="animate-spin" style={{ animationDuration: '9s' }}>🎡</span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black text-amber-200 group-hover:text-amber-100 uppercase tracking-tight truncate w-full text-center drop-shadow">
          {isEn ? 'Lucky Spin' : 'Ruleta'}
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-amber-400/80 uppercase tracking-widest leading-none truncate w-full text-center">
          {hasFreeLuckySpin ? (isEn ? 'Ready!' : '¡Disponible!') : (isEn ? 'Daily' : 'Diaria')}
        </span>
      </button>

      {/* 2. TOP-CENTER RED DOT: PASE CÓSMICO */}
      <button
        onClick={() => handleShortcutClick(onOpenCosmicPass)}
        className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-purple-950/80 via-slate-900/90 to-slate-950/95 border-2 border-purple-400/70 hover:border-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.4)] hover:shadow-[0_0_28px_rgba(168,85,247,0.7)] active:scale-95 transition-all cursor-pointer animate-float-widget-b flex-1 min-w-0"
        title={isEn ? 'Cosmic Season Pass' : 'Pase Cósmico de Temporada'}
      >
        {/* VIP / Level Badge */}
        <div className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 border border-fuchsia-200 text-white font-black text-[8px] sm:text-[9px] shadow-lg uppercase tracking-wider flex items-center gap-0.5">
          <Crown className="w-2.5 h-2.5 text-yellow-300 fill-yellow-300" />
          <span>T{passTier}</span>
        </div>

        {/* Icon Orb */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-fuchsia-400 p-0.5 shadow-inner flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-lg">
            <span className="animate-pulse">🔮</span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black text-purple-200 group-hover:text-purple-100 uppercase tracking-tight truncate w-full text-center drop-shadow">
          {isEn ? 'Cosmic Pass' : 'Pase Cósmico'}
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest leading-none truncate w-full text-center">
          {isEn ? `Tier ${passTier}` : `Nivel ${passTier}`}
        </span>
      </button>

      {/* 3. TOP-RIGHT RED DOT: TIENDA CÓSMICA */}
      <button
        onClick={() => handleShortcutClick(onOpenShop)}
        className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-cyan-950/80 via-slate-900/90 to-slate-950/95 border-2 border-cyan-400/60 hover:border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] active:scale-95 transition-all cursor-pointer animate-float-widget-c flex-1 min-w-0"
        title={isEn ? 'Cosmic Shop & Bazaar' : 'Tienda y Bazar Cósmico'}
      >
        {/* Badge */}
        <div className="absolute -top-2 -left-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-200 text-slate-950 font-black text-[8px] sm:text-[9px] shadow-lg uppercase tracking-wider">
          {isEn ? 'SHOP' : 'TIENDA'}
        </div>

        {/* Icon Orb */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-400 p-0.5 shadow-inner flex items-center justify-center mb-1 group-hover:-rotate-12 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-lg">
            <span>💎</span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black text-cyan-200 group-hover:text-cyan-100 uppercase tracking-tight truncate w-full text-center drop-shadow">
          {isEn ? 'Shop' : 'Bazar'}
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-cyan-400/80 uppercase tracking-widest leading-none truncate w-full text-center">
          {isEn ? 'Deals' : 'Objetos'}
        </span>
      </button>
    </div>
  );
};

export const MainMenuBottomShortcuts: React.FC<MainMenuShortcutsProps> = ({
  playerState,
  onOpenCampaign,
  onOpenMultiplayer,
  onOpenQuests,
  hasUnclaimedQuests = false,
  hasUnclaimedDailyReward = false,
}) => {
  const isEn = playerState.language === 'en';
  const campaignUnlocked = playerState.campaignProgress?.unlockedLevel || 1;
  const trophies = playerState.trophies || 0;
  const questsPending = hasUnclaimedQuests || hasUnclaimedDailyReward;

  const handleShortcutClick = (callback?: () => void) => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    if (callback) callback();
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md flex items-center justify-between gap-2 px-1 sm:px-2 mt-2 z-30 shrink-0 select-none animate-fade-in">
      {/* 4. BOTTOM-LEFT RED DOT: MODO CAMPAÑA */}
      <button
        onClick={() => handleShortcutClick(onOpenCampaign)}
        className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-blue-950/80 via-slate-900/90 to-slate-950/95 border-2 border-blue-400/60 hover:border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.35)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] active:scale-95 transition-all cursor-pointer animate-float-widget-c flex-1 min-w-0"
        title={isEn ? 'Galaxy Campaign Map' : 'Modo Campaña Galáctica'}
      >
        {/* Progress Badge */}
        <div className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-300 text-white font-black text-[8px] sm:text-[9px] shadow-lg uppercase tracking-wider">
          {isEn ? `Lv.${campaignUnlocked}` : `Nv.${campaignUnlocked}`}
        </div>

        {/* Icon Orb */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-400 p-0.5 shadow-inner flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-lg">
            <span>🗺️</span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black text-blue-200 group-hover:text-blue-100 uppercase tracking-tight truncate w-full text-center drop-shadow">
          {isEn ? 'Campaign' : 'Campaña'}
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-blue-400/80 uppercase tracking-widest leading-none truncate w-full text-center">
          {isEn ? 'Galaxy Map' : 'Mundo Estelar'}
        </span>
      </button>

      {/* 5. BOTTOM-CENTER RED DOT: MULTIJUGADOR 1v1 EN DIRECTO */}
      <button
        onClick={() => handleShortcutClick(onOpenMultiplayer)}
        className="group relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl bg-gradient-to-b from-rose-950/90 via-slate-900/95 to-slate-950/95 border-2 border-rose-500/80 hover:border-rose-400 shadow-[0_0_22px_rgba(244,63,94,0.45)] hover:shadow-[0_0_35px_rgba(244,63,94,0.8)] active:scale-95 transition-all cursor-pointer animate-float-widget-a flex-1 min-w-0"
        title={isEn ? '1v1 Live Multiplayer Arena' : 'Arena 1v1 en Directo'}
      >
        {/* Live Indicator Badge */}
        <div className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 border border-rose-200 text-white font-black text-[8px] sm:text-[9px] shadow-xl uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{isEn ? 'LIVE 1v1' : 'EN DIRECTO'}</span>
        </div>

        {/* Clashing Swords Icon Orb */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 p-0.5 shadow-inner flex items-center justify-center mb-1 group-hover:rotate-6 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-lg">
            <span className="animate-pulse">⚔️</span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black text-rose-200 group-hover:text-rose-100 uppercase tracking-tight truncate w-full text-center drop-shadow">
          {isEn ? 'Live Arena' : 'Arena 1v1'}
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-amber-300 uppercase tracking-widest leading-none flex items-center gap-0.5 justify-center truncate w-full text-center">
          <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
          <span>{trophies} 🏆</span>
        </span>
      </button>

      {/* 6. BOTTOM-RIGHT RED DOT: MISIONES & DESAFÍOS */}
      <button
        onClick={() => handleShortcutClick(onOpenQuests)}
        className="group relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-2xl bg-gradient-to-b from-emerald-950/80 via-slate-900/90 to-slate-950/95 border-2 border-emerald-400/60 hover:border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] active:scale-95 transition-all cursor-pointer animate-float-widget-b flex-1 min-w-0"
        title={isEn ? 'Daily Quests & Challenges' : 'Misiones y Desafíos Diarios'}
      >
        {/* Notification Pip */}
        {questsPending && (
          <div className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 border border-emerald-200 text-slate-950 font-black text-[8px] sm:text-[9px] shadow-lg animate-badge-ping-pro uppercase tracking-wider">
            !
          </div>
        )}

        {/* Icon Orb */}
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-inner flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center text-base sm:text-lg">
            <span>📜</span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black text-emerald-200 group-hover:text-emerald-100 uppercase tracking-tight truncate w-full text-center drop-shadow">
          {isEn ? 'Quests' : 'Misiones'}
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-emerald-400/80 uppercase tracking-widest leading-none truncate w-full text-center">
          {questsPending ? (isEn ? 'Claim!' : '¡Reclamar!') : (isEn ? 'Daily' : 'Diarias')}
        </span>
      </button>
    </div>
  );
};

export const MainMenuShortcuts: React.FC<MainMenuShortcutsProps> = (props) => {
  return (
    <>
      <MainMenuTopShortcuts {...props} />
      <MainMenuBottomShortcuts {...props} />
    </>
  );
};
