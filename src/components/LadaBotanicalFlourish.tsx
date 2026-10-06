import React from 'react';

interface LadaBotanicalFlourishProps {
  className?: string;
  width?: string | number;
  height?: number;
  compact?: boolean;
}

/**
 * Authentic Josef Lada botanical flourish divider.
 * Directly modeled on the uploaded Easter postcard and zincography:
 * - Center: Signature 5-petaled yellow folk flower with black ink stippled seed core (Photo 1)
 * - Flanking: Curving golden stems with round sage-green leaves with center veins (Photo 2)
 * - Tips: Carmine-rose folk flower buds with golden centers (Photo 2)
 * - Strictly zero text overlap, designed to sit cleanly as an ornamental divider
 */
export const LadaBotanicalFlourish: React.FC<LadaBotanicalFlourishProps> = ({
  className = '',
  width = '100%',
  height = 24,
  compact = false,
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
        {/* LEFT BOTANICAL BRANCH (Photo 2) */}
        <g id="branch-left">
          {/* Main curved yellow stem with black ink outline */}
          <path
            d="M 130,14 Q 95,9 60,15 Q 35,20 18,13"
            stroke="#1C1610"
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 130,14 Q 95,9 60,15 Q 35,20 18,13"
            stroke="#E8B834"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Leaf 1 (top left, pointing up) */}
          <path
            d="M 98,11 C 92,2 80,4 83,12 C 86,16 94,14 98,11 Z"
            fill="#528850"
            stroke="#1C1610"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 94,12 C 90,8 87,7 85,8" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Leaf 2 (lower left, pointing down) */}
          <path
            d="M 72,16 C 68,25 56,23 58,16 C 60,11 68,13 72,16 Z"
            fill="#5D9658"
            stroke="#1C1610"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 68,15 C 64,19 61,20 59,19" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Leaf 3 (further out, pointing up) */}
          <path
            d="M 42,18 C 36,9 26,12 30,19 C 33,22 39,21 42,18 Z"
            fill="#4D834B"
            stroke="#1C1610"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 39,18 C 35,14 32,14 30,15" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Carmine-Rose Folk Flower Bud at Left Tip */}
          <g transform="translate(14, 12)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                transform={`rotate(${deg})`}
                d="M 0,0 C -2,-3 -2,-6 0,-6.5 C 2,-6 2,-3 0,0 Z"
                fill="#BA3852"
                stroke="#1C1610"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            ))}
            <circle cx="0" cy="0" r="2.2" fill="#F4C732" stroke="#1C1610" strokeWidth="1" />
          </g>
        </g>

        {/* RIGHT BOTANICAL BRANCH (Photo 2 - mirrored) */}
        <g id="branch-right">
          <path
            d="M 190,14 Q 225,9 260,15 Q 285,20 302,13"
            stroke="#1C1610"
            strokeWidth="3.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 190,14 Q 225,9 260,15 Q 285,20 302,13"
            stroke="#E8B834"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Leaf 1 (top right) */}
          <path
            d="M 222,11 C 228,2 240,4 237,12 C 234,16 226,14 222,11 Z"
            fill="#528850"
            stroke="#1C1610"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 226,12 C 230,8 233,7 235,8" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Leaf 2 (lower right) */}
          <path
            d="M 248,16 C 252,25 264,23 262,16 C 260,11 252,13 248,16 Z"
            fill="#5D9658"
            stroke="#1C1610"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 252,15 C 256,19 259,20 261,19" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Leaf 3 (further right) */}
          <path
            d="M 278,18 C 284,9 294,12 290,19 C 287,22 281,21 278,18 Z"
            fill="#4D834B"
            stroke="#1C1610"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M 281,18 C 285,14 288,14 290,15" stroke="#1C1610" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Carmine-Rose Folk Flower Bud at Right Tip */}
          <g transform="translate(306, 12)">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                transform={`rotate(${deg})`}
                d="M 0,0 C -2,-3 -2,-6 0,-6.5 C 2,-6 2,-3 0,0 Z"
                fill="#BA3852"
                stroke="#1C1610"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            ))}
            <circle cx="0" cy="0" r="2.2" fill="#F4C732" stroke="#1C1610" strokeWidth="1" />
          </g>
        </g>

        {/* CENTER ICONIC 5-PETAL YELLOW FLOWER WITH STIPPLED SEED CORE (Photo 1) */}
        <g transform="translate(160, 14)">
          {/* Subtle leaves flanking center flower */}
          <path
            d="M 0,0 C -6,-8 -14,-7 -13,-1 C -12,4 -5,4 0,0 Z"
            fill="#528850"
            stroke="#1C1610"
            strokeWidth="1.3"
          />
          <path
            d="M 0,0 C 6,-8 14,-7 13,-1 C 12,4 5,4 0,0 Z"
            fill="#528850"
            stroke="#1C1610"
            strokeWidth="1.3"
          />

          {/* 5 rounded yellow petals */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <path
              key={i}
              transform={`rotate(${angle})`}
              d="M 0,0 C -4.2,-4.5 -4.8,-10.5 0,-11.5 C 4.8,-10.5 4.2,-4.5 0,0 Z"
              fill="#F5C834"
              stroke="#1C1610"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          ))}
          {/* Petal highlight */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <path
              key={`hi-${i}`}
              transform={`rotate(${angle})`}
              d="M 0,-2 C -2,-4 -2,-7.5 0,-8.5 C 2,-7.5 2,-4 0,-2 Z"
              fill="#FEF3C7"
              opacity="0.85"
            />
          ))}

          {/* Center seed button */}
          <circle cx="0" cy="0" r="4.6" fill="#E5B224" stroke="#1C1610" strokeWidth="1.4" />
          {/* Stippled black ink seed dots (signature Lada postcard detail) */}
          <circle cx="0" cy="0" r="0.8" fill="#1C1610" />
          <circle cx="0" cy="-2.2" r="0.6" fill="#1C1610" />
          <circle cx="2.1" cy="-0.7" r="0.6" fill="#1C1610" />
          <circle cx="1.3" cy="1.8" r="0.6" fill="#1C1610" />
          <circle cx="-1.3" cy="1.8" r="0.6" fill="#1C1610" />
          <circle cx="-2.1" cy="-0.7" r="0.6" fill="#1C1610" />
        </g>
      </svg>
    </div>
  );
};
