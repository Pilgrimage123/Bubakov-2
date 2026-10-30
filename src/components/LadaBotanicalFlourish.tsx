import React from 'react';

interface LadaBotanicalFlourishProps {
  className?: string;
  width?: string | number;
  height?: number;
  compact?: boolean;
}

const FLOURISH_ANIM_STYLES = `
  @keyframes ladaFlourishSwayLeft {
    0%, 100% { transform: rotate(-2.2deg) scaleY(0.98); }
    50% { transform: rotate(2.6deg) scaleY(1.03); }
  }
  @keyframes ladaFlourishSwayRight {
    0%, 100% { transform: rotate(2.2deg) scaleY(0.98); }
    50% { transform: rotate(-2.6deg) scaleY(1.03); }
  }
  @keyframes ladaFlourishLeafPulse {
    0%, 100% { transform: rotate(-5deg) scale(0.95); }
    50% { transform: rotate(6deg) scale(1.08); }
  }
  @keyframes ladaFlourishBudSpin {
    0% { transform: rotate(0deg) scale(0.94); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(0.94); }
  }
  @keyframes ladaFlourishCenterFlower {
    0%, 100% { transform: rotate(-12deg) scale(0.96); }
    50% { transform: rotate(14deg) scale(1.08); }
  }
  .lada-fl-branch-l {
    transform-origin: 135px 14px;
    animation: ladaFlourishSwayLeft 3.4s ease-in-out infinite;
  }
  .lada-fl-branch-r {
    transform-origin: 185px 14px;
    animation: ladaFlourishSwayRight 3.4s ease-in-out infinite 0.4s;
  }
  .lada-fl-leaf-1 {
    transform-box: fill-box;
    transform-origin: bottom center;
    animation: ladaFlourishLeafPulse 2.6s ease-in-out infinite;
  }
  .lada-fl-leaf-2 {
    transform-box: fill-box;
    transform-origin: top center;
    animation: ladaFlourishLeafPulse 2.9s ease-in-out infinite 0.7s;
  }
  .lada-fl-bud {
    animation: ladaFlourishBudSpin 9s linear infinite;
  }
  .lada-fl-center {
    animation: ladaFlourishCenterFlower 3.8s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-fl-branch-l, .lada-fl-branch-r, .lada-fl-leaf-1, .lada-fl-leaf-2, .lada-fl-bud, .lada-fl-center {
      animation: none !important;
    }
  }
`;

/**
 * Authentic Josef Lada botanical flourish divider in bright Czech village gouache colors
 * with subtle breeze-swaying stems, breathing meadow leaves, and blooming folk flowers.
 */
