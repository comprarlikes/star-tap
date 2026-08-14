import { Friend, DirectChallenge, LeaderboardEntry, GameMode } from '../types';

const FRIENDS_STORAGE_KEY = 'star_tap_friends_list_v2';
const CHALLENGES_STORAGE_KEY = 'star_tap_direct_challenges_v2';
const PLAYER_CODE_KEY = 'star_tap_my_player_code_v1';

// Generate or retrieve persistent Player Code (e.g. STAR-8492-X9)
export const getMyPlayerCode = (userId?: string | null): string => {
  if (userId && userId.length >= 6) {
    return `STAR-${userId.substring(0, 6).toUpperCase()}`;
  }
  let savedCode = localStorage.getItem(PLAYER_CODE_KEY);
  if (!savedCode) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    savedCode = `STAR-${randomPart}`;
    localStorage.setItem(PLAYER_CODE_KEY, savedCode);
  }
  return savedCode;
};

// Initial default / community friends if list is empty
export const DEFAULT_FRIENDS: Friend[] = [
  {
    id: 'STAR-NOVA99',
    name: 'Nova_Pilot 🚀',
    avatar: 'astro_commander',
    flag: '🇪🇸',
    level: 14,
    trophies: 2850,
    highScore: 16420,
    winStreak: 6,
    status: 'online',
    lastActive: 'En línea',
    customTitle: 'Comandante Solar',
    addedAt: '2026-08-10',
    isFavorite: true,
  },
  {
    id: 'STAR-LUNA77',
    name: 'AstroLuna ✨',
    avatar: 'alien_blob',
    flag: '🇲🇽',
    level: 11,
    trophies: 2120,
    highScore: 13900,
    winStreak: 3,
    status: 'in_game',
    lastActive: 'En partida (Blitz)',
    customTitle: 'Cazadora Cósmica',
    addedAt: '2026-08-12',
    isFavorite: true,
  },
  {
    id: 'STAR-VORTEX',
    name: 'Vortex_King ⚡',
    avatar: 'cyber_bot',
    flag: '🇦🇷',
    level: 9,
    trophies: 1780,
    highScore: 11250,
    winStreak: 1,
    status: 'online',
    lastActive: 'Hace 5m',
    customTitle: 'Reflejos Neón',
    addedAt: '2026-08-13',
    isFavorite: false,
  },
  {
    id: 'STAR-NEBULA',
    name: 'NebulaQueen 🌌',
    avatar: 'star_guardian',
    flag: '🇨🇴',
    level: 8,
    trophies: 1450,
    highScore: 9840,
    winStreak: 0,
    status: 'offline',
    lastActive: 'Hace 2h',
    customTitle: 'Exploradora Lunar',
    addedAt: '2026-08-14',
    isFavorite: false,
  },
];

// Initial default challenges
export const DEFAULT_CHALLENGES: DirectChallenge[] = [
  {
    id: 'chal_nova_1',
    fromId: 'STAR-NOVA99',
    fromName: 'Nova_Pilot 🚀',
    fromAvatar: 'astro_commander',
    toId: 'user_player',
    toName: 'Jugador',
    targetScore: 12500,
    mode: 'blitz',
    createdAt: 'Hoy, 10:30',
    status: 'pending',
    wagerCoins: 100,
    rewardCoins: 200,
    rewardXp: 150,
  },
  {
    id: 'chal_luna_2',
    fromId: 'STAR-LUNA77',
    fromName: 'AstroLuna ✨',
    fromAvatar: 'alien_blob',
    toId: 'user_player',
    toName: 'Jugador',
    targetScore: 9500,
    mode: 'duel',
    createdAt: 'Ayer, 18:20',
    status: 'pending',
    wagerCoins: 50,
    rewardCoins: 100,
    rewardXp: 75,
  },
];

// Load friends list from storage
export const loadFriends = (): Friend[] => {
  try {
    const raw = localStorage.getItem(FRIENDS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(DEFAULT_FRIENDS));
      return DEFAULT_FRIENDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_FRIENDS;
  } catch (err) {
    console.warn('Error loading friends list:', err);
    return DEFAULT_FRIENDS;
  }
};

// Save friends list
export const saveFriends = (friends: Friend[]): void => {
  try {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  } catch (err) {
    console.warn('Error saving friends list:', err);
  }
};

// Load direct challenges
export const loadDirectChallenges = (): DirectChallenge[] => {
  try {
    const raw = localStorage.getItem(CHALLENGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(DEFAULT_CHALLENGES));
      return DEFAULT_CHALLENGES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_CHALLENGES;
  } catch (err) {
    console.warn('Error loading direct challenges:', err);
    return DEFAULT_CHALLENGES;
  }
};

