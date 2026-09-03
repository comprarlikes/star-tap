import React, { useState, useEffect, useRef } from 'react';
import { ShopItem, PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { getAvatarById } from '../data/avatars';
import { 
  X, 
  Sparkles, 
  RotateCw, 
  Volume2, 
  Shield, 
  Zap, 
  Crown, 
  Check, 
  Lock, 
  Eye, 
  Layers, 
  Flame, 
  Maximize2,
  Compass
} from 'lucide-react';

interface Skin3DPreviewModalProps {
  item: ShopItem;
  playerState: PlayerState;
  onClose: () => void;
  onBuyOrEquip: (item: ShopItem) => void;
}

export const Skin3DPreviewModal: React.FC<Skin3DPreviewModalProps> = ({
  item,
  playerState,
  onClose,
  onBuyOrEquip,
}) => {
  const isEn = playerState.language === 'en';
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotY, setRotY] = useState<number>(15);
  const [rotX, setRotX] = useState<number>(8);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [testBurst, setTestBurst] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);

  const isUnlocked = () => {
    if (item.type === 'avatar') return (playerState.unlockedAvatars || []).includes(item.id);
    if (item.type === 'skin') return playerState.unlockedSkins.includes(item.id);
    if (item.type === 'theme') return playerState.unlockedThemes.includes(item.id);
    if (item.type === 'character') return playerState.unlockedCharacters.includes(item.id);
    return true;
  };

  const isEquipped = () => {
    if (item.type === 'avatar') return playerState.avatar === item.id;
    if (item.type === 'skin') return playerState.equippedSkin === item.id;
    if (item.type === 'theme') return playerState.equippedTheme === item.id;
    if (item.type === 'character') return playerState.equippedCharacter === item.id;
    return false;
  };

  const unlocked = isUnlocked();
  const equipped = isEquipped();
  const canAfford = playerState.coins >= item.price;
  const missingCoins = Math.max(0, item.price - playerState.coins);

  // Auto rotation loop when not dragging
  useEffect(() => {
    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      if (autoRotate && !isDragging) {
        setRotY((prev) => (prev + dt * 42) % 360);
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [autoRotate, isDragging]);

  // Touch and Mouse drag handlers for 360° manual 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotY((prev) => prev + deltaX * 0.9);
    setRotX((prev) => Math.max(-30, Math.min(35, prev - deltaY * 0.6)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleTestEffect = () => {
    soundManager.playLevelUp();
    hapticManager.success();
    setTestBurst(true);
    setTimeout(() => setTestBurst(false), 1200);
  };

  const handleAction = () => {
    soundManager.playButtonClick();
    hapticManager.mediumTap();
    onBuyOrEquip(item);
  };

  // Color & Theme extraction
  const themeColor = item.color || '#06b6d4';
  const avatarData = item.type === 'avatar' ? getAvatarById(item.id) : null;
  const isMythic = item.rarity === 'mythic' || item.id === 'avatar_golden_emperor';
  const isLegendary = item.rarity === 'legendary' || item.price >= 3000;
  const isEpic = item.rarity === 'epic' || item.price >= 1400;

  const rarityLabel = isMythic 
    ? (isEn ? 'Mythic Tier' : 'Nivel Mítico')
    : isLegendary
    ? (isEn ? 'Legendary' : 'Legendario')
    : isEpic
    ? (isEn ? 'Epic Tier' : 'Nivel Épico')
    : (isEn ? 'Rare Tier' : 'Raro');

  const typeLabel = item.type === 'character'
    ? (isEn ? 'Character Pet / Companion' : 'Compañero / Mascota')
    : item.type === 'skin'
    ? (isEn ? 'Star Blade Skin' : 'Skin de Estrella')
    : item.type === 'avatar'
    ? (isEn ? 'Animated Live Avatar' : 'Avatar Animado en Vivo')
    : (isEn ? 'Cosmic Theme' : 'Fondo Cósmico');

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900/95 border border-slate-700/80 rounded-[2.5rem] text-white shadow-2xl flex flex-col overflow-hidden relative max-h-[92vh]">
        {/* Top Floating Glow Ambient Light */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-700"
          style={{ background: themeColor }}
        />

        {/* Header HUD */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2.5 rounded-2xl border flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${themeColor}20`, borderColor: `${themeColor}60`, color: themeColor }}
            >
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {isEn ? '3D HOLOGRAPHIC INSPECTOR' : 'INSPECTOR HOLOGRÁFICO 3D'}
                </span>
                <span 
                  className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border shadow"
                  style={{ backgroundColor: `${themeColor}30`, borderColor: themeColor, color: themeColor }}
                >
                  {rarityLabel}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight truncate max-w-[200px] sm:max-w-xs">
                {item.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Interactive Stage Container */}
        <div className="relative w-full h-64 sm:h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing perspective-1000">
          {/* Background Space Grid & Radial Beam */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div 
            className="absolute bottom-6 inset-x-0 h-40 opacity-40 pointer-events-none animate-holo-beam"
            style={{ 
              background: `radial-gradient(ellipse at bottom, ${themeColor} 0%, transparent 70%)` 
            }}
          />

          {/* Test Burst Particle Explosion */}
          {testBurst && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="w-48 h-48 rounded-full border-4 border-amber-300 animate-ping opacity-75" />
              <div 
                className="w-64 h-64 rounded-full border-2 border-cyan-400 animate-ping opacity-50" 
                style={{ animationDuration: '0.8s' }} 
              />
              <div className="absolute text-2xl font-black text-amber-300 animate-bounce">
                ✨ WOW! ✨
              </div>
            </div>
          )}

          {/* 3D Holographic Pedestal & Orbit Rings at Base */}
          <div 
            className="absolute bottom-8 w-56 h-56 rounded-full border-2 border-dashed pointer-events-none transform-style-3d opacity-60 animate-orbit-3d-a"
            style={{ borderColor: `${themeColor}80` }}
          />
          <div 
            className="absolute bottom-8 w-44 h-44 rounded-full border border-dotted pointer-events-none transform-style-3d opacity-50 animate-orbit-3d-b"
            style={{ borderColor: `${themeColor}` }}
          />
          <div 
            className="absolute bottom-9 w-36 h-36 rounded-full bg-slate-950/90 border-2 shadow-2xl pointer-events-none animate-pedestal-pulse"
            style={{ 
              borderColor: themeColor,
              boxShadow: `0 0 35px ${themeColor}80, inset 0 0 20px ${themeColor}50` 
            }}
          />

          {/* The 3D Rotating Character / Skin Model Entity */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative z-20 w-44 h-44 flex items-center justify-center transform-style-3d transition-transform duration-75 select-none"
            style={{
              transform: `scale(${zoomLevel}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
            }}
          >
            {/* 3D Back Glow Shadow Layer */}
            <div 
              className="absolute w-36 h-36 rounded-3xl blur-xl opacity-75 pointer-events-none -translate-z-10"
              style={{ background: themeColor }}
            />

            {/* Floating 3D Back Halo Shield */}
            <div 
              className="absolute w-40 h-40 rounded-full border-2 border-white/40 pointer-events-none -translate-z-8 animate-spin"
              style={{ animationDuration: '14s' }}
            />

            {/* Center 3D Model Body Container */}
            <div 
              className="relative w-32 h-32 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-850 to-slate-800 border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center p-3 transform-style-3d"
              style={{ 
                borderColor: themeColor,
                boxShadow: `0 0 30px ${themeColor}60, inset 0 0 15px rgba(255,255,255,0.2)` 
              }}
            >
              {/* Dynamic Specular Sheen Lighting according to rotY */}
              <div 
                className="absolute inset-0 rounded-3xl pointer-events-none opacity-40 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                style={{
                  transform: `translateX(${Math.sin((rotY * Math.PI) / 180) * 40}px)`,
                }}
              />

              {/* Character Icon / Emoji with 3D Depth */}
              <div 
                className="text-6xl sm:text-7xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] translate-z-12 select-none animate-pulse"
                style={{ filter: `drop-shadow(0 0 16px ${themeColor})` }}
              >
                {item.icon}
              </div>

              {/* Floating Status Ring */}
              <div 
                className="absolute -bottom-3 px-3 py-1 rounded-full bg-slate-950/90 border text-[10px] font-black uppercase tracking-wider text-white shadow-xl translate-z-16 flex items-center gap-1"
                style={{ borderColor: themeColor }}
              >
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                <span>3D LIVE</span>
              </div>
            </div>

            {/* Front Floating Aura Particles Layer */}
            <div className="absolute top-0 right-0 w-8 h-8 translate-z-20 pointer-events-none">
              <Crown className="w-6 h-6 text-amber-300 animate-bounce drop-shadow" />
            </div>
          </div>

          {/* Drag & Rotation Controls Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-30">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setAutoRotate((prev) => !prev);
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 shadow-md cursor-pointer ${
                autoRotate
                  ? 'bg-amber-500 text-slate-950 border-amber-300'
                  : 'bg-slate-800/90 text-slate-300 border-slate-700'
              }`}
              title={isEn ? 'Toggle Auto-Rotation' : 'Alternar Giro Automático'}
            >
              <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
              <span className="text-[10px]">{autoRotate ? 'AUTO' : 'PAUSA'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setRotY(15);
                setRotX(8);
                setZoomLevel(1);
              }}
              className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center justify-center shadow-md cursor-pointer"
              title={isEn ? 'Reset 3D Angle' : 'Reiniciar Ángulo 3D'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Hint Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5 shadow-md pointer-events-none">
            <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>{isEn ? 'Drag to rotate 360°' : 'Arrastra con el dedo o ratón para rotar 360°'}</span>
          </div>
        </div>

        {/* Item Information & Stats Card */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-left">
          {/* Main Info Row */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-3xl shadow-inner space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                {typeLabel}
              </span>
              <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                <span>{rarityLabel}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {item.description}
            </p>

            {/* Special Effect / Stat Perk Badge */}
            {item.effectDescription && (
              <div className="mt-2 p-2.5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                <span className="text-xs font-black text-amber-200">
                  {item.effectDescription}
                </span>
              </div>
            )}
          </div>

          {/* FX Test Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestEffect}
              className="flex-1 py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>{isEn ? 'Test Sound & FX' : 'Probar Efecto Visual y Sonoro'}</span>
            </button>
          </div>

          {/* User Coin Balance Status Bar */}
          <div className="bg-slate-950/90 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400 font-bold">
              <span>{isEn ? 'Your Coin Balance:' : 'Tu Saldo Actual:'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-black text-amber-400 text-sm font-mono">
              <span>🪙</span>
              <span>{playerState.coins.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer Action Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          {equipped ? (
            <div className="flex-1 py-3.5 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg">
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isEn ? 'CURRENTLY EQUIPPED' : 'ACTUALMENTE EQUIPADO'}</span>
            </div>
          ) : unlocked ? (
            <button
              onClick={handleAction}
              className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 border border-cyan-300/40 tracking-wider uppercase transition-all active:scale-98 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isEn ? 'EQUIP NOW' : 'EQUIPAR AHORA'}</span>
            </button>
          ) : (
            <button
              disabled={!canAfford}
              onClick={handleAction}
              className={`flex-1 py-3.5 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 border tracking-wider uppercase transition-all active:scale-98 cursor-pointer ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 border-yellow-200 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 border-slate-700 opacity-60 cursor-not-allowed'
              }`}
            >
              {canAfford ? (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>{isEn ? `UNLOCK FOR 🪙 ${item.price.toLocaleString()}` : `DESBLOQUEAR POR 🪙 ${item.price.toLocaleString()}`}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{isEn ? `NEED 🪙 ${missingCoins.toLocaleString()} MORE` : `FALTAN 🪙 ${missingCoins.toLocaleString()}`}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
