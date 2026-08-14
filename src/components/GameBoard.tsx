import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StarItem, StarType, Particle, ParticleShape, FloatingText, PlayerState, GameMode, GhostRival, MultiplayerOpponent, MultiplayerArena, LiveEmote } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { ArcadeCanvas } from './ArcadeCanvas';
import { GameTipBanner } from './GameTipBanner';
import { InGamePauseModal } from './InGamePauseModal';
import { ReviveModal } from './ReviveModal';
import { MultiplayerBattleHUD } from './MultiplayerBattleHUD';
import { getRandomOpponentEmote } from '../services/multiplayerBotPool';
import { Heart, Shield, Zap, Sparkles, AlertTriangle, Swords, Ghost, Users, Trophy, Gamepad2, X, Check, Clock, Flame, Smile, LogOut, Pause } from 'lucide-react';
import { t } from '../i18n';

interface GameBoardProps {
  isPlaying: boolean;
  gameMode: GameMode;
  setGameMode?: (mode: GameMode) => void;
  playerState: PlayerState;
  duelGhostRival?: GhostRival | null;
  onSelectDuelRival?: () => void;
  multiplayerOpponent?: MultiplayerOpponent | null;
  multiplayerArena?: MultiplayerArena | null;
  onOpenMultiplayerLobby?: () => void;
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
  duelGhostRival,
  onSelectDuelRival,
  multiplayerOpponent,
  multiplayerArena,
  onOpenMultiplayerLobby,
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

  // Canvas Particles & Floating Texts
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const boardRef = useRef<HTMLDivElement | null>(null);

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

    hasSparkyBotDefuse.current = playerState.equippedCharacter === 'char_sparky_bot';

