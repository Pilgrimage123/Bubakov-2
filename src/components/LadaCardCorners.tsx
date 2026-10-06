import React from 'react';

interface LadaCardCornersProps {
  variant?: 'default' | 'selected' | 'locked' | 'callout';
  showBottomCorners?: boolean;
  showInnerBorder?: boolean;
  className?: string;
}

/**
 * Authentic Josef Lada folk corner decorations and inner vignette frame.
 * Directly inspired by the uploaded Josef Lada Easter postcard and zincography:
 * - 5-petaled warm yellow corner flower with stippled black ink seed core (Image 1)
 * - Round-lobed green leaf sprig with carmine-rose folk blossom (Image 2)
 * - Classic double-line storybook border with rounded corners
 * - Strictly zero overlap with card content and text
 */
export const LadaCardCorners: React.FC<LadaCardCornersProps> = ({
  variant = 'default',
  showBottomCorners = true,
  showInnerBorder = true,
  className = '',
}) => {
  const isSelected = variant === 'selected';
  const isLocked = variant === 'locked';

  // Flower petal colors
  const yellowPetalFill = isSelected ? '#FDE047' : isLocked ? '#E2C872' : '#F5C834';
  const yellowCenterFill = isSelected ? '#F59E0B' : '#E5B224';
  const carminePetalFill = isSelected ? '#DC2626' : isLocked ? '#9E4452' : '#BA3852';
  const leafFill = isSelected ? '#4ADE80' : isLocked ? '#4A6B48' : '#528850';

  return (
    <div
      className={`lada-card-decor-wrap pointer-events-none absolute inset-0 select-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Inner double border vignette frame */}
      {showInnerBorder && (
        <div
          className="absolute inset-[4px] rounded-[6px] border transition-colors duration-150"
          style={{
            borderColor: isSelected
              ? '#D9A036'
              : isLocked
              ? 'rgba(61, 34, 16, 0.28)'
              : 'rgba(28, 22, 16, 0.32)',
            borderWidth: isSelected ? '2px' : '1.5px',
          }}
        />
      )}

      {/* TOP-LEFT CORNER: Josef Lada 5-petal yellow flower with stippled seed core (Photo 1) */}
      <svg
        className="absolute -top-[6px] -left-[6px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g transform="translate(14, 14)">
          {/* Subtle botanical leaves nestled behind corner flower (Photo 1) */}
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
          {/* 5 rounded petals */}
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
          {/* Soft inner petal watercolor highlight */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <path
              key={`hi-${i}`}
              transform={`rotate(${angle})`}
              d="M 0,-2 C -1.8,-4 -1.8,-7.5 0,-8.5 C 1.8,-7.5 1.8,-4 0,-2 Z"
              fill="#FEF3C7"
              opacity="0.85"
            />
          ))}
          {/* Central seed button */}
          <circle cx="0" cy="0" r="4.2" fill={yellowCenterFill} stroke="#1C1610" strokeWidth="1.4" />
          {/* Stippled black ink seed dots (Lada signature postcard detail) */}
          <circle cx="0" cy="0" r="0.75" fill="#1C1610" />
          <circle cx="0" cy="-2" r="0.55" fill="#1C1610" />
          <circle cx="1.9" cy="-0.65" r="0.55" fill="#1C1610" />
          <circle cx="1.2" cy="1.6" r="0.55" fill="#1C1610" />
          <circle cx="-1.2" cy="1.6" r="0.55" fill="#1C1610" />
          <circle cx="-1.9" cy="-0.65" r="0.55" fill="#1C1610" />
        </g>
      </svg>

      {/* TOP-RIGHT CORNER: Josef Lada 5-petal yellow flower with stippled seed core (Photo 1) */}
      <svg
        className="absolute -top-[6px] -right-[6px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
        width="28"
        height="28"
        viewBox="0 0 28 28"
      >
        <g transform="translate(14, 14)">
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
              fill="#FEF3C7"
              opacity="0.85"
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
      </svg>

      {/* BOTTOM-LEFT CORNER: Folk leaf sprig with carmine-rose blossom (Photo 2) */}
      {showBottomCorners && (
        <svg
          className="absolute -bottom-[5px] -left-[5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
          width="24"
          height="24"
          viewBox="0 0 26 26"
        >
          <g transform="translate(13, 13)">
            {/* Green folk leaf pair */}
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
            {/* Carmine-rose folk flower with golden center (Photo 2) */}
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
        </svg>
      )}

      {/* BOTTOM-RIGHT CORNER: Folk leaf sprig with carmine-rose blossom (Photo 2) */}
      {showBottomCorners && (
        <svg
          className="absolute -bottom-[5px] -right-[5px] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
          width="24"
          height="24"
          viewBox="0 0 26 26"
        >
          <g transform="translate(13, 13)">
            {/* Green folk leaf pair */}
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
            {/* Carmine-rose folk flower with golden center (Photo 2) */}
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
        </svg>
      )}
    </div>
  );
};
