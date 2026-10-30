import React from 'react';

interface LadaCardCornersProps {
  variant?: 'default' | 'selected' | 'locked' | 'callout';
  showBottomCorners?: boolean;
  showInnerBorder?: boolean;
  className?: string;
}

const CORNER_ANIM_STYLES = `
  @keyframes ladaCornerBloomTL {
    0%, 100% { transform: rotate(-10deg) scale(0.95); }
    50% { transform: rotate(12deg) scale(1.07); }
  }
  @keyframes ladaCornerBloomTR {
    0%, 100% { transform: rotate(10deg) scale(0.95); }
    50% { transform: rotate(-12deg) scale(1.07); }
  }
  @keyframes ladaCornerRoseSpin {
    0% { transform: rotate(0deg) scale(0.94); }
    50% { transform: rotate(180deg) scale(1.08); }
    100% { transform: rotate(360deg) scale(0.94); }
  }
  @keyframes ladaCornerLeafSway {
    0%, 100% { transform: rotate(-4deg) scale(0.97); }
    50% { transform: rotate(5deg) scale(1.05); }
  }
  .lada-corner-flower-tl {
    animation: ladaCornerBloomTL 3.8s ease-in-out infinite;
  }
  .lada-corner-flower-tr {
    animation: ladaCornerBloomTR 3.8s ease-in-out infinite 0.6s;
  }
  .lada-corner-rose-bl {
    animation: ladaCornerRoseSpin 11s linear infinite;
  }
  .lada-corner-rose-br {
    animation: ladaCornerRoseSpin 11s linear infinite reverse;
  }
  .lada-corner-leaf {
    animation: ladaCornerLeafSway 2.9s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-corner-flower-tl, .lada-corner-flower-tr, .lada-corner-rose-bl, .lada-corner-rose-br, .lada-corner-leaf {
      animation: none !important;
    }
  }
`;

/**
 * Authentic Josef Lada folk corner decorations and inner vignette frame
 * with bright Czech village gouache colors and subtle blooming/swaying motion.
 */
