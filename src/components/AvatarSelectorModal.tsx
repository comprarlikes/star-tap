import React, { useState } from 'react';
import { PlayerState } from '../types';
import { AVATARS, AvatarItem, getAvatarById, isAvatarUnlocked, AvatarCategory } from '../data/avatars';
import { AnimatedAvatar } from './AnimatedAvatar';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { UserCheck, X, Lock, Check, Sparkles, Shield, Trophy, ShoppingBag, Crown, Zap, Flame } from 'lucide-react';
import { t, Language } from '../i18n';

interface AvatarSelectorModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
  onBuyAvatar?: (avatar: AvatarItem) => void;
  onOpenShop?: () => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  playerState,
  onClose,
  onSelectAvatar,
  onBuyAvatar,
  onOpenShop,
}) => {
  const lang: Language = playerState.language || 'es';
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'animated' | 'shop' | 'events' | 'pilots' | 'beasts' | 'legends'
  >('all');

  const currentAvatar = getAvatarById(playerState.avatar);

  const filteredAvatars = AVATARS.filter((avatar) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'animated') return avatar.isAnimated;
    return avatar.category === activeCategory;
  });

  const handleEquip = (avatar: AvatarItem) => {
    const unlocked = isAvatarUnlocked(avatar.id, playerState);
    if (!unlocked) {
      soundManager.playGameOver();
      hapticManager.mediumTap();
      return;
    }
    soundManager.playButtonClick();
    hapticManager.lightTap();
    onSelectAvatar(avatar.id);
  };

  const handleQuickBuy = (e: React.MouseEvent, avatar: AvatarItem) => {
    e.stopPropagation();
    if (onBuyAvatar) {
      onBuyAvatar(avatar);
    } else if (onOpenShop) {
      onClose();
      onOpenShop();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900/95 border border-amber-500/30 rounded-[2rem] text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950 rounded-2xl shadow-md border border-yellow-200/50">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                {t('avatarModalTitle', lang)}
              </h3>
              <span className="text-xs text-amber-300 font-medium">
                Colecciona y equipa avatares animados y exclusivos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-2xl border border-amber-500/30 text-amber-400 font-extrabold text-xs shadow-inner">
              <span className="text-sm">🪙</span>
              <span>{playerState.coins.toLocaleString()}</span>
            </div>

            <button
              type="button"
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

        {/* Modal Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-left">
          {/* Hero Currently Equipped Avatar Showcase */}
          <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 p-4 rounded-3xl flex items-center gap-4 shadow-xl overflow-hidden">
            {/* Live Animated Avatar in Hero */}
            <div className="flex-shrink-0 animate-float-avatar">
              <AnimatedAvatar avatarItem={currentAvatar} size="xl" showBadge={true} />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-300" />
                  {t('equippedBadge', lang)}
                </span>
                {currentAvatar.isAnimated && (
                  <span className="text-[9px] font-black bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ✨ ANIMADO
                  </span>
                )}
                {currentAvatar.rarity === 'mythic' && (
                  <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    MÍTICO
                  </span>
                )}
              </div>

              <h4 className="text-lg font-black text-white tracking-wide truncate mt-0.5">
                {currentAvatar.name[lang]}
              </h4>

              {currentAvatar.description && (
                <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                  {currentAvatar.description[lang]}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {currentAvatar.categoryLabel[lang]}
                </span>
                {currentAvatar.perkDescription && (
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30 truncate">
                    ⚡ {currentAvatar.perkDescription[lang]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('animated')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'animated'
                  ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-md'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              ✨ Animados
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('shop')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'shop'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-amber-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🛒 Tienda
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('events')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'events'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-yellow-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              🏆 Eventos
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('pilots')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'pilots'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🧑‍🚀 Pilotos
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('beasts')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'beasts'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🐉 Criaturas
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('legends')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'legends'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              👑 Leyendas
            </button>
          </div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {filteredAvatars.map((avatar) => {
              const isEquipped = playerState.avatar === avatar.id;
              const isUnlocked = isAvatarUnlocked(avatar.id, playerState);
              const canAfford = avatar.price ? playerState.coins >= avatar.price : false;

              return (
                <div
                  key={avatar.id}
                  onClick={() => isUnlocked && handleEquip(avatar)}
                  className={`relative p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 group ${
                    isUnlocked ? 'cursor-pointer' : ''
                  } ${
                    isEquipped
                      ? 'bg-gradient-to-b from-amber-500/20 via-slate-950 to-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50 scale-[1.02]'
                      : isUnlocked
                      ? 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 hover:scale-[1.02]'
                      : 'bg-slate-950/50 border-slate-900 opacity-80'
                  }`}
                >
                  {/* Live Animated Avatar Node */}
                  <div className="relative my-1">
                    <AnimatedAvatar avatarItem={avatar} size="lg" showBadge={false} />

                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-slate-950/70 rounded-2xl backdrop-blur-xs flex items-center justify-center text-amber-400 pointer-events-none">
                        <Lock className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Name & Special Tag */}
                  <div className="flex flex-col items-center w-full min-w-0">
                    <div className="flex items-center gap-1 max-w-full">
                      <span className="text-xs font-black text-white truncate">
                        {avatar.name[lang]}
                      </span>
                    </div>

                    {/* Exclusivity / Movement Badges */}
                    {avatar.isAnimated && (
                      <span className="text-[8px] font-black uppercase text-cyan-300 bg-cyan-950/80 px-1.5 py-0.2 rounded-md mt-0.5 border border-cyan-500/30">
                        🌀 ANIMADO
                      </span>
                    )}

                    {isEquipped ? (
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 mt-1.5 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {t('equippedBadge', lang)}
                      </span>
                    ) : isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(avatar)}
                        className="w-full text-[10px] font-black text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900/90 px-2 py-1 rounded-xl border border-emerald-500/40 mt-1.5 transition-all cursor-pointer"
                      >
                        {t('equipBtn', lang)}
                      </button>
                    ) : avatar.unlockType === 'shop' ? (
                      <button
                        type="button"
                        onClick={(e) => handleQuickBuy(e, avatar)}
                        className={`w-full text-[10px] font-black px-2 py-1 rounded-xl transition-all mt-1.5 flex items-center justify-center gap-1 cursor-pointer ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow hover:scale-105 active:scale-95'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>🪙 {avatar.price?.toLocaleString()}</span>
                      </button>
                    ) : avatar.unlockType === 'event' ? (
                      <div className="w-full text-[9px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-1 rounded-xl border border-amber-500/30 mt-1.5 leading-tight">
                        <span>🏆 {avatar.eventRequirement?.[lang]}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 mt-1.5">
                        🔒 Nivel {avatar.unlockLevel}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
