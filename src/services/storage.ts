import { PlayerState, ShopItem, Achievement, Quest, LeaderboardEntry } from '../types';

const LOCAL_STORAGE_KEY = 'star_tap_arcade_player_state_v1';
const LOCAL_LEADERBOARD_KEY = 'star_tap_arcade_leaderboard_v1';

export const INITIAL_PLAYER_STATE: PlayerState = {
  name: 'Jugador Estelar',
  avatar: 'astro_commander',
  coins: 50,
  xp: 0,
  level: 1,
  language: 'es',
  equippedSkin: 'skin_neon',
  equippedTheme: 'theme_space',
  equippedCharacter: 'char_none',
  upgrades: {
    time_extender: 0,
    magnet_ring: 0,
    bomb_shield: 0,
    lucky_charm: 0,
    star_magnet: 0,
  },
  unlockedSkins: ['skin_neon'],
  unlockedThemes: ['theme_space'],
  unlockedCharacters: ['char_none'],
  soundEnabled: true,
  hapticsEnabled: true,
  questRemindersEnabled: true,
  lastDailyClaim: '',
  dailyStreak: 0,
  stats: {
    gamesPlayed: 0,
    totalStarsTapped: 0,
    normalTapped: 0,
    goldenTapped: 0,
    diamondTapped: 0,
    bombsAvoided: 0,
    bombsHit: 0,
    highestScore: 0,
    highestCombo: 0,
    totalCoinsEarned: 50,
    totalXpEarned: 0,
  },
};

