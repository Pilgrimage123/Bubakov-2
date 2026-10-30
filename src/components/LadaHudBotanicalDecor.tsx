import React from 'react';

const HUD_BOTANICAL_STYLES = `
  @keyframes ladaHudVineLeft {
    0%, 100% { transform: rotate(-2.8deg) translateY(0px); }
    50% { transform: rotate(3.2deg) translateY(-1.8px); }
  }
  @keyframes ladaHudVineRight {
    0%, 100% { transform: rotate(2.8deg) translateY(0px); }
    50% { transform: rotate(-3.2deg) translateY(-1.8px); }
  }
  @keyframes ladaHudBlossomSpin {
    0% { transform: rotate(0deg) scale(0.94); }
    50% { transform: rotate(180deg) scale(1.12); }
    100% { transform: rotate(360deg) scale(0.94); }
  }
  @keyframes ladaHudBlossomBloom {
    0%, 100% { transform: rotate(-14deg) scale(0.92); }
    50% { transform: rotate(16deg) scale(1.1); }
  }
  @keyframes ladaHudLeafBreathe {
    0%, 100% { transform: rotate(-5deg) scale(0.95); }
    50% { transform: rotate(6deg) scale(1.07); }
  }
  @keyframes ladaGarlandSway {
    0%, 100% { transform: translateY(0px) rotate(-3deg); }
    50% { transform: translateY(-2px) rotate(3deg); }
  }
  .lada-hud-vine-l {
    transform-origin: 26px 72px;
    animation: ladaHudVineLeft 3.5s ease-in-out infinite;
  }
  .lada-hud-vine-r {
    transform-origin: 6px 72px;
    animation: ladaHudVineRight 3.5s ease-in-out infinite 0.45s;
  }
  .lada-hud-blossom {
    animation: ladaHudBlossomSpin 9.5s linear infinite;
  }
  .lada-hud-blossom-rev {
    animation: ladaHudBlossomSpin 10.5s linear infinite reverse;
  }
  .lada-hud-bloom {
    animation: ladaHudBlossomBloom 3.2s ease-in-out infinite;
  }
  .lada-hud-leaf {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaHudLeafBreathe 2.7s ease-in-out infinite;
  }
  .lada-garland-item {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaGarlandSway 2.8s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-hud-vine-l, .lada-hud-vine-r, .lada-hud-blossom, .lada-hud-blossom-rev, .lada-hud-bloom, .lada-hud-leaf, .lada-garland-item {
      animation: none !important;
    }
  }
`;

export type LadaFolkFlowerVariant = 'buttercup' | 'poppy' | 'cornflower' | 'carmine' | 'daisy';

