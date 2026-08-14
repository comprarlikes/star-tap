import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Coins, Flame, RotateCcw, Swords, ArrowRight, ShieldAlert, Sparkles, Award } from 'lucide-react';
import { PlayerState, MultiplayerArena, MultiplayerOpponent, PlayerStats } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';

interface MultiplayerResultModalProps {
  isWinner: boolean;
  playerScore: number;
  opponentScore: number;
  matchStats: {
    starsTapped: number;
    normal: number;
    golden: number;
    diamond: number;
    bombsHit: number;
    bombsAvoided: number;
    maxCombo: number;
  };
  playerState: PlayerState;
  opponent: MultiplayerOpponent;
  arena: MultiplayerArena;
  language?: 'es' | 'en';
  onRematch: () => void;
  onBackToLobby: () => void;
}

export const MultiplayerResultModal: React.FC<MultiplayerResultModalProps> = ({
  isWinner,
  playerScore,
  opponentScore,
  matchStats,
  playerState,
  opponent,
  arena,
  language = 'es',
  onRematch,
  onBackToLobby,
}) => {
  const [displayedCoins, setDisplayedCoins] = useState<number>(0);
  const [displayedTrophies, setDisplayedTrophies] = useState<number>(0);

  const earnedCoins = isWinner ? arena.prizeCoins : Math.floor(arena.entryFee * 0.2);
  const trophyDelta = isWinner ? arena.trophiesReward : -arena.trophiesLoss;

  useEffect(() => {
    if (isWinner) {
      soundManager.playVictoryCeremony();
      hapticManager.success();

      // Launch victory fireworks confetti
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#facc15', '#38bdf8', '#ec4899', '#34d399', '#a855f7'],
      });
    } else {
      soundManager.playDefeatSound();
      hapticManager.heavyTap();
    }

    // Number count-up effect
    const tCoin = setTimeout(() => {
      setDisplayedCoins(earnedCoins);
      if (isWinner) soundManager.playTrophyGain();
    }, 400);

    const tTrophy = setTimeout(() => {
      setDisplayedTrophies(trophyDelta);
    }, 800);

    return () => {
      clearTimeout(tCoin);
      clearTimeout(tTrophy);
    };
  }, [isWinner, earnedCoins, trophyDelta]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-slate-900 border border-purple-500/40 rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden flex flex-col p-6 sm:p-7 relative text-center">
        <div
          className={`absolute top-0 inset-x-0 h-2 ${
            isWinner
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400'
              : 'bg-gradient-to-r from-rose-500 via-purple-600 to-slate-700'
          }`}
        />

        {/* Victory / Defeat Badge */}
        <div className="my-2 flex flex-col items-center">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl border mb-3 animate-bounce ${
              isWinner
                ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 border-yellow-200/80 shadow-[0_0_50px_rgba(245,158,11,0.6)]'
                : 'bg-slate-800 border-slate-700 shadow-inner'
            }`}
          >
            {isWinner ? '👑' : '💔'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {isWinner
              ? (language === 'en' ? 'COSMIC VICTORY!' : '¡VICTORIA ESTELAR!')
              : (language === 'en' ? 'DEFEAT' : '¡DERROTA!')}
          </h2>

          <p className="text-xs text-slate-300 mt-1 font-medium">
            {isWinner
              ? `Has derrotado a ${opponent.name} en ${arena.name}`
              : `${opponent.name} ha tomado la delantera en este duelo`}
          </p>
        </div>

        {/* Rewards Earned / Lost Banner */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/30 flex flex-col items-center shadow-inner">
            <span className="text-[10px] font-black text-amber-400 uppercase">Monedas</span>
            <div className="flex items-center gap-1.5 text-lg font-black text-amber-300 font-mono mt-0.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>+{displayedCoins}</span>
            </div>
          </div>

          <div
            className={`p-3 bg-slate-950/80 rounded-2xl border flex flex-col items-center shadow-inner ${
              isWinner ? 'border-emerald-500/40' : 'border-rose-500/40'
            }`}
          >
            <span
              className={`text-[10px] font-black uppercase ${
                isWinner ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              Trofeos
            </span>
            <div
              className={`flex items-center gap-1.5 text-lg font-black font-mono mt-0.5 ${
                isWinner ? 'text-emerald-300' : 'text-rose-400'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{displayedTrophies >= 0 ? `+${displayedTrophies}` : displayedTrophies} 🏆</span>
            </div>
          </div>
        </div>

        {/* Head-to-Head Detailed Comparison */}
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2.5 mb-5 text-xs text-left shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-black text-slate-400 uppercase">
            <span className="text-cyan-400">{playerState.name} (Tú)</span>
            <span>Métrica</span>
            <span className="text-rose-400">{opponent.name}</span>
          </div>

          <div className="flex items-center justify-between font-bold">
            <span className="text-cyan-300 font-mono text-sm font-black">{playerScore.toLocaleString()}</span>
            <span className="text-slate-400 text-[11px]">Puntuación</span>
            <span className="text-rose-300 font-mono text-sm font-black">{opponentScore.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-mono font-bold">x{matchStats.maxCombo}</span>
            <span className="text-slate-400 text-[11px]">Combo Máx</span>
            <span className="text-rose-300 font-mono font-bold">
              x{Math.max(4, Math.floor(matchStats.maxCombo * (isWinner ? 0.85 : 1.25)))}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-mono font-bold">{matchStats.starsTapped}</span>
            <span className="text-slate-400 text-[11px]">Estrellas</span>
            <span className="text-rose-300 font-mono font-bold">
              {Math.max(10, Math.floor(matchStats.starsTapped * (isWinner ? 0.9 : 1.15)))}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-cyan-300 font-mono font-bold">{matchStats.bombsHit}</span>
            <span className="text-slate-400 text-[11px]">Bombas</span>
            <span className="text-rose-300 font-mono font-bold">{isWinner ? 2 : 0}</span>
          </div>
        </div>

        {/* Action Buttons: Rematch & Back to Lobby */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              soundManager.playButtonClick();
              hapticManager.mediumTap();
              onRematch();
            }}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-yellow-300/50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'en' ? 'REMATCH' : '¡REVANCHA!'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onBackToLobby();
            }}
            className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            {language === 'en' ? 'Lobby' : 'Lobby'}
          </button>
        </div>
      </div>
    </div>
  );
};
