import React from 'react';

interface LadaCoverSceneProps {
  className?: string;
  width?: number | string;
  height?: number;
}

/**
 * Illustrated vignette depicting the iconic lower scene from Josef Lada's
 * "Bubáci a hastrmani" book cover:
 * Vodník (Hastrman) in green frock coat and knitted cap smoking a clay pipe
 * at a rustic wooden table with an earthenware jug, chatting with a village elder.
 */
export const LadaCoverScene: React.FC<LadaCoverSceneProps> = ({
  className = '',
  width = '100%',
  height = 140,
}) => {
  return (
    <div
      className={`lada-cover-scene flex items-center justify-center my-2 select-none pointer-events-none ${className}`}
      style={{ width, height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 520 220"
        style={{ width: '100%', height: '100%', maxWidth: '520px' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Wooden floor planks */}
        <g id="wooden-floor">
          <line x1="30" y1="200" x2="490" y2="200" stroke="#1C1610" strokeWidth="3" />
          <line x1="30" y1="206" x2="490" y2="206" stroke="#8C5C36" strokeWidth="2.5" />
          <line x1="40" y1="212" x2="480" y2="212" stroke="#1C1610" strokeWidth="2" strokeDasharray="30 8 40 10" />
        </g>

        {/* Small picture frame on wall */}
        <g transform="translate(185, 30)">
          <rect x="0" y="0" width="32" height="38" fill="#C53026" stroke="#1C1610" strokeWidth="2.8" rx="2" />
          <rect x="5" y="5" width="22" height="28" fill="#FAF5E8" stroke="#1C1610" strokeWidth="1.8" />
          <path d="M 8,10 L 22,24 M 22,10 L 8,24" stroke="#3A7843" strokeWidth="2.4" />
        </g>

        {/* Rustic Wooden Table */}
        <g id="lada-rustic-table">
          {/* Table shadow */}
          <ellipse cx="270" cy="202" rx="100" ry="10" fill="rgba(28,22,16,0.18)" />
          {/* Back legs */}
          <line x1="200" y1="130" x2="190" y2="198" stroke="#1C1610" strokeWidth="10" strokeLinecap="round" />
          <line x1="200" y1="130" x2="190" y2="198" stroke="#8C5832" strokeWidth="6" strokeLinecap="round" />
          <line x1="330" y1="130" x2="340" y2="198" stroke="#1C1610" strokeWidth="10" strokeLinecap="round" />
          <line x1="330" y1="130" x2="340" y2="198" stroke="#8C5832" strokeWidth="6" strokeLinecap="round" />

          {/* Stretcher / crossbar */}
          <line x1="192" y1="168" x2="338" y2="168" stroke="#1C1610" strokeWidth="8" strokeLinecap="round" />
          <line x1="192" y1="168" x2="338" y2="168" stroke="#7A4B27" strokeWidth="4.5" strokeLinecap="round" />

          {/* Tabletop */}
          {/* Underboard */}
          <polygon points="170,126 360,126 352,142 178,142" fill="#7A4B27" stroke="#1C1610" strokeWidth="3" />
          {/* Green cloth top */}
          <polygon points="160,120 370,120 364,128 166,128" fill="#3D7843" stroke="#1C1610" strokeWidth="3" />
          <line x1="164" y1="124" x2="366" y2="124" stroke="#FDE047" strokeWidth="1.5" />
        </g>

        {/* Earthenware Jug with folk star */}
        <g id="ceramic-pitcher" transform="translate(245, 78)">
          {/* Pitcher shadow */}
          <ellipse cx="20" cy="46" rx="14" ry="4" fill="rgba(28,22,16,0.2)" />
          {/* Handle */}
          <path d="M 10,18 C -2,22 -2,38 10,40" fill="none" stroke="#1C1610" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M 10,18 C -2,22 -2,38 10,40" fill="none" stroke="#9A6138" strokeWidth="3" strokeLinecap="round" />
          {/* Body */}
          <path
            d="M 14,8 C 12,14 18,22 26,22 C 34,22 40,14 38,8 Z"
            fill="#B47B49"
            stroke="#1C1610"
            strokeWidth="2.8"
          />
          <path
            d="M 14,14 C 8,24 8,38 14,44 C 18,48 34,48 38,44 C 44,38 44,24 38,14 Z"
            fill="#B47B49"
            stroke="#1C1610"
            strokeWidth="3"
          />
          {/* Folk 5-pointed star on pitcher */}
          <polygon
            points="26,26 28,32 34,32 29,36 31,42 26,38 21,42 23,36 18,32 24,32"
            fill="#FAF5E8"
            stroke="#1C1610"
            strokeWidth="1.2"
          />
        </g>

        {/* Stool between table and peasant */}
        <g id="wooden-stool" transform="translate(345, 140)">
          <ellipse cx="20" cy="10" rx="18" ry="7" fill="#8C5C36" stroke="#1C1610" strokeWidth="3" />
          <ellipse cx="20" cy="9" rx="14" ry="4" fill="#3D7843" stroke="#1C1610" strokeWidth="1.8" />
          <line x1="10" y1="16" x2="6" y2="58" stroke="#1C1610" strokeWidth="6" strokeLinecap="round" />
          <line x1="10" y1="16" x2="6" y2="58" stroke="#7A4B27" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="16" x2="34" y2="58" stroke="#1C1610" strokeWidth="6" strokeLinecap="round" />
          <line x1="30" y1="16" x2="34" y2="58" stroke="#7A4B27" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* ============================================================== */}
        {/* LEFT CHARACTER: VODNÍK / HASTRMAN SEATED                       */}
        {/* ============================================================== */}
        <g id="seated-vodnik" transform="translate(75, 75)">
          {/* Wooden low stool */}
          <polygon points="40,110 80,110 76,124 44,124" fill="#8C5C36" stroke="#1C1610" strokeWidth="2.8" />
          <line x1="46" y1="124" x2="36" y2="148" stroke="#1C1610" strokeWidth="5" strokeLinecap="round" />
          <line x1="74" y1="124" x2="84" y2="148" stroke="#1C1610" strokeWidth="5" strokeLinecap="round" />

          {/* Feet & striped green ribbons/shoes */}
          <ellipse cx="115" cy="144" rx="16" ry="6" fill="#3D7843" stroke="#1C1610" strokeWidth="2.8" />
          <line x1="104" y1="140" x2="124" y2="140" stroke="#1C1610" strokeWidth="1.5" />
          <line x1="106" y1="144" x2="122" y2="144" stroke="#FAF5E8" strokeWidth="1.5" />

          {/* Green trousers & bent legs */}
          <path
            d="M 60,95 Q 70,118 90,118 Q 110,118 114,142"
            fill="none"
            stroke="#1C1610"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 60,95 Q 70,118 90,118 Q 110,118 114,142"
            fill="none"
            stroke="#4E8C56"
            strokeWidth="13"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Green Frock Coat with coat-tails hanging behind */}
          <path
            d="M 40,85 Q 26,112 36,134 Q 44,136 50,116"
            fill="#3D7843"
            stroke="#1C1610"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Button on back coat */}
          <circle cx="50" cy="94" r="3" fill="#D9A036" stroke="#1C1610" strokeWidth="1.8" />

          {/* Torso in green coat */}
          <path
            d="M 50,55 Q 80,58 84,95 Q 60,105 48,85 Z"
            fill="#3D7843"
            stroke="#1C1610"
            strokeWidth="3.2"
          />

          {/* Left hand holding long clay pipe with smoke */}
          <path d="M 68,68 Q 90,75 106,78" fill="none" stroke="#1C1610" strokeWidth="9" strokeLinecap="round" />
          <path d="M 68,68 Q 90,75 106,78" fill="none" stroke="#4E8C56" strokeWidth="5.5" strokeLinecap="round" />
          <circle cx="107" cy="77" r="4.5" fill="#FAF5E8" stroke="#1C1610" strokeWidth="2" />

          {/* Long pipe stem & red ceramic bowl */}
          <line x1="94" y1="46" x2="114" y2="78" stroke="#FAF5E8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="94" y1="46" x2="114" y2="78" stroke="#1C1610" strokeWidth="1" strokeDasharray="2 1" />
          {/* Pipe bowl */}
          <path d="M 112,74 L 118,74 L 116,68 L 110,68 Z" fill="#C53026" stroke="#1C1610" strokeWidth="1.8" />
          {/* Smoke puff */}
          <circle cx="114" cy="62" r="3.5" fill="rgba(240,240,240,0.85)" stroke="#1C1610" strokeWidth="1.2" />
          <circle cx="118" cy="54" r="5" fill="rgba(240,240,240,0.85)" stroke="#1C1610" strokeWidth="1.2" />

          {/* Green frog-like head profile */}
          <ellipse cx="76" cy="38" rx="14" ry="16" fill="#884A39" stroke="#1C1610" strokeWidth="3" />
          {/* Big eye */}
          <circle cx="82" cy="34" r="3.5" fill="#FAF5E8" stroke="#1C1610" strokeWidth="1.8" />
          <circle cx="83" cy="34" r="1.5" fill="#1C1610" />
          {/* Hooked nose & pipe mouth */}
          <path d="M 86,34 Q 93,38 88,43 L 83,44" fill="#884A39" stroke="#1C1610" strokeWidth="2.2" />

          {/* Green knitted winter cap with tassel */}
          <path
            d="M 65,30 Q 72,12 80,8 Q 88,12 88,30 Z"
            fill="#3D7843"
            stroke="#1C1610"
            strokeWidth="2.8"
          />
          {/* Cap ribbing */}
          <line x1="68" y1="26" x2="86" y2="26" stroke="#FAF5E8" strokeWidth="1.5" />
          <line x1="72" y1="20" x2="84" y2="20" stroke="#FAF5E8" strokeWidth="1.5" />
          <circle cx="80" cy="7" r="3.5" fill="#C53026" stroke="#1C1610" strokeWidth="1.8" />
          {/* Long green hair strands */}
          <path d="M 64,36 Q 54,48 52,66" fill="none" stroke="#2D6836" strokeWidth="4" strokeLinecap="round" />
          <path d="M 68,36 Q 58,48 58,68" fill="none" stroke="#2D6836" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* ============================================================== */}
        {/* RIGHT CHARACTER: PEASANT / GRANDFATHER (Dědeček v beranici)   */}
        {/* ============================================================== */}
        <g id="talking-peasant" transform="translate(370, 75)">
          {/* Shoes with straps */}
          <ellipse cx="38" cy="148" rx="14" ry="6" fill="#8C5C36" stroke="#1C1610" strokeWidth="2.6" />
          <ellipse cx="64" cy="148" rx="14" ry="6" fill="#8C5C36" stroke="#1C1610" strokeWidth="2.6" />

          {/* Green folk breeches with fringes */}
          <path d="M 38,98 L 38,144 M 58,98 L 64,144" stroke="#1C1610" strokeWidth="12" strokeLinecap="round" />
          <path d="M 38,98 L 38,144 M 58,98 L 64,144" stroke="#4E8C56" strokeWidth="8" strokeLinecap="round" />

          {/* Fringe on lower coat */}
          <path d="M 24,96 Q 50,102 78,92" stroke="#1C1610" strokeWidth="4" strokeLinecap="round" />
          <path d="M 24,96 L 24,105 M 32,97 L 32,106 M 40,98 L 40,108 M 48,99 L 48,107 M 58,98 L 58,106 M 68,96 L 68,105 M 76,94 L 76,102" stroke="#8C5C36" strokeWidth="2.2" />

          {/* Brown sheepskin jacket (kožich s beránkem) */}
          <path
            d="M 32,56 Q 66,56 74,94 Q 44,100 28,94 Z"
            fill="#9A653F"
            stroke="#1C1610"
            strokeWidth="3.2"
          />

          {/* Hands gesturing while talking */}
          {/* Left gesturing hand */}
          <path d="M 44,68 Q 24,78 12,82" stroke="#1C1610" strokeWidth="8" strokeLinecap="round" />
          <path d="M 44,68 Q 24,78 12,82" stroke="#9A653F" strokeWidth="5" strokeLinecap="round" />
          {/* Open gesturing fingers */}
          <path d="M 12,82 L 4,78 M 12,82 L 2,84 M 12,82 L 4,90 M 12,82 L 8,94" stroke="#E2B48A" strokeWidth="2.4" strokeLinecap="round" />

          {/* Right hand tucked behind back */}
          <path d="M 64,68 Q 80,74 84,90" stroke="#1C1610" strokeWidth="8" strokeLinecap="round" />
          <path d="M 64,68 Q 80,74 84,90" stroke="#9A653F" strokeWidth="5" strokeLinecap="round" />

          {/* Head in profile with characteristic Lada hooked nose & chin */}
          <ellipse cx="46" cy="38" rx="14" ry="16" fill="#E2B48A" stroke="#1C1610" strokeWidth="3" />
          {/* Eye */}
          <circle cx="38" cy="36" r="3" fill="#FAF5E8" stroke="#1C1610" strokeWidth="1.6" />
          <circle cx="37" cy="36" r="1.3" fill="#1C1610" />
          {/* Prominent hooked nose & talking mouth */}
          <path d="M 38,36 Q 22,40 24,46 Q 32,48 36,46" fill="#E2B48A" stroke="#1C1610" strokeWidth="2.4" />
          <ellipse cx="34" cy="50" rx="3" ry="2" fill="#8B1D1D" />
          {/* Wispy hair on neck */}
          <path d="M 56,42 Q 68,48 66,58" stroke="#8C5C36" strokeWidth="3.5" strokeLinecap="round" />

          {/* Ribbed warm winter cap (beranice) with ear flaps */}
          <path
            d="M 34,32 Q 44,14 54,14 Q 64,18 64,34 Z"
            fill="#88432E"
            stroke="#1C1610"
            strokeWidth="2.8"
          />
          {/* Cap ribbing lines */}
          <line x1="38" y1="28" x2="62" y2="28" stroke="#FAF5E8" strokeWidth="1.5" />
          <line x1="42" y1="22" x2="60" y2="22" stroke="#FAF5E8" strokeWidth="1.5" />
          <line x1="46" y1="17" x2="56" y2="17" stroke="#FAF5E8" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