export interface LadaFolkFlowerProps {
  variant?: LadaFolkFlowerVariant;
  size?: number;
  spin?: boolean;
  withLeaves?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const FLOWER_PALETTES: Record<
  LadaFolkFlowerVariant,
  { petal: string; highlight: string; core: string; dot: string; leaf: string }
> = {
  buttercup: {
    petal: '#FACC15',
    highlight: '#FFFDF7',
    core: '#EA580C',
    dot: '#1C1610',
    leaf: '#22C55E',
  },
  poppy: {
    petal: '#E6392B',
    highlight: '#FCA5A5',
    core: '#FACC15',
    dot: '#1C1610',
    leaf: '#16A34A',
  },
  cornflower: {
    petal: '#38BDF8',
    highlight: '#E0F2FE',
    core: '#FACC15',
    dot: '#1E3A8A',
    leaf: '#22C55E',
  },
  carmine: {
    petal: '#E11D48',
    highlight: '#FDA4AF',
    core: '#FEF08A',
    dot: '#1C1610',
    leaf: '#4ADE80',
  },
  daisy: {
    petal: '#FFFDF7',
    highlight: '#FEF9C3',
    core: '#F59E0B',
    dot: '#1C1610',
    leaf: '#22C55E',
  },
};

/**
 * Reusable animated Josef Lada folk flower rosette with bright Czech village gouache colors,
 * bold charcoal-brown ink outlines, stippled seed core, and optional breathing meadow leaves.
 */
export const LadaFolkFlower: React.FC<LadaFolkFlowerProps> = ({
  variant = 'buttercup',
  size = 18,
  spin = false,
  withLeaves = true,
  className = '',
  style,
}) => {
  const pal = FLOWER_PALETTES[variant] || FLOWER_PALETTES.buttercup;

  return (
    <span
      className={`inline-flex items-center justify-center pointer-events-none select-none shrink-0 ${className}`}
      style={{ width: size, height: size, verticalAlign: 'middle', ...style }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 28 28"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
      >
        <style>{HUD_BOTANICAL_STYLES}</style>
        <g transform="translate(14, 14)">
          {withLeaves && (
            <g className="lada-hud-leaf">
              <path
                d="M 0,0 C -6,-4 -11,-2 -12,3 C -10,7 -5,6 0,0 Z"
                fill={pal.leaf}
                stroke="#1C1610"
                strokeWidth="1.3"
              />
              <path
                d="M 0,0 C 6,-4 11,-2 12,3 C 10,7 5,6 0,0 Z"
                fill={pal.leaf}
                stroke="#1C1610"
                strokeWidth="1.3"
              />
            </g>
          )}
          <g className={spin ? 'lada-hud-blossom' : 'lada-hud-bloom'}>
            {[0, 72, 144, 216, 288].map((angle) => (
              <path
                key={angle}
                transform={`rotate(${angle})`}
                d="M 0,0 C -3.8,-3.8 -4.4,-9.4 0,-10.4 C 4.4,-9.4 3.8,-3.8 0,0 Z"
                fill={pal.petal}
                stroke="#1C1610"
                strokeWidth="1.55"
                strokeLinejoin="round"
              />
            ))}
            {[0, 72, 144, 216, 288].map((angle) => (
              <path
                key={`hi-${angle}`}
                transform={`rotate(${angle})`}
                d="M 0,-1.8 C -1.6,-3.6 -1.6,-6.8 0,-7.8 C 1.6,-6.8 1.6,-3.6 0,-1.8 Z"
                fill={pal.highlight}
                opacity="0.88"
              />
            ))}
            <circle cx="0" cy="0" r="3.8" fill={pal.core} stroke="#1C1610" strokeWidth="1.35" />
            <circle cx="0" cy="0" r="0.7" fill={pal.dot} />
            <circle cx="0" cy="-1.8" r="0.5" fill={pal.dot} />
            <circle cx="1.7" cy="-0.5" r="0.5" fill={pal.dot} />
            <circle cx="1.1" cy="1.4" r="0.5" fill={pal.dot} />
            <circle cx="-1.1" cy="1.4" r="0.5" fill={pal.dot} />
            <circle cx="-1.7" cy="-0.5" r="0.5" fill={pal.dot} />
          </g>
        </g>
      </svg>
    </span>
  );
};

export interface LadaFloralGarlandProps {
  repeatCount?: number;
  height?: number;
  className?: string;
}

/**
 * Horizontal Czech village folk floral garland with swaying meadow stems,
 * alternating buttercup, poppy, cornflower, and carmine blossoms, and golden berries.
 */
export const LadaFloralGarland: React.FC<LadaFloralGarlandProps> = ({
  repeatCount = 7,
  height = 22,
  className = '',
}) => {
  const variants: LadaFolkFlowerVariant[] = ['buttercup', 'poppy', 'cornflower', 'carmine', 'daisy'];
  const unitW = 56;
  const totalW = repeatCount * unitW;

  return (
    <div
      className={`lada-floral-garland flex items-center justify-center select-none pointer-events-none my-1 overflow-visible ${className}`}
      style={{ width: '100%', height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${totalW} 28`}
        className="w-full h-full max-w-[520px] overflow-visible drop-shadow-xs"
        preserveAspectRatio="xMidYMid meet"
      >
        <style>{HUD_BOTANICAL_STYLES}</style>
        {/* Wavy golden folk vine stem */}
        <path
          d={`M 8,14 ${Array.from({ length: repeatCount })
            .map((_, i) => {
              const x0 = i * unitW;
              const cy = i % 2 === 0 ? 5 : 23;
              return `Q ${x0 + unitW / 2},${cy} ${x0 + unitW - 4},14`;
            })
            .join(' ')}`}
          stroke="#1C1610"
          strokeWidth="3.4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M 8,14 ${Array.from({ length: repeatCount })
            .map((_, i) => {
              const x0 = i * unitW;
              const cy = i % 2 === 0 ? 5 : 23;
              return `Q ${x0 + unitW / 2},${cy} ${x0 + unitW - 4},14`;
            })
            .join(' ')}`}
          stroke="#FACC15"
          strokeWidth="1.9"
          strokeLinecap="round"
          fill="none"
        />

        {Array.from({ length: repeatCount }).map((_, i) => {
          const cx = i * unitW + unitW / 2;
          const cy = i % 2 === 0 ? 10 : 18;
          const pal = FLOWER_PALETTES[variants[i % variants.length]];
          return (
            <g
              key={i}
              transform={`translate(${cx}, ${cy})`}
              className="lada-garland-item"
              style={{ animationDelay: `${(i * 0.18).toFixed(2)}s` }}
            >
              {/* Flanking leaves */}
              <g className="lada-hud-leaf">
                <path
                  d="M -4,0 C -11,-5 -16,-2 -14,3 C -12,6 -7,4 -4,0 Z"
                  fill="#22C55E"
                  stroke="#1C1610"
                  strokeWidth="1.3"
                />
                <path
                  d="M 4,0 C 11,-5 16,-2 14,3 C 12,6 7,4 4,0 Z"
                  fill="#4ADE80"
                  stroke="#1C1610"
                  strokeWidth="1.3"
                />
              </g>
              {/* Small berry buds */}
              <circle cx="-16" cy={i % 2 === 0 ? 4 : -4} r="2" fill="#38BDF8" stroke="#1C1610" strokeWidth="1" />
              <circle cx="16" cy={i % 2 === 0 ? 4 : -4} r="2" fill="#E6392B" stroke="#1C1610" strokeWidth="1" />

              {/* Blooming flower */}
              <g className={i % 2 === 0 ? 'lada-hud-blossom' : 'lada-hud-blossom-rev'}>
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -3,-3 -3.5,-7.5 0,-8.2 C 3.5,-7.5 3,-3 0,0 Z"
                    fill={pal.petal}
                    stroke="#1C1610"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="3" fill={pal.core} stroke="#1C1610" strokeWidth="1.1" />
                <circle cx="0" cy="0" r="0.7" fill={pal.dot} />
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * Botanical Josef Lada floral adornments for the in-game HUD,
 * painted in vibrant Czech village gouache colors with breeze-swaying motion.
 */
export const LadaHudBotanicalDecor: React.FC = () => {
  return (
    <div
      className="lada-hud-botanical-decor pointer-events-none absolute inset-0 select-none overflow-visible"
      aria-hidden="true"
    >
      <style>{HUD_BOTANICAL_STYLES}</style>

      {/* Left Flanking Botanical Vine */}
      <svg
        className="absolute -left-[24px] sm:-left-[34px] top-0 drop-shadow-md overflow-visible"
        width="36"
        height="82"
        viewBox="0 0 36 82"
      >
        <g className="lada-hud-vine-l">
          {/* Main curved golden stem */}
          <path
            d="M 28,76 Q 8,52 15,28 Q 21,10 26,2"
            stroke="#1C1610"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 28,76 Q 8,52 15,28 Q 21,10 26,2"
            stroke="#FACC15"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lower Cornflower Blue 5-petal forget-me-not flower */}
          <g transform="translate(20, 63)">
            <g className="lada-hud-blossom-rev">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2,-2.2 -2.2,-5.2 0,-5.8 C 2.2,-5.2 2,-2.2 0,0 Z"
                  fill="#38BDF8"
                  stroke="#1C1610"
                  strokeWidth="1.1"
                />
              ))}
              <circle cx="0" cy="0" r="2" fill="#FACC15" stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>

          {/* Leaf 1 (bottom left) */}
          <g className="lada-hud-leaf">
            <path
              d="M 15,52 C 2,51 2,40 10,36 C 16,34 19,44 15,52 Z"
              fill="#22C55E"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            <path d="M 13,49 C 8,44 6,40 4,38" stroke="#FEF08A" strokeWidth="1.2" fill="none" />
          </g>

          {/* Middle Buttercup Gold flower */}
          <g transform="translate(9, 36)">
            <g className="lada-hud-bloom">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.2,-2.4 -2.4,-5.5 0,-6.2 C 2.4,-5.5 2.2,-2.4 0,0 Z"
                  fill="#FACC15"
                  stroke="#1C1610"
                  strokeWidth="1.15"
                />
              ))}
              <circle cx="0" cy="0" r="2.1" fill="#E6392B" stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>

          {/* Leaf 2 (middle left) */}
          <g className="lada-hud-leaf">
            <path
              d="M 18,29 C 7,27 6,16 15,13 C 21,11 23,22 18,29 Z"
              fill="#4ADE80"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            <path d="M 16,26 C 11,21 9,18 8,16" stroke="#1C1610" strokeWidth="1.2" fill="none" />
          </g>

          {/* Carmine-Rose Blossom at crest */}
          <g transform="translate(26, 6)">
            <g className="lada-hud-blossom">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.8,-3.2 -2.8,-7 0,-7.6 C 2.8,-7 2.8,-3.2 0,0 Z"
                  fill="#E11D48"
                  stroke="#1C1610"
                  strokeWidth="1.25"
                />
              ))}
              <circle cx="0" cy="0" r="2.7" fill="#FACC15" stroke="#1C1610" strokeWidth="1.1" />
              <circle cx="0" cy="0" r="0.7" fill="#1C1610" />
            </g>
          </g>
        </g>
      </svg>