    // Base Time calculations
    const baseTimeUpgrade = playerState.upgrades.time_extender || 0;
    const cosmicCatExtraTime = playerState.equippedCharacter === 'char_cosmic_cat' ? 3 : 0;
    const boosterExtraTime = (playerState.activeBoosters?.time_bonus_boost || 0) > 0 ? 5 : 0;
    const initialTime = gameMode === 'blitz' ? (60 + baseTimeUpgrade + cosmicCatExtraTime + boosterExtraTime) : (gameMode === 'fever' ? 30 : 60);
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
  }, [isPlaying, resetMatch]);

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
    const luckyBonus = luckyCharmLevel * 0.03 + (hasDragon ? 0.08 : 0);

    // Probabilities
    if (gameMode === 'zen') {
      // Zen mode: No bombs! Relaxed tapping practice
      if (rand < 0.40) type = 'normal';
      else if (rand < 0.65) type = 'golden';
      else if (rand < 0.78) type = 'diamond';
      else if (rand < 0.85) type = 'multiplier2';
      else if (rand < 0.90) type = 'multiplier5';
      else if (rand < 0.95) type = 'rainbow';
      else type = 'normal';
    } else if (isFeverActive) {
      // Fever mode: higher chance of gold, diamond, multipliers!
      if (rand < 0.45) type = 'golden';
      else if (rand < 0.70) type = 'diamond';
      else if (rand < 0.85) type = 'multiplier2';
      else type = 'rainbow';
    } else {
      if (rand < 0.15 + luckyBonus) {
        type = 'bomb';
      } else if (rand < 0.35 + luckyBonus) {
        type = 'golden';
      } else if (rand < 0.45 + luckyBonus) {
        type = 'diamond';
      } else if (rand < 0.52) {
        type = 'multiplier2';
      } else if (rand < 0.57) {
        type = 'multiplier5';
      } else if (rand < 0.62) {
        type = 'timeBonus';
      } else if (rand < 0.67) {
        type = 'shield';
      } else if (rand < 0.72) {
        type = 'freeze';
      } else if (rand < 0.76) {
        type = 'magnet';
      } else if (rand < 0.79) {
        type = 'rainbow';
      } else {
        type = 'normal';
      }
    }

    // Spawn coordinate calculation (keep inside board boundaries 10% to 85%)
    const x = Math.floor(Math.random() * 78) + 11;
    const y = Math.floor(Math.random() * 72) + 14;

    // Despawn duration (ms) - shrinks with time or freeze status
    let baseDuration = 1100;
    if (type === 'diamond' || type === 'multiplier5') baseDuration = 800;
    if (type === 'rainbow') baseDuration = 700;
    if (freezeTimeLeft > 0) baseDuration *= 1.8;

    const newStar: StarItem = {
      id: `star_${nextSpawnId.current++}_${Date.now()}`,
      type,
      x,
      y,
      size: type === 'rainbow' || type === 'diamond' ? 62 : 54,
      createdAt: Date.now(),
      duration: baseDuration,
      scale: 1,
      rotation: Math.floor(Math.random() * 360),
    };

    setStars((prev) => [...prev.slice(-12), newStar]); // cap max active stars on screen
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
            const rect = boardRef.current?.getBoundingClientRect();
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

  // Handle Tapping a Star Item
  const handleTapStar = (star: StarItem, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isPlaying || isConfirmingExit || isPaused || matchCountdown !== null || showReviveModal) return;

    // Get exact pixel location on board for particles & floating text
    const rect = boardRef.current?.getBoundingClientRect();
    let clickX = (star.x / 100) * (rect?.width || 350);
    let clickY = (star.y / 100) * (rect?.height || 500);

    if ('clientX' in e && rect) {
      clickX = e.clientX - rect.left;
      clickY = e.clientY - rect.top;
    } else if ('touches' in e && e.touches[0] && rect) {
      clickX = e.touches[0].clientX - rect.left;
      clickY = e.touches[0].clientY - rect.top;
    }

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
    if (currentCombo === 5 || currentCombo === 10 || currentCombo === 15 || currentCombo === 20 || currentCombo === 25 || currentCombo === 30 || currentCombo === 40 || currentCombo === 50) {
      soundManager.playComboMilestone(currentCombo);
      let comboBanner = `⚡ ¡COMBO x${currentCombo}!`;
      if (currentCombo === 10) comboBanner = '🔥 ¡COMBO x10 IMPARABLE!';
      if (currentCombo === 15) comboBanner = '🚀 ¡COMBO x15 EN LLAMAS!';
      if (currentCombo === 20) comboBanner = '👑 ¡COMBO x20 LEYENDA!';
      if (currentCombo >= 30) comboBanner = '🌌 ¡COMBO x30 DIOS CÓSMICO!';
      addFloatingText(comboBanner, clickX, clickY - 45, '#f59e0b');
    }

    // Combo multiplier multiplier: 1 + combo * 0.1 (e.g. combo 10 = x2 points!)
    const comboFactor = Math.min(3.0, 1 + Math.floor(currentCombo / 5) * 0.25);
    const totalMultiplier = activeMultiplier * comboFactor;

    // Increase Fever Progress
    if (!isFeverActive) {
      setFeverProgress((prevFever) => {
        const nextFever = prevFever + 8;
        if (nextFever >= 100) {
          setIsFeverActive(true);
          setFeverTimeLeft(6);
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
        soundManager.playTapNormal();
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
          ring: 'ring-cyan-300 animate-bounce',
          trailFrom: 'rgba(56, 189, 248, 0.85)',
          glowColor: 'rgba(96, 165, 250, 0.7)',
          shadowColor: 'rgba(37, 99, 235, 0.6)',
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
      className={`relative w-full h-full flex flex-col justify-between select-none touch-manipulation overflow-hidden ${
        screenShake ? 'animate-bounce' : ''
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Particle Canvas Layer */}
      <ArcadeCanvas particlesRef={particlesRef} floatingTextsRef={floatingTextsRef} />

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

              {/* Center: Combo Indicator */}
              {combo >= 3 && (
                <div className="flex flex-col items-center animate-bounce">
                  <span className="text-xs font-black text-yellow-300 bg-amber-500/20 px-3.5 py-1 rounded-2xl border border-yellow-400/50 shadow-md">
                    COMBO x{combo}!
                  </span>
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

      {/* Active Game Field - Spawning Stars Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* Pre-Game Start Screen Prompt if not actively playing */}
        {!isPlaying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md text-center">
            {/* Bento Grid Header Card */}
            <div className="bg-slate-900/95 border border-purple-500/30 p-6 sm:p-7 rounded-[2.5rem] shadow-2xl max-w-sm w-full flex flex-col items-center relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500" />
              
              <div className="relative mb-4 mt-1">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-4xl shadow-xl border border-yellow-200/50 animate-pulse">
                  {gameMode === 'duel' ? '⚔️' : '⭐'}
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-7 h-7 text-yellow-300 animate-spin" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mb-1.5 tracking-tight drop-shadow">
                {gameMode === 'duel' ? t('duelTitleOverlay', playerState.language || 'es') : t('arcadeTitle', playerState.language || 'es')}
              </h2>

              <p className="text-slate-300 text-xs mb-4 font-medium leading-relaxed bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 w-full shadow-inner">
                {gameMode === 'blitz' && t('blitzDesc', playerState.language || 'es')}
                {gameMode === 'endless' && t('endlessDesc', playerState.language || 'es')}
                {gameMode === 'fever' && t('feverDesc', playerState.language || 'es')}
                {gameMode === 'zen' && t('zenDesc', playerState.language || 'es')}
                {gameMode === 'duel' && t('duelDesc', playerState.language || 'es')}
              </p>

              {/* Player Stats Record Badge */}
              <div className="w-full mb-4 px-3.5 py-2.5 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400 font-bold">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Máximo Récord:</span>
                </div>
                <span className="font-black text-amber-300 text-sm font-mono">
                  {playerState.stats.highestScore.toLocaleString()} pts
                </span>
              </div>

              {/* Ghost Target Card in Duel Mode */}
              {gameMode === 'duel' && (
                <div className="w-full mb-4 p-3 bg-slate-950/90 rounded-2xl border border-purple-500/40 flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/80 border border-purple-400/50 flex items-center justify-center text-xl shadow">
                      {duelGhostRival ? duelGhostRival.avatar : '👻'}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-purple-400 font-extrabold uppercase">{t('ghostRival', playerState.language || 'es')}</span>
                      <span className="font-bold text-xs text-white truncate max-w-[120px]">
                        {duelGhostRival ? duelGhostRival.name : 'Fantasma Global'}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-extrabold">
                        {duelGhostRival ? `${duelGhostRival.score.toLocaleString()} ${t('pts', playerState.language || 'es')}` : `0 ${t('pts', playerState.language || 'es')}`}
                      </span>
                    </div>
                  </div>

                  {onSelectDuelRival && (
                    <button
                      onClick={onSelectDuelRival}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-[11px] rounded-xl border border-purple-500/30 flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{t('changeRival', playerState.language || 'es')}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons: Start Game + Mode Switcher Button */}
              <div className="w-full flex items-center gap-2">
                <button
                  data-tutorial="play-button"
                  onClick={onStartGame}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:scale-102 active:scale-95 transition-all flex items-center justify-center gap-2 border border-yellow-300/50 tracking-wide uppercase"
                >
                  {gameMode === 'duel' ? <Swords className="w-5 h-5 fill-slate-950" /> : <Zap className="w-5 h-5 fill-slate-950" />}
                  <span>{gameMode === 'duel' ? t('startDuelGame', playerState.language || 'es') : t('startGame', playerState.language || 'es')}</span>
                </button>

                {setGameMode && (
                  <button
                    data-tutorial="mode-selector"
                    onClick={() => {
                      soundManager.playButtonClick();
                      hapticManager.lightTap();
                      setIsModeSelectorOpen((prev) => !prev);
                    }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-center shadow-lg active:scale-95 ${
                      isModeSelectorOpen
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700/80 hover:border-amber-500/50'
                    }`}
                    title={t('selectGameMode', playerState.language || 'es')}
                  >
                    <Gamepad2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Mode Selector Overlay Popup */}
              {isModeSelectorOpen && setGameMode && (
                <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md rounded-[2.5rem] p-4 flex flex-col justify-between animate-fade-in border border-amber-500/40 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
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
                      className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 my-2 overflow-y-auto max-h-[250px] pr-1">
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
                          className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400/80 text-amber-200 shadow-md scale-102'
                              : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl border ${m.bg}`}>
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
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow border border-yellow-200/50 uppercase tracking-wider"
                  >
                    LISTO
                  </button>
                </div>
              )}
            </div>

            {/* Discrete Game Tip Banner at bottom of Start Screen */}
            <GameTipBanner
              lang={playerState.language || 'es'}
              className="mt-3.5 animate-fade-in"
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
            return (
              <div
                key={star.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-auto"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
              >
                {/* Main Interactive Star Button */}
                <button
                  onMouseDown={(e) => handleTapStar(star, e)}
                  onTouchStart={(e) => handleTapStar(star, e)}
                  className={`w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr ${style.bg} ${style.ring} ring-4 shadow-[0_8px_25px_rgba(0,0,0,0.5)] active:scale-90 transition-all duration-150 cursor-pointer relative z-10`}
                  style={{
                    animation: `pulse 0.6s infinite alternate`,
                    filter: `drop-shadow(0 6px 10px ${style.shadowColor})`,
                  }}
                >
                  <span className="text-2xl sm:text-3xl select-none">{style.icon}</span>
                </button>
              </div>
            );
          })}

        {/* Floating Star Magnet Button */}
        {isPlaying && (
          <div className="absolute bottom-4 right-4 z-30">
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
        <div className="relative z-20 w-full px-4 py-2 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
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
