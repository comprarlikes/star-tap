import React from 'react';
import { AvatarItem, getAvatarById } from '../data/avatars';
import { Sparkles, Zap, Flame, Shield, Crown, Trophy, Orbit, Radio, Disc } from 'lucide-react';

export interface AnimatedAvatarProps {
  avatarId?: string;
  avatarItem?: AvatarItem;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showGlow?: boolean;
  showBadge?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  avatarId,
  avatarItem,
  size = 'md',
  showGlow = true,
  showBadge = false,
  interactive = false,
  className = '',
  onClick,
}) => {
  const avatar = avatarItem || getAvatarById(avatarId);

  // Size dimensions and emoji text scaling
  const sizeStyles = {
    xs: {
      container: 'w-7 h-7 rounded-lg',
      emoji: 'text-sm',
      aura: 'w-10 h-10',
      badge: 'text-[7px] px-1 py-0',
      ringSize: 'inset-[-3px]',
    },
    sm: {
      container: 'w-9 h-9 rounded-xl',
      emoji: 'text-lg',
      aura: 'w-14 h-14',
      badge: 'text-[8px] px-1 py-0.5',
      ringSize: 'inset-[-4px]',
    },
    md: {
      container: 'w-12 h-12 rounded-2xl',
      emoji: 'text-2xl',
      aura: 'w-20 h-20',
      badge: 'text-[9px] px-1.5 py-0.5',
      ringSize: 'inset-[-5px]',
    },
    lg: {
      container: 'w-16 h-16 rounded-2xl',
      emoji: 'text-3xl',
      aura: 'w-24 h-24',
      badge: 'text-[10px] px-2 py-0.5',
      ringSize: 'inset-[-6px]',
    },
    xl: {
      container: 'w-20 h-20 rounded-[1.25rem]',
      emoji: 'text-4xl',
      aura: 'w-32 h-32',
      badge: 'text-[10px] px-2.5 py-0.5',
      ringSize: 'inset-[-8px]',
    },
    '2xl': {
      container: 'w-24 h-24 rounded-[1.5rem]',
      emoji: 'text-5xl',
      aura: 'w-40 h-40',
      badge: 'text-[11px] px-3 py-1',
      ringSize: 'inset-[-10px]',
    },
  }[size];

  const isAnimated = avatar.isAnimated;
  const animationType = avatar.animationType;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${
        interactive ? 'cursor-pointer group active:scale-95 transition-transform' : ''
      } ${className}`}
    >
      {/* 1. Ambient Background Glow Aura with Smooth Harmonic Breathing */}
      {showGlow && (
        <div
          className={`absolute rounded-full pointer-events-none blur-xl transition-all duration-700 ${
            isAnimated ? 'opacity-85 scale-110 animate-avatar-pulse' : 'opacity-40'
          } ${sizeStyles.aura}`}
          style={{ background: avatar.glowColor, color: avatar.glowColor }}
        />
      )}

      {/* 2. Dynamic Animated Outer Rings with Specialized Rotate & Pulse Keyframes */}
      {isAnimated && (
        <>
          {/* Cyber Pulse Outer Scanner Ring */}
          {animationType === 'cyber_pulse' && (
            <>
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-[inherit] border border-cyan-400/80 pointer-events-none animate-avatar-cyber-pulse`}
              />
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-[inherit] border border-cyan-300/40 pointer-events-none animate-avatar-ring-pulse`}
              />
            </>
          )}

          {/* Hologram Dual Rotating Ring */}
          {animationType === 'hologram' && (
            <>
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border-2 border-dashed border-fuchsia-400/80 pointer-events-none animate-avatar-rotate`}
              />
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border border-dotted border-cyan-400/60 pointer-events-none animate-avatar-rotate-reverse`}
              />
            </>
          )}

          {/* Solar Flare Corona Rays */}
          {animationType === 'solar_flare' && (
            <>
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border-2 border-amber-300/90 pointer-events-none animate-avatar-solar-corona shadow-[0_0_20px_rgba(250,204,21,0.7)]`}
              />
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border border-yellow-100/50 pointer-events-none animate-avatar-rotate-slow`}
              />
            </>
          )}

          {/* Void Portal Swirling Vortex Layer */}
          {animationType === 'void_portal' && (
            <>
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border-2 border-purple-500/80 pointer-events-none animate-avatar-rotate-reverse shadow-[0_0_22px_rgba(192,38,211,0.6)]`}
              />
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border border-fuchsia-400/40 pointer-events-none animate-avatar-rotate-fast`}
              />
            </>
          )}

          {/* Hyper Lightning Arc Discharge */}
          {animationType === 'hyper_lightning' && (
            <div
              className={`absolute ${sizeStyles.ringSize} rounded-[inherit] border border-blue-400/90 pointer-events-none animate-avatar-lightning shadow-[0_0_18px_rgba(96,165,250,0.9)]`}
            />
          )}

          {/* Celestial Shimmer Diamond Halo */}
          {animationType === 'celestial_shimmer' && (
            <>
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-full border-2 border-yellow-200/90 pointer-events-none animate-avatar-rotate-slow shadow-[0_0_20px_rgba(251,191,36,0.7)]`}
              />
              <div
                className={`absolute ${sizeStyles.ringSize} rounded-[inherit] border border-amber-400/40 pointer-events-none animate-avatar-pulse`}
              />
            </>
          )}

          {/* Cosmic Flame Blaze Aura */}
          {animationType === 'cosmic_flame' && (
            <div
              className={`absolute ${sizeStyles.ringSize} rounded-[inherit] border-2 border-orange-500/90 pointer-events-none animate-avatar-flame shadow-[0_0_20px_rgba(249,115,22,0.8)]`}
            />
          )}

          {/* Spectral Glitch Halo */}
          {animationType === 'spectral_glitch' && (
            <div
              className={`absolute ${sizeStyles.ringSize} rounded-[inherit] border border-purple-400/80 pointer-events-none animate-avatar-glitch`}
            />
          )}
        </>
      )}

      {/* 3. Main Avatar Card Container */}
      <div
        className={`relative ${sizeStyles.container} bg-gradient-to-tr ${avatar.gradient} flex items-center justify-center shadow-lg border-2 ${
          avatar.borderColor
        } overflow-hidden ${
          isAnimated ? 'shadow-[0_0_18px_rgba(255,255,255,0.25)]' : ''
        } ${interactive ? 'group-hover:scale-105 transition-transform duration-300' : ''}`}
      >
        {/* Animated Inner Shimmer / Scanline Overlays */}
        {isAnimated && (
          <>
            {/* Holographic sweep sheen */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-avatar-leaderboard-shine pointer-events-none" />

            {/* Scanline pattern for cyber / mecha */}
            {(animationType === 'cyber_pulse' || animationType === 'hyper_lightning') && (
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.2)_3px)] pointer-events-none opacity-50 animate-avatar-cyber-pulse" />
            )}

            {/* Radiant core light pulse for mythic avatars */}
            {(animationType === 'solar_flare' || animationType === 'void_portal') && (
              <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-transparent pointer-events-none animate-avatar-ring-pulse opacity-35" />
            )}
          </>
        )}

        {/* 4. Avatar Center Character / Emoji with Fluid Motion */}
        <span
          className={`relative z-10 ${sizeStyles.emoji} drop-shadow-md select-none ${
            isAnimated
              ? animationType === 'void_portal'
                ? 'animate-avatar-rotate-reverse'
                : animationType === 'cosmic_flame'
                ? 'animate-avatar-flame'
                : animationType === 'hyper_lightning'
                ? 'animate-avatar-lightning'
                : animationType === 'spectral_glitch'
                ? 'animate-avatar-glitch'
                : 'animate-avatar-pulse'
              : ''
          }`}
        >
          {avatar.emoji}
        </span>

        {/* Exclusive moving particle sparkles */}
        {isAnimated && (
          <div className="absolute top-1 right-1 pointer-events-none z-10">
            {avatar.rarity === 'mythic' ? (
              <Crown className="w-3 h-3 text-amber-300 animate-avatar-pulse drop-shadow" />
            ) : animationType === 'cyber_pulse' || animationType === 'hyper_lightning' ? (
              <Zap className="w-2.5 h-2.5 text-cyan-300 animate-avatar-lightning" />
            ) : animationType === 'cosmic_flame' ? (
              <Flame className="w-2.5 h-2.5 text-orange-300 animate-avatar-flame" />
            ) : (
              <Sparkles className="w-2.5 h-2.5 text-yellow-200 animate-avatar-pulse" />
            )}
          </div>
        )}
      </div>

      {/* 5. Optional Floating Rarity Badge */}
      {showBadge && (
        <span
          className={`absolute -bottom-1.5 font-black uppercase tracking-wider rounded-full shadow border flex items-center gap-0.5 z-20 ${
            sizeStyles.badge
          } ${
            avatar.rarity === 'mythic'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-300 text-slate-950 border-yellow-200 animate-avatar-pulse'
              : avatar.rarity === 'legendary'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-pink-300'
              : avatar.rarity === 'epic'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-300'
              : 'bg-slate-900 text-slate-300 border-slate-700'
          }`}
        >
          {avatar.rarity === 'mythic' && <Crown className="w-2.5 h-2.5 fill-slate-950" />}
          <span>{avatar.rarity}</span>
        </span>
      )}
    </div>
  );
};
