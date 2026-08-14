import React, { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  GameMode, 
  PlayerState, 
  ShopItem, 
  Achievement, 
  Quest, 
  LeaderboardEntry,
  GhostRival,
  MultiplayerArena,
  MultiplayerOpponent,
  Friend,
  DirectChallenge
} from './types';
import { 
  loadPlayerState, 
  savePlayerState, 
  generateDailyQuests, 
  loadAchievements, 
  saveAchievements, 
  loadLeaderboard, 
  saveLeaderboard, 
  getXpForNextLevel, 
  SHOP_ITEMS 
} from './services/storage';
import {
  loadFriends,
  saveFriends,
  loadDirectChallenges,
  saveDirectChallenges,
  addFriendByIdOrName,
  getMyPlayerCode
} from './services/friends';
import { soundManager } from './services/sound';
import { 
  initAuth, 
  savePlayerStateToCloud, 
  loadPlayerStateFromCloud, 
  saveScoreToCloudLeaderboard, 
  subscribeCloudLeaderboard 
} from './firebase';
import { HeaderHUD } from './components/HeaderHUD';
import { GameBoard } from './components/GameBoard';
import { GameOverModal } from './components/GameOverModal';
import { ShopModal } from './components/ShopModal';
import { QuestsModal } from './components/QuestsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { AchievementToast, ToastItem } from './components/AchievementToast';
import { LeaderboardModal } from './components/LeaderboardModal';
import { FriendsModal } from './components/FriendsModal';
import { StatsModal } from './components/StatsModal';
import { ProfileModal } from './components/ProfileModal';
import { AvatarSelectorModal } from './components/AvatarSelectorModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { AuthModal } from './components/AuthModal';
import { getAvatarById } from './data/avatars';
import { EuConsentModal } from './components/EuConsentModal';
import { SplashScreen } from './components/SplashScreen';
import { DailyLoginBonusModal } from './components/DailyLoginBonusModal';
import { LuckySpinModal } from './components/LuckySpinModal';
import { MultiplayerLobbyModal } from './components/MultiplayerLobbyModal';
import { MultiplayerVersusShowdown } from './components/MultiplayerVersusShowdown';
import { MultiplayerResultModal } from './components/MultiplayerResultModal';
import { ARENAS } from './data/multiplayerArenas';
import { initializeAdMob, showRewardedAd, showInterstitialAd } from './services/admob';
import { hapticManager } from './services/haptics';
import { 
  initNotifications, 
  notifyDailyQuestsUpdated, 
  notifyLevelUpReward, 
  scheduleDailyQuestReminder,
  cancelDailyQuestReminder,
  toggleDailyQuestReminder
} from './services/notifications';
import { Smartphone } from 'lucide-react';

