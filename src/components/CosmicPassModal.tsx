import React, { useState } from 'react';
import { PlayerState, CosmicPassTier, CosmicPassReward } from '../types';
import { COSMIC_PASS_TIERS, CURRENT_SEASON_INFO } from '../data/cosmicPass';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { 
  X, 
  Sparkles, 
  Crown, 
  Gift, 
  CheckCircle2, 
  Lock, 
  Zap, 
  ChevronRight, 
  Award,
  Coins
} from 'lucide-react';

interface CosmicPassModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onClaimReward: (tier: number, track: 'free' | 'vip', reward: CosmicPassReward) => void;
  onClaimAll: (rewards: { tier: number; track: 'free' | 'vip'; reward: CosmicPassReward }[]) => void;
  onUnlockVipPass: (priceCoins: number) => void;
  language?: 'es' | 'en';
}

export const CosmicPassModal: React.FC<CosmicPassModalProps> = ({
  playerState,
  onClose,
  onClaimReward,
  onClaimAll,
  onUnlockVipPass,
  language = 'es',
}) => {
  const isEn = language === 'en';
  const pass = playerState.cosmicPass || {
    seasonNumber: 1,
    seasonName: CURRENT_SEASON_INFO.seasonName,
    seasonNameEn: CURRENT_SEASON_INFO.seasonNameEn,
    endsAt: CURRENT_SEASON_INFO.endsAt,
    currentXp: 0,
    isVipUnlocked: false,
    claimedFreeTiers: [],
    claimedVipTiers: [],
  };

  const currentXp = pass.currentXp || 0;
  const currentTier = Math.min(30, Math.floor(currentXp / CURRENT_SEASON_INFO.xpPerTier));
  const xpIntoCurrentTier = currentXp % CURRENT_SEASON_INFO.xpPerTier;
  const tierProgressPercent = currentTier >= 30 ? 100 : Math.floor((xpIntoCurrentTier / CURRENT_SEASON_INFO.xpPerTier) * 100);

  // Compute all unclaimed available rewards for "Claim All"
  const claimableRewards: { tier: number; track: 'free' | 'vip'; reward: CosmicPassReward }[] = [];
  COSMIC_PASS_TIERS.forEach((tierObj) => {
    if (currentTier >= tierObj.tier) {
      if (!pass.claimedFreeTiers.includes(tierObj.tier)) {
        claimableRewards.push({ tier: tierObj.tier, track: 'free', reward: tierObj.freeReward });
      }
      if (pass.isVipUnlocked && !pass.claimedVipTiers.includes(tierObj.tier)) {
        claimableRewards.push({ tier: tierObj.tier, track: 'vip', reward: tierObj.vipReward });
      }
    }
  });

  const handleClaim = (tier: number, track: 'free' | 'vip', reward: CosmicPassReward) => {
    soundManager.playCoin();
    hapticManager.success();
    onClaimReward(tier, track, reward);
  };

  const handleClaimAll = () => {
    if (claimableRewards.length === 0) return;
    soundManager.playLevelUp();
    hapticManager.success();
    onClaimAll(claimableRewards);
  };

  const handleUnlockVip = () => {
    if (pass.isVipUnlocked) return;
    if (playerState.coins < CURRENT_SEASON_INFO.vipPassPriceCoins) {
      soundManager.playBombExplosion();
      hapticManager.heavyTap();
      return;
    }
    soundManager.playLevelUp();
    hapticManager.success();
    onUnlockVipPass(CURRENT_SEASON_INFO.vipPassPriceCoins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92dvh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white font-black text-xl">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-200 to-white flex items-center gap-2">
                {isEn ? 'COSMIC SEASON PASS' : 'PASE DE TEMPORADA CÓSMICO'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 font-bold">
                  {isEn ? `Tier ${currentTier}/30` : `Nivel ${currentTier}/30`}
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {isEn ? pass.seasonNameEn : pass.seasonName} • {isEn ? CURRENT_SEASON_INFO.endsAtEn : CURRENT_SEASON_INFO.endsAt}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isEn ? 'Close' : 'Cerrar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Season XP Progress & Quick Actions Strip */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* XP Progress to next Tier */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                {currentTier >= 30 ? (isEn ? 'Max Season Tier Reached!' : '¡Nivel Máximo de Temporada!') : `${isEn ? 'Next Level' : 'Siguiente Nivel'}: ${xpIntoCurrentTier}/${CURRENT_SEASON_INFO.xpPerTier} XP`}
              </span>
              <span className="text-slate-400">{currentTier}/30</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-300"
                style={{ width: `${tierProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Claim All Available Rewards Button */}
          {claimableRewards.length > 0 && (
            <button
              onClick={handleClaimAll}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <Gift className="w-4 h-4" />
              <span>{isEn ? `Claim All (${claimableRewards.length})` : `Reclamar Todo (${claimableRewards.length})`}</span>
            </button>
          )}
        </div>

        {/* VIP Pass Banner */}
        {!pass.isVipUnlocked && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 sm:p-4 bg-gradient-to-r from-amber-950/60 via-purple-950/60 to-slate-950 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 text-2xl shadow-inner shrink-0">
                👑
              </div>
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-amber-200 flex items-center gap-1.5">
                  <span>{isEn ? 'UNLOCK VIP COSMIC PASS' : 'DESBLOQUEA EL PASE VIP CÓSMICO'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 font-bold uppercase">
                    {isEn ? 'Exclusive Rewards' : 'Premios Exclusivos'}
                  </span>
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                  {isEn ? 'Get exclusive skins, legendary titles, talent point bundles & double rewards on all 30 tiers!' : '¡Obtén skins exclusivas, títulos legendarios, puntos de talento y doble recompensa en los 30 niveles!'}
                </p>
              </div>
            </div>

            <button
              onClick={handleUnlockVip}
              disabled={playerState.coins < CURRENT_SEASON_INFO.vipPassPriceCoins}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                playerState.coins >= CURRENT_SEASON_INFO.vipPassPriceCoins
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 text-slate-950 hover:brightness-110 shadow-amber-500/30 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
            >
              <Crown className="w-4 h-4 text-slate-950" />
              <span>{isEn ? `Unlock VIP (${CURRENT_SEASON_INFO.vipPassPriceCoins.toLocaleString()} 🪙)` : `Desbloquear VIP (${CURRENT_SEASON_INFO.vipPassPriceCoins.toLocaleString()} 🪙)`}</span>
            </button>
          </div>
        )}

        {/* Dual Track Tiers List: Free Track vs VIP Track */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {COSMIC_PASS_TIERS.map((tierObj) => {
            const isUnlocked = currentTier >= tierObj.tier;
            const isFreeClaimed = pass.claimedFreeTiers.includes(tierObj.tier);
            const isVipClaimed = pass.claimedVipTiers.includes(tierObj.tier);
            const isMilestone = tierObj.tier % 5 === 0 || tierObj.tier === 30;

            return (
              <div
                key={tierObj.tier}
                className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-center justify-between gap-3 ${
                  isMilestone
                    ? 'bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border-amber-500/40 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/20'
                    : isUnlocked
                    ? 'bg-slate-900/80 border-slate-700/80'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                }`}
              >
                {/* Tier Number Badge */}
                <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-between md:justify-start">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border shadow-inner ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border-amber-300'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                    {tierObj.tier}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-300">
                      {isEn ? `Tier ${tierObj.tier}` : `Nivel ${tierObj.tier}`}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {tierObj.requiredXp} XP
                    </span>
                  </div>

                  {/* Status badge for mobile */}
                  <div className="md:hidden">
                    {isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                        {isEn ? 'Unlocked' : 'Desbloqueado'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> {isEn ? 'Locked' : 'Bloqueado'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Free Reward Box */}
                <div className="flex-1 w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl sm:text-2xl">{tierObj.freeReward.icon}</span>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {isEn ? 'Free Track' : 'Vía Gratuita'}
                      </span>
                      <span className="text-xs font-bold text-slate-200">
                        {isEn ? tierObj.freeReward.nameEn || tierObj.freeReward.name : tierObj.freeReward.name}
                      </span>
                    </div>
                  </div>

                  {isFreeClaimed ? (
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isEn ? 'Claimed' : 'Reclamado'}</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaim(tierObj.tier, 'free', tierObj.freeReward)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
                    >
                      {isEn ? 'Claim' : 'Reclamar'}
                    </button>
                  ) : (
                    <div className="text-slate-600 text-xs font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* VIP Reward Box */}
                <div className="flex-1 w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-slate-950/60 border border-purple-500/30">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl sm:text-2xl">{tierObj.vipReward.icon}</span>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5 text-amber-400" />
                        {isEn ? 'VIP Cosmic Track' : 'Vía VIP Cósmica'}
                      </span>
                      <span className="text-xs font-bold text-amber-200">
                        {isEn ? tierObj.vipReward.nameEn || tierObj.vipReward.name : tierObj.vipReward.name}
                      </span>
                    </div>
                  </div>

                  {!pass.isVipUnlocked ? (
                    <div className="px-2 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span>{isEn ? 'VIP Required' : 'Requiere VIP'}</span>
                    </div>
                  ) : isVipClaimed ? (
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isEn ? 'Claimed' : 'Reclamado'}</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaim(tierObj.tier, 'vip', tierObj.vipReward)}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-pink-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
                    >
                      {isEn ? 'Claim VIP' : 'Reclamar VIP'}
                    </button>
                  ) : (
                    <div className="text-slate-600 text-xs font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
