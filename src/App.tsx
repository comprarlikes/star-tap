import React, { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  GameMode, 
  PlayerState, 
  ShopItem, 
  Achievement, 
  Quest, 
  LeaderboardEntry,
  GhostRival 
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
import { LeaderboardModal } from './components/LeaderboardModal';
import { StatsModal } from './components/StatsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { AppOpenAdModal } from './components/AppOpenAdModal';
import { EuConsentModal } from './components/EuConsentModal';
import { initializeAdMob, prepareAndShowInterstitialAd } from './services/admob';
import { hapticManager } from './services/haptics';
import { 
  initNotifications, 
  notifyDailyQuestsUpdated, 
  notifyLevelUpReward, 
  scheduleDailyQuestReminder 
} from './services/notifications';
import { Smartphone } from 'lucide-react';

export default function App() {
  const [playerState, setPlayerState] = useState<PlayerState>(loadPlayerState);
  const [gameMode, setGameMode] = useState<GameMode>('blitz');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [duelGhostRival, setDuelGhostRival] = useState<GhostRival | null>(null);
  const [showAppOpenAd, setShowAppOpenAd] = useState<boolean>(true);
  const [showEuConsentModal, setShowEuConsentModal] = useState<boolean>(() => {
    return localStorage.getItem('eu_gdpr_consent_accepted') !== 'true';
  });

  // Modals
  const [activeModal, setActiveModal] = useState<
    'shop' | 'quests' | 'achievements' | 'leaderboard' | 'stats' | 'profile' | 'auth' | null
  >(null);

  // Quests & Achievements Data
  const [quests, setQuests] = useState<Quest[]>(generateDailyQuests);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard);

  // Initialize Firebase Auth, Realtime Cloud Sync, AdMob & Push Notifications
  useEffect(() => {
    initializeAdMob();

    // Initialize Push & Local Notifications
    initNotifications().then((granted) => {
      console.log('[App] Push notifications granted:', granted);
      scheduleDailyQuestReminder();

      // Notify daily quests updated if not notified today
      const todayStr = new Date().toISOString().split('T')[0];
      const lastNotified = localStorage.getItem('star_tap_last_quest_notified');
      if (lastNotified !== todayStr) {
        notifyDailyQuestsUpdated(quests.length);
        localStorage.setItem('star_tap_last_quest_notified', todayStr);
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

      // Base Coins Calculation (1 pt = 1 coin)
      let coinsGained = Math.max(10, Math.floor(finalScore * 1.0));

      // Companion Bonus: Astro Dog (+15% Coins)
      if (playerState.equippedCharacter === 'char_astro_dog') {
        coinsGained = Math.floor(coinsGained * 1.15);
      }

      // Skin Bonus: Dulce Caramelo (+10% Coins)
      if (playerState.equippedSkin === 'skin_candy') {
        coinsGained = Math.floor(coinsGained * 1.10);
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
        const bonusCoins = isVictory ? 150 : 0;
        const bonusXp = isVictory ? 200 : 0;
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
        const levelUpBonus = nextLevel * 50;
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
        stats: nextStats,
      }));

      // Update Leaderboard if new record
      if (isNewHighScore) {
        const userEntry: LeaderboardEntry = {
          id: userId || 'user_record',
          name: playerState.name,
          score: finalScore,
          level: nextLevel,
          avatar: '⭐',
          flag: '🇪🇸',
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
        const updated = prevAch.map((ach) => {
          let newProgress = ach.progress;
          if (ach.id === 'first_game') newProgress = 1;
          if (ach.id === 'tap_50_stars') newProgress = nextStats.totalStarsTapped;
          if (ach.id === 'tap_250_stars') newProgress = nextStats.totalStarsTapped;
          if (ach.id === 'diamond_collector') newProgress = nextStats.diamondTapped;
          if (ach.id === 'combo_10') newProgress = Math.max(ach.progress, finalStats.maxCombo);
          if (ach.id === 'combo_20') newProgress = Math.max(ach.progress, finalStats.maxCombo);
          if (ach.id === 'score_300') newProgress = Math.max(ach.progress, finalScore);
          if (ach.id === 'score_700') newProgress = Math.max(ach.progress, finalScore);
          if (ach.id === 'bomb_dodger' && finalStats.bombsHit === 0) newProgress = 1;
          if (ach.id === 'coins_1000') newProgress = nextStats.totalCoinsEarned;
          if (ach.id === 'reach_level_5') newProgress = nextLevel;
          if (ach.id === 'skin_collector') newProgress = playerState.unlockedSkins.length;

          const isUnlocked = newProgress >= ach.target;
          return {
            ...ach,
            progress: newProgress,
            unlocked: isUnlocked,
          };
        });
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

      // Launch native AdMob Interstitial / Rewarded Interstitial Ad placement
      prepareAndShowInterstitialAd().catch((err) =>
        console.warn('AdMob trigger error:', err)
      );
    },
    [playerState, leaderboard, gameMode, duelGhostRival]
  );

  // Double Coins Reward Action
  const handleDoubleCoins = () => {
    if (!gameOverData || gameOverData.hasDoubledCoins) return;

    soundManager.playCoin();
    const extraCoins = gameOverData.coinsEarned;

    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + extraCoins,
      stats: {
        ...prev.stats,
        totalCoinsEarned: prev.stats.totalCoinsEarned + extraCoins,
      },
    }));

    setGameOverData((prev) =>
      prev
        ? {
            ...prev,
            coinsEarned: prev.coinsEarned * 2,
            hasDoubledCoins: true,
          }
        : null
    );
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

  // Claim Daily Login Streak Reward
  const handleClaimDailyLogin = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (playerState.lastDailyClaim === todayStr) return;

    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + 300,
      dailyStreak: prev.dailyStreak + 1,
      lastDailyClaim: todayStr,
    }));
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
    setPlayerState((prev) => ({ ...prev, name: newName }));
    setLeaderboard((prevLb) => {
      const updated = prevLb.map((l) => (l.isUser ? { ...l, name: newName } : l));
      saveLeaderboard(updated);
      return updated;
    });

    if (userId) {
      const userEntry: LeaderboardEntry = {
        id: userId,
        name: newName,
        score: playerState.stats.highestScore,
        level: playerState.level,
        avatar: '⭐',
        flag: '🇪🇸',
        date: 'Hoy',
        isUser: true,
      };
      saveScoreToCloudLeaderboard(userId, userEntry);
    }
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
          onOpenStats={() => setActiveModal('stats')}
          onOpenProfile={() => setActiveModal('profile')}
          onToggleSound={() =>
            setPlayerState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
          }
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame((v) => !v)}
          hasUnclaimedQuests={hasUnclaimedQuests}
          hasUnclaimedAchievements={hasUnclaimedAchievements}
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
            onGameOver={handleGameOver}
            onStartGame={handleStartGame}
          />
        </main>
      </div>

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
          onWatchAd={() => {
            prepareAndShowInterstitialAd();
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
          onClose={() => setActiveModal(null)}
          onClaimAchievement={handleClaimAchievement}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          leaderboard={leaderboard}
          playerState={playerState}
          onClose={() => setActiveModal(null)}
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
          onOpenAuth={() => setActiveModal('auth')}
          onOpenEuConsent={() => setShowEuConsentModal(true)}
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
            setShowAppOpenAd(true);
          }}
        />
      )}

      {showAppOpenAd && !showEuConsentModal && (
        <AppOpenAdModal
          adUnitId="ca-app-pub-4623925469377930/2039134652"
          onClose={() => setShowAppOpenAd(false)}
          onRewardCoins={(coins) => {
            setPlayerState((prev) => {
              const newState = { ...prev, coins: prev.coins + coins };
              savePlayerState(newState);
              if (userId) savePlayerStateToCloud(userId, newState);
              return newState;
            });
          }}
        />
      )}
    </div>
  );
}
