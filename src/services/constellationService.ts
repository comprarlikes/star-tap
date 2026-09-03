import { 
  ConstellationClan, 
  ConstellationMember, 
  ConstellationChatMessage, 
  ConstellationPerk, 
  PlayerState, 
  ConstellationRole 
} from '../types';

const STORAGE_KEY_CLANS = 'star_tap_cosmic_constellations_v1';
const STORAGE_KEY_CHAT = 'star_tap_constellation_chat_v1';
const STORAGE_KEY_LAST_DONATION_REQ = 'star_tap_last_donation_req_v1';

export const CONSTELLATION_CREATION_FEE = 2500; // Coins to found a new clan

export const DEFAULT_PERKS_TEMPLATE: ConstellationPerk[] = [
  {
    id: 'perk_stardust_bonus',
    name: 'Sifón de Polvo Estelar',
    nameEn: 'Stardust Siphon',
    description: 'Aumenta un +5% el polvo estelar y monedas obtenidas en todos los modos por nivel.',
    descriptionEn: 'Increases stardust and coins gained in all game modes by +5% per rank.',
    icon: '✨',
    level: 1,
    maxLevel: 5,
    costStardust: 500,
    unlocked: true,
    statBonus: '+5% Monedas / Partida',
  },
  {
    id: 'perk_frenzy_boost',
    name: 'Aura de Fiebre Cósmica',
    nameEn: 'Cosmic Fever Aura',
    description: 'Extiende la duración del modo Fiebre en +1.5 segundos por nivel para todo el clan.',
    descriptionEn: 'Extends Fever Mode duration by +1.5s per rank for all clan members.',
    icon: '🔥',
    level: 1,
    maxLevel: 5,
    costStardust: 800,
    unlocked: true,
    statBonus: '+1.5s Duración Fiebre',
  },
  {
    id: 'perk_chest_multiplier',
    name: 'Condensador del Cofre de Clan',
    nameEn: 'Clan Chest Condenser',
    description: 'Mejora las recompensas del Cofre Semanal de Constelación un +15% por nivel.',
    descriptionEn: 'Boosts weekly Clan Chest rewards by +15% per rank.',
    icon: '🎁',
    level: 1,
    maxLevel: 4,
    costStardust: 1200,
    unlocked: true,
    statBonus: '+15% Botín en Cofre',
  },
  {
    id: 'perk_shield_regen',
    name: 'Baliza de Escudo Estelar',
    nameEn: 'Stellar Shield Beacon',
    description: 'Otorga un 10% de probabilidad de generar un escudo de estrella protector gratis al inicio.',
    descriptionEn: '10% chance to spawn a free protective star shield at game start.',
    icon: '🛡️',
    level: 0,
    maxLevel: 3,
    costStardust: 1500,
    unlocked: false,
    statBonus: '+10% Escudo Inicial',
  },
];

const SEED_MEMBERS_ORION: ConstellationMember[] = [
  {
    id: 'orion_lead',
    name: 'AstroNova_99',
    avatar: '👨‍🚀',
    role: 'leader',
    trophies: 3420,
    level: 42,
    weeklyContribution: 1250,
    donationsGiven: 48,
    status: 'online',
    lastActive: 'Ahora',
    customTitle: 'Comandante Supremo',
  },
  {
    id: 'orion_off1',
    name: 'SolarisQueen',
    avatar: '👩‍🎤',
    role: 'officer',
    trophies: 2890,
    level: 38,
    weeklyContribution: 940,
    donationsGiven: 32,
    status: 'online',
    lastActive: 'Hace 5m',
    customTitle: 'Oficial de Asalto',
  },
  {
    id: 'orion_vet1',
    name: 'VortexPilot',
    avatar: '🛸',
    role: 'veteran',
    trophies: 2410,
    level: 31,
    weeklyContribution: 820,
    donationsGiven: 26,
    status: 'in_game',
    lastActive: 'En Duelo 1v1',
    customTitle: 'As del Vacío',
  },
  {
    id: 'orion_mem1',
    name: 'StardustKnight',
    avatar: '⚡',
    role: 'member',
    trophies: 1850,
    level: 24,
    weeklyContribution: 510,
    donationsGiven: 14,
    status: 'offline',
    lastActive: 'Hace 2h',
  },
  {
    id: 'orion_mem2',
    name: 'NebulaDrifter',
    avatar: '🌌',
    role: 'member',
    trophies: 1620,
    level: 19,
    weeklyContribution: 430,
    donationsGiven: 10,
    status: 'offline',
    lastActive: 'Ayer',
  },
];

