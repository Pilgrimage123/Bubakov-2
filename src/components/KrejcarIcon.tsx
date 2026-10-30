import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export interface KrejcarIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const KREJCAR_ANIM_STYLES = `
  @keyframes ladaCoinRockPulse {
    0%, 100% {
      transform: rotate(-3deg) scale(1);
    }
    50% {
      transform: rotate(3deg) scale(1.06);
    }
  }
  @keyframes ladaCoinStarTwinkle {
    0%, 100% {
      transform: scale(0.5) rotate(0deg);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.25) rotate(45deg);
      opacity: 1;
    }
  }
  .lada-krejcar-base {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaCoinRockPulse 2.6s ease-in-out infinite;
  }
  .lada-krejcar-star-1 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaCoinStarTwinkle 2.1s ease-in-out infinite;
  }
  .lada-krejcar-star-2 {
    transform-box: fill-box;
    transform-origin: center;
    animation: ladaCoinStarTwinkle 2.5s ease-in-out infinite 0.9s;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-krejcar-base,
    .lada-krejcar-star-1,
    .lada-krejcar-star-2 {
      animation: none !important;
    }
  }
`;

export const KrejcarIcon: React.FC<KrejcarIconProps> = ({
  size = '1.15em',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <LadaCanvasSvg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 36"
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
      aria-label="Krejcar (česká venkovská mince)"
      {...props}
    >
      <style>{KREJCAR_ANIM_STYLES}</style>
      <defs>
        <radialGradient id="kcIconShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A1612" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#1A1612" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kcIconRim" x1="12%" y1="10%" x2="88%" y2="90%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#FACC15" />
          <stop offset="68%" stopColor="#D9A036" />
          <stop offset="100%" stopColor="#8C5A35" />
        </linearGradient>
        <linearGradient id="kcIconField" x1="18%" y1="14%" x2="84%" y2="86%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="28%" stopColor="#FEF08A" />
          <stop offset="65%" stopColor="#D9A036" />
          <stop offset="100%" stopColor="#A66E40" />
        </linearGradient>
        <linearGradient id="kcIconLetter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5E3A21" />
          <stop offset="100%" stopColor="#1A1612" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="18" cy="33" rx="13.5" ry="3.2" fill="url(#kcIconShadow)" />

      {/* Base animated coin body: gentle rocking tilt and scale pulse */}
      <g className="lada-anim-float lada-krejcar-base">
        {/* Outer stamped gold rim with crisp Josef Lada ink outline */}
        <circle
          cx="18"
          cy="17.5"
          r="14.2"
          fill="url(#kcIconRim)"
          stroke="#1A1612"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Darker gouache lower-right depth crescent on outer bevel */}
        <path
          d="M 27.5 8.5 A 13 13 0 0 1 8.5 27.5 A 13.5 13.5 0 0 0 27.5 8.5 Z"
          fill="#8C5A35"
          opacity="0.55"
        />

        {/* Warm cream/gold upper-left metallic rim highlight */}
        <path
          d="M 6.8 14.5 A 12.2 12.2 0 0 1 22.5 5.8"
          fill="none"
          stroke="#FFFDF7"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Inner recessed coin face */}
        <circle
          cx="18"
          cy="17.5"
          r="11.3"
          fill="url(#kcIconField)"
          stroke="#5E3A21"
          strokeWidth="1.3"
        />

        {/* Traditional stamped folk beaded border */}
        <circle
          cx="18"
          cy="17.5"
          r="9.8"
          fill="none"
          stroke="#5E3A21"
          strokeWidth="1.1"
          strokeDasharray="1.3 1.9"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle
          cx="18"
          cy="17.5"
          r="9.2"
          fill="none"
          stroke="#FFFDF7"
          strokeWidth="0.7"
          strokeDasharray="1.1 2.1"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Traditional Czech village floral & heart mint marks */}
        {/* Top folk crimson heart motif */}
        <path
          d="M 18 7.6 C 17.1 6.5, 15.6 7.1, 16.4 8.3 C 17 9.1, 18 9.8, 18 9.8 C 18 9.8, 19 9.1, 19.6 8.3 C 20.4 7.1, 18.9 6.5, 18 7.6 Z"
          fill="#C83E31"
          stroke="#1A1612"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* Bottom left & right meadow linden leaf sprigs */}
        <path
          d="M 11.2 23.2 C 9.8 22.2, 9.6 20.5, 11 20.6 C 12 20.7, 12.2 22.2, 11.2 23.2 Z"
          fill="#65A30D"
          stroke="#1A1612"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
        <path
          d="M 24.8 23.2 C 26.2 22.2, 26.4 20.5, 25 20.6 C 24 20.7, 23.8 22.2, 24.8 23.2 Z"
          fill="#65A30D"
          stroke="#1A1612"
          strokeWidth="0.85"
          strokeLinejoin="round"
        />
        {/* Tiny folk red berries beside the "K" */}
        <circle cx="10.8" cy="17.5" r="1.1" fill="#C83E31" stroke="#1A1612" strokeWidth="0.7" />
        <circle cx="25.2" cy="17.5" r="1.1" fill="#C83E31" stroke="#1A1612" strokeWidth="0.7" />

        {/* Warm cream embossed relief shadow for central "K" */}
        <path
          d="M 13.5 11.5 L 15.8 11.5 M 14.6 11.5 L 14.6 23.5 M 13.5 23.5 L 15.8 23.5 M 15.2 17.5 L 21.4 11.7 M 20.2 11.5 L 22.4 11.5 M 16.8 16.2 L 21.8 23.5 M 20.5 23.5 L 22.8 23.5"
          fill="none"
          stroke="#FFFDF7"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0.6, 0.6)"
        />

        {/* Embossed "K" (Krejcar) in dark ink & bronze relief */}
        <path
          d="M 13.5 11.5 L 15.8 11.5 M 14.6 11.5 L 14.6 23.5 M 13.5 23.5 L 15.8 23.5 M 15.2 17.5 L 21.4 11.7 M 20.2 11.5 L 22.4 11.5 M 16.8 16.2 L 21.8 23.5 M 20.5 23.5 L 22.8 23.5"
          fill="none"
          stroke="url(#kcIconLetter)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Secondary animated detail: Twinkling 4-point star glints */}
        <g className="lada-anim-glint lada-krejcar-star-1">
          <path
            d="M 9.5 6.2 L 10.4 8.6 L 12.8 9.5 L 10.4 10.4 L 9.5 12.8 L 8.6 10.4 L 6.2 9.5 L 8.6 8.6 Z"
            fill="#FFFDF7"
            stroke="#1A1612"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <circle cx="9.5" cy="9.5" r="1.1" fill="#FEF08A" />
        </g>

        <g className="lada-krejcar-star-2">
          <path
            d="M 27.2 22.5 L 27.8 24.2 L 29.5 24.8 L 27.8 25.4 L 27.2 27.1 L 26.6 25.4 L 24.9 24.8 L 26.6 24.2 Z"
            fill="#FEF08A"
            stroke="#1A1612"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </LadaCanvasSvg>
  );
};