export const SHOP_ITEMS: ShopItem[] = [
  // SKINS
  {
    id: 'skin_neon',
    name: 'Estrella Neón',
    description: 'La estrella clásica brillante con destello azul y amarillo.',
    type: 'skin',
    price: 0,
    icon: '⭐',
    unlocked: true,
    equipped: true,
    color: '#fbbf24',
    effectDescription: 'Brillo neón estándar',
  },
  {
    id: 'skin_cyber',
    name: 'Ciber Dorado',
    description: 'Estrella cyberpunk con estela de luces doradas y partículas.',
    type: 'skin',
    price: 350,
    icon: '🌟',
    unlocked: false,
    color: '#f59e0b',
    effectDescription: '+5% Probabilidad de Estrella Dorada',
  },
  {
    id: 'skin_pixel',
    name: 'Retro 8-Bits',
    description: 'Aesthetics nostálgicas de videojuegos retro clásicos.',
    type: 'skin',
    price: 750,
    icon: '👾',
    unlocked: false,
    color: '#ec4899',
    effectDescription: 'Efecto de sonido retro exclusivo',
  },
  {
    id: 'skin_candy',
    name: 'Dulce Caramelo',
    description: 'Estrella arcoíris de caramelo con destellos brillantes.',
    type: 'skin',
    price: 1400,
    icon: '🍬',
    unlocked: false,
    color: '#a855f7',
    effectDescription: '+10% Bonificación de monedas al finalizar',
  },
  {
    id: 'skin_inferno',
    name: 'Fuego Cósmico',
    description: 'Envuelta en llamas vivas y partículas supernovas.',
    type: 'skin',
    price: 2800,
    icon: '🔥',
    unlocked: false,
    color: '#ef4444',
    effectDescription: 'Estela de fuego supercaliente',
  },
  {
    id: 'skin_diamond_skin',
    name: 'Diamante Galáctico',
    description: 'La estrella más codiciada del universo conocido.',
    type: 'skin',
    price: 5500,
    icon: '💎',
    unlocked: false,
    color: '#3b82f6',
    effectDescription: 'Estela de diamantes flotantes',
  },

  // THEMES
  {
    id: 'theme_space',
    name: 'Espacio Profundo',
    description: 'Fondo espacial oscuro con nebulosas y estrellas titilantes.',
    type: 'theme',
    price: 0,
    icon: '🌌',
    unlocked: true,
    equipped: true,
    color: '#0f172a',
  },
  {
    id: 'theme_vaporwave',
    name: 'Vaporwave Sunset',
    description: 'Atardecer de los 80s con rejilla neón y tonos violetas.',
    type: 'theme',
    price: 450,
    icon: '🌇',
    unlocked: false,
    color: '#581c87',
  },
  {
    id: 'theme_cybercity',
    name: 'Ciudad Cyberpunk',
    description: 'Luces nocturnas de metrópolis futurista.',
    type: 'theme',
    price: 950,
    icon: '🏙️',
    unlocked: false,
    color: '#111827',
  },
  {
    id: 'theme_candy_world',
    name: 'Reino de Caramelo',
    description: 'Paisaje dulzón con nubes de algodón rosa.',
    type: 'theme',
    price: 1800,
    icon: '🍭',
    unlocked: false,
    color: '#831843',
  },

  // CHARACTERS / COMPANIONS
  {
    id: 'char_none',
    name: 'Sin Compañero',
    description: 'Juega solo sin modificadores adicionales.',
    type: 'character',
    price: 0,
    icon: '👤',
    unlocked: true,
    equipped: true,
    effectDescription: 'Sin efecto activo',
  },
  {
    id: 'char_astro_dog',
    name: 'Astro Perro',
    description: 'Un fiel perrito espacial que recolecta extra monedas.',
    type: 'character',
    price: 600,
    icon: '🐶',
    unlocked: false,
    effectDescription: '+15% Monedas ganadas en cada partida',
  },
  {
    id: 'char_cosmic_cat',
    name: 'Gato Cósmico',
    description: 'Domina las dimensiones del tiempo en la partida.',
    type: 'character',
    price: 1250,
    icon: '🐱',
    unlocked: false,
    effectDescription: '+3 Segundos adicionales al iniciar',
  },
  {
    id: 'char_sparky_bot',
    name: 'Robot Sparky',
    description: 'Detecta y desactiva peligros antes de que exploten.',
    type: 'character',
    price: 2500,
    icon: '🤖',
    unlocked: false,
    effectDescription: 'Convierte la 1ª bomba recibida en Estrella Dorada',
  },
  {
    id: 'char_dragon',
    name: 'Dragón Dorado',
    description: 'Atrae la buena suerte y riquezas galácticas.',
    type: 'character',
    price: 5000,
    icon: '🐉',
    unlocked: false,
    effectDescription: 'Doble probabilidad de aparición de Diamantes y Estrellas x2',
  },

  // UPGRADES
  {
    id: 'time_extender',
    name: 'Tiempo Extendido',
    description: 'Aumenta el tiempo inicial de la partida en +1 seg por nivel.',
    type: 'upgrade',
    price: 200,
    icon: '⏱️',
    unlocked: true,
    level: 0,
    maxLevel: 5,
    effectDescription: 'Nivel actual: +{level}s al tiempo inicial',
  },
  {
    id: 'magnet_ring',
    name: 'Anillo Magnético',
    description: 'Radio de atracción que recoge estrellas normales cercanas.',
    type: 'upgrade',
    price: 250,
    icon: '🧲',
    unlocked: true,
    level: 0,
    maxLevel: 5,
    effectDescription: 'Nivel actual: +{level}0% área de captura',
  },
  {
    id: 'bomb_shield',
    name: 'Carga de Escudo',
    description: 'Comienza la partida con 1 escudo protector activado.',
    type: 'upgrade',
    price: 350,
    icon: '🛡️',
    unlocked: true,
    level: 0,
    maxLevel: 3,
    effectDescription: 'Nivel actual: {level} escudos iniciales',
  },
  {
    id: 'lucky_charm',
    name: 'Amuleto de Suerte',
    description: 'Aumenta la tasa de aparición de diamantes y bonus.',
    type: 'upgrade',
    price: 300,
    icon: '🍀',
    unlocked: true,
    level: 0,
    maxLevel: 5,
    effectDescription: 'Nivel actual: +{level}0% frecuencia de bonus',
  },
  {
    id: 'star_magnet',
    name: 'Imán de Estrellas',
    description: 'Atrae automáticamente todas las estrellas hacia el centro de la pantalla durante 5 segundos al activarse.',
    type: 'upgrade',
    price: 250,
    icon: '🧲',
    unlocked: true,
    level: 0,
    maxLevel: 5,
    effectDescription: 'Nivel actual: +{level} usos de Imán por partida',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // ARCADE & GENERAL ACHIEVEMENTS
  {
    id: 'first_game',
    title: '¡Primer Toque!',
    description: 'Juega tu primera partida de Star Tap Arcade.',
    icon: '🎮',
    rewardCoins: 30,
    rewardXp: 30,
    progress: 0,
    target: 1,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'tap_50_stars',
    title: 'Cazador de Estrellas',
    description: 'Toca un total de 50 estrellas.',
    icon: '⭐',
    rewardCoins: 50,
    rewardXp: 50,
    progress: 0,
    target: 50,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'tap_250_stars',
    title: 'Maestro Estelar',
    description: 'Toca un total de 250 estrellas.',
    icon: '🌟',
    rewardCoins: 120,
    rewardXp: 100,
    progress: 0,
    target: 250,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'tap_1000_stars',
    title: 'Titán del Cosmos',
    description: 'Toca un total de 1,000 estrellas galácticas.',
    icon: '🌌',
    rewardCoins: 300,
    rewardXp: 250,
    progress: 0,
    target: 1000,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'diamond_collector',
    title: 'Coleccionista de Diamantes',
    description: 'Atrapa 15 diamantes cósmicos.',
    icon: '💎',
    rewardCoins: 150,
    rewardXp: 100,
    progress: 0,
    target: 15,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'golden_star_master',
    title: 'Fiebre de Oro Estelar',
    description: 'Atrapa un total de 30 estrellas doradas.',
    icon: '🪙',
    rewardCoins: 180,
    rewardXp: 120,
    progress: 0,
    target: 30,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'combo_10',
    title: 'Racha Imparable',
    description: 'Consigue una racha de Combo x10.',
    icon: '🔥',
    rewardCoins: 60,
    rewardXp: 50,
    progress: 0,
    target: 10,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'combo_20',
    title: 'Super Saiyan Tap',
    description: 'Consigue una racha de Combo x20 sin errar.',
    icon: '⚡',
    rewardCoins: 150,
    rewardXp: 100,
    progress: 0,
    target: 20,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'combo_30',
    title: 'Velocidad de la Luz',
    description: 'Consigue una racha sobrehumana de Combo x30.',
    icon: '🌠',
    rewardCoins: 350,
    rewardXp: 200,
    progress: 0,
    target: 30,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'score_300',
    title: 'Puntuación Alta',
    description: 'Alcanza 300 puntos en una sola partida.',
    icon: '🏆',
    rewardCoins: 80,
    rewardXp: 60,
    progress: 0,
    target: 300,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'score_700',
    title: 'Leyenda del Arcade',
    description: 'Alcanza 700 puntos en una sola partida.',
    icon: '👑',
    rewardCoins: 200,
    rewardXp: 150,
    progress: 0,
    target: 700,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'score_1500',
    title: 'Dios Galáctico',
    description: 'Supera los 1,500 puntos en una sola partida.',
    icon: '💫',
    rewardCoins: 500,
    rewardXp: 350,
    progress: 0,
    target: 1500,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'bomb_dodger',
    title: 'Esquivador Experto',
    description: 'Pasa una partida entera sin tocar ninguna bomba.',
    icon: '💣',
    rewardCoins: 70,
    rewardXp: 50,
    progress: 0,
    target: 1,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'bombs_avoided_50',
    title: 'Piloto Antinave Bombas',
    description: 'Esquiva un total de 50 bombas en tu carrera.',
    icon: '🛡️',
    rewardCoins: 220,
    rewardXp: 150,
    progress: 0,
    target: 50,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'coins_1000',
    title: 'Rico Galáctico',
    description: 'Acumula un total de 1,000 monedas.',
    icon: '💰',
    rewardCoins: 100,
    rewardXp: 100,
    progress: 0,
    target: 1000,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'coins_5000',
    title: 'Magnate de la Vía Láctea',
    description: 'Acumula un total de 5,000 monedas.',
    icon: '🤑',
    rewardCoins: 400,
    rewardXp: 300,
    progress: 0,
    target: 5000,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'reach_level_5',
    title: 'Escalador Galáctico',
    description: 'Alcanza el Nivel 5 de jugador.',
    icon: '🚀',
    rewardCoins: 120,
    rewardXp: 100,
    progress: 0,
    target: 5,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },
  {
    id: 'reach_level_10',
    title: 'Comandante de la Flota',
    description: 'Alcanza el Nivel 10 de jugador.',
    icon: '🎖️',
    rewardCoins: 300,
    rewardXp: 250,
    progress: 0,
    target: 10,
    unlocked: false,
    claimed: false,
    category: 'arcade',
  },

  // COLLECTION ACHIEVEMENTS
  {
    id: 'skin_collector',
    title: 'Estilo Estelar',
    description: 'Desbloquea al menos 3 skins de estrellas.',
    icon: '🎨',
    rewardCoins: 150,
    rewardXp: 100,
    progress: 0,
    target: 3,
    unlocked: false,
    claimed: false,
    category: 'collection',
  },
  {
    id: 'full_armory',
    title: 'Coleccionista Supremo',
    description: 'Desbloquea 5 skins o elementos en la tienda.',
    icon: '🛸',
    rewardCoins: 400,
    rewardXp: 300,
    progress: 0,
    target: 5,
    unlocked: false,
    claimed: false,
    category: 'collection',
  },

  // SOCIAL & MULTIPLAYER ACHIEVEMENTS
  {
    id: 'social_first_win',
    title: 'Primera Sangre Online',
    description: 'Gana tu primera batalla 1v1 en el modo multijugador.',
    icon: '⚔️',
    rewardCoins: 60,
    rewardXp: 50,
    progress: 0,
    target: 1,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_mp_win_5',
    title: 'Gladiador Estelar',
    description: 'Gana 5 partidas multijugador online en cualquier arena.',
    icon: '🏆',
    rewardCoins: 140,
    rewardXp: 100,
    progress: 0,
    target: 5,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_mp_win_20',
    title: 'Campeón del Coliseo',
    description: 'Gana 20 partidas en el modo multijugador online.',
    icon: '👑',
    rewardCoins: 450,
    rewardXp: 300,
    progress: 0,
    target: 20,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_streak_3',
    title: 'Racha Ardiente',
    description: 'Consigue una racha de 3 victorias consecutivas en 1v1.',
    icon: '🔥',
    rewardCoins: 90,
    rewardXp: 80,
    progress: 0,
    target: 3,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_streak_5',
    title: 'Imparable en el Ring',
    description: 'Gana 5 partidas multijugador consecutivas sin perder.',
    icon: '⚡',
    rewardCoins: 200,
    rewardXp: 150,
    progress: 0,
    target: 5,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_streak_10',
    title: 'Racha Legendaria x10',
    description: '¡Hazaña Épica! Gana 10 partidas consecutivas en el modo multijugador.',
    icon: '💫',
    rewardCoins: 600,
    rewardXp: 400,
    progress: 0,
    target: 10,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_arenas_distinct_3',
    title: 'Explorador de Arenas',
    description: 'Participa en batallas en 3 arenas multijugador distintas.',
    icon: '🏟️',
    rewardCoins: 130,
    rewardXp: 100,
    progress: 0,
    target: 3,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_arenas_distinct_5',
    title: 'Conquistador de Arenas',
    description: 'Participa en batallas en 5 arenas distintas del multijugador.',
    icon: '🌌',
    rewardCoins: 350,
    rewardXp: 250,
    progress: 0,
    target: 5,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_emotes_10',
    title: 'Maestro de Reacciones',
    description: 'Envía 10 reacciones o emotes interactivos durante combates 1v1.',
    icon: '😎',
    rewardCoins: 70,
    rewardXp: 50,
    progress: 0,
    target: 10,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_private_room',
    title: 'Duelo Entre Amigos',
    description: 'Crea o únete a una sala privada multijugador usando código PIN.',
    icon: '🤝',
    rewardCoins: 80,
    rewardXp: 60,
    progress: 0,
    target: 1,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
  {
    id: 'social_trophies_500',
    title: 'Ascenso de Liga',
    description: 'Alcanza 500 trofeos en las ligas del modo multijugador.',
    icon: '🎖️',
    rewardCoins: 250,
    rewardXp: 200,
    progress: 0,
    target: 500,
    unlocked: false,
    claimed: false,
    category: 'social',
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'CosmicMaster_99', score: 1420, level: 24, avatar: '🐉', flag: '🇪🇸', date: 'Hoy' },
  { id: '2', name: 'StarNinja', score: 1250, level: 19, avatar: '🦊', flag: '🇲🇽', date: 'Hoy' },
  { id: '3', name: 'GalaxyGamer', score: 1120, level: 17, avatar: '🤖', flag: '🇦🇷', date: 'Ayer' },
  { id: '4', name: 'NovaTapper', score: 980, level: 14, avatar: '🐱', flag: '🇨🇱', date: 'Hoy' },
  { id: '5', name: 'PixelKing', score: 890, level: 12, avatar: '🐶', flag: '🇨🇴', date: 'Ayer' },
  { id: '6', name: 'AstroGirl', score: 810, level: 11, avatar: '✨', flag: '🇪🇸', date: 'Hace 2d' },
  { id: '7', name: 'ZeroDelay', score: 740, level: 9, avatar: '⚡', flag: '🇵🇪', date: 'Hoy' },
  { id: '8', name: 'HyperSpeed', score: 680, level: 8, avatar: '🚀', flag: '🇪🇨', date: 'Hace 3d' },
];

export function generateDailyQuests(): Quest[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const storedDate = localStorage.getItem('star_tap_quest_date');

  const storedQuests = localStorage.getItem('star_tap_daily_quests');
  if (storedDate === todayStr && storedQuests) {
    try {
      return JSON.parse(storedQuests);
    } catch {
      // fallback
    }
  }

  const quests: Quest[] = [
    {
      id: 'quest_1',
      title: 'Toques Dorados',
      description: 'Toca 15 estrellas doradas en tus partidas.',
      rewardCoins: 60,
      rewardXp: 50,
      progress: 0,
      target: 15,
      completed: false,
      claimed: false,
      icon: '🌟',
    },
    {
      id: 'quest_2',
      title: 'Puntuación Alta',
      description: 'Obtén al menos 250 puntos en una partida.',
      rewardCoins: 90,
      rewardXp: 80,
      progress: 0,
      target: 250,
      completed: false,
      claimed: false,
      icon: '🎯',
    },
    {
      id: 'quest_3',
      title: 'Racha de Combo',
      description: 'Alcanza un combo de x8 en cualquier modo.',
      rewardCoins: 75,
      rewardXp: 60,
      progress: 0,
      target: 8,
      completed: false,
      claimed: false,
      icon: '⚡',
    },
  ];

  localStorage.setItem('star_tap_quest_date', todayStr);
  localStorage.setItem('star_tap_daily_quests', JSON.stringify(quests));
  return quests;
}

export function savePlayerState(state: PlayerState) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save player state:', e);
  }
}

