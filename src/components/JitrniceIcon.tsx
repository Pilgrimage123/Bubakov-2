import React from 'react';

export interface JitrniceIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const JitrniceIcon: React.FC<JitrniceIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
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
      aria-label="Poctivá vesnická jitrnice se špejlí"
      {...props}
    >
      <defs>
        <radialGradient id="jiShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#24160B" stopOpacity="0.36" />
          <stop offset="65%" stopColor="#24160B" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#24160B" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="jiCasing" x1="50%" y1="15%" x2="50%" y2="85%">
          <stop offset="0%" stopColor="#F2EBDA" />
          <stop offset="25%" stopColor="#E5D9BF" />
          <stop offset="60%" stopColor="#CDBEA2" />
          <stop offset="85%" stopColor="#B2A183" />
          <stop offset="100%" stopColor="#938266" />
        </linearGradient>

        <radialGradient id="jiDepth" cx="45%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.6" />
          <stop offset="45%" stopColor="#DFD2B7" stopOpacity="0.3" />
          <stop offset="80%" stopColor="#8F7E62" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5E4E35" stopOpacity="0.6" />
        </radialGradient>

        <linearGradient id="jiSheen" x1="20%" y1="20%" x2="80%" y2="30%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
        </linearGradient>

        <linearGradient id="jiWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7B5433" />
          <stop offset="50%" stopColor="#54371F" />
          <stop offset="100%" stopColor="#321E10" />
        </linearGradient>

        <linearGradient id="jiKnot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8DCBE" />
          <stop offset="50%" stopColor="#C6B595" />
          <stop offset="100%" stopColor="#968365" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="60" cy="74" rx="46" ry="10" fill="url(#jiShadow)" />

      {/* Wooden skewers (špejle) */}
      <line
        x1="12"
        y1="42"
        x2="26"
        y2="74"
        stroke="#22140A"
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="42"
        x2="26"
        y2="74"
        stroke="url(#jiWood)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="13"
        y1="43"
        x2="17"
        y2="52"
        stroke="#9E7348"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <line
        x1="108"
        y1="44"
        x2="94"
        y2="76"
        stroke="#22140A"
        strokeWidth="4.8"
        strokeLinecap="round"
      />
      <line
        x1="108"
        y1="44"
        x2="94"
        y2="76"
        stroke="url(#jiWood)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="107"
        y1="45"
        x2="103"
        y2="54"
        stroke="#9E7348"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Sausage body */}
      <path
        d="M 22 56
           C 28 36, 44 23, 60 23
           C 76 23, 92 36, 98 56
           C 100 62, 97 68, 93 68
           C 84 68, 74 53, 60 52
           C 46 53, 36 68, 27 68
           C 23 68, 20 62, 22 56 Z"
        fill="url(#jiCasing)"
        stroke="#1A120B"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Filling depth overlay */}
      <path
        d="M 23 55
           C 29 37, 44 24, 60 24
           C 76 24, 91 37, 97 55
           C 96 64, 83 54, 60 53
           C 37 54, 24 64, 23 55 Z"
        fill="url(#jiDepth)"
      />

      {/* Flecks of spices and filling */}
      <g fill="#524330" opacity="0.68">
        <circle cx="34" cy="48" r="1.5" />
        <circle cx="38" cy="42" r="1.2" />
        <circle cx="43" cy="36" r="1.8" />
        <circle cx="48" cy="44" r="1.4" />
        <circle cx="52" cy="33" r="1.6" />
        <circle cx="56" cy="41" r="1.3" />
        <circle cx="60" cy="32" r="2.0" />
        <circle cx="64" cy="43" r="1.5" />
        <circle cx="69" cy="34" r="1.7" />
        <circle cx="73" cy="45" r="1.3" />
        <circle cx="78" cy="38" r="1.9" />
        <circle cx="83" cy="47" r="1.4" />
        <circle cx="87" cy="53" r="1.6" />
        {/* Marjoram flecks */}
        <ellipse cx="40" cy="46" rx="1.8" ry="0.9" transform="rotate(-25 40 46)" fill="#445431" />
        <ellipse cx="50" cy="38" rx="1.6" ry="0.8" transform="rotate(35 50 38)" fill="#445431" />
        <ellipse cx="62" cy="38" rx="1.9" ry="0.9" transform="rotate(-15 62 38)" fill="#445431" />
        <ellipse cx="71" cy="40" rx="1.7" ry="0.8" transform="rotate(40 71 40)" fill="#445431" />
        <ellipse cx="80" cy="44" rx="1.5" ry="0.8" transform="rotate(-30 80 44)" fill="#445431" />
      </g>

      {/* Marbling */}
      <g fill="#7A6850" opacity="0.55">
        <circle cx="31" cy="53" r="1.4" />
        <circle cx="45" cy="48" r="1.6" />
        <circle cx="58" cy="47" r="1.5" />
        <circle cx="66" cy="48" r="1.8" />
        <circle cx="76" cy="50" r="1.5" />
        <circle cx="89" cy="58" r="1.3" />
      </g>

      {/* Pinched knots */}
      <path
        d="M 18 53
           C 15 56, 15 63, 19 65
           C 22 66, 25 64, 25 61
           C 25 57, 22 53, 18 53 Z"
        fill="url(#jiKnot)"
        stroke="#1A120B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 19 56 C 22 58, 22 61, 20 63"
        fill="none"
        stroke="#1A120B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M 102 54
           C 105 57, 105 64, 101 66
           C 98 67, 95 65, 95 62
           C 95 58, 98 54, 102 54 Z"
        fill="url(#jiKnot)"
        stroke="#1A120B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M 101 57 C 98 59, 98 62, 100 64"
        fill="none"
        stroke="#1A120B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Sheen highlights */}
      <path
        d="M 29 46
           C 37 32, 49 26, 60 26
           C 71 26, 83 32, 91 46
           C 84 35, 72 30, 60 30
           C 48 30, 36 35, 29 46 Z"
        fill="url(#jiSheen)"
      />

      {/* Bright glints */}
      <path
        d="M 46 29 C 52 27, 57 26.5, 62 26.5 C 67 26.5, 72 27, 76 29"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 52 26.5 C 57 25.8, 62 25.8, 67 26.5"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M 33 42 C 37 37, 41 33, 45 30"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
};
