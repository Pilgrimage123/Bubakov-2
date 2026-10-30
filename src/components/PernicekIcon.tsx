import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export interface PernicekIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * Malé jednoduše bíle zdobené perníkové srdíčko
 * Slouží jako vizuální ikona počtu sebraných / nasbíraných perníčků v HUDu, nůši i statistikách,
 * a zároveň jako model pro základní velikost perníčku (small).
 */
export const PernicekIcon: React.FC<PernicekIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <LadaCanvasSvg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
      width={pixelSize}
      height={pixelSize}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        flexShrink: 0,
        ...style,
      }}
      role="img"
      aria-label="Perníkové srdíčko"
      {...props}
    >
      <defs>
        {/* Jemný přízemní stín */}
        <filter id="pIconShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.8" dy="1.6" stdDeviation="1.2" floodColor="#220D04" floodOpacity="0.38" />
        </filter>

        {/* Zapečený medový kvašový gradient perníkového těsta */}
        <radialGradient id="pBakeGrad" cx="44%" cy="38%" r="58%">
          <stop offset="0%" stopColor="#A85724" />
          <stop offset="35%" stopColor="#8C4215" />
          <stop offset="75%" stopColor="#6E2F0B" />
          <stop offset="100%" stopColor="#4A1C04" />
        </radialGradient>

        {/* Měkký vnitřní odlesk medové glazury */}
        <linearGradient id="pGlazeGrad" x1="25%" y1="15%" x2="75%" y2="85%">
          <stop offset="0%" stopColor="#D97706" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#B45309" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#451A03" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      <g filter="url(#pIconShadow)" className="lada-anim-float">
        {/* Korpus perníkového srdíčka */}
        <path
          d="M 18,9.5
             C 21.8,4.2 31,6 31,14.8
             C 31,21.8 23.8,26.6 18,31
             C 12.2,26.6 5,21.8 5,14.8
             C 5,6 14.2,4.2 18,9.5 Z"
          fill="url(#pBakeGrad)"
          stroke="#2B1205"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Jemný teplý medový klenutý lesk */}
        <path
          d="M 18,10.8
             C 21.2,6 29.2,7.6 29.2,15
             C 29.2,20.8 22.8,25 18,29
             C 13.2,25 6.8,20.8 6.8,15
             C 6.8,7.6 14.8,6 18,10.8 Z"
          fill="url(#pGlazeGrad)"
        />

        {/* Vnitřní bílá cukrová linka (jednoduché lidové orámování) */}
        <path
          d="M 18,12.6
             C 20.8,8.4 27.4,9.6 27.4,15.2
             C 27.4,19.8 21.8,23.6 18,27.2
             C 14.2,23.6 8.6,19.8 8.6,15.2
             C 8.6,9.6 15.2,8.4 18,12.6 Z"
          fill="none"
          stroke="#FFFDF8"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Jemné cukrové tečky podél horních obloučků srdíčka */}
        <circle cx="13" cy="9.2" r="0.75" fill="#FFFDF8" />
        <circle cx="9.6" cy="12.2" r="0.75" fill="#FFFDF8" />
        <circle cx="23" cy="9.2" r="0.75" fill="#FFFDF8" />
        <circle cx="26.4" cy="12.2" r="0.75" fill="#FFFDF8" />

        {/* Středový jednoduchý bílý cukrový motiv – lidová spirálka / kytička */}
        <path
          d="M 18,16
             C 19.8,14.2 21.8,16.2 20.6,18.2
             C 19.4,20.2 16.6,20.2 15.4,18.2
             C 14.2,16.2 16.2,14.2 18,16 Z"
          fill="none"
          stroke="#FFFDF8"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Drobná cukrová perlička ve středu kvítku s třpytem */}
        <circle cx="18" cy="18.2" r="1.1" fill="#FFFDF8" className="lada-anim-glint" />

        {/* Dvě drobné cukrové kapičky nahoře a dole pod kvítkem */}
        <circle cx="18" cy="14" r="0.7" fill="#FFFDF8" />
        <circle cx="18" cy="22.5" r="0.7" fill="#FFFDF8" />
      </g>
    </LadaCanvasSvg>
  );
};

export const GingerbreadHeartIcon = PernicekIcon;
export const SmallGingerbreadHeartIcon = PernicekIcon;
export default PernicekIcon;
