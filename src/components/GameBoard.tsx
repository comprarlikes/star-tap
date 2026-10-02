import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StarItem, StarType, Particle, ParticleShape, FloatingText, PlayerState, GameMode, GhostRival, MultiplayerOpponent, MultiplayerArena, LiveEmote, BladePoint, SliceArc, CampaignLevel } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { ArcadeCanvas } from './ArcadeCanvas';
import { GameTipBanner } from './GameTipBanner';
import { InGamePauseModal } from './InGamePauseModal';
import { ReviveModal } from './ReviveModal';
import { MultiplayerBattleHUD } from './MultiplayerBattleHUD';
import { getRandomOpponentEmote } from '../services/multiplayerBotPool';
import { getTalentValue } from '../data/talents';
import { MainMenuTopShortcuts, MainMenuBottomShortcuts } from './MainMenuShortcuts';
import { Heart, Shield, Zap, Sparkles, AlertTriangle, Swords, Ghost, Users, Trophy, Gamepad2, X, Check, Clock, Flame, Smile, LogOut, Pause, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { t } from '../i18n';
import { CelestialStarGraphic } from './CelestialStarGraphic';
import { GlossyRedHeart } from './GlossyRedHeart';
import { GoldenCapsuleStar } from './GoldenCapsuleStar';
import { ThreeHeroStarCanvas } from './ThreeHeroStarCanvas';

interface GameBoardProps {
  isPlaying: boolean;
  gameMode: GameMode;
  setGameMode?: (mode: GameMode) => void;
  playerState: PlayerState;
  campaignLevel?: CampaignLevel | null;
  duelGhostRival?: GhostRival | null;
  onSelectDuelRival?: () => void;
  multiplayerOpponent?: MultiplayerOpponent | null;
  multiplayerArena?: MultiplayerArena | null;
  onOpenMultiplayerLobby?: () => void;
  onOpenShop?: () => void;
  onOpenQuests?: () => void;
  onOpenAchievements?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenFriends?: () => void;
  onOpenCampaign?: () => void;
  onOpenTalents?: () => void;
  onOpenCosmicPass?: () => void;
  onOpenDailyRewards?: () => void;
  onOpenLuckySpin?: () => void;
  hasUnclaimedQuests?: boolean;
  hasUnclaimedAchievements?: boolean;
  hasUnclaimedDailyReward?: boolean;
  hasFreeLuckySpin?: boolean;
  onMultiplayerGameOver?: (
    isWinner: boolean,
    playerScore: number,
    opponentScore: number,
    finalStats: {
      starsTapped: number;
      normal: number;
      golden: number;
      diamond: number;
      bombsHit: number;
      bombsAvoided: number;
      maxCombo: number;
    }
  ) => void;
  onGameOver: (finalScore: number, finalStats: {
    starsTapped: number;
    normal: number;
    golden: number;
    diamond: number;
    bombsHit: number;
    bombsAvoided: number;
    maxCombo: number;
  }) => void;
  onStartGame: () => void;
  onLiveProgress?: (liveStats: { score: number; combo: number; starsTapped: number; diamond: number; golden: number }) => void;
  onToggleSound?: () => void;
  onToggleHaptics?: () => void;
  onSpendCoins?: (amount: number) => boolean;
  onWatchAdForRevive?: () => Promise<boolean> | boolean | void;
  onSendEmote?: (emoji: string) => void;
}

interface StarItemRendererProps {
  star: StarItem;
  isTapped: boolean;
  onTap: (star: StarItem, e: React.PointerEvent) => void;
}

const StarItemRenderer = React.memo<StarItemRendererProps>(({ star, isTapped, onTap }) => {
  // Calculate subtle 3D rotational tilt based on playfield coordinates
  const tiltX = Math.max(-16, Math.min(16, ((star.y - 50) / 50) * 14));
  const tiltY = Math.max(-18, Math.min(18, ((50 - star.x) / 50) * 16));
  const rotZ = star.rotation || 0;
  const currentScale = star.scale || 1;

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-auto will-change-transform select-none"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        perspective: '700px',
        transform: 'translate3d(-50%, -50%, 0)',
      }}
    >
      {/* 3D Cosmic Playfield Floor Shadow */}
      <div 
        className="absolute rounded-full pointer-events-none transition-all duration-150 ease-out"
        style={{
          width: `${star.size * 0.72}px`,
          height: `${star.size * 0.26}px`,
          bottom: `-${star.size * 0.22}px`,
          background: star.type === 'bomb' 
            ? 'radial-gradient(ellipse, rgba(239, 68, 68, 0.45) 0%, transparent 72%)' 
            : star.type === 'diamond'
            ? 'radial-gradient(ellipse, rgba(56, 189, 248, 0.5) 0%, transparent 72%)'
            : star.type === 'supernova'
            ? 'radial-gradient(ellipse, rgba(244, 63, 94, 0.55) 0%, transparent 72%)'
            : 'radial-gradient(ellipse, rgba(245, 158, 11, 0.45) 0%, transparent 72%)',
          filter: 'blur(3.5px)',
          transform: `scale(${currentScale * 0.95})`,
          opacity: 0.85,
        }}
      />

      <button
        type="button"
        onPointerDown={(e) => onTap(star, e)}
        className="w-full h-full p-0 m-0 bg-transparent border-0 outline-none cursor-pointer relative flex items-center justify-center active:scale-90 transition-transform duration-75 ease-out"
        style={{ 
          touchAction: 'none',
          transform: `scale(${currentScale}) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(${rotZ}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        <CelestialStarGraphic
          type={star.type}
          size={star.size}
          isTapped={isTapped}
        />

        {/* 3D Specular Light Gleam Sweep */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-full overflow-hidden opacity-30 mix-blend-overlay"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 45%)',
          }}
        />
      </button>
    </div>
  );
});

export const GameBoard: React.FC<GameBoardProps> = ({
  isPlaying,
  gameMode,
  setGameMode,
  playerState,
  campaignLevel,
  duelGhostRival,
  onSelectDuelRival,
  multiplayerOpponent,
  multiplayerArena,
  onOpenMultiplayerLobby,
  onOpenShop,
  onOpenQuests,
  onOpenAchievements,
  onOpenLeaderboard,
  onOpenFriends,
  onOpenCampaign,
  onOpenTalents,
  onOpenCosmicPass,
  onOpenDailyRewards,
  onOpenLuckySpin,
  hasUnclaimedQuests = false,
  hasUnclaimedAchievements = false,
  hasUnclaimedDailyReward = false,
  hasFreeLuckySpin = true,
  onMultiplayerGameOver,
  onGameOver,
  onStartGame,
  onLiveProgress,
  onToggleSound,
  onToggleHaptics,
  onSpendCoins,
  onWatchAdForRevive,
  onSendEmote,
}) => {
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [lives, setLives] = useState<number>(3);
  const [matchElapsedSeconds, setMatchElapsedSeconds] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [activeMultiplier, setActiveMultiplier] = useState<number>(1);
  const [multiplierTimeLeft, setMultiplierTimeLeft] = useState<number>(0);
  const [shieldCount, setShieldCount] = useState<number>(0);
  const [freezeTimeLeft, setFreezeTimeLeft] = useState<number>(0);
  const [magnetTimeLeft, setMagnetTimeLeft] = useState<number>(0);
  const [magnetCharges, setMagnetCharges] = useState<number>(1);

  // Real-Time Multiplayer Live Opponent State
  const [opponentLiveScore, setOpponentLiveScore] = useState<number>(0);
  const [opponentLiveCombo, setOpponentLiveCombo] = useState<number>(0);
  const [opponentEvent, setOpponentEvent] = useState<string | null>(null);
  const [activeEmotes, setActiveEmotes] = useState<LiveEmote[]>([]);

  // Mode Selector Modal Overlay
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);

  // Exit Confirmation Dialog Overlay
  const [isConfirmingExit, setIsConfirmingExit] = useState<boolean>(false);

  // In-Game Pause State
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Match Start 3-2-1 Countdown (null when active, 3..2..1..0 when starting)
  const [matchCountdown, setMatchCountdown] = useState<number | null>(null);

  // Revive / Second Chance State
  const [showReviveModal, setShowReviveModal] = useState<boolean>(false);
  const hasUsedReviveRef = useRef<boolean>(false);

  // Fever Meter (0 - 100)
  const [feverProgress, setFeverProgress] = useState<number>(0);
  const [isFeverActive, setIsFeverActive] = useState<boolean>(false);
  const [feverTimeLeft, setFeverTimeLeft] = useState<number>(0);

  // Calculate Progress Percentage for the Top Progress Capsule Bar (matching screenshot)
  const calculatedProgress = useMemo(() => {
    switch (gameMode) {
      case 'campaign': {
        const req = campaignLevel?.starRequirements[2] || 1000;
        return Math.min(100, Math.max(15, Math.round((score / req) * 100)));
      }
      case 'blitz': {
        const target = Math.max(500, playerState.stats.highestScore || 1000);
        return Math.min(100, Math.max(10, Math.round((score / target) * 100)));
      }
      case 'fever': {
        return Math.min(100, Math.max(10, Math.round(feverProgress)));
      }
      case 'duel': {
        const rivalTarget = duelGhostRival?.score || 1000;
        return Math.min(100, Math.max(10, Math.round((score / rivalTarget) * 100)));
      }
      case 'zen': {
        return Math.min(100, Math.max(20, (score % 100) || 50));
      }
      default: {
        // Endless: Progress towards personal best / milestone (starts at 80% like screenshot, advances dynamically)
        const target = Math.max(800, playerState.stats.highestScore || 1200);
        const p = Math.min(100, Math.round((score / target) * 100));
        return score === 0 ? 80 : Math.max(15, p);
      }
    }
  }, [gameMode, score, campaignLevel, playerState.stats.highestScore, feverProgress, duelGhostRival]);

  // Dynamic Threat / Danger Level (1 to 4) based on match elapsed time & campaign level
  const threatLevel = useMemo(() => {
    if (gameMode === 'zen') return 1;
    if (gameMode === 'campaign' && campaignLevel) {
      const levelBase = Math.min(3, Math.floor((campaignLevel.id - 1) / 4) + 1);
      const timeAdd = Math.floor(matchElapsedSeconds / 18);
      return Math.min(4, Math.max(1, levelBase + timeAdd));
    }
    if (matchElapsedSeconds >= 50) return 4;
    if (matchElapsedSeconds >= 32) return 3;
    if (matchElapsedSeconds >= 15) return 2;
    return 1;
  }, [gameMode, campaignLevel, matchElapsedSeconds]);

  const lastThreatLevelRef = useRef<number>(1);

  // Stats for match end breakdown
  const matchStatsRef = useRef({
    starsTapped: 0,
    normal: 0,
    golden: 0,
    diamond: 0,
    bombsHit: 0,
    bombsAvoided: 0,
    maxCombo: 0,
  });

  const [stars, setStars] = useState<StarItem[]>([]);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [homeStarBooped, setHomeStarBooped] = useState<boolean>(false);

  // Canvas Particles, Floating Texts, Blade Trails & Slice Arcs
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bladePointsRef = useRef<BladePoint[]>([]);
  const sliceArcsRef = useRef<SliceArc[]>([]);
  const isSwipingRef = useRef<boolean>(false);
  const strokeSlicedStarsRef = useRef<Set<string>>(new Set());
  const tappedStarsSetRef = useRef<Set<string>>(new Set());
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const playAreaRef = useRef<HTMLDivElement | null>(null);

  // Companion flags
  const hasSparkyBotDefuse = useRef<boolean>(playerState.equippedCharacter === 'char_sparky_bot');

  // Spawn timing helper
  const nextSpawnId = useRef<number>(1);

  // Throttle live progress achievement check to prevent main thread frame drops
  const lastLiveProgressTimeRef = useRef<number>(0);
  const lastLiveReportedScoreRef = useRef<number>(0);
  const lastLiveReportedComboRef = useRef<number>(0);

  // Trigger Screen Shake
  const triggerShake = useCallback(() => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 350);
  }, []);

  // Add Particles at (x, y) with particle options
  const addParticles = useCallback((
    x: number,
    y: number,
    color: string,
    count = 12,
    options?: {
      shape?: ParticleShape;
      speedMin?: number;
      speedMax?: number;
      sizeMin?: number;
      sizeMax?: number;
      gravity?: number;
      drag?: number;
      maxLifeMin?: number;
      maxLifeMax?: number;
    }
  ) => {
    const opts = options || {};
    const shape = opts.shape || 'circle';
    const speedMin = opts.speedMin ?? 1.5;
    const speedMax = opts.speedMax ?? 5.5;
    const sizeMin = opts.sizeMin ?? 3;
    const sizeMax = opts.sizeMax ?? 8;
    const maxLifeMin = opts.maxLifeMin ?? 20;
    const maxLifeMax = opts.maxLifeMax ?? 35;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (speedMax - speedMin) + speedMin;
      const vz = (Math.random() - 0.5) * (speed * 1.6);
      particlesRef.current.push({
        x,
        y,
        z: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz,
        color,
        size: Math.random() * (sizeMax - sizeMin) + sizeMin,
        alpha: 1,
        life: 0,
        maxLife: Math.floor(Math.random() * (maxLifeMax - maxLifeMin) + maxLifeMin),
        shape,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        gravity: opts.gravity ?? (shape === 'smoke' ? -0.06 : 0.05),
        drag: opts.drag ?? (shape === 'ring' ? 1.0 : 0.95),
      });
    }
  }, []);

  // Specialized Star Burst Explosions
  const addStarBurstParticles = useCallback((x: number, y: number, starType: StarType) => {
    switch (starType) {
      case 'normal':
        addParticles(x, y, '#facc15', 8, { shape: 'spark', speedMin: 2, speedMax: 6, sizeMin: 3, sizeMax: 6 });
        addParticles(x, y, '#fbbf24', 6, { shape: 'star', speedMin: 1, speedMax: 4, sizeMin: 4, sizeMax: 8 });
        break;

      case 'golden':
        addParticles(x, y, '#f59e0b', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 8, sizeMax: 8, maxLifeMin: 20, maxLifeMax: 20 });
        addParticles(x, y, '#facc15', 12, { shape: 'star', speedMin: 2, speedMax: 7, sizeMin: 6, sizeMax: 12 });
        addParticles(x, y, '#fbbf24', 10, { shape: 'spark', speedMin: 3, speedMax: 8, sizeMin: 3, sizeMax: 7 });
        break;

      case 'diamond':
        addParticles(x, y, '#38bdf8', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 10, sizeMax: 10, maxLifeMin: 24, maxLifeMax: 24 });
        addParticles(x, y, '#60a5fa', 14, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 7, sizeMax: 14 });
        addParticles(x, y, '#ffffff', 12, { shape: 'spark', speedMin: 4, speedMax: 10, sizeMin: 3, sizeMax: 8 });
        break;

      case 'rainbow':
        addParticles(x, y, '#ec4899', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 12, sizeMax: 12, maxLifeMin: 25, maxLifeMax: 25 });
        addParticles(x, y, '#f59e0b', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 6, sizeMax: 6, maxLifeMin: 20, maxLifeMax: 20 });
        addParticles(x, y, '#f472b6', 10, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 8, sizeMax: 15 });
        addParticles(x, y, '#38bdf8', 10, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 8, sizeMax: 15 });
        addParticles(x, y, '#facc15', 10, { shape: 'spark', speedMin: 4, speedMax: 10, sizeMin: 4, sizeMax: 9 });
        addParticles(x, y, '#34d399', 8, { shape: 'circle', speedMin: 2, speedMax: 7, sizeMin: 4, sizeMax: 8 });
        break;

      case 'supernova':
        addParticles(x, y, '#f43f5e', 2, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 14, sizeMax: 14, maxLifeMin: 28, maxLifeMax: 28 });
        addParticles(x, y, '#fbbf24', 2, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 8, sizeMax: 8, maxLifeMin: 20, maxLifeMax: 20 });
        addParticles(x, y, '#f43f5e', 18, { shape: 'star', speedMin: 4, speedMax: 12, sizeMin: 8, sizeMax: 16 });
        addParticles(x, y, '#fbbf24', 16, { shape: 'spark', speedMin: 4, speedMax: 12, sizeMin: 4, sizeMax: 9 });
        addParticles(x, y, '#a855f7', 12, { shape: 'circle', speedMin: 3, speedMax: 8, sizeMin: 5, sizeMax: 10 });
        break;

      case 'multiplier2':
      case 'multiplier5':
        addParticles(x, y, '#c084fc', 12, { shape: 'star', speedMin: 3, speedMax: 8, sizeMin: 6, sizeMax: 12 });
        addParticles(x, y, '#e879f9', 12, { shape: 'spark', speedMin: 4, speedMax: 9, sizeMin: 3, sizeMax: 7 });
        break;

      case 'freeze':
        addParticles(x, y, '#38bdf8', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 8, sizeMax: 8 });
        addParticles(x, y, '#bae6fd', 12, { shape: 'spark', speedMin: 2, speedMax: 8, sizeMin: 3, sizeMax: 7 });
        addParticles(x, y, '#7dd3fc', 10, { shape: 'star', speedMin: 1, speedMax: 5, sizeMin: 5, sizeMax: 10 });
        break;

      case 'magnet':
        addParticles(x, y, '#c084fc', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 12, sizeMax: 12, maxLifeMin: 25, maxLifeMax: 25 });
        addParticles(x, y, '#a855f7', 12, { shape: 'star', speedMin: 3, speedMax: 8, sizeMin: 6, sizeMax: 12 });
        addParticles(x, y, '#f472b6', 10, { shape: 'spark', speedMin: 2, speedMax: 6, sizeMin: 3, sizeMax: 7 });
        break;

      case 'shield':
      case 'timeBonus':
        const color = starType === 'shield' ? '#22d3ee' : '#34d399';
        addParticles(x, y, color, 12, { shape: 'star', speedMin: 2, speedMax: 7, sizeMin: 5, sizeMax: 10 });
        addParticles(x, y, '#ffffff', 8, { shape: 'spark', speedMin: 3, speedMax: 8, sizeMin: 2, sizeMax: 6 });
        break;

      default:
        addParticles(x, y, '#fbbf24', 10);
        break;
    }
  }, [addParticles]);

  // Specialized Bomb Explosion Particles
  const addBombExplosionParticles = useCallback((x: number, y: number) => {
    // 1. Expanding Shockwave Rings
    addParticles(x, y, '#ef4444', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 10, sizeMax: 10, maxLifeMin: 22, maxLifeMax: 22 });
    addParticles(x, y, '#f97316', 1, { shape: 'ring', speedMin: 0, speedMax: 0, sizeMin: 4, sizeMax: 4, maxLifeMin: 18, maxLifeMax: 18 });

    // 2. Fiery Sparks & Debris
    addParticles(x, y, '#ef4444', 18, { shape: 'spark', speedMin: 4, speedMax: 12, sizeMin: 4, sizeMax: 9, drag: 0.93 });
    addParticles(x, y, '#f97316', 14, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 6, sizeMax: 12, drag: 0.94 });
    addParticles(x, y, '#fbbf24', 10, { shape: 'circle', speedMin: 2, speedMax: 7, sizeMin: 4, sizeMax: 8 });

    // 3. Smoke Puffs Drifting Up
    addParticles(x, y, '#334155', 10, { shape: 'smoke', speedMin: 0.5, speedMax: 2.5, sizeMin: 8, sizeMax: 16, gravity: -0.08, drag: 0.92, maxLifeMin: 30, maxLifeMax: 45 });
  }, [addParticles]);

  // Add Floating Text at (x, y)
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      createdAt: Date.now(),
    });
  }, []);

  // Activate Star Magnet Powerup
  const activateMagnet = useCallback(() => {
    if (!isPlaying || magnetCharges <= 0 || magnetTimeLeft > 0) return;
    setMagnetCharges((prev) => Math.max(0, prev - 1));
    setMagnetTimeLeft(5);
    soundManager.playPowerup();
    hapticManager.heavyTap();

    const rect = boardRef.current?.getBoundingClientRect();
    const centerX = (rect?.width || 350) / 2;
    const centerY = (rect?.height || 500) / 2;
    addFloatingText('🧲 ¡IMÁN DE ESTRELLAS! 🧲', centerX, centerY - 30, '#c084fc');
    addParticles(centerX, centerY, '#a855f7', 16, { shape: 'ring', speedMin: 2, speedMax: 8, sizeMin: 8, sizeMax: 16 });
  }, [isPlaying, magnetCharges, magnetTimeLeft, addParticles, addFloatingText]);

  // Reset Game Match State
  const resetMatch = useCallback(() => {
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setActiveMultiplier(1);
    setMultiplierTimeLeft(0);
    setFreezeTimeLeft(0);
    setMagnetTimeLeft(0);
    // Magnet charges from upgrades and active boosters
    const boosterMagnet = (playerState.activeBoosters?.star_magnet_boost || 0) > 0 ? 1 : 0;
    setMagnetCharges((playerState.upgrades.star_magnet || 0) + 1 + boosterMagnet);
    setFeverProgress(0);
    setIsFeverActive(false);
    setFeverTimeLeft(0);
    setStars([]);
    particlesRef.current = [];
    floatingTextsRef.current = [];
    bladePointsRef.current = [];
    sliceArcsRef.current = [];
    strokeSlicedStarsRef.current.clear();
    tappedStarsSetRef.current.clear();
    lastPointerPosRef.current = null;
    isSwipingRef.current = false;

    hasSparkyBotDefuse.current = playerState.equippedCharacter === 'char_sparky_bot';

    // Base Time calculations
    const baseTimeUpgrade = playerState.upgrades.time_extender || 0;
    const cosmicCatExtraTime = playerState.equippedCharacter === 'char_cosmic_cat' ? 3 : 0;
    const boosterExtraTime = (playerState.activeBoosters?.time_bonus_boost || 0) > 0 ? 5 : 0;
    const initialTime = gameMode === 'campaign' && campaignLevel
      ? (campaignLevel.timeLimit || 45) + baseTimeUpgrade + cosmicCatExtraTime + boosterExtraTime
      : gameMode === 'blitz'
      ? (60 + baseTimeUpgrade + cosmicCatExtraTime + boosterExtraTime)
      : (gameMode === 'fever' ? 30 : 60);
    setTimeLeft(initialTime);

    setLives(3);
    setMatchElapsedSeconds(0);
    lastThreatLevelRef.current = 1;

    // Initial Shields from upgrades and active boosters
    const initialShields = (playerState.upgrades.bomb_shield || 0) + ((playerState.activeBoosters?.extra_shield || 0) > 0 ? 1 : 0);
    setShieldCount(initialShields);

    matchStatsRef.current = {
      starsTapped: 0,
      normal: 0,
      golden: 0,
      diamond: 0,
      bombsHit: 0,
      bombsAvoided: 0,
      maxCombo: 0,
    };

    setOpponentLiveScore(0);
    setOpponentLiveCombo(0);
    setOpponentEvent(null);
    setActiveEmotes([]);
  }, [gameMode, playerState]);

  // Handle Match Start with Pro 3-2-1 Countdown
  useEffect(() => {
    if (isPlaying) {
      resetMatch();
      hasUsedReviveRef.current = false;
      setIsPaused(false);
      setShowReviveModal(false);

      // If entering directly from MultiplayerVersusShowdown, the cinematic 3-2-1 countdown already completed
      if (multiplayerOpponent) {
        setMatchCountdown(null);
        return;
      }

      setMatchCountdown(3);
      soundManager.playCountdownTick();

      const t1 = setTimeout(() => {
        setMatchCountdown(2);
        soundManager.playCountdownTick();
      }, 900);

      const t2 = setTimeout(() => {
        setMatchCountdown(1);
        soundManager.playCountdownTick();
      }, 1800);

      const t3 = setTimeout(() => {
        setMatchCountdown(0);
        soundManager.playCountdownGo();
      }, 2700);

      const t4 = setTimeout(() => {
        setMatchCountdown(null);
      }, 3400);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      setMatchCountdown(null);
      setIsPaused(false);
      setShowReviveModal(false);
    }
  }, [isPlaying, resetMatch, multiplayerOpponent]);

  // Report live progress during gameplay for real-time achievement checking (throttled to 1000ms / milestones)
  useEffect(() => {
    if (!isPlaying || !onLiveProgress) return;
    const now = Date.now();
    const comboMilestone = combo > 0 && combo % 10 === 0 && combo !== lastLiveReportedComboRef.current;
    const scoreMilestone =
      (score >= 300 && lastLiveReportedScoreRef.current < 300) ||
      (score >= 700 && lastLiveReportedScoreRef.current < 700) ||
      (score >= 1500 && lastLiveReportedScoreRef.current < 1500);

    if (comboMilestone || scoreMilestone || now - lastLiveProgressTimeRef.current >= 1000) {
      lastLiveProgressTimeRef.current = now;
      lastLiveReportedScoreRef.current = score;
      lastLiveReportedComboRef.current = combo;
      onLiveProgress({
        score,
        combo,
        starsTapped: matchStatsRef.current.starsTapped,
        diamond: matchStatsRef.current.diamond,
        golden: matchStatsRef.current.golden,
      });
    }
  }, [score, combo, isPlaying, onLiveProgress]);

  // Threat Level Alert Effect: Triggers audio cue, haptic, and warning banner as danger level escalates
  useEffect(() => {
    if (!isPlaying || matchCountdown !== null || isPaused || gameMode === 'zen') return;
    if (threatLevel > lastThreatLevelRef.current) {
      lastThreatLevelRef.current = threatLevel;
      const rect = playAreaRef.current?.getBoundingClientRect();
      const cx = (rect?.width || 350) / 2;
      const cy = (rect?.height || 500) / 2;
      let alertMsg = '⚠️ ¡NIVEL 2: MÁS BOMBAS!';
      let alertColor = '#fbbf24';
      if (threatLevel === 3) {
        alertMsg = '🔥 ¡NIVEL 3: RIESGO ELEVADO!';
        alertColor = '#f97316';
      } else if (threatLevel === 4) {
        alertMsg = '⚡ ¡NIVEL 4: CAOS CÓSMICO!';
        alertColor = '#ef4444';
      }
      addFloatingText(alertMsg, cx, cy - 40, alertColor);
      soundManager.playSupernova();
      triggerShake();
    }
  }, [threatLevel, isPlaying, matchCountdown, isPaused, gameMode, addFloatingText, triggerShake]);

  // Spawning Stars Logic
  const spawnStar = useCallback(() => {
    if (!isPlaying) return;

    // Determine star type based on probability
    const rand = Math.random();
    let type: StarType = 'normal';

    const hasDragon = playerState.equippedCharacter === 'char_dragon';
    const luckyCharmLevel = playerState.upgrades.lucky_charm || 0;
    const astralLuckRank = playerState.talents?.astral_luck || 0;
    const astralLuckBonus = getTalentValue('astral_luck', astralLuckRank) / 100;
    const luckyBonus = luckyCharmLevel * 0.03 + (hasDragon ? 0.08 : 0) + astralLuckBonus;

    // Probabilities
    if (gameMode === 'zen') {
      // Zen mode: No bombs! Relaxed tapping practice
      if (rand < 0.38) type = 'normal';
      else if (rand < 0.60) type = 'golden';
      else if (rand < 0.72) type = 'diamond';
      else if (rand < 0.80) type = 'multiplier2';
      else if (rand < 0.86) type = 'multiplier5';
      else if (rand < 0.92) type = 'rainbow';
      else if (rand < 0.97) type = 'supernova';
      else type = 'normal';
    } else if (isFeverActive) {
      // Fever mode: higher chance of gold, diamond, multipliers, supernova!
      if (rand < 0.35) type = 'golden';
      else if (rand < 0.60) type = 'diamond';
      else if (rand < 0.75) type = 'multiplier2';
      else if (rand < 0.88) type = 'rainbow';
      else type = 'supernova';
    } else {
      // Determine bomb chance dynamically based on match elapsed time and campaign level
      let bombChance = 0.10;
      if (campaignLevel?.noBombsAllowed) {
        bombChance = 0;
      } else {
        // Base bomb rate by mode and campaign level
        if (gameMode === 'campaign' && campaignLevel) {
          const levelFactor = Math.min(0.12, (campaignLevel.id - 1) * 0.012);
          const bossFactor = campaignLevel.isBoss ? 0.06 : 0;
          bombChance = 0.08 + levelFactor + bossFactor;
        }

        // Elapsed time escalation: increases as match time advances (more bombs over time)
        const timeEscalation = Math.min(0.18, Math.floor(matchElapsedSeconds / 14) * 0.035);
        bombChance += timeEscalation;

        // Lucky charm & Astral Luck reduces bomb probability
        bombChance = Math.max(0.06, Math.min(0.34, bombChance - luckyBonus * 0.4));
      }

      if (rand < bombChance) {
        type = 'bomb';
      } else {
        // Proportional distribution of stars across the non-bomb probability space
        const starRand = (rand - bombChance) / (1 - bombChance);
        if (starRand < 0.22 + luckyBonus) {
          type = 'golden';
        } else if (starRand < 0.34 + luckyBonus) {
          type = 'diamond';
        } else if (starRand < 0.42) {
          type = 'multiplier2';
        } else if (starRand < 0.48) {
          type = 'multiplier5';
        } else if (starRand < 0.54) {
          type = 'timeBonus';
        } else if (starRand < 0.60) {
          type = 'shield';
        } else if (starRand < 0.66) {
          type = 'freeze';
        } else if (starRand < 0.71) {
          type = 'magnet';
        } else if (starRand < 0.76) {
          type = 'rainbow';
        } else if (starRand < 0.82 + (luckyBonus > 0 ? 0.05 : 0)) {
          type = 'supernova';
        } else {
          type = 'normal';
        }
      }
    }

    // Responsive star size calculation to maintain optimal touch target across devices
    const playAreaWidth = playAreaRef.current?.clientWidth || 360;
    const baseSize = Math.max(54, Math.min(68, Math.round(playAreaWidth * 0.15)));
    const starSize = (type === 'rainbow' || type === 'diamond' || type === 'supernova') ? baseSize + 6 : baseSize;

    // Despawn duration (ms) - shrinks with time or freeze status
    let baseDuration = 1100;
    if (type === 'diamond' || type === 'multiplier5') baseDuration = 800;
    if (type === 'rainbow' || type === 'supernova') baseDuration = 700;
    const reflexesRank = playerState.talents?.cosmic_reflexes || 0;
    const reflexesBonus = 1 + (getTalentValue('cosmic_reflexes', reflexesRank) / 100);
    baseDuration = Math.round(baseDuration * reflexesBonus);
    if (freezeTimeLeft > 0) baseDuration *= 1.8;

    // Spawn coordinate calculation with spatial anti-overlap checking
    setStars((prev) => {
      let candX = Math.floor(Math.random() * 74) + 13;
      let candY = Math.floor(Math.random() * 70) + 15;
      let attempts = 0;

      // Ensure new star does not overlap existing active stars
      while (attempts < 15) {
        const hasOverlap = prev.some((s) => {
          const dx = candX - s.x;
          const dy = (candY - s.y) * 1.15;
          return Math.hypot(dx, dy) < 15; // 15% minimum center-to-center separation
        });
        if (!hasOverlap) break;
        candX = Math.floor(Math.random() * 74) + 13;
        candY = Math.floor(Math.random() * 70) + 15;
        attempts++;
      }

      const newStar: StarItem = {
        id: `star_${nextSpawnId.current++}_${Date.now()}`,
        type,
        x: candX,
        y: candY,
        size: starSize,
        createdAt: Date.now(),
        duration: baseDuration,
        scale: 1,
        rotation: Math.floor(Math.random() * 360),
      };

      return [...prev.slice(-10), newStar]; // cap max active stars on screen
    });
  }, [isPlaying, isFeverActive, playerState, freezeTimeLeft, gameMode, campaignLevel, matchElapsedSeconds]);

  // Main Spawn Interval (with dynamic slight acceleration according to threat level)
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;

    const baseSpawnInterval = isFeverActive ? 300 : (gameMode === 'fever' ? 350 : 550);
    const threatSpeedReduction = (threatLevel - 1) * 35;
    const spawnIntervalMs = Math.max(280, baseSpawnInterval - threatSpeedReduction);

    const interval = setInterval(() => {
      spawnStar();
    }, spawnIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, isConfirmingExit, isPaused, matchCountdown, showReviveModal, isFeverActive, gameMode, threatLevel, spawnStar]);

  // Despawning & Timer Cleanup Tick
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;

    const timer = setInterval(() => {
      const now = Date.now();

      // Despawn expired stars
      setStars((prev) => {
        const remaining: StarItem[] = [];
        prev.forEach((star) => {
          if (now - star.createdAt > star.duration) {
            // Star expired naturally
            if (star.type === 'golden' || star.type === 'diamond') {
              // Missed valuable star in endless mode costs 1 life
              if (gameMode === 'endless') {
                setLives((l) => {
                  const nextL = l - 1;
                  if (nextL <= 0) {
                    soundManager.playGameOver();
                  }
                  return Math.max(0, nextL);
                });
                const rect = playAreaRef.current?.getBoundingClientRect();
                const starX = (star.x / 100) * (rect?.width || 350);
                const starY = (star.y / 100) * (rect?.height || 500);
                addFloatingText('💔 -1 Vida', starX, starY, '#f87171');
                soundManager.playLifeLost();
                if (playerState.hapticsEnabled) hapticManager.mediumTap();
                triggerShake();
              }
            }
            if (star.type === 'bomb') {
              matchStatsRef.current.bombsAvoided += 1;
            }
          } else {
            remaining.push(star);
          }
        });
        return remaining;
      });

      // Update Multiplier Timer
      setMultiplierTimeLeft((m) => {
        if (m <= 1) {
          if (m === 1) setActiveMultiplier(1);
          return 0;
        }
        return m - 1;
      });

      // Update Freeze Timer
      setFreezeTimeLeft((f) => Math.max(0, f - 1));

      // Update Magnet Timer
      setMagnetTimeLeft((m) => Math.max(0, m - 1));

      // Update Fever Active Timer
      setFeverTimeLeft((ft) => {
        if (ft <= 1 && isFeverActive) {
          setIsFeverActive(false);
          return 0;
        }
        return Math.max(0, ft - 1);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isConfirmingExit, gameMode, isFeverActive]);

  // Magnet Pull Loop: Attracts active non-bomb stars toward center (50%, 50%)
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal || magnetTimeLeft <= 0) return;

    const magnetInterval = setInterval(() => {
      setStars((prevStars) => {
        let changed = false;
        const nextStars: StarItem[] = [];

        for (const star of prevStars) {
          if (star.type === 'bomb') {
            nextStars.push(star);
            continue;
          }

          const dx = 50 - star.x;
          const dy = 50 - star.y;
          const dist = Math.hypot(dx, dy);

          if (dist <= 9) {
            changed = true;
            const rect = playAreaRef.current?.getBoundingClientRect();
            const clickX = (star.x / 100) * (rect?.width || 350);
            const clickY = (star.y / 100) * (rect?.height || 500);

            matchStatsRef.current.starsTapped += 1;
            setCombo((c) => {
              const nextC = c + 1;
              setMaxCombo((m) => Math.max(m, nextC));
              return nextC;
            });

            let pts = 1;
            if (star.type === 'golden') pts = 5;
            else if (star.type === 'diamond') pts = 20;
            else if (star.type === 'rainbow') pts = 50;

            setScore((s) => s + pts);
            soundManager.playTapGold();
            hapticManager.lightTap();
            addStarBurstParticles(clickX, clickY, star.type);
            addFloatingText(`+${pts} 🧲`, clickX, clickY, '#facc15');
          } else {
            changed = true;
            const speed = 3.6;
            nextStars.push({
              ...star,
              x: star.x + (dx / dist) * speed,
              y: star.y + (dy / dist) * speed,
            });
          }
        }

        return changed ? nextStars : prevStars;
      });
    }, 70);

    return () => clearInterval(magnetInterval);
  }, [isPlaying, magnetTimeLeft, addStarBurstParticles, addFloatingText]);

  // Multiplayer Opponent Real-time Simulation
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal || !multiplayerOpponent) {
      return;
    }

    const interval = setInterval(() => {
      // Calculate realistic score tick based on personality and skill
      const baseTick = (multiplayerOpponent.targetScore / 60) * (0.75 + Math.random() * 0.5) * multiplayerOpponent.skillMultiplier;
      const pts = Math.max(1, Math.round(baseTick));

      setOpponentLiveScore((prev) => prev + pts);
      setOpponentLiveCombo((prev) => (Math.random() > 0.1 ? prev + 1 : 0));

      // Occasional match events (12% chance per tick)
      if (Math.random() < 0.12) {
        const events = [
          `⚡ ¡${multiplayerOpponent.name} logró Combo x10!`,
          `💥 ¡${multiplayerOpponent.name} pisó una bomba! (-10)`,
          `🔥 ¡${multiplayerOpponent.name} desató MODO FIEBRE!`,
          `🧲 ¡${multiplayerOpponent.name} activó Imán Estelar!`,
        ];
        const evt = events[Math.floor(Math.random() * events.length)];
        setOpponentEvent(evt);
        soundManager.playRivalAlert();
        setTimeout(() => setOpponentEvent(null), 2500);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isConfirmingExit, isPaused, matchCountdown, showReviveModal, multiplayerOpponent]);

  // Handle Player Sending Live Emote
  const handleSendEmote = (emoji: string) => {
    onSendEmote?.(emoji);
    const playerEmote: LiveEmote = {
      id: `p_${Date.now()}`,
      emoji,
      sender: 'player',
      timestamp: Date.now(),
    };
    setActiveEmotes((prev) => [...prev, playerEmote]);

    // Clear emote after 2.5s
    setTimeout(() => {
      setActiveEmotes((prev) => prev.filter((e) => e.id !== playerEmote.id));
    }, 2500);

    // Opponent counter-reaction
    if (multiplayerOpponent && Math.random() < 0.75) {
      setTimeout(() => {
        const oppEmote: LiveEmote = {
          id: `opp_${Date.now()}`,
          emoji: getRandomOpponentEmote(),
          sender: 'opponent',
          timestamp: Date.now(),
        };
        setActiveEmotes((prev) => [...prev, oppEmote]);
        soundManager.playEmotePop();
        setTimeout(() => {
          setActiveEmotes((prev) => prev.filter((e) => e.id !== oppEmote.id));
        }, 2500);
      }, 1400);
    }
  };

  // Game Clock Countdown & Match Elapsed Time
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal || gameMode === 'zen') return;

    const clockInterval = setInterval(() => {
      setMatchElapsedSeconds((s) => s + 1);

      if (gameMode !== 'endless') {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            soundManager.playGameOver();
            return 0;
          }
          return prevTime - 1;
        });
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isPlaying, isConfirmingExit, isPaused, matchCountdown, showReviveModal, gameMode]);

  // Check Game Over Conditions or Trigger Revive Prompt
  useEffect(() => {
    if (isPlaying && !isConfirmingExit && !isPaused && matchCountdown === null && !showReviveModal && gameMode !== 'zen') {
      const isTimeOut = gameMode !== 'endless' && timeLeft <= 0;
      const isOutOfLives = lives <= 0;
      if (isTimeOut || isOutOfLives) {
        if (multiplayerOpponent && onMultiplayerGameOver) {
          const isWinner = score >= opponentLiveScore;
          onMultiplayerGameOver(isWinner, score, opponentLiveScore, { ...matchStatsRef.current });
        } else if (!hasUsedReviveRef.current && score >= 30) {
          setShowReviveModal(true);
        } else {
          onGameOver(score, { ...matchStatsRef.current });
        }
      }
    }
  }, [isPlaying, isConfirmingExit, isPaused, matchCountdown, showReviveModal, timeLeft, lives, gameMode, score, opponentLiveScore, multiplayerOpponent, onMultiplayerGameOver, onGameOver]);

  const handleReviveWithAd = async () => {
    if (onWatchAdForRevive) {
      const rewarded = await onWatchAdForRevive();
      if (!rewarded) {
        // Did not earn reward (ad failed or closed early) - proceed to game over
        setShowReviveModal(false);
        onGameOver(score, { ...matchStatsRef.current });
        return;
      }
    }
    hasUsedReviveRef.current = true;
    setShowReviveModal(false);
    setLives(2);
    if (gameMode !== 'endless') {
      setTimeLeft(15);
    }
    soundManager.playRevive();
    hapticManager.success();
    const rect = boardRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 350) / 2;
    const cy = (rect?.height || 500) / 2;
    addParticles(cx, cy, '#10b981', 24, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 8, sizeMax: 16 });
    addFloatingText('✨ ¡REVIVIDO! (+2 Corazones) ✨', cx, cy - 40, '#34d399');
  };

  const handleReviveWithCoins = () => {
    const success = onSpendCoins ? onSpendCoins(100) : (playerState.coins >= 100);
    if (!success && playerState.coins < 100) return;
    hasUsedReviveRef.current = true;
    setShowReviveModal(false);
    setLives(2);
    if (gameMode !== 'endless') {
      setTimeLeft(15);
    }
    soundManager.playRevive();
    hapticManager.success();
    const rect = boardRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 350) / 2;
    const cy = (rect?.height || 500) / 2;
    addParticles(cx, cy, '#f59e0b', 24, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 8, sizeMax: 16 });
    addFloatingText('✨ ¡REVIVIDO! (+2 Corazones) ✨', cx, cy - 40, '#facc15');
  };

  const handleSkipRevive = () => {
    setShowReviveModal(false);
    onGameOver(score, { ...matchStatsRef.current });
  };

  // Distance helper from point to line segment
  const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  };

  // Process Star Hit (Supports both direct taps and fluid slicing trails)
  const processStarHit = useCallback((
    star: StarItem,
    clickX: number,
    clickY: number,
    isSlice = false,
    strokeCount = 1,
    sliceAngle = 0
  ) => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;
    if (tappedStarsSetRef.current.has(star.id)) return;
    tappedStarsSetRef.current.add(star.id);

    // Calculate precision center hit (if hit was within 32% of center of star)
    const rect = playAreaRef.current?.getBoundingClientRect();
    const starCenterX = (star.x / 100) * (rect?.width || 350);
    const starCenterY = (star.y / 100) * (rect?.height || 500);
    const distToCenter = Math.hypot(clickX - starCenterX, clickY - starCenterY);
    const starRadius = (star.size || 54) / 2;
    const isPerfect = distToCenter < starRadius * 0.35 && star.type !== 'bomb';

    // Remove star from active list immediately
    setStars((prev) => prev.filter((s) => s.id !== star.id));

    matchStatsRef.current.starsTapped += 1;

    // Calculate Combo Multiplier Bonus
    const currentCombo = combo + 1;
    setCombo(currentCombo);
    if (currentCombo > maxCombo) {
      setMaxCombo(currentCombo);
      matchStatsRef.current.maxCombo = currentCombo;
    }

    // Trigger haptic feedback for combo milestones
    hapticManager.comboTrigger(currentCombo);

    // Audio & Visual celebratory fanfare for milestone combos
    if (
      currentCombo === 5 ||
      currentCombo === 10 ||
      currentCombo === 15 ||
      currentCombo === 20 ||
      currentCombo === 25 ||
      currentCombo === 30 ||
      currentCombo === 40 ||
      currentCombo === 50
    ) {
      soundManager.playComboMilestone(currentCombo);
      let comboBanner = `⚡ ¡COMBO x${currentCombo}!`;
      if (currentCombo === 10) comboBanner = '🔥 ¡COMBO x10 IMPARABLE!';
      if (currentCombo === 15) comboBanner = '🚀 ¡COMBO x15 EN LLAMAS!';
      if (currentCombo === 20) comboBanner = '👑 ¡COMBO x20 LEYENDA!';
      if (currentCombo >= 30) comboBanner = '🌌 ¡COMBO x30 DIOS CÓSMICO!';
      addFloatingText(comboBanner, clickX, clickY - 45, '#f59e0b');

      // Reward player with +1 Star Power charge every 15 combo!
      if (currentCombo % 15 === 0) {
        setMagnetCharges((c) => Math.min(3, c + 1));
        soundManager.playPowerup();
        addFloatingText('⚡ ¡PODER RECARGADO! 🧲', clickX, clickY - 65, '#c084fc');
      }
    }

    // Multi-slice combo bonus
    let multiSliceMultiplier = 1;
    if (isSlice && strokeCount >= 2) {
      multiSliceMultiplier = 1 + (strokeCount - 1) * 0.5;
      soundManager.playMultiSlice(strokeCount);
      let sliceTitle = `⚡ ¡DOBLE CORTE! x${strokeCount}`;
      if (strokeCount === 3) sliceTitle = `🔥 ¡TRIPLE CORTE! x3`;
      if (strokeCount >= 4) sliceTitle = `👑 ¡CORTE CÓSMICO x${strokeCount}!`;
      addFloatingText(sliceTitle, clickX, clickY - 32, '#38bdf8');
    }

    // Precision critical center hit
    let perfectMultiplier = 1;
    if (isPerfect) {
      perfectMultiplier = 1.5;
      soundManager.playPerfectHit();
      addParticles(clickX, clickY, '#facc15', 10, { shape: 'star', speedMin: 3, speedMax: 8, sizeMin: 6, sizeMax: 12 });
      addFloatingText('✨ ¡PERFECTO! +50% ✨', clickX, clickY - 20, '#fef08a');
    }

    // Combo factor multiplier: 1 + combo * 0.1
    const comboFactor = Math.min(3.0, 1 + Math.floor(currentCombo / 5) * 0.25);
    const totalMultiplier = activeMultiplier * comboFactor * multiSliceMultiplier * perfectMultiplier;

    // Increase Fever Progress
    if (!isFeverActive) {
      setFeverProgress((prevFever) => {
        const nextFever = prevFever + (isSlice ? 10 : 8);
        if (nextFever >= 100) {
          const feverRank = playerState.talents?.fever_overdrive || 0;
          const feverDuration = 6 + getTalentValue('fever_overdrive', feverRank);
          setIsFeverActive(true);
          setFeverTimeLeft(feverDuration);
          soundManager.playFeverEnter();
          hapticManager.heavyTap();
          addFloatingText('🔥 ¡MODO FIEBRE! 🔥', clickX, clickY - 30, '#f59e0b');
          return 0;
        }
        return nextFever;
      });
    }

    // Process Star Type
    switch (star.type) {
      case 'normal': {
        const pts = Math.round(1 * totalMultiplier);
        setScore((s) => s + pts);
        matchStatsRef.current.normal += 1;
        if (!isPerfect && strokeCount <= 1) {
          soundManager.playComboChime(currentCombo);
        }
        hapticManager.lightTap();
        addStarBurstParticles(clickX, clickY, 'normal');
        addFloatingText(`+${pts} pt!`, clickX, clickY, '#facc15');
        break;
      }

      case 'golden': {
        const pts = Math.round(5 * totalMultiplier);
        setScore((s) => s + pts);
        matchStatsRef.current.golden += 1;
        soundManager.playTapGold();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'golden');
        addFloatingText(`+${pts} pts!`, clickX, clickY, '#fde047');
        break;
      }

      case 'diamond': {
        const pts = Math.round(20 * totalMultiplier);
        setScore((s) => s + pts);
        matchStatsRef.current.diamond += 1;
        soundManager.playTapDiamond();
        hapticManager.heavyTap();
        addStarBurstParticles(clickX, clickY, 'diamond');
        addFloatingText(`+${pts} pts!`, clickX, clickY, '#38bdf8');
        break;
      }

      case 'supernova': {
        const pts = Math.round(75 * totalMultiplier);
        setScore((s) => s + pts);
        soundManager.playSupernova();
        hapticManager.heavyTap();
        triggerShake();
        addStarBurstParticles(clickX, clickY, 'supernova');
        addFloatingText(`💥 ¡SUPERNOVA! +${pts}`, clickX, clickY, '#f43f5e');

        // Chain Reaction: Slices and collects all other stars on screen!
        setStars((currentActiveStars) => {
          const remainingOtherStars = currentActiveStars.filter((s) => s.id !== star.id && s.type !== 'bomb');
          if (remainingOtherStars.length > 0) {
            let chainPts = 0;
            remainingOtherStars.forEach((otherStar) => {
              const otherX = (otherStar.x / 100) * (rect?.width || 350);
              const otherY = (otherStar.y / 100) * (rect?.height || 500);
              addStarBurstParticles(otherX, otherY, otherStar.type);
              chainPts += otherStar.type === 'diamond' ? 20 : otherStar.type === 'golden' ? 5 : 2;
            });
            const bonusChain = Math.round(chainPts * totalMultiplier);
            setScore((s) => s + bonusChain);
            setTimeout(() => {
              addFloatingText(`⚡ ¡CADENA CÓSMICA! +${bonusChain}`, clickX, clickY - 40, '#a855f7');
            }, 100);
          }
          return currentActiveStars.filter((s) => s.id === star.id || s.type === 'bomb');
        });
        break;
      }

      case 'multiplier2': {
        setActiveMultiplier(2);
        setMultiplierTimeLeft(10);
        soundManager.playPowerup();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'multiplier2');
        addFloatingText('✨ MULTI x2! ✨', clickX, clickY, '#c084fc');
        break;
      }

      case 'multiplier5': {
        setActiveMultiplier(5);
        setMultiplierTimeLeft(8);
        soundManager.playPowerup();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'multiplier5');
        addFloatingText('🚀 MEGA x5! 🚀', clickX, clickY, '#f472b6');
        break;
      }

      case 'timeBonus': {
        setTimeLeft((t) => t + 3);
        soundManager.playPowerup();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'timeBonus');
        addFloatingText('+3 Segundos! ⏱️', clickX, clickY, '#34d399');
        break;
      }

      case 'shield': {
        setShieldCount((sc) => sc + 1);
        soundManager.playPowerup();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'shield');
        addFloatingText('+1 Escudo 🛡️', clickX, clickY, '#22d3ee');
        break;
      }

      case 'freeze': {
        setFreezeTimeLeft(5);
        soundManager.playPowerup();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'freeze');
        addFloatingText('❄️ Congelado 5s! ❄️', clickX, clickY, '#7dd3fc');
        break;
      }

      case 'magnet': {
        setMagnetTimeLeft(5);
        soundManager.playPowerup();
        hapticManager.heavyTap();
        addStarBurstParticles(clickX, clickY, 'golden');
        addFloatingText('🧲 ¡IMÁN ACTIVADO (5s)! 🧲', clickX, clickY, '#a855f7');
        break;
      }

      case 'rainbow': {
        const pts = Math.round(50 * totalMultiplier);
        setScore((s) => s + pts);
        soundManager.playTapDiamond();
        hapticManager.heavyTap();
        triggerShake();
        addStarBurstParticles(clickX, clickY, 'rainbow');
        addFloatingText(`+${pts} 🌈 SUPER BONUS!`, clickX, clickY, '#f472b6');
        break;
      }

      case 'bomb': {
        // Check if singularity shield talent activates
        const singularityRank = playerState.talents?.singularity_shield || 0;
        const defuseChance = getTalentValue('singularity_shield', singularityRank) / 100;
        if (defuseChance > 0 && Math.random() < defuseChance) {
          soundManager.playShieldBreak();
          hapticManager.mediumTap();
          addStarBurstParticles(clickX, clickY, 'shield');
          addFloatingText('🛡️ ¡Singularidad Desactivó Bomba!', clickX, clickY, '#a855f7');
          break;
        }

        // Check if shield active or Sparky Bot active
        if (shieldCount > 0) {
          setShieldCount((sc) => sc - 1);
          soundManager.playShieldBreak();
          hapticManager.mediumTap();
          addStarBurstParticles(clickX, clickY, 'shield');
          addFloatingText('🛡️ ¡Escudo Bloqueó Bomba!', clickX, clickY, '#22d3ee');
          break;
        }

        if (hasSparkyBotDefuse.current) {
          hasSparkyBotDefuse.current = false;
          soundManager.playTapGold();
          hapticManager.mediumTap();
          addStarBurstParticles(clickX, clickY, 'golden');
          addFloatingText('🤖 Robot Desactivó Bomba!', clickX, clickY, '#fbbf24');
          break;
        }

        // Bomb explodes!
        matchStatsRef.current.bombsHit += 1;
        setCombo(0);
        triggerShake();
        soundManager.playBombExplosion();
        soundManager.playLifeLost();
        hapticManager.bombExplosion();
        addBombExplosionParticles(clickX, clickY);

        setLives((l) => {
          const nextL = l - 1;
          if (nextL <= 0) soundManager.playGameOver();
          return Math.max(0, nextL);
        });

        if (gameMode !== 'endless') {
          setScore((s) => Math.max(0, s - 15));
          addFloatingText('💔 -1 CORAZÓN (-15) 💥', clickX, clickY, '#f87171');
        } else {
          addFloatingText('💔 -1 CORAZÓN 💥', clickX, clickY, '#f87171');
        }
        break;
      }
    }
  }, [
    isPlaying,
    isConfirmingExit,
    isPaused,
    matchCountdown,
    showReviveModal,
    combo,
    maxCombo,
    activeMultiplier,
    isFeverActive,
    shieldCount,
    gameMode,
    addStarBurstParticles,
    addParticles,
    addFloatingText,
    triggerShake,
    addBombExplosionParticles,
  ]);

  // Handle Tapping a Star Item
  const handleTapStar = (star: StarItem, e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;

    // Get exact pixel location on play area for particles & floating text
    const rect = playAreaRef.current?.getBoundingClientRect();
    let clickX = (star.x / 100) * (rect?.width || 350);
    let clickY = (star.y / 100) * (rect?.height || 500);

    if ('clientX' in e && rect) {
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    } else if ('touches' in e && (e as React.TouchEvent).touches?.[0] && rect) {
      clickX = (e as React.TouchEvent).touches[0].clientX - rect.left;
      clickY = (e as React.TouchEvent).touches[0].clientY - rect.top;
    }

    processStarHit(star, clickX, clickY, false, 1, 0);
  };

  // Pointer Down (Mouse / Touch) Event Handler for Slicing
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPlaying || isPaused || matchCountdown !== null || isConfirmingExit) return;
    const rect = playAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isSwipingRef.current = true;
    strokeSlicedStarsRef.current.clear();
    lastPointerPosRef.current = { x, y };
    const bladeColor = isFeverActive
      ? '#f59e0b'
      : playerState.equippedTheme === 'theme_vaporwave'
      ? '#f43f5e'
      : playerState.equippedTheme === 'theme_candy_world'
      ? '#ec4899'
      : '#38bdf8';
    bladePointsRef.current.push({ x, y, time: Date.now(), color: bladeColor });

    // Check direct star overlap on initial press
    stars.forEach((star) => {
      const starCenterX = (star.x / 100) * rect.width;
      const starCenterY = (star.y / 100) * rect.height;
      const starRadius = (star.size || 54) / 2;
      if (Math.hypot(x - starCenterX, y - starCenterY) <= starRadius * 1.05) {
        if (!strokeSlicedStarsRef.current.has(star.id)) {
          strokeSlicedStarsRef.current.add(star.id);
          processStarHit(star, x, y, false, 1, 0);
        }
      }
    });
  };

  // Pointer Move (Mouse / Touch) Event Handler for Blade Slicing
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSwipingRef.current || !isPlaying || isPaused || matchCountdown !== null) return;
    const rect = playAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const bladeColor = isFeverActive
      ? '#f59e0b'
      : playerState.equippedTheme === 'theme_vaporwave'
      ? '#f43f5e'
      : playerState.equippedTheme === 'theme_candy_world'
      ? '#ec4899'
      : '#38bdf8';
    bladePointsRef.current.push({ x, y, time: Date.now(), color: bladeColor });

    if (lastPointerPosRef.current) {
      const prev = lastPointerPosRef.current;
      const dx = x - prev.x;
      const dy = y - prev.y;
      const speed = Math.hypot(dx, dy);

      if (speed > 14) {
        soundManager.playSliceSwoosh();
      }

      // Check collision against all stars currently active
      stars.forEach((star) => {
        if (strokeSlicedStarsRef.current.has(star.id)) return;
        const starCenterX = (star.x / 100) * rect.width;
        const starCenterY = (star.y / 100) * rect.height;
        const starRadius = (star.size || 54) / 2;
        const dist = distToSegment(starCenterX, starCenterY, prev.x, prev.y, x, y);

        if (dist <= starRadius * 1.08) {
          strokeSlicedStarsRef.current.add(star.id);
          const strokeCount = strokeSlicedStarsRef.current.size;
          const sliceAngle = Math.atan2(dy, dx);

          // Add laser slice cut effect across the sliced star
          sliceArcsRef.current.push({
            id: `arc_${Date.now()}_${Math.random()}`,
            x1: starCenterX - Math.cos(sliceAngle) * starRadius * 1.4,
            y1: starCenterY - Math.sin(sliceAngle) * starRadius * 1.4,
            x2: starCenterX + Math.cos(sliceAngle) * starRadius * 1.4,
            y2: starCenterY + Math.sin(sliceAngle) * starRadius * 1.4,
            color: star.type === 'supernova' ? '#f43f5e' : star.type === 'diamond' ? '#38bdf8' : '#facc15',
            createdAt: Date.now(),
            duration: 180,
          });

          processStarHit(star, starCenterX, starCenterY, true, strokeCount, sliceAngle);
        }
      });
    }

    lastPointerPosRef.current = { x, y };
  };

  // Pointer Up / Cancel Event Handler
  const handlePointerUp = () => {
    isSwipingRef.current = false;
    lastPointerPosRef.current = null;
    strokeSlicedStarsRef.current.clear();
  };

  // Get current Star Skin Icon / Color & Motion Trail Styles
  const getStarStyle = (type: StarType) => {
    switch (type) {
      case 'normal':
        return {
          icon: '⭐',
          bg: 'from-amber-400 to-yellow-300',
          ring: 'ring-amber-300/60',
          trailFrom: 'rgba(251, 191, 36, 0.65)',
          glowColor: 'rgba(250, 204, 21, 0.5)',
          shadowColor: 'rgba(245, 158, 11, 0.4)',
        };
      case 'golden':
        return {
          icon: '🌟',
          bg: 'from-yellow-300 via-amber-400 to-orange-500',
          ring: 'ring-yellow-200 animate-pulse',
          trailFrom: 'rgba(245, 158, 11, 0.85)',
          glowColor: 'rgba(253, 224, 71, 0.7)',
          shadowColor: 'rgba(217, 119, 6, 0.6)',
        };
      case 'diamond':
        return {
          icon: '💎',
          bg: 'from-cyan-400 via-blue-500 to-indigo-600',
          ring: 'ring-cyan-300 animate-pulse',
          trailFrom: 'rgba(56, 189, 248, 0.85)',
          glowColor: 'rgba(96, 165, 250, 0.7)',
          shadowColor: 'rgba(37, 99, 235, 0.6)',
        };
      case 'supernova':
        return {
          icon: '💥',
          bg: 'from-yellow-300 via-rose-500 to-purple-600',
          ring: 'ring-white animate-spin',
          trailFrom: 'rgba(244, 63, 94, 0.9)',
          glowColor: 'rgba(251, 191, 36, 0.85)',
          shadowColor: 'rgba(244, 63, 94, 0.75)',
        };
      case 'bomb':
        return {
          icon: '❌',
          bg: 'from-red-600 via-rose-700 to-black',
          ring: 'ring-red-500 animate-pulse',
          trailFrom: 'rgba(225, 29, 72, 0.8)',
          glowColor: 'rgba(239, 68, 68, 0.6)',
          shadowColor: 'rgba(159, 18, 57, 0.6)',
        };
      case 'multiplier2':
        return {
          icon: '✨',
          bg: 'from-purple-500 to-pink-500',
          ring: 'ring-purple-300',
          trailFrom: 'rgba(192, 132, 252, 0.8)',
          glowColor: 'rgba(232, 121, 249, 0.6)',
          shadowColor: 'rgba(168, 85, 247, 0.5)',
        };
      case 'multiplier5':
        return {
          icon: '🚀',
          bg: 'from-fuchsia-600 to-pink-600',
          ring: 'ring-fuchsia-300',
          trailFrom: 'rgba(232, 121, 249, 0.85)',
          glowColor: 'rgba(244, 114, 182, 0.7)',
          shadowColor: 'rgba(217, 70, 239, 0.6)',
        };
      case 'timeBonus':
        return {
          icon: '⏱️',
          bg: 'from-emerald-500 to-teal-400',
          ring: 'ring-emerald-300',
          trailFrom: 'rgba(52, 211, 153, 0.8)',
          glowColor: 'rgba(16, 185, 129, 0.6)',
          shadowColor: 'rgba(5, 150, 105, 0.5)',
        };
      case 'shield':
        return {
          icon: '🛡️',
          bg: 'from-cyan-500 to-sky-400',
          ring: 'ring-cyan-300',
          trailFrom: 'rgba(34, 211, 238, 0.8)',
          glowColor: 'rgba(56, 189, 248, 0.6)',
          shadowColor: 'rgba(14, 165, 233, 0.5)',
        };
      case 'freeze':
        return {
          icon: '❄️',
          bg: 'from-sky-400 to-blue-600',
          ring: 'ring-sky-200',
          trailFrom: 'rgba(125, 211, 252, 0.8)',
          glowColor: 'rgba(186, 230, 253, 0.7)',
          shadowColor: 'rgba(2, 132, 199, 0.5)',
        };
      case 'magnet':
        return {
          icon: '🧲',
          bg: 'from-purple-600 via-fuchsia-500 to-indigo-600',
          ring: 'ring-fuchsia-300 animate-pulse',
          trailFrom: 'rgba(168, 85, 247, 0.85)',
          glowColor: 'rgba(217, 70, 239, 0.6)',
          shadowColor: 'rgba(147, 51, 234, 0.5)',
        };
      case 'rainbow':
        return {
          icon: '🌈',
          bg: 'from-pink-500 via-yellow-400 to-cyan-400',
          ring: 'ring-white animate-spin',
          trailFrom: 'rgba(244, 114, 182, 0.9)',
          glowColor: 'rgba(250, 204, 21, 0.8)',
          shadowColor: 'rgba(236, 72, 153, 0.7)',
        };
      default:
        return {
          icon: '⭐',
          bg: 'from-amber-400 to-yellow-300',
          ring: 'ring-amber-300',
          trailFrom: 'rgba(251, 191, 36, 0.6)',
          glowColor: 'rgba(250, 204, 21, 0.5)',
          shadowColor: 'rgba(245, 158, 11, 0.4)',
        };
    }
  };

  // Interactive 3D Celestial Star Tap on Home Screen
  const handleHomeStarTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playTapGold();
    hapticManager.lightTap();
    setHomeStarBooped(true);
    setTimeout(() => setHomeStarBooped(false), 500);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const parentRect = playAreaRef.current?.getBoundingClientRect() || rect;
    if (floatingTextsRef.current) {
      floatingTextsRef.current.push({
        id: `star_${Date.now()}_${Math.random()}`,
        text: '⭐ ¡TAP!',
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top,
        color: '#fde047',
        createdAt: Date.now(),
      });
    }
  };

  return (
    <div
      ref={boardRef}
      className={`relative w-full h-full flex flex-col justify-between select-none overflow-hidden ${
        screenShake ? 'animate-screen-shake' : ''
      }`}
    >
      {/* Top Game HUD Bar - ONLY visible during active gameplay */}
      {isPlaying && (
        <>
          {multiplayerOpponent ? (
            <MultiplayerBattleHUD
              playerScore={score}
              playerCombo={combo}
              playerState={playerState}
              opponent={multiplayerOpponent}
              opponentScore={opponentLiveScore}
              opponentCombo={opponentLiveCombo}
              opponentEvent={opponentEvent}
              activeEmotes={activeEmotes}
              onSendEmote={handleSendEmote}
              language={playerState.language || 'es'}
            />
          ) : (
            <div className="relative z-30 w-full flex flex-col shrink-0">
              {/* Top Title Bar with Back Button and "Star ⭐ Tap" Logo */}
              <div className="w-full px-4 pt-2.5 pb-1 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setIsPaused(true);
                    if (playerState.hapticsEnabled) hapticManager.lightTap();
                  }}
                  className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md cursor-pointer"
                  title="Volver / Pausa"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-200" />
                </button>

                <div className="flex items-center gap-1.5 font-black text-2xl sm:text-3xl tracking-wide select-none">
                  <span className="bg-gradient-to-r from-pink-300 via-purple-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(236,72,153,0.5)]">
                    Star
                  </span>
                  <span className="text-xl sm:text-2xl animate-bounce drop-shadow-[0_0_8px_#fde047]">
                    ⭐
                  </span>
                  <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(56,189,248,0.5)]">
                    Tap
                  </span>
                </div>

                <div className="w-10" />
              </div>

              {/* Unified High-Fidelity Neon HUD Box (exact match to screenshot) */}
              <div className="mx-3 sm:mx-4 my-1.5 px-4 py-2.5 rounded-2xl sm:rounded-3xl border-2 border-indigo-400/90 shadow-[0_0_20px_rgba(99,102,241,0.6)] bg-gradient-to-r from-indigo-950/85 via-slate-950/90 to-indigo-950/85 backdrop-blur-md flex items-center justify-between">
                {/* Left: 3D Glossy Red Hearts (or Mode Specific Indicator) */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((heartIndex) => (
                    <GlossyRedHeart
                      key={heartIndex}
                      active={heartIndex <= lives}
                      size={28}
                    />
                  ))}
                  {gameMode === 'blitz' && (
                    <span className={`ml-2 font-mono text-xs font-black px-2 py-0.5 rounded-full border ${
                      timeLeft <= 10 ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse' : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                    }`}>
                      ⏱ {timeLeft}s
                    </span>
                  )}
                  {gameMode === 'endless' && (
                    <span className="ml-2 font-mono text-xs font-black px-2 py-0.5 rounded-full border bg-amber-950/60 border-amber-500/40 text-amber-300">
                      ⏱ {matchElapsedSeconds}s
                    </span>
                  )}
                  {gameMode === 'campaign' && campaignLevel && (
                    <span className="ml-2 font-mono text-xs font-black px-2 py-0.5 rounded-full border bg-purple-950/60 border-purple-500/40 text-purple-300">
                      ⏱ {timeLeft}s
                    </span>
                  )}
                  {/* Dynamic Threat Level / Peligro Indicator badge */}
                  {gameMode !== 'zen' && threatLevel > 1 && (
                    <span className={`ml-1 font-mono text-[10px] font-black px-1.5 py-0.5 rounded-md border flex items-center gap-0.5 ${
                      threatLevel === 4
                        ? 'bg-red-500/30 border-red-400 text-red-200 animate-pulse'
                        : threatLevel === 3
                        ? 'bg-orange-500/25 border-orange-400 text-orange-200'
                        : 'bg-amber-500/20 border-amber-400 text-amber-200'
                    }`}>
                      {threatLevel === 4 ? '⚡ Nv.4' : threatLevel === 3 ? '🔥 Nv.3' : '⚠️ Nv.2'}
                    </span>
                  )}
                </div>

                {/* Center: Large Clean Score (1,480) */}
                <div className="flex flex-col items-center">
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider drop-shadow-[0_2px_10px_rgba(255,255,255,0.45)]">
                    {score.toLocaleString()}
                  </div>
                  {activeMultiplier > 1 && (
                    <span className="text-[10px] font-black text-pink-300 uppercase tracking-wider animate-pulse">
                      x{activeMultiplier} MULTI ({multiplierTimeLeft}s)
                    </span>
                  )}
                </div>

                {/* Right: Glowing Cyan Starburst COMBO Badge */}
                <div className="flex flex-col items-center justify-center bg-cyan-500/20 border border-cyan-400/60 shadow-[0_0_20px_#38bdf8] rounded-2xl px-3 py-1 min-w-[72px]">
                  <span className="text-[10px] font-black tracking-widest text-cyan-200 uppercase">
                    COMBO
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow-[0_0_10px_#fde047] font-mono leading-tight">
                    x{combo > 0 ? combo : 1}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fever Meter Bar (Under Top HUD) */}
          <div className="relative z-20 w-full h-1.5 bg-slate-900/60 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFeverActive
                  ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-300'
              }`}
              style={{ width: isFeverActive ? `${(feverTimeLeft / 6) * 100}%` : `${feverProgress}%` }}
            />
          </div>
        </>
      )}

      {/* Ghost Rival Progress Bar (Modo Duelo HUD) */}
      {gameMode === 'duel' && duelGhostRival && isPlaying && (
        <div className="relative z-20 w-full px-4 py-2 bg-gradient-to-r from-purple-950/90 via-slate-950/95 to-pink-950/90 border-b border-purple-500/30 flex items-center justify-between text-xs text-white shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900 border border-purple-400 flex items-center justify-center text-base shadow animate-pulse">
              👻
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 font-bold text-purple-200 text-xs">
                <span>{t('ghostRival', playerState.language || 'es')}: {duelGhostRival.name}</span>
                <span>{duelGhostRival.avatar}</span>
              </div>
              <span className="text-[10px] text-purple-300 font-medium">
                {t('ghostGoal', playerState.language || 'es')}: {duelGhostRival.score.toLocaleString()} {t('pts', playerState.language || 'es')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {score >= duelGhostRival.score ? (
              <span className="font-extrabold text-xs text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-xl border border-emerald-500/50 shadow-md animate-bounce">
                {t('leadingInDuel', playerState.language || 'es')} (+{(score - duelGhostRival.score).toLocaleString()} {t('pts', playerState.language || 'es')})!
              </span>
            ) : (
              <span className="font-bold text-xs text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-500/40 shadow-sm">
                {t('trailingInDuel', playerState.language || 'es')} {(duelGhostRival.score - score).toLocaleString()} {t('pts', playerState.language || 'es')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Campaign Objectives HUD Banner */}
      {gameMode === 'campaign' && campaignLevel && isPlaying && (
        <div className="relative z-20 w-full px-3.5 py-1.5 bg-gradient-to-r from-amber-950/90 via-slate-950/95 to-purple-950/90 border-b border-amber-500/40 flex items-center justify-between text-xs text-white shadow-xl animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-sm shadow">
              🗺️
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-amber-300 text-xs">
                {playerState.language === 'en' ? (campaignLevel.nameEn || campaignLevel.name) : campaignLevel.name}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-slate-300">
                {campaignLevel.noBombsAllowed && (
                  <span className={matchStatsRef.current.bombsHit === 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {matchStatsRef.current.bombsHit === 0 ? '✓ Sin bombas' : '✗ Bomba pisada'}
                  </span>
                )}
                {campaignLevel.targetCombo && (
                  <span className={maxCombo >= campaignLevel.targetCombo ? 'text-yellow-400 font-bold' : 'text-slate-300'}>
                    ⚡ Combo: {maxCombo}/{campaignLevel.targetCombo}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3].map((s) => {
              const req = campaignLevel.starRequirements[s - 1];
              const isMet = score >= req;
              return (
                <div
                  key={s}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 border transition-all ${
                    isMet
                      ? 'bg-amber-400 text-slate-950 border-yellow-200 shadow-md shadow-amber-400/30 animate-pulse scale-105'
                      : 'bg-slate-900/80 text-slate-500 border-slate-800'
                  }`}
                  title={`${req} pts`}
                >
                  <span>⭐</span>
                  <span>{req}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Playfield Container Frame (matching reference screenshot) */}
      <div className={`relative flex-1 flex flex-col overflow-hidden transition-all ${
        isPlaying ? 'mx-3 sm:mx-4 mb-2 rounded-[2rem] border-2 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.35)] bg-[#0a0720]' : 'w-full h-full'
      }`}>
        {/* Upper Section: Golden Star & Progress Capsule Bar (from screenshot) */}
        {isPlaying && (
          <div className="relative z-20 w-full px-4 pt-3 pb-1 flex items-center gap-2.5">
            <GoldenCapsuleStar size={34} />
            <div className="relative flex-1 h-6 sm:h-7 rounded-full bg-slate-950/90 border-2 border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.35)] overflow-hidden flex items-center p-0.5">
              {/* Luminous Glow Fill Bar */}
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-[0_0_18px_rgba(245,158,11,0.9)] transition-all duration-300 rounded-full relative overflow-hidden"
                style={{ width: `${calculatedProgress}%` }}
              >
                {/* Specular Upper Glass Reflection Highlight */}
                <div className="absolute top-0 inset-x-1 h-1/2 bg-gradient-to-b from-white/50 to-transparent rounded-t-full pointer-events-none" />
              </div>
              {/* Central Crisp Percentage Indicator */}
              <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] font-mono tracking-wider select-none">
                {calculatedProgress}%
              </span>
            </div>
          </div>
        )}

        {/* Active Game Field - Spawning Stars Area */}
        <div
          ref={playAreaRef}
          className="relative flex-1 w-full h-full overflow-hidden select-none touch-none"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
        {/* Particle & Slicing Blade Canvas Layer directly aligned with playfield coordinate system */}
        <ArcadeCanvas
          particlesRef={particlesRef}
          floatingTextsRef={floatingTextsRef}
          bladePointsRef={bladePointsRef}
          sliceArcsRef={sliceArcsRef}
        />

        {/* Danger Edge Vignette Pulse during final 10s of Blitz */}
        {isPlaying && gameMode === 'blitz' && timeLeft <= 10 && (
          <div className="absolute inset-0 z-10 pointer-events-none animate-danger-vignette" />
        )}

        {/* Pre-Game Start Screen Prompt if not actively playing */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain bg-slate-950/75 backdrop-blur-md text-center safe-pb">
            {/* 1. Top 3 Shortcuts: Ruleta Cósmica, Pase Cósmico, Tienda */}
            <MainMenuTopShortcuts
              playerState={playerState}
              onOpenLuckySpin={onOpenLuckySpin}
              hasFreeLuckySpin={hasFreeLuckySpin}
              onOpenCosmicPass={onOpenCosmicPass}
              onOpenShop={onOpenShop}
            />

            {/* Bento Grid Header Card - Redesigned to match Google Play Store Home Artwork */}
            <div className="aaa-glass-cyber p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] max-w-sm w-full flex flex-col items-center relative overflow-hidden animate-fade-in shrink-0 my-auto border border-cyan-500/40 ring-1 ring-amber-400/20">
              {/* Holographic Top Laser Accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-shimmer" />

              {/* AAA Corner Telemetry Brackets */}
              <div className="aaa-hud-corner-tl text-cyan-400/80" />
              <div className="aaa-hud-corner-tr text-cyan-400/80" />
              <div className="aaa-hud-corner-bl text-cyan-400/80" />
              <div className="aaa-hud-corner-br text-cyan-400/80" />

              {/* Top Telemetry Header Tag */}
              <div className="flex items-center gap-2 mb-2 px-3 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 tracking-widest uppercase shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>STAR TAP ARCADE // SISTEMA LISTO</span>
              </div>
              
              {/* 3D WebGL Celestial Star Centerpiece - Studio Grade Quality */}
              <div className="relative mb-2 mt-0.5 flex items-center justify-center">
                {/* Concentric Glowing Energy Rings */}
                <div className="absolute w-28 h-28 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-400/35 to-purple-500/25 blur-xl animate-pulse" />

                {/* Real-time WebGL 3D Rotating & Interactive Star */}
                <ThreeHeroStarCanvas
                  type={gameMode === 'duel' ? 'supernova' : 'golden'}
                  isBooped={homeStarBooped}
                  onTap={handleHomeStarTap}
                  className="w-24 h-24 sm:w-28 sm:h-28"
                />

                {/* Sparkling Glints */}
                <Sparkles className="absolute -top-1 -right-2 w-6 h-6 text-yellow-200 animate-spin z-20 drop-shadow-[0_0_10px_rgba(253,224,71,0.9)] pointer-events-none" style={{ animationDuration: '6s' }} />
                <Sparkles className="absolute -bottom-1 -left-2 w-4 h-4 text-cyan-300 animate-pulse z-20 drop-shadow-[0_0_6px_rgba(56,189,248,0.8)] pointer-events-none" />
              </div>

              {/* Title with Gold Holographic Gradient */}
              <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 mb-1 tracking-tight drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)] uppercase">
                {gameMode === 'duel' ? t('duelTitleOverlay', playerState.language || 'es') : t('arcadeTitle', playerState.language || 'es')}
              </h2>

              {/* Mode Description Banner */}
              <p className="text-slate-300 text-[11px] sm:text-xs mb-2.5 font-medium leading-tight bg-slate-950/90 py-2 px-3 rounded-2xl border border-slate-800/90 w-full shadow-inner text-center">
                {gameMode === 'blitz' && t('blitzDesc', playerState.language || 'es')}
                {gameMode === 'endless' && t('endlessDesc', playerState.language || 'es')}
                {gameMode === 'fever' && t('feverDesc', playerState.language || 'es')}
                {gameMode === 'zen' && t('zenDesc', playerState.language || 'es')}
                {gameMode === 'duel' && t('duelDesc', playerState.language || 'es')}
              </p>

              {/* Quick Game Mode Selector Bar (Directly accessible pills as in Google Play Home) */}
              {setGameMode && (
                <div className="w-full flex items-center justify-between gap-1 mb-2.5 p-1 bg-slate-950/90 rounded-2xl border border-cyan-500/20 shadow-inner">
                  {[
                    { id: 'blitz' as GameMode, label: 'Blitz', icon: '⏱️' },
                    { id: 'endless' as GameMode, label: 'Vidas', icon: '❤️' },
                    { id: 'fever' as GameMode, label: 'Fiebre', icon: '🔥' },
                    { id: 'duel' as GameMode, label: 'Duelo', icon: '⚔️' },
                    { id: 'zen' as GameMode, label: 'Zen', icon: '🧘' },
                  ].map((m) => {
                    const isSelected = gameMode === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          soundManager.playButtonClick();
                          hapticManager.mediumTap();
                          setGameMode(m.id);
                        }}
                        className={`flex-1 py-1 sm:py-1.5 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.6)] border border-yellow-200 scale-102'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                        }`}
                        title={m.label}
                      >
                        <span className="text-xs leading-none">{m.icon}</span>
                        <span className="truncate leading-none">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Player Stats Record Badge */}
              <div className="w-full mb-2.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-950/60 via-slate-950/95 to-slate-950/90 rounded-2xl border border-amber-500/40 flex items-center justify-between text-xs shadow-inner">
                <div className="flex items-center gap-2 text-slate-300 font-black text-[11px] sm:text-xs">
                  <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                  <span className="uppercase tracking-wider text-[10px] text-amber-200">RÉCORD HISTÓRICO:</span>
                </div>
                <span className="font-black text-amber-300 text-xs sm:text-sm font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
                  {playerState.stats.highestScore.toLocaleString()} pts
                </span>
              </div>

              {/* Ghost Target Card in Duel Mode */}
              {gameMode === 'duel' && (
                <div className="w-full mb-2.5 p-2.5 bg-gradient-to-r from-purple-950/80 to-slate-950/90 rounded-2xl border border-purple-500/50 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-900/90 border border-purple-400 flex items-center justify-center text-lg shadow-lg">
                      {duelGhostRival ? duelGhostRival.avatar : '👻'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider">{t('ghostRival', playerState.language || 'es')}</span>
                      <span className="font-bold text-xs text-white truncate max-w-[110px]">
                        {duelGhostRival ? duelGhostRival.name : 'Fantasma Global'}
                      </span>
                      <span className="text-[9px] text-cyan-400 font-mono font-black">
                        {duelGhostRival ? `${duelGhostRival.score.toLocaleString()} ${t('pts', playerState.language || 'es')}` : `0 ${t('pts', playerState.language || 'es')}`}
                      </span>
                    </div>
                  </div>

                  {onSelectDuelRival && (
                    <button
                      onClick={onSelectDuelRival}
                      className="px-2.5 py-1.5 bg-purple-950 hover:bg-purple-900 text-purple-200 font-black text-[10px] rounded-xl border border-purple-400/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{t('changeRival', playerState.language || 'es')}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Massive Radiant 3D Keycap Action Button "¡JUGAR! / PLAY NOW" */}
              <div className="w-full flex items-center gap-2 pt-1">
                <button
                  data-tutorial="play-button"
                  onClick={onStartGame}
                  className="relative group w-full py-3.5 sm:py-4 px-4 bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 hover:from-yellow-200 hover:via-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2.5 shadow-[0_6px_0_#b45309,0_16px_30px_rgba(245,158,11,0.5)] hover:shadow-[0_6px_0_#b45309,0_20px_40px_rgba(245,158,11,0.7)] border-t border-yellow-100 transition-all active:translate-y-[4px] active:shadow-[0_2px_0_#b45309,0_6px_15px_rgba(245,158,11,0.35)] cursor-pointer overflow-hidden uppercase"
                >
                  {/* Specular Top Sheen Highlight */}
                  <div className="absolute top-0 inset-x-2 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-xl pointer-events-none" />

                  {/* Shimmer Wave Across Button */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                  {gameMode === 'duel' ? (
                    <Swords className="w-5 h-5 fill-slate-950 stroke-[2.5] drop-shadow-sm shrink-0" />
                  ) : (
                    <Zap className="w-5 h-5 fill-slate-950 stroke-[2.5] drop-shadow-sm shrink-0 animate-bounce" />
                  )}
                  <div className="flex flex-col items-center leading-none">
                    <span className="font-black text-sm sm:text-base tracking-widest drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]">
                      {gameMode === 'duel' ? t('startDuelGame', playerState.language || 'es') : '¡JUGAR AHORA!'}
                    </span>
                    <span className="text-[9px] font-extrabold text-amber-950 tracking-wider mt-0.5 opacity-90">
                      {gameMode === 'blitz' && '60s CONTRA RELOJ'}
                      {gameMode === 'endless' && '3 VIDAS • ESQUIVA BOMBAS'}
                      {gameMode === 'fever' && 'RITMO RÁPIDO & COMBOS'}
                      {gameMode === 'zen' && 'PRÁCTICA SIN LÍMITES'}
                      {gameMode === 'duel' && 'DESAFÍO GLOBAL 1v1'}
                    </span>
                  </div>
                </button>
              </div>

              {/* Mode Selector Overlay Popup */}
              {isModeSelectorOpen && setGameMode && (
                <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md rounded-[2rem] sm:rounded-[2.5rem] p-4 flex flex-col justify-between animate-fade-in border border-amber-500/40 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-xs text-white uppercase tracking-wider">
                        {t('chooseGameModeTitle', playerState.language || 'es')}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setIsModeSelectorOpen(false);
                      }}
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2 my-2 overflow-y-auto max-h-[240px] pr-1">
                    {[
                      {
                        id: 'blitz' as GameMode,
                        name: 'Contra Reloj (60s)',
                        desc: '60s para máxima puntuación',
                        icon: <Clock className="w-4 h-4 text-cyan-400" />,
                        bg: 'bg-cyan-500/10 border-cyan-500/20',
                      },
                      {
                        id: 'endless' as GameMode,
                        name: 'Supervivencia (3 Vidas)',
                        desc: 'Esquiva bombas y no dejes caer estrellas',
                        icon: <Heart className="w-4 h-4 text-rose-400" />,
                        bg: 'bg-rose-500/10 border-rose-500/20',
                      },
                      {
                        id: 'fever' as GameMode,
                        name: 'Modo Fiebre',
                        desc: 'Combos rápidos para ritmo extremo',
                        icon: <Flame className="w-4 h-4 text-amber-400" />,
                        bg: 'bg-amber-500/10 border-amber-500/20',
                      },
                      {
                        id: 'zen' as GameMode,
                        name: 'Práctica Zen',
                        desc: 'Sin tiempo ni bombas: relajante',
                        icon: <Smile className="w-4 h-4 text-emerald-400" />,
                        bg: 'bg-emerald-500/10 border-emerald-500/20',
                      },
                      {
                        id: 'duel' as GameMode,
                        name: 'Modo Duelo Fantasma',
                        desc: 'Desafía récords de jugadores globales',
                        icon: <Swords className="w-4 h-4 text-purple-400" />,
                        bg: 'bg-purple-500/10 border-purple-500/20',
                      },
                    ].map((m) => {
                      const isSelected = gameMode === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => {
                            soundManager.playButtonClick();
                            hapticManager.mediumTap();
                            setGameMode(m.id);
                            setIsModeSelectorOpen(false);
                          }}
                          className={`w-full p-2 sm:p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-md scale-102'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 sm:p-2 rounded-xl border ${m.bg}`}>
                              {m.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-extrabold text-xs text-white">{m.name}</span>
                              <span className="text-[10px] text-slate-400">{m.desc}</span>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playButtonClick();
                      setIsModeSelectorOpen(false);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow border border-yellow-200/50 uppercase tracking-wider cursor-pointer"
                  >
                    LISTO
                  </button>
                </div>
              )}
            </div>

            {/* 2. Bottom 3 Shortcuts: Campaña, Arena 1v1, Misiones */}
            <MainMenuBottomShortcuts
              playerState={playerState}
              onOpenCampaign={onOpenCampaign}
              onOpenMultiplayer={onOpenMultiplayerLobby}
              onOpenQuests={onOpenQuests}
              hasUnclaimedQuests={hasUnclaimedQuests}
              hasUnclaimedDailyReward={hasUnclaimedDailyReward}
            />

            {/* Discrete Game Tip Banner at bottom of Start Screen */}
            <GameTipBanner
              lang={playerState.language || 'es'}
              className="mt-2 sm:mt-2.5 mb-2 animate-fade-in shrink-0"
            />
          </div>
        )}

        {/* Center Magnetic Aura when Magnet active */}
        {isPlaying && magnetTimeLeft > 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border-2 border-purple-400/40 bg-purple-500/10 animate-ping" />
            <div className="absolute w-36 h-36 rounded-full border border-fuchsia-300/60 bg-fuchsia-500/20 animate-spin" />
            <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-3xl shadow-xl shadow-purple-500/50 animate-pulse border border-purple-200">
              🧲
            </div>
          </div>
        )}

        {/* Render Spawning Stars with High-Fidelity 3D Celestial Graphics */}
        {isPlaying &&
          stars.map((star) => (
            <StarItemRenderer
              key={star.id}
              star={star}
              isTapped={tappedStarsSetRef.current.has(star.id)}
              onTap={handleTapStar}
            />
          ))}
      </div>

      {/* Bottom In-Game Controls Bar (Pause, Sound, and Star Power Button) */}
      {isPlaying && (
        <div className="relative z-30 w-full px-4 py-3 flex items-center justify-between pointer-events-auto bg-slate-950/70 backdrop-blur-md border-t border-purple-500/30 rounded-b-[1.8rem] shrink-0">
          {/* Left: Circular Pause & Sound Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setIsPaused(true);
                if (playerState.hapticsEnabled) hapticManager.lightTap();
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950 border-2 border-cyan-300 shadow-[0_0_16px_rgba(56,189,248,0.6)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Pausa"
            >
              <Pause className="w-5 h-5 fill-white text-white drop-shadow" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onToggleSound) {
                  onToggleSound();
                } else {
                  soundManager.setMuted(!soundManager.getMuted());
                }
                if (playerState.hapticsEnabled) hapticManager.lightTap();
              }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950 border-2 border-cyan-300 shadow-[0_0_16px_rgba(56,189,248,0.6)] flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Sonido"
            >
              {playerState.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-white drop-shadow" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400 drop-shadow" />
              )}
            </button>
          </div>

          {/* Right: Star Ability / Power Button */}
          <button
            type="button"
            onClick={activateMagnet}
            disabled={magnetCharges <= 0 || magnetTimeLeft > 0}
            className={`px-5 py-2.5 rounded-full border-2 transition-all flex items-center gap-2 font-black text-sm active:scale-95 cursor-pointer shadow-lg select-none ${
              magnetTimeLeft > 0
                ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 border-yellow-200 text-white animate-pulse shadow-[0_0_20px_rgba(236,72,153,0.7)]'
                : magnetCharges > 0
                ? 'bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950 border-cyan-300 text-white shadow-[0_0_18px_rgba(56,189,248,0.6)] hover:scale-105'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 opacity-60 cursor-not-allowed'
            }`}
            title="Poder Estelar"
          >
            <span className="text-xl animate-bounce drop-shadow-[0_0_8px_#fde047]">⭐</span>
            <span className="tracking-wide text-xs sm:text-sm font-black">
              {magnetTimeLeft > 0 ? `${magnetTimeLeft}s` : 'PODER'}
            </span>
          </button>
        </div>
      )}
    </div>

      {/* Exit Match Confirmation Dialog */}
      {isConfirmingExit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
          <div className="relative w-full max-w-sm bg-slate-900/95 border-2 border-amber-500/50 rounded-[2rem] p-5 sm:p-6 shadow-2xl text-white text-center flex flex-col items-center gap-4 animate-scale-up">
            {/* Ambient Glow Aura */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-xl">
              <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-white tracking-tight drop-shadow">
                {t('exitMatchTitle', playerState.language || 'es')}
              </h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                {t('exitMatchMessage', playerState.language || 'es')}
              </p>
            </div>

            {/* Current Score Summary */}
            <div className="w-full bg-slate-950/90 px-4 py-2.5 rounded-2xl border border-amber-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                {t('currentScoreLabel', playerState.language || 'es')}
              </span>
              <span className="text-amber-300 font-mono font-black text-sm">
                {score.toLocaleString()} {t('pts', playerState.language || 'es')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setIsConfirmingExit(false);
                  if (playerState.hapticsEnabled) hapticManager.lightTap();
                }}
                className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all hover:brightness-110 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('resumeGame', playerState.language || 'es')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setIsConfirmingExit(false);
                  onGameOver(score, { ...matchStatsRef.current });
                }}
                className="py-3 px-3 rounded-2xl bg-slate-950 hover:bg-rose-950/80 text-rose-300 hover:text-rose-100 border border-rose-500/40 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{t('confirmExit', playerState.language || 'es')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-Game Active Pause Modal */}
      {isPaused && (
        <InGamePauseModal
          score={score}
          combo={combo}
          maxCombo={maxCombo}
          starsTapped={matchStatsRef.current.starsTapped}
          diamondTapped={matchStatsRef.current.diamond}
          soundEnabled={playerState.soundEnabled}
          hapticsEnabled={playerState.hapticsEnabled}
          language={playerState.language || 'es'}
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            resetMatch();
            setMatchCountdown(3);
            soundManager.playCountdownTick();
            setTimeout(() => {
              setMatchCountdown(2);
              soundManager.playCountdownTick();
            }, 900);
            setTimeout(() => {
              setMatchCountdown(1);
              soundManager.playCountdownTick();
            }, 1800);
            setTimeout(() => {
              setMatchCountdown(0);
              soundManager.playCountdownGo();
            }, 2700);
            setTimeout(() => {
              setMatchCountdown(null);
            }, 3400);
          }}
          onExit={() => {
            setIsPaused(false);
            onGameOver(score, { ...matchStatsRef.current });
          }}
          onToggleSound={onToggleSound || (() => {})}
          onToggleHaptics={onToggleHaptics || (() => {})}
        />
      )}

      {/* Second Chance Revive Modal */}
      {showReviveModal && (
        <ReviveModal
          score={score}
          gameMode={gameMode}
          userCoins={playerState.coins}
          language={playerState.language || 'es'}
          onReviveWithAd={handleReviveWithAd}
          onReviveWithCoins={handleReviveWithCoins}
          onSkip={handleSkipRevive}
        />
      )}

      {/* Pro Match Start Cinematic Countdown Overlay (3, 2, 1, ¡A JUGAR!) */}
      {matchCountdown !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in pointer-events-none select-none">
          <div className="flex flex-col items-center justify-center text-center animate-scale-up">
            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-orange-500 flex items-center justify-center text-6xl font-black text-slate-950 shadow-[0_0_80px_rgba(245,158,11,0.6)] border-4 border-yellow-200 animate-bounce">
              {matchCountdown === 0 ? '🚀' : matchCountdown}
            </div>
            <div className="mt-4 text-3xl sm:text-4xl font-black text-white tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] uppercase">
              {matchCountdown === 0 ? (playerState.language === 'en' ? 'LET\'S PLAY!' : '¡A JUGAR!') : (playerState.language === 'en' ? 'READY...' : '¡LISTOS...!')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
