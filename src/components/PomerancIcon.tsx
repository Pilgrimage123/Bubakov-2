import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export interface PomerancIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * Pomeranč z Orientu - vzácné zámořské ovoce v ladovském pohádkovém stylu.
 * Sytě oranžové kulaté tělo s pevnou černou konturou, zelený lístek se stopkou,
 * jemná textura citrusové kůry a zářivý kvašový lesk.
 */
export const PomerancIcon: React.FC<PomerancIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <LadaCanvasSvg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={pixelSize}
      height={pixelSize}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        ...style,
      }}
      role="img"
      aria-label="Pomeranč z Orientu - posilující zámořské ovoce"
      {...props}
    >
      <defs>
        {/* Pozemní stín */}
        <radialGradient id="pomShadow" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="#1A0D06" stopOpacity="0.35" />
          <stop offset="90%" stopColor="#1A0D06" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1A0D06" stopOpacity="0" />
        </radialGradient>

        {/* Šťavnaté tělo pomeranče v ladovském kvaši */}
        <radialGradient id="pomBody" cx="38%" cy="36%" r="62%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="25%" stopColor="#FDBA74" />
          <stop offset="55%" stopColor="#FB923C" />
          <stop offset="78%" stopColor="#EA580C" />
          <stop offset="92%" stopColor="#C2410C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </radialGradient>

        {/* Zelený lístek */}
        <linearGradient id="pomLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86EFAC" />
          <stop offset="45%" stopColor="#22C55E" />
          <stop offset="80%" stopColor="#15803D" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        {/* Hnědá dřevitá stopka */}
        <linearGradient id="pomStem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
      </defs>

      {/* Spodní stín */}
      <ellipse cx="100" cy="172" rx="72" ry="20" fill="url(#pomShadow)" />

      {/* Main animated fruit body */}
      <g className="lada-anim-float">
        {/* Dřevitá stopka */}
        <path
        d="M 100 48 Q 98 28 88 18 Q 95 16 104 22 Q 106 32 103 48 Z"
        fill="url(#pomStem)"
        stroke="#1E150B"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Orientální zelený lístek s žebrováním */}
      <path
        d="M 100 40 C 122 18 162 24 175 42 C 160 62 120 62 100 40 Z"
        fill="url(#pomLeaf)"
        stroke="#1E150B"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Žilkování lístku */}
      <path
        d="M 104 41 C 126 34 152 38 170 42"
        fill="none"
        stroke="#DCFCE7"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M 124 37 Q 132 30 138 27"
        fill="none"
        stroke="#15803D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M 142 40 Q 150 48 156 52"
        fill="none"
        stroke="#15803D"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Druhý malý lístek vlevo */}
      <path
        d="M 98 44 C 82 32 60 36 52 46 C 64 56 86 54 98 44 Z"
        fill="url(#pomLeaf)"
        stroke="#1E150B"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
      <path
        d="M 94 44 C 80 40 64 42 56 46"
        fill="none"
        stroke="#DCFCE7"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Hlavní koule pomeranče - poctivá ladovská perovka */}
      <circle
        cx="100"
        cy="110"
        r="68"
        fill="url(#pomBody)"
        stroke="#1E150B"
        strokeWidth="4"
      />

      {/* Citrusová kůra - póry a tečky (charakteristický detail pomeranče) */}
      <g fill="#9A3412" opacity="0.45">
        <circle cx="70" cy="85" r="2" />
        <circle cx="85" cy="78" r="1.8" />
        <circle cx="118" cy="82" r="2" />
        <circle cx="132" cy="94" r="1.8" />
        <circle cx="60" cy="112" r="2" />
        <circle cx="75" cy="128" r="1.8" />
        <circle cx="95" cy="142" r="2.2" />
        <circle cx="120" cy="136" r="2" />
        <circle cx="140" cy="120" r="1.8" />
        <circle cx="110" cy="160" r="1.8" />
        <circle cx="82" cy="155" r="2" />
        <circle cx="148" cy="104" r="2" />
      </g>

      {/* Ladovský kvašový lesk (světelný srpek v horní levé části) */}
      <path
        d="M 64 80 C 78 64 100 58 122 62"
        fill="none"
        stroke="#FFEDD5"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M 54 98 C 50 114 54 130 64 144"
        fill="none"
        stroke="#FED7AA"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.55"
      />

        {/* Růžice u stopky (kališní lístky) */}
        <path
          d="M 96 46 Q 100 42 104 46 Q 108 50 102 52 Q 96 50 96 46 Z"
          fill="#14532D"
          stroke="#1E150B"
          strokeWidth="2"
        />
      </g>

      {/* Zlaté záření vzácného orientálního ovoce */}
      <g className="lada-anim-glint">
        <circle cx="50" cy="58" r="3" fill="#FDE047" opacity="0.8" />
        <circle cx="158" cy="74" r="2.5" fill="#FDE047" opacity="0.8" />
        <circle cx="152" cy="148" r="2" fill="#FDE047" opacity="0.7" />
      </g>
    </LadaCanvasSvg>
  );
};
