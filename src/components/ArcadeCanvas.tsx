import React, { useEffect, useRef } from 'react';
import { Particle, FloatingText } from '../types';

interface ArcadeCanvasProps {
  particlesRef: React.MutableRefObject<Particle[]>;
  floatingTextsRef: React.MutableRefObject<FloatingText[]>;
}

export const ArcadeCanvas: React.FC<ArcadeCanvasProps> = ({
  particlesRef,
  floatingTextsRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Particles
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
          p.size += 2.2; // Expanding shockwave ring
        } else if (p.shape === 'smoke') {
          p.size += 0.3; // Expanding smoke puff
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
          ctx.lineWidth = Math.max(1.5, Math.min(7, (1 - p.life / p.maxLife) * 6));
          ctx.strokeStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.stroke();
        } else if (shape === 'spark') {
          const speed = Math.hypot(p.vx, p.vy);
          const len = Math.max(p.size * 2, speed * 3.8);
          const angle = Math.atan2(p.vy, p.vx);
          
          const startX = p.x;
          const startY = p.y;
          const endX = p.x - Math.cos(angle) * len;
          const endY = p.y - Math.sin(angle) * len;

          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, p.color);
          grad.addColorStop(1, 'transparent');

          ctx.lineWidth = Math.max(1.5, p.size * 0.85);
          ctx.strokeStyle = grad;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 0;
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
          ctx.shadowBlur = 0;
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
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // Render Floating Text
      const texts = floatingTextsRef.current;
      const now = Date.now();
      for (let i = texts.length - 1; i >= 0; i--) {
        const ft = texts[i];
        const age = now - ft.createdAt;
        const maxAge = 800; // ms

        if (age >= maxAge) {
          texts.splice(i, 1);
          continue;
        }

        const progress = age / maxAge;
        const yOffset = progress * 45; // float upwards
        const alpha = 1 - progress;
        const scale = 1 + progress * 0.4;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = `bold ${Math.floor(22 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(ft.text, ft.x, ft.y - yOffset);
        ctx.fillText(ft.text, ft.x, ft.y - yOffset);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [particlesRef, floatingTextsRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-30 w-full h-full"
    />
  );
};
