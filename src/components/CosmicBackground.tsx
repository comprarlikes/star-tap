import React, { useMemo } from 'react';

interface CosmicBackgroundProps {
  theme?: string;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ theme = 'theme_space' }) => {
  // Generate stable twinkling stars positions
  const stars = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      x: (i * 37) % 100,
      y: (i * 53) % 100,
      size: (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1.5),
      opacity: 0.35 + ((i % 5) * 0.15),
      delay: (i % 7) * 0.6,
      duration: 2.5 + (i % 4) * 0.8,
      isGolden: i % 6 === 0,
      isCyan: i % 5 === 0,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Deep Space Cosmic Nebulae */}
      <div 
        className="absolute -top-24 -left-24 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full bg-gradient-to-tr from-purple-700/25 via-fuchsia-600/20 to-transparent blur-[80px] animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute -bottom-20 -right-20 w-[360px] sm:w-[480px] h-[360px] sm:h-[480px] rounded-full bg-gradient-to-br from-cyan-600/20 via-blue-600/20 to-transparent blur-[80px] animate-pulse" 
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[320px] sm:w-[440px] h-[320px] sm:h-[440px] rounded-full bg-gradient-to-r from-amber-500/12 via-yellow-400/10 to-transparent blur-[90px] animate-pulse" 
        style={{ animationDuration: '12s', animationDelay: '4s' }}
      />

      {/* 2. Twinkling Stars Matrix */}
      {stars.map((s) => (
        <div
          key={s.id}
          className={`absolute rounded-full transition-opacity duration-1000 ${
            s.isGolden
              ? 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]'
              : s.isCyan
              ? 'bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]'
              : 'bg-white shadow-[0_0_4px_rgba(255,255,255,0.7)]'
          }`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out infinite alternate`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* 3. Subtle Cyber Horizon Grid at the bottom */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-cyan-950/20 via-transparent to-transparent opacity-60" />
    </div>
  );
};
