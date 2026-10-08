import React from 'react';

export const ValecniceIcon: React.FC<{ size?: string | number; className?: string; style?: React.CSSProperties }> = ({
  size = 48,
  className = '',
  style = {},
}) => {
  const s = typeof size === 'number' ? size + 'px' : size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      className={className}
      style={style}
      role="img"
      aria-label="Válečnice – rázná vesnická paní s válečkem"
    >
      <defs>
        {/* Background gradient */}
        <radialGradient id="vBg" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="70%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </radialGradient>
        {/* Skirt gradient */}
        <linearGradient id="vSkirt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        {/* Rolling pin wood gradient */}
        <linearGradient id="vWood" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* Outer Medallion Border */}
      <circle cx="32" cy="32" r="30" fill="url(#vBg)" stroke="#26150C" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="27.5" fill="none" stroke="#D97706" strokeWidth="1" strokeDasharray="3 2" />

      {/* Motion / Whoosh lines for rolling pin strike */}
      <path d="M12 14 C16 9 28 8 36 10" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M15 19 C20 15 29 14 35 15" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />

      {/* Fluttering Scarf Knot Tails behind head */}
      <path d="M42 20 C49 18 53 22 55 24 C52 26 47 25 44 23 Z" fill="#DC2626" stroke="#26150C" strokeWidth="1.5" />
      <path d="M41 22 C48 24 53 27 54 31 C50 30 45 27 42 25 Z" fill="#B91C1C" stroke="#26150C" strokeWidth="1.5" />

      {/* Traditional Folk Red Skirt */}
      <path
        d="M23 38 C21 44 20 51 22 55 C28 57 39 57 47 54 C48 49 46 42 43 38 Z"
        fill="url(#vSkirt)"
        stroke="#26150C"
        strokeWidth="2"
      />
      {/* Folk embroidery pattern along hem */}
      <path d="M24 53 Q34 56 45 53" fill="none" stroke="#FBBF24" strokeWidth="1.2" strokeDasharray="2 2" />
      <circle cx="28" cy="51" r="1.2" fill="#22C55E" />
      <circle cx="34" cy="52" r="1.2" fill="#22C55E" />
      <circle cx="40" cy="51" r="1.2" fill="#22C55E" />

      {/* Sturdy Boots */}
      <path d="M23 54 L20 57 C19 59 23 60 26 58 L27 55 Z" fill="#291811" stroke="#26150C" strokeWidth="1.5" />
      <path d="M44 53 L47 56 C49 57 51 55 49 53 L47 52 Z" fill="#291811" stroke="#26150C" strokeWidth="1.5" />

      {/* White Apron & Pocket */}
      <path
        d="M26 38 C25 44 26 51 30 53 C36 53 40 51 40 43 C39 39 37 38 34 38 Z"
        fill="#FFFDF7"
        stroke="#26150C"
        strokeWidth="1.8"
      />
      {/* Apron Pocket with Meadow Flower */}
      <path d="M31 43 C31 47 35 47 35 43 Z" fill="#EFF6FF" stroke="#0284C7" strokeWidth="1" />
      <circle cx="33" cy="44.5" r="1" fill="#DC2626" />

      {/* White Puffy Sleeves / Blouse */}
      <circle cx="24" cy="33" r="5.5" fill="#FFFDF7" stroke="#26150C" strokeWidth="1.8" />
      <circle cx="42" cy="33" r="5" fill="#FFFDF7" stroke="#26150C" strokeWidth="1.8" />

      {/* Green Folk Bodice (Kordulka) */}
      <path
        d="M27 31 C25 35 25 38 27 40 C32 41 37 40 39 38 C40 35 39 32 37 30 Z"
        fill="#1E652E"
        stroke="#26150C"
        strokeWidth="1.8"
      />
      {/* Golden Bodice Buttons */}
      <circle cx="32" cy="33" r="0.9" fill="#FBBF24" />
      <circle cx="32" cy="36" r="0.9" fill="#FBBF24" />

      {/* Red Collar Bow */}
      <path d="M30 28 L34 28 L32 30 Z" fill="#DC2626" stroke="#26150C" strokeWidth="1.2" />

      {/* Face & Head */}
      <ellipse cx="33" cy="24" rx="7.5" ry="7" fill="#FDE2C8" stroke="#26150C" strokeWidth="1.8" />
      {/* Rosy Red Cheeks */}
      <circle cx="28.5" cy="25" r="2.2" fill="#F87171" opacity="0.85" />
      <circle cx="37.5" cy="25" r="2.2" fill="#F87171" opacity="0.85" />
      {/* Red Button Nose */}
      <circle cx="33" cy="24" r="1.3" fill="#FB7185" stroke="#26150C" strokeWidth="0.8" />
      {/* Angry Slanted Eyebrows */}
      <path d="M28 20.5 L31.5 22.5" stroke="#26150C" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M38 20.5 L34.5 22.5" stroke="#26150C" strokeWidth="1.8" strokeLinecap="round" />
      {/* Determined Glaring Eyes */}
      <circle cx="30" cy="22.8" r="1.1" fill="#18181B" />
      <circle cx="36" cy="22.8" r="1.1" fill="#18181B" />
      {/* Fierce Shouting Mouth */}
      <path d="M30.5 27 Q33 29.5 35.5 27 Z" fill="#7F1D1D" stroke="#26150C" strokeWidth="1.2" />
      <path d="M31.2 27.3 L34.8 27.3" stroke="#FFF" strokeWidth="0.9" />

      {/* Red Polka-Dot Kerchief (Šátek) */}
      <path
        d="M26 21 C26 15 39 15 40 21 C41 24 40 26 39 27 C36 29 30 29 27 27 C26 25 26 23 26 21 Z"
        fill="#DC2626"
        stroke="#26150C"
        strokeWidth="1.8"
      />
      {/* Kerchief Polka Dots */}
      <circle cx="30" cy="17.5" r="0.9" fill="#FFFDF7" />
      <circle cx="35" cy="17" r="0.9" fill="#FFFDF7" />
      <circle cx="38" cy="19.5" r="0.9" fill="#FFFDF7" />
      <circle cx="28" cy="19.5" r="0.8" fill="#FFFDF7" />

      {/* Brown Curls Escaping Kerchief */}
      <path d="M26 22 C25 24 25.5 26 26.5 26" fill="none" stroke="#522D16" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right Arm gripping the Mighty Rolling Pin */}
      <path d="M19 28 L15 21" stroke="#FDE2C8" strokeWidth="3.2" strokeLinecap="round" />
      {/* Fist gripping handle */}
      <circle cx="15" cy="20" r="2.8" fill="#FDE2C8" stroke="#26150C" strokeWidth="1.5" />

      {/* Massive Wooden Rolling Pin (Váleček na těsto) */}
      <g transform="rotate(-38 18 16)">
        {/* Bottom Handle */}
        <path d="M17 28 L17 33" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <circle cx="17" cy="33" r="1.8" fill="#B45309" stroke="#26150C" strokeWidth="1" />
        {/* Main Rolling Pin Barrel */}
        <rect x="13.5" y="8" width="7" height="20" rx="2.5" fill="url(#vWood)" stroke="#26150C" strokeWidth="1.8" />
        {/* Woodgrain highlight lines */}
        <path d="M15 11 L15 25" stroke="#FDE68A" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
        <path d="M18.5 13 L18.5 23" stroke="#78350F" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
        {/* Top Handle */}
        <path d="M17 3 L17 8" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
        <circle cx="17" cy="3" r="1.8" fill="#B45309" stroke="#26150C" strokeWidth="1" />
      </g>
    </svg>
  );
};

