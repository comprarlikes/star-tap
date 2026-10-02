import React, { useState } from 'react';
import { ShopItem, PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { getAvatarById } from '../data/avatars';
import { ThreeSkinViewer } from './ThreeSkinViewer';
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
  Compass,
  ZoomIn,
  ZoomOut
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
  const [testBurst, setTestBurst] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

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
      <div className="w-full max-w-lg bg-slate-900/98 border border-cyan-500/40 ring-1 ring-cyan-400/20 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden relative max-h-[92vh]">
        {/* Holographic Top Laser Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 animate-shimmer z-30" />

        {/* AAA Corner Telemetry Brackets */}
        <div className="aaa-hud-corner-tl text-cyan-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-tr text-cyan-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-bl text-amber-400/80 pointer-events-none" />
        <div className="aaa-hud-corner-br text-amber-400/80 pointer-events-none" />

        {/* Top Floating Glow Ambient Light */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-700"
          style={{ background: themeColor }}
        />

        {/* Header HUD Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between z-10 relative">
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
              className="p-2 bg-slate-800/90 hover:bg-slate-700/90 rounded-2xl text-slate-400 hover:text-white border border-slate-700/80 transition-all active:scale-95 cursor-pointer shadow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Interactive Stage Container */}
        <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
          {/* Background Space Grid & Radial Beam */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div 
            className="absolute bottom-6 inset-x-0 h-40 opacity-40 pointer-events-none animate-holo-beam"
            style={{ 
              background: `radial-gradient(ellipse at bottom, ${themeColor} 0%, transparent 70%)` 
            }}
          />

          {/* Real-time WebGL Three.js 3D Viewer */}
          <ThreeSkinViewer
            item={item}
            autoRotate={autoRotate}
            zoomLevel={zoomLevel}
            testBurst={testBurst}
          />

          {/* Top-Right Stage Controls (Auto-Rotate, Zoom In, Zoom Out, Reset) */}
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
                setZoomLevel((prev) => Math.min(1.8, +(prev + 0.25).toFixed(2)));
              }}
              className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center justify-center shadow-md cursor-pointer"
              title={isEn ? 'Zoom In' : 'Acercar'}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setZoomLevel((prev) => Math.max(0.6, +(prev - 0.25).toFixed(2)));
              }}
              className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center justify-center shadow-md cursor-pointer"
              title={isEn ? 'Zoom Out' : 'Alejar'}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundManager.playButtonClick();
                setZoomLevel(1);
              }}
              className="p-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center justify-center shadow-md cursor-pointer"
              title={isEn ? 'Reset Zoom' : 'Reiniciar Zoom'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Interactive Hint */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/85 border border-slate-800 text-[10px] text-slate-400 font-medium tracking-wide flex items-center gap-1.5 shadow-md pointer-events-none z-20 backdrop-blur-sm">
            <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>{isEn ? 'WebGL 3D // Drag 360° to rotate' : 'WebGL 3D // Arrastra para rotar 360°'}</span>
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
