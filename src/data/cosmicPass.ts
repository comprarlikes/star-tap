import { CosmicPassTier, CosmicPassState } from '../types';

export const CURRENT_SEASON_INFO = {
  seasonNumber: 1,
  seasonName: 'Temporada 1: El Despertar Cósmico',
  seasonNameEn: 'Season 1: Cosmic Awakening',
  endsAt: '30 días restantes',
  endsAtEn: '30 days remaining',
  vipPassPriceCoins: 2500, // Unlock VIP track with 2500 Coins or via Instant VIP
  xpPerTier: 250,
};

export const INITIAL_COSMIC_PASS: CosmicPassState = {
  seasonNumber: 1,
  seasonName: 'Temporada 1: El Despertar Cósmico',
  seasonNameEn: 'Season 1: Cosmic Awakening',
  endsAt: '30 días restantes',
  currentXp: 0,
  isVipUnlocked: false,
  claimedFreeTiers: [],
  claimedVipTiers: [],
};

export const COSMIC_PASS_TIERS: CosmicPassTier[] = Array.from({ length: 30 }, (_, index) => {
  const tier = index + 1;
  const requiredXp = tier * 250;

  // Free Rewards rotation
  let freeReward: CosmicPassTier['freeReward'] = {
    type: 'coins',
    amount: 100 + tier * 15,
    name: `${100 + tier * 15} Monedas`,
    nameEn: `${100 + tier * 15} Coins`,
    icon: '🪙',
  };

  if (tier % 5 === 0) {
    freeReward = {
      type: 'talent_point',
      amount: 1,
      name: '1 Punto de Talento',
      nameEn: '1 Talent Point',
      icon: '🔮',
    };
  } else if (tier % 3 === 0) {
    freeReward = {
      type: 'xp',
      amount: 200 + tier * 20,
      name: `${200 + tier * 20} XP Cósmica`,
      nameEn: `${200 + tier * 20} Cosmic XP`,
      icon: '⚡',
    };
  } else if (tier === 15) {
    freeReward = {
      type: 'avatar',
      amount: 1,
      id: 'avatar_starlight_guardian',
      name: 'Avatar Guardián Estelar',
      nameEn: 'Starlight Guardian Avatar',
      icon: '🛡️',
    };
  } else if (tier === 30) {
    freeReward = {
      type: 'talent_point',
      amount: 3,
      name: '3 Puntos de Talento',
      nameEn: '3 Talent Points',
      icon: '🔮',
    };
  }

  // VIP Rewards (Much more exclusive and exciting)
  let vipReward: CosmicPassTier['vipReward'] = {
    type: 'coins',
    amount: 250 + tier * 40,
    name: `${250 + tier * 40} Monedas`,
    nameEn: `${250 + tier * 40} Coins`,
    icon: '💰',
  };

  if (tier === 5) {
    vipReward = {
      type: 'talent_point',
      amount: 2,
      name: '2 Puntos de Talento Cósmico',
      nameEn: '2 Cosmic Talent Points',
      icon: '🔮',
    };
  } else if (tier === 10) {
    vipReward = {
      type: 'title',
      amount: 1,
      name: 'Título: «Señor del Vacío»',
      nameEn: 'Title: «Void Overlord»',
      icon: '👑',
    };
  } else if (tier === 15) {
    vipReward = {
      type: 'skin',
      amount: 1,
      id: 'skin_cyber_nova',
      name: 'Cuchilla Cyber Nova',
      nameEn: 'Cyber Nova Blade',
      icon: '🌌',
    };
  } else if (tier === 20) {
    vipReward = {
      type: 'talent_point',
      amount: 3,
      name: '3 Puntos de Talento Cósmico',
      nameEn: '3 Cosmic Talent Points',
      icon: '🔮',
    };
  } else if (tier === 25) {
    vipReward = {
      type: 'avatar',
      amount: 1,
      id: 'avatar_cosmic_archon',
      name: 'Avatar Arconte Cósmico',
      nameEn: 'Cosmic Archon Avatar',
      icon: '🪐',
    };
  } else if (tier === 30) {
    vipReward = {
      type: 'skin',
      amount: 1,
      id: 'skin_celestial_emperor',
      name: 'Aspecto: Emperador Celestial',
      nameEn: 'Skin: Celestial Emperor',
      icon: '👑',
    };
  } else if (tier % 2 === 0) {
    vipReward = {
      type: 'talent_point',
      amount: 1,
      name: '1 Punto de Talento',
      nameEn: '1 Talent Point',
      icon: '🔮',
    };
  }

  return {
    tier,
    requiredXp,
    freeReward,
    vipReward,
  };
});
