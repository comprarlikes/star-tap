import React, { useState } from 'react';
import { PlayerState, ShopItem } from '../types';
import {
  MysteryBoxReward,
  MYSTERY_BOX_PRICE,
  MYSTERY_BOX_PROBABILITIES,
  openMysteryBox,
  TEMPORARY_POWERUPS,
} from '../services/mysteryBoxService';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { X, Sparkles, Gift, HelpCircle, Check, ArrowRight, Zap, Trophy, Shield, Clock } from 'lucide-react';

interface MysteryBoxModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onUpdatePlayerState: (newState: PlayerState) => void;
  onBuyOrEquipItem?: (item: ShopItem) => void;
}

export const MysteryBoxModal: React.FC<MysteryBoxModalProps> = ({
  playerState,
  onClose,
  onUpdatePlayerState,
  onBuyOrEquipItem,
}) => {
  const [openingState, setOpeningState] = useState<'idle' | 'shaking' | 'revealing' | 'reward'>('idle');
  const [currentReward, setCurrentReward] = useState<MysteryBoxReward | null>(null);
  const [showProbabilities, setShowProbabilities] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canAfford = playerState.coins >= MYSTERY_BOX_PRICE;

  const handleOpenBox = () => {
    if (!canAfford) {
      setErrorMsg('¡Monedas insuficientes para abrir una Caja de Sorpresas!');
      soundManager.playButtonClick();
      return;
    }

    setErrorMsg(null);
    soundManager.playButtonClick();
    hapticManager.heavyTap();

    try {
      const { reward, updatedState } = openMysteryBox(playerState);
      onUpdatePlayerState(updatedState);
      setCurrentReward(reward);

      // Animation Phase 1: Shaking Box
      setOpeningState('shaking');

      setTimeout(() => {
        // Animation Phase 2: Burst Flash
        setOpeningState('revealing');
        soundManager.playCoin();
        hapticManager.success();

        setTimeout(() => {
          // Animation Phase 3: Reveal Reward
          setOpeningState('reward');
          if (reward.rarity === 'legendary') {
            soundManager.playLevelUp();
          } else {
            soundManager.playPowerup();
          }
        }, 600);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al abrir la caja.');
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-black text-xs rounded-full shadow-lg border border-yellow-200 animate-pulse tracking-wide flex items-center gap-1">
            ✨ LEGENDARIO
          </span>
        );
      case 'epic':
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs rounded-full shadow-md border border-pink-300 tracking-wide flex items-center gap-1">
            🔥 ÉPICO
          </span>
        );
      case 'rare':
        return (
          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-full shadow-md border border-cyan-300 tracking-wide flex items-center gap-1">
            ⭐ RARO
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-700 text-slate-200 font-extrabold text-xs rounded-full border border-slate-600">
            🟢 COMÚN
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 rounded-2xl shadow-lg">
              <Gift className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">CAJA DE SORPRESAS</h3>
              <p className="text-[10px] text-amber-300 font-medium">¡Monedas, Potenciadores y Skins Raras!</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-2xl border border-amber-500/30 text-amber-400 font-extrabold text-xs shadow-inner">
              <span>🪙</span>
              <span>{playerState.coins.toLocaleString()}</span>
            </div>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[380px]">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {openingState === 'idle' && (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Box Graphic */}
              <div className="relative group cursor-pointer" onClick={handleOpenBox}>
                <div className="w-36 h-36 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-slate-950 rounded-[1.3rem] flex flex-col items-center justify-center border border-amber-400/40 relative overflow-hidden">
                    <span className="text-6xl drop-shadow-[0_10px_10px_rgba(245,158,11,0.5)] group-hover:rotate-6 transition-transform">
                      🎁
                    </span>
                    <span className="mt-1 text-[11px] font-black tracking-widest text-amber-400 uppercase">
                      ARCADE BOX
                    </span>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-pink-300 animate-pulse">
                  ¡PREMIO GARANTIZADO!
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-full space-y-2 mt-2">
                <button
                  disabled={!canAfford}
                  onClick={handleOpenBox}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${
                    canAfford
                      ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-98 shadow-amber-500/25 border border-yellow-200'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-5 h-5" />
                  <span>ABRIR CAJA SORPRESA</span>
                  <span className="bg-slate-950/30 px-2.5 py-0.5 rounded-xl border border-slate-900/40 font-extrabold text-xs">
                    🪙 {MYSTERY_BOX_PRICE}
                  </span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowProbabilities(!showProbabilities);
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-amber-300 flex items-center justify-center gap-1 py-1 w-full transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showProbabilities ? 'Ocultar Probabilidades' : 'Ver Tabla de Probabilidades'}</span>
                </button>
              </div>

              {/* Probabilities Breakdown */}
              {showProbabilities && (
                <div className="w-full mt-2 bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 text-left text-xs space-y-2.5 animate-fade-in shadow-inner">
                  <div className="font-extrabold text-amber-400 text-center pb-1 border-b border-slate-800">
                    📊 Probabilidades Oficiales de la Caja
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>🪙</span> Monedas Aleatorias (150 - 2,000 pts)
                    </span>
                    <span className="font-black text-amber-400">
                      {Math.round(MYSTERY_BOX_PROBABILITIES.coins * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>⚡</span> Potenciadores Temporales
                    </span>
                    <span className="font-black text-purple-400">
                      {Math.round(MYSTERY_BOX_PROBABILITIES.powerup * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>⭐</span> Skin Rara Exclusiva
                    </span>
                    <span className="font-black text-pink-400">
                      {Math.round(MYSTERY_BOX_PROBABILITIES.skin * 100)}%
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-1 border-t border-slate-900 pt-1">
                    * Si ya posees todas las skins, el 12% otorga una compensación de +1,200 Monedas Legendarias.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Shaking Animation */}
          {openingState === 'shaking' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-bounce">
              <div className="text-8xl animate-spin transition-transform duration-500">🎁</div>
              <span className="text-base font-black text-amber-400 tracking-wider animate-pulse">
                ¡ABRIENDO CAJA MISTERIOSA...!
              </span>
            </div>
          )}

          {/* Revealing Flash */}
          {openingState === 'revealing' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 scale-125 transition-transform duration-300">
              <div className="text-8xl animate-ping">✨</div>
              <span className="text-lg font-black text-yellow-300">¡REVELANDO PREMIO!</span>
            </div>
          )}

          {/* Reward Screen */}
          {openingState === 'reward' && currentReward && (
            <div className="flex flex-col items-center text-center space-y-4 w-full animate-fade-in">
              <div>{getRarityBadge(currentReward.rarity)}</div>

              <div className="relative my-2">
                <div
                  className="w-28 h-28 rounded-3xl bg-slate-950 border-2 flex items-center justify-center text-6xl shadow-2xl relative overflow-hidden"
                  style={{ borderColor: currentReward.color || '#f59e0b' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-transparent to-white/10 pointer-events-none" />
                  <span>{currentReward.icon}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-black text-white tracking-tight">{currentReward.title}</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs">{currentReward.description}</p>
              </div>

              {/* Action Footer Buttons */}
              <div className="w-full space-y-2 pt-2">
                {currentReward.type === 'skin' && currentReward.skinId && onBuyOrEquipItem && (
                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      onBuyOrEquipItem({
                        id: currentReward.skinId!,
                        name: currentReward.skinName!,
                        description: '',
                        type: 'skin',
                        price: 0,
                        icon: currentReward.icon,
                        unlocked: true,
                        color: currentReward.color,
                      });
                      onClose();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>EQUIPAR SKIN AHORA</span>
                  </button>
                )}

                <div className="flex gap-2">
                  <button
                    disabled={!canAfford}
                    onClick={handleOpenBox}
                    className={`flex-1 py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <span>ABRIR OTRA (🪙 {MYSTERY_BOX_PRICE})</span>
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      onClose();
                    }}
                    className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all active:scale-95"
                  >
                    ACEPTAR
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