const SEED_MEMBERS_PHOENIX: ConstellationMember[] = [
  {
    id: 'phoenix_lead',
    name: 'InfernoKing',
    avatar: '🔥',
    role: 'leader',
    trophies: 3810,
    level: 48,
    weeklyContribution: 1680,
    donationsGiven: 64,
    status: 'online',
    lastActive: 'Ahora',
    customTitle: 'Señor del Fuego',
  },
  {
    id: 'phoenix_off1',
    name: 'BlazeStriker',
    avatar: '🦅',
    role: 'officer',
    trophies: 2950,
    level: 36,
    weeklyContribution: 1020,
    donationsGiven: 40,
    status: 'in_game',
    lastActive: 'En Campaña',
  },
  {
    id: 'phoenix_mem1',
    name: 'EmberGlow',
    avatar: '✨',
    role: 'member',
    trophies: 2100,
    level: 27,
    weeklyContribution: 730,
    donationsGiven: 18,
    status: 'offline',
    lastActive: 'Hace 1h',
  },
];

const SEED_CLANS: ConstellationClan[] = [
  {
    id: 'clan_orion',
    name: 'Orión Inmortal',
    tag: '#ORION',
    description: 'Constelación de élite enfocada en dominar las Guerras Galácticas y el Duelo 1v1. ¡Donaciones activas 24/7!',
    badge: '🏹',
    badgeColor: '#fbbf24',
    bannerGradient: 'from-amber-600 via-purple-900 to-slate-950',
    type: 'open',
    minTrophies: 1000,
    level: 8,
    stardust: 3450,
    stardustLevelMax: 5000,
    warTrophies: 18450,
    membersCount: 46,
    maxMembers: 50,
    members: SEED_MEMBERS_ORION,
    chestLevel: 7,
    chestProgress: 6800,
    chestTarget: 10000,
    perks: DEFAULT_PERKS_TEMPLATE,
    warSeason: {
      seasonId: 'war_s12',
      seasonNumber: 12,
      divisionName: 'Nebulosa de Diamante I',
      divisionNameEn: 'Diamond Nebula I',
      divisionTier: 'diamond',
      endsInHours: 42,
      clanRank: 3,
      clanWarScore: 48920,
      opponentClanName: 'Titanes del Caos',
      opponentClanScore: 46100,
      opponentClanBadge: '⚔️',
      tierRewardCoins: 5000,
      tierRewardStardust: 1200,
      tierRewardCrystals: 250,
    },
    activityLog: [
      { id: 'act_1', text: 'AstroNova_99 subió el Cofre de Constelación a Nivel 7', time: 'Hace 20m', icon: '🎁' },
      { id: 'act_2', text: 'SolarisQueen ganó 45 copas en Guerra Galáctica', time: 'Hace 1h', icon: '⚔️' },
      { id: 'act_3', text: 'El clan desbloqueó la mejora: Sifón de Polvo Estelar Lv.2', time: 'Ayer', icon: '✨' },
    ],
  },
  {
    id: 'clan_phoenix',
    name: 'Fénix Cósmico',
    tag: '#PHOENIX',
    description: 'Guerreros que renacen de las cenizas estelares. Buscamos jugadores activos para escalar a División Diamante.',
    badge: '🦅',
    badgeColor: '#f97316',
    bannerGradient: 'from-orange-600 via-rose-900 to-slate-950',
    type: 'open',
    minTrophies: 600,
    level: 7,
    stardust: 2180,
    stardustLevelMax: 4000,
    warTrophies: 14200,
    membersCount: 42,
    maxMembers: 50,
    members: SEED_MEMBERS_PHOENIX,
    chestLevel: 5,
    chestProgress: 4200,
    chestTarget: 7500,
    perks: DEFAULT_PERKS_TEMPLATE,
    warSeason: {
      seasonId: 'war_s12',
      seasonNumber: 12,
      divisionName: 'Liga Solar Oro II',
      divisionNameEn: 'Solar Gold League II',
      divisionTier: 'gold',
      endsInHours: 42,
      clanRank: 1,
      clanWarScore: 39500,
      opponentClanName: 'Dragones de Plasma',
      opponentClanScore: 37800,
      opponentClanBadge: '🐉',
      tierRewardCoins: 3500,
      tierRewardStardust: 800,
      tierRewardCrystals: 150,
    },
    activityLog: [
      { id: 'act_p1', text: 'InfernoKing completó un Duelo Imbatible (100x combo)', time: 'Hace 15m', icon: '🔥' },
      { id: 'act_p2', text: 'Cofre de Constelación subió a Nivel 5', time: 'Hace 3h', icon: '🎁' },
    ],
  },
  {
    id: 'clan_quantum',
    name: 'Nebulosa Cuántica',
    tag: '#NEBULA',
    description: 'Comunidad científica y estratégica. Cooperación total, donaciones al máximo y análisis de patrones.',
    badge: '🌌',
    badgeColor: '#06b6d4',
    bannerGradient: 'from-cyan-600 via-blue-900 to-slate-950',
    type: 'open',
    minTrophies: 1200,
    level: 9,
    stardust: 4890,
    stardustLevelMax: 6000,
    warTrophies: 22100,
    membersCount: 48,
    maxMembers: 50,
    members: [],
    chestLevel: 8,
    chestProgress: 8900,
    chestTarget: 12000,
    perks: DEFAULT_PERKS_TEMPLATE,
    warSeason: {
      seasonId: 'war_s12',
      seasonNumber: 12,
      divisionName: 'Liga Maestra Cósmica',
      divisionNameEn: 'Cosmic Master League',
      divisionTier: 'master',
      endsInHours: 42,
      clanRank: 2,
      clanWarScore: 61200,
      opponentClanName: 'Orden de Andrómeda',
      opponentClanScore: 59800,
      opponentClanBadge: '🛡️',
      tierRewardCoins: 7500,
      tierRewardStardust: 2000,
      tierRewardCrystals: 400,
    },
  },
  {
    id: 'clan_void',
    name: 'Vórtice del Vacío',
    tag: '#VOID',
    description: 'Silenciosos y letales. Especialistas en modo Fiebre y velocidad pura. Aceptamos nuevos talentos.',
    badge: '🕳️',
    badgeColor: '#a855f7',
    bannerGradient: 'from-purple-600 via-indigo-950 to-slate-950',
    type: 'open',
    minTrophies: 300,
    level: 5,
    stardust: 1400,
    stardustLevelMax: 3000,
    warTrophies: 8900,
    membersCount: 35,
    maxMembers: 50,
    members: [],
    chestLevel: 4,
    chestProgress: 2900,
    chestTarget: 5000,
    perks: DEFAULT_PERKS_TEMPLATE,
  },
  {
    id: 'clan_supernova',
    name: 'Legión Supernova',
    tag: '#NOVA',
    description: 'Explosiones de puntuación masiva. Jugadores casuales y competitivos bienvenidos por igual.',
    badge: '💥',
    badgeColor: '#eab308',
    bannerGradient: 'from-yellow-500 via-amber-900 to-slate-950',
    type: 'open',
    minTrophies: 0,
    level: 4,
    stardust: 980,
    stardustLevelMax: 2500,
    warTrophies: 6400,
    membersCount: 29,
    maxMembers: 50,
    members: [],
    chestLevel: 3,
    chestProgress: 1800,
    chestTarget: 3500,
    perks: DEFAULT_PERKS_TEMPLATE,
  },
];

