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

    // Ambient Stardust system for AAA depth
    const ambientStars: Array<{ x: number; y: number; size: number; speed: number; opacity: number; pulseSpeed: number; color: string }> = [];
    const starColors = ['#67e8f9', '#c084fc', '#fde047', '#38bdf8', '#f472b6'];
    for (let i = 0; i < 35; i++) {
      ambientStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 0.00015 + 0.00005,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.002 + 0.001,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    const render = () => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();

      // 0. Ambient Cosmic Stardust (AAA visual depth)
      if (width > 0 && height > 0) {
        ctx.save();
        for (let i = 0; i < ambientStars.length; i++) {
          const st = ambientStars[i];
          st.y -= st.speed * 16;
          if (st.y < -0.05) st.y = 1.05;
          const currentAlpha = st.opacity * (0.6 + 0.4 * Math.sin(now * st.pulseSpeed + i));

          ctx.globalAlpha = Math.max(0.1, Math.min(0.8, currentAlpha));
          ctx.fillStyle = st.color;
          ctx.shadowColor = st.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(st.x * width, st.y * height, st.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 1. Render Neon Slicing Laser Cuts (Slice Arcs)
      if (sliceArcsRef && sliceArcsRef.current.length > 0) {
        const arcs = sliceArcsRef.current;
        for (let i = arcs.length - 1; i >= 0; i--) {
          const arc = arcs[i];
          const age = now - arc.createdAt;
          if (age >= arc.duration) {
            arcs.splice(i, 1);
            continue;
          }

          const progress = age / arc.duration;
          const alpha = 1 - progress;
          const width = Math.max(1, (1 - progress) * 8);

          ctx.save();
          ctx.globalAlpha = alpha;
          
          // Outer Neon Glow Pass
          ctx.strokeStyle = arc.color;
          ctx.lineWidth = width * 1.5;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 18;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(arc.x1, arc.y1);
          ctx.lineTo(arc.x2, arc.y2);
          ctx.stroke();

          // Intense white laser core in the slice center
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, width * 0.45);
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.stroke();

          // End-point mini flashes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(arc.x1, arc.y1, width * 0.6, 0, Math.PI * 2);
          ctx.arc(arc.x2, arc.y2, width * 0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }

      // 2. Render Interactive Blade Swipe Trail with Chromatic Aberration & Laser Core
      if (bladePointsRef && bladePointsRef.current.length > 1) {
        const points = bladePointsRef.current;
        const maxBladeAge = 200; // ms

        // Filter out expired trail points
        while (points.length > 0 && now - points[0].time > maxBladeAge) {
          points.shift();
        }

        if (points.length >= 2) {
          ctx.save();

          // Pass A: Chromatic Red/Magenta Offset (Left/Top Shift)
          ctx.save();
          for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const age = now - p1.time;
            const normAge = Math.max(0, Math.min(1, 1 - age / maxBladeAge));
            const width = (i / points.length) * 7 * normAge;
            ctx.globalAlpha = normAge * 0.4;
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = Math.max(1, width * 1.2);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p0.x - 1.5, p0.y - 1.5);
            ctx.lineTo(p1.x - 1.5, p1.y - 1.5);
            ctx.stroke();
          }
          ctx.restore();

          // Pass B: Chromatic Cyan/Blue Offset (Right/Bottom Shift)
          ctx.save();
          for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const age = now - p1.time;
            const normAge = Math.max(0, Math.min(1, 1 - age / maxBladeAge));
            const width = (i / points.length) * 7 * normAge;
            ctx.globalAlpha = normAge * 0.4;
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = Math.max(1, width * 1.2);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p0.x + 1.5, p0.y + 1.5);
            ctx.lineTo(p1.x + 1.5, p1.y + 1.5);
            ctx.stroke();
          }
          ctx.restore();

          // Pass C: Primary Neon Blade Body
          for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const age = now - p1.time;
            const normAge = Math.max(0, Math.min(1, 1 - age / maxBladeAge));
            const width = (i / points.length) * 9 * normAge;
            const alpha = normAge * 0.95;

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = p1.color || '#38bdf8';
            ctx.lineWidth = Math.max(1, width);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = p1.color || '#38bdf8';
            ctx.shadowBlur = 14;

            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();

            // Inner White Laser Core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(0.75, width * 0.4);
            ctx.stroke();
          }

          // Sizzling Sparks at Blade Tip
          const tip = points[points.length - 1];
          if (tip) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = tip.color || '#38bdf8';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 3. Render Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.x += p.vx;
        p.y += p.vy;

        const drag = p.drag ?? 0.96;
        p.vx *= drag;
        p.vy *= drag;
        p.vy += p.gravity ?? 0.05;

        if (p.vRot) {
          p.rotation = (p.rotation || 0) + p.vRot;
        }

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

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        const shape = p.shape || 'circle';

        if (shape === 'ring') {
          ctx.lineWidth = Math.max(1.5, Math.min(8, (1 - p.life / p.maxLife) * 7));
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.stroke();
        } else if (shape === 'spark') {
          const speed = Math.hypot(p.vx, p.vy);
          const len = Math.max(p.size * 2, speed * 4.2);
          const angle = Math.atan2(p.vy, p.vx);
          
          const startX = p.x;
          const startY = p.y;
          const endX = p.x - Math.cos(angle) * len;
          const endY = p.y - Math.sin(angle) * len;

          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, p.color);
          grad.addColorStop(1, 'transparent');

          ctx.lineWidth = Math.max(1.5, p.size * 0.9);
          ctx.strokeStyle = grad;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        } else if (shape === 'star') {
          const points = 4;
          const outerRadius = Math.max(1, p.size);
          const innerRadius = outerRadius * 0.38;
          const rot = p.rotation || 0;

          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          for (let pt = 0; pt < points * 2; pt++) {
            const r = pt % 2 === 0 ? outerRadius : innerRadius;
            const angle = rot + (pt * Math.PI) / points;
            const sx = p.x + Math.cos(angle) * r;
            const sy = p.y + Math.sin(angle) * r;
            if (pt === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (shape === 'smoke') {
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 4. Render Floating Popup Text
      const texts = floatingTextsRef.current;
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
