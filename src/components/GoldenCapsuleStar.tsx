import React from 'react';

interface GoldenCapsuleStarProps {
  size?: number;
}

export const GoldenCapsuleStar: React.FC<GoldenCapsuleStarProps> = React.memo(({ size = 32 }) => {
  return (
    <div
      className="relative shrink-0 flex items-center justify-center select-none pointer-events-none"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Outer Radial Golden Glow */}
      <div
        className="absolute inset-[-4px] rounded-full blur-[6px] opacity-80 pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(250, 204, 21, 0.9) 0%, rgba(245, 158, 11, 0.4) 60%, transparent 100%)',
        }}
      />

      {/* 3D Beveled Golden Star SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-[0_2px_8px_rgba(245,158,11,0.9)] relative z-10"
      >
        <defs>
          {/* Main Golden Gradient */}
          <linearGradient id="capStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#fde047" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          {/* Top Specular Facet Highlight */}
          <linearGradient id="capStarLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0.4" />
          </linearGradient>

          {/* Dark Facet Shadow */}
          <linearGradient id="capStarDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b45309" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Base Star Silhouette */}
        <path
          d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
          fill="url(#capStarGrad)"
          stroke="#fef08a"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* 3D Facet Geometry radiating from center (50, 52) */}
        <polygon points="50,4 50,52 38,36" fill="url(#capStarLight)" />
        <polygon points="50,4 50,52 62,36" fill="#fde047" fillOpacity="0.85" />
        <polygon points="97,38 50,52 62,36" fill="#fef08a" fillOpacity="0.9" />
        <polygon points="97,38 50,52 69,60" fill="url(#capStarDark)" />
        <polygon points="79,94 50,52 69,60" fill="#d97706" fillOpacity="0.75" />
        <polygon points="79,94 50,52 50,74" fill="url(#capStarDark)" />
        <polygon points="21,94 50,52 50,74" fill="url(#capStarDark)" />
        <polygon points="21,94 50,52 31,60" fill="#b45309" fillOpacity="0.65" />
        <polygon points="3,38 50,52 31,60" fill="url(#capStarLight)" fillOpacity="0.8" />
        <polygon points="3,38 50,52 38,36" fill="#fef08a" fillOpacity="0.95" />

        {/* Specular curved glint */}
        <ellipse
          cx="44"
          cy="24"
          rx="5"
          ry="12"
          fill="#ffffff"
          fillOpacity="0.7"
          transform="rotate(-20 44 24)"
        />

        {/* Center Apex Sparkle */}
        <circle cx="50" cy="52" r="3" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
      </svg>
    </div>
  );
});
