import React, { useEffect, useRef } from 'react';
import { Lada } from '../render/ladaRenderer';

export interface LadaGrandfatherCanvasPreviewProps {
  size?: number;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  isInteracting?: boolean;
  isMoving?: boolean;
  facingDir?: number;
  scale?: number;
  onClick?: () => void;
}

export const LadaGrandfatherCanvasPreview: React.FC<LadaGrandfatherCanvasPreviewProps> = ({
  size = 140,
  width: customWidth,
  height: customHeight,
  className = '',
  style = {},
  isInteracting = false,
  isMoving = false,
  facingDir = 1,
  scale: customScale,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const w = customWidth || size;
  const h = customHeight || size;
  const defaultScale = (Math.min(w, h) / 140) * 1.05;
  const scale = customScale ?? defaultScale;

  useEffect(() => {
    let animId: number;
    const startTime = performance.now();

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const time = (performance.now() - startTime) / 1000;
      ctx.clearRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.54;

      Lada.drawGrandfather(
        ctx,
        cx,
        cy,
        time,
        0,
        isMoving,
        facingDir,
        isInteracting,
        scale
      );

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [w, h, scale, isMoving, isInteracting, facingDir]);

  return (
    <canvas
      ref={canvasRef}
      width={w}
      height={h}
      className={className}
      onClick={onClick}
      style={{
        display: 'block',
        ...style,
      }}
    />
  );
};
