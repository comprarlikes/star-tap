import React from 'react';
import { PlayerState } from '../types';
import { soundManager } from '../services/sound';
import { X, BarChart2, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface StatsModalProps {
  playerState: PlayerState;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ playerState, onClose }) => {
  const stats = playerState.stats;

  const scoreHistory =
    stats.scoreHistory && stats.scoreHistory.length > 0
      ? stats.scoreHistory
      : stats.highestScore > 0
      ? [
          Math.round(stats.highestScore * 0.35),
          Math.round(stats.highestScore * 0.5),
          Math.round(stats.highestScore * 0.65),
          Math.round(stats.highestScore * 0.8),
          stats.highestScore,
        ]
      : [];

  const chartData = scoreHistory.map((score, idx) => ({
    name: `#${idx + 1}`,
    score,
  }));

  const averageScore =
    scoreHistory.length > 0
      ? Math.round(scoreHistory.reduce((a, b) => a + b, 0) / scoreHistory.length)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-[2rem] text-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header Bento Tile */}
        <div className="px-5 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <h3 className="text-xl font-black text-white tracking-tight">ESTADÍSTICAS DEL JUGADOR</h3>
              <span className="text-xs text-slate-400 font-medium">Historial y Logros de Partida</span>
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

        {/* Content Bento Grid */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Main Highlights Bento Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
              <span className="text-xs text-slate-400 font-medium">🏆 Récord Máximo</span>
              <span className="text-2xl font-black text-amber-400 mt-1">
                {stats.highestScore.toLocaleString()}
              </span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
              <span className="text-xs text-slate-400 font-medium">⚡ Combo Máximo</span>
              <span className="text-2xl font-black text-yellow-300 mt-1">
                {stats.highestCombo}x
              </span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
              <span className="text-xs text-slate-400 font-medium">🎮 Partidas Jugadas</span>
              <span className="text-2xl font-black text-cyan-400 mt-1">
                {stats.gamesPlayed}
              </span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-start shadow-sm">
              <span className="text-xs text-slate-400 font-medium">🪙 Monedas Ganadas</span>
              <span className="text-2xl font-black text-amber-300 mt-1">
                {stats.totalCoinsEarned.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Recharts Score History Visualization Tile */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-left shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                  Progreso ÚLTIMAS 10 Partidas
                </h4>
              </div>
              {averageScore > 0 && (
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  Promedio: <strong className="text-amber-400">{averageScore.toLocaleString()} pts</strong>
                </span>
              )}
            </div>

            {chartData.length > 0 ? (
              <div className="w-full h-48 pt-2 select-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      dy={4}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#f59e0b',
                        borderWidth: '1px',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
                      }}
                      formatter={(value: any) => [`${Number(value).toLocaleString()} pts`, 'Puntuación']}
                      labelFormatter={(label: string) => `Partida ${label}`}
                    />
                    {averageScore > 0 && (
                      <ReferenceLine
                        y={averageScore}
                        stroke="#06b6d4"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Promed: ${averageScore.toLocaleString()} pts`,
                          fill: '#22d3ee',
                          fontSize: 9,
                          position: 'insideTopRight',
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Puntuación"
                      stroke="#f59e0b"
                      strokeWidth={3.5}
                      dot={{ r: 4.5, fill: '#fbbf24', stroke: '#78350f', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#fef08a', stroke: '#f59e0b', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 font-medium">
                ¡Juega tus primeras partidas para ver tu gráfico de rendimiento aquí!
              </div>
            )}
          </div>

          {/* Star Breakdown Bento Tile */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3 text-left shadow-sm">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
              Desglose de Estrellas Tocado
            </h4>

            <div className="flex justify-between items-center text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-2">
                <span>⭐</span> Estrellas Normales
              </span>
              <span className="font-extrabold text-amber-300">{stats.normalTapped}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-2">
                <span>🌟</span> Estrellas Doradas
              </span>
              <span className="font-extrabold text-yellow-400">{stats.goldenTapped}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-2">
                <span>💎</span> Diamantes Cósmicos
              </span>
              <span className="font-extrabold text-cyan-400">{stats.diamondTapped}</span>
            </div>

            <div className="flex justify-between items-center text-xs p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
              <span className="text-slate-300 flex items-center gap-2">
                <span>💣</span> Bombas Evitadas
              </span>
              <span className="font-extrabold text-emerald-400">{stats.bombsAvoided}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
