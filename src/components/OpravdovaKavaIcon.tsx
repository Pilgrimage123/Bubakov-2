import React from 'react';

export interface OpravdovaKavaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const OpravdovaKavaIcon: React.FC<OpravdovaKavaIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
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
      aria-label="Opravdová káva – poctivý kouřící hrnek kávy v ladovském stylu"
      {...props}
    >
      <defs>
        {/* Soft shadow */}
        <radialGradient id="kavaShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#26170E" stopOpacity="0.4" />
          <stop offset="65%" stopColor="#26170E" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#26170E" stopOpacity="0" />
        </radialGradient>

        {/* Rustic ceramic mug gradient */}
        <linearGradient id="kavaMugGrad" x1="15%" y1="20%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="30%" stopColor="#F5E8D0" />
          <stop offset="70%" stopColor="#E2CBA8" />
          <stop offset="100%" stopColor="#C4AA82" />
        </linearGradient>

        {/* Folk blue decorative band */}
        <linearGradient id="kavaBlueFolk" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Hot coffee liquid surface */}
        <radialGradient id="kavaLiquid" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6F3918" />
          <stop offset="45%" stopColor="#4A220F" />
          <stop offset="85%" stopColor="#2A1207" />
          <stop offset="100%" stopColor="#1A0A04" />
        </radialGradient>

        {/* Roasted coffee bean gradient */}
        <linearGradient id="kavaBean" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#6C3E1F" />
          <stop offset="60%" stopColor="#45230F" />
          <stop offset="100%" stopColor="#251106" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="88" rx="34" ry="7" fill="url(#kavaShadow)" />

      {/* Saucer / podšálek */}
      <ellipse
        cx="48"
        cy="83"
        rx="36"
        ry="8"
        fill="#EDE1C7"
        stroke="#1E140C"
        strokeWidth="3.6"
      />
      <ellipse
        cx="48"
        cy="81"
        rx="26"
        ry="5"
        fill="#E0D1B4"
        stroke="#1E140C"
        strokeWidth="2"
      />

      {/* Handle (Ucho hrnku) behind body */}
      <path
        d="M 68 45 C 88 45, 88 71, 67 73"
        fill="none"
        stroke="#1E140C"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M 68 45 C 86 45, 86 71, 67 73"
        fill="none"
        stroke="#E8DCBF"
        strokeWidth="4.6"
        strokeLinecap="round"
      />

      {/* Ceramic Mug Body */}
      <path
        d="M 23 41
           C 24 58, 27 75, 33 79
           C 38 82, 58 82, 63 79
           C 69 75, 72 58, 73 41
           Z"
        fill="url(#kavaMugGrad)"
        stroke="#1E140C"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Folk Blue Pattern on Mug (Ladovský lidový motiv) */}
      <path
        d="M 27 54 C 37 57, 59 57, 69 54"
        fill="none"
        stroke="url(#kavaBlueFolk)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Folk dots & heart motif */}
      <circle cx="36" cy="63" r="2.2" fill="#1D4ED8" />
      <circle cx="60" cy="63" r="2.2" fill="#1D4ED8" />
      <path
        d="M 48 61 C 45 58, 41 61, 48 68 C 55 61, 51 58, 48 61 Z"
        fill="#DC2626"
        stroke="#1E140C"
        strokeWidth="1.2"
      />

      {/* Mug Inner Rim & Coffee surface */}
      <ellipse
        cx="48"
        cy="41"
        rx="25"
        ry="8"
        fill="#D6C4A5"
        stroke="#1E140C"
        strokeWidth="3.6"
      />
      {/* Dark freshly brewed black coffee */}
      <ellipse
        cx="48"
        cy="41.5"
        rx="22.5"
        ry="6.6"
        fill="url(#kavaLiquid)"
      />
      {/* Golden crema sheen ring */}
      <ellipse
        cx="47"
        cy="41"
        rx="18"
        ry="4.5"
        fill="none"
        stroke="#C28E46"
        strokeWidth="1.4"
        opacity="0.7"
      />
      <ellipse
        cx="46"
        cy="40"
        rx="12"
        ry="2.8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1"
        opacity="0.45"
      />

      {/* Coffee Mug gouache highlight */}
      <path
        d="M 28 44 C 29 55, 33 68, 36 74"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Steaming Curly Wisps (Ladovský kadeřavý kouř) */}
      <path
        d="M 41 33 C 37 26, 44 20, 39 12 C 37 9, 39 5, 43 4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.88"
      />
      <path
        d="M 41 33 C 37 26, 44 20, 39 12 C 37 9, 39 5, 43 4"
        fill="none"
        stroke="#1E140C"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />

      <path
        d="M 52 32 C 57 24, 49 18, 55 10 C 58 6, 56 3, 52 2"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M 52 32 C 57 24, 49 18, 55 10 C 58 6, 56 3, 52 2"
        fill="none"
        stroke="#1E140C"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Little Coffee Bean 1 on Saucer (left) */}
      <g transform="translate(18, 77) rotate(-22)">
        <ellipse
          cx="6"
          cy="4"
          rx="6"
          ry="4"
          fill="url(#kavaBean)"
          stroke="#1E140C"
          strokeWidth="1.8"
        />
        <path
          d="M 1 4 C 4 3, 7 5, 11 4"
          fill="none"
          stroke="#1E140C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 3 2.5 C 5 2, 7 2.2, 9 2.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="0.9"
          opacity="0.5"
        />
      </g>

      {/* Little Coffee Bean 2 on Saucer (right) */}
      <g transform="translate(71, 79) rotate(35)">
        <ellipse
          cx="5"
          cy="3.5"
          rx="5"
          ry="3.5"
          fill="url(#kavaBean)"
          stroke="#1E140C"
          strokeWidth="1.6"
        />
        <path
          d="M 1 3.5 C 3 2.5, 6 4.5, 9 3.5"
          fill="none"
          stroke="#1E140C"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};
