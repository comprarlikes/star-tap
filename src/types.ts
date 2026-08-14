export type GameMode = 'blitz' | 'endless' | 'fever' | 'zen' | 'duel';

export interface GhostRival {
  id: string;
  name: string;
  score: number;
  avatar: string;
  flag: string;
  level: number;
}

export type StarType = 
  | 'normal'     // ⭐ +1 pt
  | 'golden'     // 🌟 +5 pts
  | 'diamond'    // 💎 +20 pts
  | 'bomb'       // ❌ -10 pts, breaks combo
  | 'multiplier2'// ✨ x2 multiplier for 10s
  | 'multiplier5'// 🚀 x5 multiplier for 8s
  | 'timeBonus'  // ⏱️ +3 seconds
  | 'shield'     // 🛡️ Bomb shield
  | 'freeze'     // ❄️ Freeze star timer for 5s
  | 'rainbow'    // 🌈 +50 pts + mini star burst
  | 'magnet';    // 🧲 Star Magnet for 5s

export interface StarItem {
  id: string;
  type: StarType;
  x: number; // percentage 5..90
  y: number; // percentage 10..85
  size: number; // px size
  createdAt: number;
  duration: number; // ms before despawning
  scale: number;
  rotation: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}

export type ParticleShape = 'circle' | 'star' | 'spark' | 'ring' | 'smoke';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: ParticleShape;
  rotation?: number;
  vRot?: number;
  drag?: number;
  gravity?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: 'skin' | 'theme' | 'character' | 'upgrade';
  price: number;
  icon: string;
  unlocked: boolean;
  equipped?: boolean;
  level?: number;
  maxLevel?: number;
  color?: string;
  effectDescription?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardCoins: number;
  rewardXp: number;
  progress: number;
  target: number;
  unlocked: boolean;
  claimed: boolean;
  category?: 'all' | 'arcade' | 'social' | 'collection';
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  avatar: string;
  flag: string;
  date: string;
  isUser?: boolean;
}

export interface TournamentRewardTier {
  rankRange: string;
  percentage: number;
  coins: number;
  badge: string;
}

export interface WeeklyTournamentEntry extends LeaderboardEntry {
  tournamentScore: number;
  estimatedCoins: number;
  rankBadge?: string;
}

export interface WeeklyTournament {
  id: string;
  title: string;
  subtitle: string;
  endsAt: string;
  totalPrizePool: number;
  participantsCount: number;
  userRank: number;
  userScore: number;
  rewardTiers: TournamentRewardTier[];
  entries: WeeklyTournamentEntry[];
}

export interface PlayerStats {
  gamesPlayed: number;
  totalStarsTapped: number;
  normalTapped: number;
  goldenTapped: number;
  diamondTapped: number;
  bombsAvoided: number;
  bombsHit: number;
  highestScore: number;
  highestCombo: number;
  totalCoinsEarned: number;
  totalXpEarned: number;
  scoreHistory?: number[];
  multiplayerWins?: number;
  multiplayerLosses?: number;
  multiplayerStreak?: number;
  highestStreak?: number;
  arenasPlayed?: string[];
  emotesSent?: number;
  multiplayerMatchesPlayed?: number;
  friendlyDuelsPlayed?: number;
}

export interface MultiplayerArena {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  entryFee: number;
  prizeCoins: number;
  trophiesReward: number;
  trophiesLoss: number;
  minTrophies: number;
  icon: string;
  bgGradient: string;
  borderColor: string;
  badge: string;
}

export interface MultiplayerOpponent {
  id: string;
  name: string;
  avatar: string;
  flag: string;
  level: number;
  trophies: number;
  winStreak: number;
  country: string;
  pingMs: number;
  targetScore: number;
  personality: 'aggressive' | 'steady' | 'clutch' | 'speedy';
  skillMultiplier: number;
}

export interface LiveEmote {
  id: string;
  emoji: string;
  sender: 'player' | 'opponent';
  timestamp: number;
}

export type MysteryBoxRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface PlayerState {
  name: string;
  avatar?: string;
  coins: number;
  xp: number;
  level: number;
  trophies?: number;
  multiplayerWins?: number;
  multiplayerLosses?: number;
  multiplayerStreak?: number;
  highestTrophies?: number;
  language?: 'es' | 'en';
  equippedSkin: string;
  equippedTheme: string;
  equippedCharacter: string;
  upgrades: Record<string, number>;
  activeBoosters?: Record<string, number>;
  unlockedSkins: string[];
  unlockedThemes: string[];
  unlockedCharacters: string[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  questRemindersEnabled?: boolean;
  lastDailyClaim: string; // ISO date string YYYY-MM-DD
  dailyStreak: number;
  hasSeenTutorial?: boolean;
  stats: PlayerStats;
}
