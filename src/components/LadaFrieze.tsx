import React from 'react';

interface LadaFriezeProps {
  className?: string;
  width?: string | number;
  height?: number;
  repeatCount?: number;
}

/**
 * Iconic Josef Lada scalloped folk frieze (lidový obloučkový vlys).
 * Inspired directly by the bottom border of "Bubáci a hastrmani" (Práce edition):
 * Semicircular arches with bold black ink contours, red outer band,
 * cream/white inner crescent, and red center dot/arch.
 */
export const LadaFrieze: React.FC<LadaFriezeProps> = ({
  className = '',
  width = '100%',
  height = 24,
  repeatCount = 18,
}) => {
  const scallopW = 32;
  const scallopH = 20;
  const totalW = repeatCount * scallopW;

  return (
    <div
      className={`lada-frieze-wrap flex justify-center items-center overflow-hidden select-none pointer-events-none ${className}`}
      style={{ width, height: `${height}px`, margin: '4px auto' }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${totalW} ${scallopH}`}
        style={{ width: '100%', height: '100%', maxWidth: `${totalW}px` }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <g id="lada-scallop-unit">
            {/* Outer black contour */}
            <path
              d="M 1,18 C 1,7 8,1 16,1 C 24,1 31,7 31,18"
              fill="none"
              stroke="#1C1610"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Red main arch */}
            <path
              d="M 2.5,17 C 2.5,8.5 8.5,3 16,3 C 23.5,3 29.5,8.5 29.5,17 Z"
              fill="#C53026"
            />
            {/* Cream / white inner crescent */}
            <path
              d="M 6.5,17 C 6.5,11.5 10.8,7.5 16,7.5 C 21.2,7.5 25.5,11.5 25.5,17 Z"
              fill="#FAF5E8"
              stroke="#1C1610"
              strokeWidth="1.8"
            />
            {/* Red center half-dot */}
            <ellipse
              cx="16"
              cy="16.5"
              rx="4.5"
              ry="4"
              fill="#C53026"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            {/* Small black ink center dot */}
            <circle cx="16" cy="16.5" r="1.5" fill="#1C1610" />
          </g>
        </defs>

        {Array.from({ length: repeatCount }).map((_, i) => (
          <use key={i} href="#lada-scallop-unit" x={i * scallopW} y="0" />
        ))}
      </svg>
    </div>
  );
};
