import React, { useState, useEffect } from 'react';
import { 
  X, 
  Swords, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  Radio, 
  Sparkles, 
  Coins, 
  KeyRound, 
  CheckCircle2, 
  Globe2,
  Users
} from 'lucide-react';
import { PlayerState, MultiplayerArena, MultiplayerOpponent } from '../types';
import { MULTIPLAYER_ARENAS, getLeagueTitle } from '../data/multiplayerArenas';
import { findMatchingOpponent } from '../services/multiplayerBotPool';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface MultiplayerLobbyModalProps {
  playerState: PlayerState;
  language?: 'es' | 'en';
  onClose: () => void;
  onMatchFound: (arena: MultiplayerArena, opponent: MultiplayerOpponent, isPrivateRoom?: boolean) => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  playerState,
  language = 'es',
  onClose,
  onMatchFound,
}) => {
  const [selectedArena, setSelectedArena] = useState<MultiplayerArena>(MULTIPLAYER_ARENAS[0]);
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');
  
  // Matchmaking State
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchStep, setSearchStep] = useState<number>(0);
  const [foundOpponent, setFoundOpponent] = useState<MultiplayerOpponent | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pinCopied, setPinCopied] = useState<boolean>(false);

  // Custom Room State
  const [roomPin, setRoomPin] = useState<string>('');
  const [createdPin, setCreatedPin] = useState<string | null>(null);

  const playerTrophies = playerState.trophies || 0;
  const currentLang = language === 'en' ? 'en' : 'es';
  const league = getLeagueTitle(playerTrophies, currentLang);
  const wins = playerState.stats.multiplayerWins || 0;
  const losses = playerState.stats.multiplayerLosses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const streak = playerState.stats.multiplayerStreak || 0;

  // Handle Quick Match Matchmaking
  const handleStartSearching = () => {
    if (playerState.coins < selectedArena.entryFee) {
      soundManager.playBombExplosion();
      hapticManager.heavyTap();
      setErrorMsg(currentLang === 'en' ? 'Not enough coins for this arena entry fee!' : '¡No tienes suficientes monedas para entrar a esta arena!');
      setTimeout(() => setErrorMsg(null), 3500);
      return;
    }

    soundManager.playButtonClick();
    hapticManager.mediumTap();
    setIsSearching(true);
    setSearchStep(1);
    setFoundOpponent(null);

    // Simulated high-fidelity global matchmaking sequence
    const t1 = setTimeout(() => {
      setSearchStep(2);
      soundManager.playWheelSpin();
    }, 1200);

    const t2 = setTimeout(() => {
      setSearchStep(3);
      const matched = findMatchingOpponent(selectedArena, playerTrophies, playerState.name);
      setFoundOpponent(matched);
      soundManager.playMatchFound();
      hapticManager.success();
    }, 2500);

    const t3 = setTimeout(() => {
      if (foundOpponent || searchStep >= 2) {
        const opponent = foundOpponent || findMatchingOpponent(selectedArena, playerTrophies, playerState.name);
        onMatchFound(selectedArena, opponent);
      }
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  };

  const handleCancelSearch = () => {
    soundManager.playButtonClick();
    setIsSearching(false);
    setSearchStep(0);
    setFoundOpponent(null);
  };

  // Custom Room Handlers
  const handleCreateRoom = () => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setCreatedPin(pin);
  };

  const handleJoinRoom = () => {
    if (roomPin.length !== 4) return;
    soundManager.playButtonClick();
    hapticManager.mediumTap();
    const opponent: MultiplayerOpponent = {
      id: `friend_${roomPin}`,
      name: `Amigo_Sala#${roomPin}`,
      avatar: '👑',
      flag: '🌐',
      country: 'Sala Privada',
      level: Math.max(1, playerState.level),
      trophies: playerTrophies,
      winStreak: 0,
      pingMs: 18,
      targetScore: 350,
      personality: 'aggressive',
      skillMultiplier: 1.1,
    };
    onMatchFound(selectedArena, opponent, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-purple-500/40 rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/30 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-2xl shadow-lg border border-purple-300/40">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'en' ? 'Cosmic Multiplayer 1v1' : 'Multijugador Cósmico 1v1'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                  EN VIVO
                </span>
              </div>
              <p className="text-xs text-purple-300 font-medium">
                {language === 'en' ? 'Compete in real-time battles and win trophies' : 'Compite en tiempo real y gana trofeos estelares'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Player League & Stats Card */}
          <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-purple-500/30 shadow-inner flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl p-2 rounded-2xl bg-purple-950/80 border border-purple-500/40">
                  {league.badge}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-sm ${league.color}`}>{league.title}</span>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      {playerTrophies} 🏆
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {playerState.avatar || '⭐'} {playerState.name} • Nivel {playerState.level}
                  </span>
                </div>
              </div>

              {streak > 1 && (
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-950/80 border border-orange-500/40 rounded-2xl text-orange-400 text-xs font-black animate-pulse shadow-md">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>Racha x{streak}</span>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Victorias</div>
                <div className="text-sm font-black text-emerald-400">{wins}</div>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Derrotas</div>
                <div className="text-sm font-black text-rose-400">{losses}</div>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Efectividad</div>
                <div className="text-sm font-black text-cyan-400">{winRate}%</div>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs (Partida Rápida vs Sala con Amigos) */}
          <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('quick');
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'quick'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Quick 1v1 Match' : 'Partida Rápida 1v1'}</span>
            </button>
            <button
              onClick={() => {
                soundManager.playButtonClick();
                setActiveTab('custom');
              }}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'custom'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Private Room PIN' : 'Sala con Amigos'}</span>
            </button>
          </div>

          {activeTab === 'quick' ? (
            /* Arena Selector for Quick Match */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Selecciona Arena de Batalla:</span>
                <span className="text-amber-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> {playerState.coins.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2.5">
                {MULTIPLAYER_ARENAS.map((arena) => {
                  const isSelected = selectedArena.id === arena.id;
                  const canAfford = playerState.coins >= arena.entryFee;
                  const isLocked = playerTrophies < arena.minTrophies;

                  return (
                    <div
                      key={arena.id}
                      onClick={() => {
                        if (isLocked) {
                          soundManager.playBombExplosion();
                          return;
                        }
                        soundManager.playButtonClick();
                        hapticManager.lightTap();
                        setSelectedArena(arena);
                      }}
                      className={`p-3.5 sm:p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden bg-gradient-to-r ${arena.bgGradient} ${
                        isSelected
                          ? `ring-2 ring-purple-400 ${arena.borderColor} shadow-xl scale-[1.01]`
                          : 'border-slate-800/80 hover:border-slate-700 opacity-90'
                      } ${isLocked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-950/80 border border-purple-400/30 flex items-center justify-center text-2xl shadow">
                            {arena.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white text-sm">
                                {language === 'en' ? arena.nameEn : arena.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/30">
                                {arena.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-1">
                              {language === 'en' ? arena.descriptionEn : arena.description}
                            </p>
                          </div>
                        </div>

                        {/* Stakes info */}
                        <div className="flex flex-col items-end text-right">
                          <div className="flex items-center gap-1 font-black text-amber-300 text-xs">
                            <span>Premio:</span>
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>+{arena.prizeCoins}</span>
                          </div>
                          <span className="text-[10px] font-extrabold text-emerald-400">
                            +{arena.trophiesReward} 🏆
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Entrada: {arena.entryFee} 🪙
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Inline Error Notice */}
              {errorMsg && (
                <div className="p-3 bg-rose-950/90 border border-rose-500/50 rounded-2xl text-xs text-rose-200 font-bold text-center animate-fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Start Search Button */}
              <button
                onClick={handleStartSearching}
                disabled={isSearching || playerState.coins < selectedArena.entryFee}
                className={`w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2.5 shadow-xl border cursor-pointer ${
                  playerState.coins >= selectedArena.entryFee
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 border-yellow-300/60 hover:brightness-110 active:scale-95'
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                }`}
              >
                <Swords className="w-5 h-5 fill-slate-950" />
                <span>
                  {language === 'en' ? `BATTLE 1v1 (${selectedArena.entryFee} COINS)` : `¡BATALLAR 1v1 (${selectedArena.entryFee} MONEDAS)!`}
                </span>
              </button>
            </div>
          ) : (
            /* Custom Room Tab */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/80 rounded-3xl border border-purple-500/30 space-y-3 text-center">
                <h3 className="font-black text-white text-sm flex items-center justify-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  <span>Crear Sala de Duelo Privada</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Genera un código PIN de 4 dígitos y compártelo con tu amigo para jugar juntos.
                </p>

                {createdPin ? (
                  <div className="p-3 bg-purple-950/90 rounded-2xl border border-purple-400/50 flex flex-col items-center">
                    <span className="text-[10px] text-purple-300 font-bold uppercase">Tu Código PIN:</span>
                    <span className="text-3xl font-black text-amber-300 tracking-widest my-1">{createdPin}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(createdPin);
                        soundManager.playPowerup();
                        hapticManager.lightTap();
                        setPinCopied(true);
                        setTimeout(() => setPinCopied(false), 3000);
                      }}
                      className="text-xs text-purple-200 underline font-bold"
                    >
                      {pinCopied ? '¡Copiado con éxito!' : 'Copiar Código'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleCreateRoom}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl border border-purple-400/40 shadow-md transition-all active:scale-95"
                  >
                    Generar PIN de Sala
                  </button>
                )}
              </div>

              {/* Join Room by PIN */}
              <div className="p-4 bg-slate-950/80 rounded-3xl border border-indigo-500/30 space-y-3">
                <h3 className="font-black text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Unirse a Sala con PIN</span>
                </h3>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={roomPin}
                    onChange={(e) => setRoomPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 7492"
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white font-mono font-bold text-center tracking-widest text-lg focus:outline-none focus:border-purple-400"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={roomPin.length !== 4}
                    className={`px-5 py-3 rounded-2xl font-black text-xs transition-all ${
                      roomPin.length === 4
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Unirse
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matchmaking Radar Overlay Modal */}
      {isSearching && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-slate-900/95 border-2 border-purple-500/50 rounded-[3rem] p-6 sm:p-8 max-w-sm w-full text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse" />

            {/* Radar Animation Rings */}
            <div className="relative w-36 h-36 my-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
              <div className="absolute inset-4 rounded-full border-2 border-cyan-400/30 animate-pulse" />
              <div className="absolute inset-8 rounded-full border-2 border-pink-500/40" />
              
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-3xl shadow-xl z-10 animate-bounce">
                {foundOpponent ? foundOpponent.avatar : <Radio className="w-8 h-8 text-white animate-spin" />}
              </div>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight mb-1">
              {foundOpponent
                ? '¡RIVAL ESTELAR ENCONTRADO!'
                : searchStep === 1
                ? 'Escaneando Red Cósmica...'
                : 'Emparejando por ELO y Latencia...'}
            </h3>

            <p className="text-xs text-purple-300 mb-4 font-medium">
              {foundOpponent
                ? `Conectando con ${foundOpponent.name} (${foundOpponent.pingMs}ms)...`
                : 'Buscando entre jugadores online globales...'}
            </p>

            {foundOpponent ? (
              /* Opponent Preview Card */
              <div className="w-full p-3.5 bg-slate-950/90 rounded-2xl border border-pink-500/40 flex items-center justify-between mb-4 shadow-inner animate-scale-up">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="text-2xl">{foundOpponent.flag}</div>
                  <div>
                    <span className="font-black text-white text-xs block">{foundOpponent.name}</span>
                    <span className="text-[10px] text-slate-400">Nivel {foundOpponent.level} • {foundOpponent.trophies} 🏆</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-xl border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Listo</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCancelSearch}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl border border-slate-700 transition-all active:scale-95"
              >
                Cancelar Búsqueda
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
