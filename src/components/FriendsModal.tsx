import React, { useState } from 'react';
import { Friend, DirectChallenge, PlayerState, LeaderboardEntry, GameMode } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { getAvatarById } from '../data/avatars';
import { AnimatedAvatar } from './AnimatedAvatar';
import { getMyPlayerCode, addFriendByIdOrName, createDirectChallenge } from '../services/friends';
import { t } from '../i18n';
import {
  Users,
  UserPlus,
  Swords,
  X,
  Copy,
  Check,
  Search,
  Star,
  Trophy,
  Flame,
  Award,
  Zap,
  Trash2,
  Share2,
  Clock,
  Sparkles,
  ArrowUpDown,
  Send,
  AlertCircle,
  BarChart3,
  Shield,
  CircleDot
} from 'lucide-react';

interface FriendsModalProps {
  playerState: PlayerState;
  friends: Friend[];
  directChallenges: DirectChallenge[];
  leaderboard: LeaderboardEntry[];
  userId?: string | null;
  onClose: () => void;
  onUpdateFriends: (friends: Friend[]) => void;
  onUpdateChallenges: (challenges: DirectChallenge[]) => void;
  onStartDirectMatch: (friend: Friend, mode: GameMode, targetScore?: number) => void;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  playerState,
  friends,
  directChallenges,
  leaderboard,
  userId,
  onClose,
  onUpdateFriends,
  onUpdateChallenges,
  onStartDirectMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'challenges'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [idInput, setIdInput] = useState('');
  const [addFeedback, setAddFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'level' | 'trophies' | 'status'>('score');

  // Direct challenge modal dialog state
  const [challengingFriend, setChallengingFriend] = useState<Friend | null>(null);
  const [selectedChallengeMode, setSelectedChallengeMode] = useState<GameMode>('blitz');
  const [customTargetScore, setCustomTargetScore] = useState<number>(0);
  const [wagerCoins, setWagerCoins] = useState<number>(50);

  // Compare stats dialog state
  const [comparingFriend, setComparingFriend] = useState<Friend | null>(null);

  const lang = playerState.language || 'es';
  const myPlayerCode = getMyPlayerCode(userId);
  const myAvatar = getAvatarById(playerState.avatar);

  // Online count
  const onlineCount = friends.filter((f) => f.status === 'online' || f.status === 'in_game').length;
  const pendingChallengesCount = directChallenges.filter((c) => c.status === 'pending').length;

  // Handle copy friend code
  const handleCopyCode = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    navigator.clipboard?.writeText(myPlayerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Handle share code
  const handleShareCode = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    const shareText = `¡Agrégame como amigo en Star Tap Arcade! Mi ID de Piloto es: ${myPlayerCode}. ¿Te atreves a superar mi récord de ${playerState.stats.highestScore.toLocaleString()} pts? ⭐🎮`;
    if (navigator.share) {
      navigator.share({
        title: 'Star Tap Arcade - Mi ID de Amigo',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(shareText);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Handle add friend submit
  const handleAddFriend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundManager.playButtonClick();
    hapticManager.mediumTap();

    const result = addFriendByIdOrName(idInput, friends, leaderboard, myPlayerCode);
    setAddFeedback({ success: result.success, message: result.message });

    if (result.success && result.updatedFriends) {
      onUpdateFriends(result.updatedFriends);
      setIdInput('');
    }
  };

  // Handle quick add from recommendations
  const handleQuickAdd = (targetId: string) => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    const result = addFriendByIdOrName(targetId, friends, leaderboard, myPlayerCode);
    setAddFeedback({ success: result.success, message: result.message });
    if (result.success && result.updatedFriends) {
      onUpdateFriends(result.updatedFriends);
    }
  };

  // Toggle favorite friend
  const handleToggleFavorite = (friendId: string) => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    const updated = friends.map((f) => (f.id === friendId ? { ...f, isFavorite: !f.isFavorite } : f));
    onUpdateFriends(updated);
  };

  // Remove friend
  const handleRemoveFriend = (friendId: string, friendName: string) => {
    soundManager.playButtonClick();
    hapticManager.heavyTap();
    if (confirm(lang === 'es' ? `¿Eliminar a "${friendName}" de tus amigos?` : `Remove "${friendName}" from friends?`)) {
      const updated = friends.filter((f) => f.id !== friendId);
      onUpdateFriends(updated);
    }
  };

  // Open direct challenge dialog
  const handleOpenChallengeDialog = (friend: Friend) => {
    soundManager.playButtonClick();
    hapticManager.mediumTap();
    setChallengingFriend(friend);
    setCustomTargetScore(Math.max(friend.highScore, playerState.stats.highestScore || 5000));
  };

  // Launch direct challenge match or create record
  const handleLaunchChallenge = (startMatchImmediately: boolean) => {
    if (!challengingFriend) return;
    soundManager.playButtonClick();
    hapticManager.heavyTap();

    const newChallenge = createDirectChallenge(
      challengingFriend,
      myPlayerCode,
      playerState.name,
      playerState.avatar || 'astro_commander',
      customTargetScore,
      selectedChallengeMode,
      wagerCoins
    );

    onUpdateChallenges([newChallenge, ...directChallenges]);

    const targetFriend = challengingFriend;
    setChallengingFriend(null);

    if (startMatchImmediately) {
      onClose();
      onStartDirectMatch(targetFriend, selectedChallengeMode, customTargetScore);
    } else {
      setAddFeedback({
        success: true,
        message: lang === 'es' 
          ? `¡Desafío enviado a ${targetFriend.name}! Objetivo: ${customTargetScore.toLocaleString()} pts`
          : `Challenge sent to ${targetFriend.name}! Target: ${customTargetScore.toLocaleString()} pts`,
      });
      setActiveTab('challenges');
    }
  };

  // Accept/Play received challenge
  const handlePlayChallenge = (challenge: DirectChallenge) => {
    soundManager.playButtonClick();
    hapticManager.heavyTap();

    // Mark challenge accepted
    const updatedChallenges = directChallenges.map((c) =>
      c.id === challenge.id ? { ...c, status: 'accepted' as const } : c
    );
    onUpdateChallenges(updatedChallenges);

    const rivalFriend: Friend = {
      id: challenge.fromId,
      name: challenge.fromName,
      avatar: challenge.fromAvatar,
      level: 10,
      trophies: 2000,
      highScore: challenge.targetScore,
      status: 'online',
      lastActive: 'En línea',
      addedAt: '2026-08-14',
    };

    onClose();
    onStartDirectMatch(rivalFriend, challenge.mode, challenge.targetScore);
  };

  // Filter and sort friends list
  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    if (sortBy === 'score') return b.highScore - a.highScore;
    if (sortBy === 'level') return b.level - a.level;
    if (sortBy === 'trophies') return b.trophies - a.trophies;
    if (sortBy === 'status') {
      const order = { online: 0, in_game: 1, offline: 2 };
      return order[a.status] - order[b.status];
    }
    return 0;
  });

