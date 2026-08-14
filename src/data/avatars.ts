export interface AvatarItem {
  id: string;
  name: { es: string; en: string };
  category: 'pilots' | 'beasts' | 'legends';
  categoryLabel: { es: string; en: string };
  emoji: string;
  gradient: string;
  borderColor: string;
  glowColor: string;
  unlockLevel: number;
}

export const AVATARS: AvatarItem[] = [
  // PILOTS & CYBER
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
  },

  // COSMIC BEASTS
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
  },

  // LEGENDS & SOVEREIGNS
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
  },
];

export function getAvatarById(id?: string): AvatarItem {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}
