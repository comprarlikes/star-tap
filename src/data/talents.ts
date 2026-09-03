import { CosmicTalent } from '../types';

export const COSMIC_TALENTS: CosmicTalent[] = [
  {
    id: 'cosmic_reflexes',
    name: 'Reflejos Cósmicos',
    nameEn: 'Cosmic Reflexes',
    description: 'Extiende el tiempo que las estrellas permanecen en pantalla antes de desaparecer.',
    descriptionEn: 'Extends the time stars remain on screen before despawning.',
    icon: '⏱️',
    branch: 'utility',
    tier: 1,
    maxRank: 5,
    costs: [1, 1, 2, 2, 3], // Talent points
    costType: 'talent_points',
    effectDescription: '+{val}% de tiempo antes de que las estrellas desaparezcan',
    effectDescriptionEn: '+{val}% extra time before stars despawn',
  },
  {
    id: 'gravity_pull',
    name: 'Imán Gravitatorio',
    nameEn: 'Gravity Pull',
    description: 'Aumenta el radio de impacto de tus cortes y toques, facilitando combos perfectos.',
    descriptionEn: 'Increases the slice and tap impact radius, making perfect combos easier.',
    icon: '🧲',
    branch: 'precision',
    tier: 1,
    maxRank: 5,
    costs: [1, 1, 2, 2, 3],
    costType: 'talent_points',
    effectDescription: '+{val}% de área de corte y tolerancia táctil',
    effectDescriptionEn: '+{val}% slice area and touch forgiveness',
  },
  {
    id: 'astral_luck',
    name: 'Suerte Astral',
    nameEn: 'Astral Luck',
    description: 'Incrementa la probabilidad de aparición de Estrellas Doradas, Diamantes y Supernovas.',
    descriptionEn: 'Increases the spawn rate of Golden, Diamond, and Supernova stars.',
    icon: '🍀',
    branch: 'fortune',
    tier: 2,
    maxRank: 5,
    costs: [1, 2, 2, 3, 4],
    costType: 'talent_points',
    effectDescription: '+{val}% tasa de aparición de estrellas raras',
    effectDescriptionEn: '+{val}% rare star spawn rate',
  },
  {
    id: 'fever_overdrive',
    name: 'Fever Overdrive',
    nameEn: 'Fever Overdrive',
    description: 'Aumenta la duración del modo Fever y añade un multiplicador de puntuación adicional.',
    descriptionEn: 'Extends Fever mode duration and adds an additional score multiplier.',
    icon: '🔥',
    branch: 'utility',
    tier: 2,
    maxRank: 5,
    costs: [1, 2, 2, 3, 4],
    costType: 'talent_points',
    effectDescription: '+{val}s de duración de Fever y +{multiplier}x bonus',
    effectDescriptionEn: '+{val}s Fever duration and +{multiplier}x bonus',
  },
  {
    id: 'singularity_shield',
    name: 'Escudo de Singularidad',
    nameEn: 'Singularity Shield',
    description: 'Otorga una probabilidad pasiva de absorber y desactivar bombas automáticamente sin daño.',
    descriptionEn: 'Grants a passive chance to absorb and defuse bombs automatically without damage.',
    icon: '🛡️',
    branch: 'defense',
    tier: 3,
    maxRank: 5,
    costs: [2, 2, 3, 3, 5],
    costType: 'talent_points',
    effectDescription: '{val}% probabilidad de neutralizar bombas al tocarlas',
    effectDescriptionEn: '{val}% chance to neutralize bombs when tapped',
  },
  {
    id: 'stardust_harvest',
    name: 'Cosecha de Polvo',
    nameEn: 'Stardust Harvest',
    description: 'Aumenta permanentemente todas las monedas y Stardust ganados al finalizar cualquier partida.',
    descriptionEn: 'Permanently increases all coins and Stardust earned after every match.',
    icon: '🪙',
    branch: 'economy',
    tier: 3,
    maxRank: 5,
    costs: [2, 2, 3, 4, 5],
    costType: 'talent_points',
    effectDescription: '+{val}% monedas/Stardust ganadas en cada partida',
    effectDescriptionEn: '+{val}% coins/Stardust gained per match',
  },
];

export function getTalentValue(talentId: string, rank: number): number {
  if (rank <= 0) return 0;
  switch (talentId) {
    case 'cosmic_reflexes':
      return rank * 10; // +10%, +20%, +30%, +40%, +50%
    case 'gravity_pull':
      return rank * 5; // +5%, +10%, +15%, +20%, +25%
    case 'astral_luck':
      return rank * 6; // +6%, +12%, +18%, +24%, +30%
    case 'fever_overdrive':
      return rank * 1.5; // +1.5s, +3.0s, +4.5s, +6.0s, +7.5s
    case 'singularity_shield':
      return rank * 10; // 10%, 20%, 30%, 40%, 50% chance
    case 'stardust_harvest':
      return rank * 15; // +15%, +30%, +45%, +60%, +75%
    default:
      return 0;
  }
}