export const LadaBotanicalFlourish: React.FC<LadaBotanicalFlourishProps> = ({
  className = '',
  width = '100%',
  height = 24,
}) => {
  return (
    <div
      className={`lada-botanical-flourish flex items-center justify-center select-none pointer-events-none my-1.5 ${className}`}
      style={{ width, height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 28"
        className="w-full h-full max-w-[340px] drop-shadow-sm overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <style>{FLOURISH_ANIM_STYLES}</style>

        {/* LEFT BOTANICAL BRANCH */}
        <g id="branch-left" className="lada-fl-branch-l">
          {/* Main curved golden stem with black ink outline */}
          <path
            d="M 130,14 Q 95,9 60,15 Q 35,20 18,13"
            stroke="#1C1610"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 130,14 Q 95,9 60,15 Q 35,20 18,13"
            stroke="#FACC15"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Leaf 1 (top left, pointing up) */}
          <g className="lada-fl-leaf-1">
            <path
              d="M 98,11 C 92,2 80,4 83,12 C 86,16 94,14 98,11 Z"
              fill="#22C55E"
              stroke="#1C1610"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 94,12 C 90,8 87,7 85,8" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>

          {/* Blooming White & Poppy Daisy Bud near center-left */}
          <g transform="translate(115, 16)">
            <g className="lada-fl-bud" style={{ animationDirection: 'reverse', animationDuration: '11s' }}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -1.8,-2.3 -2,-4.8 0,-5.3 C 2,-4.8 1.8,-2.3 0,0 Z"
                  fill="#FFFDF7"
                  stroke="#1C1610"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="1.9" fill="#E6392B" stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>

          {/* Animated Cornflower Blue forget-me-not flower (chrpa) */}
          <g transform="translate(80, 17)">
            <g className="lada-fl-bud" style={{ animationDuration: '8.5s' }}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2,-2.6 -2.2,-5.5 0,-6 C 2.2,-5.5 2,-2.6 0,0 Z"
                  fill="#38BDF8"
                  stroke="#1C1610"
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="2.1" fill="#FACC15" stroke="#1C1610" strokeWidth="0.95" />
            </g>
          </g>

          {/* Leaf 2 (lower left, pointing down) */}
          <g className="lada-fl-leaf-2">
            <path
              d="M 72,16 C 68,25 56,23 58,16 C 60,11 68,13 72,16 Z"
              fill="#4ADE80"
              stroke="#1C1610"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 68,15 C 64,19 61,20 59,19" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>

          {/* Leaf 3 (further out, pointing up) */}
          <g className="lada-fl-leaf-1">
            <path
              d="M 42,18 C 36,9 26,12 30,19 C 33,22 39,21 42,18 Z"
              fill="#16A34A"
              stroke="#1C1610"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 39,18 C 35,14 32,14 30,15" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>

          {/* Carmine-Rose Folk Flower Bud at Left Tip */}
          <g transform="translate(14, 12)">
            <g className="lada-fl-bud">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.2,-3.2 -2.2,-6.4 0,-7 C 2.2,-6.4 2.2,-3.2 0,0 Z"
                  fill="#E11D48"
                  stroke="#1C1610"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="2.4" fill="#FACC15" stroke="#1C1610" strokeWidth="1" />
            </g>
          </g>
        </g>

        {/* RIGHT BOTANICAL BRANCH (mirrored) */}
        <g id="branch-right" className="lada-fl-branch-r">
          <path
            d="M 190,14 Q 225,9 260,15 Q 285,20 302,13"
            stroke="#1C1610"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 190,14 Q 225,9 260,15 Q 285,20 302,13"
            stroke="#FACC15"
            strokeWidth="2.3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Leaf 1 (top right) */}
          <g className="lada-fl-leaf-1">
            <path
              d="M 222,11 C 228,2 240,4 237,12 C 234,16 226,14 222,11 Z"
              fill="#22C55E"
              stroke="#1C1610"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 226,12 C 230,8 233,7 235,8" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>

          {/* Blooming White & Poppy Daisy Bud near center-right */}
          <g transform="translate(205, 16)">
            <g className="lada-fl-bud" style={{ animationDuration: '11s' }}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -1.8,-2.3 -2,-4.8 0,-5.3 C 2,-4.8 1.8,-2.3 0,0 Z"
                  fill="#FFFDF7"
                  stroke="#1C1610"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="1.9" fill="#E6392B" stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>

          {/* Animated Cornflower Blue forget-me-not flower (chrpa) */}
          <g transform="translate(240, 17)">
            <g className="lada-fl-bud" style={{ animationDirection: 'reverse', animationDuration: '8.5s' }}>
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2,-2.6 -2.2,-5.5 0,-6 C 2.2,-5.5 2,-2.6 0,0 Z"
                  fill="#38BDF8"
                  stroke="#1C1610"
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="2.1" fill="#FACC15" stroke="#1C1610" strokeWidth="0.95" />
            </g>
          </g>

          {/* Leaf 2 (lower right) */}
          <g className="lada-fl-leaf-2">
            <path
              d="M 248,16 C 252,25 264,23 262,16 C 260,11 252,13 248,16 Z"
              fill="#4ADE80"
              stroke="#1C1610"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 252,15 C 256,19 259,20 261,19" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>

          {/* Leaf 3 (further right) */}
          <g className="lada-fl-leaf-1">
            <path
              d="M 278,18 C 284,9 294,12 290,19 C 287,22 281,21 278,18 Z"
              fill="#16A34A"
              stroke="#1C1610"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M 281,18 C 285,14 288,14 290,15" stroke="#FEF08A" strokeWidth="1.1" strokeLinecap="round" fill="none" />
          </g>

          {/* Carmine-Rose Folk Flower Bud at Right Tip */}
          <g transform="translate(306, 12)">
            <g className="lada-fl-bud">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.2,-3.2 -2.2,-6.4 0,-7 C 2.2,-6.4 2.2,-3.2 0,0 Z"
                  fill="#E11D48"
                  stroke="#1C1610"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="2.4" fill="#FACC15" stroke="#1C1610" strokeWidth="1" />
            </g>
          </g>
        </g>

        {/* CENTER ICONIC 5-PETAL YELLOW FLOWER WITH STIPPLED SEED CORE */}
        <g transform="translate(160, 14)">
          {/* Subtle leaves flanking center flower */}
          <path
            d="M 0,0 C -6,-8 -14,-7 -13,-1 C -12,4 -5,4 0,0 Z"
            fill="#22C55E"
            stroke="#1C1610"
            strokeWidth="1.3"
          />
          <path
            d="M 0,0 C 6,-8 14,-7 13,-1 C 12,4 5,4 0,0 Z"
            fill="#22C55E"
            stroke="#1C1610"
            strokeWidth="1.3"
          />

          <g className="lada-fl-center">
            {/* 5 rounded buttercup-gold petals */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={i}
                transform={`rotate(${angle})`}
                d="M 0,0 C -4.4,-4.5 -5.0,-10.8 0,-11.8 C 5.0,-10.8 4.4,-4.5 0,0 Z"
                fill="#FACC15"
                stroke="#1C1610"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            ))}
            {/* Warm cream petal highlight */}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={`hi-${i}`}
                transform={`rotate(${angle})`}
                d="M 0,-2 C -2,-4 -2,-7.5 0,-8.5 C 2,-7.5 2,-4 0,-2 Z"
                fill="#FFFDF7"
                opacity="0.9"
              />
            ))}

            {/* Center seed button */}
            <circle cx="0" cy="0" r="4.6" fill="#F59E0B" stroke="#1C1610" strokeWidth="1.4" />
            {/* Stippled black ink seed dots */}
            <circle cx="0" cy="0" r="0.8" fill="#1C1610" />
            <circle cx="0" cy="-2.2" r="0.6" fill="#1C1610" />
            <circle cx="2.1" cy="-0.7" r="0.6" fill="#1C1610" />
            <circle cx="1.3" cy="1.8" r="0.6" fill="#1C1610" />
            <circle cx="-1.3" cy="1.8" r="0.6" fill="#1C1610" />
            <circle cx="-2.1" cy="-0.7" r="0.6" fill="#1C1610" />
          </g>
        </g>
      </svg>
    </div>
  );
};

