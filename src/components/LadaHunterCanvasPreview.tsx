import React, { useEffect, useRef } from 'react';
import { Lada } from '../render/ladaRenderer';

interface LadaHunterCanvasPreviewProps {
  hunterId: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  filter?: string;
}

export const LadaHunterCanvasPreview: React.FC<LadaHunterCanvasPreviewProps> = ({
  hunterId,
  size = 140,
  className = '',
  style = {},
  filter = 'none',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const time = (performance.now() - startTime) / 1000;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Radial background matching parchment cards
      const bgGrad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.8,
        width * 0.05,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      bgGrad.addColorStop(0, '#FDF3DB');
      bgGrad.addColorStop(0.8, '#F5E6CA');
      bgGrad.addColorStop(1, '#E7D7B6');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Character ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.82, width * 0.28, height * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw character based on ID
      const cx = width * 0.5;
      const cy = height * 0.62;
      const scale = size / 140;

      const id = hunterId.toLowerCase();
      if (id === 'krajanek') {
        Lada.drawKrajanek(ctx, cx, cy, time, 0, 0, false, scale);
      } else if (id === 'wanderer' || id === 'tulak' || id === 'poutnik') {
        Lada.drawWanderer(ctx, cx, cy, time, 0, 0, false, scale);
      } else if (id === 'shepherd' || id === 'pasacek') {
        Lada.drawShepherd(ctx, cx, cy, time, 0, 0, false, scale, false);
      } else if (id === 'korenarka') {
        Lada.drawKorenarka(ctx, cx, cy, time, 0, 0, false, scale);
      } else if (id === 'watchman' || id === 'ponocny') {
        Lada.drawWatchman(ctx, cx, cy, time, 0, 0, false, scale);
      } else if (id === 'sexton' || id === 'kostelnik') {
        Lada.drawSexton(ctx, cx, cy, time, 0, 0, false, scale, false);
      } else if (id === 'granny' || id === 'babicka') {
        Lada.drawGranny(ctx, cx, cy, time, 0, 0, false, scale, true, false);
      } else {
        Lada.drawWanderer(ctx, cx, cy, time, 0, 0, false, scale);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [hunterId, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '8px',
        border: '2px solid var(--ink, #2D1C0E)',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.1)',
        filter,
        ...style,
      }}
    />
  );
};
