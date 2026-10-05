import React from 'react';

export interface MedvediMastIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const MedvediMastIcon: React.FC<MedvediMastIconProps> = ({
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
      aria-label="Medvědí mast – poctivá keramická dóza s hojivou medvědí mastí v ladovském stylu"
      {...props}
    >
      <defs>
        {/* Soft shadow */}
        <radialGradient id="mastShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#25160E" stopOpacity="0.42" />
          <stop offset="65%" stopColor="#25160E" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#25160E" stopOpacity="0" />
        </radialGradient>

        {/* Earthenware Jar body gradient (Ladovská keramika) */}
        <linearGradient id="mastJarGrad" x1="15%" y1="20%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#FED7AA" />
          <stop offset="30%" stopColor="#FDBA74" />
          <stop offset="65%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>

        {/* Golden healing ointment / fat gradient */}
        <linearGradient id="mastSalveGrad" x1="20%" y1="15%" x2="85%" y2="85%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="80%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Linen cover / parchment cap */}
        <linearGradient id="mastCapGrad" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="40%" stopColor="#F5E8D0" />
          <stop offset="80%" stopColor="#DFCCA9" />
          <stop offset="100%" stopColor="#BC9F75" />
        </linearGradient>

        {/* Wooden spatula spoon */}
        <linearGradient id="mastWoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A27042" />
          <stop offset="50%" stopColor="#784B24" />
          <stop offset="100%" stopColor="#4A2B11" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="48" cy="87" rx="34" ry="7.5" fill="url(#mastShadow)" />

      {/* Wooden Spatula leaning against jar (behind) */}
      <g transform="rotate(32 72 45)">
        <path
          d="M 69 18 C 73 14, 80 14, 83 18 C 86 23, 83 29, 78 30 L 73 78 C 72 81, 68 81, 67 78 Z"
          fill="url(#mastWoodGrad)"
          stroke="#1E140C"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />
        {/* Dollop of shiny bear salve on spatula */}
        <ellipse cx="76" cy="22" rx="4.5" ry="3.5" fill="url(#mastSalveGrad)" />
        <ellipse cx="75" cy="21" rx="2" ry="1.2" fill="#FFFFFF" opacity="0.8" />
      </g>

      {/* Ceramic Crock / Jar Body */}
      {/* Plump, rounded folk apothecary jar */}
      <path
        d="M 23 48
           C 20 62, 22 79, 32 84
           C 39 87, 57 87, 64 84
           C 74 79, 76 62, 73 48
           C 71 42, 67 39, 64 38
           L 32 38
           C 29 39, 25 42, 23 48 Z"
        fill="url(#mastJarGrad)"
        stroke="#1E140C"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Folk Glaze Reflection */}
      <path
        d="M 27 50 C 25 61, 28 73, 34 80"
        fill="none"
        stroke="#FFEDD5"
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 26 53 C 25 60, 27 68, 30 73"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Rustic Folk Label on Jar Belly */}
      <rect
        x="33"
        y="50"
        width="30"
        height="24"
        rx="4"
        fill="#FEF3C7"
        stroke="#1E140C"
        strokeWidth="2.4"
      />
      {/* Inner dotted border on label */}
      <rect
        x="35.5"
        y="52.5"
        width="25"
        height="19"
        rx="2.5"
        fill="none"
        stroke="#B45309"
        strokeWidth="1"
        strokeDasharray="2.5 1.5"
      />

      {/* Bear Paw Emblem (Medvědí tlapka) on the label */}
      <g fill="#78350F">
        {/* Palm pad */}
        <path
          d="M 43 64 C 43 61, 46 59, 48 59 C 50 59, 53 61, 53 64 C 53 67, 51 69, 48 69 C 45 69, 43 67, 43 64 Z"
        />
        {/* 4 claw toe pads */}
        <circle cx="43" cy="57" r="1.5" />
        <circle cx="46.5" cy="55" r="1.6" />
        <circle cx="49.5" cy="55" r="1.6" />
        <circle cx="53" cy="57" r="1.5" />
      </g>

      {/* Label Text hint: "MEDVĚDÍ" / "MAST" */}
      <text
        x="48"
        y="71"
        fontFamily="sans-serif"
        fontSize="3.8"
        fontWeight="900"
        textAnchor="middle"
        fill="#78350F"
      >
        MAST
      </text>

      {/* Jar Neck / Rim */}
      <path
        d="M 30 38 C 30 35, 34 33, 48 33 C 62 33, 66 35, 66 38 Z"
        fill="#B45309"
        stroke="#1E140C"
        strokeWidth="3.2"
      />

      {/* Linen/Parchment Cap Tied Over Jar Mouth (Plátěný klobouček s volánky) */}
      <path
        d="M 28 32
           C 28 22, 36 16, 48 16
           C 60 16, 68 22, 68 32
           C 68 36, 64 38, 62 38
           C 59 36, 56 38, 53 37
           C 50 36, 46 36, 43 37
           C 40 38, 37 36, 34 38
           C 32 38, 28 36, 28 32 Z"
        fill="url(#mastCapGrad)"
        stroke="#1E140C"
        strokeWidth="3.6"
        strokeLinejoin="round"
      />

      {/* Cap Folds & Highlights */}
      <path
        d="M 35 24 C 40 19, 48 19, 56 22"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 34 29 C 39 26, 44 26, 48 27"
        fill="none"
        stroke="#78350F"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* Jute String / Twine Tied Around Neck (Konopný provázek s uzlíkem a mašličkou) */}
      <path
        d="M 29 35 C 36 37, 60 37, 67 35"
        fill="none"
        stroke="#1E140C"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 29 35 C 36 37, 60 37, 67 35"
        fill="none"
        stroke="#D97706"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Twine Knot & Hanging String Ends */}
      <circle cx="34" cy="36" r="2.6" fill="#B45309" stroke="#1E140C" strokeWidth="1.5" />
      {/* Hanging string 1 */}
      <path
        d="M 33 38 C 30 43, 31 48, 28 52"
        fill="none"
        stroke="#1E140C"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M 33 38 C 30 43, 31 48, 28 52"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Hanging string 2 */}
      <path
        d="M 35 38 C 36 43, 34 46, 35 50"
        fill="none"
        stroke="#1E140C"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 35 38 C 36 43, 34 46, 35 50"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* Little herbal sprig tucked in the twine (Hojivá bylinka / jehličí) */}
      <path
        d="M 64 36 C 68 31, 72 27, 76 25"
        fill="none"
        stroke="#2E7D32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 68 32 L 67 28"
        fill="none"
        stroke="#2E7D32"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 72 29 L 74 26"
        fill="none"
        stroke="#2E7D32"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
};
