import React from 'react';

export interface OsikovyPrutIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  soaked?: boolean;
  [key: string]: any;
}

export const OsikovyPrutIcon: React.FC<OsikovyPrutIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  soaked = false,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 90"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        ...style,
      }}
      aria-label="Osikový prut s pupeny a seříznutým koncem"
      {...props}
    >
      <defs>
        {/* Soft ground shadow */}
        <radialGradient id="opGroundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E1710" stopOpacity="0.32" />
          <stop offset="70%" stopColor="#1E1710" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1E1710" stopOpacity="0" />
        </radialGradient>

        {/* Bark multi-stop gradient matching natural aspen twig */}
        <linearGradient id="opBark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4E4438" />
          <stop offset="25%" stopColor="#6E6455" />
          <stop offset="50%" stopColor="#7C7262" />
          <stop offset="75%" stopColor="#8E8474" />
          <stop offset="100%" stopColor="#5C5244" />
        </linearGradient>

        {/* Soft edge highlight from ambient light */}
        <linearGradient id="opHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D5CBB9" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#A89E8D" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3A3127" stopOpacity="0.8" />
        </linearGradient>

        {/* Freshly cut wood end section */}
        <radialGradient id="opWoodCutEnd" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#F5EBD8" />
          <stop offset="55%" stopColor="#D9C7A7" />
          <stop offset="85%" stopColor="#B29C77" />
          <stop offset="100%" stopColor="#4D3F33" />
        </radialGradient>

        {/* Botanical buds gradient */}
        <linearGradient id="opBudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#825C3E" />
          <stop offset="50%" stopColor="#5C3F2B" />
          <stop offset="100%" stopColor="#382519" />
        </linearGradient>

        {/* Water droplet gradient for soaked cane */}
        <linearGradient id="opWaterDrop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Ground shadow beneath the stick */}
      <ellipse cx="60" cy="84" rx="48" ry="5" fill="url(#opGroundShadow)" />

      <g id="osikovy-prut-group">
        {/* Core stem body - natural S-curve tapering from base (12.8, 80.2) to tip (110, 11) */}
        <path
          d="M 12.8 80.2
             C 24 76.5, 36 72.8, 47 67.5
             C 55.5 63.2, 61.2 55.8, 65.8 47.2
             C 70.2 39.0, 74.5 30.8, 80.8 24.2
             C 86.8 17.8, 94.2 14.5, 102.5 13.0
             L 108.5 12.2
             L 109.8 11.2
             L 108.2 11.5
             C 101.8 12.0, 94.0 13.6, 88.0 16.8
             C 81.2 20.4, 76.2 27.5, 71.8 34.5
             C 67.2 42.5, 62.2 50.8, 54.2 57.8
             C 44.5 66.2, 33.0 70.8, 20.5 75.0
             C 16.5 76.4, 12.5 77.5, 10.5 78.0
             Z"
          fill="url(#opBark)"
          stroke="#2A2119"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Upper edge sunlight highlight reflection */}
        <path
          d="M 13 77.6
             Q 28 73 42 68.2
             T 58 55
             T 70 36
             T 84 21
             T 99 13.8
             L 107 11.8"
          fill="none"
          stroke="url(#opHighlight)"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Lower contour shadow depth */}
        <path
          d="M 13 80.2
             Q 28 75.8 44 70.5
             T 60 58.5
             T 73 39
             T 86 24
             T 101 14.8
             L 108 12.5"
          fill="none"
          stroke="#201812"
          strokeWidth="1.0"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Cut wood cross-section at base (angled cut showing light inner sapwood) */}
        <g transform="translate(11, 79) rotate(-32)">
          <ellipse cx="0" cy="0" rx="2.6" ry="4.3" fill="#3D3227" stroke="#1D1610" strokeWidth="0.6" />
          <ellipse cx="0" cy="0" rx="2.0" ry="3.5" fill="url(#opWoodCutEnd)" />
          <circle cx="-0.2" cy="0.2" r="0.6" fill="#8C795E" opacity="0.8" />
        </g>

        {/* Buds and Nodes at faithful positions along the stem */}
        {/* Node 1: near base, small bud lower side */}
        <g transform="translate(22.5, 76.5) rotate(25)">
          <path d="M 0 0 C 1 1.2, 2 2.2, 3.2 2.5 C 2.5 1.5, 1.8 0.5, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="1.6" cy="1.3" r="0.5" fill="#B08B67" />
        </g>

        {/* Node 2: upper side bud */}
        <g transform="translate(32, 71.5) rotate(-35)">
          <path d="M 0 0 C 1 -1.4, 2.2 -2.2, 3.5 -2.4 C 2.6 -1.2, 1.6 -0.4, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="1.8" cy="-1.1" r="0.5" fill="#B08B67" />
        </g>

        {/* Node 3: lower side node */}
        <g transform="translate(42, 67) rotate(22)">
          <path d="M 0 0 C 1.2 1.3, 2.4 2.2, 3.8 2.3 C 2.8 1.4, 1.8 0.5, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="2" cy="1.2" r="0.5" fill="#B08B67" />
        </g>

        {/* Node 4: lower side bud before main curve */}
        <g transform="translate(49, 63) rotate(15)">
          <path d="M 0 0 C 1.2 1.2, 2.5 2.0, 3.6 2.1 C 2.7 1.2, 1.6 0.4, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="1.8" cy="1" r="0.4" fill="#B08B67" />
        </g>

        {/* Node 5: mid upward curve, outer right bud */}
        <g transform="translate(61.5, 52) rotate(48)">
          <path d="M 0 0 C 1.2 1.1, 2.6 1.8, 3.8 1.7 C 2.8 1.0, 1.8 0.4, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="1.9" cy="0.9" r="0.4" fill="#C29D78" />
        </g>

        {/* Node 6: inner curve left bud */}
        <g transform="translate(65.5, 43.5) rotate(-55)">
          <path d="M 0 0 C 1 -1.1, 2.2 -1.8, 3.2 -1.9 C 2.4 -1.0, 1.5 -0.3, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="1.6" cy="-0.9" r="0.4" fill="#B08B67" />
        </g>

        {/* Node 7: upper ascent bud */}
        <g transform="translate(73.5, 33) rotate(32)">
          <path d="M 0 0 C 1 1, 2.2 1.6, 3.2 1.6 C 2.4 0.9, 1.4 0.3, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.4" />
          <circle cx="1.6" cy="0.8" r="0.35" fill="#B08B67" />
        </g>

        {/* Node 8: transition curve bud */}
        <g transform="translate(80, 24.5) rotate(20)">
          <path d="M 0 0 C 0.9 0.9, 2.0 1.4, 3.0 1.4 C 2.2 0.8, 1.3 0.3, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.35" />
          <circle cx="1.5" cy="0.7" r="0.35" fill="#B08B67" />
        </g>

        {/* Node 9: gentle horizontal section bud */}
        <g transform="translate(89, 17) rotate(10)">
          <path d="M 0 0 C 0.8 0.8, 1.8 1.2, 2.6 1.2 C 1.9 0.7, 1.1 0.2, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.35" />
          <circle cx="1.3" cy="0.6" r="0.3" fill="#B08B67" />
        </g>

        {/* Node 10: near tip bud */}
        <g transform="translate(98, 13.5) rotate(-15)">
          <path d="M 0 0 C 0.8 -0.8, 1.8 -1.1, 2.6 -1.1 C 1.9 -0.6, 1.1 -0.2, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.35" />
          <circle cx="1.3" cy="-0.5" r="0.3" fill="#B08B67" />
        </g>

        {/* Node 11: terminal bud cluster at the very tip */}
        <g transform="translate(106.5, 11.5) rotate(5)">
          <path d="M 0 0 C 1 0.6, 2.2 0.8, 3.2 0.7 C 2.3 0.4, 1.4 0.1, 0 0 Z" fill="url(#opBudGrad)" stroke="#2A1D14" strokeWidth="0.3" />
          <path d="M 1.5 0.2 L 3.8 -0.4" stroke="#88735C" strokeWidth="0.6" strokeLinecap="round" />
          <circle cx="1.7" cy="0.3" r="0.3" fill="#C29D78" />
          <circle cx="3.8" cy="-0.4" r="0.35" fill="#825C3E" />
        </g>

        {/* Optional Soaked Cane (Mokrý prut) water droplets & dew shimmer */}
        {soaked && (
          <g id="water-droplets">
            <ellipse cx="38" cy="71" rx="1.8" ry="2.4" fill="url(#opWaterDrop)" />
            <circle cx="37.5" cy="70.2" r="0.6" fill="#FFFFFF" opacity="0.9" />

            <ellipse cx="63" cy="50" rx="1.6" ry="2.2" fill="url(#opWaterDrop)" />
            <circle cx="62.5" cy="49.3" r="0.5" fill="#FFFFFF" opacity="0.9" />

            <ellipse cx="85" cy="20" rx="1.4" ry="2.0" fill="url(#opWaterDrop)" />
            <circle cx="84.5" cy="19.4" r="0.5" fill="#FFFFFF" opacity="0.9" />

            <ellipse cx="109" cy="14" rx="1.2" ry="1.6" fill="url(#opWaterDrop)" />
            <circle cx="108.6" cy="13.5" r="0.4" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}
      </g>
    </svg>
  );
};
