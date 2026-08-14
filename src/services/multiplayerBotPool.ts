import { MultiplayerOpponent, MultiplayerArena } from '../types';

export const GLOBAL_OPPONENTS_ROSTER: Array<Omit<MultiplayerOpponent, 'targetScore' | 'pingMs'>> = [
  {
    id: 'opp_elena',
    name: 'Elena_Vortex',
    avatar: '👩‍🚀',
    flag: '🇪🇸',
    country: 'España',
    level: 18,
    trophies: 340,
    winStreak: 4,
    personality: 'aggressive',
    skillMultiplier: 1.1,
  },
  {
    id: 'opp_kai',
    name: 'Kai_Speedster',
    avatar: '⚡',
    flag: '🇯🇵',
    country: 'Japón',
    level: 25,
    trophies: 780,
    winStreak: 7,
    personality: 'speedy',
    skillMultiplier: 1.25,
  },
  {
    id: 'opp_lucas',
    name: 'LucasStarlight',
    avatar: '🤖',
    flag: '🇧🇷',
    country: 'Brasil',
    level: 14,
    trophies: 190,
    winStreak: 2,
    personality: 'steady',
    skillMultiplier: 0.95,
  },
  {
    id: 'opp_charlotte',
    name: 'CosmicCharlotte',
    avatar: '✨',
    flag: '🇫🇷',
    country: 'Francia',
    level: 22,
    trophies: 620,
    winStreak: 5,
    personality: 'clutch',
    skillMultiplier: 1.15,
  },
  {
    id: 'opp_alex',
    name: 'AlexGalaxy99',
    avatar: '🦊',
    flag: '🇺🇸',
    country: 'Estados Unidos',
    level: 30,
    trophies: 1150,
    winStreak: 9,
    personality: 'aggressive',
    skillMultiplier: 1.35,
  },
  {
    id: 'opp_sofia',
    name: 'SofiaAstro',
    avatar: '🦄',
    flag: '🇲🇽',
    country: 'México',
    level: 16,
    trophies: 280,
    winStreak: 3,
    personality: 'steady',
    skillMultiplier: 1.0,
  },
  {
    id: 'opp_mateo',
    name: 'MateoNova',
    avatar: '👾',
    flag: '🇦🇷',
    country: 'Argentina',
    level: 20,
    trophies: 450,
    winStreak: 4,
    personality: 'speedy',
    skillMultiplier: 1.1,
  },
  {
    id: 'opp_valeria',
    name: 'ValeriaNebula',
    avatar: '👑',
    flag: '🇨🇴',
    country: 'Colombia',
    level: 28,
    trophies: 940,
    winStreak: 6,
    personality: 'clutch',
    skillMultiplier: 1.3,
  },
];

/**
 * Generate an opponent tailored to the selected arena and player's trophy rank
 */
export function findMatchingOpponent(
  arena: MultiplayerArena,
  playerTrophies: number = 100,
  playerName?: string
): MultiplayerOpponent {
  // Filter out any roster entry matching player's name
  const candidates = GLOBAL_OPPONENTS_ROSTER.filter(
    (c) => !playerName || c.name.toLowerCase() !== playerName.toLowerCase()
  );

  const base = candidates[Math.floor(Math.random() * candidates.length)] || GLOBAL_OPPONENTS_ROSTER[0];
  
  // Calculate trophy variation centered around player trophies or arena target
  const trophyDelta = Math.floor(Math.random() * 80) - 40;
  const estimatedTrophies = Math.max(10, (playerTrophies || 100) + trophyDelta);

  // Target score based on arena difficulty and time (60 seconds standard)
  let baseTargetScore = 280;
  if (arena.id === 'arena_novice') baseTargetScore = 240 + Math.floor(Math.random() * 90);
  if (arena.id === 'arena_diamond') baseTargetScore = 380 + Math.floor(Math.random() * 140);
  if (arena.id === 'arena_blackhole') baseTargetScore = 520 + Math.floor(Math.random() * 200);

  const pingMs = Math.floor(Math.random() * 28) + 16; // 16ms - 44ms realistic latency

  return {
    ...base,
    trophies: estimatedTrophies,
    pingMs,
    targetScore: baseTargetScore,
  };
}

/**
 * Opponent Emote Pool for Interactive Responses
 */
export const OPPONENT_EMOTES = ['🔥', '😎', '👑', '😱', '⚡', '👏', '💀', '⭐'];

export function getRandomOpponentEmote(): string {
  return OPPONENT_EMOTES[Math.floor(Math.random() * OPPONENT_EMOTES.length)];
}
