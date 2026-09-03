import React, { useState } from 'react';
import { PlayerState, ShopItem } from '../types';
import { soundManager } from '../services/sound';
import { SHOP_ITEMS } from '../services/storage';
import { MYSTERY_BOX_PRICE } from '../services/mysteryBoxService';
import { MysteryBoxModal } from './MysteryBoxModal';
import { AnimatedAvatar } from './AnimatedAvatar';
import { Skin3DPreviewModal } from './Skin3DPreviewModal';
import { getAvatarById, AVATARS } from '../data/avatars';
import { X, Check, ShoppingBag, Lock, Sparkles, Shield, Clock, Zap, Tv, Gift, Crown, Trophy, Orbit, Eye, Compass } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'box' | 'avatar' | 'skin' | 'theme' | 'character' | 'upgrade'>('avatar');
  const [showMysteryBoxModal, setShowMysteryBoxModal] = useState<boolean>(false);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<ShopItem | null>(null);

  const filteredItems = SHOP_ITEMS.filter((item) => item.type === activeTab);
  const eventAvatars = AVATARS.filter((a) => a.category === 'events');

  const isEquipped = (item: ShopItem) => {
    if (item.type === 'avatar') return playerState.avatar === item.id;
    if (item.type === 'skin') return playerState.equippedSkin === item.id;
    if (item.type === 'theme') return playerState.equippedTheme === item.id;
    if (item.type === 'character') return playerState.equippedCharacter === item.id;
    return false;
  };

  const isUnlocked = (item: ShopItem) => {
    if (item.type === 'avatar') return (playerState.unlockedAvatars || []).includes(item.id);
    if (item.type === 'skin') return playerState.unlockedSkins.includes(item.id);
    if (item.type === 'theme') return playerState.unlockedThemes.includes(item.id);
    if (item.type === 'character') return playerState.unlockedCharacters.includes(item.id);
    return true; // upgrades are unlocked by default
  };

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

  // Open 3D preview inspector
  const handleOpen3DPreview = (item: ShopItem) => {
    soundManager.playButtonClick();
    setSelectedPreviewItem(item);
  };

  // When clicking on an item card
  const handleItemCardClick = (item: ShopItem) => {
    const unlocked = isUnlocked(item);
    if (!unlocked) {
      // Unowned item clicked -> Show rotating 3D preview!
      handleOpen3DPreview(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md h-[88vh] bg-slate-900/90 border border-slate-800 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-black text-white tracking-tight">TIENDA ARCADE</h3>
              <span className="text-[10px] text-amber-300 font-bold">Avatares y Objetos Exclusivos</span>
            </div>
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
              className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
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
              className="w-full p-2.5 bg-gradient-to-r from-purple-900/60 via-pink-900/50 to-slate-900 border border-pink-500/40 rounded-2xl flex items-center justify-between shadow-lg hover:brightness-110 active:scale-98 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-600/80 border border-pink-400/50 flex items-center justify-center text-white shadow">
                  <Tv className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-white">Ver Anuncio Recompensado</span>
                  <span className="text-[10px] text-pink-300 font-medium">Gana +80 Monedas al instante</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow border border-yellow-200/50 uppercase tracking-wider">
                +80🪙
              </span>
            </button>
          </div>
        )}

        {/* Tab Buttons (Segmented Bento Control) */}
        <div className="grid grid-cols-6 p-1.5 bg-slate-950/90 border-b border-slate-800 text-[10px] font-bold gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('avatar')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'avatar'
                ? 'bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-600 text-white shadow-md font-black ring-1 ring-cyan-300/50'
                : 'text-cyan-300/90 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="text-xs animate-spin">✨</span>
            <span className="truncate">Avatares</span>
          </button>

          <button
            onClick={() => setActiveTab('box')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'box'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <span className="text-xs animate-pulse">🎁</span>
            <span className="truncate">Cajas</span>
          </button>

          <button
            onClick={() => setActiveTab('skin')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'skin' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs">⭐</span>
            <span className="truncate">Skins</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'theme' ? 'bg-purple-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs">🌌</span>
            <span className="truncate">Fondos</span>
          </button>

          <button
            onClick={() => setActiveTab('character')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'character' ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs">🐶</span>
            <span className="truncate">Mascotas</span>
          </button>

          <button
            onClick={() => setActiveTab('upgrade')}
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'upgrade' ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-xs">⚡</span>
            <span className="truncate">Mejoras</span>
          </button>
        </div>

        {/* Shop Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 1. EXCLUSIVE ANIMATED AVATARS TAB */}
          {activeTab === 'avatar' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-fuchsia-950/80 border border-cyan-500/40 p-4 rounded-3xl text-left shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Avatares Animados en Movimiento</span>
                </div>
                <h4 className="text-base font-black text-white">Ediciones Exclusivas con Efectos Vivos</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Toca cualquier personaje para abrir la vista previa holográfica en 3D interactiva con rotación 360°.
                </p>
              </div>

              {/* Shop Exclusive Avatars List */}
              <div className="space-y-3">
                {filteredItems.map((item) => {
                  const unlocked = isUnlocked(item);
                  const equipped = isEquipped(item);
                  const avatarData = getAvatarById(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemCardClick(item)}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                        equipped
                          ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                          : unlocked
                          ? 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/40'
                          : 'bg-slate-950/50 border-slate-850 hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Live Animated Avatar Preview */}
                        <div className="relative">
                          <AnimatedAvatar avatarItem={avatarData} size="md" showBadge={false} />
                          {!unlocked && (
                            <div className="absolute inset-0 bg-slate-950/75 rounded-2xl flex items-center justify-center pointer-events-none">
                              <Lock className="w-4 h-4 text-amber-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col text-left min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[9px] bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                              ANIMADO
                            </span>
                            {item.rarity === 'mythic' && (
                              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                MÍTICO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-tight">
                            {item.description}
                          </p>
                          {item.effectDescription && (
                            <span className="text-[10px] text-amber-300 font-extrabold mt-1 flex items-center gap-1">
                              ✨ {item.effectDescription}
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-[9px] text-cyan-400 font-bold mt-1 flex items-center gap-1">
                              <Compass className="w-3 h-3 animate-spin" />
                              <span>Toca para ver en 3D 360°</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpen3DPreview(item)}
                          className="p-2 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 rounded-xl border border-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                          title="Vista Previa 3D"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {equipped ? (
                          <div className="px-3 py-2 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>ACTIVO</span>
                          </div>
                        ) : unlocked ? (
                          <button
                            onClick={() => handleAction(item)}
                            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
                          >
                            EQUIPAR
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpen3DPreview(item)}
                            className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              playerState.coins >= item.price
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md border border-yellow-200'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60'
                            }`}
                          >
                            <span>🪙 {item.price.toLocaleString()}</span>
                            <span>VER 3D</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event Exclusive Showcase section */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3 text-amber-400">
                  <Trophy className="w-4 h-4" />
                  <h5 className="text-xs font-black uppercase tracking-wider">Avatares Exclusivos de Eventos</h5>
                </div>

                <div className="space-y-2.5">
                  {eventAvatars.map((eventAvatar) => {
                    const isUnlockedEvent = (playerState.unlockedAvatars || []).includes(eventAvatar.id) ||
                      (eventAvatar.id === 'avatar_cosmic_deity' && (playerState.dailyStreak || 0) >= 7) ||
                      (eventAvatar.id === 'avatar_arena_gladiator' && (playerState.stats?.multiplayerWins || 0) >= 15);
                    const isEquippedEvent = playerState.avatar === eventAvatar.id;

                    const eventShopItem: ShopItem = {
                      id: eventAvatar.id,
                      name: eventAvatar.name.es,
                      description: eventAvatar.description?.es || '',
                      type: 'avatar',
                      price: 0,
                      icon: eventAvatar.emoji,
                      unlocked: isUnlockedEvent,
                      color: eventAvatar.auraParticlesColor || '#fbbf24',
                      rarity: eventAvatar.rarity,
                      effectDescription: eventAvatar.perkDescription?.es,
                    };

                    return (
                      <div
                        key={eventAvatar.id}
                        onClick={() => handleOpen3DPreview(eventShopItem)}
                        className="bg-slate-950/60 border border-amber-500/20 hover:border-amber-500/50 p-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <AnimatedAvatar avatarItem={eventAvatar} size="sm" showBadge={false} />
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-amber-300 group-hover:text-amber-200 transition-colors">
                              {eventAvatar.name.es}
                            </span>
                            <span className="text-[10px] text-slate-300 mt-0.5">
                              {eventAvatar.eventRequirement?.es}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpen3DPreview(eventShopItem)}
                            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-500/30"
                            title="Vista 3D"
                          >
                            <Eye className="w-3 h-3" />
                          </button>

                          {isEquippedEvent ? (
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-1 rounded-lg">
                              EQUIPADO
                            </span>
                          ) : isUnlockedEvent ? (
                            <button
                              onClick={() => {
                                soundManager.playButtonClick();
                                onBuyOrEquipItem(eventShopItem);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-black text-[10px] rounded-lg cursor-pointer hover:bg-emerald-500"
                            >
                              EQUIPAR
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpen3DPreview(eventShopItem)}
                              className="text-[10px] bg-slate-900 border border-amber-500/30 text-amber-400 font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-slate-800"
                            >
                              <Lock className="w-3 h-3" />
                              <span>VER 3D</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 2. MYSTERY BOX TAB SHOWCASE */}
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
                  ¡Abre la caja misteriosa para conseguir recompensas aleatorias con probabilidad transparente (incluyendo Avatares Animados Míticos)!
                </p>
              </div>

              {/* Reward categories badges */}
              <div className="grid grid-cols-3 gap-2 w-full text-[11px] font-bold">
                <div className="bg-slate-950/80 border border-amber-500/30 p-2 rounded-xl text-amber-300 flex flex-col items-center gap-0.5">
                  <span>🪙 Monedas</span>
                  <span className="text-[10px] text-slate-400 font-normal">Hasta 2,000</span>
                </div>
                <div className="bg-slate-950/80 border border-purple-500/30 p-2 rounded-xl text-purple-300 flex flex-col items-center gap-0.5">
                  <span>✨ Avatar Mítico</span>
                  <span className="text-[10px] text-slate-400 font-normal">Animado</span>
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
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 border border-yellow-200 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <Gift className="w-5 h-5 animate-bounce" />
                <span>COMPRAR CAJA SORPRESA</span>
                <span className="bg-slate-950/30 px-2.5 py-0.5 rounded-xl border border-slate-900/40 text-xs font-black">
                  🪙 {MYSTERY_BOX_PRICE}
                </span>
              </button>
            </div>
          )}

          {/* 3. OTHER STANDARD TABS (SKIN, THEME, CHARACTER, UPGRADE) */}
          {activeTab !== 'box' && activeTab !== 'avatar' && filteredItems.map((item) => {
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
                    className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
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
                onClick={() => handleItemCardClick(item)}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                  equipped
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : unlocked
                    ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-850 hover:border-amber-500/50 opacity-90'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner relative group-hover:scale-105 transition-transform"
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
                      <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </span>
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
                    {!unlocked && (
                      <span className="text-[9px] text-cyan-400 font-bold mt-0.5 flex items-center gap-1">
                        <Compass className="w-3 h-3 animate-spin" />
                        <span>Toca para previsualizar en 3D</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleOpen3DPreview(item)}
                    className="p-2 bg-slate-800/80 hover:bg-slate-700 text-cyan-300 rounded-xl border border-cyan-500/30 transition-all hover:scale-105 active:scale-95"
                    title="Vista Previa 3D"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {equipped ? (
                    <div className="p-2 bg-amber-500 text-slate-950 rounded-xl font-bold">
                      <Check className="w-4 h-4" />
                    </div>
                  ) : unlocked ? (
                    <button
                      onClick={() => handleAction(item)}
                      className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-white font-bold text-xs rounded-xl border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
                    >
                      EQUIPAR
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpen3DPreview(item)}
                      className={`px-3 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                        playerState.coins >= item.price
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md'
                          : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 opacity-60'
                      }`}
                    >
                      <span>🪙 {item.price}</span>
                      <span>VER 3D</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3D Rotating Character Skin Preview Inspector Modal */}
      {selectedPreviewItem && (
        <Skin3DPreviewModal
          item={selectedPreviewItem}
          playerState={playerState}
          onClose={() => setSelectedPreviewItem(null)}
          onBuyOrEquip={(item) => {
            handleAction(item);
            // Re-evaluate unlock status or close if purchased
            setTimeout(() => {
              setSelectedPreviewItem((prev) => prev ? { ...prev, unlocked: true } : null);
            }, 50);
          }}
        />
      )}

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