  // Recommended suggested players from leaderboard
  const suggestedPlayers = leaderboard
    .filter((entry) => !entry.isUser && !friends.some((f) => f.name === entry.name))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg h-[90vh] max-h-[800px] bg-slate-900/95 border border-purple-500/30 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden relative">
        {/* Header Bento Tile */}
        <div className="px-5 py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl shadow-lg border border-pink-400/40">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  {lang === 'es' ? 'LISTA DE AMIGOS' : 'FRIENDS LIST'}
                </h3>
                <span className="bg-purple-950/90 text-purple-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-purple-500/30">
                  {friends.length} {lang === 'es' ? 'amigos' : 'friends'}
                </span>
              </div>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                {onlineCount} {lang === 'es' ? 'conectados ahora' : 'online now'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* My Player ID & Share Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${myAvatar.gradient} border ${myAvatar.borderColor} flex items-center justify-center text-sm shrink-0 shadow`}>
              <span>{myAvatar.emoji}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {lang === 'es' ? 'Mi ID de Jugador' : 'My Player ID'}
              </span>
              <span className="text-xs font-mono font-black text-amber-300 tracking-wider truncate select-all">
                {myPlayerCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shadow cursor-pointer"
              title="Copiar ID"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copiedCode ? (lang === 'es' ? '¡Copiado!' : 'Copied!') : (lang === 'es' ? 'Copiar ID' : 'Copy ID')}</span>
            </button>

            <button
              onClick={handleShareCode}
              className="p-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 rounded-xl transition-all active:scale-95 cursor-pointer"
              title="Compartir Código"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('list');
            }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Mis Amigos' : 'My Friends'}</span>
            <span className="text-[10px] opacity-80">({friends.length})</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('add');
            }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md font-black'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Añadir por ID' : 'Add by ID'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              setActiveTab('challenges');
            }}
            className={`py-2 px-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 relative ${
              activeTab === 'challenges'
                ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Desafíos' : 'Challenges'}</span>
            {pendingChallengesCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping absolute top-1.5 right-1.5" />
            )}
          </button>
        </div>

        {/* Tab 1: Mis Amigos */}
        {activeTab === 'list' && (
          <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3 overflow-hidden text-left">
            {/* Search and Sort Toolbar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder={lang === 'es' ? 'Buscar amigo o ID...' : 'Search friend or ID...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-400 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="score" className="bg-slate-900 text-white">
                    ⭐ {lang === 'es' ? 'Puntuación' : 'High Score'}
                  </option>
                  <option value="trophies" className="bg-slate-900 text-white">
                    🏆 {lang === 'es' ? 'Trofeos' : 'Trophies'}
                  </option>
                  <option value="level" className="bg-slate-900 text-white">
                    🚀 {lang === 'es' ? 'Nivel' : 'Level'}
                  </option>
                  <option value="status" className="bg-slate-900 text-white">
                    🟢 {lang === 'es' ? 'Estado' : 'Status'}
                  </option>
                </select>
              </div>
            </div>

            {/* Friends Cards Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {sortedFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-6 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-600" />
                  <p className="text-sm font-bold text-slate-300">
                    {searchQuery ? (lang === 'es' ? 'No se encontraron amigos con esa búsqueda' : 'No friends found') : (lang === 'es' ? 'Aún no tienes amigos agregados' : 'No friends added yet')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {lang === 'es' ? 'Agrega a otros pilotos con su ID de usuario en la pestaña Añadir.' : 'Add pilots using their User ID in the Add tab.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="mt-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer active:scale-95"
                  >
                    ➕ {lang === 'es' ? 'Añadir Amigos Ahora' : 'Add Friends Now'}
                  </button>
                </div>
              ) : (
                sortedFriends.map((friend) => {
                  const avatarData = getAvatarById(friend.avatar);
                  const isOnline = friend.status === 'online';
                  const isInGame = friend.status === 'in_game';

                  return (
                    <div
                      key={friend.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        friend.isFavorite
                          ? 'bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-900/90 border-purple-500/40 shadow-md'
                          : 'bg-slate-950/70 hover:bg-slate-950/90 border-slate-800'
                      }`}
                    >
                      {/* Left: Avatar & Identity */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <AnimatedAvatar avatarItem={avatarData} size="md" showBadge={false} />
                          {/* Online status indicator badge */}
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 z-20 ${
                              isOnline ? 'bg-emerald-400' : isInGame ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
                            }`}
                            title={isOnline ? 'En línea' : isInGame ? 'En partida' : 'Desconectado'}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-white truncate">{friend.name}</span>
                            {friend.flag && <span className="text-xs">{friend.flag}</span>}
                            {friend.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-950/70 px-1.5 py-0.2 rounded border border-purple-500/30">
                              {friend.id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Lvl {friend.level}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                isOnline ? 'text-emerald-400' : isInGame ? 'text-amber-400' : 'text-slate-500'
                              }`}
                            >
                              • {isOnline ? (lang === 'es' ? 'En línea' : 'Online') : isInGame ? (lang === 'es' ? 'En Partida' : 'In Game') : friend.lastActive}
                            </span>
                          </div>

                          {/* Scores & Trophies Row */}
                          <div className="flex items-center gap-3 mt-1.5 text-xs">
                            <div className="flex items-center gap-1 text-amber-300 font-extrabold" title="Puntuación Más Alta">
                              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                              <span>{friend.highScore.toLocaleString()} pts</span>
                            </div>
                            <div className="flex items-center gap-1 text-cyan-300 font-bold" title="Trofeos">
                              <Trophy className="w-3.5 h-3.5 text-cyan-300" />
                              <span>{friend.trophies}</span>
                            </div>
                            {typeof friend.winStreak === 'number' && friend.winStreak > 0 && (
                              <div className="flex items-center gap-0.5 text-rose-400 font-bold" title="Racha de victorias">
                                <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                                <span>{friend.winStreak}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Compare Stats Button */}
                        <button
                          onClick={() => {
                            soundManager.playButtonClick();
                            setComparingFriend(friend);
                          }}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-xl border border-slate-700/80 transition-all active:scale-95 cursor-pointer"
                          title="Comparar Estadísticas"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>

                        {/* Favorite Button */}
                        <button
                          onClick={() => handleToggleFavorite(friend.id)}
                          className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                            friend.isFavorite
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-900 text-slate-400 hover:text-white border-slate-700/80'
                          }`}
                          title="Marcar como favorito"
                        >
                          <Star className={`w-4 h-4 ${friend.isFavorite ? 'fill-amber-400' : ''}`} />
                        </button>

                        {/* Direct Challenge Button */}
                        <button
                          onClick={() => handleOpenChallengeDialog(friend)}
                          className="px-3 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-lg border border-pink-400/40 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Swords className="w-3.5 h-3.5 text-yellow-300" />
                          <span>{lang === 'es' ? 'DESAFIAR' : 'CHALLENGE'}</span>
                        </button>

                        {/* Delete Friend */}
                        <button
                          onClick={() => handleRemoveFriend(friend.id, friend.name)}
                          className="p-2 bg-slate-900 hover:bg-red-950/60 text-slate-500 hover:text-red-400 rounded-xl border border-slate-800 transition-all active:scale-95 cursor-pointer"
                          title="Eliminar amigo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Añadir Amigo por ID */}
        {activeTab === 'add' && (
          <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto text-left">
            {/* Input Form Bento Card */}
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    {lang === 'es' ? 'BUSCAR POR ID DE USUARIO' : 'SEARCH BY USER ID'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === 'es' ? 'Ingresa el código de jugador (ej: STAR-NOVA99) o nombre de tu amigo.' : 'Enter player code (e.g. STAR-NOVA99) or username.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddFriend} className="flex gap-2">
                <input
                  type="text"
                  placeholder={lang === 'es' ? 'Ej: STAR-NOVA99 o Nombre...' : 'E.g. STAR-NOVA99 or Name...'}
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'AÑADIR' : 'ADD'}</span>
                </button>
              </form>

              {addFeedback && (
                <div
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    addFeedback.success
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {addFeedback.success ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span>{addFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Suggested Pilots / Community Rivals */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  {lang === 'es' ? 'PILOTOS RECOMENDADOS' : 'RECOMMENDED PILOTS'}
                </span>
                <span className="text-[10px] text-slate-400">{suggestedPlayers.length} {lang === 'es' ? 'disponibles' : 'available'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedPlayers.map((pilot) => {
                  const pilotCode = `STAR-${pilot.id.substring(0, 6).toUpperCase()}`;
                  return (
                    <div
                      key={pilot.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shadow">
                          <span>{pilot.avatar || '⭐'}</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-black text-white truncate">{pilot.name}</span>
                          <span className="text-[10px] text-amber-300 font-bold">
                            ⭐ {pilot.score.toLocaleString()} pts
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickAdd(pilot.name)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-black transition-all active:scale-95 shrink-0 cursor-pointer"
                      >
                        + {lang === 'es' ? 'Añadir' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Desafíos Directos */}
        {activeTab === 'challenges' && (
          <div className="flex-1 flex flex-col p-4 space-y-3 overflow-y-auto text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-400" />
                {lang === 'es' ? 'DESAFÍOS DIRECTOS ACTIVOS' : 'ACTIVE DIRECT CHALLENGES'}
              </span>
              <span className="text-[10px] text-slate-400">
                {directChallenges.length} {lang === 'es' ? 'retos' : 'challenges'}
              </span>
            </div>

            {directChallenges.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-6 text-center space-y-2">
                <Swords className="w-10 h-10 text-slate-600" />
                <p className="text-sm font-bold text-slate-300">
                  {lang === 'es' ? 'No tienes desafíos pendientes' : 'No pending challenges'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'es' ? 'Ve a tu lista de amigos y desafía a cualquiera para competir por récords y monedas.' : 'Visit your friends list and challenge anyone to beat their records.'}
                </p>
              </div>
            ) : (
              directChallenges.map((challenge) => {
                const isFromMe = challenge.fromId === myPlayerCode;
                const avatar = getAvatarById(challenge.fromAvatar);

                return (
                  <div
                    key={challenge.id}
                    className="p-4 bg-gradient-to-r from-rose-950/40 via-slate-950 to-slate-900 rounded-2xl border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${avatar.gradient} border ${avatar.borderColor} flex items-center justify-center text-2xl shadow shrink-0`}>
                        <span>{avatar.emoji}</span>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white truncate">
                            {isFromMe ? `${lang === 'es' ? 'Para:' : 'To:'} ${challenge.toName}` : `${lang === 'es' ? 'De:' : 'From:'} ${challenge.fromName}`}
                          </span>
                          <span className="bg-rose-950 text-rose-300 text-[10px] font-bold px-2 py-0.2 rounded-full border border-rose-500/30">
                            {challenge.mode.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs">
                          <span className="text-amber-300 font-extrabold flex items-center gap-1">
                            🎯 {lang === 'es' ? 'Objetivo:' : 'Target:'} {challenge.targetScore.toLocaleString()} pts
                          </span>
                          {challenge.rewardCoins && (
                            <span className="text-yellow-400 font-bold flex items-center gap-0.5">
                              🪙 +{challenge.rewardCoins}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {challenge.createdAt} • {challenge.status === 'pending' ? (lang === 'es' ? 'Pendiente' : 'Pending') : challenge.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handlePlayChallenge(challenge)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>{lang === 'es' ? '¡ACEPTAR & JUGAR!' : 'PLAY CHALLENGE!'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SUB-MODAL: Direct Challenge Configuration Modal */}
        {challengingFriend && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md p-5 flex flex-col justify-center animate-fade-in text-left">
            <div className="bg-slate-900 border border-pink-500/40 rounded-3xl p-5 shadow-2xl space-y-4 max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/40">
                    <Swords className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {lang === 'es' ? 'DESAFIAR A AMIGO' : 'CHALLENGE FRIEND'}
                    </h4>
                    <span className="text-xs text-pink-400 font-bold">{challengingFriend.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => setChallengingFriend(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rival preview */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl">
                    <span>{getAvatarById(challengingFriend.avatar).emoji}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-white">{challengingFriend.name}</span>
                    <span className="text-[10px] text-amber-300 font-bold">
                      ⭐ Récord: {challengingFriend.highScore.toLocaleString()} pts
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-cyan-400">🏆 {challengingFriend.trophies}</span>
                </div>
              </div>

              {/* Game Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  {lang === 'es' ? 'Modo de Juego del Desafío' : 'Challenge Game Mode'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['blitz', 'endless', 'fever', 'duel'] as GameMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedChallengeMode(mode)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-black border transition-all ${
                        selectedChallengeMode === mode
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {mode === 'blitz' && '⏱️ 60s Blitz'}
                      {mode === 'endless' && '❤️ Supervivencia'}
                      {mode === 'fever' && '⚡ Modo Fiebre'}
                      {mode === 'duel' && '⚔️ Duelo 1v1'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target score to beat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex justify-between">
                  <span>{lang === 'es' ? 'Puntuación Objetivo a Superar' : 'Target Score to Beat'}</span>
                  <span className="text-amber-300 font-mono font-black">{customTargetScore.toLocaleString()} pts</span>
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCustomTargetScore(challengingFriend.highScore)}
                    className="flex-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-amber-300 rounded-xl"
                  >
                    ⭐ Récord Amigo ({challengingFriend.highScore.toLocaleString()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomTargetScore(Math.floor(challengingFriend.highScore * 1.15))}
                    className="flex-1 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-pink-300 rounded-xl"
                  >
                    🔥 +15% Récord
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleLaunchChallenge(true)}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:brightness-110 text-white font-black text-xs rounded-2xl shadow-xl border border-pink-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span>{lang === 'es' ? '¡JUGAR DESAFÍO DIRECTO AHORA!' : 'PLAY DIRECT SHOWDOWN NOW!'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLaunchChallenge(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Solo Enviar Invitación de Reto' : 'Send Challenge Invite'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-MODAL: Compare Stats Modal */}
        {comparingFriend && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md p-5 flex flex-col justify-center animate-fade-in text-left">
            <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl space-y-4 max-w-sm mx-auto w-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-500/40">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {lang === 'es' ? 'COMPARATIVA DE PILOTOS' : 'PILOT COMPARISON'}
                    </h4>
                    <span className="text-xs text-cyan-400 font-bold">Tú vs {comparingFriend.name}</span>
                  </div>
                </div>

                <button
                  onClick={() => setComparingFriend(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Head-to-Head Comparison Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                {/* Player Column */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-amber-500/30">
                  <div className="text-2xl mb-1">{myAvatar.emoji}</div>
                  <span className="text-xs font-black text-amber-300 truncate block">{playerState.name} (Tú)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Lvl {playerState.level}</span>
                </div>

                {/* Friend Column */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-cyan-500/30">
                  <div className="text-2xl mb-1">{getAvatarById(comparingFriend.avatar).emoji}</div>
                  <span className="text-xs font-black text-cyan-300 truncate block">{comparingFriend.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Lvl {comparingFriend.level}</span>
                </div>
              </div>

              {/* Metrics rows */}
              <div className="space-y-2 text-xs">
                {/* High Score */}
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-mono font-extrabold text-amber-400">{playerState.stats.highestScore.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">⭐ Récord</span>
                  <span className="font-mono font-extrabold text-cyan-400">{comparingFriend.highScore.toLocaleString()}</span>
                </div>

                {/* Trophies */}
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-mono font-extrabold text-amber-400">{playerState.trophies || 1000}</span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">🏆 Trofeos</span>
                  <span className="font-mono font-extrabold text-cyan-400">{comparingFriend.trophies}</span>
                </div>

                {/* Total Stars Tapped */}
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-mono font-extrabold text-amber-400">{playerState.stats.totalStarsTapped.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">✨ Estrellas</span>
                  <span className="font-mono font-extrabold text-cyan-400">{(comparingFriend.highScore * 2.5).toFixed(0)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = comparingFriend;
                  setComparingFriend(null);
                  handleOpenChallengeDialog(target);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Swords className="w-4 h-4 text-yellow-300" />
                <span>{lang === 'es' ? 'DESAFIAR A ESTE PILOTO' : 'CHALLENGE THIS PILOT'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
