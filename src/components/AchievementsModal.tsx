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
  Layers,
  Compass,
  Rocket,
  Search,
  Zap,
  Coins,
  TrendingUp,
  Target
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

export type AchievementTab = 'all' | 'gameplay' | 'social' | 'progression';
export type StatusFilter = 'all' | 'unclaimed' | 'in_progress' | 'completed';

// Helper to normalize category
export const getAchievementCategory = (item: Achievement): 'gameplay' | 'social' | 'progression' => {
  if (item.category === 'social' || item.id.startsWith('social_')) {
    return 'social';
  }
  if (
    item.category === 'progression' ||
    item.category === 'collection' ||
    item.id.includes('level') ||
    item.id.includes('coin') ||
    item.id.includes('skin') ||
    item.id.includes('armory')
  ) {
    return 'progression';
  }
  return 'gameplay';
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  playerState,
  language = 'es',
  onClose,
  onClaimAchievement,
  onOpenMultiplayer,
}) => {
  const [selectedTab, setSelectedTab] = useState<AchievementTab>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const lang = language === 'en' ? 'en' : 'es';

  // Categorize items
  const categorized = useMemo(() => {
    const gameplay: Achievement[] = [];
    const social: Achievement[] = [];
    const progression: Achievement[] = [];

    achievements.forEach((item) => {
      const cat = getAchievementCategory(item);
      if (cat === 'social') social.push(item);
      else if (cat === 'progression') progression.push(item);
      else gameplay.push(item);
    });

    return { gameplay, social, progression };
  }, [achievements]);

  // Calculate stats & claimable counts
  const totalCount = achievements.length;
  const totalUnlocked = achievements.filter((a) => a.unlocked).length;
  const totalClaimed = achievements.filter((a) => a.claimed).length;
  const totalReadyToClaim = achievements.filter((a) => a.unlocked && !a.claimed).length;

  const gameplayUnlocked = categorized.gameplay.filter((a) => a.unlocked).length;
  const gameplayReady = categorized.gameplay.filter((a) => a.unlocked && !a.claimed).length;

  const socialUnlocked = categorized.social.filter((a) => a.unlocked).length;
  const socialReady = categorized.social.filter((a) => a.unlocked && !a.claimed).length;

  const progressionUnlocked = categorized.progression.filter((a) => a.unlocked).length;
  const progressionReady = categorized.progression.filter((a) => a.unlocked && !a.claimed).length;

  // Filtered list based on Tab, Status, and Search query
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const cat = getAchievementCategory(item);

      // Tab filter
      if (selectedTab !== 'all' && cat !== selectedTab) {
        return false;
      }

      // Status filter
      if (statusFilter === 'unclaimed' && (!item.unlocked || item.claimed)) {
        return false;
      }
      if (statusFilter === 'in_progress' && item.unlocked) {
        return false;
      }
      if (statusFilter === 'completed' && !item.claimed) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [achievements, selectedTab, statusFilter, searchQuery]);

  // Claimable count within currently selected tab
  const tabReadyCount = useMemo(() => {
    if (selectedTab === 'gameplay') return gameplayReady;
    if (selectedTab === 'social') return socialReady;
    if (selectedTab === 'progression') return progressionReady;
    return totalReadyToClaim;
  }, [selectedTab, gameplayReady, socialReady, progressionReady, totalReadyToClaim]);

  // Handle Claim All visible
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

  // Player stats helper for banners
  const trophies = playerState?.trophies || 0;
  const mpWins = playerState?.stats.multiplayerWins || 0;
  const curStreak = playerState?.stats.multiplayerStreak || 0;
  const highestStreak = playerState?.stats.highestStreak || curStreak;
  const arenasCount = (playerState?.stats.arenasPlayed || []).length;
  const starsTapped = playerState?.stats.totalStarsTapped || 0;
  const maxCombo = playerState?.stats.maxCombo || 0;
  const highScore = playerState?.stats.highScore || 0;
  const bombsAvoided = playerState?.stats.bombsAvoided || 0;
  const playerLevel = playerState?.level || 1;
  const totalCoinsEarned = playerState?.stats.totalCoinsEarned || 0;
  const skinsCount = playerState?.unlockedSkins.length || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="w-full max-w-2xl h-[90vh] max-h-[840px] bg-slate-900/98 border border-slate-800 rounded-[2.5rem] text-white shadow-2xl flex flex-col overflow-hidden relative">
        
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
                    {totalReadyToClaim} {lang === 'en' ? 'READY' : 'LISTO'}
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
            {tabReadyCount > 0 && (
              <button
                onClick={handleClaimAll}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                <Gift className="w-3.5 h-3.5" />
                {lang === 'en' ? `CLAIM ALL (${tabReadyCount})` : `RECLAMAR (${tabReadyCount})`}
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

        {/* Navigation Tabs (Gameplay, Social, Progression, All) */}
        <div className="px-4 sm:px-6 pt-3 pb-2.5 bg-slate-950/80 border-b border-slate-800/80 space-y-2.5">
          {/* Main Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {/* All */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.lightTap();
                setSelectedTab('all');
              }}
              className={`py-2 px-2 sm:px-3 rounded-2xl font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all relative ${
                selectedTab === 'all'
                  ? 'bg-slate-700 text-white shadow-md border border-slate-500'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-300" />
                <span className="truncate">{t('achCategoryAll', lang)}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTab === 'all' ? 'bg-slate-800 text-slate-200' : 'bg-slate-950 text-slate-400'
              }`}>
                {totalUnlocked}/{totalCount}
              </span>
              {totalReadyToClaim > 0 && selectedTab !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping" />
              )}
            </button>

            {/* Gameplay Tab */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.mediumTap();
                setSelectedTab('gameplay');
              }}
              className={`py-2 px-2 sm:px-3 rounded-2xl font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all relative ${
                selectedTab === 'gameplay'
                  ? 'bg-gradient-to-r from-amber-600/90 to-yellow-600/90 text-white shadow-lg shadow-amber-950/40 border border-amber-400/60'
                  : 'bg-amber-950/30 text-amber-300/90 hover:text-amber-100 border border-amber-500/20 hover:bg-amber-950/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="truncate">{lang === 'en' ? 'Gameplay' : 'Juego'}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTab === 'gameplay' ? 'bg-amber-900 text-amber-100' : 'bg-amber-950/80 text-amber-300'
              }`}>
                {gameplayUnlocked}/{categorized.gameplay.length}
              </span>
              {gameplayReady > 0 && (
                <span className="w-2 h-2 rounded-full bg-yellow-300 absolute -top-0.5 -right-0.5 animate-ping" />
              )}
            </button>

            {/* Social Tab */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.mediumTap();
                setSelectedTab('social');
              }}
              className={`py-2 px-2 sm:px-3 rounded-2xl font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all relative ${
                selectedTab === 'social'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/40 border border-purple-400/60'
                  : 'bg-purple-950/30 text-purple-300/90 hover:text-purple-100 border border-purple-500/20 hover:bg-purple-950/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span className="truncate">{lang === 'en' ? 'Social' : 'Social'}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTab === 'social' ? 'bg-purple-900 text-purple-100' : 'bg-purple-950/80 text-purple-300'
              }`}>
                {socialUnlocked}/{categorized.social.length}
              </span>
              {socialReady > 0 && (
                <span className="w-2 h-2 rounded-full bg-pink-400 absolute -top-0.5 -right-0.5 animate-ping" />
              )}
            </button>

            {/* Progression Tab */}
            <button
              onClick={() => {
                soundManager.playButtonClick();
                hapticManager.mediumTap();
                setSelectedTab('progression');
              }}
              className={`py-2 px-2 sm:px-3 rounded-2xl font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all relative ${
                selectedTab === 'progression'
                  ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/60'
                  : 'bg-emerald-950/30 text-emerald-300/90 hover:text-emerald-100 border border-emerald-500/20 hover:bg-emerald-950/50'
              }`}
            >
              <div className="flex items-center gap-1">
                <Rocket className="w-3.5 h-3.5 text-emerald-300" />
                <span className="truncate">{lang === 'en' ? 'Progression' : 'Progreso'}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTab === 'progression' ? 'bg-emerald-900 text-emerald-100' : 'bg-emerald-950/80 text-emerald-300'
              }`}>
                {progressionUnlocked}/{categorized.progression.length}
              </span>
              {progressionReady > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
              )}
            </button>
          </div>

          {/* Search Bar & Sub-Filters Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('achSearchPlaceholder', lang) || (lang === 'en' ? 'Search achievements...' : 'Buscar logros...')}
                className="w-full pl-8 pr-7 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'all' ? 'bg-slate-800 text-white font-extrabold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('statusFilterAll', lang)}
              </button>
              <button
                onClick={() => setStatusFilter('unclaimed')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                  statusFilter === 'unclaimed' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t('statusFilterClaimable', lang)}</span>
                {totalReadyToClaim > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500 text-slate-950">
                    {totalReadyToClaim}
                  </span>
                )}
              </button>
              <button
                onClick={() => setStatusFilter('in_progress')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'in_progress' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('statusFilterInProgress', lang)}
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  statusFilter === 'completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('statusFilterCompleted', lang)}
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Banners */}
        {selectedTab === 'gameplay' && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-yellow-950/50 to-slate-900/90 border border-amber-500/30 shadow-md text-left flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-400/30">
                ARCADE & REFLEJOS
              </span>
              <h4 className="font-extrabold text-sm text-white">
                {t('gameplayAchievementsTitle', lang)}
              </h4>
            </div>
            <p className="text-xs text-amber-200/80">
              {t('gameplayAchievementsDesc', lang)}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{lang === 'en' ? 'Stars:' : 'Estrellas:'} <strong className="text-yellow-300">{starsTapped.toLocaleString()}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Max Combo:' : 'Combo Máx:'} <strong className="text-amber-300">x{maxCombo}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-orange-400" />
                <span>{lang === 'en' ? 'High Score:' : 'Récord:'} <strong className="text-orange-300">{highScore}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-red-400" />
                <span>{lang === 'en' ? 'Bombs Dodged:' : 'Bombas Esquivadas:'} <strong className="text-red-300">{bombsAvoided}</strong></span>
              </span>
            </div>
          </div>
        )}

        {selectedTab === 'social' && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/70 to-slate-900/90 border border-purple-500/40 shadow-lg text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-300">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{lang === 'en' ? 'Streak:' : 'Racha:'} <strong className="text-orange-300">{curStreak}</strong> (Max: {highestStreak})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{lang === 'en' ? 'Trophies:' : 'Trofeos:'} <strong className="text-yellow-300">{trophies}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5 text-pink-400" />
                  <span>{lang === 'en' ? '1v1 Wins:' : 'Victorias 1v1:'} <strong className="text-pink-300">{mpWins}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'en' ? 'Arenas:' : 'Arenas:'} <strong className="text-cyan-300">{arenasCount}/5</strong></span>
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

        {selectedTab === 'progression' && (
          <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-teal-950/50 to-slate-900/90 border border-emerald-500/30 shadow-md text-left flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                PROGRESIÓN & TIENDA
              </span>
              <h4 className="font-extrabold text-sm text-white">
                {t('progressionAchievementsTitle', lang)}
              </h4>
            </div>
            <p className="text-xs text-emerald-200/80">
              {t('progressionAchievementsDesc', lang)}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <Rocket className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'en' ? 'Pilot Level:' : 'Nivel Piloto:'} <strong className="text-emerald-300">Nv. {playerLevel}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'en' ? 'Total Coins Earned:' : 'Monedas Ganadas:'} <strong className="text-amber-300">{totalCoinsEarned.toLocaleString()} 🪙</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>{lang === 'en' ? 'Skins Unlocked:' : 'Skins Desbloqueadas:'} <strong className="text-teal-300">{skinsCount}</strong></span>
              </span>
            </div>
          </div>
        )}

        {/* List of achievements */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          {filteredAchievements.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-2.5 text-slate-500">
              <Award className="w-12 h-12 opacity-30 text-slate-400" />
              <p className="font-bold text-sm text-slate-400">
                {lang === 'en' ? 'No achievements found in this view' : 'No se encontraron logros en esta vista'}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="text-xs text-amber-400 underline font-bold"
                >
                  {lang === 'en' ? 'Reset filters' : 'Restablecer filtros'}
                </button>
              )}
            </div>
          ) : (
            filteredAchievements.map((item) => {
              const progressPct = Math.min(100, Math.floor((item.progress / item.target) * 100));
              const isReadyToClaim = item.unlocked && !item.claimed;
              const cat = getAchievementCategory(item);
              const isSocial = cat === 'social';
              const isProgression = cat === 'progression';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col gap-2.5 text-left shadow-sm ${
                    item.claimed
                      ? 'bg-slate-950/40 border-slate-850 opacity-75'
                      : isReadyToClaim
                      ? isSocial
                        ? 'bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border-purple-400/60 shadow-lg shadow-purple-950/30'
                        : isProgression
                        ? 'bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900 border-emerald-400/60 shadow-lg shadow-emerald-950/30'
                        : 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border-amber-400/60 shadow-lg shadow-amber-950/30'
                      : isSocial
                      ? 'bg-slate-950/70 border-purple-900/30 hover:border-purple-700/50'
                      : isProgression
                      ? 'bg-slate-950/70 border-emerald-900/30 hover:border-emerald-700/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-inner relative flex-shrink-0 ${
                        isSocial 
                          ? 'bg-purple-950/60 border-purple-700/40 text-purple-300' 
                          : isProgression
                          ? 'bg-emerald-950/60 border-emerald-700/40 text-emerald-300'
                          : 'bg-slate-900 border-slate-800'
                      }`}>
                        {item.icon}
                        {isSocial ? (
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-purple-600 text-[9px] text-white">
                            👥
                          </span>
                        ) : isProgression ? (
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-600 text-[9px] text-white">
                            🚀
                          </span>
                        ) : (
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-600 text-[9px] text-white">
                            🎮
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm sm:text-base text-white truncate">
                            {item.title}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide border ${
                            isSocial
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : isProgression
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {isSocial ? 'Social' : isProgression ? (lang === 'en' ? 'Progress' : 'Progreso') : (lang === 'en' ? 'Gameplay' : 'Juego')}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {item.claimed ? (
                        <div className="px-2.5 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl font-bold border border-emerald-500/30 flex items-center gap-1 text-xs">
                          <Check className="w-3.5 h-3.5" />
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
                                : isProgression
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-emerald-900/30 animate-bounce'
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
                          : isProgression
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
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

        {/* Modal Footer / Summary */}
        <div className="px-5 sm:px-6 py-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold">
            {filteredAchievements.length} {lang === 'en' ? 'achievements shown' : 'logros mostrados'}
          </span>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all text-xs"
          >
            {t('close', lang) || (lang === 'en' ? 'Close' : 'Cerrar')}
          </button>
        </div>
      </div>
    </div>
  );
};

