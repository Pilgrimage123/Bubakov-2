import React from 'react';
import { LadaFrieze } from './LadaFrieze';

interface BubakovCoverTitleProps {
  className?: string;
  showCharacters?: boolean;
  showSubtitle?: boolean;
  compact?: boolean;
}

/**
 * Monumental Josef Lada title inspired directly by the iconic cover of
 * "BUBÁCI A HASTRMANI" (Jos. Lada, Nakladatelství Práce).
 *
 * Features:
 * - Hand-lettered display "JOS. LĀDĀ :" with stacked ring colon
 * - Hand-drawn folk red 5-pointed star
 * - Strašák (scarecrow spook) on the left
 * - Čertík (little black devil with pitchfork and red tongue) on the right
 * - Massive hand-inked "BUBÁKOV" in red folk ribbon lettering with candy-striped flourishes
 * - Hanging diagonal-striped red & cream ribbon streamers on both flanks
 * - Secondary moss-green folk lettering "A HASTRMANI"
 * - Soft sage-green meadow watercolor wash in background
 * - Lada scalloped frieze border underneath
 */
export const BubakovCoverTitle: React.FC<BubakovCoverTitleProps> = ({
  className = '',
  showCharacters = true,
  showSubtitle = true,
  compact = false,
}) => {
  return (
    <header className={`bubakov-cover-header relative select-none w-full flex flex-col items-center justify-center my-1 ${className}`}>
      {/* Hand-drawn 5-pointed red star */}
      <div className="my-0.5">
        <svg width="28" height="28" viewBox="0 0 40 40" className="drop-shadow-sm">
            {/* Ink outer outline */}
            <polygon
              points="20,2 25,14 38,15 28,24 31,37 20,30 9,37 12,24 2,15 15,14"
              fill="#C53026"
              stroke="#1C1610"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Inner folk highlight */}
            <polygon
              points="20,7 23,15 32,16 25,22 27,31 20,26 13,31 15,22 8,16 17,15"
              fill="none"
              stroke="#FAF5E8"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>

      {/* Main Illustration & Typography Stage */}
      <div className="relative w-full max-w-[820px] px-2 sm:px-4 flex items-center justify-center">
        <svg
          viewBox="0 0 860 195"
          className="w-full h-auto max-h-[205px] drop-shadow-md overflow-visible"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Bubákov - Ladovská výprava"
        >
          <defs>
            {/* Striped candy/barber-pole ribbon pattern (Red & Cream) */}
            <pattern
              id="folk-ribbon-stripes"
              width="18"
              height="18"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="18" height="18" fill="#C53026" />
              <rect width="9" height="18" fill="#FAF5E8" />
              <line x1="0" y1="0" x2="0" y2="18" stroke="#1C1610" strokeWidth="1" />
              <line x1="9" y1="0" x2="9" y2="18" stroke="#1C1610" strokeWidth="1" />
            </pattern>

            {/* Red text hatched fill pattern */}
            <pattern
              id="folk-red-hatch"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="10" height="10" fill="#C53026" />
              <line x1="0" y1="0" x2="0" y2="10" stroke="#FDE8CD" strokeWidth="2.2" />
            </pattern>

            {/* Ink filter for slightly organic rough line pressure */}
            <filter id="lada-ink-spread" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="3" dy="3.5" stdDeviation="0.2" floodColor="#1C1610" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* Pale Sage Green Watercolor Meadow Contour (like the book cover wash) */}
          <path
            d="M 160,50 Q 240,25 360,40 Q 480,20 620,35 Q 720,60 690,130 Q 640,165 480,165 Q 320,165 180,150 Q 130,110 160,50 Z"
            fill="#D5E3C9"
            fillOpacity="0.55"
          />

          {/* ============================================================== */}
          {/* LEFT FIGURE: STRAŠÁK / BUBÁK (from top left of the book cover) */}
          {/* ============================================================== */}
          {showCharacters && (
            <g id="lada-cover-strasak" transform="translate(18, 12)">
              {/* Wooden pole */}
              <rect x="70" y="80" width="8" height="90" fill="#8C5C36" stroke="#1C1610" strokeWidth="2.5" />
              {/* Lower straw skirt */}
              <polygon points="56,120 92,120 102,150 78,144 74,152 46,146" fill="#D9A036" stroke="#1C1610" strokeWidth="2.4" />
              {/* Outstretched straw arm left */}
              <path d="M 60,65 Q 40,55 16,36" stroke="#1C1610" strokeWidth="7" strokeLinecap="round" />
              <path d="M 60,65 Q 40,55 16,36" stroke="#D9A036" strokeWidth="4.2" strokeLinecap="round" />
              <line x1="16" y1="36" x2="6" y2="30" stroke="#1C1610" strokeWidth="2.5" />
              <line x1="16" y1="36" x2="8" y2="42" stroke="#1C1610" strokeWidth="2.5" />
              <line x1="16" y1="36" x2="14" y2="48" stroke="#1C1610" strokeWidth="2.5" />

              {/* Outstretched straw arm right */}
              <path d="M 88,65 Q 110,55 132,38" stroke="#1C1610" strokeWidth="7" strokeLinecap="round" />
              <path d="M 88,65 Q 110,55 132,38" stroke="#D9A036" strokeWidth="4.2" strokeLinecap="round" />
              <line x1="132" y1="38" x2="144" y2="34" stroke="#1C1610" strokeWidth="2.5" />
              <line x1="132" y1="38" x2="142" y2="46" stroke="#1C1610" strokeWidth="2.5" />
              <line x1="132" y1="38" x2="136" y2="52" stroke="#1C1610" strokeWidth="2.5" />

              {/* Body / ragged coat */}
              <polygon points="62,60 86,60 92,118 56,118" fill="#B47B49" stroke="#1C1610" strokeWidth="3" />
              {/* Coat buttons */}
              <circle cx="74" cy="76" r="2.5" fill="#1C1610" />
              <circle cx="74" cy="94" r="2.5" fill="#1C1610" />

              {/* Potato / burlap Head */}
              <ellipse cx="74" cy="40" rx="18" ry="24" fill="#C79663" stroke="#1C1610" strokeWidth="3" />
              {/* Straw tufts on head */}
              <line x1="74" y1="16" x2="74" y2="6" stroke="#D9A036" strokeWidth="3" />
              <line x1="70" y1="18" x2="63" y2="8" stroke="#D9A036" strokeWidth="3" />
              <line x1="78" y1="18" x2="85" y2="9" stroke="#D9A036" strokeWidth="3" />

              {/* Open toothy mouth with hilarious jagged teeth */}
              <ellipse cx="74" cy="46" rx="9" ry="7" fill="#8B1D1D" stroke="#1C1610" strokeWidth="2.2" />
              {/* Teeth */}
              <path d="M 68,42 L 70,46 L 72,42 L 74,46 L 76,42 L 78,46 L 80,42" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.2" />
              <path d="M 68,50 L 71,47 L 74,50 L 77,47 L 80,50" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.2" />

              {/* Button eyes */}
              <circle cx="68" cy="32" r="3.2" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2" />
              <circle cx="68" cy="32" r="1.2" fill="#1C1610" />
              <circle cx="80" cy="32" r="3.2" fill="#FAF6ED" stroke="#1C1610" strokeWidth="2" />
              <circle cx="80" cy="32" r="1.2" fill="#1C1610" />
            </g>
          )}

          {/* ============================================================== */}
          {/* RIGHT FIGURE: ČERTÍK (from top right of the book cover)        */}
          {/* ============================================================== */}
          {showCharacters && (
            <g id="lada-cover-cert" transform="translate(680, 10)">
              {/* Green round pedestal with foliage */}
              <ellipse cx="64" cy="162" rx="34" ry="12" fill="#3D7843" stroke="#1C1610" strokeWidth="3" />
              <ellipse cx="64" cy="160" rx="28" ry="7" fill="#589B5F" />
              {/* Grass tufts on pedestal */}
              <path d="M 44,156 L 46,148 L 50,156 M 58,155 L 61,146 L 64,155 M 76,155 L 80,147 L 82,155" stroke="#1C1610" strokeWidth="1.8" fill="none" />

              {/* Legs & hooves */}
              <path d="M 52,118 Q 48,136 48,156 M 74,118 Q 78,136 78,156" stroke="#1C1610" strokeWidth="6" strokeLinecap="round" />
              <path d="M 52,118 Q 48,136 48,156 M 74,118 Q 78,136 78,156" stroke="#2B1E19" strokeWidth="3.5" strokeLinecap="round" />

              {/* Pitchfork held in right hand */}
              <line x1="28" y1="20" x2="42" y2="155" stroke="#1C1610" strokeWidth="3" />
              {/* 3 prongs */}
              <path d="M 18,22 Q 28,34 38,22" fill="none" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" />
              <line x1="18" y1="22" x2="16" y2="10" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" />
              <line x1="28" y1="28" x2="28" y2="8" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" />
              <line x1="38" y1="22" x2="40" y2="10" stroke="#1C1610" strokeWidth="3" strokeLinecap="round" />

              {/* Devil torso */}
              <ellipse cx="64" cy="94" rx="16" ry="24" fill="#241B17" stroke="#1C1610" strokeWidth="3" />
              {/* Hairy tufts on torso */}
              <path d="M 54,84 L 51,88 M 55,96 L 50,100 M 73,88 L 77,91 M 72,100 L 76,103" stroke="#FAF6ED" strokeWidth="1.2" />

              {/* Arm holding pitchfork */}
              <path d="M 52,82 Q 40,78 35,52" stroke="#1C1610" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 52,82 Q 40,78 35,52" stroke="#241B17" strokeWidth="3.5" strokeLinecap="round" fill="none" />

              {/* Arm on hip / left arm */}
              <path d="M 76,82 Q 92,92 84,106" stroke="#1C1610" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 76,82 Q 92,92 84,106" stroke="#241B17" strokeWidth="3.5" strokeLinecap="round" fill="none" />

              {/* Devil Head */}
              <circle cx="64" cy="56" r="17" fill="#241B17" stroke="#1C1610" strokeWidth="3" />
              {/* Horns */}
              <path d="M 54,44 Q 50,30 42,26 Q 52,36 56,43 Z" fill="#D9A036" stroke="#1C1610" strokeWidth="2.2" />
              <path d="M 74,44 Q 78,30 86,26 Q 76,36 72,43 Z" fill="#D9A036" stroke="#1C1610" strokeWidth="2.2" />

              {/* Eyes */}
              <circle cx="58" cy="52" r="3.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.8" />
              <circle cx="58" cy="52" r="1.5" fill="#1C1610" />
              <circle cx="70" cy="52" r="3.5" fill="#FAF6ED" stroke="#1C1610" strokeWidth="1.8" />
              <circle cx="70" cy="52" r="1.5" fill="#1C1610" />

              {/* Long curling red devil tongue sticking out! */}
              <path
                d="M 64,62 Q 74,74 76,92 Q 86,112 108,120 Q 94,124 74,104 Q 68,88 64,64 Z"
                fill="#C53026"
                stroke="#1C1610"
                strokeWidth="2.2"
                strokeLinejoin="round"
              />
            </g>
          )}

          {/* ============================================================== */}
          {/* CURLED HANGING STREAMERS / FOLK RIBBONS (Flanking the title)   */}
          {/* ============================================================== */}
          {/* Left Ribbon Streamer */}
          <g id="ribbon-streamer-left">
            <path
              d="M 166,74 Q 130,86 142,120 Q 152,148 136,176 Q 124,196 112,206 L 118,210 Q 134,198 146,172 Q 162,142 152,118 Q 142,94 172,82 Z"
              fill="url(#folk-ribbon-stripes)"
              stroke="#1C1610"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            {/* Notch at bottom of ribbon */}
            <polygon points="112,206 118,210 114,216" fill="#1C1610" />
          </g>

          {/* Right Ribbon Streamer */}
          <g id="ribbon-streamer-right">
            <path
              d="M 696,74 Q 732,86 720,120 Q 710,148 726,176 Q 738,196 750,206 L 744,210 Q 728,198 716,172 Q 700,142 710,118 Q 720,94 690,82 Z"
              fill="url(#folk-ribbon-stripes)"
              stroke="#1C1610"
              strokeWidth="2.6"
              strokeLinejoin="round"
            />
            <polygon points="750,206 744,210 748,216" fill="#1C1610" />
          </g>

          {/* ============================================================== */}
          {/* MAIN LETTERING: "BUBÁKOV" (Lada Folk Red Display Font)        */}
          {/* ============================================================== */}
          <g id="bubakov-word-group" filter="url(#lada-ink-spread)">
            {/* Background duplicate for heavy 3D ink shadow offset */}
            <text
              x="430"
              y="114"
              textAnchor="middle"
              fill="#1C1610"
              stroke="#1C1610"
              strokeWidth="12"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "82px",
                fontWeight: 900,
                letterSpacing: "8px",
              }}
            >
              BUBÁKOV
            </text>

            {/* Folk Ribbon Swash on the Initial 'B' (Top-Left curlicue) */}
            <path
              d="M 226,58 C 210,48 185,52 176,68 C 170,80 180,94 195,92 C 208,90 216,78 226,62 Z"
              fill="url(#folk-ribbon-stripes)"
              stroke="#1C1610"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Decorative loop notch */}
            <circle cx="186" cy="74" r="3.5" fill="#FAF5E8" stroke="#1C1610" strokeWidth="2" />

            {/* Red main fill with folk hatched texture */}
            <text
              x="430"
              y="112"
              textAnchor="middle"
              fill="url(#folk-red-hatch)"
              stroke="#FAF5E8"
              strokeWidth="2.5"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "82px",
                fontWeight: 900,
                letterSpacing: "8px",
              }}
            >
              BUBÁKOV
            </text>

            {/* Inner inline white folk contour / pinstripe */}
            <text
              x="430"
              y="112"
              textAnchor="middle"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeDasharray="14 3"
              style={{
                fontFamily: "'Eczar', serif",
                fontSize: "82px",
                fontWeight: 900,
                letterSpacing: "8px",
              }}
            >
              BUBÁKOV
            </text>

            {/* Custom stylized acute accent on 'Á' */}
            <g transform="translate(378, 38)">
              {/* Heavy black shadow */}
              <polygon points="12,18 28,2 34,4 18,22" fill="#1C1610" stroke="#1C1610" strokeWidth="5" strokeLinejoin="round" />
              {/* Red fill */}
              <polygon points="12,18 28,2 34,4 18,22" fill="#C53026" stroke="#FAF5E8" strokeWidth="1.8" strokeLinejoin="round" />
              <line x1="16" y1="18" x2="28" y2="6" stroke="#FAF5E8" strokeWidth="1.5" />
            </g>
          </g>

          {/* Decorative folk star points along bottom */}
          <g transform="translate(430, 152)">
            <circle cx="-60" cy="0" r="3" fill="#C53026" stroke="#1C1610" strokeWidth="1.5" />
            <line x1="-50" y1="0" x2="-20" y2="0" stroke="#1C1610" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="#D9A036" stroke="#1C1610" strokeWidth="1.5" />
            <line x1="20" y1="0" x2="50" y2="0" stroke="#1C1610" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="60" cy="0" r="3" fill="#C53026" stroke="#1C1610" strokeWidth="1.5" />
          </g>
        </svg>
      </div>

      {/* Subtitle in authentic Czech storybook typography */}
      {showSubtitle && (
        <p
          className="text-center px-4 text-xs sm:text-sm md:text-base font-bold text-amber-950 max-w-[720px] my-1"
          style={{
            fontFamily: "'Eczar', serif",
            lineHeight: '1.35',
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          Česká vesnice, kde se nezbední bubáci zklidní poctivým výpraskem nebo je usmíří voňavá pečená buchta.
        </p>
      )}

      {/* Iconic Scalloped Folk Frieze (Lada Scallops) */}
      <LadaFrieze repeatCount={compact ? 14 : 22} height={compact ? 18 : 22} />
    </header>
  );
};
