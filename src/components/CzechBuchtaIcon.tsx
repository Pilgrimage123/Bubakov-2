import React from 'react';

interface CzechBuchtaIconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const CzechBuchtaIcon: React.FC<CzechBuchtaIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
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
      aria-label="Česká pečená buchta s povidly sypaná moučkovým cukrem"
    >
      <defs>
        <radialGradient id="cbShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#26170E" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#26170E" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#26170E" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="cbCrust" x1="20%" y1="10%" x2="80%" y2="85%">
          <stop offset="0%" stopColor="#9C4410" />
          <stop offset="25%" stopColor="#7B3208" />
          <stop offset="55%" stopColor="#B85D16" />
          <stop offset="85%" stopColor="#D97A22" />
          <stop offset="100%" stopColor="#E59938" />
        </linearGradient>

        <linearGradient id="cbSheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFAE42" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#C25A12" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6E2805" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="cbCrumb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8E7" />
          <stop offset="40%" stopColor="#FDE8B5" />
          <stop offset="80%" stopColor="#EED08F" />
          <stop offset="100%" stopColor="#DCB46F" />
        </linearGradient>

        <radialGradient id="cbPovidla" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#54162B" />
          <stop offset="70%" stopColor="#3D0B1C" />
          <stop offset="100%" stopColor="#260410" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="62" cy="74" rx="46" ry="12" fill="url(#cbShadow)" />

      {/* Tender baked dough base */}
      <path
        d="M 22 42 C 18 52, 22 66, 32 71 C 48 76, 80 73, 98 64 C 108 59, 110 46, 106 36 C 102 24, 88 18, 68 18 C 44 18, 28 26, 22 42 Z"
        fill="url(#cbCrumb)"
        stroke="#1E140C"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Golden-brown baked top crust dome */}
      <path
        d="M 28 36 C 32 23, 48 18, 70 18 C 90 18, 103 24, 106 35 C 108 45, 104 56, 96 61 C 84 66, 68 62, 52 56 C 40 52, 30 45, 28 36 Z"
        fill="url(#cbCrust)"
        stroke="#1E140C"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Crust depth & rounded gloss */}
      <path
        d="M 32 34 C 36 25, 50 20, 69 20 C 86 20, 98 25, 101 34 C 103 42, 99 51, 91 55 C 80 52, 62 46, 48 42 C 38 39, 33 36, 32 34 Z"
        fill="url(#cbSheen)"
        opacity="0.85"
      />

      {/* Torn Crumb on the Left */}
      <path
        d="M 23 42 C 20 48, 19 56, 24 64 C 28 69, 36 71, 44 69 C 42 61, 38 52, 33 46 C 28 41, 25 40, 23 42 Z"
        fill="url(#cbCrumb)"
        stroke="#22170E"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />

      {/* Crumb interior texture */}
      <path d="M 25 48 C 28 49, 31 53, 30 57" fill="none" stroke="#DEBF7D" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 27 59 C 30 63, 35 64, 38 65" fill="none" stroke="#FFFDF6" strokeWidth="2" strokeLinecap="round" />
      <path d="M 22 55 C 24 58, 25 61, 27 63" fill="none" stroke="#FFFDF6" strokeWidth="1.8" strokeLinecap="round" />

      {/* Sweet plum povidla filling inside */}
      <ellipse cx="34" cy="56" rx="6.5" ry="4.5" transform="rotate(-15 34 56)" fill="url(#cbPovidla)" />
      <ellipse cx="33" cy="55" rx="3.5" ry="2" transform="rotate(-15 33 55)" fill="#6E1E3B" />
      <circle cx="32" cy="54" r="0.9" fill="#FFF" opacity="0.7" />

      {/* Moučkový cukr (powdered sugar) dusted across top crust */}
      <g fill="#FFFFFF" opacity="0.95">
        <ellipse cx="64" cy="27" rx="14" ry="4" opacity="0.35" />
        <ellipse cx="60" cy="32" rx="16" ry="5" opacity="0.25" />

        <circle cx="48" cy="25" r="1.3" />
        <circle cx="53" cy="23" r="1.6" />
        <circle cx="58" cy="22" r="1.4" />
        <circle cx="63" cy="24" r="1.8" />
        <circle cx="68" cy="23" r="1.5" />
        <circle cx="73" cy="25" r="1.4" />
        <circle cx="78" cy="27" r="1.2" />

        <circle cx="44" cy="29" r="1.2" />
        <circle cx="49" cy="28" r="1.7" />
        <circle cx="54" cy="27" r="2.0" />
        <circle cx="59" cy="28" r="1.8" />
        <circle cx="65" cy="29" r="2.1" />
        <circle cx="70" cy="28" r="1.9" />
        <circle cx="76" cy="30" r="1.6" />
        <circle cx="82" cy="31" r="1.3" />

        <circle cx="42" cy="34" r="1.1" />
        <circle cx="47" cy="33" r="1.6" />
        <circle cx="52" cy="32" r="1.9" />
        <circle cx="57" cy="33" r="2.2" />
        <circle cx="63" cy="34" r="2.0" />
        <circle cx="68" cy="34" r="1.8" />
        <circle cx="74" cy="35" r="1.7" />
        <circle cx="80" cy="36" r="1.4" />
        <circle cx="86" cy="37" r="1.2" />

        <circle cx="46" cy="38" r="1.3" />
        <circle cx="51" cy="37" r="1.8" />
        <circle cx="56" cy="38" r="1.9" />
        <circle cx="62" cy="39" r="1.7" />
        <circle cx="67" cy="40" r="1.6" />
        <circle cx="73" cy="41" r="1.5" />
        <circle cx="79" cy="42" r="1.3" />
        <circle cx="85" cy="43" r="1.1" />

        <circle cx="53" cy="43" r="1.4" />
        <circle cx="59" cy="44" r="1.5" />
        <circle cx="65" cy="45" r="1.4" />
        <circle cx="71" cy="46" r="1.3" />
        <circle cx="77" cy="47" r="1.2" />

        <circle cx="39" cy="27" r="0.8" />
        <circle cx="43" cy="23" r="0.9" />
        <circle cx="51" cy="20" r="1.0" />
        <circle cx="56" cy="19" r="0.9" />
        <circle cx="62" cy="20" r="1.1" />
        <circle cx="67" cy="20" r="1.0" />
        <circle cx="72" cy="21" r="0.9" />
        <circle cx="77" cy="23" r="0.8" />
        <circle cx="82" cy="24" r="0.9" />
        <circle cx="87" cy="28" r="0.8" />

        <circle cx="36" cy="32" r="0.9" />
        <circle cx="38" cy="37" r="0.8" />
        <circle cx="43" cy="42" r="1.0" />
        <circle cx="48" cy="44" r="1.1" />
        <circle cx="54" cy="48" r="0.9" />
        <circle cx="60" cy="49" r="1.0" />
        <circle cx="66" cy="50" r="0.9" />
        <circle cx="72" cy="51" r="0.8" />
        <circle cx="78" cy="52" r="0.8" />
        <circle cx="88" cy="47" r="0.9" />
        <circle cx="92" cy="42" r="0.8" />
        <circle cx="93" cy="36" r="0.9" />
      </g>
    </svg>
  );
};
