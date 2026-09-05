export type AvatarCategory = 'pilots' | 'beasts' | 'legends' | 'shop' | 'events';
export type AvatarAnimationType =
  | 'hologram'
  | 'cosmic_flame'
  | 'cyber_pulse'
  | 'hyper_lightning'
  | 'void_portal'
  | 'celestial_shimmer'
  | 'solar_flare'
  | 'spectral_glitch';

export type AvatarRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface AvatarItem {
  id: string;
  name: { es: string; en: string };
  description?: { es: string; en: string };
  category: AvatarCategory;
  categoryLabel: { es: string; en: string };
  emoji: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  unlockLevel?: number;
  unlockType: 'level' | 'shop' | 'event';
  price?: number;
  eventRequirement?: { es: string; en: string };
  isAnimated: boolean;
  animationType?: AvatarAnimationType;
  rarity: AvatarRarity;
  badgeLabel?: { es: string; en: string };
  perkDescription?: { es: string; en: string };
  auraParticlesColor?: string;
}

export const AVATARS: AvatarItem[] = [
  // ==========================================
  // 1. SHOP EXCLUSIVE ANIMATED AVATARS (TIENDA)
  // ==========================================
  {
    id: 'avatar_cyber_valkyrie',
    name: { es: 'Valkiria Cyberpunk', en: 'Cyber Valkyrie' },
    description: {
      es: 'Guerrera aérea con visor holográfico y alas cibernéticas de plasma animadas.',
      en: 'Aerial warrior with holographic visor and animated plasma cyber wings.',
    },
    category: 'shop',
    categoryLabel: { es: 'Tienda Exclusiva', en: 'Shop Exclusive' },
    emoji: '🧚‍♀️',
    gradient: 'from-cyan-400 via-fuchsia-500 to-indigo-600',
    borderColor: 'border-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    unlockType: 'shop',
    price: 1800,
    isAnimated: true,
    animationType: 'cyber_pulse',
    rarity: 'epic',
    badgeLabel: { es: 'EXCLUSIVO TIENDA', en: 'SHOP EXCLUSIVE' },
    perkDescription: { es: '+5% Multiplicador de XP', en: '+5% XP Multiplier' },
    auraParticlesColor: '#06b6d4',
  },
  {
    id: 'avatar_infernal_phoenix',
    name: { es: 'Fénix Ígneo Eterno', en: 'Infernal Phoenix' },
    description: {
      es: 'Ave sagrada renacida del núcleo estelar con llamas vivas en constante movimiento.',
      en: 'Sacred beast reborn from stellar core with real-time raging flame aura.',
    },
    category: 'shop',
    categoryLabel: { es: 'Tienda Exclusiva', en: 'Shop Exclusive' },
    emoji: '🔥',
    gradient: 'from-amber-400 via-orange-500 to-rose-600',
    borderColor: 'border-amber-300',
    glowColor: 'rgba(249, 115, 22, 0.8)',
    unlockType: 'shop',
    price: 2500,
    isAnimated: true,
    animationType: 'cosmic_flame',
    rarity: 'epic',
    badgeLabel: { es: 'EXCLUSIVO TIENDA', en: 'SHOP EXCLUSIVE' },
    perkDescription: { es: 'Estela ígnea de partículas en combo', en: 'Fiery particle trail on combo' },
    auraParticlesColor: '#f97316',
  },
  {
    id: 'avatar_mecha_titan',
    name: { es: 'Titán Mecha X-99', en: 'Mecha Titan X-99' },
    description: {
      es: 'Blindaje biomecánico hiper-avanzado con reactor de plasma y descargas voltaicas.',
      en: 'Advanced biomechanical armor with pulsing plasma core and lightning arcs.',
    },
    category: 'shop',
    categoryLabel: { es: 'Tienda Exclusiva', en: 'Shop Exclusive' },
    emoji: '🤖',
    gradient: 'from-blue-500 via-indigo-600 to-purple-800',
    borderColor: 'border-blue-300',
    glowColor: 'rgba(59, 130, 246, 0.8)',
    unlockType: 'shop',
    price: 3200,
    isAnimated: true,
    animationType: 'hyper_lightning',
    rarity: 'legendary',
    badgeLabel: { es: 'EXCLUSIVO TIENDA', en: 'SHOP EXCLUSIVE' },
    perkDescription: { es: 'Aura eléctrica reactiva al pulsar', en: 'Electric aura reacts on tap' },
    auraParticlesColor: '#60a5fa',
  },
  {
    id: 'avatar_void_overlord',
    name: { es: 'Soberano del Vacío', en: 'Void Overlord' },
    description: {
      es: 'Entidad cósmica interdimensional rodeada por un vórtice gravitacional oscuro.',
      en: 'Interdimensional cosmic entity enveloped in a swirling dark matter vortex.',
    },
    category: 'shop',
    categoryLabel: { es: 'Tienda Exclusiva', en: 'Shop Exclusive' },
    emoji: '🌌',
    gradient: 'from-violet-950 via-purple-800 to-fuchsia-900',
    borderColor: 'border-fuchsia-400',
    glowColor: 'rgba(192, 38, 211, 0.85)',
    unlockType: 'shop',
    price: 4500,
    isAnimated: true,
    animationType: 'void_portal',
    rarity: 'legendary',
    badgeLabel: { es: 'EXCLUSIVO TIENDA', en: 'SHOP EXCLUSIVE' },
    perkDescription: { es: 'Vórtice cósmico interactivo', en: 'Interactive cosmic vortex' },
    auraParticlesColor: '#d946ef',
  },
  {
    id: 'avatar_golden_emperor',
    name: { es: 'Emperador Solar Prime', en: 'Solar Emperor Prime' },
    description: {
      es: 'Monarca supremo del cosmos cubierto de oro puro y una corona de radiación solar.',
      en: 'Supreme monarch of the cosmos adorned in pure gold and a rotating solar corona.',
    },
    category: 'shop',
    categoryLabel: { es: 'Tienda Exclusiva', en: 'Shop Exclusive' },
    emoji: '👑',
    gradient: 'from-yellow-300 via-amber-400 to-yellow-600',
    borderColor: 'border-yellow-100',
    glowColor: 'rgba(250, 204, 21, 0.9)',
    unlockType: 'shop',
    price: 6000,
    isAnimated: true,
    animationType: 'solar_flare',
    rarity: 'mythic',
    badgeLabel: { es: 'MÍTICO TIENDA', en: 'MYTHIC SHOP' },
    perkDescription: { es: '+10% Monedas en todas las partidas', en: '+10% Coins in all games' },
    auraParticlesColor: '#facc15',
  },

  // ==========================================
  // 2. EVENT EXCLUSIVE ANIMATED AVATARS (EVENTOS)
  // ==========================================
  {
    id: 'avatar_tournament_conqueror',
    name: { es: 'Conquistador de Torneos', en: 'Tournament Conqueror' },
    description: {
      es: 'Reservado para los guerreros que conquistan la cima del Torneo Semanal Galáctico.',
      en: 'Reserved for elite warriors who reach the top tier of the Galactic Tournament.',
    },
    category: 'events',
    categoryLabel: { es: 'Eventos Exclusivos', en: 'Event Exclusive' },
    emoji: '🏆',
    gradient: 'from-amber-300 via-yellow-400 to-amber-600',
    borderColor: 'border-amber-200',
    glowColor: 'rgba(245, 158, 11, 0.95)',
    unlockType: 'event',
    eventRequirement: {
      es: '🏆 Recompensa por clasificar en el Top del Torneo Semanal',
      en: '🏆 Reward for reaching the Top tier in Weekly Tournament',
    },
    isAnimated: true,
    animationType: 'celestial_shimmer',
    rarity: 'mythic',
    badgeLabel: { es: 'EVENTO: TORNEO', en: 'EVENT: TOURNAMENT' },
    perkDescription: { es: 'Corona de campeón animada con diamantes', en: 'Animated champion crown with gems' },
    auraParticlesColor: '#fbbf24',
  },
  {
    id: 'avatar_arena_gladiator',
    name: { es: 'Gladiador de Élite 1v1', en: '1v1 Arena Gladiator' },
    description: {
      es: 'Forjado en la arena multijugador en tiempo real. Demuestra maestría en combate.',
      en: 'Forged in the real-time multiplayer arena. Shows ultimate 1v1 mastery.',
    },
    category: 'events',
    categoryLabel: { es: 'Eventos Exclusivos', en: 'Event Exclusive' },
    emoji: '⚔️',
    gradient: 'from-red-600 via-rose-500 to-indigo-700',
    borderColor: 'border-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.85)',
    unlockType: 'event',
    eventRequirement: {
      es: '⚔️ Gana 15 partidas en la Arena Multijugador 1v1',
      en: '⚔️ Win 15 matches in 1v1 Multiplayer Arena',
    },
    isAnimated: true,
    animationType: 'hyper_lightning',
    rarity: 'legendary',
    badgeLabel: { es: 'EVENTO: ARENA 1v1', en: 'EVENT: 1v1 ARENA' },
    perkDescription: { es: 'Relámpagos carmesí al encadenar combos', en: 'Crimson lightning on combos' },
    auraParticlesColor: '#f43f5e',
  },
  {
    id: 'avatar_cosmic_deity',
    name: { es: 'Deidad Astral Mística', en: 'Mystic Astral Deity' },
    description: {
      es: 'Avatar celestial animado con anillos orbitales y destellos estelares.',
      en: 'Animated celestial avatar with rotating orbital rings and starlight gleams.',
    },
    category: 'events',
    categoryLabel: { es: 'Eventos Exclusivos', en: 'Event Exclusive' },
    emoji: '✨',
    gradient: 'from-fuchsia-500 via-purple-600 to-cyan-400',
    borderColor: 'border-fuchsia-200',
    glowColor: 'rgba(217, 70, 239, 0.9)',
    unlockType: 'event',
    eventRequirement: {
      es: '📅 Recompensa por Racha de Inicio de Sesión de 7 Días',
      en: '📅 Reward for maintaining a 7-Day Login Streak',
    },
    isAnimated: true,
    animationType: 'hologram',
    rarity: 'legendary',
    badgeLabel: { es: 'EVENTO: RACHA 7D', en: 'EVENT: 7D STREAK' },
    perkDescription: { es: 'Anillos holográficos en rotación 360°', en: 'Holographic rings in 360° rotation' },
    auraParticlesColor: '#e879f9',
  },
  {
    id: 'avatar_shadow_reaper',
    name: { es: 'Espectro de las Sombras', en: 'Shadow Specter' },
    description: {
      es: 'Aparición espectral animada con efecto dimensional de glitch y humo etéreo.',
      en: 'Animated ghostly specter with dimensional glitch distortion and ethereal smoke.',
    },
    category: 'events',
    categoryLabel: { es: 'Eventos Exclusivos', en: 'Event Exclusive' },
    emoji: '👻',
    gradient: 'from-slate-900 via-purple-950 to-emerald-950',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.85)',
    unlockType: 'event',
    eventRequirement: {
      es: '🎁 Recompensa Legendaria de Cofre Misterioso Arcade',
      en: '🎁 Legendary Arcade Mystery Box Drop Reward',
    },
    isAnimated: true,
    animationType: 'spectral_glitch',
    rarity: 'mythic',
    badgeLabel: { es: 'COFRE MISTERIOSO', en: 'MYSTERY BOX' },
    perkDescription: { es: 'Distorsión dimensional glitch animada', en: 'Animated glitch dimensional shift' },
    auraParticlesColor: '#a855f7',
  },

  // ==========================================
  // 3. LEVEL PROGRESSION PILOTS (PILOTOS)
  // ==========================================
  {
    id: 'astro_commander',
    name: { es: 'Comandante Astro', en: 'Astro Commander' },
    category: 'pilots',
    categoryLabel: { es: 'Pilotos', en: 'Pilots' },
    emoji: '🧑‍🚀',
    gradient: 'from-amber-500 via-yellow-400 to-orange-500',
    borderColor: 'border-yellow-200',
    glowColor: 'rgba(250, 204, 21, 0.4)',
    unlockLevel: 1,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'common',
  },
  {
    id: 'cyber_android',
    name: { es: 'Ciber Androide', en: 'Cyber Android' },
    category: 'pilots',
    categoryLabel: { es: 'Pilotos', en: 'Pilots' },
    emoji: '🤖',
    gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
    borderColor: 'border-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    unlockLevel: 1,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'common',
  },
  {
    id: 'quantum_pilot',
    name: { es: 'Piloto Cuántico', en: 'Quantum Pilot' },
    category: 'pilots',
    categoryLabel: { es: 'Pilotos', en: 'Pilots' },
    emoji: '🚀',
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
    borderColor: 'border-fuchsia-300',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    unlockLevel: 3,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'rare',
  },
  {
    id: 'arcade_alien',
    name: { es: 'Extraterrestre Pixel', en: 'Pixel Alien' },
    category: 'pilots',
    categoryLabel: { es: 'Pilotos', en: 'Pilots' },
    emoji: '👾',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    borderColor: 'border-emerald-300',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    unlockLevel: 5,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'rare',
  },

  // ==========================================
  // 4. LEVEL PROGRESSION BEASTS (CRIATURAS)
  // ==========================================
  {
    id: 'galaxy_dragon',
    name: { es: 'Dragón Cósmico', en: 'Cosmic Dragon' },
    category: 'beasts',
    categoryLabel: { es: 'Criaturas', en: 'Beasts' },
    emoji: '🐉',
    gradient: 'from-red-600 via-rose-500 to-amber-500',
    borderColor: 'border-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    unlockLevel: 1,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'common',
  },
  {
    id: 'starlight_phoenix',
    name: { es: 'Fénix Estelar', en: 'Starlight Phoenix' },
    category: 'beasts',
    categoryLabel: { es: 'Criaturas', en: 'Beasts' },
    emoji: '🦅',
    gradient: 'from-amber-500 via-orange-500 to-red-600',
    borderColor: 'border-amber-300',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    unlockLevel: 3,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'rare',
  },
  {
    id: 'neon_fox',
    name: { es: 'Zorro Neón', en: 'Neon Fox' },
    category: 'beasts',
    categoryLabel: { es: 'Criaturas', en: 'Beasts' },
    emoji: '🦊',
    gradient: 'from-orange-500 via-amber-400 to-yellow-300',
    borderColor: 'border-orange-300',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    unlockLevel: 5,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'rare',
  },
  {
    id: 'nebula_wolf',
    name: { es: 'Lobo Nébulas', en: 'Nebula Wolf' },
    category: 'beasts',
    categoryLabel: { es: 'Criaturas', en: 'Beasts' },
    emoji: '🐺',
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    borderColor: 'border-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    unlockLevel: 8,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'epic',
  },
  {
    id: 'golden_lion',
    name: { es: 'León Dorado', en: 'Golden Lion' },
    category: 'beasts',
    categoryLabel: { es: 'Criaturas', en: 'Beasts' },
    emoji: '🦁',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    borderColor: 'border-yellow-200',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    unlockLevel: 10,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'epic',
  },
  {
    id: 'cosmic_unicorn',
    name: { es: 'Unicornio Estelar', en: 'Star Unicorn' },
    category: 'beasts',
    categoryLabel: { es: 'Criaturas', en: 'Beasts' },
    emoji: '🦄',
    gradient: 'from-pink-400 via-purple-400 to-indigo-400',
    borderColor: 'border-pink-200',
    glowColor: 'rgba(244, 114, 182, 0.4)',
    unlockLevel: 12,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'epic',
  },

  // ==========================================
  // 5. LEVEL PROGRESSION LEGENDS (LEYENDAS)
  // ==========================================
  {
    id: 'crown_king',
    name: { es: 'Rey Soberano', en: 'Sovereign King' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: '👑',
    gradient: 'from-yellow-300 via-amber-400 to-yellow-600',
    borderColor: 'border-yellow-100',
    glowColor: 'rgba(253, 224, 71, 0.5)',
    unlockLevel: 1,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'common',
  },
  {
    id: 'trophy_champion',
    name: { es: 'Campeón Supremo', en: 'Supreme Champion' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: '🏆',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    borderColor: 'border-amber-200',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    unlockLevel: 5,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'rare',
  },
  {
    id: 'ninja_blade',
    name: { es: 'Ninja Estelar', en: 'Star Ninja' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: '🥷',
    gradient: 'from-slate-700 via-slate-800 to-black',
    borderColor: 'border-slate-400',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    unlockLevel: 8,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'epic',
  },
  {
    id: 'cyber_wizard',
    name: { es: 'Mago Cíber', en: 'Cyber Wizard' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: '🔮',
    gradient: 'from-violet-600 via-purple-700 to-indigo-900',
    borderColor: 'border-purple-300',
    glowColor: 'rgba(139, 92, 246, 0.4)',
    unlockLevel: 10,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'epic',
  },
  {
    id: 'diamond_knight',
    name: { es: 'Caballero Diamante', en: 'Diamond Knight' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: '💎',
    gradient: 'from-sky-300 via-blue-500 to-indigo-700',
    borderColor: 'border-sky-200',
    glowColor: 'rgba(125, 211, 252, 0.5)',
    unlockLevel: 15,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'legendary',
  },
  {
    id: 'hyper_speed',
    name: { es: 'Velocista Neón', en: 'Neon Speedster' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: '⚡',
    gradient: 'from-yellow-300 via-emerald-400 to-cyan-500',
    borderColor: 'border-yellow-200',
    glowColor: 'rgba(250, 204, 21, 0.5)',
    unlockLevel: 20,
    unlockType: 'level',
    isAnimated: false,
    rarity: 'legendary',
  },
];

export function getAvatarById(id?: string): AvatarItem {
  if (!id) return AVATARS[0];
  const byId = AVATARS.find((a) => a.id === id);
  if (byId) return byId;
  const byEmoji = AVATARS.find((a) => a.emoji === id);
  if (byEmoji) return byEmoji;

  // If it looks like an identifier rather than an emoji (e.g. contains '_' or length > 6)
  const isIdentifier = id.includes('_') || id.length > 6;
  const displayEmoji = isIdentifier ? '⭐' : id;

  // Custom emoji or unlisted avatar item fallback
  return {
    id: `custom_${id}`,
    name: { es: 'Piloto Estelar', en: 'Stellar Pilot' },
    category: 'legends',
    categoryLabel: { es: 'Leyendas', en: 'Legends' },
    emoji: displayEmoji,
    gradient: 'from-purple-600 via-pink-600 to-indigo-700',
    borderColor: 'border-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    unlockType: 'level',
    isAnimated: false,
    rarity: 'epic',
  };
}

export function isAvatarUnlocked(avatarId: string, playerState: { level: number; unlockedAvatars?: string[]; dailyStreak?: number; multiplayerWins?: number }): boolean {
  const avatar = getAvatarById(avatarId);
  if (!avatar) return false;

  // Unlocked explicitly via purchased/won avatar state array
  if (playerState.unlockedAvatars && playerState.unlockedAvatars.includes(avatarId)) {
    return true;
  }

  // Level Progression Avatars
  if (avatar.unlockType === 'level') {
    return playerState.level >= (avatar.unlockLevel || 1);
  }

  // Event unlock conditions
  if (avatar.unlockType === 'event') {
    if (avatar.id === 'avatar_cosmic_deity' && (playerState.dailyStreak || 0) >= 7) {
      return true;
    }
    if (avatar.id === 'avatar_arena_gladiator' && (playerState.multiplayerWins || 0) >= 15) {
      return true;
    }
  }

  return false;
}
