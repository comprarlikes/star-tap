import React from 'react';

interface GlossyRedHeartProps {
  active: boolean;
  size?: number;
}

export const GlossyRedHeart: React.FC<GlossyRedHeartProps> = React.memo(({ active, size = 28 }) => {
  return (
    <div
      className={`relative transition-all duration-300 select-none flex items-center justify-center ${
        active ? 'scale-100 opacity-100' : 'scale-90 opacity-25 grayscale'
      }`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        viewBox="0 0 36 36"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_10px_rgba(239,68,68,0.7)]"
      >
        <defs>
          {/* Rich 3D Plump Heart Gradient */}
          <radialGradient id="heartGradRed" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="25%" stopColor="#ef4444" />
            <stop offset="65%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>

          {/* Deep Rim Shadow for Beveled Look */}
          <linearGradient id="heartStrokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
        </defs>

        {/* Heart Silhouette */}
        <path
          d="M18 32 C18 32 3 22 3 11 C3 5.5 7.5 2 13 2 C16.5 2 17.5 4.2 18 5.8 C18.5 4.2 19.5 2 23 2 C28.5 2 33 5.5 33 11 C33 22 18 32 18 32 Z"
          fill="url(#heartGradRed)"
          stroke="url(#heartStrokeGrad)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Curved Specular Highlight on Left Lobe (AAA glossy finish from screenshot) */}
        <path
          d="M9 7 C11.5 4.8 14.5 4.8 16 6.8 C13.5 7 11 9 9.5 12.5 C8.8 10.5 8.5 8.5 9 7 Z"
          fill="#ffffff"
          fillOpacity="0.85"
        />

        {/* Subtle Lower Right Reflected Rim Glow */}
        <ellipse
          cx="24"
          cy="18"
          rx="5"
          ry="3"
          fill="#ffffff"
          fillOpacity="0.2"
          transform="rotate(35 24 18)"
        />
      </svg>
    </div>
  );
});