const INITIAL_CHAT_MESSAGES: Record<string, ConstellationChatMessage[]> = {
  clan_orion: [
    {
      id: 'msg_1',
      senderId: 'orion_lead',
      senderName: 'AstroNova_99',
      senderAvatar: '👨‍🚀',
      senderRole: 'leader',
      text: '¡Bienvenidos todos a la Ronda 12 de la Guerra Galáctica! Estamos en top 3, a por el cofre diamante 💎🚀',
      timestamp: 'Hoy, 10:15',
      type: 'text',
    },
    {
      id: 'msg_2',
      senderId: 'orion_off1',
      senderName: 'SolarisQueen',
      senderAvatar: '👩‍🎤',
      senderRole: 'officer',
      text: 'Acabo de conseguir 940 puntos en Duelo 1v1. ¡Recordad donar polvo estelar para subir el sifón!',
      timestamp: 'Hoy, 11:30',
      type: 'text',
    },
    {
      id: 'msg_3',
      senderId: 'orion_vet1',
      senderName: 'VortexPilot',
      senderAvatar: '🛸',
      senderRole: 'veteran',
      text: 'Solicito recarga de Polvo Estelar para subir de nivel a mi Mascota Cósmica.',
      timestamp: 'Hoy, 12:05',
      type: 'donation_request',
      donationData: {
        requestId: 'req_vortex_1',
        requestedAmount: 100,
        currentAmount: 40,
        fulfilledBy: ['orion_lead', 'orion_off1'],
        perkBonus: '+20 Monedas de clan al donar',
      },
    },
  ],
};

class ConstellationService {
  private clans: ConstellationClan[] = [];
  private chatMessages: Record<string, ConstellationChatMessage[]> = {};

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedClans = localStorage.getItem(STORAGE_KEY_CLANS);
      if (storedClans) {
        this.clans = JSON.parse(storedClans);
      } else {
        this.clans = SEED_CLANS;
        this.saveClans();
      }