// Save direct challenges
export const saveDirectChallenges = (challenges: DirectChallenge[]): void => {
  try {
    localStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(challenges));
  } catch (err) {
    console.warn('Error saving direct challenges:', err);
  }
};

// Add a friend by User ID / Code or Name
export const addFriendByIdOrName = (
  query: string,
  existingFriends: Friend[],
  leaderboard: LeaderboardEntry[],
  myId: string
): { success: boolean; message: string; friend?: Friend; updatedFriends?: Friend[] } => {
  const clean = query.trim();
  if (!clean) {
    return { success: false, message: 'Por favor ingresa un ID o Nombre de usuario válido.' };
  }

  // Check if self
  if (clean.toUpperCase() === myId.toUpperCase() || clean.toLowerCase() === 'yo') {
    return { success: false, message: '¡No puedes agregarte a ti mismo como amigo!' };
  }

  // Check if already in friends
  const alreadyAdded = existingFriends.find(
    (f) => f.id.toUpperCase() === clean.toUpperCase() || f.name.toLowerCase() === clean.toLowerCase()
  );
  if (alreadyAdded) {
    return { success: false, message: `¡"${alreadyAdded.name}" ya está en tu lista de amigos!` };
  }

  // 1. Try finding in current leaderboard entries
  const lbMatch = leaderboard.find(
    (entry) =>
      !entry.isUser &&
      (entry.id.toUpperCase() === clean.toUpperCase() ||
        entry.name.toLowerCase() === clean.toLowerCase() ||
        `STAR-${entry.id.substring(0, 6).toUpperCase()}` === clean.toUpperCase())
  );

  if (lbMatch) {
    const newFriend: Friend = {
      id: `STAR-${lbMatch.id.substring(0, 6).toUpperCase()}`,
      name: lbMatch.name,
      avatar: lbMatch.avatar || 'astro_commander',
      flag: lbMatch.flag || '🌐',
      level: lbMatch.level || 5,
      trophies: Math.floor(lbMatch.score / 5) + 500,
      highScore: lbMatch.score,
      winStreak: Math.floor(Math.random() * 4),
      status: 'online',
      lastActive: 'En línea',
      customTitle: 'Piloto Galáctico',
      addedAt: new Date().toISOString().split('T')[0],
      isFavorite: false,
    };

    const updated = [newFriend, ...existingFriends];
    saveFriends(updated);
    return {
      success: true,
      message: `¡${newFriend.name} ha sido agregado a tu lista de amigos!`,
      friend: newFriend,
      updatedFriends: updated,
    };
  }

  // 2. If it is a valid format code (STAR-XXXXXX or custom ID), create friend entry
  const formattedId = clean.startsWith('STAR-') ? clean.toUpperCase() : `STAR-${clean.toUpperCase()}`;
  const avatarList = ['astro_commander', 'alien_blob', 'cyber_bot', 'star_guardian', 'galaxy_fox', 'crystal_golem'];
  const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
  const randomLevel = Math.floor(Math.random() * 15) + 3;
  const randomScore = Math.floor(Math.random() * 12000) + 4000;

  const generatedFriend: Friend = {
    id: formattedId,
    name: clean.includes(' ') ? clean : `Piloto_${clean.replace('STAR-', '')}`,
    avatar: randomAvatar,
    flag: '🌍',
    level: randomLevel,
    trophies: Math.floor(randomScore / 6) + 300,
    highScore: randomScore,
    winStreak: Math.floor(Math.random() * 3),
    status: Math.random() > 0.4 ? 'online' : 'offline',
    lastActive: Math.random() > 0.4 ? 'En línea' : 'Hace 1h',
    customTitle: 'Compañero Estelar',
    addedAt: new Date().toISOString().split('T')[0],
    isFavorite: false,
  };

  const updated = [generatedFriend, ...existingFriends];
  saveFriends(updated);

  return {
    success: true,
    message: `¡${generatedFriend.name} (${generatedFriend.id}) añadido con éxito!`,
    friend: generatedFriend,
    updatedFriends: updated,
  };
};

// Create a new direct challenge to a friend
export const createDirectChallenge = (
  friend: Friend,
  myPlayerCode: string,
  myName: string,
  myAvatar: string,
  targetScore: number,
  mode: GameMode = 'blitz',
  wagerCoins: number = 50
): DirectChallenge => {
  const newChal: DirectChallenge = {
    id: `chal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    fromId: myPlayerCode,
    fromName: myName,
    fromAvatar: myAvatar,
    toId: friend.id,
    toName: friend.name,
    targetScore,
    mode,
    createdAt: 'Justo ahora',
    status: 'pending',
    wagerCoins,
    rewardCoins: wagerCoins * 2,
    rewardXp: wagerCoins + 50,
  };

  const currentList = loadDirectChallenges();
  const updated = [newChal, ...currentList];
  saveDirectChallenges(updated);
  return newChal;
};
