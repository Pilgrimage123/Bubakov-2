import React from 'react';

interface LadaFriezeProps {
  className?: string;
  width?: string | number;
  height?: number;
  repeatCount?: number;
}

const FRIEZE_ANIM_STYLES = `
  @keyframes ladaFriezeRipple {
    0%, 100% {
      transform: translateY(0px) scaleY(1);
    }
    50% {
      transform: translateY(-2.4px) scaleY(1.09);
    }
  }
  @keyframes ladaFriezeFlowerBloom {
    0%, 100% {
      transform: rotate(-12deg) scale(0.92);
    }
    50% {
      transform: rotate(14deg) scale(1.12);
    }
  }
  .lada-scallop-anim {
    transform-box: fill-box;
    transform-origin: center bottom;
    animation: ladaFriezeRipple 2.4s ease-in-out infinite;
  }
  .lada-frieze-flower {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaFriezeFlowerBloom 3s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-scallop-anim, .lada-frieze-flower {
      animation: none !important;
    }
  }
`;

const SCALLOP_PALETTES = [
  { arch: '#E6392B', stripe: '#FACC15', petal: '#38BDF8', core: '#FACC15' },
  { arch: '#2563EB', stripe: '#FACC15', petal: '#E11D48', core: '#FEF08A' },
  { arch: '#E11D48', stripe: '#FEF08A', petal: '#FACC15', core: '#E6392B' },
  { arch: '#16A34A', stripe: '#FACC15', petal: '#FFFDF7', core: '#F59E0B' },
];

/**
 * Iconic Josef Lada scalloped folk frieze (lidový obloučkový vlys)
 * with a playful rippling wave, alternating Czech village colors, and blooming little flowers.
 */
export const LadaFrieze: React.FC<LadaFriezeProps> = ({
  className = '',
  width = '100%',
  height = 24,
  repeatCount = 18,
}) => {
  const scallopW = 32;
  const scallopH = 22;
  const totalW = repeatCount * scallopW;

  return (
    <div
      className={`lada-frieze-wrap flex justify-center items-center overflow-visible select-none pointer-events-none ${className}`}
      style={{ width, height: `${height}px`, margin: '4px auto' }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 -3 ${totalW} ${scallopH}`}
        style={{ width: '100%', height: '100%', maxWidth: `${totalW}px`, overflow: 'visible' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <style>{FRIEZE_ANIM_STYLES}</style>

        {Array.from({ length: repeatCount }).map((_, i) => {
          const pal = SCALLOP_PALETTES[i % SCALLOP_PALETTES.length];
          const xOffset = i * scallopW;
          return (
            <g
              key={i}
              className="lada-scallop-anim"
              style={{ animationDelay: `${(i * 0.11).toFixed(2)}s` }}
            >
              <g transform={`translate(${xOffset}, 0)`}>
                {/* Outer black contour */}
                <path
                  d="M 1,18 C 1,7 8,1 16,1 C 24,1 31,7 31,18"
                  fill="none"
                  stroke="#1C1610"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* Main colorful arch */}
                <path
                  d="M 2.5,17 C 2.5,8.5 8.5,3 16,3 C 23.5,3 29.5,8.5 29.5,17 Z"
                  fill={pal.arch}
                />
                {/* Inner golden ribbon stripe */}
                <path
                  d="M 4.8,17 C 4.8,10.2 9.8,5.4 16,5.4 C 22.2,5.4 27.2,10.2 27.2,17 Z"
                  fill={pal.stripe}
                  stroke="#1C1610"
                  strokeWidth="1.2"
                />
                {/* Warm Cream inner crescent */}
                <path
                  d="M 7.2,17 C 7.2,12 11.2,8.2 16,8.2 C 20.8,8.2 24.8,12 24.8,17 Z"
                  fill="#FFFDF7"
                  stroke="#1C1610"
                  strokeWidth="1.5"
                />
                {/* Tiny animated folk flower inside each arch */}
                <g transform="translate(16, 14.8)">
                  <g
                    className="lada-frieze-flower"
                    style={{ animationDelay: `${(i * 0.15).toFixed(2)}s` }}
                  >
                    {[0, 72, 144, 216, 288].map((deg) => (
                      <path
                        key={deg}
                        transform={`rotate(${deg})`}
                        d="M 0,0 C -1.5,-1.8 -1.7,-3.9 0,-4.3 C 1.7,-3.9 1.5,-1.8 0,0 Z"
                        fill={pal.petal}
                        stroke="#1C1610"
                        strokeWidth="0.95"
                        strokeLinejoin="round"
                      />
                    ))}
                    <circle cx="0" cy="0" r="1.5" fill={pal.core} stroke="#1C1610" strokeWidth="0.85" />
                  </g>
                </g>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};


