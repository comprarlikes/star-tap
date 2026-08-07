import React, { useState } from 'react';
import { PlayerState, Quest } from '../types';
import { soundManager } from '../services/sound';
import { X, Target, Gift, Check, Sparkles, Bell, Calendar, Flame, Lock, Star } from 'lucide-react';
import { notifyDailyQuestsUpdated } from '../services/notifications';

interface QuestsModalProps {
  playerState: PlayerState;
  quests: Quest[];
  onClose: () => void;
  onClaimQuest: (questId: string) => void;
  onClaimDailyLogin: () => void;
}

const STREAK_CYCLE_REWARDS = [
  { day: 1, coins: 100, xp: 50, special: false },
  { day: 2, coins: 150, xp: 75, special: false },
  { day: 3, coins: 200, xp: 100, special: false },
  { day: 4, coins: 300, xp: 150, special: false },
  { day: 5, coins: 400, xp: 200, special: false },
  { day: 6, coins: 500, xp: 250, special: false },
  { day: 7, coins: 1000, xp: 500, special: true },
];

export const QuestsModal: React.FC<QuestsModalProps> = ({
  playerState,
  quests,
  onClose,
  onClaimQuest,
  onClaimDailyLogin,
}) => {
  const [notificationSent, setNotificationSent] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const canClaimDaily = playerState.lastDailyClaim !== todayStr;

  const currentStreak = playerState.dailyStreak || 0;
  // Calculate day in 7-day cycle (1..7)
  const streakCycleIndex = canClaimDaily
    ? (currentStreak % 7) // next day to claim (0-indexed -> day = index + 1)
    : ((currentStreak - 1) % 7); // already claimed today, so current streak day

  const handleTestNotification = async () => {
    soundManager.playButtonClick();
    await notifyDailyQuestsUpdated(quests.length);
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">MISIONES Y RACHAS</h3>
          </div>

          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Daily Streak Calendar View Tile */}
          <div className="bg-gradient-to-br from-purple-950/90 via-slate-950 to-indigo-950 border border-purple-500/30 p-4 rounded-2xl flex flex-col gap-3 shadow-lg relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Streak Calendar Header */}
            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-sm text-purple-100 flex items-center gap-1.5">
                    Calendario de Racha <Flame className="w-4 h-4 text-orange-400 animate-pulse fill-orange-400" />
                  </span>
                  <span className="text-[11px] text-slate-400">Inicia sesión a diario para mayores recompensas</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 px-3 py-1 rounded-xl flex items-center gap-1 text-xs font-black text-orange-300 shadow">
                <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                <span>{currentStreak} DÍAS</span>
              </div>
            </div>

            {/* 7-Day Visual Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 py-1 z-10">
              {STREAK_CYCLE_REWARDS.map((item, idx) => {
                const dayNum = item.day;
                // Determine status of each day in 7-day cycle
                let isCompleted = false;
                let isToday = false;

                if (!canClaimDaily) {
                  // Already claimed today
                  if (idx <= streakCycleIndex) isCompleted = true;
                  if (idx === streakCycleIndex) isToday = true;
                } else {
                  // Not claimed today
                  if (idx < streakCycleIndex) isCompleted = true;
                  if (idx === streakCycleIndex) isToday = true;
                }

                return (
                  <div
                    key={dayNum}
                    className={`flex flex-col items-center justify-between p-1.5 rounded-xl border transition-all text-center relative ${
                      isToday
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10 scale-105 z-20'
                        : isCompleted
                        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      DÍA {dayNum}
                    </span>

                    <div className="my-1 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-400 flex items-center justify-center border border-emerald-400/50">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : isToday ? (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center animate-bounce shadow">
                          <Sparkles className="w-3 h-3 fill-slate-950" />
                        </div>
                      ) : item.special ? (
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/30 animate-pulse" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>

                    <span className={`text-[10px] font-mono font-extrabold ${isToday ? 'text-amber-300' : isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                      +{item.coins}🪙
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Claim Reward Button */}
            <button
              disabled={!canClaimDaily}
              onClick={() => {
                soundManager.playCoin();
                onClaimDailyLogin();
              }}
              className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 z-10 ${
                canClaimDaily
                  ? 'bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-400 text-slate-950 hover:brightness-110 active:scale-95 shadow-lg shadow-amber-500/20 animate-pulse uppercase tracking-wider'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-default'
              }`}
            >
              {canClaimDaily ? (
                <>
                  <Gift className="w-4 h-4" />
                  <span>RECLAMAR RECOMPENSA DIARIA (+{STREAK_CYCLE_REWARDS[streakCycleIndex]?.coins || 300} 🪙)</span>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>RECOMPENSA DE HOY RECLAMADA - ¡VUELVE MAÑANA!</span>
                </div>
              )}
            </button>
          </div>

          {/* Push Notification Feature Tile */}
          <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl flex items-center justify-between text-left shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs text-slate-200">Notificaciones Push</span>
                <span className="text-[11px] text-slate-400">Aviso de misiones y recompensas</span>
              </div>
            </div>

            <button
              onClick={handleTestNotification}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                notificationSent
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700 active:scale-95'
              }`}
            >
              {notificationSent ? '¡Notificación Enviada!' : 'Probar Notificación'}
            </button>
          </div>

          {/* Quests List Bento Container */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider text-left">
              Objetivos de Hoy
            </h4>

            {quests.map((quest) => {
              const progressPct = Math.min(100, Math.floor((quest.progress / quest.target) * 100));
              const isReady = quest.progress >= quest.target && !quest.claimed;

              return (
                <div
                  key={quest.id}
                  className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2.5 text-left shadow-sm hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{quest.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-extrabold text-sm text-white">{quest.title}</span>
                        <span className="text-xs text-slate-400">{quest.description}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {quest.claimed ? (
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : (
                        <button
                          disabled={!isReady}
                          onClick={() => {
                            soundManager.playCoin();
                            onClaimQuest(quest.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                            isReady
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95 shadow-md animate-pulse'
                              : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
                          }`}
                        >
                          {isReady ? 'RECLAMAR' : `${quest.progress}/${quest.target}`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Rewards Footer */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold">
                    <span>Recompensa:</span>
                    <span className="text-amber-400">🪙 +{quest.rewardCoins} Monedas</span>
                    <span className="text-purple-400">✨ +{quest.rewardXp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
