import React, { useState, useEffect } from 'react';
import { Swords, Flame, Trophy, MessageSquare, Zap, Shield, Sparkles } from 'lucide-react';
import { PlayerState, MultiplayerOpponent, LiveEmote } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { getRandomOpponentEmote } from '../services/multiplayerBotPool';

interface MultiplayerBattleHUDProps {
  playerScore: number;
  playerCombo: number;
  playerState: PlayerState;
  opponent: MultiplayerOpponent;
  opponentScore: number;
  opponentCombo: number;
  opponentEvent: string | null;
  activeEmotes: LiveEmote[];
  onSendEmote: (emoji: string) => void;
  language?: 'es' | 'en';
}

const EMOTE_OPTIONS = ['😎', '🔥', '👑', '😱', '⚡', '👏', '💀', '⭐'];

export const MultiplayerBattleHUD: React.FC<MultiplayerBattleHUDProps> = ({
  playerScore,
  playerCombo,
  playerState,
  opponent,
  opponentScore,
  opponentCombo,
  opponentEvent,
  activeEmotes,
  onSendEmote,
  language = 'es',
}) => {
  const [showEmoteTray, setShowEmoteTray] = useState<boolean>(false);

  // Score tug of war calculation
  const total = Math.max(1, playerScore + opponentScore);
  const playerPercent = Math.min(85, Math.max(15, Math.round((playerScore / total) * 100)));
  const scoreDiff = playerScore - opponentScore;

  return (
    <div className="relative z-30 w-full select-none">
      {/* Top Tug-Of-War Bar */}
      <div className="w-full bg-slate-950/95 border-b border-purple-500/40 p-2 sm:p-2.5 flex flex-col gap-1.5 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-black">
          {/* Player Info Left */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-base shadow animate-pulse">
              {playerState.avatar || '⭐'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] text-cyan-300 font-extrabold truncate max-w-[100px]">
                {playerState.name}
              </span>
              <span className="text-sm font-black text-cyan-400 font-mono leading-none">
                {playerScore.toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* Center Score Difference Pill */}
          <div className="flex flex-col items-center">
            {scoreDiff > 0 ? (
              <span className="px-3 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 rounded-xl text-[11px] font-black animate-bounce shadow-md">
                👑 +{scoreDiff} PTS (LIDERANDO)
              </span>
            ) : scoreDiff < 0 ? (
              <span className="px-3 py-1 bg-rose-950/90 text-rose-300 border border-rose-500/50 rounded-xl text-[11px] font-black shadow-md">
                ⚠️ {scoreDiff} PTS (PELIGRO)
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-900 text-yellow-300 border border-yellow-500/40 rounded-xl text-[11px] font-black">
                ⚔️ ¡EMPATE EXACTO!
              </span>
            )}
          </div>

          {/* Opponent Info Right */}
          <div className="flex items-center gap-2 text-right">
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-rose-300 font-extrabold truncate max-w-[100px]">
                {opponent.name} {opponent.flag}
              </span>
              <span className="text-sm font-black text-rose-400 font-mono leading-none">
                {opponentScore.toLocaleString()} pts
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-950 border border-rose-400/50 flex items-center justify-center text-base shadow animate-pulse">
              {opponent.avatar}
            </div>
          </div>
        </div>

        {/* Dynamic Dual Balance Gauge */}
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400 transition-all duration-300"
            style={{ width: `${playerPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 transition-all duration-300"
            style={{ width: `${100 - playerPercent}%` }}
          />
        </div>
      </div>

      {/* Opponent Dynamic Event Banner (e.g. Rival Hit Bomb, Rival Fever) */}
      {opponentEvent && (
        <div className="absolute top-16 right-3 z-40 bg-slate-950/90 border border-rose-500/50 px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold text-rose-300 animate-slide-in-right backdrop-blur-sm">
          <span>{opponentEvent}</span>
        </div>
      )}

      {/* Floating Active Emote Bubbles */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {activeEmotes.map((em) => (
          <div
            key={em.id}
            className={`absolute ${
              em.sender === 'player' ? 'bottom-28 left-6' : 'bottom-28 right-6'
            } bg-slate-900/95 border-2 ${
              em.sender === 'player' ? 'border-cyan-400' : 'border-rose-400'
            } px-4 py-2 rounded-3xl shadow-2xl flex items-center gap-2 text-3xl animate-bounce`}
          >
            <span>{em.emoji}</span>
          </div>
        ))}
      </div>

      {/* Quick Emote Tray Button (Bottom-Left) */}
      <div className="fixed bottom-4 left-4 z-40">
        {showEmoteTray && (
          <div className="mb-2 p-2 bg-slate-950/95 border border-purple-500/50 rounded-3xl shadow-2xl flex items-center gap-1.5 backdrop-blur-md animate-scale-up">
            {EMOTE_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  soundManager.playEmotePop();
                  hapticManager.lightTap();
                  onSendEmote(emoji);
                  setShowEmoteTray(false);
                }}
                className="w-10 h-10 rounded-2xl bg-slate-900 hover:bg-purple-900/80 border border-purple-500/30 flex items-center justify-center text-xl transition-all active:scale-90 hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            hapticManager.lightTap();
            setShowEmoteTray((prev) => !prev);
          }}
          className="px-3.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl border border-purple-300/40 shadow-xl flex items-center gap-2 font-black text-xs transition-all active:scale-95 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Reaccionar</span>
        </button>
      </div>
    </div>
  );
};
