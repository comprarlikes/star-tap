import React, { useState } from 'react';
import { PlayerState, CosmicTalent } from '../types';
import { COSMIC_TALENTS, getTalentValue } from '../data/talents';
import { soundManager } from '../services/sound';
import { hapticManager } from '../services/haptics';
import { 
  X, 
  Sparkles, 
  Zap, 
  RotateCcw, 
  PlusCircle, 
  CheckCircle, 
  Lock, 
  ArrowUpCircle,
  HelpCircle,
  Coins
} from 'lucide-react';

interface TalentsModalProps {
  playerState: PlayerState;
  onClose: () => void;
  onUpgradeTalent: (talentId: string, cost: number) => void;
  onResetTalents: () => void;
  onBuyTalentPoint: (coinPrice: number) => void;
  language?: 'es' | 'en';
}

export const TalentsModal: React.FC<TalentsModalProps> = ({
  playerState,
  onClose,
  onUpgradeTalent,
  onResetTalents,
  onBuyTalentPoint,
  language = 'es',
}) => {
  const isEn = language === 'en';
  const talentPoints = playerState.talentPoints || 0;
  const talents = playerState.talents || {};
  const [selectedBranch, setSelectedBranch] = useState<'all' | 'utility' | 'precision' | 'fortune' | 'defense' | 'economy'>('all');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const totalPointsInvested = (Object.values(talents) as number[]).reduce((acc: number, rank: number) => acc + (rank || 0), 0);
  const talentPointCoinPrice = 600; // 600 Coins for +1 Talent Point

  const filteredTalents = selectedBranch === 'all' 
    ? COSMIC_TALENTS 
    : COSMIC_TALENTS.filter((t) => t.branch === selectedBranch);

  const handleUpgrade = (talent: CosmicTalent) => {
    const currentRank = talents[talent.id] || 0;
    if (currentRank >= talent.maxRank) return;

    const cost = talent.costs[currentRank] || 1;
    if (talentPoints < cost) {
      soundManager.playBombExplosion();
      hapticManager.heavyTap();
      return;
    }

    soundManager.playLevelUp();
    hapticManager.success();
    onUpgradeTalent(talent.id, cost);
  };

  const handleBuyPoint = () => {
    if (playerState.coins < talentPointCoinPrice) {
      soundManager.playBombExplosion();
      hapticManager.heavyTap();
      return;
    }
    soundManager.playCoin();
    hapticManager.mediumTap();
    onBuyTalentPoint(talentPointCoinPrice);
  };

  const handleReset = () => {
    if (totalPointsInvested === 0) return;
    soundManager.playButtonClick();
    hapticManager.mediumTap();
    onResetTalents();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92dvh] bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white font-black text-xl">
              🔮
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-white flex items-center gap-2">
                {isEn ? 'COSMIC TALENTS TREE' : 'ÁRBOL DE TALENTOS CÓSMICOS'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-300 font-bold">
                  {talentPoints} {isEn ? 'Points Available' : 'Puntos Disponibles'} 🔮
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {isEn ? 'Permanent passive upgrades for star duration, luck, shields & harvest' : 'Mejoras pasivas permanentes de reflejos, imán, escudos y cosecha de oro'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp((v) => !v)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isEn ? 'How it works' : 'Cómo funciona'}
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isEn ? 'Close' : 'Cerrar'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Top Bar: Points Summary, Buy Point with Coins & Reset */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold shadow-inner">
              <span className="text-sm">🔮</span>
              <span>{isEn ? 'Available:' : 'Disponibles:'} <strong>{talentPoints}</strong></span>
            </div>
            <div className="text-xs text-slate-400">
              {isEn ? 'Invested:' : 'Invertidos:'} <strong className="text-slate-200">{totalPointsInvested}</strong> pts
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Buy Talent Point with Stardust / Coins */}
            <button
              onClick={handleBuyPoint}
              disabled={playerState.coins < talentPointCoinPrice}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                playerState.coins >= talentPointCoinPrice
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
              }`}
              title={isEn ? `Buy +1 Talent Point for ${talentPointCoinPrice} Coins` : `Comprar +1 Punto de Talento por ${talentPointCoinPrice} Monedas`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isEn ? '+1 Talent Point' : '+1 Punto (600 🪙)'}</span>
            </button>

            {/* Reset Talents Button */}
            <button
              onClick={handleReset}
              disabled={totalPointsInvested === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                totalPointsInvested > 0
                  ? 'bg-slate-800/80 hover:bg-rose-950/60 border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300'
                  : 'bg-slate-900/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
              }`}
              title={isEn ? 'Reassign all invested points' : 'Reasignar todos los puntos invertidos'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Reset' : 'Reasignar'}</span>
            </button>
          </div>
        </div>

        {/* Branch Filter Tabs */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2 bg-slate-950/30 border-b border-slate-800/60 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'all', label: isEn ? 'All Branches' : 'Todos los Talentos', icon: '🌌' },
            { id: 'utility', label: isEn ? 'Reflexes & Tempo' : 'Reflejos & Tiempo', icon: '⏱️' },
            { id: 'precision', label: isEn ? 'Precision' : 'Precisión & Corte', icon: '🧲' },
            { id: 'fortune', label: isEn ? 'Fortune' : 'Suerte Astral', icon: '🍀' },
            { id: 'defense', label: isEn ? 'Defense' : 'Defensa & Escudos', icon: '🛡️' },
            { id: 'economy', label: isEn ? 'Economy' : 'Cosecha & Oro', icon: '🪙' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedBranch(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedBranch === tab.id
                  ? 'bg-purple-600/30 border border-purple-400 text-purple-200 shadow-sm'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-400 border border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Explanatory Help Card if opened */}
        {showHelp && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 bg-purple-950/40 border border-purple-500/30 rounded-2xl text-xs text-purple-200 leading-relaxed flex items-start gap-2.5 animate-fade-in shrink-0">
            <span className="text-xl">💡</span>
            <div>
              <span className="font-bold">{isEn ? 'How Cosmic Talents Work:' : '¿Cómo funcionan los Talentos Cósmicos?'}</span>
              <p className="mt-0.5 text-slate-300">
                {isEn 
                  ? 'Talent points are earned by leveling up your pilot, clearing Campaign levels, and advancing in the Cosmic Pass. Upgrades apply immediately across all game modes (Blitz, Endless, Fever, Duelo, Multijugador).'
                  : 'Ganas Puntos de Talento al subir de nivel, superar niveles de la Campaña y avanzar en el Pase Cósmico. Las mejoras aplican automáticamente a todas las partidas (Blitz, Supervivencia, Ráfaga, Duelos y 1v1).'}
              </p>
            </div>
          </div>
        )}

        {/* Main Grid: Talent Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTalents.map((talent) => {
            const currentRank = talents[talent.id] || 0;
            const isMaxed = currentRank >= talent.maxRank;
            const nextCost = talent.costs[currentRank] || 1;
            const canAfford = talentPoints >= nextCost;
            const curValue = getTalentValue(talent.id, currentRank);
            const nextValue = getTalentValue(talent.id, currentRank + 1);

            return (
              <div
                key={talent.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isMaxed
                    ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/50 shadow-md shadow-purple-500/10'
                    : currentRank > 0
                    ? 'bg-slate-900/90 border-slate-700/90 hover:border-slate-600 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Line: Icon, Title, Maxed or Rank Indicator */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner shrink-0">
                        {talent.icon}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                          <span>{isEn ? talent.nameEn : talent.name}</span>
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400">
                          {talent.branch} • Tier {talent.tier}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                        isMaxed 
                          ? 'bg-purple-950 border-purple-400 text-purple-300' 
                          : currentRank > 0 
                          ? 'bg-slate-800 border-slate-600 text-amber-300' 
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}>
                        {isMaxed ? (isEn ? 'MAXED' : 'MÁXIMO') : `Nv. ${currentRank}/${talent.maxRank}`}
                      </span>

                      {/* Rank Pips Bar */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {Array.from({ length: talent.maxRank }).map((_, pipIdx) => (
                          <div
                            key={pipIdx}
                            className={`w-2.5 h-1.5 rounded-full transition-all ${
                              currentRank > pipIdx
                                ? 'bg-gradient-to-r from-purple-400 to-pink-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]'
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Talent Description */}
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {isEn ? talent.descriptionEn : talent.description}
                  </p>

                  {/* Current vs Next Level Stat Comparison */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">
                        {isEn ? 'Current Bonus:' : 'Efecto Actual:'}
                      </span>
                      <span className={`font-black ${currentRank > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {currentRank > 0 
                          ? (isEn ? `+${curValue}% effect` : `+${curValue}% de bonificación`) 
                          : (isEn ? 'Inactive (0%)' : 'Inactivo (0%)')}
                      </span>
                    </div>

                    {!isMaxed && (
                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-900 text-slate-300">
                        <span className="text-slate-400 font-medium">{isEn ? 'Next Level:' : 'Siguiente Nivel:'}</span>
                        <span className="font-extrabold text-purple-300">
                          {isEn ? `+${nextValue}% effect` : `+${nextValue}% de bonificación`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upgrade Button */}
                <div>
                  {isMaxed ? (
                    <div className="w-full py-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 font-black text-xs text-center flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-purple-400" />
                      <span>{isEn ? 'TALENT FULLY MASTERED' : 'TALENTO DOMINADO AL MÁXIMO'}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(talent)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        canAfford
                          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white shadow-purple-600/30 active:scale-98'
                          : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                      <span>
                        {isEn ? `Upgrade (${nextCost} 🔮)` : `Mejorar (${nextCost} Punto${nextCost > 1 ? 's' : ''} 🔮)`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
