import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export interface CzechBuchtaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const BUCHTA_ANIM_STYLES = `
  @keyframes ladaBuchtaBob {
    0%, 100% {
      transform: translateY(0px) rotate(-1.5deg);
    }
    50% {
      transform: translateY(-2.2px) rotate(2deg);
    }
  }
  @keyframes ladaBuchtaSteam1 {
    0% {
      transform: translateY(2px) scale(0.85);
      opacity: 0;
    }
    45% {
      transform: translateY(-3px) scale(1.04);
      opacity: 0.92;
    }
    100% {
      transform: translateY(-8px) scale(1.18);
      opacity: 0;
    }
  }
  @keyframes ladaBuchtaSteam2 {
    0% {
      transform: translateY(2px) scale(0.8);
      opacity: 0;
    }
    50% {
      transform: translateY(-3.5px) scale(1.08);
      opacity: 0.9;
    }
    100% {
      transform: translateY(-9px) scale(1.22);
      opacity: 0;
    }
  }
  @keyframes ladaBuchtaSparkle {
    0%, 100% {
      transform: scale(0.55) rotate(0deg);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.22) rotate(45deg);
      opacity: 1;
    }
  }
  .lada-buchta-base {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBuchtaBob 2.6s ease-in-out infinite;
  }
  .lada-buchta-steam-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBuchtaSteam1 2.4s ease-in-out infinite;
  }
  .lada-buchta-steam-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBuchtaSteam2 2.7s ease-in-out infinite 0.95s;
  }
  .lada-buchta-sparkle-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBuchtaSparkle 2.2s ease-in-out infinite;
  }
  .lada-buchta-sparkle-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaBuchtaSparkle 2.5s ease-in-out infinite 0.8s;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-buchta-base,
    .lada-buchta-steam-1,
    .lada-buchta-steam-2,
    .lada-buchta-sparkle-1,
    .lada-buchta-sparkle-2 {
      animation: none !important;
    }
  }
`;

