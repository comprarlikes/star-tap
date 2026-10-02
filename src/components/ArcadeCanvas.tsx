import React, { useEffect, useRef } from 'react';
import { Particle, FloatingText, BladePoint, SliceArc } from '../types';

interface ArcadeCanvasProps {
  particlesRef: React.MutableRefObject<Particle[]>;
  floatingTextsRef: React.MutableRefObject<FloatingText[]>;
  bladePointsRef?: React.MutableRefObject<BladePoint[]>;
  sliceArcsRef?: React.MutableRefObject<SliceArc[]>;
}

export const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({
  particlesRef,
  floatingTextsRef,
  bladePointsRef,
  sliceArcsRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Ambient 3D Volumetric Stardust system for AAA depth (Far, Mid, Near planes)
    const ambientStars: Array<{ x: number; y: number; z: number; size: number; speed: number; opacity: number; pulseSpeed: number; color: string }> = [];
    const starColors = ['#67e8f9', '#c084fc', '#fde047', '#38bdf8', '#f472b6', '#ffffff'];
    for (let i = 0; i < 48; i++) {
      const depth = Math.random(); // 0 (far) to 1 (near)
      ambientStars.push({
        x: Math.random(),
        y: Math.random(),
        z: depth,
        size: (depth * 2.2 + 0.6),
        speed: (depth * 0.00025 + 0.00008),
        opacity: (depth * 0.4 + 0.25),
        pulseSpeed: Math.random() * 0.002 + 0.001,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    // Constellation lines connecting star nodes (like in reference screenshot)
    const constellationNodes = [
      { x: 0.15, y: 0.22 },
      { x: 0.28, y: 0.18 },
      { x: 0.35, y: 0.30 },
      { x: 0.22, y: 0.38 },
      { x: 0.72, y: 0.15 },
      { x: 0.85, y: 0.24 },
      { x: 0.78, y: 0.40 },
      { x: 0.65, y: 0.34 },
      { x: 0.18, y: 0.72 },
      { x: 0.32, y: 0.65 },
      { x: 0.42, y: 0.78 },
      { x: 0.75, y: 0.68 },
      { x: 0.86, y: 0.76 },
      { x: 0.70, y: 0.84 },
    ];
    const constellationEdges: Array<[number, number]> = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Constellation Alpha
      [4, 5], [5, 6], [6, 7], [7, 4], // Constellation Beta
      [8, 9], [9, 10],                 // Constellation Gamma
      [11, 12], [12, 13],              // Constellation Delta
    ];

    const render = () => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();

      // 0. Ambient Cosmic Stardust & Constellations (High Performance AAA Depth)
      if (width > 0 && height > 0) {
        ctx.save();

        // 0A. Draw Constellation connecting lines
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let e = 0; e < constellationEdges.length; e++) {
          const [i1, i2] = constellationEdges[e];
          const p1 = constellationNodes[i1];
          const p2 = constellationNodes[i2];
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
        }
        ctx.stroke();
        ctx.setLineDash([]); // reset dash

        // 0B. Draw Constellation star vertices (fast batch render)
        ctx.fillStyle = '#bae6fd';
        for (let c = 0; c < constellationNodes.length; c++) {
          const node = constellationNodes[c];
          const pulse = 0.5 + 0.5 * Math.sin(now * 0.0015 + c);
          ctx.globalAlpha = 0.4 + pulse * 0.45;
          ctx.beginPath();
          ctx.arc(node.x * width, node.y * height, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // 0C. Drifting Ambient Stardust (fast batch render without gaussian blur cost)
        for (let i = 0; i < ambientStars.length; i++) {
          const st = ambientStars[i];
          st.y -= st.speed * 16;
          if (st.y < -0.05) st.y = 1.05;
          const currentAlpha = st.opacity * (0.6 + 0.4 * Math.sin(now * st.pulseSpeed + i));

          ctx.globalAlpha = Math.max(0.1, Math.min(0.8, currentAlpha));
          ctx.fillStyle = st.color;
          ctx.beginPath();
          ctx.arc(st.x * width, st.y * height, st.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 1. Render Neon Slicing Laser Cuts (Slice Arcs)
      if (sliceArcsRef && sliceArcsRef.current.length > 0) {
        const arcs = sliceArcsRef.current;
        // Cap max active arcs to prevent buildup
        if (arcs.length > 8) arcs.splice(0, arcs.length - 8);

        for (let i = arcs.length - 1; i >= 0; i--) {
          const arc = arcs[i];
          const age = now - arc.createdAt;
          if (age >= arc.duration) {
            arcs.splice(i, 1);
            continue;
          }

          const progress = age / arc.duration;
          const alpha = 1 - progress;
          const widthVal = Math.max(1.5, (1 - progress) * 8);

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.lineCap = 'round';

          // Outer Neon Glow Pass
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = widthVal * 1.6;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(arc.x1, arc.y1);
          ctx.lineTo(arc.x2, arc.y2);
          ctx.stroke();

          // Intense white laser core in slice center
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1.2, widthVal * 0.45);
          ctx.stroke();

          // End-point mini flashes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(arc.x1, arc.y1, widthVal * 0.5, 0, Math.PI * 2);
          ctx.arc(arc.x2, arc.y2, widthVal * 0.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // 2. Render Interactive Blade Swipe Trail (Ultra-Smooth High-FPS Bezier Polyline)
      if (bladePointsRef && bladePointsRef.current.length > 1) {
        const points = bladePointsRef.current;
        const maxBladeAge = 180; // ms

        // Filter out expired trail points
        while (points.length > 0 && now - points[0].time > maxBladeAge) {
          points.shift();
        }

        const len = points.length;
        if (len >= 2) {
          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Pass A: Chromatic Magenta Offset (Left/Top Shift)
          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(points[0].x - 1.5, points[0].y - 1.5);
          for (let i = 1; i < len; i++) {
            ctx.lineTo(points[i].x - 1.5, points[i].y - 1.5);
          }
          ctx.stroke();

          // Pass B: Chromatic Cyan Offset (Right/Bottom Shift)
          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(points[0].x + 1.5, points[0].y + 1.5);
          for (let i = 1; i < len; i++) {
            ctx.lineTo(points[i].x + 1.5, points[i].y + 1.5);
          }
          ctx.stroke();

          // Pass C: Primary Neon Blade Body
          const bladeColor = points[len - 1].color || '#38bdf8';
          ctx.globalAlpha = 0.85;
          ctx.strokeStyle = bladeColor;
          ctx.lineWidth = 6;
          ctx.shadowColor = bladeColor;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < len; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();

          // Pass D: White-Hot Laser Core (no blur for maximum render speed)
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.4;
          ctx.stroke();

          // Sizzling Spark at Blade Tip
          const tip = points[len - 1];
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // 3. Render Particles (High-Performance Pooled Drawing)
      const particles = particlesRef.current;
      // Cap max particles to ensure solid 60-120fps on any mobile or low-end GPU
      if (particles.length > 90) {
        particles.splice(0, particles.length - 90);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply 3D physics
        p.x += p.vx;
        p.y += p.vy;
        p.z = (p.z || 0) + (p.vz || 0);

        const drag = p.drag ?? 0.96;
        p.vx *= drag;
        p.vy *= drag;
        p.vy += p.gravity ?? 0.05;
        if (p.vz) p.vz *= 0.94;

        if (p.vRot) {
          p.rotation = (p.rotation || 0) + p.vRot;
        }

        // 3D perspective scale calculation
        const fov = 260;
        const scale3d = Math.max(0.35, fov / (fov + (p.z || 0)));
        const currentSize = Math.max(1, p.size * scale3d);

        if (p.shape === 'ring') {
          p.size += 2.6; // Expanding shockwave ring
        } else if (p.shape === 'smoke') {
          p.size += 0.35; // Expanding smoke puff
        }

        p.life += 1;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life >= p.maxLife || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const shape = p.shape || 'circle';
        ctx.globalAlpha = Math.max(0, p.alpha * Math.min(1.2, scale3d));

        if (shape === 'ring') {
          ctx.lineWidth = Math.max(1.5, Math.min(6, (1 - p.life / p.maxLife) * 6 * scale3d));
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, currentSize), 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0; // instantly reset
        } else if (shape === 'spark') {
          const speed = Math.hypot(p.vx, p.vy);
          const len = Math.max(currentSize * 2, speed * 4 * scale3d);
          const angle = Math.atan2(p.vy, p.vx);

          const startX = p.x;
          const startY = p.y;
          const endX = p.x - Math.cos(angle) * len;
          const endY = p.y - Math.sin(angle) * len;

          ctx.lineWidth = Math.max(1.5, currentSize * 0.9);
          ctx.strokeStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        } else if (shape === 'star') {
          const pointsCount = 4;
          const outerRadius = Math.max(1, currentSize);
          const innerRadius = outerRadius * 0.38;
          const rot = p.rotation || 0;

          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let pt = 0; pt < pointsCount * 2; pt++) {
            const r = pt % 2 === 0 ? outerRadius : innerRadius;
            const angle = rot + (pt * Math.PI) / pointsCount;
            const sx = p.x + Math.cos(angle) * r;
            const sy = p.y + Math.sin(angle) * r;
            if (pt === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (shape === 'smoke') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, currentSize), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, currentSize), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1; // reset alpha

      // 4. Render Floating Popup Text
      const texts = floatingTextsRef.current;
      if (texts.length > 12) {
        texts.splice(0, texts.length - 12);
      }
      for (let i = texts.length - 1; i >= 0; i--) {
        const ft = texts[i];
        const age = now - ft.createdAt;
        const maxAge = 850; // ms

        if (age >= maxAge) {
          texts.splice(i, 1);
          continue;
        }

        const progress = age / maxAge;
        const yOffset = Math.sin(progress * Math.PI * 0.5) * 55; // snappy elastic rise
        const alpha = 1 - Math.pow(progress, 2);
        const scale = progress < 0.2 ? 0.7 + (progress / 0.2) * 0.5 : 1.2 - (progress - 0.2) * 0.25;

        // 4. Render Floating Popup Text with 3D Bevel & Kinetic Pop
        const fontSize = Math.floor(24 * scale);
        const textY = ft.y - yOffset;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Pass A: Deep 3D Extrusion Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 5.5;
        ctx.strokeStyle = '#020617';
        ctx.strokeText(ft.text, ft.x, textY + 2);

        // Pass B: Outer Glow Ring matching text color
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 16;
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeText(ft.text, ft.x, textY);

        // Pass C: Inner Gradient Fill
        const isGolden = ft.color.includes('facc15') || ft.color.includes('amber') || ft.color.includes('yellow');
        if (isGolden) {
          const textGrad = ctx.createLinearGradient(ft.x, textY - fontSize * 0.5, ft.x, textY + fontSize * 0.5);
          textGrad.addColorStop(0, '#ffffff');
          textGrad.addColorStop(0.35, '#fde047');
          textGrad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = textGrad;
        } else {
          ctx.fillStyle = ft.color;
        }
        ctx.fillText(ft.text, ft.x, textY);

        // Pass D: Lens flare sparkle on start of text popup
        if (progress < 0.25) {
          const flareAlpha = (1 - progress / 0.25) * 0.8;
          ctx.globalAlpha = flareAlpha;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ft.x - fontSize * 0.8, textY - fontSize * 0.3, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [particlesRef, floatingTextsRef, bladePointsRef, sliceArcsRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 w-full h-full"
    />
  );
};