export const LadaCardCorners: React.FC<LadaCardCornersProps> = ({
  variant = 'default',
  showBottomCorners = true,
  showInnerBorder = true,
  className = '',
}) => {
  const isSelected = variant === 'selected';
  const isLocked = variant === 'locked';

  // Bright Czech village gouache flower & leaf colors
  const yellowPetalFill = isSelected ? '#FEF08A' : isLocked ? '#E2C872' : '#FACC15';
  const yellowCenterFill = isSelected ? '#EA580C' : '#F59E0B';
  const carminePetalFill = isSelected ? '#F43F5E' : isLocked ? '#9E4452' : '#E11D48';
  const leafFill = isSelected ? '#4ADE80' : isLocked ? '#4A6B48' : '#22C55E';

  return (
    <div
      className={`lada-card-decor-wrap pointer-events-none absolute inset-0 select-none z-10 ${className}`}
      aria-hidden="true"
    >
      <style>{CORNER_ANIM_STYLES}</style>

      {/* Inner double border vignette frame */}
      {showInnerBorder && (
        <div
          className="absolute inset-[4px] rounded-[6px] border transition-colors duration-150"
          style={{
            borderColor: isSelected
              ? '#F59E0B'
              : isLocked
              ? 'rgba(61, 34, 16, 0.28)'
              : 'rgba(28, 22, 16, 0.34)',
            borderWidth: isSelected ? '2px' : '1.5px',
          }}
        />
      )}

      {/* TOP-LEFT CORNER: Josef Lada 5-petal yellow flower with stippled seed core */}
      <svg
        className="absolute -top-[6px] -left-[6px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] overflow-visible"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g transform="translate(14, 14)">
          <g className="lada-corner-leaf">
            <path
              d="M 0,0 C -5,-3 -9,-2 -11,2 C -11,6 -7,6 0,0 Z"
              fill={leafFill}
              stroke="#1C1610"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 C -3,-5 -2,-9 2,-11 C 6,-11 6,-7 0,0 Z"
              fill={leafFill}
              stroke="#1C1610"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 C 5,4 11,4 13,0 C 12,-3 6,-3 0,0 Z"
              fill={leafFill}
              stroke="#1C1610"
              strokeWidth="1.15"
            />
          </g>
          {/* Secondary Cornflower Blue forget-me-not bud */}
          <g transform="translate(11, 4)">
            <g className="lada-corner-rose-bl">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -1.8,-2.1 -2,-4.4 0,-4.8 C 2,-4.4 1.8,-2.1 0,0 Z"
                  fill={isLocked ? '#648296' : '#38BDF8'}
                  stroke="#1C1610"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="1.7" fill={yellowPetalFill} stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>
          <g className="lada-corner-flower-tl">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={i}
                transform={`rotate(${angle})`}
                d="M 0,0 C -4.2,-4.2 -4.8,-10 0,-11 C 4.8,-10 4.2,-4.2 0,0 Z"
                fill={yellowPetalFill}
                stroke="#1C1610"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            ))}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={`hi-${i}`}
                transform={`rotate(${angle})`}
                d="M 0,-2 C -1.8,-4 -1.8,-7.5 0,-8.5 C 1.8,-7.5 1.8,-4 0,-2 Z"
                fill="#FFFDF7"
                opacity="0.9"
              />
            ))}
            <circle cx="0" cy="0" r="4.2" fill={yellowCenterFill} stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="0.75" fill="#1C1610" />
            <circle cx="0" cy="-2" r="0.55" fill="#1C1610" />
            <circle cx="1.9" cy="-0.65" r="0.55" fill="#1C1610" />
            <circle cx="1.2" cy="1.6" r="0.55" fill="#1C1610" />
            <circle cx="-1.2" cy="1.6" r="0.55" fill="#1C1610" />
            <circle cx="-1.9" cy="-0.65" r="0.55" fill="#1C1610" />
          </g>
        </g>
      </svg>

      {/* TOP-RIGHT CORNER: Josef Lada 5-petal yellow flower with stippled seed core + side forget-me-not */}
      <svg
        className="absolute -top-[6px] -right-[6px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] overflow-visible"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g transform="translate(14, 14)">
          <g className="lada-corner-leaf">
            <path
              d="M 0,0 C 5,-3 9,-2 11,2 C 11,6 7,6 0,0 Z"
              fill={leafFill}
              stroke="#1C1610"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 C 3,-5 2,-9 -2,-11 C -6,-11 -6,-7 0,0 Z"
              fill={leafFill}
              stroke="#1C1610"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 C -5,4 -11,4 -13,0 C -12,-3 -6,-3 0,0 Z"
              fill={leafFill}
              stroke="#1C1610"
              strokeWidth="1.15"
            />
          </g>
          {/* Secondary Cornflower Blue forget-me-not bud */}
          <g transform="translate(-11, 4)">
            <g className="lada-corner-rose-br">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -1.8,-2.1 -2,-4.4 0,-4.8 C 2,-4.4 1.8,-2.1 0,0 Z"
                  fill={isLocked ? '#648296' : '#38BDF8'}
                  stroke="#1C1610"
                  strokeWidth="1.05"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="1.7" fill={yellowPetalFill} stroke="#1C1610" strokeWidth="0.9" />
            </g>
          </g>
          <g className="lada-corner-flower-tr">
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={i}
                transform={`rotate(${angle})`}
                d="M 0,0 C -4.2,-4.2 -4.8,-10 0,-11 C 4.8,-10 4.2,-4.2 0,0 Z"
                fill={yellowPetalFill}
                stroke="#1C1610"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            ))}
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <path
                key={`hi-${i}`}
                transform={`rotate(${angle})`}
                d="M 0,-2 C -1.8,-4 -1.8,-7.5 0,-8.5 C 1.8,-7.5 1.8,-4 0,-2 Z"
                fill="#FFFDF7"
                opacity="0.9"
              />
            ))}
            <circle cx="0" cy="0" r="4.2" fill={yellowCenterFill} stroke="#1C1610" strokeWidth="1.4" />
            <circle cx="0" cy="0" r="0.75" fill="#1C1610" />
            <circle cx="0" cy="-2" r="0.55" fill="#1C1610" />
            <circle cx="1.9" cy="-0.65" r="0.55" fill="#1C1610" />
            <circle cx="1.2" cy="1.6" r="0.55" fill="#1C1610" />
            <circle cx="-1.2" cy="1.6" r="0.55" fill="#1C1610" />
            <circle cx="-1.9" cy="-0.65" r="0.55" fill="#1C1610" />
          </g>
        </g>
      </svg>

      {/* BOTTOM-LEFT CORNER: Folk leaf sprig with carmine-rose blossom + cornflower side bud */}
      {showBottomCorners && (
        <svg
          className="absolute -bottom-[5px] -left-[5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] overflow-visible"
          width="24"
          height="24"
          viewBox="0 0 26 26"
        >
          <g transform="translate(13, 13)">
            <g className="lada-corner-leaf">
              <path
                d="M 0,0 C -5,2 -8,7 -5,10 C -2,11 2,7 0,0 Z"
                fill={leafFill}
                stroke="#1C1610"
                strokeWidth="1.4"
              />
              <path
                d="M 0,0 C -2,-5 -7,-8 -10,-5 C -11,-2 -7,2 0,0 Z"
                fill={leafFill}
                stroke="#1C1610"
                strokeWidth="1.4"
              />
            </g>
            <g transform="translate(9, -3)">
              <g className="lada-corner-flower-tl">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -1.6,-1.9 -1.8,-4 0,-4.4 C 1.8,-4 1.6,-1.9 0,0 Z"
                    fill={isLocked ? '#648296' : '#38BDF8'}
                    stroke="#1C1610"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="1.5" fill={yellowPetalFill} stroke="#1C1610" strokeWidth="0.85" />
              </g>
            </g>
            <g className="lada-corner-rose-bl">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.5,-3 -2.5,-7 0,-7.5 C 2.5,-7 2.5,-3 0,0 Z"
                  fill={carminePetalFill}
                  stroke="#1C1610"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="2.8" fill={yellowPetalFill} stroke="#1C1610" strokeWidth="1.2" />
            </g>
          </g>
        </svg>
      )}

      {/* BOTTOM-RIGHT CORNER: Folk leaf sprig with carmine-rose blossom + cornflower side bud */}
      {showBottomCorners && (
        <svg
          className="absolute -bottom-[5px] -right-[5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] overflow-visible"
          width="24"
          height="24"
          viewBox="0 0 26 26"
        >
          <g transform="translate(13, 13)">
            <g className="lada-corner-leaf">
              <path
                d="M 0,0 C 5,2 8,7 5,10 C 2,11 -2,7 0,0 Z"
                fill={leafFill}
                stroke="#1C1610"
                strokeWidth="1.4"
              />
              <path
                d="M 0,0 C 2,-5 7,-8 10,-5 C 11,-2 7,2 0,0 Z"
                fill={leafFill}
                stroke="#1C1610"
                strokeWidth="1.4"
              />
            </g>
            <g transform="translate(-9, -3)">
              <g className="lada-corner-flower-tr">
                {[0, 72, 144, 216, 288].map((deg) => (
                  <path
                    key={deg}
                    transform={`rotate(${deg})`}
                    d="M 0,0 C -1.6,-1.9 -1.8,-4 0,-4.4 C 1.8,-4 1.6,-1.9 0,0 Z"
                    fill={isLocked ? '#648296' : '#38BDF8'}
                    stroke="#1C1610"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                ))}
                <circle cx="0" cy="0" r="1.5" fill={yellowPetalFill} stroke="#1C1610" strokeWidth="0.85" />
              </g>
            </g>
            <g className="lada-corner-rose-br">
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <path
                  key={deg}
                  transform={`rotate(${deg})`}
                  d="M 0,0 C -2.5,-3 -2.5,-7 0,-7.5 C 2.5,-7 2.5,-3 0,0 Z"
                  fill={carminePetalFill}
                  stroke="#1C1610"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
              ))}
              <circle cx="0" cy="0" r="2.8" fill={yellowPetalFill} stroke="#1C1610" strokeWidth="1.2" />
            </g>
          </g>
        </svg>
      )}
    </div>
  );
};

