import React from 'react';

export interface FajfkaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const FajfkaIcon: React.FC<FajfkaIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 100"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        ...style,
      }}
      aria-label="Dědečkova bylinková fajfka s kováním a vroubkovaným okrajem"
      {...props}
    >
      <defs>
        {/* Soft shadow under pipe */}
        <radialGradient id="fajfkaShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E1710" stopOpacity="0.32" />
          <stop offset="65%" stopColor="#1E1710" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1E1710" stopOpacity="0" />
        </radialGradient>

        {/* Gouache wood / clay bowl gradient */}
        <linearGradient id="fajfkaWood" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D98246" />
          <stop offset="25%" stopColor="#BD6830" />
          <stop offset="60%" stopColor="#9C4F20" />
          <stop offset="85%" stopColor="#7B3A14" />
          <stop offset="100%" stopColor="#5A280B" />
        </linearGradient>

        {/* Highlight ridge along bowl curve */}
        <linearGradient id="fajfkaHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5B282" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#FBD3B6" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D98246" stopOpacity="0.3" />
        </linearGradient>

        {/* Embossed antique pewter / silver collar gradient */}
        <linearGradient id="fajfkaSilver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="30%" stopColor="#CBD5E1" />
          <stop offset="65%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>

        {/* Polished dark horn / bog oak stem */}
        <linearGradient id="fajfkaStem" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E232A" />
          <stop offset="45%" stopColor="#334155" />
          <stop offset="70%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Brass fittings */}
        <linearGradient id="fajfkaBrass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Burning herb embers inside bowl */}
        <radialGradient id="fajfkaEmbers" cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="40%" stopColor="#C2410C" />
          <stop offset="75%" stopColor="#431407" />
          <stop offset="100%" stopColor="#1A0D07" />
        </radialGradient>
      </defs>

      {/* Ground shadow beneath pipe base */}
      <ellipse cx="44" cy="94" rx="34" ry="5.5" fill="url(#fajfkaShadow)" />

      <g id="fajfka-art" className="lada-anim-float">
        {/* ========================================================
            1. CURVED DARK STEM & MOUTHPIECE (Troubel a náústek)
            Curving gracefully from metal collar (73, 56) to (115, 12)
            ======================================================== */}
        {/* Stem main tube */}
        <path
          d="M 69 49.5
             C 74 41, 80 29, 87 21
             C 94 13, 102 9.5, 114 10
             L 115 13.5
             C 104 13.5, 96 17, 89.5 25
             C 83 33, 77.5 45, 74 53
             Z"
          fill="url(#fajfkaStem)"
          stroke="#12151A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Stem specular highlight streak */}
        <path
          d="M 70.5 48
             C 75.5 40, 81.5 28, 88 20.5
             C 94.5 13, 102 10.5, 112 11"
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.0"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Mouthpiece brass lip ferrule (Mosazný okraj náústku) */}
        <path
          d="M 112.5 8.5
             C 114.5 9, 116.5 10.5, 116.5 13
             C 116.5 15.5, 114.5 16.5, 112.5 15.5
             L 113.5 12
             Z"
          fill="url(#fajfkaBrass)"
          stroke="#100C08"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* Brass ring between stem and lower collar */}
        <path
          d="M 68 49 L 74 53 L 71 57 L 65 53 Z"
          fill="url(#fajfkaBrass)"
          stroke="#100C08"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* ========================================================
            2. LOWER EMBOSSED METAL COLLAR (Středová objímka s vroubky)
            ======================================================== */}
        <g id="lower-collar">
          <path
            d="M 64.5 52.5 L 71.5 57 L 63 67 L 56.5 62 Z"
            fill="url(#fajfkaSilver)"
            stroke="#100C08"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Embossed scalloped pattern */}
          <path
            d="M 62 56.5
               C 61 58, 62.5 60, 63.5 60.5
               C 64.5 61, 66 63, 67 63.5
               C 68 64, 69.5 66, 70.5 66.5"
            fill="none"
            stroke="#1E293B"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Collar highlight */}
          <line x1="58" y1="61.5" x2="63.5" y2="52.5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" opacity="0.9" />
        </g>

        {/* ========================================================
            3. WOODEN / CLAY BOWL & NECK (Hlavička dýmky a krk)
            Authentic curved bowl with wood pores & stippling
            ======================================================== */}
        {/* Main bowl silhouette */}
        <path
          d="M 12 39
             C 11 50, 11 65, 16 77
             C 21 89, 32 95, 41 94
             C 52 93, 60 84, 65 74
             C 68 68, 64 61, 57 61.5
             C 47 62.5, 40 68, 35 69
             C 27 70, 24 58, 23 48
             C 22.5 44, 23 41, 23 39
             Z"
          fill="url(#fajfkaWood)"
          stroke="#1F130B"
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Upper bowl wall extension under metal band */}
        <path
          d="M 12 39
             C 12.5 48, 14 62, 19 72
             C 24 82, 33 88, 41 87
             C 48 86, 56 78, 60 70
             L 57 61.5
             C 45 66, 34 68, 27 64
             C 21 60, 20 48, 20 39
             Z"
          fill="url(#fajfkaWood)"
        />

        {/* Wood highlights along the left belly contour */}
        <path
          d="M 15 44
             C 14 54, 15 67, 19 76
             C 23 85, 32 90, 39 89"
          fill="none"
          stroke="url(#fajfkaHighlight)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Delicate vertical woodgrain dashes & pores (typické ladovské žilkování) */}
        <g stroke="#3E1A0A" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
          <line x1="16" y1="52" x2="16.5" y2="56" />
          <line x1="18" y1="64" x2="18.5" y2="69" />
          <line x1="19" y1="74" x2="20" y2="78" />
          <line x1="26" y1="79" x2="27.5" y2="83" />
          <line x1="33" y1="84" x2="35.5" y2="87" />
          <line x1="42" y1="85" x2="44.5" y2="82" />
          <line x1="49" y1="78" x2="52" y2="74" />
          <line x1="56" y1="71" x2="58" y2="67" />
          <line x1="23" y1="55" x2="23.5" y2="60" />
          <line x1="28" y1="63" x2="29" y2="68" />
          <line x1="35" y1="71" x2="36" y2="76" />
          <line x1="43" y1="74" x2="44" y2="70" />
        </g>

        {/* ========================================================
            4. ORNATE SCALLOPED METAL RIM BAND (Kování hlavičky s vroubky)
            ======================================================== */}
        <g id="top-scalloped-rim">
          {/* Main silver rim collar band */}
          <path
            d="M 11 38
               L 41 42
               C 43 42.5, 45 44, 44 47
               L 43 51
               C 42 53, 40 55, 38 54.5
               C 35 54, 34 56.5, 31 56
               C 28 55.5, 27 58, 24 57.5
               C 21 57, 20 59, 17 58.5
               C 14 58, 13 59.5, 10.5 58.5
               C 8.5 57.5, 9 54, 9.5 50
               L 10 42
               C 10 39, 10.5 38, 11 38
               Z"
            fill="url(#fajfkaSilver)"
            stroke="#12151A"
            strokeWidth="2.0"
            strokeLinejoin="round"
          />

          {/* Top rim upper bevel edge */}
          <path
            d="M 11 38.5 L 41 42.5"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Embossed round studs / rivets along the metal band */}
          <g fill="#E2E8F0" stroke="#100C08" strokeWidth="0.8">
            <circle cx="15" cy="45" r="1.3" />
            <circle cx="21" cy="46" r="1.3" />
            <circle cx="27" cy="47" r="1.3" />
            <circle cx="33" cy="48" r="1.3" />
            <circle cx="39" cy="49" r="1.3" />
          </g>

          {/* Hanging hinge flap / leaf charm on right side of rim */}
          <g id="lid-charm" transform="translate(42, 45)">
            {/* Hinge loop */}
            <path
              d="M 0 0
                 C 3 -2, 5 1, 4 4
                 C 3 6, 0 6, -1 3"
              fill="none"
              stroke="#100C08"
              strokeWidth="1.5"
            />
            {/* Dangling embossed leaf charm */}
            <path
              d="M 1 4
                 C 5 7, 5 12, 2 16
                 C -1 12, -2 8, 1 4
                 Z"
              fill="url(#fajfkaSilver)"
              stroke="#100C08"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            {/* Center vein on leaf charm */}
            <line x1="1" y1="6" x2="2" y2="14" stroke="#475569" strokeWidth="0.8" />
          </g>
        </g>

        {/* ========================================================
            5. BOWL INTERIOR & BURNING HERBS (Žhavé bylinky v dýmce)
            ======================================================== */}
        {/* Cut rim oval showing inner bowl chamber */}
        <ellipse
          cx="26"
          cy="38.5"
          rx="15"
          ry="7.5"
          fill="#D6C4A5"
          stroke="#100C08"
          strokeWidth="1.8"
        />

        {/* Dark cured herbal blend filling the bowl */}
        <ellipse
          cx="26"
          cy="39"
          rx="12.5"
          ry="5.5"
          fill="url(#fajfkaEmbers)"
          stroke="#1A0D07"
          strokeWidth="1.2"
        />

        {/* Glowing orange & yellow ember specks of burning thyme/sage */}
        <g className="lada-anim-flicker">
          <circle cx="23" cy="38" r="1.4" fill="#F59E0B" />
          <circle cx="27" cy="40" r="1.2" fill="#EA580C" />
          <circle cx="29" cy="38" r="0.9" fill="#FEF08A" />
          <circle cx="21" cy="40.5" r="0.8" fill="#F97316" />
        </g>

        {/* Delicate curling herbal smoke plume wafting from bowl */}
        <g className="lada-anim-steam-1">
          <path
            d="M 27 34
               C 25 28, 30 22, 28 16
               C 26 10, 31 6, 33 2"
            fill="none"
            stroke="rgba(226, 232, 240, 0.75)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
        <g className="lada-anim-steam-2">
          <path
            d="M 23 33
               C 21 27, 24 23, 22 17
               C 20 12, 24 8, 25 5"
            fill="none"
            stroke="rgba(203, 213, 225, 0.5)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
};
