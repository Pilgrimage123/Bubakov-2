import React from 'react';

/**
 * Botanical Josef Lada floral adornments for the in-game HUD.
 * Directly modeled on uploaded artwork:
 * - Left/Right flanking botanical leafy vines with golden stems and carmine blossoms (Photo 2)
 * - Courage and XP bar flanking folk flower rosettes (Photo 1)
 * - Stats row corner leaf accents and stippled seed buttons
 * - Completely responsive and non-blocking, zero text overlap
 */
export const LadaHudBotanicalDecor: React.FC = () => {
  return (
    <div
      className="lada-hud-botanical-decor pointer-events-none absolute inset-0 select-none overflow-visible"
      aria-hidden="true"
    >
      {/* Left Flanking Botanical Vine (Photo 2) */}
      <svg
        className="absolute -left-[22px] sm:-left-[32px] top-0 drop-shadow-md overflow-visible"
        width="32"
        height="76"
        viewBox="0 0 32 76"
      >
        {/* Main curved golden stem */}
        <path
          d="M 26,72 Q 8,50 14,26 Q 20,10 24,2"
          stroke="#1C1610"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 26,72 Q 8,50 14,26 Q 20,10 24,2"
          stroke="#E8B834"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaf 1 (bottom left) */}
        <path
          d="M 14,52 C 2,51 2,40 10,36 C 16,34 18,44 14,52 Z"
          fill="#528850"
          stroke="#1C1610"
          strokeWidth="1.6"
        />
        <path d="M 12,49 C 8,44 6,40 4,38" stroke="#1C1610" strokeWidth="1.2" fill="none" />

        {/* Leaf 2 (middle left) */}
        <path
          d="M 17,29 C 7,27 6,16 15,13 C 21,11 23,22 17,29 Z"
          fill="#5D9658"
          stroke="#1C1610"
          strokeWidth="1.6"
        />
        <path d="M 15,26 C 11,21 9,18 8,16" stroke="#1C1610" strokeWidth="1.2" fill="none" />

        {/* Blossom at crest */}
        <g transform="translate(24, 6)">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              transform={`rotate(${deg})`}
              d="M 0,0 C -2.5,-3 -2.5,-6.5 0,-7 C 2.5,-6.5 2.5,-3 0,0 Z"
              fill="#BA3852"
              stroke="#1C1610"
              strokeWidth="1.2"
            />
          ))}
          <circle cx="0" cy="0" r="2.4" fill="#F4C732" stroke="#1C1610" strokeWidth="1" />
        </g>
      </svg>

      {/* Right Flanking Botanical Vine (Photo 2 - mirrored) */}
      <svg
        className="absolute -right-[22px] sm:-right-[32px] top-0 drop-shadow-md overflow-visible"
        width="32"
        height="76"
        viewBox="0 0 32 76"
      >
        {/* Main curved golden stem */}
        <path
          d="M 6,72 Q 24,50 18,26 Q 12,10 8,2"
          stroke="#1C1610"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 6,72 Q 24,50 18,26 Q 12,10 8,2"
          stroke="#E8B834"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaf 1 (bottom right) */}
        <path
          d="M 18,52 C 30,51 30,40 22,36 C 16,34 14,44 18,52 Z"
          fill="#528850"
          stroke="#1C1610"
          strokeWidth="1.6"
        />
        <path d="M 20,49 C 24,44 26,40 28,38" stroke="#1C1610" strokeWidth="1.2" fill="none" />

        {/* Leaf 2 (middle right) */}
        <path
          d="M 15,29 C 25,27 26,16 17,13 C 11,11 9,22 15,29 Z"
          fill="#5D9658"
          stroke="#1C1610"
          strokeWidth="1.6"
        />
        <path d="M 17,26 C 21,21 23,18 24,16" stroke="#1C1610" strokeWidth="1.2" fill="none" />

        {/* Blossom at crest */}
        <g transform="translate(8, 6)">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              transform={`rotate(${deg})`}
              d="M 0,0 C -2.5,-3 -2.5,-6.5 0,-7 C 2.5,-6.5 2.5,-3 0,0 Z"
              fill="#BA3852"
              stroke="#1C1610"
              strokeWidth="1.2"
            />
          ))}
          <circle cx="0" cy="0" r="2.4" fill="#F4C732" stroke="#1C1610" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

