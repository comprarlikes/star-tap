import { PlayerState, MysteryBoxRarity } from '../types';
import { SHOP_ITEMS } from './storage';

export interface MysteryBoxReward {
  type: 'coins' | 'powerup' | 'skin';
  title: string;
  description: string;
  icon: string;
  rarity: MysteryBoxRarity;
  amount?: number;
  powerupId?: string;
  powerupCharges?: number;
  powerupName?: string;
  skinId?: string;
  skinName?: string;
  color?: string;
  isDuplicateSkin?: boolean;
  duplicateCoinCompensation?: number;
}

export interface MysteryBoxProbabilities {
  coins: number;
  powerup: number;
  skin: number;
}

export const MYSTERY_BOX_PRICE = 200;

export const MYSTERY_BOX_PROBABILITIES: MysteryBoxProbabilities = {
  coins: 0.60,    // 60% Chance
  powerup: 0.28,  // 28% Chance
  skin: 0.12,     // 12% Chance
};

export const TEMPORARY_POWERUPS = [
  {
    id: 'double_coins',
    name: 'Doble Monedas',
    description: 'Multiplica x2 las monedas conseguidas durante tus próximas 3 partidas.',
    icon: '🪙',
    charges: 3,
    rarity: 'rare' as MysteryBoxRarity,
  },
  {
    id: 'extra_shield',
    name: 'Escudo Protector Total',
    description: 'Inicia tus próximas 5 partidas con +1 escudo protector antibombas.',
    icon: '🛡️',
    charges: 5,
    rarity: 'epic' as MysteryBoxRarity,
  },
  {
    id: 'time_bonus_boost',
    name: 'Fiebre del Tiempo',
    description: '+5 segundos extra de tiempo inicial en las próximas 4 partidas.',
    icon: '⏱️',
    charges: 4,
    rarity: 'rare' as MysteryBoxRarity,
  },
  {
    id: 'star_magnet_boost',
    name: 'Imán Cósmico Galáctico',
    description: '+1 uso extra del Imán de Estrellas en tus próximas 5 partidas.',
    icon: '🧲',
    charges: 5,
    rarity: 'legendary' as MysteryBoxRarity,
  },
];

/**
 * Generates a mystery box reward based on strict probability logic
 */
export function generateMysteryBoxReward(playerState: PlayerState): MysteryBoxReward {
  const roll = Math.random();

  // 1. SKIN REWARD (12% chance)
  if (roll < MYSTERY_BOX_PROBABILITIES.skin) {
    const allSkins = SHOP_ITEMS.filter((item) => item.type === 'skin');
    const lockedSkins = allSkins.filter((skin) => !playerState.unlockedSkins.includes(skin.id));

    if (lockedSkins.length > 0) {
      const randomSkin = lockedSkins[Math.floor(Math.random() * lockedSkins.length)];
      const skinRarity: MysteryBoxRarity =
        randomSkin.price >= 2000 ? 'legendary' : randomSkin.price >= 1000 ? 'epic' : 'rare';

      return {
        type: 'skin',
        title: '¡SKIN RARA DESTARCADA!',
        description: `¡Felicidades! Has desbloqueado la skin "${randomSkin.name}".`,
        icon: randomSkin.icon || '⭐',
        rarity: skinRarity,
        skinId: randomSkin.id,
        skinName: randomSkin.name,
        color: randomSkin.color || '#f59e0b',
      };
    } else {
      // Player already unlocked all skins -> duplicate compensation
      const bonusCoins = 300;
      return {
        type: 'coins',
        title: '¡DESBLOQUEO SUPREMO!',
        description: '¡Ya posees todas las skins! Compensado con +300 Monedas Legendarias.',
        icon: '💎',
        rarity: 'legendary',
        amount: bonusCoins,
        isDuplicateSkin: true,
        duplicateCoinCompensation: bonusCoins,
      };
    }
  }

  // 2. TEMPORARY POWERUP REWARD (28% chance)
  if (roll < MYSTERY_BOX_PROBABILITIES.skin + MYSTERY_BOX_PROBABILITIES.powerup) {
    const randomPowerup = TEMPORARY_POWERUPS[Math.floor(Math.random() * TEMPORARY_POWERUPS.length)];
    return {
      type: 'powerup',
      title: '¡POTENCIADOR TEMPORAL!',
      description: `${randomPowerup.name}: ${randomPowerup.description}`,
      icon: randomPowerup.icon,
      rarity: randomPowerup.rarity,
      powerupId: randomPowerup.id,
      powerupName: randomPowerup.name,
      powerupCharges: randomPowerup.charges,
    };
  }

  // 3. COINS REWARD (60% chance)
  const coinRoll = Math.random();
  let coinAmount = 70;
  let rarity: MysteryBoxRarity = 'common';
  let coinTitle = '¡Bolsa de Monedas!';
  let coinIcon = '🪙';

  if (coinRoll < 0.65) {
    // 40 to 100 Coins (Common)
    coinAmount = Math.floor(Math.random() * 61) + 40;
    rarity = 'common';
    coinTitle = '¡Pila de Monedas!';
    coinIcon = '🪙';
  } else if (coinRoll < 0.92) {
    // 120 to 250 Coins (Rare)
    coinAmount = Math.floor(Math.random() * 131) + 120;
    rarity = 'rare';
    coinTitle = '¡Cofre de Monedas!';
    coinIcon = '💰';
  } else {
    // 350 to 600 Coins (Legendary)
    coinAmount = Math.floor(Math.random() * 251) + 350;
    rarity = 'legendary';
    coinTitle = '¡JACKPOT DE MONEDAS!';
    coinIcon = '💎';
  }

  return {
    type: 'coins',
    title: coinTitle,
    description: `¡Has ganado +${coinAmount.toLocaleString()} Monedas adicionales!`,
    icon: coinIcon,
    rarity,
    amount: coinAmount,
  };
}

/**
 * Deducts box price and applies reward to state
 */
export function openMysteryBox(playerState: PlayerState): {
  reward: MysteryBoxReward;
  updatedState: PlayerState;
} {
  if (playerState.coins < MYSTERY_BOX_PRICE) {
    throw new Error('No tienes suficientes monedas para abrir la Caja de Sorpresas.');
  }

  const reward = generateMysteryBoxReward(playerState);

  const updatedState: PlayerState = {
    ...playerState,
    coins: playerState.coins - MYSTERY_BOX_PRICE,
    activeBoosters: { ...(playerState.activeBoosters || {}) },
  };

  if (reward.type === 'coins' && reward.amount) {
    updatedState.coins += reward.amount;
    updatedState.stats = {
      ...updatedState.stats,
      totalCoinsEarned: updatedState.stats.totalCoinsEarned + reward.amount,
    };
  } else if (reward.type === 'skin' && reward.skinId) {
    if (!updatedState.unlockedSkins.includes(reward.skinId)) {
      updatedState.unlockedSkins = [...updatedState.unlockedSkins, reward.skinId];
    }
  } else if (reward.type === 'powerup' && reward.powerupId && reward.powerupCharges) {
    const currentCharges = updatedState.activeBoosters?.[reward.powerupId] || 0;
    updatedState.activeBoosters = {
      ...updatedState.activeBoosters,
      [reward.powerupId]: currentCharges + reward.powerupCharges,
    };
  }

  return { reward, updatedState };
}
