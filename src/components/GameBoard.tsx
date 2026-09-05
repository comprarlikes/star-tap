import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Heart, Shield, Zap, Sparkles, AlertTriangle, Swords, Ghost, Users, Trophy, Gamepad2, X, Check, Clock, Flame, Smile, LogOut, Pause } from 'lucide-react';
import { t } from '../i18n';

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
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
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

  // Report live progress during gameplay for real-time achievement checking
  useEffect(() => {
    if (isPlaying) {
      onLiveProgress?.({
        score,
        combo,
        starsTapped: matchStatsRef.current.starsTapped,
        diamond: matchStatsRef.current.diamond,
        golden: matchStatsRef.current.golden,
      });
    }
  }, [score, combo, isPlaying, onLiveProgress]);

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
      if (rand < 0.14 + luckyBonus) {
        type = 'bomb';
      } else if (rand < 0.33 + luckyBonus) {
        type = 'golden';
      } else if (rand < 0.43 + luckyBonus) {
        type = 'diamond';
      } else if (rand < 0.50) {
        type = 'multiplier2';
      } else if (rand < 0.55) {
        type = 'multiplier5';
      } else if (rand < 0.60) {
        type = 'timeBonus';
      } else if (rand < 0.65) {
        type = 'shield';
      } else if (rand < 0.70) {
        type = 'freeze';
      } else if (rand < 0.74) {
        type = 'magnet';
      } else if (rand < 0.78) {
        type = 'rainbow';
      } else if (rand < 0.83 + (luckyBonus > 0 ? 0.05 : 0)) {
        type = 'supernova';
      } else {
        type = 'normal';
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
  }, [isPlaying, isFeverActive, playerState, freezeTimeLeft, gameMode]);

  // Main Spawn Interval
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;

    const spawnIntervalMs = isFeverActive ? 300 : (gameMode === 'fever' ? 350 : 550);
    const interval = setInterval(() => {
      spawnStar();
    }, spawnIntervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, isConfirmingExit, isPaused, matchCountdown, showReviveModal, isFeverActive, gameMode, spawnStar]);

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
            const speed = 2.8;
            nextStars.push({
              ...star,
              x: star.x + (dx / dist) * speed,
              y: star.y + (dy / dist) * speed,
            });
          }
        }

        return changed ? nextStars : prevStars;
      });
    }, 50);

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

  // Game Clock Countdown
  useEffect(() => {
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal || gameMode === 'zen') return;

    const clockInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          soundManager.playGameOver();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isPlaying, isConfirmingExit, isPaused, matchCountdown, showReviveModal, gameMode]);

  // Check Game Over Conditions or Trigger Revive Prompt
  useEffect(() => {
    if (isPlaying && !isConfirmingExit && !isPaused && matchCountdown === null && !showReviveModal && gameMode !== 'zen') {
      if (timeLeft <= 0 || (gameMode === 'endless' && lives <= 0)) {
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
    if (gameMode === 'endless') {
      setLives(2);
    } else {
      setTimeLeft(15);
    }
    soundManager.playRevive();
    hapticManager.success();
    const rect = boardRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 350) / 2;
    const cy = (rect?.height || 500) / 2;
    addParticles(cx, cy, '#10b981', 24, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 8, sizeMax: 16 });
    addFloatingText('✨ ¡REVIVIDO! (+15s / +2 Vidas) ✨', cx, cy - 40, '#34d399');
  };

  const handleReviveWithCoins = () => {
    const success = onSpendCoins ? onSpendCoins(100) : (playerState.coins >= 100);
    if (!success && playerState.coins < 100) return;
    hasUsedReviveRef.current = true;
    setShowReviveModal(false);
    if (gameMode === 'endless') {
      setLives(2);
    } else {
      setTimeLeft(15);
    }
    soundManager.playRevive();
    hapticManager.success();
    const rect = boardRef.current?.getBoundingClientRect();
    const cx = (rect?.width || 350) / 2;
    const cy = (rect?.height || 500) / 2;
    addParticles(cx, cy, '#f59e0b', 24, { shape: 'star', speedMin: 3, speedMax: 9, sizeMin: 8, sizeMax: 16 });
    addFloatingText('✨ ¡REVIVIDO! ✨', cx, cy - 40, '#facc15');
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
        addFloatingText(`+${pts}`, clickX, clickY, '#facc15');
        break;
      }

      case 'golden': {
        const pts = Math.round(5 * totalMultiplier);
        setScore((s) => s + pts);
        matchStatsRef.current.golden += 1;
        soundManager.playTapGold();
        hapticManager.mediumTap();
        addStarBurstParticles(clickX, clickY, 'golden');
        addFloatingText(`+${pts} 🌟`, clickX, clickY, '#f59e0b');
        break;
      }

      case 'diamond': {
        const pts = Math.round(20 * totalMultiplier);
        setScore((s) => s + pts);
        matchStatsRef.current.diamond += 1;
        soundManager.playTapDiamond();
        hapticManager.heavyTap();
        addStarBurstParticles(clickX, clickY, 'diamond');
        addFloatingText(`+${pts} 💎`, clickX, clickY, '#60a5fa');
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
        hapticManager.bombExplosion();
        addBombExplosionParticles(clickX, clickY);

        if (gameMode === 'endless') {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) soundManager.playGameOver();
            return Math.max(0, nextL);
          });
          addFloatingText('❌ ¡VIDA PERDIDA!', clickX, clickY, '#f87171');
        } else {
          setScore((s) => Math.max(0, s - 10));
          addFloatingText('-10 BOMBA 💥', clickX, clickY, '#f87171');
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
  const handleTapStar = (star: StarItem, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;

    // Get exact pixel location on play area for particles & floating text
    const rect = playAreaRef.current?.getBoundingClientRect();
    let clickX = (star.x / 100) * (rect?.width || 350);
    let clickY = (star.y / 100) * (rect?.height || 500);

    if ('clientX' in e && rect) {
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    } else if ('touches' in e && e.touches[0] && rect) {
      clickX = e.touches[0].clientX - rect.left;
      clickY = e.touches[0].clientY - rect.top;
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
            <div className="relative z-20 w-full p-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 text-white shadow-xl animate-fade-in">
              {/* Score & Multiplier */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col bg-slate-950/80 px-3 py-1.5 rounded-2xl border border-amber-500/30 shadow-inner">
                  <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase">PUNTOS</span>
                  <div className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {score.toLocaleString()}
                  </div>
                </div>

                {activeMultiplier > 1 && (
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 px-3 py-1.5 rounded-2xl text-xs font-black animate-pulse shadow-lg border border-pink-400/40">
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>x{activeMultiplier} ({multiplierTimeLeft}s)</span>
                  </div>
                )}
              </div>

              {/* Center: Combo Indicator with 3D Pop & Cyber Energy Badge */}
              {combo >= 3 && (
                <div className="flex flex-col items-center animate-combo-mega z-30">
                  <div className={`px-3.5 py-1 rounded-2xl border flex items-center gap-1.5 shadow-xl ${
                    combo >= 10
                      ? 'bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 border-yellow-200 text-slate-950 font-black shadow-amber-500/50 scale-110 animate-pulse'
                      : combo >= 6
                      ? 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 border-pink-300 text-white font-black shadow-pink-500/40'
                      : 'bg-gradient-to-r from-amber-500/30 to-yellow-400/20 border-yellow-400/60 text-yellow-300 font-extrabold shadow-yellow-500/30'
                  }`}>
                    <Zap className={`w-3.5 h-3.5 fill-current ${combo >= 10 ? 'animate-bounce' : ''}`} />
                    <span className="text-xs uppercase tracking-tight">
                      COMBO x{combo}!
                    </span>
                  </div>
                </div>
              )}

              {/* Right: Timer / Lives & Active Powerups */}
              <div className="flex items-center gap-2">
                {shieldCount > 0 && (
                  <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-2.5 py-1 rounded-2xl text-cyan-300 text-xs font-bold shadow-inner">
                    <Shield className="w-3.5 h-3.5 fill-cyan-400" />
                    <span>x{shieldCount}</span>
                  </div>
                )}

                {freezeTimeLeft > 0 && (
                  <div className="flex items-center gap-1.5 bg-sky-950/80 border border-sky-500/40 px-2.5 py-1 rounded-2xl text-sky-300 text-xs font-bold animate-pulse shadow-inner">
                    <span>❄️ {freezeTimeLeft}s</span>
                  </div>
                )}

                {magnetTimeLeft > 0 && (
                  <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-500/40 px-2.5 py-1 rounded-2xl text-purple-300 text-xs font-bold animate-pulse shadow-inner">
                    <span>🧲 {magnetTimeLeft}s</span>
                  </div>
                )}

                {gameMode === 'endless' ? (
                  <div className="flex items-center gap-1.5 bg-slate-950/70 px-3 py-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
                    {[1, 2, 3].map((heartIndex) => (
                      <Heart
                        key={heartIndex}
                        className={`w-5 h-5 transition-all ${
                          heartIndex <= lives
                            ? 'text-red-500 fill-red-500 scale-110 drop-shadow'
                            : 'text-slate-700 fill-slate-800 opacity-40'
                        }`}
                      />
                    ))}
                  </div>
                ) : gameMode === 'zen' ? (
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end bg-slate-950/70 px-3 py-1.5 rounded-2xl border border-emerald-500/30 shadow-inner">
                      <span className="text-[10px] font-extrabold text-emerald-400 tracking-wider uppercase">Modo</span>
                      <span className="text-xs font-black text-emerald-300">Zen 🧘</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-end bg-slate-950/80 px-3.5 py-1.5 rounded-2xl border border-cyan-500/30 shadow-inner">
                    <span className="text-[10px] font-extrabold text-cyan-400 tracking-wider uppercase">TIEMPO</span>
                    <div
                      className={`text-2xl font-black tracking-tight ${
                        timeLeft <= 10 ? 'text-red-400 animate-ping' : 'text-cyan-300'
                      }`}
                    >
                      {timeLeft}s
                    </div>
                  </div>
                )}

                {/* Quick In-Game Pause Button */}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setIsPaused(true);
                    if (playerState.hapticsEnabled) hapticManager.lightTap();
                  }}
                  className="px-2.5 py-2 bg-slate-950/90 hover:bg-slate-800 text-amber-300 rounded-2xl border border-amber-500/40 transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-extrabold cursor-pointer"
                  title="Pausar partida"
                >
                  <Pause className="w-3.5 h-3.5 fill-amber-300" />
                  <span className="hidden xs:inline">Pausa</span>
                </button>

                {/* Exit Match Button (Prompts Confirmation Dialog) */}
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setIsConfirmingExit(true);
                    if (playerState.hapticsEnabled) hapticManager.lightTap();
                  }}
                  className="px-2.5 py-2 bg-slate-950/90 hover:bg-rose-950/80 text-rose-300 hover:text-rose-100 rounded-2xl border border-rose-500/40 transition-all active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-extrabold cursor-pointer group"
                  title={t('exitButtonTooltip', playerState.language || 'es')}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline">{t('exit', playerState.language || 'es')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Fever Meter Bar (Under Top HUD) */}
          <div className="relative z-20 w-full h-2 bg-slate-900 overflow-hidden">
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

            {/* Bento Grid Header Card */}
            <div className="aaa-glass-cyber p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] max-w-sm w-full flex flex-col items-center relative overflow-hidden animate-fade-in shrink-0 my-auto border border-cyan-500/30">
              {/* Holographic Top Laser Accent */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-shimmer" />

              {/* AAA Corner Telemetry Brackets */}
              <div className="aaa-hud-corner-tl text-cyan-400/80" />
              <div className="aaa-hud-corner-tr text-cyan-400/80" />
              <div className="aaa-hud-corner-bl text-cyan-400/80" />
              <div className="aaa-hud-corner-br text-cyan-400/80" />

              {/* Top Telemetry Header Tag */}
              <div className="flex items-center gap-2 mb-2 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>ARCADE // READY</span>
              </div>
              
              <div className="relative mb-3 mt-1">
                {/* Glowing Outer Rings */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500/30 to-purple-500/30 blur-md animate-pulse" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-3xl sm:text-4xl shadow-[0_10px_25px_rgba(245,158,11,0.5)] border-2 border-yellow-100 relative z-10 animate-star-pulse">
                  {gameMode === 'duel' ? '⚔️' : '⭐'}
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-200 animate-spin z-20 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] uppercase">
                {gameMode === 'duel' ? t('duelTitleOverlay', playerState.language || 'es') : t('arcadeTitle', playerState.language || 'es')}
              </h2>

              <p className="text-slate-300 text-[11px] sm:text-xs mb-3 font-medium leading-relaxed bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800/90 w-full shadow-inner">
                {gameMode === 'blitz' && t('blitzDesc', playerState.language || 'es')}
                {gameMode === 'endless' && t('endlessDesc', playerState.language || 'es')}
                {gameMode === 'fever' && t('feverDesc', playerState.language || 'es')}
                {gameMode === 'zen' && t('zenDesc', playerState.language || 'es')}
                {gameMode === 'duel' && t('duelDesc', playerState.language || 'es')}
              </p>

              {/* Player Stats Record Badge */}
              <div className="w-full mb-3 px-3.5 py-2 bg-gradient-to-r from-amber-950/50 via-slate-950/90 to-slate-950/90 rounded-2xl border border-amber-500/40 flex items-center justify-between text-xs shadow-inner">
                <div className="flex items-center gap-2 text-slate-300 font-black text-[11px] sm:text-xs">
                  <Trophy className="w-4 h-4 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                  <span className="uppercase tracking-wider text-[10px] text-amber-200">RÉCORD MÁXIMO:</span>
                </div>
                <span className="font-black text-amber-300 text-xs sm:text-sm font-mono drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
                  {playerState.stats.highestScore.toLocaleString()} pts
                </span>
              </div>

              {/* Ghost Target Card in Duel Mode */}
              {gameMode === 'duel' && (
                <div className="w-full mb-3 p-2.5 bg-gradient-to-r from-purple-950/80 to-slate-950/90 rounded-2xl border border-purple-500/50 flex items-center justify-between shadow-inner">
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

              {/* Action Buttons: Start Game + Mode Switcher Button */}
              <div className="w-full flex items-center gap-2.5">
                <button
                  data-tutorial="play-button"
                  onClick={onStartGame}
                  className="aaa-btn-gold flex-1 py-3.5 sm:py-4 font-black text-sm rounded-2xl flex items-center justify-center gap-2 tracking-wider uppercase cursor-pointer"
                >
                  {gameMode === 'duel' ? <Swords className="w-5 h-5 fill-slate-950 stroke-[2.5]" /> : <Zap className="w-5 h-5 fill-slate-950 stroke-[2.5]" />}
                  <span className="font-black text-xs sm:text-sm tracking-wider">{gameMode === 'duel' ? t('startDuelGame', playerState.language || 'es') : t('startGame', playerState.language || 'es')}</span>
                </button>

                {setGameMode && (
                  <button
                    data-tutorial="mode-selector"
                    onClick={() => {
                      soundManager.playButtonClick();
                      hapticManager.lightTap();
                      setIsModeSelectorOpen((prev) => !prev);
                    }}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-center shadow-lg active:scale-95 cursor-pointer ${
                      isModeSelectorOpen
                        ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 border-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-105'
                        : 'bg-slate-950/90 hover:bg-slate-800 text-amber-400 border-amber-500/40 hover:border-amber-300'
                    }`}
                    title={t('selectGameMode', playerState.language || 'es')}
                  >
                    <Gamepad2 className="w-5 h-5" />
                  </button>
                )}
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

        {/* Render Spawning Stars */}
        {isPlaying &&
          stars.map((star) => {
            const style = getStarStyle(star.type);
            const isBomb = star.type === 'bomb';
            const isDiamond = star.type === 'diamond';
            const isGolden = star.type === 'golden';
            const isFever = star.type === 'fever';

            return (
              <div
                key={star.id}
                className="absolute flex items-center justify-center pointer-events-auto will-change-transform"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  transform: 'translate3d(-50%, -50%, 0)',
                }}
              >
                <div className="relative w-full h-full min-w-[54px] min-h-[54px] flex items-center justify-center">
                  {/* Ambient Glow Aura */}
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-60 pointer-events-none"
                    style={{ backgroundColor: style.glowColor }}
                  />

                  {/* Diamond Orbiting Ring */}
                  {isDiamond && (
                    <div className="absolute -inset-2.5 rounded-full border border-sky-400/50 animate-star-orbit pointer-events-none">
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#38bdf8]" />
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-200 shadow-[0_0_6px_#38bdf8]" />
                    </div>
                  )}

                  {/* Golden Star Sunburst Halo */}
                  {isGolden && (
                    <div className="absolute -inset-2 rounded-full border-2 border-yellow-300/40 animate-pulse pointer-events-none" />
                  )}

                  {/* Fever Prism Shimmer */}
                  {isFever && (
                    <div className="absolute -inset-2 rounded-full border border-pink-400/50 animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
                  )}

                  {/* Main Interactive Star Button */}
                  <button
                    type="button"
                    onMouseDown={(e) => handleTapStar(star, e)}
                    onTouchStart={(e) => handleTapStar(star, e)}
                    className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr ${style.bg} ${style.ring} ring-4 shadow-[0_8px_25px_rgba(0,0,0,0.5)] active:scale-90 transition-transform duration-75 ease-out cursor-pointer relative z-10 select-none ${
                      isBomb ? 'animate-bomb-hazard' : ''
                    }`}
                    style={{
                      filter: `drop-shadow(0 6px 10px ${style.shadowColor})`,
                    }}
                  >
                    {/* Top Specular Gloss Highlight */}
                    <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />

                    <span className="text-2xl sm:text-3xl select-none animate-star-pulse pointer-events-none">
                      {style.icon}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}

        {/* Floating Star Magnet Button */}
        {isPlaying && (
          <div className="absolute bottom-12 right-3 sm:bottom-14 sm:right-4 z-30">
            <button
              onClick={activateMagnet}
              disabled={magnetCharges <= 0 || magnetTimeLeft > 0}
              className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl font-black text-xs shadow-xl border flex items-center gap-2 transition-all active:scale-95 ${
                magnetTimeLeft > 0
                  ? 'bg-purple-600 text-white border-purple-300 animate-pulse shadow-purple-500/50'
                  : magnetCharges > 0
                  ? 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white border-pink-300/60 hover:scale-105 shadow-purple-900/40 cursor-pointer'
                  : 'bg-slate-900/80 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
              }`}
            >
              <span className="text-base sm:text-lg animate-bounce">🧲</span>
              <div className="flex flex-col text-left">
                <span className="text-[9px] sm:text-[10px] tracking-wider uppercase text-purple-200 font-extrabold">
                  {magnetTimeLeft > 0 ? 'IMÁN ACTIVO' : 'IMÁN DE ESTRELLAS'}
                </span>
                <span className="text-[11px] sm:text-xs font-black">
                  {magnetTimeLeft > 0 ? `${magnetTimeLeft}s` : `ACTIVAR (${magnetCharges})`}
                </span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Status Bar during Game */}
      {isPlaying && (
        <div className="relative z-20 w-full px-3 sm:px-4 py-1.5 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-300 safe-pb shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Modo:</span>
            <span className="capitalize text-slate-200">{gameMode}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Racha Máxima:</span>
            <span className="font-extrabold text-yellow-300">{maxCombo}x</span>
          </div>
        </div>
      )}

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