export default function App() {
  const [playerState, setPlayerState] = useState<PlayerState>(loadPlayerState);
  const [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);
  const [showDailyBonusModal, setShowDailyBonusModal] = useState<boolean>(false);
  const [showLuckySpinModal, setShowLuckySpinModal] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<GameMode>('blitz');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [duelGhostRival, setDuelGhostRival] = useState<GhostRival | null>(null);

  // 1v1 Real-Time Multiplayer State
  const [showMultiplayerLobby, setShowMultiplayerLobby] = useState<boolean>(false);
  const [activeMultiplayerArena, setActiveMultiplayerArena] = useState<MultiplayerArena | null>(null);
  const [activeMultiplayerOpponent, setActiveMultiplayerOpponent] = useState<MultiplayerOpponent | null>(null);
  const [showVersusShowdown, setShowVersusShowdown] = useState<boolean>(false);
  const [multiplayerResultData, setMultiplayerResultData] = useState<{
    isWinner: boolean;
    playerScore: number;
    opponentScore: number;
    matchStats: {
      starsTapped: number;
      normal: number;
      golden: number;
      diamond: number;
      bombsHit: number;
      bombsAvoided: number;
      maxCombo: number;
    };
    arena: MultiplayerArena;
    opponent: MultiplayerOpponent;
    trophiesDelta: number;
    coinsDelta: number;
  } | null>(null);

  const [showEuConsentModal, setShowEuConsentModal] = useState<boolean>(() => {
    return localStorage.getItem('eu_gdpr_consent_accepted') !== 'true';
  });
  const [isTutorialActive, setIsTutorialActive] = useState<boolean>(() => {
    return !playerState.hasSeenTutorial && playerState.stats.gamesPlayed === 0;
  });

  // Modals
  const [activeModal, setActiveModal] = useState<
    'shop' | 'quests' | 'achievements' | 'leaderboard' | 'friends' | 'stats' | 'profile' | 'auth' | 'avatar' | null
  >(null);

  // Friends & Social Challenges Data
  const [friends, setFriends] = useState<Friend[]>(loadFriends);
  const [directChallenges, setDirectChallenges] = useState<DirectChallenge[]>(loadDirectChallenges);

  // Quests & Achievements Data
  const [quests, setQuests] = useState<Quest[]>(generateDailyQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);

  // Real-time Achievement & Quest Toast Notifications
  const [toastQueue, setToastQueue] = useState<ToastItem[]>([]);
  const [activeAchievementToast, setActiveAchievementToast] = useState<ToastItem | null>(null);

  // Manage toast queue popup sequence
  useEffect(() => {
    if (!activeAchievementToast && toastQueue.length > 0) {
      const [nextToast, ...remaining] = toastQueue;
      setActiveAchievementToast(nextToast);
      setToastQueue(remaining);
    }
  }, [toastQueue, activeAchievementToast]);

  // Real-time gameplay achievement & quest check
  const handleLiveProgress = useCallback(
    (liveStats: { score: number; combo: number; starsTapped: number; diamond: number; golden: number }) => {
      // 1. Check Achievements
      setAchievements((prevAch) => {
        const newlyUnlocked: ToastItem[] = [];
        let hasChanges = false;

        const updated = prevAch.map((ach) => {
          let newProgress = ach.progress;
          const totalStars = playerState.stats.totalStarsTapped + liveStats.starsTapped;
          const totalDiamonds = playerState.stats.diamondTapped + liveStats.diamond;
          const totalGolden = playerState.stats.goldenTapped + liveStats.golden;

          if (ach.id === 'tap_50_stars') newProgress = totalStars;
          if (ach.id === 'tap_250_stars') newProgress = totalStars;
          if (ach.id === 'tap_1000_stars') newProgress = totalStars;
          if (ach.id === 'diamond_collector') newProgress = totalDiamonds;
          if (ach.id === 'golden_star_master') newProgress = totalGolden;
          if (ach.id === 'combo_10') newProgress = Math.max(ach.progress, liveStats.combo);
          if (ach.id === 'combo_20') newProgress = Math.max(ach.progress, liveStats.combo);
          if (ach.id === 'combo_30') newProgress = Math.max(ach.progress, liveStats.combo);
          if (ach.id === 'score_300') newProgress = Math.max(ach.progress, liveStats.score);
          if (ach.id === 'score_700') newProgress = Math.max(ach.progress, liveStats.score);
          if (ach.id === 'score_1500') newProgress = Math.max(ach.progress, liveStats.score);

          const isUnlocked = newProgress >= ach.target;

          if (isUnlocked && !ach.unlocked) {
            hasChanges = true;
            const unlockedItem = { ...ach, progress: newProgress, unlocked: true };
            newlyUnlocked.push({
              id: ach.id,
              type: 'achievement',
              title: ach.title,
              description: ach.description,
              icon: ach.icon,
              rewardCoins: ach.rewardCoins,
              rewardXp: ach.rewardXp,
            });
            return unlockedItem;
          }

          if (newProgress !== ach.progress) {
            hasChanges = true;
            return { ...ach, progress: newProgress, unlocked: isUnlocked };
          }

          return ach;
        });

        if (newlyUnlocked.length > 0) {
          setToastQueue((prev) => [...prev, ...newlyUnlocked]);
        }

        if (hasChanges) {
          saveAchievements(updated);
          return updated;
        }

        return prevAch;
      });

      // 2. Check Daily Quests
      setQuests((prevQuests) => {
        const newlyCompletedQuests: ToastItem[] = [];
        let questChanges = false;

        const updatedQuests = prevQuests.map((q) => {
          let newProgress = q.progress;

          if (q.id === 'quest_1') {
            newProgress = Math.max(q.progress, liveStats.golden);
          } else if (q.id === 'quest_2') {
            newProgress = Math.max(q.progress, liveStats.score);
          } else if (q.id === 'quest_3') {
            newProgress = Math.max(q.progress, liveStats.combo);
          }

          const isCompleted = newProgress >= q.target;

          if (isCompleted && !q.completed) {
            questChanges = true;
            newlyCompletedQuests.push({
              id: q.id,
              type: 'quest',
              title: q.title,
              description: q.description,
              icon: q.icon,
              rewardCoins: q.rewardCoins,
              rewardXp: q.rewardXp,
            });
            return { ...q, progress: newProgress, completed: true };
          }

          if (newProgress !== q.progress) {
            questChanges = true;
            return { ...q, progress: newProgress, completed: isCompleted };
          }

          return q;
        });

        if (newlyCompletedQuests.length > 0) {
          setToastQueue((prev) => [...prev, ...newlyCompletedQuests]);
        }

        if (questChanges) {
          localStorage.setItem('star_tap_daily_quests', JSON.stringify(updatedQuests));
          return updatedQuests;
        }

        return prevQuests;
      });
    },
    [playerState.stats.totalStarsTapped, playerState.stats.diamondTapped]
  );

  // Initialize Firebase Auth, Realtime Cloud Sync, AdMob & Push Notifications
  useEffect(() => {
    initializeAdMob();

    // Initialize Push & Local Notifications
    initNotifications().then((granted) => {
      console.log('[App] Push notifications granted:', granted);
      if (playerState.questRemindersEnabled !== false) {
        scheduleDailyQuestReminder();
      } else {
        cancelDailyQuestReminder();
      }

      // Notify daily quests updated if not notified today
      if (playerState.questRemindersEnabled !== false) {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastNotified = localStorage.getItem('star_tap_last_quest_notified');
        if (lastNotified !== todayStr) {
          notifyDailyQuestsUpdated(quests.length);
          localStorage.setItem('star_tap_last_quest_notified', todayStr);
        }
      }
    });

    const unsubscribeAuth = initAuth(async (user) => {
      setUserId(user.uid);
      setCurrentUser(user);
      setIsCloudSynced(true);

      const cloudData = await loadPlayerStateFromCloud(user.uid);
      if (cloudData) {
        setPlayerState(cloudData);
      }
    });

    const unsubscribeLeaderboard = subscribeCloudLeaderboard((cloudEntries) => {
      setLeaderboard(cloudEntries);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeLeaderboard) unsubscribeLeaderboard();
    };
  }, []);

  // Auto-select ghost rival when entering duel mode if none set
  useEffect(() => {
    if (gameMode === 'duel' && !duelGhostRival) {
      const opponents = leaderboard.filter((entry) => !entry.isUser);
      if (opponents.length > 0) {
        const topRival = opponents[0];
        setDuelGhostRival({
          id: topRival.id,
          name: topRival.name,
          score: topRival.score,
          avatar: topRival.avatar || '⭐',
          flag: topRival.flag || '🌍',
          level: topRival.level || 5,
        });
      } else {
        setDuelGhostRival({
          id: 'ghost_default',
          name: 'Carlos_Pro 🚀',
          score: 8500,
          avatar: '🚀',
          flag: '🇲🇽',
          level: 12,
        });
      }
    }
  }, [gameMode, duelGhostRival, leaderboard]);

  // Game Over Results State
  const [gameOverData, setGameOverData] = useState<{
    score: number;
    stats: {
      starsTapped: number;
      normal: number;
      golden: number;
      diamond: number;
      bombsHit: number;
      bombsAvoided: number;
      maxCombo: number;
    };
    coinsEarned: number;
    xpEarned: number;
    isNewHighScore: boolean;
    didLevelUp: boolean;
    newLevel: number;
    hasDoubledCoins: boolean;
    duelResult?: {
      isVictory: boolean;
      ghostName: string;
      ghostScore: number;
      bonusCoins: number;
      bonusXp: number;
    } | null;
  } | null>(null);

  // Sync mute state with soundManager
  useEffect(() => {
    soundManager.setMuted(!playerState.soundEnabled);
  }, [playerState.soundEnabled]);

  // Auto-Save Player State locally & to Firebase Cloud
  useEffect(() => {
    savePlayerState(playerState);
    if (userId) {
      savePlayerStateToCloud(userId, playerState);
    }
  }, [playerState, userId]);

  // Check Unclaimed Notifications
  const hasUnclaimedQuests = quests.some((q) => q.progress >= q.target && !q.claimed);
  const hasUnclaimedAchievements = achievements.some((a) => a.unlocked && !a.claimed);

  // Handle Starting a Game
  const handleStartGame = () => {
    soundManager.playButtonClick();
    setGameOverData(null);
    setIsPlaying(true);
  };

  // Handle Game Completion
  const handleGameOver = useCallback(
    (
      finalScore: number,
      finalStats: {
        starsTapped: number;
        normal: number;
        golden: number;
        diamond: number;
        bombsHit: number;
        bombsAvoided: number;
        maxCombo: number;
      }
    ) => {
      setIsPlaying(false);

      // Base Coins Calculation (Balanced: 10% score + 1 per Golden + 3 per Diamond)
      let coinsGained = Math.max(3, Math.floor(finalScore * 0.10) + finalStats.golden * 1 + finalStats.diamond * 3);

      // Companion Bonus: Astro Dog (+15% Coins)
      if (playerState.equippedCharacter === 'char_astro_dog') {
        coinsGained = Math.floor(coinsGained * 1.15);
      }

      // Skin Bonus: Dulce Caramelo (+10% Coins)
      if (playerState.equippedSkin === 'skin_candy') {
        coinsGained = Math.floor(coinsGained * 1.10);
      }

      // Active Booster: Double Coins check
      const nextBoosters = { ...(playerState.activeBoosters || {}) };
      if ((nextBoosters.double_coins || 0) > 0) {
        coinsGained = coinsGained * 2;
        nextBoosters.double_coins = Math.max(0, (nextBoosters.double_coins || 0) - 1);
      }
      if ((nextBoosters.extra_shield || 0) > 0) {
        nextBoosters.extra_shield = Math.max(0, (nextBoosters.extra_shield || 0) - 1);
      }
      if ((nextBoosters.time_bonus_boost || 0) > 0) {
        nextBoosters.time_bonus_boost = Math.max(0, (nextBoosters.time_bonus_boost || 0) - 1);
      }
      if ((nextBoosters.star_magnet_boost || 0) > 0) {
        nextBoosters.star_magnet_boost = Math.max(0, (nextBoosters.star_magnet_boost || 0) - 1);
      }

      // Base XP Calculation (1 pt = 0.5 XP + combo bonus)
      let xpGained = Math.max(15, Math.floor(finalScore * 0.5 + finalStats.maxCombo * 5));

      // Async Duel Mode Reward Calculation
      let duelResult: {
        isVictory: boolean;
        ghostName: string;
        ghostScore: number;
        bonusCoins: number;
        bonusXp: number;
      } | null = null;

      if (gameMode === 'duel' && duelGhostRival) {
        const isVictory = finalScore >= duelGhostRival.score;
        const bonusCoins = isVictory ? 35 : 0;
        const bonusXp = isVictory ? 60 : 0;
        coinsGained += bonusCoins;
        xpGained += bonusXp;

        duelResult = {
          isVictory,
          ghostName: duelGhostRival.name,
          ghostScore: duelGhostRival.score,
          bonusCoins,
          bonusXp,
        };
      }

      // Calculate XP and Level Up
      let nextXp = playerState.xp + xpGained;
      let nextLevel = playerState.level;
      let didLevelUp = false;

      let xpNeeded = getXpForNextLevel(nextLevel);
      while (nextXp >= xpNeeded) {
        nextXp -= xpNeeded;
        nextLevel += 1;
        didLevelUp = true;
        xpNeeded = getXpForNextLevel(nextLevel);
      }

      if (didLevelUp) {
        soundManager.playLevelUp();
        const levelUpBonus = Math.min(200, 20 + nextLevel * 10);
        coinsGained += levelUpBonus; // Level up reward coins!
        notifyLevelUpReward(nextLevel, levelUpBonus);
      }

      const isNewHighScore = finalScore > playerState.stats.highestScore;

      // Update Player State
      const currentHistory = playerState.stats.scoreHistory || [];
      const updatedHistory = [...currentHistory, finalScore].slice(-10);

      const nextStats = {
        ...playerState.stats,
        gamesPlayed: playerState.stats.gamesPlayed + 1,
        totalStarsTapped: playerState.stats.totalStarsTapped + finalStats.starsTapped,
        normalTapped: playerState.stats.normalTapped + finalStats.normal,
        goldenTapped: playerState.stats.goldenTapped + finalStats.golden,
        diamondTapped: playerState.stats.diamondTapped + finalStats.diamond,
        bombsAvoided: playerState.stats.bombsAvoided + finalStats.bombsAvoided,
        bombsHit: playerState.stats.bombsHit + finalStats.bombsHit,
        highestScore: Math.max(playerState.stats.highestScore, finalScore),
        highestCombo: Math.max(playerState.stats.highestCombo, finalStats.maxCombo),
        totalCoinsEarned: playerState.stats.totalCoinsEarned + coinsGained,
        totalXpEarned: playerState.stats.totalXpEarned + xpGained,
        scoreHistory: updatedHistory,
      };

      setPlayerState((prev) => ({
        ...prev,
        coins: prev.coins + coinsGained,
        xp: nextXp,
        level: nextLevel,
        activeBoosters: nextBoosters,
        stats: nextStats,
      }));

      // Update Leaderboard if new record
      if (isNewHighScore) {
        const userEntry: LeaderboardEntry = {
          id: userId || 'user_record',
          name: playerState.name,
          score: finalScore,
          level: nextLevel,
          avatar: getAvatarById(playerState.avatar).emoji,
          flag: '🇲🇽',
          date: 'Hoy',
          isUser: true,
        };
        const updatedLb = [userEntry, ...leaderboard.filter((l) => !l.isUser)].sort(
          (a, b) => b.score - a.score
        );
        setLeaderboard(updatedLb);
        saveLeaderboard(updatedLb);
        if (userId) {
          saveScoreToCloudLeaderboard(userId, userEntry);
        }
      }

      // Update Quests Progress
      setQuests((prevQuests) => {
        const updated = prevQuests.map((q) => {
          let newProgress = q.progress;
          if (q.id === 'quest_1') newProgress += finalStats.golden;
          if (q.id === 'quest_2') newProgress = Math.max(q.progress, finalScore);
          if (q.id === 'quest_3') newProgress = Math.max(q.progress, finalStats.maxCombo);
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target,
          };
        });
        localStorage.setItem('star_tap_daily_quests', JSON.stringify(updated));
        return updated;
      });

      // Update Achievements Progress
      setAchievements((prevAch) => {
        const newlyUnlockedAtGameOver: Achievement[] = [];
        const updated = prevAch.map((ach) => {
          let newProgress = ach.progress;
          if (ach.id === 'first_game') newProgress = 1;
          if (ach.id === 'tap_50_stars') newProgress = nextStats.totalStarsTapped;
          if (ach.id === 'tap_250_stars') newProgress = nextStats.totalStarsTapped;
          if (ach.id === 'tap_1000_stars') newProgress = nextStats.totalStarsTapped;
          if (ach.id === 'diamond_collector') newProgress = nextStats.diamondTapped;
          if (ach.id === 'golden_star_master') newProgress = nextStats.goldenTapped;
          if (ach.id === 'combo_10') newProgress = Math.max(ach.progress, finalStats.maxCombo);
          if (ach.id === 'combo_20') newProgress = Math.max(ach.progress, finalStats.maxCombo);
          if (ach.id === 'combo_30') newProgress = Math.max(ach.progress, finalStats.maxCombo);
          if (ach.id === 'score_300') newProgress = Math.max(ach.progress, finalScore);
          if (ach.id === 'score_700') newProgress = Math.max(ach.progress, finalScore);
          if (ach.id === 'score_1500') newProgress = Math.max(ach.progress, finalScore);
          if (ach.id === 'bomb_dodger' && finalStats.bombsHit === 0) newProgress = 1;
          if (ach.id === 'bombs_avoided_50') newProgress = nextStats.bombsAvoided;
          if (ach.id === 'coins_1000') newProgress = nextStats.totalCoinsEarned;
          if (ach.id === 'coins_5000') newProgress = nextStats.totalCoinsEarned;
          if (ach.id === 'reach_level_5') newProgress = nextLevel;
          if (ach.id === 'reach_level_10') newProgress = nextLevel;
          if (ach.id === 'skin_collector') newProgress = playerState.unlockedSkins.length;
          if (ach.id === 'full_armory') newProgress = playerState.unlockedSkins.length;

          const isUnlocked = newProgress >= ach.target;
          if (isUnlocked && !ach.unlocked) {
            newlyUnlockedAtGameOver.push({ ...ach, progress: newProgress, unlocked: true });
          }

          return {
            ...ach,
            progress: newProgress,
            unlocked: isUnlocked,
          };
        });

        if (newlyUnlockedAtGameOver.length > 0) {
          const gameOverToasts: ToastItem[] = newlyUnlockedAtGameOver.map((ach) => ({
            id: ach.id,
            type: 'achievement',
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            rewardCoins: ach.rewardCoins,
            rewardXp: ach.rewardXp,
          }));
          setToastQueue((prev) => [...prev, ...gameOverToasts]);
        }

        saveAchievements(updated);
        return updated;
      });

      // Set GameOver Display Data
      setGameOverData({
        score: finalScore,
        stats: finalStats,
        coinsEarned: coinsGained,
        xpEarned: xpGained,
        isNewHighScore,
        didLevelUp,
        newLevel: nextLevel,
        hasDoubledCoins: false,
        duelResult,
      });

      // Launch native AdMob Interstitial placement (does not grant rewards)
      showInterstitialAd().catch((err) =>
        console.warn('AdMob Interstitial trigger error:', err)
      );
    },
    [playerState, leaderboard, gameMode, duelGhostRival]
  );

  // Double Coins Reward Action (Google AdMob Rewarded SDK flow)
  const handleDoubleCoins = async () => {
    if (!gameOverData || gameOverData.hasDoubledCoins) return;

    const res = await showRewardedAd();
    if (res.rewarded) {
      soundManager.playCoin();
      hapticManager.success();
      const extraCoins = gameOverData.coinsEarned;

      setPlayerState((prev) => {
        const nextCoins = prev.coins + extraCoins;
        const nextStats = {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + extraCoins,
        };
        const newState = {
          ...prev,
          coins: nextCoins,
          stats: nextStats,
        };
        savePlayerState(newState);
        if (userId) savePlayerStateToCloud(userId, newState);
        return newState;
      });

      setGameOverData((prev) =>
        prev
          ? {
              ...prev,
              coinsEarned: prev.coinsEarned * 2,
              hasDoubledCoins: true,
            }
          : null
      );

      setToastQueue((prev) => [
        ...prev,
        {
          id: `double_coins_${Date.now()}`,
          type: 'achievement',
          title: playerState.language === 'en' ? 'Coins Doubled!' : '¡Monedas Duplicadas!',
          description: playerState.language === 'en' ? `+${extraCoins} bonus coins awarded!` : `¡+${extraCoins} monedas extra añadidas!`,
          icon: '🪙',
          rewardCoins: extraCoins,
          rewardXp: 0,
        },
      ]);
    } else {
      if (res.error === 'not_available_on_web') {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_notice_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'AdMob Notice' : 'Aviso AdMob',
            description: playerState.language === 'en' ? 'Rewarded ads require the native Android/iOS app.' : 'Los anuncios recompensados están disponibles en la app móvil.',
            icon: '📱',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      } else {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_incomplete_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'Ad Cancelled' : 'Anuncio no completado',
            description: playerState.language === 'en' ? 'Watch full video to double your coins.' : 'Debes ver el video completo para duplicar monedas.',
            icon: '⚠️',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      }
    }
  };

  // 1v1 Multiplayer Match Flow Handlers
  const handleOpenMultiplayerLobby = () => {
    soundManager.playButtonClick();
    hapticManager.mediumTap();
    setGameOverData(null);
    setMultiplayerResultData(null);
    setShowMultiplayerLobby(true);
  };

  const handlePlayerSendEmote = (emoji: string) => {
    setPlayerState((prev) => {
      const nextEmotes = (prev.stats.emotesSent || 0) + 1;
      const nextStats = {
        ...prev.stats,
        emotesSent: nextEmotes,
      };
      const nextState = { ...prev, stats: nextStats };
      savePlayerState(nextState);
      return nextState;
    });

    setAchievements((prevAch) => {
      const newlyUnlocked: Achievement[] = [];
      const updated = prevAch.map((ach) => {
        let newProgress = ach.progress;
        if (ach.id === 'social_emotes_10') {
          newProgress = (playerState.stats.emotesSent || 0) + 1;
        }
        const isUnlocked = newProgress >= ach.target;
        if (isUnlocked && !ach.unlocked) {
          newlyUnlocked.push({ ...ach, progress: newProgress, unlocked: true });
        }
        return { ...ach, progress: newProgress, unlocked: isUnlocked };
      });

      if (newlyUnlocked.length > 0) {
        const toasts: ToastItem[] = newlyUnlocked.map((ach) => ({
          id: ach.id,
          type: 'achievement',
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          rewardCoins: ach.rewardCoins,
          rewardXp: ach.rewardXp,
        }));
        setToastQueue((prev) => [...prev, ...toasts]);
      }
      saveAchievements(updated);
      return updated;
    });
  };

  const handleMatchFound = (
    arena: MultiplayerArena,
    opponent: MultiplayerOpponent,
    isPrivateRoom?: boolean
  ) => {
    // Deduct entry fee
    setPlayerState((prev) => {
      const nextCoins = Math.max(0, prev.coins - arena.entryFee);
      const nextFriendly = isPrivateRoom
        ? (prev.stats.friendlyDuelsPlayed || 0) + 1
        : (prev.stats.friendlyDuelsPlayed || 0);
      const nextState = {
        ...prev,
        coins: nextCoins,
        stats: {
          ...prev.stats,
          friendlyDuelsPlayed: nextFriendly,
        },
      };
      savePlayerState(nextState);
      return nextState;
    });

    if (isPrivateRoom) {
      setAchievements((prevAch) => {
        const newlyUnlocked: Achievement[] = [];
        const updated = prevAch.map((ach) => {
          let newProgress = ach.progress;
          if (ach.id === 'social_private_room') {
            newProgress = 1;
          }
          const isUnlocked = newProgress >= ach.target;
          if (isUnlocked && !ach.unlocked) {
            newlyUnlocked.push({ ...ach, progress: newProgress, unlocked: true });
          }
          return { ...ach, progress: newProgress, unlocked: isUnlocked };
        });
        if (newlyUnlocked.length > 0) {
          const toasts: ToastItem[] = newlyUnlocked.map((ach) => ({
            id: ach.id,
            type: 'achievement',
            title: ach.title,
            description: ach.description,
            icon: ach.icon,
            rewardCoins: ach.rewardCoins,
            rewardXp: ach.rewardXp,
          }));
          setToastQueue((prev) => [...prev, ...toasts]);
        }
        saveAchievements(updated);
        return updated;
      });
    }

    setActiveMultiplayerArena(arena);
    setActiveMultiplayerOpponent(opponent);
    setShowMultiplayerLobby(false);
    setShowVersusShowdown(true);
  };

  const handleShowdownIntroComplete = () => {
    setShowVersusShowdown(false);
    setGameMode('duel');
    setIsPlaying(true);
  };

  const handleMultiplayerGameOver = (
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
  ) => {
    setIsPlaying(false);
    const arena = activeMultiplayerArena || ARENAS[0];
    const opponent = activeMultiplayerOpponent || {
      id: 'opp_default',
      name: 'Rival Estelar',
      avatar: '🦊',
      flag: '🌐',
      league: 'Plata',
      trophies: 450,
      winRate: 50,
      ping: 25,
      skillMultiplier: 1.0,
      targetScore: 280,
    };

    const trophiesDelta = isWinner ? arena.trophiesReward : -arena.trophiesLoss;
    const coinsDelta = isWinner ? arena.prizeCoins : Math.floor(arena.entryFee * 0.2);

    // Update Player Trophies and Multiplayer Stats
    let nextStatsUpdated: any = null;
    let nextTrophiesUpdated = 0;

    setPlayerState((prev) => {
      const curTrophies = prev.trophies || 0;
      const newTrophies = Math.max(0, curTrophies + trophiesDelta);
      const nextCoins = prev.coins + coinsDelta;
      const prevStreak = prev.stats.multiplayerStreak || 0;
      const newStreak = isWinner ? prevStreak + 1 : 0;
      const highestStreak = Math.max(prev.stats.highestStreak || 0, newStreak);
      const updatedArenas = Array.from(new Set([...(prev.stats.arenasPlayed || []), arena.id]));

      const nextStats = {
        ...prev.stats,
        multiplayerWins: (prev.stats.multiplayerWins || 0) + (isWinner ? 1 : 0),
        multiplayerLosses: (prev.stats.multiplayerLosses || 0) + (isWinner ? 0 : 1),
        multiplayerStreak: newStreak,
        highestStreak,
        arenasPlayed: updatedArenas,
        multiplayerMatchesPlayed: (prev.stats.multiplayerMatchesPlayed || 0) + 1,
        totalStarsTapped: prev.stats.totalStarsTapped + finalStats.starsTapped,
        goldenTapped: prev.stats.goldenTapped + finalStats.golden,
        diamondTapped: prev.stats.diamondTapped + finalStats.diamond,
        bombsAvoided: prev.stats.bombsAvoided + finalStats.bombsAvoided,
        totalCoinsEarned: prev.stats.totalCoinsEarned + coinsDelta,
      };

      nextStatsUpdated = nextStats;
      nextTrophiesUpdated = newTrophies;

      const nextState: PlayerState = {
        ...prev,
        trophies: newTrophies,
        coins: nextCoins,
        stats: nextStats,
      };
      savePlayerState(nextState);
      if (userId) savePlayerStateToCloud(userId, nextState);
      return nextState;
    });

    // Check & Unlock Multiplayer & Social Achievements
    setAchievements((prevAch) => {
      const newlyUnlocked: Achievement[] = [];
      const updated = prevAch.map((ach) => {
        let newProgress = ach.progress;
        if (ach.id === 'social_first_win' && isWinner) newProgress = Math.max(ach.progress, 1);
        if (ach.id === 'social_mp_win_5') newProgress = (nextStatsUpdated?.multiplayerWins || 0);
        if (ach.id === 'social_mp_win_20') newProgress = (nextStatsUpdated?.multiplayerWins || 0);
        if (ach.id === 'social_streak_3') newProgress = Math.max(ach.progress, nextStatsUpdated?.highestStreak || 0);
        if (ach.id === 'social_streak_5') newProgress = Math.max(ach.progress, nextStatsUpdated?.highestStreak || 0);
        if (ach.id === 'social_streak_10') newProgress = Math.max(ach.progress, nextStatsUpdated?.highestStreak || 0);
        if (ach.id === 'social_arenas_distinct_3') newProgress = (nextStatsUpdated?.arenasPlayed || []).length;
        if (ach.id === 'social_arenas_distinct_5') newProgress = (nextStatsUpdated?.arenasPlayed || []).length;
        if (ach.id === 'social_emotes_10') newProgress = (nextStatsUpdated?.emotesSent || 0);
        if (ach.id === 'social_private_room') newProgress = (nextStatsUpdated?.friendlyDuelsPlayed || 0);
        if (ach.id === 'social_trophies_500') newProgress = Math.max(ach.progress, nextTrophiesUpdated);

        const isUnlocked = newProgress >= ach.target;
        if (isUnlocked && !ach.unlocked) {
          newlyUnlocked.push({ ...ach, progress: newProgress, unlocked: true });
        }

        return {
          ...ach,
          progress: newProgress,
          unlocked: isUnlocked,
        };
      });

      if (newlyUnlocked.length > 0) {
        const toasts: ToastItem[] = newlyUnlocked.map((ach) => ({
          id: ach.id,
          type: 'achievement',
          title: ach.title,
          description: ach.description,
          icon: ach.icon,
          rewardCoins: ach.rewardCoins,
          rewardXp: ach.rewardXp,
        }));
        setToastQueue((prev) => [...prev, ...toasts]);
      }

      saveAchievements(updated);
      return updated;
    });

    setMultiplayerResultData({
      isWinner,
      playerScore,
      opponentScore,
      matchStats: finalStats,
      arena,
      opponent,
      trophiesDelta,
      coinsDelta,
    });
  };

  const handleMultiplayerRematch = () => {
    if (!activeMultiplayerArena) return;
    if (playerState.coins < activeMultiplayerArena.entryFee) {
      soundManager.playBombExplosion();
      hapticManager.heavyTap();
      return;
    }

    setMultiplayerResultData(null);
    // Deduct entry fee and replay showdown
    setPlayerState((prev) => {
      const nextCoins = Math.max(0, prev.coins - activeMultiplayerArena.entryFee);
      const nextState = { ...prev, coins: nextCoins };
      savePlayerState(nextState);
      return nextState;
    });

    setShowVersusShowdown(true);
  };

  const handleMultiplayerBackToLobby = () => {
    setMultiplayerResultData(null);
    setActiveMultiplayerOpponent(null);
    setShowMultiplayerLobby(true);
  };

  // Claim Quest Reward
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest || quest.claimed) return;

    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + quest.rewardCoins,
      xp: prev.xp + quest.rewardXp,
    }));

    setQuests((prev) => {
      const updated = prev.map((q) => (q.id === questId ? { ...q, claimed: true } : q));
      localStorage.setItem('star_tap_daily_quests', JSON.stringify(updated));
      return updated;
    });
  };

  // Claim Achievement Reward
  const handleClaimAchievement = (achId: string) => {
    const ach = achievements.find((a) => a.id === achId);
    if (!ach || ach.claimed) return;

    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + ach.rewardCoins,
      xp: prev.xp + ach.rewardXp,
    }));

    setAchievements((prev) => {
      const updated = prev.map((a) => (a.id === achId ? { ...a, claimed: true } : a));
      saveAchievements(updated);
      return updated;
    });
  };

  // Handle Splash Screen Finished
  const handleFinishSplash = () => {
    setShowSplashScreen(false);
    const todayStr = new Date().toISOString().split('T')[0];
    if (playerState.lastDailyClaim !== todayStr) {
      setTimeout(() => {
        setShowDailyBonusModal(true);
      }, 300);
    }
  };

  // Claim Daily Login Streak Reward
  const handleClaimDailyBonus = (reward: { coins: number; xp: number }, isDoubled = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const multiplier = isDoubled ? 2 : 1;
    const finalCoins = reward.coins * multiplier;
    const finalXp = reward.xp * multiplier;

    setPlayerState((prev) => {
      let nextXp = prev.xp + finalXp;
      let nextLevel = prev.level;
      let requiredXp = getXpForNextLevel(nextLevel);

      while (nextXp >= requiredXp) {
        nextXp -= requiredXp;
        nextLevel += 1;
        requiredXp = getXpForNextLevel(nextLevel);
        notifyLevelUpReward(nextLevel, nextLevel * 50);
      }

      const nextStats = {
        ...prev.stats,
        totalCoinsEarned: prev.stats.totalCoinsEarned + finalCoins,
        totalXpEarned: prev.stats.totalXpEarned + finalXp,
      };

      const newState: PlayerState = {
        ...prev,
        coins: prev.coins + finalCoins,
        xp: nextXp,
        level: nextLevel,
        dailyStreak: prev.dailyStreak + 1,
        lastDailyClaim: todayStr,
        stats: nextStats,
      };

      savePlayerState(newState);
      if (userId) savePlayerStateToCloud(userId, newState);
      return newState;
    });

    setToastQueue((prev) => [
      ...prev,
      {
        id: `daily_${Date.now()}`,
        type: 'quest',
        title: isDoubled ? '¡RECOMPENSA DIARIA x2!' : '¡RECOMPENSA DIARIA RECLAMADA!',
        description: `Has obtenido +${finalCoins} 🪙 y +${finalXp} XP.`,
        icon: isDoubled ? '👑' : '🎁',
        rewardCoins: finalCoins,
        rewardXp: finalXp,
      },
    ]);
  };

  const handleWatchAdDoubleDaily = async (reward: { coins: number; xp: number }) => {
    const res = await showRewardedAd();
    if (res.rewarded) {
      handleClaimDailyBonus(reward, true);
      setShowDailyBonusModal(false);
    } else {
      if (res.error === 'not_available_on_web') {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_notice_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'AdMob Notice' : 'Aviso AdMob',
            description: playerState.language === 'en' ? 'Rewarded ads require native Android/iOS.' : 'Los anuncios recompensados están disponibles en la app móvil.',
            icon: '📱',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      } else {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_incomplete_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'Ad Cancelled' : 'Anuncio no completado',
            description: playerState.language === 'en' ? 'Watch full video to double daily rewards.' : 'Debes ver el video completo para duplicar recompensa.',
            icon: '⚠️',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      }
    }
  };

  // Legacy shortcut for quests modal
  const handleClaimDailyLogin = () => {
    handleClaimDailyBonus({ coins: 35, xp: 25 }, false);
  };

  // Lucky Spin Reward Claim Handler
  const handleLuckySpinReward = (reward: { coins: number; xp: number; label: string; icon: string }) => {
    setPlayerState((prev) => {
      let nextCoins = prev.coins + reward.coins;
      let nextXp = prev.xp + reward.xp;
      let nextLevel = prev.level;
      let targetXp = getXpForNextLevel(nextLevel);

      while (nextXp >= targetXp) {
        nextXp -= targetXp;
        nextLevel += 1;
        targetXp = getXpForNextLevel(nextLevel);
        notifyLevelUpReward(nextLevel, 100);
      }

      const updated: PlayerState = {
        ...prev,
        coins: nextCoins,
        xp: nextXp,
        level: nextLevel,
      };

      savePlayerState(updated);
      if (userId) savePlayerStateToCloud(userId, updated);
      return updated;
    });

    setToastQueue((prev) => [
      ...prev,
      {
        id: `spin_${Date.now()}`,
        type: 'quest',
        title: '¡PREMIO RULETA CÓSMICA!',
        description: `Has ganado ${reward.label}`,
        icon: reward.icon || '🎡',
        rewardCoins: reward.coins,
        rewardXp: reward.xp,
      },
    ]);
  };

  // Extra Lucky Spin via AdMob Rewarded SDK
  const handleWatchAdForSpin = async () => {
    const res = await showRewardedAd();
    if (res.rewarded) {
      soundManager.playCoin();
      hapticManager.success();
      localStorage.removeItem('star_tap_last_spin_date');
      setToastQueue((prev) => [
        ...prev,
        {
          id: `extra_spin_${Date.now()}`,
          type: 'achievement',
          title: playerState.language === 'en' ? 'Extra Spin Unlocked!' : '¡Giro Extra Desbloqueado!',
          description: playerState.language === 'en' ? 'You can spin the Lucky Wheel again!' : '¡Ya puedes volver a girar la Ruleta Cósmica!',
          icon: '🎡',
          rewardCoins: 0,
          rewardXp: 0,
        },
      ]);
    } else {
      if (res.error === 'not_available_on_web') {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_notice_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'AdMob Notice' : 'Aviso AdMob',
            description: playerState.language === 'en' ? 'Rewarded ads require native Android/iOS.' : 'Los anuncios recompensados están disponibles en la app móvil.',
            icon: '📱',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      } else {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_incomplete_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'Ad Cancelled' : 'Anuncio no completado',
            description: playerState.language === 'en' ? 'Watch full video to get an extra spin.' : 'Mira el video completo para desbloquear un giro extra.',
            icon: '⚠️',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      }
    }
  };

  // Watch Rewarded Ad in Shop (+80 Coins)
  const handleWatchShopAd = async () => {
    const res = await showRewardedAd();
    if (res.rewarded) {
      soundManager.playCoin();
      hapticManager.success();
      setPlayerState((prev) => {
        const nextCoins = prev.coins + 80;
        const nextStats = {
          ...prev.stats,
          totalCoinsEarned: prev.stats.totalCoinsEarned + 80,
        };
        const newState = {
          ...prev,
          coins: nextCoins,
          stats: nextStats,
        };
        savePlayerState(newState);
        if (userId) savePlayerStateToCloud(userId, newState);
        return newState;
      });
      setToastQueue((prev) => [
        ...prev,
        {
          id: `shop_ad_${Date.now()}`,
          type: 'achievement',
          title: playerState.language === 'en' ? '+80 Coins Earned!' : '¡+80 Monedas Obtenidas!',
          description: playerState.language === 'en' ? 'Reward claimed from AdMob video.' : 'Recompensa acreditada por ver el anuncio.',
          icon: '🪙',
          rewardCoins: 80,
          rewardXp: 0,
        },
      ]);
    } else {
      if (res.error === 'not_available_on_web') {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_notice_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'AdMob Notice' : 'Aviso AdMob',
            description: playerState.language === 'en' ? 'Rewarded ads require native Android/iOS.' : 'Los anuncios recompensados están disponibles en la app móvil.',
            icon: '📱',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      } else {
        setToastQueue((prev) => [
          ...prev,
          {
            id: `ad_incomplete_${Date.now()}`,
            type: 'achievement',
            title: playerState.language === 'en' ? 'Ad Cancelled' : 'Anuncio no completado',
            description: playerState.language === 'en' ? 'Watch full video to get 80 free coins.' : 'Debes ver el video completo para recibir 80 monedas.',
            icon: '⚠️',
            rewardCoins: 0,
            rewardXp: 0,
          },
        ]);
      }
    }
  };

  // Watch Ad to Revive during Game
  const handleWatchAdForRevive = async (): Promise<boolean> => {
    const res = await showRewardedAd();
    if (res.rewarded) {
      return true;
    }
    if (res.error === 'not_available_on_web') {
      setToastQueue((prev) => [
        ...prev,
        {
          id: `ad_notice_${Date.now()}`,
          type: 'achievement',
          title: playerState.language === 'en' ? 'AdMob Notice' : 'Aviso AdMob',
          description: playerState.language === 'en' ? 'Rewarded ads require native Android/iOS.' : 'Los anuncios recompensados están disponibles en la app móvil.',
          icon: '📱',
          rewardCoins: 0,
          rewardXp: 0,
        },
      ]);
    } else {
      setToastQueue((prev) => [
        ...prev,
        {
          id: `ad_incomplete_${Date.now()}`,
          type: 'achievement',
          title: playerState.language === 'en' ? 'Ad Cancelled' : 'Anuncio no completado',
          description: playerState.language === 'en' ? 'Watch full video to revive.' : 'Debes ver el video completo para revivir.',
          icon: '⚠️',
          rewardCoins: 0,
          rewardXp: 0,
        },
      ]);
    }
    return false;
  };

  const handleSpendCoins = (amount: number) => {
    if (playerState.coins < amount) return false;
    const nextCoins = playerState.coins - amount;
    const updated: PlayerState = { ...playerState, coins: nextCoins };
    setPlayerState(updated);
    savePlayerState(updated);
    if (userId) savePlayerStateToCloud(userId, updated);
    return true;
  };

  // Shop Item Purchase / Equip
  const handleBuyOrEquipItem = (item: ShopItem) => {
    if (item.type === 'skin') {
      if (playerState.unlockedSkins.includes(item.id)) {
        setPlayerState((prev) => ({ ...prev, equippedSkin: item.id }));
      } else if (playerState.coins >= item.price) {
        soundManager.playCoin();
        setPlayerState((prev) => ({
          ...prev,
          coins: prev.coins - item.price,
          unlockedSkins: [...prev.unlockedSkins, item.id],
          equippedSkin: item.id,
        }));
      }
    } else if (item.type === 'theme') {
      if (playerState.unlockedThemes.includes(item.id)) {
        setPlayerState((prev) => ({ ...prev, equippedTheme: item.id }));
      } else if (playerState.coins >= item.price) {
        soundManager.playCoin();
        setPlayerState((prev) => ({
          ...prev,
          coins: prev.coins - item.price,
          unlockedThemes: [...prev.unlockedThemes, item.id],
          equippedTheme: item.id,
        }));
      }
    } else if (item.type === 'character') {
      if (playerState.unlockedCharacters.includes(item.id)) {
        setPlayerState((prev) => ({ ...prev, equippedCharacter: item.id }));
      } else if (playerState.coins >= item.price) {
        soundManager.playCoin();
        setPlayerState((prev) => ({
          ...prev,
          coins: prev.coins - item.price,
          unlockedCharacters: [...prev.unlockedCharacters, item.id],
          equippedCharacter: item.id,
        }));
      }
    }
  };

  // Upgrade Powerup Level
  const handleUpgradePowerup = (upgradeKey: string, cost: number) => {
    const currentLvl = playerState.upgrades[upgradeKey] || 0;
    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      upgrades: {
        ...prev.upgrades,
        [upgradeKey]: currentLvl + 1,
      },
    }));
  };

  // Update Player Profile Name
  const handleUpdateName = (newName: string) => {
    const avatarEmoji = getAvatarById(playerState.avatar).emoji;
    setPlayerState((prev) => ({ ...prev, name: newName }));
    setLeaderboard((prevLb) => {
      const updated = prevLb.map((l) => (l.isUser ? { ...l, name: newName, avatar: avatarEmoji } : l));
      saveLeaderboard(updated);
      return updated;
    });

    if (userId) {
      const userEntry: LeaderboardEntry = {
        id: userId,
        name: newName,
        score: playerState.stats.highestScore,
        level: playerState.level,
        avatar: avatarEmoji,
        flag: '🇲🇽',
        date: 'Hoy',
        isUser: true,
      };
      saveScoreToCloudLeaderboard(userId, userEntry);
    }
  };

  const handleSelectAvatar = (avatarId: string) => {
    const avatarItem = getAvatarById(avatarId);
    setPlayerState((prev) => {
      const updated = { ...prev, avatar: avatarId };
      savePlayerState(updated);
      if (userId) savePlayerStateToCloud(userId, updated);
      return updated;
    });

    setLeaderboard((prevLb) => {
      const updated = prevLb.map((l) => (l.isUser ? { ...l, avatar: avatarItem.emoji } : l));
      saveLeaderboard(updated);
      return updated;
    });

    if (userId) {
      const userEntry: LeaderboardEntry = {
        id: userId,
        name: playerState.name,
        score: playerState.stats.highestScore,
        level: playerState.level,
        avatar: avatarItem.emoji,
        flag: '🇲🇽',
        date: 'Hoy',
        isUser: true,
      };
      saveScoreToCloudLeaderboard(userId, userEntry);
    }
  };

  // Onboarding Tutorial Handlers
  const handleCompleteTutorial = () => {
    setIsTutorialActive(false);
    setPlayerState((prev) => {
      const updated = { ...prev, hasSeenTutorial: true };
      savePlayerState(updated);
      if (userId) savePlayerStateToCloud(userId, updated);
      return updated;
    });
  };

  const handleReplayTutorial = () => {
    setActiveModal(null);
    setIsTutorialActive(true);
  };

  // Sync Sound and Haptic Managers with playerState
  useEffect(() => {
    soundManager.setMuted(!playerState.soundEnabled);
    hapticManager.setEnabled(playerState.hapticsEnabled ?? true);
  }, [playerState.soundEnabled, playerState.hapticsEnabled]);

  // Update Interface Language Preference
  const handleUpdateLanguage = (newLang: 'es' | 'en') => {
    setPlayerState((prev) => {
      const updated = { ...prev, language: newLang };
      savePlayerState(updated);
      if (userId) savePlayerStateToCloud(userId, updated);
      return updated;
    });
  };

  // Update Haptics / Vibration Preference
  const handleToggleHaptics = (enabled: boolean) => {
    setPlayerState((prev) => {
      const updated = { ...prev, hapticsEnabled: enabled };
      savePlayerState(updated);
      if (userId) savePlayerStateToCloud(userId, updated);
      return updated;
    });
    hapticManager.setEnabled(enabled);
  };

  // Update Daily Quest Push Reminders Preference
  const handleToggleQuestReminders = (enabled: boolean) => {
    setPlayerState((prev) => {
      const updated = { ...prev, questRemindersEnabled: enabled };
      savePlayerState(updated);
      if (userId) savePlayerStateToCloud(userId, updated);
      return updated;
    });
    toggleDailyQuestReminder(enabled);
  };

  // Friends List & Direct Challenges Management
  const handleUpdateFriends = (updated: Friend[]) => {
    setFriends(updated);
    saveFriends(updated);
  };

  const handleUpdateChallenges = (updated: DirectChallenge[]) => {
    setDirectChallenges(updated);
    saveDirectChallenges(updated);
  };

  const handleQuickAddFriend = (nameOrId: string) => {
    const myCode = getMyPlayerCode(userId);
    const result = addFriendByIdOrName(nameOrId, friends, leaderboard, myCode);
    if (result.success && result.updatedFriends) {
      handleUpdateFriends(result.updatedFriends);
      setToastQueue((prev) => [
        ...prev,
        {
          id: `friend_added_${Date.now()}`,
          title: playerState.language === 'en' ? 'Friend Added!' : '¡Amigo Añadido!',
          description: result.message,
          icon: '👥',
          type: 'achievement',
        },
      ]);
    }
  };

  const handleStartDirectMatch = (friend: Friend, mode: GameMode, targetScore?: number) => {
    setDuelGhostRival({
      id: friend.id,
      name: friend.name,
      score: targetScore || friend.highScore,
      avatar: getAvatarById(friend.avatar).emoji || '⭐',
      flag: friend.flag || '🌍',
      level: friend.level || 1,
    });
    setGameMode(mode === 'duel' ? 'duel' : mode);
    setActiveModal(null);
    setIsPlaying(false);
  };

  // Get active Theme background style class
  const getThemeBackground = () => {
    switch (playerState.equippedTheme) {
      case 'theme_vaporwave':
        return 'bg-gradient-to-b from-purple-950 via-pink-950 to-slate-950';
      case 'theme_cybercity':
        return 'bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950';
      case 'theme_candy_world':
        return 'bg-gradient-to-b from-pink-950 via-purple-900 to-slate-950';
      case 'theme_space':
      default:
        return 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950';
    }
  };

  return (
    <div className={`w-full h-screen ${getThemeBackground()} flex flex-col items-center justify-center overflow-hidden font-sans select-none`}>
      {/* Outer Shell Wrapper (Mobile Frame or Desktop view) */}
      <div
        className={`relative flex flex-col w-full h-full transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[420px] max-h-[840px] border-8 border-slate-800 rounded-[40px] shadow-2xl overflow-hidden my-auto ring-1 ring-slate-700'
            : 'max-w-4xl h-full'
        }`}
      >
        {/* Android Notch Bar if Mobile Frame */}
        {isMobileFrame && (
          <div className="w-full bg-slate-950 h-6 flex items-center justify-center relative z-40">
            <div className="w-20 h-3 bg-slate-800 rounded-full" />
          </div>
        )}

        {/* Top Header Navigation */}
        <HeaderHUD
          playerState={playerState}
          gameMode={gameMode}
          setGameMode={setGameMode}
          isPlaying={isPlaying}
          onOpenShop={() => setActiveModal('shop')}
          onOpenQuests={() => setActiveModal('quests')}
          onOpenAchievements={() => setActiveModal('achievements')}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenFriends={() => setActiveModal('friends')}
          hasPendingChallenges={directChallenges.some((c) => c.status === 'pending')}
          onOpenStats={() => setActiveModal('stats')}
          onOpenProfile={() => setActiveModal('profile')}
          onOpenMultiplayer={handleOpenMultiplayerLobby}
          onToggleSound={() =>
            setPlayerState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame((v) => !v)}
          hasUnclaimedQuests={hasUnclaimedQuests}
          hasUnclaimedAchievements={hasUnclaimedAchievements}
          hasUnclaimedDailyReward={playerState.lastDailyClaim !== new Date().toISOString().split('T')[0]}
          onOpenDailyRewards={() => setShowDailyBonusModal(true)}
          onOpenLuckySpin={() => setShowLuckySpinModal(true)}
          hasFreeLuckySpin={localStorage.getItem('star_tap_last_spin_date') !== new Date().toISOString().split('T')[0]}
        />

        {/* Core Gameboard Component */}
        <main className="relative flex-1 w-full h-full overflow-hidden">
          <GameBoard
            isPlaying={isPlaying}
            gameMode={gameMode}
            setGameMode={setGameMode}
            playerState={playerState}
            duelGhostRival={duelGhostRival}
            onSelectDuelRival={() => setActiveModal('leaderboard')}
            multiplayerOpponent={activeMultiplayerOpponent}
            multiplayerArena={activeMultiplayerArena}
            onOpenMultiplayerLobby={handleOpenMultiplayerLobby}
            onMultiplayerGameOver={handleMultiplayerGameOver}
            onGameOver={handleGameOver}
            onStartGame={handleStartGame}
            onLiveProgress={handleLiveProgress}
            onToggleSound={() =>
              setPlayerState((prev) => {
                const nextState = { ...prev, soundEnabled: !prev.soundEnabled };
                savePlayerState(nextState);
                return nextState;
              })
            }
            onToggleHaptics={() =>
              setPlayerState((prev) => {
                const nextState = { ...prev, hapticsEnabled: !prev.hapticsEnabled };
                savePlayerState(nextState);
                return nextState;
              })
            }
            onSpendCoins={handleSpendCoins}
            onWatchAdForRevive={handleWatchAdForRevive}
            onSendEmote={handlePlayerSendEmote}
          />
        </main>
      </div>

      {/* Real-Time Achievement & Quest Unlock Toast Notification */}
      {activeAchievementToast && (
        <AchievementToast
          item={activeAchievementToast}
          lang={playerState.language || 'es'}
          onClose={() => setActiveAchievementToast(null)}
        />
      )}

      {/* Modals & Popups */}
      {gameOverData && (
        <GameOverModal
          score={gameOverData.score}
          stats={gameOverData.stats}
          coinsEarned={gameOverData.coinsEarned}
          xpEarned={gameOverData.xpEarned}
          isNewHighScore={gameOverData.isNewHighScore}
          didLevelUp={gameOverData.didLevelUp}
          newLevel={gameOverData.newLevel}
          duelResult={gameOverData.duelResult}
          onPlayAgain={handleStartGame}
          onGoHome={() => setGameOverData(null)}
          onDoubleCoins={handleDoubleCoins}
          hasDoubledCoins={gameOverData.hasDoubledCoins}
          language={playerState.language}
        />
      )}

      {activeModal === 'shop' && (
        <ShopModal
          playerState={playerState}
          onClose={() => setActiveModal(null)}
          onBuyOrEquipItem={handleBuyOrEquipItem}
          onUpgradePowerup={handleUpgradePowerup}
          onWatchAd={handleWatchShopAd}
          onUpdatePlayerState={(newState) => {
            setPlayerState(newState);
            savePlayerState(newState);
            if (userId) savePlayerStateToCloud(userId, newState);
          }}
        />
      )}

      {activeModal === 'quests' && (
        <QuestsModal
          playerState={playerState}
          quests={quests}
          onClose={() => setActiveModal(null)}
          onClaimQuest={handleClaimQuest}
          onClaimDailyLogin={handleClaimDailyLogin}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          achievements={achievements}
          playerState={playerState}
          language={playerState.language}
          onClose={() => setActiveModal(null)}
          onClaimAchievement={handleClaimAchievement}
          onOpenMultiplayer={handleOpenMultiplayerLobby}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          leaderboard={leaderboard}
          playerState={playerState}
          onClose={() => setActiveModal(null)}
          onAddFriend={handleQuickAddFriend}
          onOpenFriends={() => setActiveModal('friends')}
          onStartDuel={(entry) => {
            setDuelGhostRival({
              id: entry.id,
              name: entry.name,
              score: entry.score,
              avatar: entry.avatar || '⭐',
              flag: entry.flag || '🌍',
              level: entry.level || 1,
            });
            setGameMode('duel');
            setActiveModal(null);
            setIsPlaying(false);
          }}
        />
      )}

      {activeModal === 'friends' && (
        <FriendsModal
          playerState={playerState}
          friends={friends}
          directChallenges={directChallenges}
          leaderboard={leaderboard}
          userId={userId}
          onClose={() => setActiveModal(null)}
          onUpdateFriends={handleUpdateFriends}
          onUpdateChallenges={handleUpdateChallenges}
          onStartDirectMatch={handleStartDirectMatch}
        />
      )}

      {activeModal === 'stats' && (
        <StatsModal
          playerState={playerState}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'profile' && (
        <ProfileModal
          playerState={playerState}
          currentUser={currentUser}
          onClose={() => setActiveModal(null)}
          onUpdateName={handleUpdateName}
          onUpdateLanguage={handleUpdateLanguage}
          onToggleHaptics={handleToggleHaptics}
          onToggleQuestReminders={handleToggleQuestReminders}
          onOpenAuth={() => setActiveModal('auth')}
          onOpenEuConsent={() => setShowEuConsentModal(true)}
          onOpenAvatarSelector={() => setActiveModal('avatar')}
          onOpenFriends={() => setActiveModal('friends')}
          onReplayTutorial={handleReplayTutorial}
        />
      )}

      {activeModal === 'avatar' && (
        <AvatarSelectorModal
          playerState={playerState}
          onClose={() => setActiveModal('profile')}
          onSelectAvatar={(avatarId) => {
            handleSelectAvatar(avatarId);
            setActiveModal('profile');
          }}
        />
      )}

      {activeModal === 'auth' && (
        <AuthModal
          currentUser={currentUser}
          playerState={playerState}
          lang={playerState.language || 'es'}
          onClose={() => setActiveModal(null)}
          onAuthStateUpdated={(updatedState) => {
            if (updatedState) {
              setPlayerState(updatedState);
            }
          }}
        />
      )}

      {showEuConsentModal && (
        <EuConsentModal
          lang={playerState.language || 'es'}
          onClose={() => {
            setShowEuConsentModal(false);
          }}
        />
      )}

      {isTutorialActive && !isPlaying && !showEuConsentModal && (
        <TutorialOverlay
          playerState={playerState}
          onComplete={handleCompleteTutorial}
          onStartGame={handleStartGame}
        />
      )}

      {/* Daily Login Bonus 7-Day Calendar Modal */}
      {showDailyBonusModal && !showSplashScreen && (
        <DailyLoginBonusModal
          playerState={playerState}
          language={playerState.language}
          onClaimReward={(reward) => {
            handleClaimDailyBonus(reward, false);
            setShowDailyBonusModal(false);
          }}
          onWatchAdDouble={(reward) => {
            handleWatchAdDoubleDaily(reward);
          }}
          onClose={() => setShowDailyBonusModal(false)}
        />
      )}

      {/* Cosmic Lucky Spin Wheel Modal */}
      {showLuckySpinModal && !showSplashScreen && (
        <LuckySpinModal
          playerState={playerState}
          language={playerState.language}
          onSpinRewardEarned={handleLuckySpinReward}
          onWatchAdForSpin={handleWatchAdForSpin}
          onClose={() => setShowLuckySpinModal(false)}
        />
      )}

      {/* 1v1 Real-Time Multiplayer Lobby Modal */}
      {showMultiplayerLobby && !showSplashScreen && (
        <MultiplayerLobbyModal
          playerState={playerState}
          language={playerState.language}
          onClose={() => setShowMultiplayerLobby(false)}
          onMatchFound={handleMatchFound}
        />
      )}

      {/* Cinematic Versus 3-2-1 Showdown Screen */}
      {showVersusShowdown && activeMultiplayerArena && activeMultiplayerOpponent && (
        <MultiplayerVersusShowdown
          playerState={playerState}
          opponent={activeMultiplayerOpponent}
          arena={activeMultiplayerArena}
          onIntroComplete={handleShowdownIntroComplete}
          language={playerState.language}
        />
      )}

      {/* Multiplayer Match Post-Game Results Screen */}
      {multiplayerResultData && (
        <MultiplayerResultModal
          isWinner={multiplayerResultData.isWinner}
          playerScore={multiplayerResultData.playerScore}
          opponentScore={multiplayerResultData.opponentScore}
          playerState={playerState}
          opponent={multiplayerResultData.opponent}
          arena={multiplayerResultData.arena}
          trophiesDelta={multiplayerResultData.trophiesDelta}
          coinsDelta={multiplayerResultData.coinsDelta}
          matchStats={multiplayerResultData.matchStats}
          onRematch={handleMultiplayerRematch}
          onBackToLobby={handleMultiplayerBackToLobby}
          onGoHome={() => {
            setMultiplayerResultData(null);
            setActiveMultiplayerOpponent(null);
          }}
          language={playerState.language}
        />
      )}

      {/* Cinematic Splash & Loading Screen */}
      {showSplashScreen && (
        <SplashScreen
          onFinish={handleFinishSplash}
          language={playerState.language}
        />
      )}
    </div>
  );
}