export const CzechBuchtaIcon: React.FC<CzechBuchtaIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <LadaCanvasSvg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 90"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        flexShrink: 0,
        ...style,
      }}
      role="img"
      aria-label="Česká pečená buchta s povidly sypaná moučkovým cukrem"
      {...props}
    >
      <style>{BUCHTA_ANIM_STYLES}</style>
      <defs>
        <radialGradient id="cbShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A1612" stopOpacity="0.38" />
          <stop offset="65%" stopColor="#1A1612" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#1A1612" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cbCrust" x1="20%" y1="8%" x2="82%" y2="88%">
          <stop offset="0%" stopColor="#FACC15" />
          <stop offset="22%" stopColor="#D9A036" />
          <stop offset="55%" stopColor="#D97706" />
          <stop offset="82%" stopColor="#8C5A35" />
          <stop offset="100%" stopColor="#5E3A21" />
        </linearGradient>
        <linearGradient id="cbGlazeSheen" x1="15%" y1="5%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
          <stop offset="45%" stopColor="#D9A036" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5E3A21" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="cbCrumb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="45%" stopColor="#FEF08A" />
          <stop offset="80%" stopColor="#F3E9D2" />
          <stop offset="100%" stopColor="#D9A036" />
        </linearGradient>
        <radialGradient id="cbPovidla" cx="38%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#C83E31" />
          <stop offset="35%" stopColor="#6E1E3B" />
          <stop offset="75%" stopColor="#3D0B1C" />
          <stop offset="100%" stopColor="#1A1612" />
        </radialGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="62" cy="76" rx="48" ry="11.5" fill="url(#cbShadow)" />

      {/* Base animated pastry group: gentle floating/breathing bob + slight 2° tilt */}
      <g className="lada-anim-float lada-buchta-base">
        {/* Decorative red-and-white Czech cottage gingham/folk napkin corner under the bun */}
        <path
          d="M 14 66 C 28 79, 58 83, 88 77 C 98 75, 108 68, 113 61 C 102 69, 76 74, 48 72 C 30 71, 20 69, 14 66 Z"
          fill="#F3E9D2"
          stroke="#1A1612"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M 26 70 C 46 76, 74 76, 98 69"
          fill="none"
          stroke="#C83E31"
          strokeWidth="2.2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />

        {/* Pillowy soft pale-gold pulled-apart yeast dough base (střída z pekáče) */}
        <path
          d="M 20 43 C 16 53, 20 67, 32 72 C 49 77, 81 74, 99 64 C 109 59, 111 46, 107 36 C 103 24, 88 18, 68 18 C 44 18, 26 26, 20 43 Z"
          fill="url(#cbCrumb)"
          stroke="#1A1612"
          strokeWidth="3.3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Darker gouache depth shade along lower belly */}
        <path
          d="M 30 66 C 48 73, 78 71, 97 62 C 103 58, 107 52, 107 45 C 102 54, 82 64, 56 64 C 44 64, 35 63, 30 66 Z"
          fill="#A66E40"
          opacity="0.45"
        />

        {/* Golden-brown butter-brushed baked top crust (zlatavá kůrčička potřená máslem) */}
        <path
          d="M 27 36 C 31 23, 48 17, 70 17 C 90 17, 104 23, 107 35 C 109 45, 104 56, 96 61 C 84 66, 67 62, 51 56 C 39 52, 29 45, 27 36 Z"
          fill="url(#cbCrust)"
          stroke="#1A1612"
          strokeWidth="2.9"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Multi-tone gouache glaze sheen on the baked dome */}
        <path
          d="M 32 34 C 36 24, 50 19, 69 19 C 86 19, 98 24, 101 34 C 103 42, 99 51, 91 55 C 80 52, 62 46, 48 42 C 38 39, 33 36, 32 34 Z"
          fill="url(#cbGlazeSheen)"
          opacity="0.9"
        />

        {/* Warm cream/gold highlight stroke along the upper crust arch */}
        <path
          d="M 35 28 C 46 21, 66 20, 86 24"
          fill="none"
          stroke="#FEF08A"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Pulled-apart front-left side cheek showing soft crumb & rich dark plum povidla */}
        <path
          d="M 21 42 C 18 48, 17 57, 23 65 C 27 70, 36 72, 45 69 C 43 61, 38 52, 33 46 C 28 41, 24 40, 21 42 Z"
          fill="url(#cbCrumb)"
          stroke="#1A1612"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M 24 48 C 27 49, 30 53, 29 57"
          fill="none"
          stroke="#D9A036"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 26 60 C 29 64, 34 65, 38 66"
          fill="none"
          stroke="#FFFDF7"
          strokeWidth="2.1"
          strokeLinecap="round"
        />

        {/* Rich dark plum jam (švestková povidla) & poppy-curd swirl peeking out */}
        <ellipse
          cx="33.5"
          cy="56.5"
          rx="7.5"
          ry="5.2"
          transform="rotate(-14 33.5 56.5)"
          fill="url(#cbPovidla)"
          stroke="#1A1612"
          strokeWidth="1.8"
        />
        <ellipse
          cx="32.5"
          cy="55.2"
          rx="4.2"
          ry="2.4"
          transform="rotate(-14 32.5 55.2)"
          fill="#C83E31"
          opacity="0.75"
        />
        <circle cx="31" cy="54" r="1.2" fill="#FFFDF7" opacity="0.9" />
        <circle cx="35.5" cy="57.5" r="0.9" fill="#FEF08A" opacity="0.85" />

        {/* Generous powdered sugar (moučkový cukr) blanket & delicate sugar piping */}
        <g fill="#FFFDF7">
          <ellipse cx="65" cy="28" rx="18" ry="5.5" fill="#FFFDF7" opacity="0.45" />
          <ellipse cx="62" cy="34" rx="21" ry="6.5" fill="#F3E9D2" opacity="0.35" />
          {/* Powdered sugar puffs */}
          <circle cx="48" cy="25" r="1.5" />
          <circle cx="53" cy="23" r="1.9" />
          <circle cx="58" cy="22" r="1.7" />
          <circle cx="63" cy="24" r="2.1" />
          <circle cx="68" cy="23" r="1.8" />
          <circle cx="73" cy="25" r="1.7" />
          <circle cx="78" cy="27" r="1.5" />
          <circle cx="44" cy="29" r="1.4" />
          <circle cx="49" cy="28" r="2.0" />
          <circle cx="54" cy="27" r="2.3" />
          <circle cx="59" cy="28" r="2.1" />
          <circle cx="65" cy="29" r="2.4" />
          <circle cx="70" cy="28" r="2.1" />
          <circle cx="76" cy="30" r="1.8" />
          <circle cx="82" cy="31" r="1.5" />
          <circle cx="42" cy="34" r="1.3" />
          <circle cx="47" cy="33" r="1.8" />
          <circle cx="52" cy="32" r="2.2" />
          <circle cx="57" cy="33" r="2.5" />
          <circle cx="63" cy="34" r="2.3" />
          <circle cx="68" cy="34" r="2.0" />
          <circle cx="74" cy="35" r="1.9" />
          <circle cx="80" cy="36" r="1.6" />
          <circle cx="86" cy="37" r="1.4" />
          <circle cx="46" cy="38" r="1.5" />
          <circle cx="51" cy="37" r="2.0" />
          <circle cx="56" cy="38" r="2.1" />
          <circle cx="62" cy="39" r="1.9" />
          <circle cx="67" cy="40" r="1.8" />
          <circle cx="73" cy="41" r="1.7" />
          <circle cx="79" cy="42" r="1.5" />
          <circle cx="85" cy="43" r="1.3" />
          <circle cx="53" cy="43" r="1.6" />
          <circle cx="59" cy="44" r="1.7" />
          <circle cx="65" cy="45" r="1.6" />
          <circle cx="71" cy="46" r="1.5" />
          <circle cx="77" cy="47" r="1.4" />
          <circle cx="39" cy="27" r="1.0" />
          <circle cx="43" cy="23" r="1.1" />
          <circle cx="51" cy="20" r="1.2" />
          <circle cx="62" cy="20" r="1.3" />
          <circle cx="72" cy="21" r="1.1" />
          <circle cx="82" cy="24" r="1.1" />
          <circle cx="88" cy="29" r="1.0" />
          <circle cx="92" cy="36" r="1.1" />
        </g>

        {/* Secondary detail: Twinkling sugar/spice 4-point sparkles */}
        <g className="lada-buchta-sparkle-1">
          <path
            d="M 61 21 L 62.2 24.2 L 65.4 25.4 L 62.2 26.6 L 61 29.8 L 59.8 26.6 L 56.6 25.4 L 59.8 24.2 Z"
            fill="#FFFDF7"
            stroke="#1A1612"
            strokeWidth="0.9"
            strokeLinejoin="round"
          />
          <circle cx="61" cy="25.4" r="1.3" fill="#FEF08A" />
        </g>
        <g className="lada-buchta-sparkle-2">
          <path
            d="M 83 31 L 83.9 33.3 L 86.2 34.2 L 83.9 35.1 L 83 37.4 L 82.1 35.1 L 79.8 34.2 L 82.1 33.3 Z"
            fill="#FEF08A"
            stroke="#1A1612"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>
      </g>

      {/* Secondary detail: 2 staggered rising cream/ink steam wisps */}
      <g className="lada-anim-steam-1 lada-buchta-steam-1">
        <path
          d="M 50 15 C 46 10, 54 6, 49 1"
          fill="none"
          stroke="#1A1612"
          strokeWidth="3.8"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M 50 15 C 46 10, 54 6, 49 1"
          fill="none"
          stroke="#FFFDF7"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
      <g className="lada-anim-steam-2 lada-buchta-steam-2">
        <path
          d="M 70 16 C 74 11, 66 7, 71 2"
          fill="none"
          stroke="#1A1612"
          strokeWidth="3.6"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M 70 16 C 74 11, 66 7, 71 2"
          fill="none"
          stroke="#F3E9D2"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>
    </LadaCanvasSvg>
  );
};