      const storedChat = localStorage.getItem(STORAGE_KEY_CHAT);
      if (storedChat) {
        this.chatMessages = JSON.parse(storedChat);
      } else {
        this.chatMessages = INITIAL_CHAT_MESSAGES;
        this.saveChat();
      }
    } catch (e) {
      console.warn('Error loading constellation state:', e);
      this.clans = SEED_CLANS;
      this.chatMessages = INITIAL_CHAT_MESSAGES;
    }
  }

  private saveClans() {
    try {
      localStorage.setItem(STORAGE_KEY_CLANS, JSON.stringify(this.clans));
    } catch (e) {
      console.warn('Error saving clans:', e);
    }
  }

  private saveChat() {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(this.chatMessages));
    } catch (e) {
      console.warn('Error saving constellation chat:', e);
    }
  }

  public getConstellations(): ConstellationClan[] {
    return this.clans;
  }

  public getConstellationById(clanId: string): ConstellationClan | null {
    return this.clans.find((c) => c.id === clanId) || null;
  }

  public getUserConstellation(playerState: PlayerState): ConstellationClan | null {
    if (!playerState.constellationId) return null;
    return this.getConstellationById(playerState.constellationId);
  }

  public createConstellation(
    data: {
      name: string;
      tag: string;
      description: string;
      badge: string;
      badgeColor: string;
      minTrophies: number;
      type: 'open' | 'invite_only';
    },
    playerState: PlayerState
  ): { success: boolean; clan?: ConstellationClan; error?: string } {
    if (playerState.coins < CONSTELLATION_CREATION_FEE) {
      return { success: false, error: 'No tienes suficientes monedas cósmicas (se requieren 2,500 🪙).' };
    }

    if (!data.name.trim() || data.name.length < 3) {
      return { success: false, error: 'El nombre de la Constelación debe tener al menos 3 caracteres.' };
    }

    const cleanTag = data.tag.startsWith('#') ? data.tag.toUpperCase() : `#${data.tag.toUpperCase()}`;
    const clanId = `clan_${Date.now()}`;

    const userMember: ConstellationMember = {
      id: 'player_user',
      name: playerState.name || 'Comandante Estelar',
      avatar: playerState.avatar || '⭐',
      role: 'leader',
      trophies: playerState.trophies || 0,
      level: playerState.level || 1,
      weeklyContribution: 0,
      donationsGiven: 0,
      status: 'online',
      lastActive: 'Ahora',
      customTitle: 'Fundador Cósmico',
    };

    const newClan: ConstellationClan = {
      id: clanId,
      name: data.name.trim(),
      tag: cleanTag,
      description: data.description.trim() || 'Nueva Constelación Estelar en ascenso.',
      badge: data.badge || '👑',
      badgeColor: data.badgeColor || '#a855f7',
      bannerGradient: 'from-purple-700 via-indigo-900 to-slate-950',
      type: data.type || 'open',
      minTrophies: data.minTrophies || 0,
      level: 1,
      stardust: 100,
      stardustLevelMax: 1000,
      warTrophies: 100,
      membersCount: 1,
      maxMembers: 50,
      members: [userMember],
      chestLevel: 1,
      chestProgress: 0,
      chestTarget: 1500,
      perks: DEFAULT_PERKS_TEMPLATE,
      warSeason: {
        seasonId: 'war_s12',
        seasonNumber: 12,
        divisionName: 'Liga Bronce Estelar I',
        divisionNameEn: 'Bronze Star League I',
        divisionTier: 'bronze',
        endsInHours: 48,
        clanRank: 1,
        clanWarScore: 100,
        opponentClanName: 'Cometas Novatos',
        opponentClanScore: 80,
        opponentClanBadge: '🌠',
        tierRewardCoins: 1500,
        tierRewardStardust: 400,
        tierRewardCrystals: 50,
      },
      activityLog: [
        {
          id: `act_${Date.now()}`,
          text: `${playerState.name} fundó la Constelación ${data.name.trim()}!`,
          time: 'Recién',
          icon: '👑',
        },
      ],
      isUserLeader: true,
      isUserMember: true,
    };

    this.clans.unshift(newClan);
    this.saveClans();

    this.chatMessages[clanId] = [
      {
        id: `msg_sys_${Date.now()}`,
        senderId: 'system',
        senderName: 'Voz Galáctica',
        senderAvatar: '🪐',
        senderRole: 'leader',
        text: `¡Bienvenidos a la nueva Constelación ${newClan.name}! Que vuestras estrellas brillen con gloria.`,
        timestamp: 'Ahora',
        type: 'system',
      },
    ];
    this.saveChat();

    return { success: true, clan: newClan };
  }

  public joinConstellation(
    clanId: string,
    playerState: PlayerState
  ): { success: boolean; clan?: ConstellationClan; error?: string } {
    const clan = this.getConstellationById(clanId);
    if (!clan) return { success: false, error: 'Constelación no encontrada.' };

    if (clan.membersCount >= clan.maxMembers) {
      return { success: false, error: 'Esta Constelación ha alcanzado el límite máximo de 50 miembros.' };
    }

    if ((playerState.trophies || 0) < clan.minTrophies) {
      return { 
        success: false, 
        error: `Se requieren al menos ${clan.minTrophies} 🏆 copas para unirse a esta Constelación.` 
      };
    }

    // Check if already member
    const existingMember = clan.members.find((m) => m.id === 'player_user');
    if (!existingMember) {
      const newMember: ConstellationMember = {
        id: 'player_user',
        name: playerState.name || 'Piloto Estelar',
        avatar: playerState.avatar || '⭐',
        role: 'member',
        trophies: playerState.trophies || 0,
        level: playerState.level || 1,
        weeklyContribution: 0,
        donationsGiven: 0,
        status: 'online',
        lastActive: 'Ahora',
      };
      clan.members.push(newMember);
      clan.membersCount = clan.members.length;
      clan.warTrophies += (playerState.trophies || 0);

      // Add activity
      if (!clan.activityLog) clan.activityLog = [];
      clan.activityLog.unshift({
        id: `act_${Date.now()}`,
        text: `${playerState.name} se ha unido a la Constelación!`,
        time: 'Ahora',
        icon: '🚀',
      });

      this.saveClans();

      // System chat message
      this.sendChatMessage(clanId, `${playerState.name} se unió al clan. ¡Denle la bienvenida!`, playerState, 'system');
    }

    return { success: true, clan };
  }

  public leaveConstellation(playerState: PlayerState): { success: boolean; error?: string } {
    if (!playerState.constellationId) return { success: false, error: 'No perteneces a ninguna Constelación.' };

    const clan = this.getConstellationById(playerState.constellationId);
    if (clan) {
      clan.members = clan.members.filter((m) => m.id !== 'player_user');
      clan.membersCount = clan.members.length;
      if (clan.activityLog) {
        clan.activityLog.unshift({
          id: `act_${Date.now()}`,
          text: `${playerState.name} ha dejado la Constelación.`,
          time: 'Ahora',
          icon: '🚪',
        });
      }
      this.saveClans();
    }

    return { success: true };
  }

  public getChatMessages(clanId: string): ConstellationChatMessage[] {
    return this.chatMessages[clanId] || [];
  }

  public toggleMessageReaction(
    clanId: string,
    messageId: string,
    emoji: string,
    userId: string = 'player_user'
  ): { success: boolean; reactions?: Record<string, string[]> } {
    const messages = this.chatMessages[clanId] || [];
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return { success: false };

    if (!msg.reactions) {
      msg.reactions = {};
    }

    const currentReactions = msg.reactions[emoji] || [];
    if (currentReactions.includes(userId)) {
      msg.reactions[emoji] = currentReactions.filter((id) => id !== userId);
      if (msg.reactions[emoji].length === 0) {
        delete msg.reactions[emoji];
      }
    } else {
      msg.reactions[emoji] = [...currentReactions, userId];
    }

    this.saveChat();
    return { success: true, reactions: msg.reactions };
  }

  public sendChatMessage(
    clanId: string,
    text: string,
    playerState: PlayerState,
    type: 'text' | 'system' = 'text'
  ): { success: boolean; message?: ConstellationChatMessage } {
    if (!text.trim()) return { success: false };

    if (!this.chatMessages[clanId]) {
      this.chatMessages[clanId] = [];
    }

    const newMessage: ConstellationChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderId: type === 'system' ? 'system' : 'player_user',
      senderName: type === 'system' ? 'Voz Galáctica' : playerState.name,
      senderAvatar: type === 'system' ? '🪐' : playerState.avatar || '⭐',
      senderRole: playerState.constellationRole || 'member',
      text: text.trim(),
      timestamp: 'Ahora',
      type,
      reactions: {},
    };

    this.chatMessages[clanId].push(newMessage);
    this.saveChat();

    // Trigger organic simulated reaction/reply from clan members if user sent a text message
    if (type === 'text') {
      this.triggerOrganicClanResponse(clanId, text, playerState);
    }

    return { success: true, message: newMessage };
  }

  public sendStickerMessage(
    clanId: string,
    sticker: { id: string; emoji: string; title: string; animEffect?: string },
    playerState: PlayerState
  ): { success: boolean; message?: ConstellationChatMessage } {
    if (!this.chatMessages[clanId]) {
      this.chatMessages[clanId] = [];
    }

    const newMessage: ConstellationChatMessage = {
      id: `msg_stk_${Date.now()}`,
      senderId: 'player_user',
      senderName: playerState.name,
      senderAvatar: playerState.avatar || '⭐',
      senderRole: playerState.constellationRole || 'member',
      text: sticker.title,
      timestamp: 'Ahora',
      type: 'sticker',
      sticker,
      reactions: { '🔥': ['bot_orion_1'] },
    };

    this.chatMessages[clanId].push(newMessage);
    this.saveChat();
    return { success: true, message: newMessage };
  }

  public sendChallengeInvite(
    clanId: string,
    challenge: { mode: any; wager: number; targetScore?: number },
    playerState: PlayerState
  ): { success: boolean; message?: ConstellationChatMessage } {
    if (!this.chatMessages[clanId]) {
      this.chatMessages[clanId] = [];
    }

    const modeLabels: Record<string, string> = {
      classic: 'Clásico',
      blitz: 'Contra Reloj',
      zen: 'Modo Zen',
      hardcore: 'Hardcore',
      arcade: 'Arcade Rush',
    };

    const modeName = modeLabels[challenge.mode] || challenge.mode;
    const newMessage: ConstellationChatMessage = {
      id: `msg_duel_${Date.now()}`,
      senderId: 'player_user',
      senderName: playerState.name,
      senderAvatar: playerState.avatar || '⭐',
      senderRole: playerState.constellationRole || 'member',
      text: `⚔️ ¡Lanza un Desafío 1v1 en Modo ${modeName}! Apuesta: 🪙 ${challenge.wager}`,
      timestamp: 'Ahora',
      type: 'challenge_invite',
      challengeData: challenge,
      reactions: { '⚔️': ['bot_orion_2'] },
    };

    this.chatMessages[clanId].push(newMessage);
    this.saveChat();
    return { success: true, message: newMessage };
  }

  public requestDonation(
    clanId: string,
    itemType: 'stardust' | 'energy' | 'shield' | 'coins',
    requestedAmount: number,
    playerState: PlayerState
  ): { success: boolean; message?: ConstellationChatMessage; error?: string } {
    const lastReq = localStorage.getItem(STORAGE_KEY_LAST_DONATION_REQ);
    const now = Date.now();
    if (lastReq) {
      const diffMs = now - parseInt(lastReq, 10);
      const minutesLeft = Math.ceil((2 * 3600 * 1000 - diffMs) / (60 * 1000));
      if (diffMs < 2 * 3600 * 1000) {
        return { 
          success: false, 
          error: `Puedes solicitar donaciones cada 2 horas (espera ${minutesLeft} minutos).` 
        };
      }
    }

    if (!this.chatMessages[clanId]) {
      this.chatMessages[clanId] = [];
    }

    const itemTitles: Record<string, string> = {
      stardust: '¡Solicito Polvo Estelar para subir las mejoras del clan! ✨',
      energy: '¡Necesito Baterías de Energía Cósmica para seguir jugando! ⚡',
      shield: '¡Solicito un Escudo Protector para la Guerra de Clanes! 🛡️',
      coins: '¡Solicito un cofre de Monedas de Clan! 🪙',
    };

    const perkBonuses: Record<string, string> = {
      stardust: '+250 🪙 Monedas y +50 XP al donador',
      energy: '+150 🪙 Monedas y +25 XP al donador',
      shield: '+300 🪙 Monedas y +60 XP al donador',
      coins: '+100 ✨ Polvo Estelar al donador',
    };

    const requestId = `req_${Date.now()}`;
    const donationMsg: ConstellationChatMessage = {
      id: `msg_don_${Date.now()}`,
      senderId: 'player_user',
      senderName: playerState.name,
      senderAvatar: playerState.avatar || '⭐',
      senderRole: playerState.constellationRole || 'member',
      text: itemTitles[itemType] || '¡Solicito donación de recursos!',
      timestamp: 'Ahora',
      type: 'donation_request',
      donationData: {
        requestId,
        itemType,
        requestedAmount,
        currentAmount: 0,
        fulfilledBy: [],
        perkBonus: perkBonuses[itemType] || '+200 🪙 Monedas al donador',
      },
      reactions: { '🎁': [] },
    };

    this.chatMessages[clanId].push(donationMsg);
    this.saveChat();
    localStorage.setItem(STORAGE_KEY_LAST_DONATION_REQ, now.toString());

    // Clan mates auto-contribute partially after a brief delay
    setTimeout(() => {
      const msgs = this.chatMessages[clanId] || [];
      const target = msgs.find((m) => m.id === donationMsg.id);
      if (target && target.donationData && target.donationData.currentAmount < target.donationData.requestedAmount) {
        target.donationData.currentAmount = Math.min(
          target.donationData.requestedAmount,
          target.donationData.currentAmount + Math.floor(target.donationData.requestedAmount * 0.5)
        );
        target.donationData.fulfilledBy.push('AstroNova_99');
        if (!target.reactions) target.reactions = {};
        target.reactions['🚀'] = ['AstroNova_99'];
        this.saveChat();
      }
    }, 4500);

    return { success: true, message: donationMsg };
  }

  public requestStardust(
    clanId: string,
    playerState: PlayerState
  ): { success: boolean; message?: ConstellationChatMessage; error?: string } {
    return this.requestDonation(clanId, 'stardust', 100, playerState);
  }

  public donateStardust(
    clanId: string,
    messageId: string,
    playerState: PlayerState
  ): { success: boolean; coinsRewarded: number; stardustReward: number; error?: string } {
    const messages = this.chatMessages[clanId] || [];
    const targetMsg = messages.find((m) => m.id === messageId);

    if (!targetMsg || !targetMsg.donationData) {
      return { success: false, coinsRewarded: 0, stardustReward: 0, error: 'Solicitud no encontrada.' };
    }

    const data = targetMsg.donationData;
    if (data.currentAmount >= data.requestedAmount) {
      return { success: false, coinsRewarded: 0, stardustReward: 0, error: 'Esta solicitud ya está completada.' };
    }

    if (data.fulfilledBy.includes('player_user')) {
      return { success: false, coinsRewarded: 0, stardustReward: 0, error: 'Ya has donado a esta solicitud.' };
    }

    // Add donation step
    const step = Math.max(1, Math.floor(data.requestedAmount / 4));
    data.currentAmount = Math.min(data.requestedAmount, data.currentAmount + step);
    data.fulfilledBy.push('player_user');
    
    // Add reaction
    if (!targetMsg.reactions) targetMsg.reactions = {};
    if (!targetMsg.reactions['❤️']) targetMsg.reactions['❤️'] = [];
    if (!targetMsg.reactions['❤️'].includes('player_user')) {
      targetMsg.reactions['❤️'].push('player_user');
    }

    this.saveChat();

    // Reward clan stardust & chest progress
    const clan = this.getConstellationById(clanId);
    if (clan) {
      clan.stardust += 80;
      clan.chestProgress += 150;
      this.saveClans();
    }

    return {
      success: true,
      coinsRewarded: 250,
      stardustReward: 80,
    };
  }

  public donateToClanTreasury(
    clanId: string,
    amountStardust: number,
    playerState: PlayerState
  ): { success: boolean; coinsRewarded: number; stardustGiven: number; error?: string } {
    const clan = this.getConstellationById(clanId);
    if (!clan) return { success: false, coinsRewarded: 0, stardustGiven: 0, error: 'Clan no encontrado.' };

    clan.stardust += amountStardust;
    clan.chestProgress += amountStardust * 2;

    if (!clan.activityLog) clan.activityLog = [];
    clan.activityLog.unshift({
      id: `act_${Date.now()}`,
      text: `${playerState.name} donó ${amountStardust} ✨ a la Bóveda del Clan.`,
      time: 'Ahora',
      icon: '🏛️',
    });

    this.saveClans();

    // Post to chat
    this.sendChatMessage(
      clanId,
      `🏛️ ¡${playerState.name} ha donado ${amountStardust} ✨ a la Bóveda del Clan para desbloquear mejoras y cofres!`,
      playerState,
      'system'
    );

    const coinsReward = amountStardust * 3;
    return {
      success: true,
      coinsRewarded: coinsReward,
      stardustGiven: amountStardust,
    };
  }

  private triggerOrganicClanResponse(clanId: string, userText: string, playerState: PlayerState) {
    const clan = this.getConstellationById(clanId);
    if (!clan || clan.members.length <= 1) return;

    const otherMembers = clan.members.filter((m) => m.id !== 'player_user' && m.status !== 'offline');
    if (otherMembers.length === 0) return;

    const randomMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let replyText = '¡Buen juego a todos! A seguir sumando puntos para el clan 🚀';

      if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hello')) {
        replyText = `¡Saludos ${playerState.name}! Listos para la guerra de clanes de hoy ⚔️`;
      } else if (lower.includes('cofre') || lower.includes('chest') || lower.includes('regalo')) {
        replyText = '¡Vamos por el Cofre de Nivel 10! Ya casi llegamos al siguiente hito 🎁✨';
      } else if (lower.includes('duelo') || lower.includes('1v1') || lower.includes('vs') || lower.includes('jugar')) {
        replyText = '¡Yo acepto tu desafío en cuanto termine esta ronda! 🔥';
      } else if (lower.includes('gracias') || lower.includes('thanks') || lower.includes('donar') || lower.includes('donen')) {
        replyText = '¡Siempre apoyando al clan! Un placer donar ✨🪙';
      } else if (lower.includes('gg') || lower.includes('record') || lower.includes('puntos')) {
        replyText = '¡Increíble puntuación! Estamos subiendo en el ranking de la división 🏆';
      }

      if (!this.chatMessages[clanId]) this.chatMessages[clanId] = [];

      this.chatMessages[clanId].push({
        id: `msg_rep_${Date.now()}`,
        senderId: randomMember.id,
        senderName: randomMember.name,
        senderAvatar: randomMember.avatar,
        senderRole: randomMember.role,
        text: replyText,
        timestamp: 'Ahora',
        type: 'text',
        reactions: { '👍': ['player_user'] },
      });

      this.saveChat();
    }, 2200);
  }

  public upgradeClanPerk(
    clanId: string,
    perkId: string
  ): { success: boolean; perk?: ConstellationPerk; error?: string } {
    const clan = this.getConstellationById(clanId);
    if (!clan) return { success: false, error: 'Constelación no encontrada.' };

    const perk = clan.perks.find((p) => p.id === perkId);
    if (!perk) return { success: false, error: 'Mejora no encontrada.' };

    if (perk.level >= perk.maxLevel) {
      return { success: false, error: 'Esta mejora ya está en su nivel máximo.' };
    }

    if (clan.stardust < perk.costStardust) {
      return { 
        success: false, 
        error: `Polvo Estelar insuficiente del Clan (${clan.stardust}/${perk.costStardust} ✨). ¡Jueguen partidas y donen para acumular más!` 
      };
    }

    clan.stardust -= perk.costStardust;
    perk.level += 1;
    perk.costStardust = Math.floor(perk.costStardust * 1.6);
    perk.unlocked = true;

    if (!clan.activityLog) clan.activityLog = [];
    clan.activityLog.unshift({
      id: `act_${Date.now()}`,
      text: `¡El clan mejoró "${perk.name}" a Nivel ${perk.level}!`,
      time: 'Ahora',
      icon: perk.icon,
    });

    this.saveClans();

    return { success: true, perk };
  }

  public contributeGamePoints(
    clanId: string,
    score: number,
    gameMode: string,
    playerState: PlayerState
  ): { stardustEarned: number; warPointsEarned: number; chestLevelUp: boolean } {
    const clan = this.getConstellationById(clanId);
    if (!clan) return { stardustEarned: 0, warPointsEarned: 0, chestLevelUp: false };

    // Calculate stardust & war points
    const stardustEarned = Math.max(5, Math.floor(score / 40));
    const warPointsEarned = Math.max(10, Math.floor(score / 25));

    clan.stardust += stardustEarned;
    clan.warTrophies += warPointsEarned;
    if (clan.warSeason) {
      clan.warSeason.clanWarScore += warPointsEarned;
    }

    clan.chestProgress += score;
    let chestLevelUp = false;

    if (clan.chestProgress >= clan.chestTarget && clan.chestLevel < 10) {
      clan.chestLevel += 1;
      clan.chestProgress = clan.chestProgress - clan.chestTarget;
      clan.chestTarget = Math.floor(clan.chestTarget * 1.5);
      chestLevelUp = true;

      if (!clan.activityLog) clan.activityLog = [];
      clan.activityLog.unshift({
        id: `act_${Date.now()}`,
        text: `¡El Cofre de Constelación subió a Nivel ${clan.chestLevel}! 🎉`,
        time: 'Ahora',
        icon: '🎁',
      });
    }

    // Update user member contribution
    const member = clan.members.find((m) => m.id === 'player_user');
    if (member) {
      member.weeklyContribution += warPointsEarned;
    }

    this.saveClans();

    return {
      stardustEarned,
      warPointsEarned,
      chestLevelUp,
    };
  }

  public claimClanChest(
    clanId: string
  ): { coins: number; stardust: number; xp: number } | null {
    const clan = this.getConstellationById(clanId);
    if (!clan || clan.chestLevel <= 0) return null;

    const baseReward = clan.chestLevel * 400;
    const coins = baseReward;
    const stardust = clan.chestLevel * 120;
    const xp = clan.chestLevel * 300;

    return { coins, stardust, xp };
  }
}

export const constellationService = new ConstellationService();
