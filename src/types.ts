export type GameMode = 'blitz' | 'endless' | 'fever' | 'zen' | 'duel' | 'campaign';

export interface CampaignLevel {
  id: number;
  chapter: number;
  constellation: string;
  constellationEn: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  mode: GameMode;
  targetScore: number;
  starRequirements: [number, number, number]; // Score thresholds for 1, 2, 3 stars
  targetDiamond?: number;
  targetGolden?: number;
  targetCombo?: number;
  noBombsAllowed?: boolean;
  timeLimit?: number; // seconds (if timed)
  rewardCoins: number;
  rewardXp: number;
  rewardTalentPoints?: number;
  isBoss?: boolean;
  icon: string;
}

export interface CampaignProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelId -> 1..3
  levelHighScores: Record<number, number>;
  claimedChapterRewards: string[]; // e.g. ['chapter_1', 'chapter_2']
}

export type TalentBranch = 'utility' | 'precision' | 'fortune' | 'defense' | 'economy';

export interface CosmicTalent {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  branch: TalentBranch;
  tier: number;
  maxRank: number;
  costs: number[]; // cost in Talent Points or Coins per rank
  costType: 'talent_points' | 'coins';
  effectDescription: string;
  effectDescriptionEn: string;
}

export interface CosmicPassReward {
  type: 'coins' | 'xp' | 'talent_point' | 'booster' | 'skin' | 'avatar' | 'title';
  amount: number;
  id?: string;
  name: string;
  nameEn?: string;
  icon: string;
}

export interface CosmicPassTier {
  tier: number;
  requiredXp: number;
  freeReward: CosmicPassReward;
  vipReward: CosmicPassReward;
}

export interface CosmicPassState {
  seasonNumber: number;
  seasonName: string;
  seasonNameEn: string;
  endsAt: string;
  currentXp: number;
  isVipUnlocked: boolean;
  claimedFreeTiers: number[];
  claimedVipTiers: number[];
}

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
  | 'magnet'     // 🧲 Star Magnet for 5s
  | 'supernova'; // 💥 Supernova Burst (collects all stars on screen!)

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

export interface BladePoint {
  x: number;
  y: number;
  time: number;
  color?: string;
}

export interface SliceArc {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  createdAt: number;
  duration: number;
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
  type: 'skin' | 'theme' | 'character' | 'upgrade' | 'avatar';
  price: number;
  icon: string;
  unlocked: boolean;
  equipped?: boolean;
  level?: number;
  maxLevel?: number;
  color?: string;
  effectDescription?: string;
  isAnimated?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
}

export type AchievementCategory = 'all' | 'gameplay' | 'social' | 'progression' | 'arcade' | 'collection';

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
  category?: 'gameplay' | 'social' | 'progression' | 'arcade' | 'collection';
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

export interface Friend {
  id: string; // User ID or code, e.g. "STAR-8492" or Firebase UID
  name: string;
  avatar: string;
  flag?: string;
  level: number;
  trophies: number;
  highScore: number;
  winStreak?: number;
  status: 'online' | 'in_game' | 'offline';
  lastActive: string;
  customTitle?: string;
  addedAt: string;
  isFavorite?: boolean;
}

export interface DirectChallenge {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  toName: string;
  targetScore: number;
  mode: GameMode;
  createdAt: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  wagerCoins?: number;
  rewardCoins?: number;
  rewardXp?: number;
  resultScore?: number;
}

export interface PlayerState {
  name: string;
  avatar?: string;
  coins: number;
  xp: number;
  level: number;
  talentPoints?: number;
  talents?: Record<string, number>;
  campaignProgress?: CampaignProgress;
  cosmicPass?: CosmicPassState;
  trophies?: number;
  constellationId?: string | null;
  constellationRole?: ConstellationRole;
  constellationStardustDonated?: number;
  constellationWarPointsContributed?: number;
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
  unlockedAvatars?: string[];
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  questRemindersEnabled?: boolean;
  lastDailyClaim: string; // ISO date string YYYY-MM-DD
  dailyStreak: number;
  hasSeenTutorial?: boolean;
  stats: PlayerStats;
}

export type ConstellationRole = 'leader' | 'officer' | 'veteran' | 'member';

export interface ConstellationMember {
  id: string;
  name: string;
  avatar: string;
  role: ConstellationRole;
  trophies: number;
  level: number;
  weeklyContribution: number;
  donationsGiven: number;
  status: 'online' | 'in_game' | 'offline';
  lastActive: string;
  customTitle?: string;
}

export interface ConstellationChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: ConstellationRole;
  text: string;
  timestamp: string;
  type?: 'text' | 'system' | 'donation_request' | 'war_milestone' | 'challenge_invite' | 'sticker';
  sticker?: {
    id: string;
    emoji: string;
    title: string;
    animEffect?: string;
  };
  challengeData?: {
    mode: GameMode;
    wager: number;
    targetScore?: number;
    acceptedBy?: string;
    status?: 'open' | 'accepted' | 'completed';
  };
  donationData?: {
    requestId: string;
    itemType?: 'stardust' | 'energy' | 'shield' | 'coins';
    requestedAmount: number;
    currentAmount: number;
    fulfilledBy: string[];
    perkBonus: string;
  };
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  isPinned?: boolean;
}

export interface ConstellationPerk {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  level: number;
  maxLevel: number;
  costStardust: number;
  unlocked: boolean;
  statBonus: string;
}

export interface ConstellationWarSeason {
  seasonId: string;
  seasonNumber: number;
  divisionName: string;
  divisionNameEn: string;
  divisionTier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
  endsInHours: number;
  clanRank: number;
  clanWarScore: number;
  opponentClanName: string;
  opponentClanScore: number;
  opponentClanBadge: string;
  tierRewardCoins: number;
  tierRewardStardust: number;
  tierRewardCrystals: number;
}

export interface ConstellationClan {
  id: string;
  name: string;
  tag: string; // e.g. "#ORION", "#NOVA"
  description: string;
  badge: string;
  badgeColor: string;
  bannerGradient: string;
  type: 'open' | 'invite_only' | 'closed';
  minTrophies: number;
  level: number;
  stardust: number;
  stardustLevelMax: number;
  warTrophies: number;
  membersCount: number;
  maxMembers: number;
  members: ConstellationMember[];
  chestLevel: number; // 1 to 10
  chestProgress: number;
  chestTarget: number;
  perks: ConstellationPerk[];
  warSeason?: ConstellationWarSeason;
  activityLog?: { id: string; text: string; time: string; icon: string }[];
  isUserLeader?: boolean;
  isUserMember?: boolean;
}

export interface AppUpdateInfo {
  version: string;
  buildNumber: number;
  currentVersion: string;
  currentBuildNumber: number;
  minRequiredVersion?: string;
  minRequiredBuild?: number;
  forceUpdate: boolean;
  apkDownloadUrl: string;
  fileSizeMb?: number;
  releaseDate: string;
  title?: {
    es: string;
    en: string;
  };
  highlights?: {
    es: string[];
    en: string[];
  };
  rewardCoins?: number;
  rewardStardust?: number;
}