export function loadPlayerState(): PlayerState {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...INITIAL_PLAYER_STATE,
        ...parsed,
        stats: {
          ...INITIAL_PLAYER_STATE.stats,
          ...(parsed.stats || {}),
        },
        upgrades: {
          ...INITIAL_PLAYER_STATE.upgrades,
          ...(parsed.upgrades || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to load player state:', e);
  }
  return INITIAL_PLAYER_STATE;
}

export function loadAchievements(): Achievement[] {
  try {
    const data = localStorage.getItem('star_tap_achievements');
    if (data) {
      const parsed: Achievement[] = JSON.parse(data);
      // Merge with initial in case new achievements were added or categories updated
      return INITIAL_ACHIEVEMENTS.map((init) => {
        const found = parsed.find((p) => p.id === init.id);
        return found
          ? {
              ...init,
              ...found,
              title: init.title,
              description: init.description,
              category: init.category || 'arcade',
              target: init.target,
              rewardCoins: init.rewardCoins,
              rewardXp: init.rewardXp,
            }
          : init;
      });
    }
  } catch (e) {
    console.error('Failed to load achievements:', e);
  }
  return INITIAL_ACHIEVEMENTS;
}

export function saveAchievements(achievements: Achievement[]) {
  try {
    localStorage.setItem('star_tap_achievements', JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load leaderboard:', e);
  }
  return INITIAL_LEADERBOARD;
}

export function saveLeaderboard(leaderboard: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Failed to save leaderboard:', e);
  }
}

// Calculate XP needed for next level: Formula 100 * level^1.3
export function getXpForNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.25));
}