      {/* Right Flanking Botanical Vine (mirrored) */}
      <svg
        className="absolute -right-[24px] sm:-right-[34px] top-0 drop-shadow-md overflow-visible"
        width="36"
        height="82"
        viewBox="0 0 36 82"
      >
        <g className="lada-hud-vine-r">
          {/* Main curved golden stem */}
          <path
            d="M 8,76 Q 28,52 21,28 Q 15,10 10,2"
            stroke="#1C1610"
            strokeWidth="4.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 8,76 Q 28,52 21,28 Q 15,10 10,2"
            stroke="#FACC15"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lower Cornflower Blue 5-petal forget-me-not flower */}
          <g transform="translate(16, 63)">
            <g className="lada-hud-blossom">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2,-2.2 -2.2,-5.2 0,-5.8 C 2.2,-5.2 2,-2.2 0,0 Z"
                  fill="#38BDF8"
                  stroke="#1C1610"
                  strokeWidth="1.1"
                />
              ))}
              <circle cx="0" cy="0" r="2" fill="#FACC15" stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>

          {/* Leaf 1 (bottom right) */}
          <g className="lada-hud-leaf">
            <path
              d="M 21,52 C 34,51 34,40 26,36 C 20,34 17,44 21,52 Z"
              fill="#22C55E"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            <path d="M 23,49 C 28,44 30,40 32,38" stroke="#FEF08A" strokeWidth="1.2" fill="none" />
          </g>

          {/* Middle Buttercup Gold flower */}
          <g transform="translate(27, 36)">
            <g className="lada-hud-bloom">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.2,-2.4 -2.4,-5.5 0,-6.2 C 2.4,-5.5 2.2,-2.4 0,0 Z"
                  fill="#FACC15"
                  stroke="#1C1610"
                  strokeWidth="1.15"
                />
              ))}
              <circle cx="0" cy="0" r="2.1" fill="#E6392B" stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>

          {/* Leaf 2 (middle right) */}
          <g className="lada-hud-leaf">
            <path
              d="M 18,29 C 29,27 30,16 21,13 C 15,11 13,22 18,29 Z"
              fill="#4ADE80"
              stroke="#1C1610"
              strokeWidth="1.6"
            />
            <path d="M 20,26 C 25,21 27,18 28,16" stroke="#1C1610" strokeWidth="1.2" fill="none" />
          </g>

          {/* Carmine-Rose Blossom at crest */}
          <g transform="translate(10, 6)">
            <g className="lada-hud-blossom-rev">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.8,-3.2 -2.8,-7 0,-7.6 C 2.8,-7 2.8,-3.2 0,0 Z"
                  fill="#E11D48"
                  stroke="#1C1610"
                  strokeWidth="1.25"
                />
              ))}
              <circle cx="0" cy="0" r="2.7" fill="#FACC15" stroke="#1C1610" strokeWidth="1.1" />
              <circle cx="0" cy="0" r="0.7" fill="#1C1610" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
