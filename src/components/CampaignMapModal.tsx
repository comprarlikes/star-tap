import React, { useState } from 'react';
import { PlayerState, CampaignLevel } from '../types';
import { CONSTELLATION_CHAPTERS, CAMPAIGN_LEVELS, ConstellationChapter } from '../data/campaignLevels';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { 
  X, 
  Sparkles, 
  Trophy, 
  Lock, 
  Star, 
  Zap, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  ShieldAlert, 
  Gift, 
  Play,
  Award
} from 'lucide-react';

interface CampaignMapModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onStartLevel: (level: CampaignLevel) => void;
  onStartCampaignLevel?: (level: CampaignLevel) => void;
  onClaimChapterReward?: (chapterId: number, reward: { coins: number; xp: number; talentPoints: number; badge: string }) => void;
  onOpenTalents?: () => void;
  language?: 'es' | 'en';
}

export const CampaignMapModal: React.FC<CampaignMapModalProps> = ({
  playerState,
  onClose,
  onStartLevel,
  onStartCampaignLevel,
  onClaimChapterReward,
  onOpenTalents,
  language = 'es',
}) => {
  const isEn = language === 'en';
  const campaign = playerState.campaignProgress || {
    unlockedLevel: 1,
    levelStars: {},
    levelHighScores: {},
    claimedChapterRewards: [],
  };

  // Calculate total stars earned
  const totalStarsEarned = (Object.values(campaign.levelStars || {}) as number[]).reduce((acc: number, stars: number) => acc + (stars || 0), 0);

  // Active selected chapter
  const [selectedChapterId, setSelectedChapterId] = useState<number>(() => {
    // Find highest chapter player has access to
    const unlockedLevel = campaign.unlockedLevel || 1;
    const currentLevelObj = CAMPAIGN_LEVELS.find((l) => l.id === unlockedLevel);
    return currentLevelObj ? currentLevelObj.chapter : 1;
  });

  // Active selected level for briefing preview
  const [selectedLevel, setSelectedLevel] = useState<CampaignLevel | null>(() => {
    const unlockedLevel = campaign.unlockedLevel || 1;
    return CAMPAIGN_LEVELS.find((l) => l.id === unlockedLevel) || CAMPAIGN_LEVELS[0];
  });

  const currentChapter = CONSTELLATION_CHAPTERS.find((c) => c.id === selectedChapterId) || CONSTELLATION_CHAPTERS[0];
  const chapterLevels = CAMPAIGN_LEVELS.filter((l) => l.chapter === selectedChapterId);

  // Chapter completion stats
  const chapterEarnedStars = chapterLevels.reduce((acc, lvl) => acc + (campaign.levelStars[lvl.id] || 0), 0);
  const chapterMaxStars = chapterLevels.length * 3;
  const isChapterUnlocked = totalStarsEarned >= currentChapter.requiredTotalStars;
  const isChapterCompleted = chapterLevels.every((lvl) => (campaign.levelStars[lvl.id] || 0) >= 1);
  const isChapterRewardClaimed = campaign.claimedChapterRewards?.includes(`chapter_${currentChapter.id}`);

  const handleSelectLevel = (level: CampaignLevel) => {
    soundManager.playButtonClick();
    hapticManager.lightTap();
    setSelectedLevel(level);
  };

  const handleLaunchLevel = (level: CampaignLevel) => {
    soundManager.playLevelUp();
    hapticManager.mediumTap();
    if (onStartLevel) {
      onStartLevel(level);
    } else if (onStartCampaignLevel) {
      onStartCampaignLevel(level);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92dvh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl">
              🗺️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white flex items-center gap-2">
                {isEn ? 'CONSTELLATION ADVENTURE SAGA' : 'SAGA DE CONSTELACIONES'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold">
                  {totalStarsEarned}/72 ⭐
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {isEn ? 'Conquer levels, earn Cosmic Talent Points & unlock constellations' : 'Supera niveles, gana Puntos de Talento y conquista el cosmos'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isEn ? 'Close' : 'Cerrar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Tabs Navigation Strip */}
        <div className="flex items-center gap-2 px-3 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto no-scrollbar shrink-0">
          {CONSTELLATION_CHAPTERS.map((chap) => {
            const isUnlocked = totalStarsEarned >= chap.requiredTotalStars;
            const isSelected = chap.id === selectedChapterId;
            const chapStars = CAMPAIGN_LEVELS.filter((l) => l.chapter === chap.id).reduce(
              (acc, lvl) => acc + (campaign.levelStars[lvl.id] || 0),
              0
            );

            return (
              <button
                key={chap.id}
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedChapterId(chap.id);
                  const firstLevelInChap = CAMPAIGN_LEVELS.find((l) => l.chapter === chap.id);
                  if (firstLevelInChap) setSelectedLevel(firstLevelInChap);
                }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl border text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border-amber-400/80 text-amber-200 shadow-md ring-1 ring-amber-400/30'
                    : isUnlocked
                    ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    : 'bg-slate-900/40 border-slate-800/40 text-slate-500'
                }`}
              >
                <span className="text-base sm:text-lg">{chap.icon}</span>
                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[110px] sm:max-w-none">
                    {isEn ? chap.nameEn : chap.name}
                  </span>
                  <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                    {isUnlocked ? (
                      <span className="text-amber-400 font-semibold">{chapStars}/18 ⭐</span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Lock className="w-2.5 h-2.5" /> {chap.requiredTotalStars} ⭐
                      </span>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chapter Header Banner & Reward Status */}
        <div className={`px-4 sm:px-6 py-3 bg-gradient-to-r ${currentChapter.bgGradient} border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl filter drop-shadow">{currentChapter.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-amber-200">
                  {isEn ? currentChapter.nameEn : currentChapter.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950/60 border border-slate-700 text-slate-300 font-bold">
                  {chapterEarnedStars}/{chapterMaxStars} ⭐
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-lg mt-0.5">
                {isEn ? currentChapter.descriptionEn : currentChapter.description}
              </p>
            </div>
          </div>

          {/* Chapter Reward Box */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2 sm:p-2.5 rounded-2xl border border-amber-500/30">
            <div className="flex flex-col text-right text-[11px] sm:text-xs">
              <span className="text-slate-400 font-medium">{isEn ? 'Chapter Chest' : 'Cofre de Constelación'}</span>
              <span className="font-extrabold text-amber-300 flex items-center justify-end gap-1">
                +{currentChapter.chapterReward.coins} 🪙 | +{currentChapter.chapterReward.talentPoints} 🔮
              </span>
            </div>
            {isChapterRewardClaimed ? (
              <div className="px-2.5 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isEn ? 'Claimed' : 'Reclamado'}</span>
              </div>
            ) : (
              <button
                disabled={!isChapterCompleted}
                onClick={() => onClaimChapterReward(currentChapter.id, currentChapter.chapterReward)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  isChapterCompleted
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110 animate-bounce'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{isEn ? 'Claim Chest' : 'Reclamar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Body: Interactive Map Grid + Level Briefing Drawer */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-4 sm:gap-6">
          
          {/* Left/Main: Interactive Nodes Grid */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {chapterLevels.map((lvl, index) => {
                const isUnlocked = lvl.id <= (campaign.unlockedLevel || 1);
                const isCurrent = lvl.id === (campaign.unlockedLevel || 1);
                const isSelected = selectedLevel?.id === lvl.id;
                const stars = campaign.levelStars[lvl.id] || 0;
                const highScore = campaign.levelHighScores[lvl.id] || 0;

                return (
                  <button
                    key={lvl.id}
                    disabled={!isUnlocked}
                    onClick={() => handleSelectLevel(lvl)}
                    className={`relative flex flex-col items-center p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-center group ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950 border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-500/20 scale-[1.03]'
                        : isUnlocked
                        ? 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 hover:border-slate-600 shadow-md active:scale-95'
                        : 'bg-slate-950/40 border-slate-800/40 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Boss Node Crown Badge */}
                    {lvl.isBoss && (
                      <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-[9px] rounded-full border border-rose-300 shadow-md uppercase tracking-wider animate-pulse">
                        👑 {isEn ? 'Sector Boss' : 'Jefe Sector'}
                      </span>
                    )}

                    {/* Node Icon Avatar */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-inner mb-2 transition-transform duration-200 ${
                        isCurrent
                          ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 animate-pulse ring-4 ring-amber-400/40'
                          : isUnlocked
                          ? 'bg-slate-900 border border-slate-700 text-amber-300 group-hover:scale-110'
                          : 'bg-slate-950 text-slate-600 border border-slate-800'
                      }`}
                    >
                      {isUnlocked ? lvl.icon : <Lock className="w-5 h-5 text-slate-600" />}
                    </div>

                    {/* Level Number & Name */}
                    <span className="font-extrabold text-xs sm:text-sm text-slate-200 line-clamp-1 mb-1">
                      {isEn ? lvl.nameEn : lvl.name}
                    </span>

                    {/* Star Rating Badge (1-3 ⭐) */}
                    <div className="flex items-center gap-1 my-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                            stars >= starIdx
                              ? 'text-amber-400 fill-amber-400 filter drop-shadow'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Highscore / Status */}
                    {isUnlocked && highScore > 0 && (
                      <span className="text-[10px] text-amber-300 font-bold">
                        {highScore.toLocaleString()} pts
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Level Briefing & Launch Card */}
          {selectedLevel && (
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xl">
              <div>
                {/* Level Title & Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">
                      {isEn ? `CHAPTER ${selectedLevel.chapter} • ${selectedLevel.constellationEn}` : `CAPÍTULO ${selectedLevel.chapter} • ${selectedLevel.constellation}`}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>{selectedLevel.icon}</span>
                      <span>{isEn ? selectedLevel.nameEn : selectedLevel.name}</span>
                    </h4>
                  </div>
                  {selectedLevel.isBoss && (
                    <span className="px-2 py-1 bg-red-950/80 border border-red-500/50 text-red-400 text-[10px] font-black rounded-xl">
                      BOSS 👑
                    </span>
                  )}
                </div>

                {/* Level Description */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isEn ? selectedLevel.descriptionEn : selectedLevel.description}
                </div>

                {/* Primary Objectives List */}
                <div className="space-y-2 mb-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {isEn ? 'Mission Objectives' : 'Objetivos de Misión'}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      {isEn ? 'Target Score' : 'Puntuación Objetivo'}
                    </span>
                    <span className="font-extrabold text-amber-300">{selectedLevel.targetScore} pts</span>
                  </div>

                  {selectedLevel.targetGolden && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                        🌟 {isEn ? 'Golden Stars' : 'Estrellas Doradas'}
                      </span>
                      <span className="font-extrabold text-yellow-300">x{selectedLevel.targetGolden}</span>
                    </div>
                  )}

                  {selectedLevel.targetDiamond && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                        💎 {isEn ? 'Diamond Stars' : 'Estrellas Diamante'}
                      </span>
                      <span className="font-extrabold text-cyan-300">x{selectedLevel.targetDiamond}</span>
                    </div>
                  )}

                  {selectedLevel.targetCombo && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                        🔥 {isEn ? 'Minimum Combo' : 'Combo Mínimo'}
                      </span>
                      <span className="font-extrabold text-rose-300">x{selectedLevel.targetCombo}</span>
                    </div>
                  )}

                  {selectedLevel.noBombsAllowed && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-xs">
                      <span className="text-red-300 flex items-center gap-1.5 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        {isEn ? 'No Bombs Rule' : 'Regla Sin Bombas'}
                      </span>
                      <span className="font-extrabold text-red-400">{isEn ? '0 Hits' : '0 Bombas'}</span>
                    </div>
                  )}

                  {selectedLevel.timeLimit && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                      <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                        ⏱️ {isEn ? 'Time Limit' : 'Límite de Tiempo'}
                      </span>
                      <span className="font-extrabold text-slate-200">{selectedLevel.timeLimit}s</span>
                    </div>
                  )}
                </div>

                {/* 3-Star Thresholds */}
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl mb-4 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>{isEn ? 'Star Thresholds' : 'Requisitos de Estrellas'}</span>
                    <span className="text-amber-400 font-bold">
                      {campaign.levelStars[selectedLevel.id] || 0}/3 ⭐
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-amber-400 text-xs">⭐</div>
                      <div className="text-[10px] text-slate-400 font-bold">{selectedLevel.starRequirements[0]} pts</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-amber-400 text-xs">⭐⭐</div>
                      <div className="text-[10px] text-slate-400 font-bold">{selectedLevel.starRequirements[1]} pts</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-amber-400 text-xs">⭐⭐⭐</div>
                      <div className="text-[10px] text-slate-400 font-bold">{selectedLevel.starRequirements[2]} pts</div>
                    </div>
                  </div>
                </div>

                {/* Rewards Preview */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs mb-4">
                  <span className="text-amber-200 font-bold">{isEn ? 'Level Rewards:' : 'Recompensas:'}</span>
                  <div className="flex items-center gap-2 font-black text-amber-300">
                    <span>+{selectedLevel.rewardCoins} 🪙</span>
                    <span>+{selectedLevel.rewardXp} XP</span>
                    {selectedLevel.rewardTalentPoints && (
                      <span className="text-purple-300">+{selectedLevel.rewardTalentPoints} 🔮</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: Start Level */}
              <button
                onClick={() => handleLaunchLevel(selectedLevel)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 hover:brightness-110 text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>{isEn ? 'PLAY LEVEL NOW' : '¡JUGAR NIVEL AHORA!'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
