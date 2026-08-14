import React, { useState } from 'react';
import { PlayerState } from '../types';
import { AVATARS, AvatarItem, getAvatarById } from '../data/avatars';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { UserCheck, X, Lock, Check, Sparkles, Shield, Trophy } from 'lucide-react';
import { t, Language } from '../i18n';

interface AvatarSelectorModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onSelectAvatar: (avatarId: string) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  playerState,
  onClose,
  onSelectAvatar,
}) => {
  const lang: Language = playerState.language || 'es';
  const [activeCategory, setActiveCategory] = useState<'all' | 'pilots' | 'beasts' | 'legends'>('all');

  const currentAvatar = getAvatarById(playerState.avatar);

  const filteredAvatars = AVATARS.filter((avatar) => {
    if (activeCategory === 'all') return true;
    return avatar.category === activeCategory;
  });

  const handleEquip = (avatar: AvatarItem) => {
    if (playerState.level < avatar.unlockLevel) {
      soundManager.playGameOver();
      return;
    }
    soundManager.playButtonClick();
    hapticManager.lightTap();
    onSelectAvatar(avatar.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900/95 border border-amber-500/30 rounded-[2rem] text-white shadow-2xl flex flex-col max-h-[88vh] overflow-hidden relative">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 text-slate-950 rounded-2xl shadow-md border border-yellow-200/50">
              <UserCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                {t('avatarModalTitle', lang)}
              </h3>
              <span className="text-xs text-amber-300/90 font-medium">
                {t('avatarModalSubtitle', lang)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-left">
          {/* Hero Currently Equipped Avatar Showcase */}
          <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 p-4 rounded-2xl flex items-center gap-4 shadow-lg overflow-hidden">
            {/* Ambient Background Glow */}
            <div
              className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40"
              style={{ background: currentAvatar.glowColor }}
            />

            <div
              className={`relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr ${currentAvatar.gradient} text-4xl shadow-2xl border-2 ${currentAvatar.borderColor} flex-shrink-0 animate-pulse`}
            >
              <span>{currentAvatar.emoji}</span>
              <Sparkles className="absolute -top-1.5 -right-1.5 w-6 h-6 text-amber-200 animate-spin" />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-300" />
                {t('equippedBadge', lang)}
              </span>
              <h4 className="text-lg font-black text-white tracking-wide truncate">
                {currentAvatar.name[lang]}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {currentAvatar.categoryLabel[lang]}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  L{playerState.level} Piloto
                </span>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {t('avatarCategoryAll', lang)}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('pilots')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'pilots'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🧑‍🚀 {t('avatarCategoryPilots', lang)}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('beasts')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'beasts'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              🐉 {t('avatarCategoryBeasts', lang)}
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('legends')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === 'legends'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              👑 {t('avatarCategoryLegends', lang)}
            </button>
          </div>

          {/* Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            {filteredAvatars.map((avatar) => {
              const isEquipped = playerState.avatar === avatar.id;
              const isUnlocked = playerState.level >= avatar.unlockLevel;

              return (
                <div
                  key={avatar.id}
                  onClick={() => handleEquip(avatar)}
                  className={`relative p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 group cursor-pointer ${
                    isEquipped
                      ? 'bg-gradient-to-b from-amber-500/20 via-slate-950 to-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/50 scale-[1.02]'
                      : isUnlocked
                      ? 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 hover:scale-[1.02]'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  {/* Avatar Icon Badge */}
                  <div
                    className={`relative w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatar.gradient} flex items-center justify-center text-3xl shadow-md border ${
                      isEquipped ? avatar.borderColor : 'border-white/20'
                    } group-hover:scale-105 transition-transform`}
                  >
                    <span>{avatar.emoji}</span>

                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-2xl backdrop-blur-xs flex items-center justify-center text-amber-400">
                        <Lock className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Name & Unlock Info */}
                  <div className="flex flex-col items-center w-full min-w-0">
                    <span className="text-xs font-black text-white truncate w-full">
                      {avatar.name[lang]}
                    </span>

                    {isEquipped ? (
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {t('equippedBadge', lang)}
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 mt-1">
                        {t('equipBtn', lang)}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800 mt-1">
                        🔒 {t('lockedAvatarLevel', lang)} {avatar.unlockLevel}
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
