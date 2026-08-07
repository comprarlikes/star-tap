import React from 'react';
import { Achievement } from '../types';
import { soundManager } from '../services/sound';
import { X, Award, Check } from 'lucide-react';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
  onClaimAchievement: (achievementId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
  onClaimAchievement,
}) => {
  const totalUnlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md h-[80vh] bg-slate-900/90 border border-slate-800 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-2xl border border-yellow-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-black text-white tracking-tight">LOGROS GALÁCTICOS</h3>
              <span className="text-xs text-slate-400 font-medium">
                Completados: {totalUnlocked}/{achievements.length}
              </span>
            </div>
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

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {achievements.map((item) => {
            const progressPct = Math.min(100, Math.floor((item.progress / item.target) * 100));
            const isReadyToClaim = item.unlocked && !item.claimed;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-2.5 text-left shadow-sm ${
                  item.claimed
                    ? 'bg-slate-950/40 border-slate-850 opacity-75'
                    : item.unlocked
                    ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm text-white">{item.title}</span>
                      <span className="text-xs text-slate-400">{item.description}</span>
                    </div>
                  </div>

                  <div>
                    {item.claimed ? (
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <button
                        disabled={!isReadyToClaim}
                        onClick={() => {
                          soundManager.playCoin();
                          onClaimAchievement(item.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                          isReadyToClaim
                            ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 hover:scale-105 active:scale-95 shadow-md animate-bounce'
                            : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
                        }`}
                      >
                        {isReadyToClaim ? 'RECLAMAR' : `${item.progress}/${item.target}`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Rewards */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold">
                  <span>Recompensa:</span>
                  <span className="text-amber-400">🪙 +{item.rewardCoins} Monedas</span>
                  <span className="text-purple-400">✨ +{item.rewardXp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
