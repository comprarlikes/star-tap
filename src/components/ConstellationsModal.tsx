import React, { useState, useEffect, useRef } from 'react';
import { 
  PlayerState, 
  ConstellationClan, 
  ConstellationMember, 
  ConstellationChatMessage,
  ConstellationPerk,
  GameMode
} from '../types';
import { 
  constellationService, 
  CONSTELLATION_CREATION_FEE 
} from '../services/constellationService';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { 
  X, 
  Shield, 
  Users, 
  Trophy, 
  Swords, 
  MessageSquare, 
  Sparkles, 
  PlusCircle, 
  Search, 
  Send, 
  Crown, 
  Gift, 
  Zap, 
  Check, 
  AlertCircle, 
  Flame, 
  Clock, 
  ArrowRight,
  LogOut,
  ChevronRight,
  RefreshCw,
  Compass,
  Smile,
  Heart,
  Coins,
  CheckCheck,
  Award,
  Layers,
  HelpCircle,
  Pin
} from 'lucide-react';

interface ConstellationsModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onUpdatePlayerState: (updater: (prev: PlayerState) => PlayerState) => void;
  onStartGame?: (mode?: GameMode) => void;
}

export const ConstellationsModal: React.FC<ConstellationsModalProps> = ({
  playerState,
  onClose,
  onUpdatePlayerState,
  onStartGame,
}) => {
  const isEn = playerState.language === 'en';
  const [activeTab, setActiveTab] = useState<'my_clan' | 'war' | 'chat' | 'explore'>('my_clan');
  const [clans, setClans] = useState<ConstellationClan[]>([]);
  const [currentClan, setCurrentClan] = useState<ConstellationClan | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ConstellationChatMessage[]>([]);
  const [inputChat, setInputChat] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [claimingChest, setClaimingChest] = useState<boolean>(false);

  // Chat & Donation advanced states
  const [chatFilter, setChatFilter] = useState<'all' | 'donations' | 'duels' | 'milestones'>('all');
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [selectedRequestType, setSelectedRequestType] = useState<'stardust' | 'energy' | 'shield' | 'coins'>('stardust');
  const [showDuelModal, setShowDuelModal] = useState<boolean>(false);
  const [duelMode, setDuelMode] = useState<GameMode>('blitz');
  const [duelWager, setDuelWager] = useState<number>(100);
  const [showStickerDrawer, setShowStickerDrawer] = useState<boolean>(false);
  const [showTreasuryModal, setShowTreasuryModal] = useState<boolean>(false);
  const [treasuryDonationAmount, setTreasuryDonationAmount] = useState<number>(100);

  // Form states for creating clan
  const [createName, setCreateName] = useState<string>('');
  const [createTag, setCreateTag] = useState<string>('');
  const [createDesc, setCreateDesc] = useState<string>('');
  const [createBadge, setCreateBadge] = useState<string>('👑');
  const [createBadgeColor, setCreateBadgeColor] = useState<string>('#fbbf24');
  const [createMinTrophies, setCreateMinTrophies] = useState<number>(0);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const BADGE_OPTIONS = ['👑', '🏹', '🦅', '🌌', '💥', '🕳️', '⚡', '🐉', '⚔️', '🛡️', '🌠', '🪐'];
  const COLOR_OPTIONS = ['#fbbf24', '#f97316', '#06b6d4', '#a855f7', '#eab308', '#ec4899', '#10b981', '#6366f1'];

  const EMOJI_REACTIONS = ['👍', '🔥', '🚀', '👑', '⚡', '💎', '❤️'];

  const COSMIC_STICKERS = [
    { id: 'hyperspace', emoji: '🚀', title: '¡A velocidad luz!' },
    { id: 'legendary', emoji: '👑', title: '¡Jugada Legendaria!' },
    { id: 'on_fire', emoji: '🔥', title: '¡En Racha Imparable!' },
    { id: 'shield_wall', emoji: '🛡️', title: '¡Muro Defensivo Activo!' },
    { id: 'supercharged', emoji: '⚡', title: '¡Energía al 100%!' },
    { id: 'galaxy_burst', emoji: '🌌', title: '¡Gloria a la Constelación!' },
    { id: 'stardust_rain', emoji: '✨', title: '¡Lluvia de Polvo Estelar!' },
    { id: 'ready_duel', emoji: '⚔️', title: '¡Desafío Aceptado!' },
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    const allClans = constellationService.getConstellations();
    setClans([...allClans]);
    const userClan = constellationService.getUserConstellation(playerState);
    setCurrentClan(userClan);

    if (userClan) {
      const messages = constellationService.getChatMessages(userClan.id);
      setChatMessages([...messages]);
    }
  };

  useEffect(() => {
    refreshData();
  }, [playerState.constellationId]);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // If user has no clan and is in 'my_clan', default to exploring or showing preview
  const handleJoinClan = (clanId: string) => {
    soundManager.playButtonClick();
    hapticManager.mediumTap();

    const res = constellationService.joinConstellation(clanId, playerState);
    if (!res.success) {
      showToast(res.error || 'Error al unirse');
      return;
    }

    onUpdatePlayerState((prev) => ({
      ...prev,
      constellationId: clanId,
      constellationRole: 'member',
    }));

    soundManager.playLevelUp();
    showToast(isEn ? `Welcome to ${res.clan?.name}!` : `¡Te has unido a ${res.clan?.name}! 🎉`);
    setActiveTab('my_clan');
    refreshData();
  };

  const handleLeaveClan = () => {
    if (!window.confirm(isEn ? 'Are you sure you want to leave this Constellation?' : '¿Seguro que deseas abandonar tu Constelación?')) {
      return;
    }

    soundManager.playButtonClick();
    const res = constellationService.leaveConstellation(playerState);
    if (res.success) {
      onUpdatePlayerState((prev) => ({
        ...prev,
        constellationId: null,
        constellationRole: undefined,
      }));
      showToast(isEn ? 'You left the constellation' : 'Has abandonado la Constelación');
      setActiveTab('explore');
      refreshData();
    }
  };

  const handleCreateClan = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerState.coins < CONSTELLATION_CREATION_FEE) {
      showToast(isEn ? 'Not enough coins!' : '¡Monedas insuficientes!');
      return;
    }

    soundManager.playCoin();
    const res = constellationService.createConstellation(
      {
        name: createName,
        tag: createTag || `#${createName.substring(0, 4).toUpperCase()}`,
        description: createDesc,
        badge: createBadge,
        badgeColor: createBadgeColor,
        minTrophies: createMinTrophies,
        type: 'open',
      },
      playerState
    );

    if (!res.success || !res.clan) {
      showToast(res.error || 'Error al crear la Constelación');
      return;
    }

    // Deduct fee and set user as leader
    onUpdatePlayerState((prev) => ({
      ...prev,
      coins: prev.coins - CONSTELLATION_CREATION_FEE,
      constellationId: res.clan?.id,
      constellationRole: 'leader',
    }));

    soundManager.playLevelUp();
    hapticManager.success();
    setShowCreateModal(false);
    showToast(isEn ? `Constellation ${res.clan.name} founded!` : `¡Constelación ${res.clan.name} fundada con éxito! 👑`);
    setActiveTab('my_clan');
    refreshData();
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputChat;
    if (!text.trim() || !currentClan) return;

    soundManager.playButtonClick();
    const res = constellationService.sendChatMessage(currentClan.id, text, playerState);
    if (res.success) {
      setInputChat('');
      refreshData();
    }
  };

  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (!currentClan) return;
    soundManager.playButtonClick();
    hapticManager.lightTap();
    const res = constellationService.toggleMessageReaction(currentClan.id, messageId, emoji, 'player_user');
    if (res.success) {
      refreshData();
    }
  };

  const handleSendSticker = (sticker: { id: string; emoji: string; title: string }) => {
    if (!currentClan) return;
    soundManager.playPowerup();
    hapticManager.mediumTap();
    const res = constellationService.sendStickerMessage(currentClan.id, sticker, playerState);
    if (res.success) {
      setShowStickerDrawer(false);
      refreshData();
    }
  };

  const handleSendDuelInvite = () => {
    if (!currentClan) return;
    if (playerState.coins < duelWager) {
      showToast(isEn ? 'Not enough coins for this wager!' : '¡No tienes suficientes monedas para esta apuesta!');
      return;
    }

    soundManager.playButtonClick();
    hapticManager.heavyTap();
    const res = constellationService.sendChallengeInvite(
      currentClan.id,
      { mode: duelMode, wager: duelWager },
      playerState
    );

    if (res.success) {
      setShowDuelModal(false);
      showToast(isEn ? '1v1 Challenge posted to clan chat! ⚔️' : '¡Desafío 1v1 publicado en el chat del clan! ⚔️');
      refreshData();
    }
  };

  const handleAcceptDuelInChat = (msg: ConstellationChatMessage) => {
    if (!msg.challengeData) return;
    soundManager.playLevelUp();
    hapticManager.heavyTap();
    showToast(isEn ? 'Entering Clan Duel Arena!' : '¡Entrando a la Arena de Duelo del Clan!');
    onClose();
    if (onStartGame) {
      onStartGame(msg.challengeData.mode);
    }
  };

  const handleRequestResource = () => {
    if (!currentClan) return;
    soundManager.playButtonClick();

    let amount = 100;
    if (selectedRequestType === 'stardust') amount = 100;
    if (selectedRequestType === 'energy') amount = 3;
    if (selectedRequestType === 'shield') amount = 1;
    if (selectedRequestType === 'coins') amount = 300;

    const res = constellationService.requestDonation(currentClan.id, selectedRequestType, amount, playerState);
    if (!res.success) {
      showToast(res.error || 'No puedes solicitar en este momento');
      return;
    }

    soundManager.playPowerup();
    hapticManager.success();
    setShowRequestModal(false);
    showToast(isEn ? 'Resource requested in clan chat!' : '¡Recursos solicitados en el chat del clan! 🎁');
    refreshData();
  };

  const handleDonate = (messageId: string) => {
    if (!currentClan) return;
    soundManager.playCoin();
    hapticManager.mediumTap();

    const res = constellationService.donateStardust(currentClan.id, messageId, playerState);
    if (!res.success) {
      showToast(res.error || 'Error al donar');
      return;
    }

    // Reward player with coins
    onUpdatePlayerState((prev) => ({
      ...prev,
      coins: prev.coins + res.coinsRewarded,
      constellationStardustDonated: (prev.constellationStardustDonated || 0) + res.stardustReward,
    }));

    showToast(isEn ? `+${res.coinsRewarded} Coins received for donating!` : `¡+${res.coinsRewarded} 🪙 Monedas recibidas por donar!`);
    refreshData();
  };

  const handleDonateAll = () => {
    if (!currentClan) return;
    const openDonations = chatMessages.filter(
      (m) =>
        m.type === 'donation_request' &&
        m.donationData &&
        !m.donationData.fulfilledBy.includes('player_user') &&
        m.donationData.currentAmount < m.donationData.requestedAmount
    );

    if (openDonations.length === 0) {
      showToast(isEn ? 'No pending donations to fulfill!' : '¡No hay solicitudes de donación pendientes!');
      return;
    }

    soundManager.playCoin();
    hapticManager.heavyTap();

    let totalCoins = 0;
    let totalStardust = 0;

    openDonations.forEach((msg) => {
      const res = constellationService.donateStardust(currentClan.id, msg.id, playerState);
      if (res.success) {
        totalCoins += res.coinsRewarded;
        totalStardust += res.stardustReward;
      }
    });

    if (totalCoins > 0) {
      onUpdatePlayerState((prev) => ({
        ...prev,
        coins: prev.coins + totalCoins,
        constellationStardustDonated: (prev.constellationStardustDonated || 0) + totalStardust,
      }));

      soundManager.playLevelUp();
      showToast(isEn ? `Donated to all! +${totalCoins} 🪙 Coins earned!` : `¡Donado a todos! +${totalCoins} 🪙 Monedas ganadas 🎉`);
      refreshData();
    }
  };

  const handleDonateToTreasury = () => {
    if (!currentClan) return;

    soundManager.playCoin();
    hapticManager.heavyTap();

    const res = constellationService.donateToClanTreasury(currentClan.id, treasuryDonationAmount, playerState);
    if (!res.success) {
      showToast(res.error || 'Error al donar a la bóveda');
      return;
    }

    onUpdatePlayerState((prev) => ({
      ...prev,
      coins: prev.coins + res.coinsRewarded,
      constellationStardustDonated: (prev.constellationStardustDonated || 0) + res.stardustGiven,
    }));

    soundManager.playLevelUp();
    setShowTreasuryModal(false);
    showToast(isEn ? `Treasury boosted! +${res.coinsRewarded} 🪙 Coins earned!` : `¡Bóveda mejorada! +${res.coinsRewarded} 🪙 Monedas recibidas 🎉`);
    refreshData();
  };

  const handleUpgradePerk = (perkId: string) => {
    if (!currentClan) return;
    soundManager.playButtonClick();
    const res = constellationService.upgradeClanPerk(currentClan.id, perkId);
    if (!res.success) {
      showToast(res.error || 'Error al mejorar');
      return;
    }

    soundManager.playLevelUp();
    hapticManager.success();
    showToast(isEn ? `Perk ${res.perk?.nameEn || res.perk?.name} upgraded!` : `¡Mejora ${res.perk?.name} desbloqueada! ✨`);
    refreshData();
  };

  const handleClaimChest = () => {
    if (!currentClan || currentClan.chestLevel <= 0) return;
    setClaimingChest(true);
    soundManager.playLevelUp();
    hapticManager.heavyTap();

    const rewards = constellationService.claimClanChest(currentClan.id);
    if (rewards) {
      setTimeout(() => {
        onUpdatePlayerState((prev) => ({
          ...prev,
          coins: prev.coins + rewards.coins,
          xp: prev.xp + rewards.xp,
        }));
        setClaimingChest(false);
        soundManager.playLevelUp();
        showToast(isEn ? `Claimed 🪙 ${rewards.coins} Coins & +${rewards.xp} XP!` : `¡Cofre abierto: +${rewards.coins} 🪙 Monedas y +${rewards.xp} XP! 🎁`);
      }, 700);
    }
  };

  const filteredClans = clans.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-2xl animate-fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900/95 border border-slate-700/80 rounded-[2.5rem] text-white shadow-2xl flex flex-col overflow-hidden relative max-h-[92vh]">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border border-amber-400/80 text-amber-300 px-4 py-2.5 rounded-2xl text-xs font-black shadow-2xl flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header HUD */}
        <div className="px-5 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl border border-purple-400/40 text-white shadow-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                <span>{isEn ? 'COSMIC CONSTELLATIONS' : 'GREMIOS & CONSTELACIONES'}</span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {currentClan ? currentClan.name : (isEn ? 'Join a Constellation' : 'Únete a una Constelación')}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between gap-1 sm:gap-2">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('my_clan');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'my_clan'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? 'My Clan' : 'Mi Clan'}</span>
            <span className="sm:hidden">{isEn ? 'Clan' : 'Clan'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('war');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'war'
                ? 'bg-gradient-to-r from-amber-500 to-red-600 text-slate-950 shadow-lg shadow-amber-900/30 font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{isEn ? 'Clan War' : 'Guerra'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('chat');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isEn ? 'Holo-Comms' : 'Chat & Donar'}</span>
            {currentClan && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse absolute top-1.5 right-1.5" />
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('explore');
            }}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isEn ? 'Explore' : 'Explorar'}</span>
          </button>
        </div>

        {/* Tab 1: My Constellation Overview */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'my_clan' && (
            <>
              {currentClan ? (
                <div className="space-y-4">
                  {/* Clan Banner Card */}
                  <div className={`p-4 rounded-3xl bg-gradient-to-br ${currentClan.bannerGradient} border border-purple-400/30 shadow-2xl relative overflow-hidden text-left`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-14 h-14 rounded-2xl bg-slate-950/80 border-2 flex items-center justify-center text-3xl shadow-xl"
                          style={{ borderColor: currentClan.badgeColor }}
                        >
                          {currentClan.badge}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-white">{currentClan.name}</h3>
                            <span className="text-[10px] bg-slate-950/80 px-2 py-0.5 rounded-md font-mono text-amber-400 font-bold border border-amber-400/30">
                              {currentClan.tag}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 mt-1 line-clamp-2">{currentClan.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold block">{isEn ? 'Level' : 'Nivel'}</span>
                        <span className="text-sm font-black text-amber-300">Lv. {currentClan.level}</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold block">{isEn ? 'Members' : 'Miembros'}</span>
                        <span className="text-sm font-black text-cyan-300">{currentClan.membersCount}/50</span>
                      </div>
                      <div className="bg-slate-950/60 p-2 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-400 font-bold block">{isEn ? 'War Trophies' : 'Copas Guerra'}</span>
                        <span className="text-sm font-black text-purple-300">🏆 {currentClan.warTrophies.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clan Weekly Chest */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                          <Gift className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                            {isEn ? 'WEEKLY CLAN CHEST' : 'COFRE SEMANAL DE CONSTELACIÓN'}
                          </span>
                          <h4 className="text-sm font-extrabold text-white">
                            {isEn ? `Tier ${currentClan.chestLevel} of 10` : `Nivel ${currentClan.chestLevel} de 10`}
                          </h4>
                        </div>
                      </div>

                      <button
                        disabled={claimingChest}
                        onClick={handleClaimChest}
                        className="py-2 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{claimingChest ? '...' : (isEn ? 'Claim Loot' : 'Reclamar Botín')}</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{isEn ? 'Stars & Points Progress:' : 'Progreso en Partidas:'}</span>
                        <span className="text-amber-400 font-bold">
                          {currentClan.chestProgress.toLocaleString()} / {currentClan.chestTarget.toLocaleString()} ⭐
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                          style={{ width: `${Math.min(100, (currentClan.chestProgress / currentClan.chestTarget) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">
                        {isEn ? 'Play Blitz, Endless, Campaign or Duels to level up the clan chest together!' : '¡Cada partida que juegues acumula puntos para subir el cofre de todo el clan!'}
                      </p>
                    </div>
                  </div>

                  {/* Constellation Tech Tree / Perks */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-black text-white">
                          {isEn ? 'Constellation Clan Perks' : 'Mejoras y Pasivas de Constelación'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono font-black text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-xl border border-cyan-500/30">
                        <span>✨</span>
                        <span>{currentClan.stardust} Stardust</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentClan.perks.map((perk) => (
                        <div 
                          key={perk.id}
                          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between gap-2 text-left"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="text-2xl p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                              {perk.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-black text-xs text-white truncate">
                                  {isEn ? perk.nameEn : perk.name}
                                </span>
                                <span className="text-[10px] font-mono text-amber-400 font-bold">
                                  Lv.{perk.level}/{perk.maxLevel}
                                </span>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                                {perk.statBonus}
                              </span>
                            </div>
                          </div>

                          <button
                            disabled={perk.level >= perk.maxLevel || currentClan.stardust < perk.costStardust}
                            onClick={() => handleUpgradePerk(perk.id)}
                            className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                              perk.level >= perk.maxLevel
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : currentClan.stardust >= perk.costStardust
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:brightness-110 shadow-md'
                                : 'bg-slate-800/80 text-slate-400 border border-slate-700 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            {perk.level >= perk.maxLevel ? (
                              <span>MAX</span>
                            ) : (
                              <span>{isEn ? `Upgrade ✨ ${perk.costStardust}` : `Mejorar ✨ ${perk.costStardust}`}</span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Members Roster */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-400" />
                        <h4 className="text-sm font-black text-white">
                          {isEn ? `Clan Members (${currentClan.members.length})` : `Miembros (${currentClan.members.length})`}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {currentClan.members.map((member) => (
                        <div 
                          key={member.id}
                          className="p-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-lg relative">
                              <span>{member.avatar}</span>
                              <span 
                                className={`w-2.5 h-2.5 rounded-full absolute -bottom-0.5 -right-0.5 border-2 border-slate-900 ${
                                  member.status === 'online' ? 'bg-emerald-400' : member.status === 'in_game' ? 'bg-amber-400' : 'bg-slate-500'
                                }`} 
                              />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black text-white">{member.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                                  member.role === 'leader' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                                  member.role === 'officer' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {member.role}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{member.customTitle || member.lastActive}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-mono font-black text-amber-400">🏆 {member.trophies}</span>
                            <span className="text-[9px] text-slate-500 block">+{member.weeklyContribution} esta semana</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Leave Clan Action */}
                  <div className="pt-2 flex justify-center">
                    <button
                      onClick={handleLeaveClan}
                      className="px-4 py-2 bg-slate-950/80 hover:bg-rose-950/50 text-rose-400 border border-rose-900/40 hover:border-rose-500 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Leave Constellation' : 'Abandonar Constelación'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* No clan yet - Welcoming Call to Action */
                <div className="p-6 text-center space-y-4 bg-slate-950/80 border border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-3xl shadow-xl">
                    🪐
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {isEn ? 'You are not in a Constellation yet!' : '¡Aún no perteneces a ninguna Constelación!'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                      {isEn
                        ? 'Join an active cosmic clan to unlock weekly chests, donate stardust, activate clan perks and fight in Galactic Clan Wars.'
                        : 'Únete a un gremio cósmico para desbloquear cofres semanales, donar polvo estelar, activar pasivas para todo el clan y luchar en las Guerras Galácticas.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setActiveTab('explore');
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-white font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <Search className="w-4 h-4" />
                      <span>{isEn ? 'Explore Public Clans' : 'Explorar Constelaciones'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playButtonClick();
                        setShowCreateModal(true);
                      }}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                    >
                      <PlusCircle className="w-4 h-4 fill-slate-950" />
                      <span>{isEn ? `Found Clan (🪙 ${CONSTELLATION_CREATION_FEE})` : `Fundar Clan (🪙 ${CONSTELLATION_CREATION_FEE})`}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 2: Clan War (Guerra Galáctica) */}
          {activeTab === 'war' && (
            <div className="space-y-4 text-left">
              {currentClan?.warSeason ? (
                <>
                  {/* War Matchup Banner */}
                  <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-red-950/90 border border-amber-500/40 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
                          {isEn ? currentClan.warSeason.divisionNameEn : currentClan.warSeason.divisionName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-300 font-mono bg-slate-950/70 px-2.5 py-1 rounded-xl border border-white/10">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentClan.warSeason.endsInHours}h restantes</span>
                      </div>
                    </div>

                    {/* Clashing Clans HUD */}
                    <div className="grid grid-cols-5 items-center gap-2 py-2">
                      <div className="col-span-2 flex flex-col items-center text-center p-2 rounded-2xl bg-slate-950/60 border border-cyan-500/30">
                        <span className="text-3xl mb-1">{currentClan.badge}</span>
                        <span className="text-xs font-black text-cyan-300 truncate w-full">{currentClan.name}</span>
                        <span className="text-sm font-mono font-black text-white mt-1">
                          {currentClan.warSeason.clanWarScore.toLocaleString()} pts
                        </span>
                      </div>

                      <div className="col-span-1 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-amber-400 drop-shadow">VS</span>
                        <span className="text-[10px] text-slate-400 font-bold">Ronda 12</span>
                      </div>

                      <div className="col-span-2 flex flex-col items-center text-center p-2 rounded-2xl bg-slate-950/60 border border-rose-500/30">
                        <span className="text-3xl mb-1">{currentClan.warSeason.opponentClanBadge}</span>
                        <span className="text-xs font-black text-rose-300 truncate w-full">
                          {currentClan.warSeason.opponentClanName}
                        </span>
                        <span className="text-sm font-mono font-black text-white mt-1">
                          {currentClan.warSeason.opponentClanScore.toLocaleString()} pts
                        </span>
                      </div>
                    </div>

                    {/* Enter Battle Quick Action */}
                    {onStartGame && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            onClose();
                            onStartGame();
                          }}
                          className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                          <Flame className="w-4 h-4 fill-slate-950" />
                          <span>{isEn ? 'PLAY TO EARN WAR POINTS' : 'JUGAR PARA SUMAR PUNTOS DE GUERRA'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Season Tier Rewards */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-3xl space-y-3">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>{isEn ? 'Division Victory Rewards' : 'Recompensas de Victoria por División'}</span>
                    </h4>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-amber-500/30 text-center">
                        <span className="text-lg">🪙</span>
                        <span className="text-xs font-black text-amber-300 block mt-1">
                          +{currentClan.warSeason.tierRewardCoins}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Monedas</span>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-cyan-500/30 text-center">
                        <span className="text-lg">✨</span>
                        <span className="text-xs font-black text-cyan-300 block mt-1">
                          +{currentClan.warSeason.tierRewardStardust}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Polvo Estelar</span>
                      </div>
                      <div className="bg-slate-900/90 p-2.5 rounded-2xl border border-purple-500/30 text-center">
                        <span className="text-lg">💎</span>
                        <span className="text-xs font-black text-purple-300 block mt-1">
                          +{currentClan.warSeason.tierRewardCrystals}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">Cristales</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center bg-slate-950/80 rounded-3xl border border-slate-800">
                  <Swords className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    {isEn ? 'Join a Constellation to participate in Galactic Clan Wars!' : '¡Únete a una Constelación para competir en la Guerra Galáctica!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Holo-Comms & Clan Hub */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[52vh] sm:h-[55vh] text-left">
              {currentClan ? (
                <>
                  {/* Top Clan Treasury & Quick Action Bar */}
                  <div className="pb-2.5 space-y-2">
                    {/* Treasury Snapshot HUD */}
                    <div className="p-2.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-slate-900 border border-purple-500/30 flex items-center justify-between gap-2 shadow-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-base shrink-0">
                          🏛️
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black text-white">{isEn ? 'Clan Vault' : 'Bóveda del Clan'}</span>
                            <span className="text-[10px] font-mono text-cyan-300 font-bold">✨ {currentClan.stardust}</span>
                          </div>
                          <span className="text-[9px] text-slate-400 block truncate">
                            {isEn ? `Cofre Lv.${currentClan.chestLevel} en progreso` : `Cofre Lv.${currentClan.chestLevel} en progreso`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            setShowTreasuryModal(true);
                          }}
                          className="py-1 px-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-[10px] rounded-xl shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>{isEn ? 'Boost Vault' : 'Donar Bóveda'}</span>
                        </button>
                        
                        <button
                          onClick={handleDonateAll}
                          className="py-1 px-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 font-black text-[10px] rounded-xl shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                        >
                          <Gift className="w-3 h-3 fill-slate-950" />
                          <span>{isEn ? 'Donate All' : 'Donar Todo'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Triggers & Category Filter Pills */}
                    <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-1">
                        {(['all', 'donations', 'duels', 'milestones'] as const).map((filter) => {
                          const labels = {
                            all: isEn ? 'All' : '💬 Todos',
                            donations: isEn ? 'Donations' : '🎁 Donaciones',
                            duels: isEn ? '1v1 Duels' : '⚔️ Duelos',
                            milestones: isEn ? 'Milestones' : '🏆 Hitos',
                          };
                          return (
                            <button
                              key={filter}
                              onClick={() => {
                                soundManager.playButtonClick();
                                setChatFilter(filter);
                              }}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                                chatFilter === filter
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                              }`}
                            >
                              {labels[filter]}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            setShowRequestModal(true);
                          }}
                          className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>{isEn ? 'Ask Resource' : 'Pedir Recurso'}</span>
                        </button>

                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            setShowDuelModal(true);
                          }}
                          className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <Swords className="w-3 h-3 text-amber-400" />
                          <span>{isEn ? 'Challenge 1v1' : 'Retar 1v1'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chat Message Stream */}
                  <div className="flex-1 overflow-y-auto space-y-2 p-2 bg-slate-950/90 rounded-2xl border border-slate-800">
                    {(() => {
                      const filtered = chatMessages.filter((m) => {
                        if (chatFilter === 'donations') return m.type === 'donation_request';
                        if (chatFilter === 'duels') return m.type === 'challenge_invite';
                        if (chatFilter === 'milestones') return m.type === 'system';
                        return true;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                            <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-1" />
                            <p>{isEn ? 'No messages in this filter.' : 'No hay mensajes en este filtro.'}</p>
                          </div>
                        );
                      }

                      return filtered.map((msg) => (
                        <div key={msg.id} className="space-y-1.5 group">
                          {/* System Notification Message */}
                          {msg.type === 'system' ? (
                            <div className="py-1.5 px-3 bg-indigo-950/50 border border-indigo-500/20 rounded-xl text-center text-[10px] text-indigo-300 font-bold flex items-center justify-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{msg.text}</span>
                            </div>
                          ) : msg.type === 'donation_request' && msg.donationData ? (
                            /* Donation Card */
                            <div className="p-3 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/40 rounded-2xl space-y-2 shadow-lg relative overflow-hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl p-1 bg-slate-950 rounded-xl border border-purple-500/30">{msg.senderAvatar}</span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-black text-amber-300">{msg.senderName}</span>
                                      <span className="text-[9px] bg-purple-500/20 text-purple-300 font-mono px-1.5 py-0.2 rounded border border-purple-500/30 uppercase">
                                        {msg.donationData.itemType}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-300 block">{msg.text}</span>
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                              </div>

                              {/* Progress Meter */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="text-slate-400">Progreso de donación:</span>
                                  <span className="text-cyan-400 font-bold">
                                    {msg.donationData.currentAmount} / {msg.donationData.requestedAmount} {
                                      msg.donationData.itemType === 'stardust' ? '✨' :
                                      msg.donationData.itemType === 'energy' ? '⚡' :
                                      msg.donationData.itemType === 'shield' ? '🛡️' : '🪙'
                                    }
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                  <div 
                                    className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (msg.donationData.currentAmount / msg.donationData.requestedAmount) * 100)}%` }}
                                  />
                                </div>
                              </div>

                              {/* Action Footer */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>{msg.donationData.perkBonus}</span>
                                </span>
                                
                                <button
                                  disabled={msg.donationData.fulfilledBy.includes('player_user') || msg.donationData.currentAmount >= msg.donationData.requestedAmount}
                                  onClick={() => handleDonate(msg.id)}
                                  className={`py-1.5 px-3 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                                    msg.donationData.fulfilledBy.includes('player_user')
                                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-md'
                                  }`}
                                >
                                  {msg.donationData.fulfilledBy.includes('player_user') ? (
                                    <span>{isEn ? 'Donated' : 'Donado'}</span>
                                  ) : (
                                    <>
                                      <span>🪙</span>
                                      <span>{isEn ? 'Donate (+150)' : 'Donar (+150 🪙)'}</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Reactions Row */}
                              <div className="flex items-center gap-1 pt-1 flex-wrap">
                                {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => {
                                  const userList = (users || []) as string[];
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleToggleReaction(msg.id, emoji)}
                                      className={`py-0.5 px-1.5 rounded-lg text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                        userList.includes('player_user')
                                          ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 font-bold'
                                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      <span>{emoji}</span>
                                      <span>{userList.length}</span>
                                    </button>
                                  );
                                })}
                                <div className="relative group/emoji inline-block">
                                  <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
                                    {EMOJI_REACTIONS.slice(0, 4).map((em) => (
                                      <button
                                        key={em}
                                        onClick={() => handleToggleReaction(msg.id, em)}
                                        className="hover:scale-125 transition-transform text-[11px] p-0.5 cursor-pointer"
                                      >
                                        {em}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : msg.type === 'challenge_invite' && msg.challengeData ? (
                            /* 1v1 Challenge Invite Card */
                            <div className="p-3 bg-gradient-to-r from-amber-950/80 via-slate-900 to-red-950/80 border border-amber-500/40 rounded-2xl space-y-2 shadow-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl p-1 bg-slate-950 rounded-xl border border-amber-500/40">⚔️</span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-black text-amber-300">{msg.senderName}</span>
                                      <span className="text-[9px] bg-red-500/20 text-rose-300 font-mono px-1.5 py-0.2 rounded border border-rose-500/30 uppercase font-black">
                                        DUELO 1V1 • {msg.challengeData.mode.toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-slate-300 block">{msg.text}</span>
                                  </div>
                                </div>
                                <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                              </div>

                              <div className="flex items-center justify-between bg-slate-950/70 p-2 rounded-xl border border-white/5">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-slate-400 font-bold">Bote acumulado:</span>
                                  <span className="text-amber-400 font-mono font-black">🪙 {msg.challengeData.wager * 2}</span>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                                  msg.challengeData.status === 'open' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {msg.challengeData.status === 'open' ? 'Abierto 🔥' : 'Completado'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => {
                                    const userList = (users || []) as string[];
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleToggleReaction(msg.id, emoji)}
                                        className={`py-0.5 px-1.5 rounded-lg text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                          userList.includes('player_user')
                                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 font-bold'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                        <span>{userList.length}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {msg.challengeData.status === 'open' && (
                                  <button
                                    onClick={() => handleAcceptDuelInChat(msg)}
                                    className="py-1.5 px-3 bg-gradient-to-r from-red-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Swords className="w-3.5 h-3.5" />
                                    <span>{isEn ? 'Accept Duel' : '¡Aceptar Duelo!'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : msg.type === 'sticker' && msg.sticker ? (
                            /* Cosmic Sticker Message */
                            <div className="p-3 bg-slate-900/90 rounded-2xl border border-indigo-500/30 flex items-start gap-3 shadow-md">
                              <span className="text-xl p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                                {msg.senderAvatar}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-black text-white truncate">{msg.senderName}</span>
                                  <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                                </div>
                                <div className="mt-2 p-3 bg-indigo-950/40 rounded-2xl border border-indigo-500/20 flex items-center gap-3">
                                  <span className="text-4xl filter drop-shadow animate-pulse">{msg.sticker.emoji}</span>
                                  <div>
                                    <span className="text-xs font-black text-indigo-300 block">{msg.sticker.title}</span>
                                    <span className="text-[10px] text-slate-400">Holograma de Constelación</span>
                                  </div>
                                </div>

                                {/* Reactions Row */}
                                <div className="flex items-center gap-1 pt-2 flex-wrap">
                                  {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => {
                                    const userList = (users || []) as string[];
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleToggleReaction(msg.id, emoji)}
                                        className={`py-0.5 px-1.5 rounded-lg text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                          userList.includes('player_user')
                                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 font-bold'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                        <span>{userList.length}</span>
                                      </button>
                                    );
                                  })}
                                  <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
                                    {EMOJI_REACTIONS.slice(0, 3).map((em) => (
                                      <button
                                        key={em}
                                        onClick={() => handleToggleReaction(msg.id, em)}
                                        className="hover:scale-125 transition-transform text-[11px] p-0.5 cursor-pointer"
                                      >
                                        {em}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Standard Message */
                            <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-start gap-2.5">
                              <span className="text-xl p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                                {msg.senderAvatar}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-xs font-black text-white truncate">{msg.senderName}</span>
                                  <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                                </div>
                                <p className="text-xs text-slate-200 mt-0.5 break-words font-medium">{msg.text}</p>
                                
                                {/* Reactions Row */}
                                <div className="flex items-center gap-1 pt-1.5 flex-wrap">
                                  {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => {
                                    const userList = (users || []) as string[];
                                    return (
                                      <button
                                        key={emoji}
                                        onClick={() => handleToggleReaction(msg.id, emoji)}
                                        className={`py-0.5 px-1.5 rounded-lg text-[10px] flex items-center gap-1 border transition-all cursor-pointer ${
                                          userList.includes('player_user')
                                            ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 font-bold'
                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                      >
                                        <span>{emoji}</span>
                                        <span>{userList.length}</span>
                                      </button>
                                    );
                                  })}
                                  <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
                                    {EMOJI_REACTIONS.slice(0, 3).map((em) => (
                                      <button
                                        key={em}
                                        onClick={() => handleToggleReaction(msg.id, em)}
                                        className="hover:scale-125 transition-transform text-[11px] p-0.5 cursor-pointer"
                                      >
                                        {em}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Cosmic Stickers Drawer */}
                  {showStickerDrawer && (
                    <div className="p-2.5 bg-slate-900 border border-indigo-500/30 rounded-2xl grid grid-cols-4 gap-2 animate-fade-in my-1">
                      {COSMIC_STICKERS.map((stk) => (
                        <button
                          key={stk.id}
                          onClick={() => handleSendSticker(stk)}
                          className="p-2 rounded-xl bg-slate-950 hover:bg-indigo-950/50 border border-slate-800 hover:border-indigo-500/50 flex flex-col items-center text-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="text-2xl">{stk.emoji}</span>
                          <span className="text-[9px] text-slate-300 font-bold line-clamp-1">{stk.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Preset Quick Chips */}
                  <div className="py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {['¡A por el cofre! 🎁', '¡GG equipo! 🚀', '¡Buen duelo! ⚔️', '¡Gracias por donar! ✨', '¡Muro defensivo! 🛡️'].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handleSendMessage(preset)}
                        className="py-1 px-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold shrink-0 border border-slate-700 active:scale-95 transition-all cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Box */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2 pt-1"
                  >
                    <button
                      type="button"
                      onClick={() => setShowStickerDrawer(!showStickerDrawer)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                        showStickerDrawer ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Stickers Cósmicos"
                    >
                      <Smile className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={inputChat}
                      onChange={(e) => setInputChat(e.target.value)}
                      placeholder={isEn ? 'Type clan message...' : 'Escribe un mensaje al clan...'}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputChat.trim()}
                      className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl transition-all cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  {isEn ? 'Join a Constellation to use Holo-Comms & exchange Stardust!' : '¡Únete a una Constelación para acceder al chat y donaciones!'}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Explore & Public Clans Directory */}
          {activeTab === 'explore' && (
            <div className="space-y-3 text-left">
              {/* Search and Action Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isEn ? 'Search Constellation name or tag...' : 'Buscar por nombre o tag (#ORION)...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  onClick={() => {
                    soundManager.playButtonClick();
                    setShowCreateModal(true);
                  }}
                  className="py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 fill-slate-950" />
                  <span>{isEn ? 'Found Clan' : 'Fundar'}</span>
                </button>
              </div>

              {/* Clan Cards List */}
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredClans.map((clan) => {
                  const isUserInThisClan = playerState.constellationId === clan.id;
                  const canJoin = (playerState.trophies || 0) >= clan.minTrophies && clan.membersCount < clan.maxMembers;

                  return (
                    <div 
                      key={clan.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left ${
                        isUserInThisClan 
                          ? 'bg-purple-950/60 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div 
                          className="w-12 h-12 rounded-2xl bg-slate-900 border-2 flex items-center justify-center text-2xl shadow-md shrink-0"
                          style={{ borderColor: clan.badgeColor }}
                        >
                          {clan.badge}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-white truncate">{clan.name}</span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-amber-400/20">
                              {clan.tag}
                            </span>
                            <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                              Lv.{clan.level}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{clan.description}</p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                            <span>👥 {clan.membersCount}/{clan.maxMembers}</span>
                            <span>🏆 Req: {clan.minTrophies}</span>
                            <span className="text-amber-400">War: {clan.warTrophies}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isUserInThisClan ? (
                          <div className="py-1.5 px-3 bg-purple-600/30 border border-purple-400/50 text-purple-300 font-black text-xs rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>{isEn ? 'MEMBER' : 'TU CLAN'}</span>
                          </div>
                        ) : (
                          <button
                            disabled={!canJoin}
                            onClick={() => handleJoinClan(clan.id)}
                            className={`py-2 px-3.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 cursor-pointer ${
                              canJoin
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110 shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 opacity-60 cursor-not-allowed'
                            }`}
                          >
                            <span>{isEn ? 'JOIN' : 'UNIRSE'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal for Founding / Creating New Constellation */}
        {showCreateModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-left">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2.5rem] p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    {isEn ? 'Found New Constellation' : 'Fundar Nueva Constelación'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClan} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isEn ? 'Constellation Name:' : 'Nombre de la Constelación:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Ej. Titanes de Orión"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Tag (#):
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={createTag}
                      onChange={(e) => setCreateTag(e.target.value)}
                      placeholder="#ORION"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      {isEn ? 'Min Trophies 🏆:' : 'Copas Mínimas 🏆:'}
                    </label>
                    <input
                      type="number"
                      value={createMinTrophies}
                      onChange={(e) => setCreateMinTrophies(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isEn ? 'Choose Crest & Emblem:' : 'Emblema e Insignia:'}
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {BADGE_OPTIONS.map((badge) => (
                      <button
                        type="button"
                        key={badge}
                        onClick={() => setCreateBadge(badge)}
                        className={`text-xl p-2 rounded-xl border transition-all cursor-pointer ${
                          createBadge === badge ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-lg' : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isEn ? 'Crest Theme Color:' : 'Color del Emblema:'}
                  </label>
                  <div className="flex items-center gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setCreateBadgeColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          createBadgeColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isEn ? 'Clan Bio / Description:' : 'Descripción del Clan:'}
                  </label>
                  <textarea
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    rows={2}
                    placeholder="Buscamos pilotos activos para dominar la Guerra Galáctica."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={playerState.coins < CONSTELLATION_CREATION_FEE}
                    className={`w-full py-3 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                      playerState.coins >= CONSTELLATION_CREATION_FEE
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Crown className="w-4 h-4 fill-slate-950" />
                    <span>
                      {isEn ? `FUND CONSTELLATION (🪙 ${CONSTELLATION_CREATION_FEE})` : `FUNDAR CONSTELACIÓN (🪙 ${CONSTELLATION_CREATION_FEE})`}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Request Resources (Donation Request Picker) */}
        {showRequestModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-left">
            <div className="w-full max-w-sm bg-slate-900 border border-purple-500/40 rounded-[2.5rem] p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-black text-white">
                    {isEn ? 'Request Resources' : 'Solicitar Recursos al Clan'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                {isEn ? 'Choose what you need. Clan members who donate will earn coin bounties!' : 'Elige qué recurso necesitas. ¡Tus compañeros recibirán monedas al donarte!'}
              </p>

              <div className="space-y-2">
                {[
                  {
                    type: 'stardust' as const,
                    icon: '✨',
                    name: isEn ? '100 Stardust' : '100 Polvo Estelar',
                    desc: isEn ? 'For clan chest and perk upgrades' : 'Para subir de nivel el cofre y mejoras',
                    color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300',
                  },
                  {
                    type: 'energy' as const,
                    icon: '⚡',
                    name: isEn ? '3 Cosmic Energy' : '3 Baterías de Energía',
                    desc: isEn ? 'Play matches without cooldown' : 'Juega partidas sin esperar recarga',
                    color: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
                  },
                  {
                    type: 'shield' as const,
                    icon: '🛡️',
                    name: isEn ? '1 Stellar Shield' : '1 Baliza de Escudo Estelar',
                    desc: isEn ? 'Protect trophies from loss in War' : 'Protege tus copas en la Guerra Galáctica',
                    color: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
                  },
                  {
                    type: 'coins' as const,
                    icon: '🪙',
                    name: isEn ? '300 Gold Coins' : '300 Monedas de Oro',
                    desc: isEn ? 'Buy skins, upgrades and ships' : 'Para desbloquear naves y skins',
                    color: 'border-yellow-500/50 bg-yellow-950/30 text-yellow-300',
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setSelectedRequestType(item.type)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      selectedRequestType === item.type
                        ? 'border-purple-400 bg-purple-950/60 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">{item.icon}</span>
                      <div>
                        <span className="text-xs font-black text-white block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.desc}</span>
                      </div>
                    </div>
                    {selectedRequestType === item.type && (
                      <Check className="w-4 h-4 text-purple-400 stroke-[3] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRequestResource}
                className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-xs rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isEn ? 'POST REQUEST IN CHAT' : 'PUBLICAR EN EL CHAT'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal: 1v1 Clan Duel Challenge Creator */}
        {showDuelModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-left">
            <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-[2.5rem] p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Swords className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    {isEn ? '1v1 Clan Challenge' : 'Desafío 1v1 del Clan'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDuelModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isEn ? 'Game Mode:' : 'Modalidad de Duelo:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'blitz' as GameMode, label: 'Blitz ⚡', desc: '60s rápido' },
                      { id: 'classic' as GameMode, label: 'Clásico 🎯', desc: 'Score máximo' },
                      { id: 'zen' as GameMode, label: 'Zen 🌌', desc: 'Sin vidas' },
                      { id: 'hardcore' as GameMode, label: 'Hardcore 💀', desc: '1 sola vida' },
                    ].map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setDuelMode(m.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          duelMode === m.id
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-black block">{m.label}</span>
                        <span className="text-[9px] text-slate-500">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    {isEn ? 'Coin Wager (Bet):' : 'Apuesta de Monedas (Por Jugador):'}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[50, 100, 250, 500].map((w) => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setDuelWager(w)}
                        className={`py-2 px-1 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                          duelWager === w
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105 shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        🪙 {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pot summary */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/20 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-bold">Bote del Ganador:</span>
                  <span className="text-sm font-mono font-black text-amber-400">🪙 {duelWager * 2}</span>
                </div>

                <button
                  type="button"
                  onClick={handleSendDuelInvite}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4 fill-slate-950" />
                  <span>{isEn ? 'POST CHALLENGE' : 'PUBLICAR DESAFÍO EN EL CHAT'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Clan Treasury Direct Contribution */}
        {showTreasuryModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-left">
            <div className="w-full max-w-sm bg-slate-900 border border-purple-500/40 rounded-[2.5rem] p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <h3 className="text-base font-black text-white">
                    {isEn ? 'Boost Clan Vault' : 'Donar a la Bóveda del Clan'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowTreasuryModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                {isEn 
                  ? 'Contribute Stardust to accelerate clan perk unlocks and clan chest leveling. You will receive coin and XP rewards immediately!' 
                  : 'Aporta Polvo Estelar para acelerar las mejoras colectivas y el cofre del clan. ¡Recibirás recompensas de monedas instantáneas!'}
              </p>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 block">
                  {isEn ? 'Contribution Amount (✨):' : 'Cantidad a Donar (✨ Polvo):'}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[50, 100, 250, 500].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setTreasuryDonationAmount(amt)}
                      className={`py-2 px-1 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                        treasuryDonationAmount === amt
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300 scale-105 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      ✨ {amt}
                    </button>
                  ))}
                </div>

                {/* Reward preview box */}
                <div className="p-3 bg-slate-950 rounded-2xl border border-purple-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">Recompensa instantánea:</span>
                    <span className="text-amber-400 font-mono font-black">+{treasuryDonationAmount * 2} 🪙</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">XP de Contribuidor:</span>
                    <span className="text-cyan-400 font-mono font-bold">+{Math.floor(treasuryDonationAmount / 2)} XP</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDonateToTreasury}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-xs rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isEn ? 'DONATE TO VAULT' : 'DONAR A LA BÓVEDA'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
