import React, { useState, useMemo } from 'react';
import { Achievement, PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { 
  X, 
  Award, 
  Check, 
  Users, 
  Flame, 
  Gamepad2, 
  Sparkles, 
  Swords, 
  Trophy, 
  Gift, 
  ShieldCheck, 
  Layers,
  Compass
} from 'lucide-react';
import { t } from '../i18n';

interface AchievementsModalProps {
  achievements: Achievement[];
  playerState?: PlayerState;
  language?: 'es' | 'en';
  onClose: () => void;
  onClaimAchievement: (achievementId: string) => void;
  onOpenMultiplayer?: () => void;
}

type AchievementCategory = 'all' | 'social' | 'arcade' | 'collection';
type StatusFilter = 'all' | 'unclaimed' | 'completed';

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  playerState,
  language = 'es',
  onClose,
  onClaimAchievement,
  onOpenMultiplayer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const lang = language === 'en' ? 'en' : 'es';

  // Calculate counts
  const totalCount = achievements.length;
  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalClaimed = achievements.filter((a) => a.claimed).length;
  const totalReadyToClaim = achievements.filter((a) => a.unlocked && !a.claimed).length;

  const socialAchievements = achievements.filter((a) => a.category === 'social');
  const socialUnlocked = socialAchievements.filter((a) => a.unlocked).length;
  const socialReady = socialAchievements.filter((a) => a.unlocked && !a.claimed).length;

  const arcadeAchievements = achievements.filter((a) => !a.category || a.category === 'arcade');
  const arcadeUnlocked = arcadeAchievements.filter((a) => a.unlocked).length;

  const collectionAchievements = achievements.filter((a) => a.category === 'collection');
  const collectionUnlocked = collectionAchievements.filter((a) => a.unlocked).length;

  // Filtered List
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      // Category filter
      if (selectedCategory === 'social' && item.category !== 'social') return false;
      if (selectedCategory === 'arcade' && (item.category && item.category !== 'arcade')) return false;
      if (selectedCategory === 'collection' && item.category !== 'collection') return false;

      // Status filter
      if (statusFilter === 'unclaimed') {
        return item.unlocked && !item.claimed;
      }
      if (statusFilter === 'completed') {
        return item.claimed;
      }
      return true;
    });
  }, [achievements, selectedCategory, statusFilter]);

  // Handle Claim All
  const handleClaimAll = () => {
    const readyItems = filteredAchievements.filter((a) => a.unlocked && !a.claimed);
    if (readyItems.length === 0) return;
    
    soundManager.playCoin();
    hapticManager.success();
    readyItems.forEach((item, index) => {
      setTimeout(() => {
        onClaimAchievement(item.id);
      }, index * 120);
    });
  };

  // Multiplayer player stats helpers
  const trophies = playerState?.trophies || 0;
  const mpWins = playerState?.stats.multiplayerWins || 0;
  const curStreak = playerState?.stats.multiplayerStreak || 0;
  const maxStreak = playerState?.stats.highestStreak || curStreak;
  const arenasPlayedCount = (playerState?.stats.arenasPlayed || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-xl h-[88vh] max-h-[800px] bg-slate-900/95 border border-slate-800 rounded-[2.5rem] text-white shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header Bento Tile */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t('achievementsTitle', lang)}
                </h3>
                {totalReadyToClaim > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-bounce">
                    {totalReadyToClaim} {lang === 'en' ? 'NEW' : 'LISTO'}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {lang === 'en'
                  ? `Completed: ${totalUnlocked}/${totalCount} (${Math.round((totalUnlocked / (totalCount || 1)) * 100)}%)`
                  : `Completados: ${totalUnlocked}/${totalCount} (${Math.round((totalUnlocked / (totalCount || 1)) * 100)}%)`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalReadyToClaim > 1 && (
              <button
                onClick={handleClaimAll}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Gift className="w-3.5 h-3.5" />
                {lang === 'en' ? 'CLAIM ALL' : 'RECLAMAR TODO'}
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playButtonClick();
                onClose();
              }}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl text-slate-400 hover:text-white border border-slate-700/60 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Tabs Selector */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 max-w-full">
            {/* All */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.lightTap();
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-700 text-white shadow-md border border-slate-600'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('achCategoryAll', lang)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                {totalUnlocked}/{totalCount}
              </span>
            </button>

            {/* Social Achievements (Highlighted Category) */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.mediumTap();
                setSelectedCategory('social');
              }}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all whitespace-nowrap relative ${
                selectedCategory === 'social'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/50'
                  : 'bg-purple-950/40 text-purple-300 hover:text-purple-100 border border-purple-500/30'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>{t('achCategorySocial', lang)}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === 'social' ? 'bg-purple-900 text-purple-200' : 'bg-purple-900/60 text-purple-300'
              }`}>
                {socialUnlocked}/{socialAchievements.length}
              </span>
              {socialReady > 0 && (
                <span className="w-2 h-2 rounded-full bg-pink-400 absolute -top-0.5 -right-0.5 animate-ping" />
              )}
            </button>

            {/* Arcade */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.lightTap();
                setSelectedCategory('arcade');
              }}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategory === 'arcade'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('achCategoryArcade', lang)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                {arcadeUnlocked}/{arcadeAchievements.length}
              </span>
            </button>

            {/* Collection */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.lightTap();
                setSelectedCategory('collection');
              }}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                selectedCategory === 'collection'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t('achCategoryCollection', lang)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-bold">
                {collectionUnlocked}/{collectionAchievements.length}
              </span>
            </button>
          </div>

          {/* Sub-Filter: Status */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                statusFilter === 'all' ? 'bg-slate-800 text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' ? 'All' : 'Todos'}
            </button>
            <button
              onClick={() => setStatusFilter('unclaimed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                statusFilter === 'unclaimed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' ? 'Claimable' : 'Reclamables'}
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lang === 'en' ? 'Claimed' : 'Reclamados'}
            </button>
          </div>
        </div>

        {/* Banner for Social Category */}
        {selectedCategory === 'social' && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900/90 border border-purple-500/40 shadow-lg text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/30 text-purple-300 border border-purple-400/40">
                  1v1 ONLINE
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-white">
                  {t('socialAchievementsTitle', lang)}
                </h4>
              </div>
              <p className="text-xs text-purple-200/80">
                {t('socialAchievementsDesc', lang)}
              </p>

              {/* Quick stats indicators */}
              <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{lang === 'en' ? 'Streak:' : 'Racha:'} <strong className="text-orange-300">{curStreak}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{lang === 'en' ? 'Trophies:' : 'Trofeos:'} <strong className="text-yellow-300">{trophies}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'en' ? 'Arenas:' : 'Arenas:'} <strong className="text-cyan-300">{arenasPlayedCount}/5</strong></span>
                </span>
              </div>
            </div>

            {onOpenMultiplayer && (
              <button
                onClick={() => {
                  soundManager.playButtonClick();
                  hapticManager.mediumTap();
                  onClose();
                  onOpenMultiplayer();
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap self-start sm:self-center flex items-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>{t('playMultiplayerNow', lang)}</span>
              </button>
            )}
          </div>
        )}

        {/* List of achievements */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          {filteredAchievements.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-500">
              <Award className="w-12 h-12 opacity-30 text-slate-400" />
              <p className="font-bold text-sm">
                {lang === 'en' ? 'No achievements found in this filter' : 'No se encontraron logros con este filtro'}
              </p>
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs text-amber-400 underline font-bold"
              >
                {lang === 'en' ? 'View all' : 'Ver todos'}
              </button>
            </div>
          ) : (
            filteredAchievements.map((item) => {
              const progressPct = Math.min(100, Math.floor((item.progress / item.target) * 100));
              const isReadyToClaim = item.unlocked && !item.claimed;
              const isSocial = item.category === 'social';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 text-left shadow-sm ${
                    item.claimed
                      ? 'bg-slate-950/40 border-slate-850 opacity-75'
                      : isReadyToClaim
                      ? isSocial
                        ? 'bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border-purple-400/60 shadow-lg shadow-purple-950/30'
                        : 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border-amber-400/60 shadow-lg shadow-amber-950/30'
                      : isSocial
                      ? 'bg-slate-950/70 border-purple-900/30 hover:border-purple-700/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-inner relative flex-shrink-0 ${
                        isSocial 
                          ? 'bg-purple-950/60 border-purple-700/40 text-purple-300' 
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        {item.icon}
                        {isSocial && (
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-purple-600 text-[10px] text-white">
                            👥
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-white">
                            {item.title}
                          </span>
                          {isSocial && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              SOCIAL
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {item.claimed ? (
                        <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30 flex items-center gap-1 text-xs">
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">{lang === 'en' ? 'Claimed' : 'Hecho'}</span>
                        </div>
                      ) : (
                        <button
                          disabled={!isReadyToClaim}
                          onClick={() => {
                            soundManager.playCoin();
                            hapticManager.success();
                            onClaimAchievement(item.id);
                          }}
                          className={`px-3 sm:px-4 py-2 rounded-xl font-black text-xs transition-all ${
                            isReadyToClaim
                              ? isSocial
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 active:scale-95 shadow-md shadow-pink-900/30 animate-pulse'
                                : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-amber-900/30 animate-bounce'
                              : 'bg-slate-800/80 text-slate-500 border border-slate-700/60 cursor-default'
                          }`}
                        >
                          {isReadyToClaim
                            ? (lang === 'en' ? 'CLAIM' : 'RECLAMAR')
                            : `${item.progress}/${item.target}`}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isSocial
                          ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-400'
                          : 'bg-gradient-to-r from-yellow-400 to-amber-500'
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  {/* Rewards Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold pt-0.5">
                    <div className="flex items-center gap-3">
                      <span>{t('rewardLabel', lang) || 'Recompensa'}:</span>
                      <span className="text-amber-400 font-extrabold">🪙 +{item.rewardCoins}</span>
                      <span className="text-purple-400 font-extrabold">✨ +{item.rewardXp} XP</span>
                    </div>

                    <span className="text-slate-500 text-[10px]">
                      {progressPct}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
