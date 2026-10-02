import React from 'react';
import { StarType } from '../types';

interface CelestialStarGraphicProps {
  type: StarType;
  size: number;
  isTapped?: boolean;
}

export const CelestialStarGraphic: React.FC<CelestialStarGraphicProps> = React.memo(({
  type,
  size,
  isTapped = false,
}) => {
  const beamHeight = Math.max(100, Math.round(size * 2.2));
  const beamWidth = Math.max(28, Math.round(size * 0.7));

  // Render vertical light beam (falling star meteor tail)
  const renderBeam = () => {
    switch (type) {
      case 'freeze':
        return (
          <div
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-end overflow-visible"
            style={{ height: `${beamHeight}px`, width: `${beamWidth}px` }}
          >
            {/* Frosty Cyan Vertical Light Beam */}
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to top, rgba(56, 189, 248, 0.75) 0%, rgba(186, 230, 253, 0.4) 40%, rgba(56, 189, 248, 0.12) 75%, transparent 100%)',
                filter: 'blur(1.5px)',
                borderRadius: '9999px 9999px 0 0',
              }}
            />
            {/* White-Hot Core Ray */}
            <div
              className="absolute inset-x-[32%] bottom-0 h-4/5"
              style={{
                background: 'linear-gradient(to top, #ffffff 0%, rgba(224, 242, 254, 0.8) 35%, transparent 100%)',
                filter: 'blur(0.5px)',
                borderRadius: '9999px',
              }}
            />
            {/* Drifting Ice Sparkles */}
            <div className="absolute bottom-6 -left-2 w-1.5 h-1.5 rounded-full bg-cyan-100 shadow-[0_0_6px_#38bdf8] animate-pulse" />
            <div className="absolute bottom-14 right-[-4px] w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#38bdf8] animate-ping" style={{ animationDuration: '1.8s' }} />
            <div className="absolute bottom-24 left-1 w-1 h-1 rounded-full bg-cyan-200 shadow-[0_0_4px_#38bdf8]" />
          </div>
        );

      case 'rainbow':
        return (
          <div
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-end overflow-visible"
            style={{ height: `${beamHeight * 1.15}px`, width: `${beamWidth * 1.1}px` }}
          >
            {/* Prismatic Rainbow Vertical Light Beam */}
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to top, rgba(236, 72, 153, 0.8) 0%, rgba(250, 204, 21, 0.65) 28%, rgba(56, 189, 248, 0.5) 60%, rgba(168, 85, 247, 0.15) 85%, transparent 100%)',
                filter: 'blur(1.5px)',
                borderRadius: '9999px 9999px 0 0',
              }}
            />
            {/* Core Rainbow Laser Ray */}
            <div
              className="absolute inset-x-[30%] bottom-0 h-5/6"
              style={{
                background: 'linear-gradient(to top, #ffffff 0%, rgba(254, 240, 138, 0.85) 30%, rgba(244, 114, 182, 0.5) 65%, transparent 100%)',
                filter: 'blur(0.5px)',
                borderRadius: '9999px',
              }}
            />
            {/* Rainbow Sparkle Specks */}
            <div className="absolute bottom-8 -left-3 w-2 h-2 rounded-full bg-pink-300 shadow-[0_0_8px_#ec4899] animate-bounce" />
            <div className="absolute bottom-16 right-[-6px] w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#facc15] animate-pulse" />
            <div className="absolute bottom-28 left-0 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#38bdf8]" />
          </div>
        );

      case 'diamond':
        return (
          <div
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-end overflow-visible"
            style={{ height: `${beamHeight}px`, width: `${beamWidth}px` }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to top, rgba(56, 189, 248, 0.85) 0%, rgba(96, 165, 250, 0.45) 45%, rgba(147, 197, 253, 0.1) 80%, transparent 100%)',
                filter: 'blur(1.5px)',
                borderRadius: '9999px 9999px 0 0',
              }}
            />
            <div
              className="absolute inset-x-[30%] bottom-0 h-4/5"
              style={{
                background: 'linear-gradient(to top, #ffffff 0%, rgba(186, 230, 253, 0.9) 35%, transparent 100%)',
                filter: 'blur(0.5px)',
                borderRadius: '9999px',
              }}
            />
            <div className="absolute bottom-10 -right-2 w-1.5 h-1.5 rounded-full bg-cyan-100 shadow-[0_0_8px_#38bdf8] animate-ping" />
          </div>
        );

      case 'bomb':
        return (
          <div
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-end overflow-visible"
            style={{ height: `${beamHeight * 0.8}px`, width: `${beamWidth * 0.9}px` }}
          >
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to top, rgba(239, 68, 68, 0.8) 0%, rgba(249, 115, 22, 0.35) 45%, transparent 100%)',
                filter: 'blur(2px)',
                borderRadius: '9999px 9999px 0 0',
              }}
            />
            <div className="absolute bottom-6 left-[-2px] w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444] animate-pulse" />
          </div>
        );

      default:
        // Warm Golden Shooting Star Beam (Normal, Golden, Supernova, etc.)
        return (
          <div
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center justify-end overflow-visible"
            style={{ height: `${beamHeight}px`, width: `${beamWidth}px` }}
          >
            {/* Outer Golden Glow Envelope */}
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(to top, rgba(250, 204, 21, 0.85) 0%, rgba(245, 158, 11, 0.5) 35%, rgba(251, 191, 36, 0.15) 75%, transparent 100%)',
                filter: 'blur(1.5px)',
                borderRadius: '9999px 9999px 0 0',
              }}
            />
            {/* Core White-Gold Luminous Filament */}
            <div
              className="absolute inset-x-[30%] bottom-0 h-4/5"
              style={{
                background: 'linear-gradient(to top, #ffffff 0%, rgba(254, 240, 138, 0.9) 30%, rgba(250, 204, 21, 0.3) 70%, transparent 100%)',
                filter: 'blur(0.5px)',
                borderRadius: '9999px',
              }}
            />
            {/* Golden Star Sparkles Floating in Trail */}
            <div className="absolute bottom-6 -left-2.5 w-1.5 h-1.5 rounded-full bg-yellow-200 shadow-[0_0_8px_#fde047] animate-pulse" />
            <div className="absolute bottom-16 right-[-5px] w-2 h-2 rounded-full bg-amber-100 shadow-[0_0_10px_#f59e0b] animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute bottom-28 left-0.5 w-1 h-1 rounded-full bg-yellow-300 shadow-[0_0_5px_#facc15]" />
          </div>
        );
    }
  };

  // Render Star Vector Art
  const renderStarArt = () => {
    switch (type) {
      case 'freeze':
        // Ice Star: Sculpted crystalline ice star with frozen cyan facets and dripping icicles
        return (
          <svg
            viewBox="0 0 100 115"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_16px_rgba(56,189,248,0.6)]"
          >
            <defs>
              <linearGradient id="iceBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="iceFacetLight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="iceFacetShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0369a1" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#082f49" stopOpacity="0.75" />
              </linearGradient>
              <linearGradient id="icicleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Dripping Icicles at bottom points */}
            <polygon points="22,70 20,96 26,72" fill="url(#icicleGrad)" />
            <polygon points="50,68 49,112 53,70" fill="url(#icicleGrad)" />
            <polygon points="78,70 80,98 74,72" fill="url(#icicleGrad)" />

            {/* Outer Frozen Rim */}
            <path
              d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
              fill="url(#iceBase)"
              stroke="#e0f2fe"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Facet Ridges (Center point is at 50, 52) */}
            {/* Top Light Facet */}
            <polygon points="50,4 50,52 62,36" fill="url(#iceFacetLight)" />
            <polygon points="50,4 50,52 38,36" fill="#ffffff" fillOpacity="0.85" />

            {/* Upper Right Facets */}
            <polygon points="97,38 50,52 62,36" fill="#bae6fd" fillOpacity="0.7" />
            <polygon points="97,38 50,52 69,60" fill="url(#iceFacetShadow)" />

            {/* Bottom Right Facets */}
            <polygon points="79,94 50,52 69,60" fill="#0284c7" fillOpacity="0.6" />
            <polygon points="79,94 50,52 50,74" fill="url(#iceFacetShadow)" />

            {/* Bottom Left Facets */}
            <polygon points="21,94 50,52 50,74" fill="url(#iceFacetShadow)" />
            <polygon points="21,94 50,52 31,60" fill="#0369a1" fillOpacity="0.5" />

            {/* Upper Left Facets */}
            <polygon points="3,38 50,52 31,60" fill="url(#iceFacetLight)" fillOpacity="0.75" />
            <polygon points="3,38 50,52 38,36" fill="#e0f2fe" fillOpacity="0.9" />

            {/* Top Crystal Sheen Highlight */}
            <ellipse cx="50" cy="22" rx="6" ry="12" fill="#ffffff" fillOpacity="0.65" transform="rotate(-15 50 22)" />

            {/* Ice Sparkle Core Star */}
            <polygon
              points="50,44 52,50 58,52 52,54 50,60 48,54 42,52 48,50"
              fill="#ffffff"
              filter="drop-shadow(0 0 4px #38bdf8)"
            />
          </svg>
        );

      case 'rainbow':
        // Rainbow Star: Vibrant 5-pointed star with shimmering prismatic spectrum and central flare
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_18px_rgba(236,72,153,0.7)]"
          >
            <defs>
              <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="25%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="75%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="rainbowFacet" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Star Body */}
            <path
              d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
              fill="url(#rainbowGrad)"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Prismatic Highlight Facets */}
            <polygon points="50,4 50,52 38,36" fill="url(#rainbowFacet)" />
            <polygon points="3,38 50,52 38,36" fill="#ffffff" fillOpacity="0.4" />
            <polygon points="97,38 50,52 62,36" fill="#ffffff" fillOpacity="0.3" />

            {/* Center Supernova Prismatic Diamond */}
            <polygon
              points="50,38 54,48 64,52 54,56 50,66 46,56 36,52 46,48"
              fill="#ffffff"
              filter="drop-shadow(0 0 8px #ffffff)"
            />
          </svg>
        );

      case 'diamond':
        // Diamond Star: Electric sapphire gem cut
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_16px_rgba(56,189,248,0.7)]"
          >
            <defs>
              <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <path
              d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
              fill="url(#diamondGrad)"
              stroke="#bae6fd"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Diamond Gem Facets */}
            <polygon points="50,4 50,52 38,36" fill="#ffffff" fillOpacity="0.8" />
            <polygon points="50,4 50,52 62,36" fill="#7dd3fc" fillOpacity="0.6" />
            <polygon points="97,38 50,52 69,60" fill="#1e40af" fillOpacity="0.6" />
            <polygon points="79,94 50,52 50,74" fill="#0f172a" fillOpacity="0.5" />
            <polygon points="21,94 50,52 50,74" fill="#1e3a8a" fillOpacity="0.6" />
            <polygon points="3,38 50,52 31,60" fill="#38bdf8" fillOpacity="0.5" />

            <circle cx="50" cy="52" r="6" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
          </svg>
        );

      case 'bomb':
        // Bomb Hazard: Spiked cosmic dark sphere with burning fuse
        return (
          <svg
            viewBox="0 0 100 105"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_16px_rgba(239,68,68,0.7)]"
          >
            <defs>
              <radialGradient id="bombBody" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="40%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              <linearGradient id="fuseBurn" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>

            {/* Burning Fuse at top */}
            <path
              d="M50 24 C50 14, 62 12, 66 4"
              stroke="#fbbf24"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Spark Flare */}
            <circle cx="67" cy="3" r="4.5" fill="#fef08a" filter="drop-shadow(0 0 6px #ef4444)" />

            {/* Cap */}
            <rect x="42" y="22" width="16" height="7" rx="2" fill="#64748b" stroke="#334155" />

            {/* Main Bomb Sphere */}
            <circle cx="50" cy="62" r="36" fill="url(#bombBody)" stroke="#ef4444" strokeWidth="2.5" />

            {/* Specular Highlight */}
            <ellipse cx="38" cy="46" rx="9" ry="5" fill="#ffffff" fillOpacity="0.4" transform="rotate(-25 38 46)" />

            {/* Danger Crossbones/Skull Icon */}
            <text
              x="50"
              y="71"
              fontSize="24"
              textAnchor="middle"
              fill="#ef4444"
              filter="drop-shadow(0 0 6px #ef4444)"
            >
              💀
            </text>
          </svg>
        );

      case 'supernova':
        // Supernova Star: Solar corona flare with radiant heat
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_20px_rgba(244,63,94,0.8)]"
          >
            <defs>
              <radialGradient id="supernovaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#be123c" />
              </radialGradient>
            </defs>
            <path
              d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
              fill="url(#supernovaGrad)"
              stroke="#fecdd3"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polygon points="50,4 50,52 38,36" fill="#ffffff" fillOpacity="0.9" />
            <circle cx="50" cy="52" r="10" fill="#ffffff" filter="drop-shadow(0 0 10px #f43f5e)" />
          </svg>
        );

      case 'multiplier2':
      case 'multiplier5': {
        const text = type === 'multiplier5' ? 'x5' : 'x2';
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_16px_rgba(168,85,247,0.7)]"
          >
            <defs>
              <linearGradient id="multiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
            </defs>
            <path
              d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
              fill="url(#multiGrad)"
              stroke="#f5d0fe"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <polygon points="50,4 50,52 38,36" fill="#ffffff" fillOpacity="0.75" />
            <circle cx="50" cy="52" r="18" fill="#1e1b4b" stroke="#f472b6" strokeWidth="2" />
            <text
              x="50"
              y="59"
              fontSize="20"
              fontWeight="900"
              textAnchor="middle"
              fill="#fde047"
              filter="drop-shadow(0 0 6px #facc15)"
            >
              {text}
            </text>
          </svg>
        );
      }

      default:
        // Golden Star (Normal & Golden): Crisp 3D Beveled Plump Star matching screenshot
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full overflow-visible drop-shadow-[0_8px_18px_rgba(245,158,11,0.65)]"
          >
            <defs>
              {/* Rich Golden Yellow Gradient */}
              <linearGradient id="goldBase" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="65%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Specular Light Reflection Facet */}
              <linearGradient id="goldLightFacet" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.45" />
              </linearGradient>

              {/* Dark Facet Shadow for Deep 3D Emboss */}
              <linearGradient id="goldShadowFacet" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0.75" />
              </linearGradient>

              {/* Rim Glow */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Star Silhouette with Rounded Corners */}
            <path
              d="M50 4 L62 36 L97 38 L69 60 L79 94 L50 74 L21 94 L31 60 L3 38 L38 36 Z"
              fill="url(#goldBase)"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* 3D Facet Geometry radiating from center (50, 52) */}
            {/* Top Light Tip Facet (Left side) */}
            <polygon points="50,4 50,52 38,36" fill="url(#goldLightFacet)" />
            {/* Top Right Tip Facet */}
            <polygon points="50,4 50,52 62,36" fill="#fde047" fillOpacity="0.8" />

            {/* Upper Right Point Facet */}
            <polygon points="97,38 50,52 62,36" fill="#fef08a" fillOpacity="0.85" />
            <polygon points="97,38 50,52 69,60" fill="url(#goldShadowFacet)" />

            {/* Bottom Right Point Facet */}
            <polygon points="79,94 50,52 69,60" fill="#d97706" fillOpacity="0.7" />
            <polygon points="79,94 50,52 50,74" fill="url(#goldShadowFacet)" />

            {/* Bottom Left Point Facet */}
            <polygon points="21,94 50,52 50,74" fill="url(#goldShadowFacet)" />
            <polygon points="21,94 50,52 31,60" fill="#b45309" fillOpacity="0.6" />

            {/* Upper Left Point Facet */}
            <polygon points="3,38 50,52 31,60" fill="url(#goldLightFacet)" fillOpacity="0.75" />
            <polygon points="3,38 50,52 38,36" fill="#fef08a" fillOpacity="0.9" />

            {/* Curved Specular Highlight on Upper Left Point */}
            <ellipse
              cx="44"
              cy="24"
              rx="6"
              ry="14"
              fill="#ffffff"
              fillOpacity="0.65"
              transform="rotate(-20 44 24)"
            />

            {/* Center Apex Sparkle Glint */}
            <circle cx="50" cy="52" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 5px #ffffff)" />
          </svg>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none pointer-events-none">
      {/* 1. Vertical Light Beam Streaming Upwards / Meteor Trail */}
      {renderBeam()}

      {/* 2. Soft Glowing Circular Aura Ring (as seen around the tapped +50pts star in screenshot) */}
      <div
        className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
          isTapped
            ? 'scale-125 opacity-90'
            : type === 'golden' || type === 'rainbow' || type === 'supernova'
            ? 'scale-105 opacity-60 animate-pulse'
            : 'scale-100 opacity-40'
        }`}
        style={{
          inset: '-10px',
          background:
            type === 'freeze'
              ? 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(56, 189, 248, 0) 70%)'
              : type === 'rainbow'
              ? 'radial-gradient(circle, rgba(236, 72, 153, 0.45) 0%, rgba(56, 189, 248, 0) 70%)'
              : type === 'diamond'
              ? 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, rgba(96, 165, 250, 0) 70%)'
              : type === 'bomb'
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%)'
              : 'radial-gradient(circle, rgba(250, 204, 21, 0.45) 0%, rgba(245, 158, 11, 0) 70%)',
        }}
      />

      {/* 3. Golden Aura Ring Outline for Golden & Rainbow stars */}
      {(type === 'golden' || type === 'rainbow' || isTapped) && (
        <div
          className="absolute inset-[-4px] rounded-full border border-amber-300/40 pointer-events-none animate-spin"
          style={{ animationDuration: '10s' }}
        />
      )}

      {/* 4. The 3D Vector Star Asset */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {renderStarArt()}
      </div>
    </div>
  );
});
