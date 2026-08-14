import React, { useState } from 'react';
import { PlayerState, ShopItem } from '../types';
import { soundManager } from '../services/sound';
import { SHOP_ITEMS } from '../services/storage';
import { MYSTERY_BOX_PRICE } from '../services/mysteryBoxService';
import { MysteryBoxModal } from './MysteryBoxModal';
import { X, Check, ShoppingBag, Lock, Sparkles, Shield, Clock, Zap, Tv, Gift } from 'lucide-react';

interface ShopModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onBuyOrEquipItem: (item: ShopItem) => void;
  onUpgradePowerup: (upgradeKey: string, cost: number) => void;
  onWatchAd?: () => void;
  onUpdatePlayerState: (newState: PlayerState) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  playerState,
  onClose,
  onBuyOrEquipItem,
  onUpgradePowerup,
  onWatchAd,
  onUpdatePlayerState,
}) => {
  const [activeTab, setActiveTab] = useState<'box' | 'skin' | 'theme' | 'character' | 'upgrade'>('box');
  const [showMysteryBoxModal, setShowMysteryBoxModal] = useState<boolean>(false);

  const filteredItems = SHOP_ITEMS.filter((item) => item.type === activeTab);

  const handleAction = (item: ShopItem) => {
    soundManager.playButtonClick();

    if (item.type === 'upgrade') {
      const currentLevel = playerState.upgrades[item.id] || 0;
      const nextCost = item.price * (currentLevel + 1);
      if (playerState.coins >= nextCost && currentLevel < (item.maxLevel || 5)) {
        onUpgradePowerup(item.id, nextCost);
        soundManager.playCoin();
      }
    } else {
      onBuyOrEquipItem(item);
    }
  };

  const isEquipped = (item: ShopItem) => {
    if (item.type === 'skin') return playerState.equippedSkin === item.id;
    if (item.type === 'theme') return playerState.equippedTheme === item.id;
    if (item.type === 'character') return playerState.equippedCharacter === item.id;
    return false;
  };

  const isUnlocked = (item: ShopItem) => {
    if (item.type === 'skin') return playerState.unlockedSkins.includes(item.id);
    if (item.type === 'theme') return playerState.unlockedThemes.includes(item.id);
    if (item.type === 'character') return playerState.unlockedCharacters.includes(item.id);
    return true; // upgrades are unlocked by default
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md h-[85vh] bg-slate-900/90 border border-slate-800 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">TIENDA ARCADE</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-2xl border border-amber-500/30 text-amber-400 font-extrabold text-xs shadow-inner">
              <span className="text-sm">🪙</span>
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

        {/* Rewarded Ad Banner */}
        {onWatchAd && (
          <div className="px-4 pt-3 pb-1 bg-slate-950/90 border-b border-slate-800">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onWatchAd();
              }}
              className="w-full p-3 bg-gradient-to-r from-purple-900/60 via-pink-900/50 to-slate-900 border border-pink-500/40 rounded-2xl flex items-center justify-between shadow-lg hover:brightness-110 active:scale-98 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-600/80 border border-pink-400/50 flex items-center justify-center text-white shadow">
                  <Tv className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-white">Ver Anuncio Recompensado</span>
                  <span className="text-[10px] text-pink-300 font-medium">Gana +80 Monedas al instante</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow border border-yellow-200/50 uppercase tracking-wider">
                Ver (+80🪙)
              </span>
            </button>
          </div>
        )}

        {/* Tab Buttons (Segmented Bento Control) */}
        <div className="grid grid-cols-5 p-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold gap-1">
          <button
            onClick={() => setActiveTab('box')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'box'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <span className="text-sm animate-pulse">🎁</span>
            <span>Cajas</span>
          </button>

          <button
            onClick={() => setActiveTab('skin')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'skin' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⭐</span>
            <span>Skins</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'theme' ? 'bg-purple-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌌</span>
            <span>Fondos</span>
          </button>

          <button
            onClick={() => setActiveTab('character')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'character' ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🐶</span>
            <span>Mascotas</span>
          </button>

          <button
            onClick={() => setActiveTab('upgrade')}
            className={`py-2 rounded-xl transition-all flex flex-col items-center gap-0.5 ${
              activeTab === 'upgrade' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>⚡</span>
            <span>Mejoras</span>
          </button>
        </div>

        {/* Shop Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Mystery Box Tab Showcase */}
          {activeTab === 'box' && (
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col items-center text-center gap-4">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-amber-400/50 flex items-center justify-center text-5xl shadow-xl shadow-amber-500/20">
                  🎁
                </div>
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                  NUEVO
                </span>
              </div>

              <div>
                <h4 className="text-xl font-black text-amber-400 tracking-tight">CAJA DE SORPRESAS ARCADE</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                  ¡Abre la caja misteriosa para conseguir recompensas aleatorias con probabilidad transparente!
                </p>
              </div>

              {/* Reward categories badges */}
              <div className="grid grid-cols-3 gap-2 w-full text-[11px] font-bold">
                <div className="bg-slate-950/80 border border-amber-500/30 p-2 rounded-xl text-amber-300 flex flex-col items-center gap-0.5">
                  <span>🪙 Monedas</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hasta 2,000</span>
                </div>
                <div className="bg-slate-950/80 border border-purple-500/30 p-2 rounded-xl text-purple-300 flex flex-col items-center gap-0.5">
                  <span>⚡ Potenciador</span>
                  <span className="text-[10px] text-slate-400 font-normal">Partidas x2</span>
                </div>
                <div className="bg-slate-950/80 border border-pink-500/30 p-2 rounded-xl text-pink-300 flex flex-col items-center gap-0.5">
                  <span>⭐ Skin Rara</span>
                  <span className="text-[10px] text-slate-400 font-normal">Desbloqueo</span>
                </div>
              </div>

              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowMysteryBoxModal(true);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 border border-yellow-200 transition-all flex items-center justify-center gap-2 mt-1"
              >
                <Gift className="w-5 h-5 animate-bounce" />
                <span>COMPRAR CAJA SORPRESA</span>
                <span className="bg-slate-950/30 px-2.5 py-0.5 rounded-xl border border-slate-900/40 text-xs font-black">
                  🪙 {MYSTERY_BOX_PRICE}
                </span>
              </button>
            </div>
          )}

          {activeTab !== 'box' && filteredItems.map((item) => {
            const unlocked = isUnlocked(item);
            const equipped = isEquipped(item);

            if (item.type === 'upgrade') {
              const currentLvl = playerState.upgrades[item.id] || 0;
              const maxLvl = item.maxLevel || 5;
              const isMax = currentLvl >= maxLvl;
              const cost = item.price * (currentLvl + 1);

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                      {item.icon}
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{item.name}</span>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Nivel {currentLvl}/{maxLvl}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <button
                    disabled={isMax || playerState.coins < cost}
                    onClick={() => handleAction(item)}
                    className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap flex items-center gap-1 ${
                      isMax
                        ? 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
                        : playerState.coins >= cost
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md'
                        : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 opacity-60'
                    }`}
                  >
                    {isMax ? (
                      <span>MÁXIMO</span>
                    ) : (
                      <>
                        <span>🪙 {cost}</span>
                        <span>MEJORAR</span>
                      </>
                    )}
                  </button>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  equipped
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : unlocked
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-850 opacity-80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner relative"
                    style={{ borderColor: item.color }}
                  >
                    {item.icon}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center">
                        <Lock className="w-4 h-4 text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{item.name}</span>
                      {equipped && (
                        <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                          EQUIPADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                    {item.effectDescription && (
                      <span className="text-[10px] text-amber-300 font-bold mt-1">
                        ✨ {item.effectDescription}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  {equipped ? (
                    <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : unlocked ? (
                    <button
                      onClick={() => handleAction(item)}
                      className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs rounded-xl border border-slate-700/60 transition-all active:scale-95"
                    >
                      EQUIPAR
                    </button>
                  ) : (
                    <button
                      disabled={playerState.coins < item.price}
                      onClick={() => handleAction(item)}
                      className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                        playerState.coins >= item.price
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 opacity-60'
                      }`}
                    >
                      <span>🪙 {item.price}</span>
                      <span>COMPRAR</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showMysteryBoxModal && (
        <MysteryBoxModal
          playerState={playerState}
          onClose={() => setShowMysteryBoxModal(false)}
          onUpdatePlayerState={onUpdatePlayerState}
          onBuyOrEquipItem={onBuyOrEquipItem}
        />
      )}
    </div>
  );
};
