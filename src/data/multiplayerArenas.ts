import { MultiplayerArena } from '../types';

export const MULTIPLAYER_ARENAS: MultiplayerArena[] = [
  {
    id: 'arena_novice',
    name: 'Nebulosa Novato',
    nameEn: 'Novice Nebula',
    description: 'Entrada accesible para dominar los reflejos estelares básicos.',
    descriptionEn: 'Accessible entry fee to master basic cosmic reflexes.',
    entryFee: 20,
    prizeCoins: 40,
    trophiesReward: 25,
    trophiesLoss: 10,
    minTrophies: 0,
    icon: '🪐',
    badge: 'Bronce',
    bgGradient: 'from-emerald-950/90 via-slate-900 to-teal-950/90',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'arena_asteroid',
    name: 'Cinturón de Asteroides',
    nameEn: 'Asteroid Belt',
    description: 'Mayor densidad de escombros y bombas. Requiere reflejos y precisión.',
    descriptionEn: 'Higher debris density and bombs. Requires swift reflexes and accuracy.',
    entryFee: 50,
    prizeCoins: 100,
    trophiesReward: 30,
    trophiesLoss: 12,
    minTrophies: 100,
    icon: '☄️',
    badge: 'Plata',
    bgGradient: 'from-amber-950/90 via-slate-900 to-orange-950/90',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'arena_diamond',
    name: 'Galaxia Diamante',
    nameEn: 'Diamond Galaxy',
    description: 'Para cazadores estelares experimentados. Ritmo acelerado y mayores apuestas.',
    descriptionEn: 'For skilled star catchers. Faster paced and higher stakes.',
    entryFee: 120,
    prizeCoins: 240,
    trophiesReward: 35,
    trophiesLoss: 15,
    minTrophies: 250,
    icon: '💎',
    badge: 'Platino',
    bgGradient: 'from-cyan-950/90 via-slate-900 to-blue-950/90',
    borderColor: 'border-cyan-500/40',
  },
  {
    id: 'arena_supernova',
    name: 'Forja Supernova',
    nameEn: 'Supernova Forge',
    description: 'Fuego cósmico y multiplicadores explosivos para pilotos de élite.',
    descriptionEn: 'Cosmic heat and explosive multipliers for elite space pilots.',
    entryFee: 250,
    prizeCoins: 500,
    trophiesReward: 42,
    trophiesLoss: 20,
    minTrophies: 500,
    icon: '🔥',
    badge: 'Maestro',
    bgGradient: 'from-rose-950/90 via-slate-900 to-amber-950/90',
    borderColor: 'border-rose-500/40',
  },
  {
    id: 'arena_blackhole',
    name: 'Agujero Negro Supremo',
    nameEn: 'Supreme Black Hole',
    description: 'El coliseo definitivo. Solo los maestros cósmicos sobreviven a la velocidad extrema.',
    descriptionEn: 'The ultimate cosmic colosseum. Only true cosmic masters survive.',
    entryFee: 400,
    prizeCoins: 800,
    trophiesReward: 50,
    trophiesLoss: 25,
    minTrophies: 800,
    icon: '👑',
    badge: 'Leyenda',
    bgGradient: 'from-purple-950/90 via-slate-900 to-rose-950/90',
    borderColor: 'border-purple-500/40',
  },
];

export function getLeagueTitle(trophies: number = 0, lang: 'es' | 'en' = 'es'): { title: string; badge: string; color: string; min: number; max: number } {
  if (trophies < 200) {
    return {
      title: lang === 'en' ? 'Bronze Comet' : 'Cometa de Bronce',
      badge: '🥉',
      color: 'text-amber-600',
      min: 0,
      max: 200,
    };
  }
  if (trophies < 500) {
    return {
      title: lang === 'en' ? 'Silver Asteroid' : 'Asteroide de Plata',
      badge: '🥈',
      color: 'text-slate-300',
      min: 200,
      max: 500,
    };
  }
  if (trophies < 900) {
    return {
      title: lang === 'en' ? 'Gold Supernova' : 'Supernova de Oro',
      badge: '🥇',
      color: 'text-yellow-400',
      min: 500,
      max: 900,
    };
  }
  if (trophies < 1500) {
    return {
      title: lang === 'en' ? 'Diamond Pulsar' : 'Púlsar de Diamante',
      badge: '💎',
      color: 'text-cyan-400',
      min: 900,
      max: 1500,
    };
  }
  return {
    title: lang === 'en' ? 'Cosmic Legend' : 'Leyenda Cósmica',
    badge: '👑',
    color: 'text-purple-400',
    min: 1500,
    max: 9999,
  };
}

export const ARENAS = MULTIPLAYER_ARENAS;
