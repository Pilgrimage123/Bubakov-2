import React from 'react';

export interface LadaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

const baseSvgStyle = (size: string | number, style: React.CSSProperties = {}): React.CSSProperties => ({
  display: 'inline-block',
  verticalAlign: 'middle',
  overflow: 'visible',
  flexShrink: 0,
  width: typeof size === 'number' ? `${size}px` : size,
  height: typeof size === 'number' ? `${size}px` : size,
  ...style,
});

/**
 * Wooden watermill cogwheel with iron hub (⚙️ / settings / mill)
 */
export const LadaSettingsCogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mlýnské soukolí" {...props}>
    <g className="lada-anim-cog">
      {/* 8 Carved wooden cogs */}
      <path
        d="M 15 3 L 21 3 L 20 7 C 22 7.7 23.8 8.7 25.4 10 L 29 8 L 32 13 L 29 15.6 C 29.5 17.5 29.5 19.5 29 21.4 L 32 24 L 29 29 L 25.4 27 C 23.8 28.3 22 29.3 20 30 L 21 34 L 15 34 L 16 30 C 14 29.3 12.2 28.3 10.6 27 L 7 29 L 4 24 L 7 21.4 C 6.5 19.5 6.5 17.5 7 15.6 L 4 13 L 7 8 L 10.6 10 C 12.2 8.7 14 7.7 16 7 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Wooden wheel rim */}
      <circle cx="18" cy="18" r="9" fill="#D9A036" stroke="#1A1612" strokeWidth="2.2" />
      {/* 4 Carved spokes */}
      <line x1="18" y1="9" x2="18" y2="27" stroke="#1A1612" strokeWidth="2.4" />
      <line x1="9" y1="18" x2="27" y2="18" stroke="#1A1612" strokeWidth="2.4" />
      {/* Forged iron center hub */}
      <circle cx="18" cy="18" r="4.2" fill="#2A170A" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="18" r="1.6" fill="#F3E9D2" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Rolled village chronicle parchment with red wax seal (💬 / combat text / scroll)
 */
export const LadaCombatTextIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pergamenový svitek" {...props}>
    <g className="lada-anim-float">
      {/* Rolled parchment roll */}
      <path
        d="M 8 7 C 6 7, 5 9, 6 12 C 7 15, 10 15, 11 12 C 12 9, 10 7, 8 7 Z M 8 7 L 27 7 C 29 7, 30 9, 31 12 L 11 12"
        fill="#E8DCC2"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Sheet unrolling downwards */}
      <path
        d="M 7 13 L 7 26 C 7 28, 9 29, 12 29 L 29 29 C 31 29, 32 27, 31 24 L 29 11 L 10 12"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Written text lines */}
      <line x1="12" y1="17" x2="25" y2="17" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <line x1="12" y1="21" x2="23" y2="21" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      <line x1="12" y1="25" x2="19" y2="25" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
      {/* Red wax seal with ribbon */}
      <g className="lada-anim-glint">
        <circle cx="26" cy="24" r="3.6" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
        <path d="M 26 27 L 24 33 L 26 31 L 28 33 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

/**
 * Wrought-iron village padlock (🔒 / lock / locked)
 */
export const LadaPadlockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovaný zámek" {...props}>
    <g className="lada-anim-shiver">
      {/* Wrought-iron arched shackle */}
      <path
        d="M 12 16 L 12 11 C 12 6, 24 6, 24 11 L 24 16"
        fill="none"
        stroke="#1A1612"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 12 16 L 12 11 C 12 7, 24 7, 24 11 L 24 16"
        fill="none"
        stroke="#8C5A35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Solid iron body */}
      <rect
        x="8"
        y="15"
        width="20"
        height="17"
        rx="3.5"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Brass plate and keyhole */}
      <circle cx="18" cy="21.5" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 17 21.5 L 19 21.5 L 18.5 26 L 17.5 26 Z" fill="#1A1612" />
      {/* Corner rivets */}
      <circle cx="10.5" cy="17.5" r="1.1" fill="#D9A036" />
      <circle cx="25.5" cy="17.5" r="1.1" fill="#D9A036" />
      <circle cx="10.5" cy="29" r="1.1" fill="#D9A036" />
      <circle cx="25.5" cy="29" r="1.1" fill="#D9A036" />
    </g>
  </svg>
);

/**
 * Open wrought-iron padlock (🔓 / unlocked)
 */
export const LadaOpenPadlockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Odemčený zámek" {...props}>
    <g className="lada-anim-float">
      {/* Unlocked swung shackle */}
      <path
        d="M 11 15 L 11 9 C 11 4, 23 4, 23 9 L 23 11"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.8"
        strokeLinecap="round"
        transform="rotate(-20 18 10)"
      />
      <rect
        x="8"
        y="16"
        width="20"
        height="16"
        rx="3.5"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="22" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 17 22 L 19 22 L 18.5 27 L 17.5 27 Z" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Brass magnifying glass with turned wooden handle (🔎 / 🔍 / search / reveal)
 */
export const LadaMagnifierIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mosazná lupa" {...props}>
    <g className="lada-anim-rock">
      {/* Turned wooden handle */}
      <path
        d="M 23 23 L 31 31 C 32 32, 33 31, 32 30 L 25 22 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Brass lens bezel */}
      <circle cx="15" cy="15" r="10" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      {/* Glass with sky reflection */}
      <circle cx="15" cy="15" r="7.5" fill="#E0F2FE" stroke="#1A1612" strokeWidth="1.8" />
      {/* Star glint on glass */}
      <path
        d="M 12 11 L 14 13 L 12 15 L 10 13 Z"
        fill="#FFFFFF"
        className="lada-anim-glint"
      />
    </g>
  </svg>
);

/**
 * Golden-baked cracklings flatbread (🫓 / skvarkova_placka)
 */
export const LadaPlackaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Škvarková placka" {...props}>
    {/* Rising steam wisps */}
    <path d="M 14 8 C 13 5, 16 3, 15 1" fill="none" stroke="#F3E9D2" strokeWidth="2" strokeLinecap="round" className="lada-anim-steam-1" />
    <path d="M 22 9 C 23 6, 20 4, 22 2" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-2" />
    <g className="lada-anim-float">
      {/* Shadow */}
      <ellipse cx="18" cy="28" rx="14" ry="4" fill="#2A170A" opacity="0.25" />
      {/* Placka flatbread body */}
      <ellipse cx="18" cy="22" rx="13.5" ry="9" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      <ellipse cx="18" cy="21.5" rx="11" ry="6.8" fill="#F59E0B" opacity="0.6" />
      {/* Scored cross-hatching */}
      <line x1="9" y1="20" x2="27" y2="24" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="10" y1="24" x2="26" y2="20" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
      {/* Diced roasted cracklings */}
      <rect x="13" y="19" width="3" height="2.5" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="20" y="19.5" width="3.2" height="2.2" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="16" y="22.5" width="2.8" height="2.5" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="22" y="23" width="2.6" height="2" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="11" y="22" width="2.5" height="2.2" rx="0.5" fill="#451A03" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Sturdy stitched wanderer's boots (👢 / 🥾 / toulave_boty)
 */
export const LadaBootsIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Toulavé škorně" {...props}>
    {/* Dust puff at the heel */}
    <circle cx="8" cy="30" r="2.2" fill="#E8DCC2" stroke="#1A1612" strokeWidth="1.2" className="lada-anim-dust" />
    <g className="lada-anim-step">
      {/* Boot shaft */}
      <path
        d="M 12 7 L 22 7 L 21 17 L 27 21 C 29 22.5, 30 25, 29 27 L 27 28 L 9 28 L 9 25 C 9 22, 11 20, 12 17 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Turned leather cuff */}
      <path d="M 10 7 C 10 5, 24 5, 24 7 L 22 10 L 11 10 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Sturdy sole and heel */}
      <path d="M 8 28 L 29 28 L 29 31 L 22 31 L 22 30 L 15 30 L 15 31 L 8 31 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Stitched seam & brass buckle */}
      <line x1="16" y1="10" x2="16" y2="23" stroke="#D9A036" strokeWidth="1.5" strokeDasharray="1.5 1.5" />
      <rect x="18" y="21" width="3.5" height="3" rx="0.5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Tied linen coin pouch with gold ducat emblem (💰 / zlaty_dukat / money)
 */
export const LadaDucatPouchIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Měšec s dukátem" {...props}>
    <g className="lada-anim-rock">
      {/* Pouch ruffled top */}
      <path
        d="M 14 11 C 12 6, 15 4, 18 6 C 21 4, 24 6, 22 11 Z"
        fill="#E8DCC2"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Tied rope cord */}
      <ellipse cx="18" cy="11.5" rx="5" ry="1.8" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
      {/* Linen pouch belly */}
      <path
        d="M 13 12 C 9 14, 5 20, 6 25 C 7 30, 11 32, 18 32 C 25 32, 29 30, 30 25 C 31 20, 27 14, 23 12 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Embossed gold Austrian/Czech ducat emblem */}
      <circle cx="18" cy="22" r="5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
      <text x="18" y="24.5" fontSize="6.5" fontWeight="900" textAnchor="middle" fill="#2A170A" fontFamily="serif">K</text>
      {/* Star sparkle on gold coin */}
      <circle cx="21" cy="19" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Foaming earthenware tavern mug (🍺 / beer / korbel)
 */
export const LadaBeerMugIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Korbel piva" {...props}>
    <g className="lada-anim-float">
      {/* Stoneware handle */}
      <path
        d="M 23 14 C 29 14, 30 25, 23 27"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M 23 14 C 28 14, 29 25, 23 27"
        fill="none"
        stroke="#8C5A35"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Stoneware ribbed mug body */}
      <path
        d="M 9 12 L 23 12 L 22 30 C 22 31, 21 32, 19 32 L 13 32 C 11 32, 10 31, 10 30 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Blue folk cobalt painted band */}
      <path d="M 9.5 19 L 22.5 19 L 22.3 23 L 9.7 23 Z" fill="#3A76A8" stroke="#1A1612" strokeWidth="1.5" />
      {/* Foaming overflowing beer head */}
      <g className="lada-anim-foam">
        <path
          d="M 8 13 C 6 13, 6 9, 9 9 C 9 7, 12 6, 14 8 C 16 6, 20 6, 21 8 C 23 7, 26 9, 24 13 C 25 15, 23 17, 21 16 C 18 17, 14 17, 12 16 C 10 17, 7 16, 8 13 Z"
          fill="#FFFDF6"
          stroke="#1A1612"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Overflowing foam drop on mug */}
        <path d="M 11 14 C 11 18, 13 18, 13 14" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      </g>
    </g>
  </svg>
);

/**
 * Folk golden carnival or boss crown (👑 / crown)
 */
export const LadaCrownIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Královská koruna" {...props}>
    <g className="lada-anim-float">
      {/* Red velvet interior cap */}
      <path d="M 8 25 C 8 18, 28 18, 28 25 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="2" />
      {/* Golden crown spikes */}
      <path
        d="M 6 25 L 8 11 L 13 18 L 18 9 L 23 18 L 28 11 L 30 25 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Beaten gold base band */}
      <rect x="6" y="24" width="24" height="5" rx="1.5" fill="#B45309" stroke="#1A1612" strokeWidth="2.2" />
      {/* Pearl / folk gems */}
      <circle cx="8" cy="11" r="1.8" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="18" cy="9" r="2.2" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="28" cy="11" r="1.8" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="12" cy="26.5" r="1.2" fill="#38BDF8" />
      <circle cx="18" cy="26.5" r="1.5" fill="#4D7C0F" />
      <circle cx="24" cy="26.5" r="1.2" fill="#38BDF8" />
      {/* Gem glint */}
      <circle cx="18" cy="9" r="0.9" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Painted Czech folk ceramic trophy cup (🏆 / trophy)
 */
export const LadaTrophyIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malovaný pohár" {...props}>
    <g className="lada-anim-float">
      {/* Ornate handles */}
      <path d="M 10 11 C 4 11, 4 20, 11 20" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 26 11 C 32 11, 32 20, 25 20" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      {/* Goblet chalice */}
      <path
        d="M 10 8 L 26 8 L 25 18 C 24 23, 20 25, 18 25 C 16 25, 12 23, 11 18 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Gold rim and folk flower */}
      <rect x="9" y="7" width="18" height="3" rx="1" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="18" cy="16" r="2.5" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      {/* Stem and footed base */}
      <path d="M 16 25 L 16 29 L 20 29 L 20 25 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
      <path d="M 12 29 L 24 29 L 25 32 L 11 32 Z" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Trophy glint */}
      <circle cx="13" cy="11" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Festive rosemary sprig with fluttering red ribbon (🎉 / celebration)
 */
export const LadaCelebrationRibbonIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Rozmarýn s pentlí" {...props}>
    {/* Confetti sparkle */}
    <circle cx="8" cy="9" r="1.2" fill="#D9A036" className="lada-anim-glint" />
    <circle cx="28" cy="8" r="1.2" fill="#C83E31" className="lada-anim-glint" />
    <g className="lada-anim-rock">
      {/* Green rosemary sprigs */}
      <line x1="18" y1="28" x2="18" y2="7" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 18 10 L 13 8 M 18 14 L 12 13 M 18 18 L 13 19" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 18 9 L 23 7 M 18 13 L 24 12 M 18 17 L 23 18" stroke="#4D7C0F" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tied red folk ribbon bow */}
      <circle cx="18" cy="20" r="2.5" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      <path d="M 18 20 C 13 18, 12 23, 17 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.6" />
      <path d="M 18 20 C 23 18, 24 23, 19 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.6" />
      {/* Fluttering ribbon tails */}
      <path d="M 17 22 C 14 26, 12 29, 13 32" fill="none" stroke="#C83E31" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 19 22 C 22 26, 24 29, 23 32" fill="none" stroke="#C83E31" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Birch twig broom (🧹 / broom)
 */
export const LadaBroomIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Březové koště" {...props}>
    {/* Dust sweep wisp */}
    <path d="M 6 31 C 10 32, 14 31, 16 30" fill="none" stroke="#E8DCC2" strokeWidth="2" strokeLinecap="round" className="lada-anim-dust" />
    <g className="lada-anim-rock">
      {/* Ashwood stick handle */}
      <line x1="28" y1="5" x2="16" y2="20" stroke="#1A1612" strokeWidth="3.4" strokeLinecap="round" />
      <line x1="28" y1="5" x2="16" y2="20" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Tied birch twigs bundle */}
      <path
        d="M 16 20 L 20 23 L 13 32 C 10 33, 7 31, 8 28 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Willow tie band */}
      <line x1="15" y1="21" x2="19" y2="24" stroke="#5E3A21" strokeWidth="2.4" />
      {/* Individual twig bristles */}
      <line x1="16" y1="24" x2="11" y2="31" stroke="#8C5A35" strokeWidth="1.5" />
      <line x1="14" y1="22" x2="8" y2="29" stroke="#8C5A35" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Painted clay folk rooster (🐓 / rooster)
 */
export const LadaRoosterIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hliněný kohoutek" {...props}>
    <g className="lada-anim-pulse">
      {/* Plump clay body */}
      <path
        d="M 12 18 C 9 14, 13 9, 17 9 C 20 9, 23 11, 23 15 C 27 15, 30 18, 29 23 C 28 27, 23 29, 18 29 C 12 29, 9 24, 12 18 Z"
        fill="#F3E9D2"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Red folk comb and wattle */}
      <path d="M 15 9 C 14 6, 17 5, 17 7 C 18 5, 20 6, 19 9 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="14" cy="13" r="1.5" fill="#C83E31" />
      {/* Yellow beak & eye */}
      <path d="M 12 11 L 8 13 L 13 14 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="16" cy="11.5" r="1.1" fill="#1A1612" />
      {/* Arched painted folk tail feathers */}
      <path d="M 28 21 C 32 18, 33 13, 29 10 C 27 13, 27 17, 27 21" fill="#3A76A8" stroke="#1A1612" strokeWidth="2" />
      <path d="M 27 23 C 31 22, 33 17, 30 14" fill="none" stroke="#D9A036" strokeWidth="2" strokeLinecap="round" />
      {/* Clay pedestal base */}
      <path d="M 15 29 L 21 29 L 23 33 L 13 33 Z" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * Forged iron horseshoe (🧲 / horseshoe / podkova)
 */
export const LadaHorseshoeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovářská podkova" {...props}>
    <g className="lada-anim-rock">
      {/* Heavy forged iron U-shape */}
      <path
        d="M 9 10 C 9 6, 13 5, 15 7 L 15 15 C 15 19, 21 19, 21 15 L 21 7 C 23 5, 27 6, 27 10 C 27 22, 23 29, 18 29 C 13 29, 9 22, 9 10 Z"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Forged square nail holes */}
      <rect x="10.5" y="11" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="11.5" y="17" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="14" y="23" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="23.7" y="11" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="22.7" y="17" width="1.8" height="1.8" fill="#F3E9D2" />
      <rect x="20.2" y="23" width="1.8" height="1.8" fill="#F3E9D2" />
      {/* Glint on polished heel calk */}
      <circle cx="11" cy="7" r="1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Carved wooden cuckoo clock (⏰ / clock / cuckoo)
 */
export const LadaCuckooClockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vyřezávané kukačky" {...props}>
    {/* Swinging carved pendulum */}
    <g className="lada-anim-rock">
      <line x1="18" y1="26" x2="18" y2="33" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="33" r="2.5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
    </g>
    <g className="lada-anim-float">
      {/* Pointed chalet roof */}
      <path d="M 8 13 L 18 4 L 28 13 L 26 15 L 18 8 L 10 15 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Wooden clock box */}
      <rect x="10" y="13" width="16" height="14" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Cuckoo door */}
      <rect x="15" y="7" width="6" height="5" rx="2" fill="#2A170A" stroke="#1A1612" strokeWidth="1.5" />
      {/* Dial with clock hands */}
      <circle cx="18" cy="20" r="5" fill="#F3E9D2" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="18" y1="20" x2="18" y2="17" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="18" y1="20" x2="21" y2="20" stroke="#1A1612" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Studded wooden round shield (🛡️ / 🛡 / shield)
 */
export const LadaShieldIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Okovaný štít" {...props}>
    <g className="lada-anim-float">
      {/* Shield body (oak planks) */}
      <path
        d="M 18 4 C 26 4, 30 7, 30 16 C 30 25, 23 30, 18 33 C 13 30, 6 25, 6 16 C 6 7, 10 4, 18 4 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Vertical iron reinforcement band */}
      <path d="M 15 5 L 21 5 L 21 31 L 15 31 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="1.5" />
      {/* Center iron boss (puklice) */}
      <circle cx="18" cy="17" r="4.5" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="17" r="2.2" fill="#2A170A" />
      {/* Iron rivets */}
      <circle cx="18" cy="8" r="1.1" fill="#D9A036" />
      <circle cx="18" cy="26" r="1.1" fill="#D9A036" />
      <circle cx="9" cy="14" r="1.1" fill="#D9A036" />
      <circle cx="27" cy="14" r="1.1" fill="#D9A036" />
      {/* Boss glint */}
      <circle cx="16.5" cy="15.5" r="1.1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Forged hunter's sabre / crossed blades (🗡️ / ⚔️ / weapons)
 */
export const LadaSwordIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lovecká šavle" {...props}>
    <g className="lada-anim-rock">
      {/* Polished steel blade */}
      <path
        d="M 27 5 C 29 8, 28 14, 21 21 L 16 26 L 14 24 L 19 19 C 24 14, 25 7, 27 5 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Curved brass crossguard */}
      <path d="M 12 21 C 15 23, 19 27, 21 30 L 19 32 C 17 29, 13 25, 10 23 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
      {/* Wooden hilt and brass pommel */}
      <line x1="14" y1="26" x2="8" y2="32" stroke="#5E3A21" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="7" cy="33" r="2.2" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      {/* Blade glint */}
      <circle cx="24" cy="9" r="1.2" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Village hearth ember fire (🔥 / fire)
 */
export const LadaHearthFireIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský ohýnek" {...props}>
    {/* Crossed hearth logs */}
    <line x1="7" y1="31" x2="29" y2="28" stroke="#1A1612" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="7" y1="31" x2="29" y2="28" stroke="#8C5A35" strokeWidth="3" strokeLinecap="round" />
    <line x1="9" y1="28" x2="27" y2="31" stroke="#1A1612" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="9" y1="28" x2="27" y2="31" stroke="#5E3A21" strokeWidth="3" strokeLinecap="round" />
    {/* Outer red flame */}
    <g className="lada-anim-flicker">
      <path
        d="M 18 4 C 18 4, 11 12, 11 20 C 11 27, 14 29, 18 29 C 22 29, 25 27, 25 20 C 25 12, 18 4, 18 4 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Inner bright yellow flame */}
      <path
        d="M 18 10 C 18 10, 14 16, 14 22 C 14 26, 16 28, 18 28 C 20 28, 22 26, 22 22 C 22 16, 18 10, 18 10 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Floating ember spark */}
      <circle cx="21" cy="6" r="1.2" fill="#FDE047" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Hand-drawn winter frost snowflake (❄️ / frost / ice)
 */
export const LadaSnowflakeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Sněhová vločka" {...props}>
    <g className="lada-anim-float">
      {/* 6 primary branches with ink outlines */}
      <g stroke="#1A1612" strokeWidth="3.2" strokeLinecap="round">
        <line x1="18" y1="5" x2="18" y2="31" />
        <line x1="7" y1="12" x2="29" y2="24" />
        <line x1="7" y1="24" x2="29" y2="12" />
      </g>
      <g stroke="#38BDF8" strokeWidth="2.2" strokeLinecap="round">
        <line x1="18" y1="5" x2="18" y2="31" />
        <line x1="7" y1="12" x2="29" y2="24" />
        <line x1="7" y1="24" x2="29" y2="12" />
      </g>
      {/* Crystal barbs */}
      <path d="M 14 9 L 18 12 L 22 9 M 14 27 L 18 24 L 22 27" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      {/* Center crystal core with glint */}
      <circle cx="18" cy="18" r="3.2" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="1.3" fill="#38BDF8" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Rustic jagged golden lightning bolt (⚡ / lightning)
 */
export const LadaLightningIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Blesk" {...props}>
    <g className="lada-anim-shiver">
      <path
        d="M 21 3 L 10 18 L 17 18 L 13 33 L 26 15 L 19 15 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="14" r="1.5" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Swirling wind gust with blowing leaf (💨 / wind / dash)
 */
export const LadaWindGustIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Větrný vír" {...props}>
    <g className="lada-anim-float">
      {/* Wind swirl curves */}
      <path d="M 5 15 C 15 15, 23 13, 27 10 C 30 7, 28 5, 25 6 C 22 7, 22 10, 24 11" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 5 15 C 15 15, 23 13, 27 10 C 30 7, 28 5, 25 6 C 22 7, 22 10, 24 11" fill="none" stroke="#E0F2FE" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 7 21 C 17 21, 25 21, 28 18 C 30 16, 29 14, 27 15" fill="none" stroke="#1A1612" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 7 21 C 17 21, 25 21, 28 18 C 30 16, 29 14, 27 15" fill="none" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" />
      {/* Flying autumn oak leaf */}
      <path d="M 12 25 C 10 28, 14 30, 17 28 C 19 25, 17 23, 14 24 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Comic starburst impact (💥 / impact / hit)
 */
export const LadaImpactBurstIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský prásk" {...props}>
    <g className="lada-anim-pulse">
      <path
        d="M 18 4 L 22 11 L 30 8 L 27 16 L 34 20 L 26 24 L 28 32 L 20 28 L 16 34 L 14 27 L 6 29 L 9 21 L 2 17 L 9 13 L 7 5 L 15 9 Z"
        fill="#F59E0B"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="5" fill="#FEF08A" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * White birch log (🪵 / wood / log)
 */
export const LadaBirchLogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Březové poleno" {...props}>
    <g className="lada-anim-float">
      {/* Log body */}
      <path
        d="M 11 10 L 26 15 L 23 27 L 8 22 Z"
        fill="#FFFDF6"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* End grain ellipse */}
      <ellipse cx="9.5" cy="16" rx="4.5" ry="6.5" fill="#D9A036" stroke="#1A1612" strokeWidth="2.2" />
      <ellipse cx="9.5" cy="16" rx="2.5" ry="4" fill="none" stroke="#8C5A35" strokeWidth="1.5" />
      {/* Characteristic black birch bark notches */}
      <path d="M 14 13 L 18 14" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 21 19 L 25 20" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 15 22 L 18 23" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Village chapel bronze bell (🔔 / bell / zvonice)
 */
export const LadaChapelBellIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zvonice" {...props}>
    <g className="lada-anim-rock">
      {/* Bell hanger loop */}
      <path d="M 15 8 C 15 5, 21 5, 21 8" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      {/* Clapper ball */}
      <circle cx="18" cy="29" r="3" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Bronze bell body */}
      <path
        d="M 14 8 C 14 8, 13 18, 8 23 C 7 24, 8 26, 11 26 L 25 26 C 28 26, 29 24, 28 23 C 23 18, 22 8, 22 8 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Folk engraving band */}
      <path d="M 10 22 C 14 21, 22 21, 26 22" fill="none" stroke="#8C5A35" strokeWidth="1.8" />
      <circle cx="15" cy="14" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Rosemary sprig and healing green herb (🌿 / herb / rosemary)
 */
export const LadaRosemaryIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Snítka rozmarýnu" {...props}>
    <g className="lada-anim-rock">
      <path d="M 8 30 C 14 26, 22 18, 26 7" fill="none" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 8 30 C 14 26, 22 18, 26 7" fill="none" stroke="#4D7C0F" strokeWidth="1.8" strokeLinecap="round" />
      {/* Leaflets */}
      <ellipse cx="23" cy="8" rx="2.5" ry="5" transform="rotate(35 23 8)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="20" cy="13" rx="2.2" ry="4.5" transform="rotate(-40 20 13)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="23" cy="16" rx="2.2" ry="4.5" transform="rotate(45 23 16)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="16" cy="20" rx="2.2" ry="4.5" transform="rotate(-40 16 20)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
      <ellipse cx="18" cy="23" rx="2.2" ry="4.5" transform="rotate(50 18 23)" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.6" />
    </g>
  </svg>
);

/**
 * Masopust folk painted skull (💀 / skull)
 */
export const LadaFolkSkullIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Morová lebka" {...props}>
    <g className="lada-anim-float">
      {/* Cranium */}
      <path
        d="M 9 17 C 9 9, 27 9, 27 17 C 27 21, 24 23, 23 25 L 23 29 L 13 29 L 13 25 C 12 23, 9 21, 9 17 Z"
        fill="#FAF5E8"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Inked eyes & nasal bone */}
      <ellipse cx="14" cy="17" rx="3" ry="3.5" fill="#1A1612" />
      <ellipse cx="22" cy="17" rx="3" ry="3.5" fill="#1A1612" />
      <path d="M 18 21 L 16.5 24 L 19.5 24 Z" fill="#1A1612" />
      {/* Folk teeth lines */}
      <line x1="15" y1="26" x2="15" y2="29" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="18" y1="26" x2="18" y2="29" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="21" y1="26" x2="21" y2="29" stroke="#1A1612" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Folk painted crimson heart (❤️ / ❤ / heart / hp)
 */
export const LadaFolkHeartIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malované srdce" {...props}>
    <g className="lada-anim-pulse">
      <path
        d="M 18 10 C 22 4, 31 5, 31 14 C 31 22, 23 26, 18 31 C 13 26, 5 22, 5 14 C 5 5, 14 4, 18 10 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* White folk painted ornament inside */}
      <path d="M 12 12 C 14 9, 17 11, 16 14 C 15 17, 12 16, 12 12" fill="none" stroke="#FFFDF6" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="24" cy="12" r="1.3" fill="#FFFDF6" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Sourdough rye loaf (🍞 / 🥖 / bread)
 */
export const LadaRyeBreadIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Žitný chléb" {...props}>
    <path d="M 18 9 C 17 6, 20 4, 19 2" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      <ellipse cx="18" cy="23" rx="14" ry="8" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Sourdough crust cuts */}
      <line x1="12" y1="18" x2="16" y2="24" stroke="#5E3A21" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="17" x2="20" y2="25" stroke="#5E3A21" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="19" x2="25" y2="24" stroke="#5E3A21" strokeWidth="2" strokeLinecap="round" />
      {/* Flour dusting */}
      <circle cx="15" cy="20" r="0.9" fill="#FFFDF6" />
      <circle cx="21" cy="21" r="0.9" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Golden village rohlík (🥐 / croissant / rohlik)
 */
export const LadaCroissantIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pekařský rohlík" {...props}>
    <g className="lada-anim-float">
      <path
        d="M 6 25 C 8 13, 28 13, 30 25 C 28 26, 25 24, 23 21 C 20 18, 16 18, 13 21 C 11 24, 8 26, 6 25 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Poppy seed sprinkles */}
      <circle cx="15" cy="18" r="0.8" fill="#1A1612" />
      <circle cx="18" cy="17" r="0.8" fill="#1A1612" />
      <circle cx="21" cy="18" r="0.8" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Wheel of Olomouc curd cheese (🧀 / cheese)
 */
export const LadaCheeseWheelIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Tvarůžek" {...props}>
    <g className="lada-anim-float">
      <path
        d="M 6 24 L 28 27 L 31 16 L 16 13 L 6 24 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      <polygon points="6,24 16,13 31,16 22,23" fill="#F59E0B" opacity="0.6" stroke="#1A1612" strokeWidth="1.8" />
      {/* Cheese holes */}
      <circle cx="13" cy="20" r="1.5" fill="#D97706" />
      <circle cx="23" cy="22" r="2" fill="#D97706" />
      <circle cx="22" cy="16" r="1.3" fill="#D97706" />
    </g>
  </svg>
);

/**
 * Granite fieldstone (🪨 / stone)
 */
export const LadaGraniteStoneIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Polní kámen" {...props}>
    <g className="lada-anim-float">
      <path
        d="M 8 26 C 6 20, 11 11, 19 11 C 27 11, 30 18, 29 25 C 27 30, 12 31, 8 26 Z"
        fill="#8A887D"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Green moss patch */}
      <path d="M 14 13 C 17 11, 22 12, 23 15 C 20 16, 16 15, 14 13 Z" fill="#4D7C0F" />
      {/* Granite texture speckles */}
      <circle cx="12" cy="22" r="1" fill="#1A1612" opacity="0.6" />
      <circle cx="20" cy="24" r="1.2" fill="#1A1612" opacity="0.6" />
      <circle cx="24" cy="20" r="0.9" fill="#1A1612" opacity="0.6" />
    </g>
  </svg>
);

/**
 * Woven wicker basket (🧺 / basket)
 */
export const LadaWickerBasketIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Proutěný košík" {...props}>
    <g className="lada-anim-rock">
      {/* Arched wicker handle */}
      <path d="M 11 17 C 11 8, 25 8, 25 17" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 11 17 C 11 8, 25 8, 25 17" fill="none" stroke="#D9A036" strokeWidth="1.8" strokeLinecap="round" />
      {/* Woven basket basketry */}
      <path
        d="M 7 17 L 29 17 L 26 30 C 26 31, 24 32, 22 32 L 14 32 C 12 32, 10 31, 10 30 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Weave pattern lines */}
      <line x1="8" y1="22" x2="28" y2="22" stroke="#5E3A21" strokeWidth="1.8" />
      <line x1="9" y1="27" x2="27" y2="27" stroke="#5E3A21" strokeWidth="1.8" />
      <line x1="14" y1="17" x2="14" y2="32" stroke="#D9A036" strokeWidth="1.5" />
      <line x1="22" y1="17" x2="22" y2="32" stroke="#D9A036" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Tallow candle in iron holder (🕯️ / 🕯 / candle / lantern)
 */
export const LadaCandleIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Svíčka" {...props}>
    {/* Flickering candle flame */}
    <g className="lada-anim-flicker">
      <path d="M 18 5 C 18 5, 14 9, 14 12 C 14 14, 16 16, 18 16 C 20 16, 22 14, 22 12 C 22 9, 18 5, 18 5 Z" fill="#FDE047" stroke="#1A1612" strokeWidth="1.5" />
      <ellipse cx="18" cy="13" rx="1.5" ry="2" fill="#F59E0B" />
    </g>
    {/* Black wick */}
    <line x1="18" y1="16" x2="18" y2="18" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
    {/* Wax candle shaft */}
    <rect x="15" y="18" width="6" height="10" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
    {/* Wax drips */}
    <path d="M 15 22 C 14 24, 15 25, 15 22" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.2" />
    {/* Wrought-iron saucer and handle */}
    <ellipse cx="18" cy="29" rx="10" ry="2.5" fill="#2A170A" stroke="#1A1612" strokeWidth="2.2" />
    <path d="M 26 27 C 30 27, 30 32, 26 32" fill="none" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Woodchopper's axe (🪓 / axe)
 */
export const LadaAxeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Tesařská sekyra" {...props}>
    <g className="lada-anim-rock">
      {/* Curved ash handle */}
      <path d="M 27 6 L 10 30" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <path d="M 27 6 L 10 30" stroke="#8C5A35" strokeWidth="2.6" strokeLinecap="round" />
      {/* Forged iron axe head */}
      <path
        d="M 22 6 L 31 11 C 32 17, 28 22, 21 21 L 18 13 Z"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Sharpened steel edge */}
      <path d="M 31 11 C 32 17, 28 22, 21 21" fill="none" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
      <circle cx="30" cy="14" r="1.1" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Ashwood hunting bow (🏹 / bow)
 */
export const LadaHuntingBowIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lovecký luk" {...props}>
    <g className="lada-anim-rock">
      {/* Curved wooden stave */}
      <path d="M 10 7 C 24 10, 24 26, 10 29" fill="none" stroke="#1A1612" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M 10 7 C 24 10, 24 26, 10 29" fill="none" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Taut bowstring */}
      <line x1="10" y1="7" x2="10" y2="29" stroke="#E8DCC2" strokeWidth="1.8" />
      {/* Notched arrow */}
      <line x1="7" y1="18" x2="28" y2="18" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <polygon points="28,18 24,15 24,21" fill="#2A170A" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="8,18 5,16 6,18 5,20" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Painted carnival target (🎯 / target)
 */
export const LadaCarnivalTargetIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pouťový terč" {...props}>
    <g className="lada-anim-pulse">
      {/* Concentric rings */}
      <circle cx="18" cy="18" r="14" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.4" />
      <circle cx="18" cy="18" r="10.5" fill="#C83E31" stroke="#1A1612" strokeWidth="2" />
      <circle cx="18" cy="18" r="7" fill="#F3E9D2" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="3.5" fill="#D9A036" stroke="#1A1612" strokeWidth="1.6" />
      {/* Arrow hitting bullseye */}
      <line x1="28" y1="8" x2="18" y2="18" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Nightwatchman's brass horn (🔊 / 🔇 / sound / mute)
 */
export const LadaHornIcon: React.FC<LadaIconProps & { muted?: boolean }> = ({ size = '1.2em', muted = false, className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label={muted ? "Ztišený roh" : "Ponocenský roh"} {...props}>
    <g className="lada-anim-rock">
      {/* Curved brass horn */}
      <path
        d="M 8 20 C 8 20, 12 16, 18 16 C 22 16, 25 12, 26 8 L 29 9 C 28 15, 23 20, 18 20 C 13 20, 10 24, 8 24 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Horn bell flare */}
      <ellipse cx="28" cy="8.5" rx="2.5" ry="4" transform="rotate(-30 28 8.5)" fill="#B45309" stroke="#1A1612" strokeWidth="1.8" />
      {/* Sound waves or mute cross */}
      {muted ? (
        <line x1="6" y1="6" x2="30" y2="30" stroke="#C83E31" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <g stroke="#1A1612" strokeWidth="2" strokeLinecap="round" fill="none">
          <path d="M 30 4 C 33 6, 33 11, 30 13" />
        </g>
      )}
    </g>
  </svg>
);

/**
 * Painted tavern violin / music note (🎵 / 🎶 / music / music_off)
 */
export const LadaFiddleMusicIcon: React.FC<LadaIconProps & { muted?: boolean }> = ({ size = '1.2em', muted = false, className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label={muted ? "Ztišená hudba" : "Hospodská nota"} {...props}>
    <g className="lada-anim-rock">
      {/* Eighth notes with wooden scroll */}
      <ellipse cx="11" cy="25" rx="4" ry="3" transform="rotate(-20 11 25)" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
      <ellipse cx="23" cy="21" rx="4" ry="3" transform="rotate(-20 23 21)" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" />
      <line x1="14" y1="24" x2="14" y2="10" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="26" y1="20" x2="26" y2="6" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <polygon points="14,10 26,6 26,9 14,13" fill="#1A1612" />
      <circle cx="11" cy="25" r="1.1" fill="#FFFFFF" className="lada-anim-glint" />
      {muted && (
        <line x1="6" y1="6" x2="30" y2="30" stroke="#C83E31" strokeWidth="3" strokeLinecap="round" />
      )}
    </g>
  </svg>
);


/**
 * Traditional Czech marionette puppet cross (🎮 / 🕹️ / game)
 */
export const LadaPuppetToyIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Loutkový vahadlo" {...props}>
    <g className="lada-anim-rock">
      {/* Crossed wooden bars */}
      <line x1="18" y1="6" x2="18" y2="28" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="18" y1="6" x2="18" y2="28" stroke="#8C5A35" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="7" y1="14" x2="29" y2="14" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="7" y1="14" x2="29" y2="14" stroke="#D9A036" strokeWidth="2.5" strokeLinecap="round" />
      {/* Puppet strings */}
      <line x1="8" y1="16" x2="8" y2="30" stroke="#E8DCC2" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="28" y1="16" x2="28" y2="30" stroke="#E8DCC2" strokeWidth="1.5" strokeDasharray="2 2" />
      {/* Center iron rivet */}
      <circle cx="18" cy="14" r="2.2" fill="#2A170A" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Whitewashed Czech cottage (🏘️ / 🏘 / cottage)
 */
export const LadaCottageIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovská chaloupka" {...props}>
    {/* Chimney smoke */}
    <path d="M 23 8 C 22 5, 25 3, 24 1" fill="none" stroke="#F3E9D2" strokeWidth="2" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      {/* Brick chimney */}
      <rect x="21" y="8" width="4" height="6" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" />
      {/* Snow-covered gabled roof */}
      <polygon points="18,5 4,16 32,16" fill="#FFFDF6" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Whitewashed cottage wall */}
      <rect x="7" y="16" width="22" height="15" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Blue wooden window with warm yellow light */}
      <rect x="11" y="19" width="6" height="6" fill="#FDE047" stroke="#3A76A8" strokeWidth="1.8" />
      <line x1="14" y1="19" x2="14" y2="25" stroke="#3A76A8" strokeWidth="1.4" />
      <line x1="11" y1="22" x2="17" y2="22" stroke="#3A76A8" strokeWidth="1.4" />
      {/* Wooden cottage door */}
      <rect x="21" y="21" width="5" height="10" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Village church spire (⛪ / church)
 */
export const LadaChurchSpireIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Venkovský kostelíček" {...props}>
    <g className="lada-anim-float">
      {/* Spire cross */}
      <line x1="18" y1="3" x2="18" y2="9" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="5" x2="20" y2="5" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      {/* Shingled pyramid spire */}
      <polygon points="18,8 11,20 25,20" fill="#3A76A8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Belfry tower */}
      <rect x="12" y="20" width="12" height="13" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Belfry arched louver window */}
      <path d="M 16 26 C 16 23, 20 23, 20 26 L 20 30 L 16 30 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * 8-point gold folk starburst (✨ / 🌟 / ✦ / star / sparkle)
 */
export const LadaStarGlintIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lidová hvězdička" {...props}>
    <g className="lada-anim-glint">
      <path
        d="M 18 3 L 21 13 L 31 10 L 23 18 L 31 26 L 21 23 L 18 33 L 15 23 L 5 26 L 13 18 L 5 10 L 15 13 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="18" r="2.5" fill="#FFFFFF" />
    </g>
  </svg>
);

/**
 * Four-leaf green clover (🍀 / clover / luck / stesti)
 */
export const LadaFourLeafCloverIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Čtyřlístek pro štěstí" {...props}>
    <g className="lada-anim-float">
      {/* Stem */}
      <path d="M 18 18 C 17 26, 12 31, 8 32" fill="none" stroke="#1A1612" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M 18 18 C 17 26, 12 31, 8 32" fill="none" stroke="#4D7C0F" strokeWidth="1.8" strokeLinecap="round" />
      {/* 4 heart-shaped leaves */}
      <g fill="#4D7C0F" stroke="#1A1612" strokeWidth="1.8">
        <path d="M 18 18 C 14 13, 10 7, 14 5 C 18 5, 18 10, 18 18 C 18 10, 18 5, 22 5 C 26 7, 22 13, 18 18" />
        <path d="M 18 18 C 13 14, 7 10, 5 14 C 5 18, 10 18, 18 18 C 10 18, 5 18, 5 22 C 7 26, 13 22, 18 18" />
        <path d="M 18 18 C 23 14, 29 10, 31 14 C 31 18, 26 18, 18 18 C 26 18, 31 18, 31 22 C 29 26, 23 22, 18 18" />
        <path d="M 18 18 C 14 23, 10 29, 14 31 C 18 31, 18 26, 18 18 C 18 26, 18 31, 22 31 C 26 29, 22 23, 18 18" />
      </g>
      {/* Dewdrop sparkle */}
      <circle cx="21" cy="9" r="1.2" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Orient pineapple (🍍 / pineapple / ananas)
 */
export const LadaPineappleIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Orientální ananas" {...props}>
    <g className="lada-anim-rock">
      {/* Green spiky crown */}
      <path
        d="M 18 14 L 14 6 L 17 8 L 18 2 L 19 8 L 22 6 L 18 14"
        fill="#4D7C0F"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Pineapple body with diamond lattice */}
      <ellipse cx="18" cy="22" rx="9" ry="11" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      <line x1="12" y1="16" x2="24" y2="28" stroke="#8C5A35" strokeWidth="1.8" />
      <line x1="24" y1="16" x2="12" y2="28" stroke="#8C5A35" strokeWidth="1.8" />
      <line x1="10" y1="22" x2="26" y2="22" stroke="#8C5A35" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Roasted hearth potato (🥔 / potato / horky_brambor)
 */
export const LadaRoastedPotatoIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pečený brambor" {...props}>
    <path d="M 14 10 C 13 6, 16 4, 15 2" fill="none" stroke="#F3E9D2" strokeWidth="2" strokeLinecap="round" className="lada-anim-steam-1" />
    <path d="M 22 11 C 23 7, 20 5, 22 3" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-2" />
    <g className="lada-anim-float">
      <ellipse cx="18" cy="23" rx="13" ry="8.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Hearth ash marks and potato eyes */}
      <circle cx="13" cy="21" r="1.2" fill="#2A170A" />
      <circle cx="21" cy="24" r="1.2" fill="#2A170A" />
      <circle cx="24" cy="20" r="1" fill="#2A170A" />
      {/* Hot cracked yellow crumb */}
      <path d="M 14 23 C 17 21, 19 25, 22 23" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Village grandmother in white kerchief with blue floral motifs (👵 / granny / babicka)
 */
export const LadaGrannyIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Babička v šátku" {...props}>
    <g className="lada-anim-float">
      {/* Dark brown fringed shawl on shoulders */}
      <path
        d="M 6 33 C 7 27, 12 25, 18 25 C 24 25, 29 27, 30 33 Z"
        fill="#4E3629"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* White folk kerchief with tied knot under chin */}
      <path
        d="M 8 19 C 6 9, 30 9, 28 19 C 28 27, 23 30, 18 30 C 13 30, 8 27, 8 19 Z"
        fill="#F4F1EA"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Kerchief knot & ends under chin */}
      <path
        d="M 14 28 L 11 33 L 16 32 L 18 29 L 20 32 L 25 33 L 22 28 Z"
        fill="#F4F1EA"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Warm kind face oval */}
      <ellipse cx="18" cy="19.5" rx="6.5" ry="6.8" fill="#F5C396" stroke="#1A1612" strokeWidth="1.8" />
      {/* Silver parted hair at forehead */}
      <path d="M 12 16 C 14 13, 17 13, 18 15 C 19 13, 22 13, 24 16" fill="none" stroke="#9CA3AF" strokeWidth="1.8" strokeLinecap="round" />
      {/* Smiling eyes, rosy cheeks and kind smile */}
      <circle cx="15.2" cy="18.5" r="1.2" fill="#1A1612" />
      <circle cx="20.8" cy="18.5" r="1.2" fill="#1A1612" />
      <circle cx="13.8" cy="21" r="1.8" fill="#E05A47" opacity="0.55" />
      <circle cx="22.2" cy="21" r="1.8" fill="#E05A47" opacity="0.55" />
      <path d="M 15.5 22.5 C 17 24.2, 19 24.2, 20.5 22.5" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      {/* Blue & red floral motifs on white kerchief */}
      <circle cx="10.5" cy="14.5" r="1.4" fill="#2B6CB0" />
      <circle cx="25.5" cy="14.5" r="1.4" fill="#2B6CB0" />
      <circle cx="18" cy="10.5" r="1.5" fill="#2B6CB0" />
      <circle cx="14" cy="11.5" r="1.1" fill="#D9463E" />
      <circle cx="22" cy="11.5" r="1.1" fill="#D9463E" />
      <circle cx="10.5" cy="22" r="1.3" fill="#2B6CB0" />
      <circle cx="25.5" cy="22" r="1.3" fill="#2B6CB0" />
    </g>
  </svg>
);

/**
 * Wise grandfather in sheepskin cap (🧓 / grandpa / dedecek)
 */
export const LadaGrandpaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Dědeček s nůší" {...props}>
    {/* Pipe smoke wisp */}
    <path d="M 29 22 C 30 19, 28 16, 30 13" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      {/* Ribbed ram horns */}
      <path d="M 11 13 C 6 10, 4 6, 7 4 C 9 3, 11 6, 13 11" fill="#3B2314" stroke="#1A1612" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M 25 13 C 30 10, 32 6, 29 4 C 27 3, 25 6, 23 11" fill="#3B2314" stroke="#1A1612" strokeWidth="1.6" strokeLinejoin="round" />
      {/* Sheepskin fur cap (žlutohnědá beranice) */}
      <path
        d="M 10 15 C 10 8, 26 8, 26 15 Z"
        fill="#6B3E26"
        stroke="#1A1612"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="8.5" y="13.5" width="19" height="4.2" rx="2.1" fill="#D99B52" stroke="#1A1612" strokeWidth="1.6" />
      {/* Terracotta-coral devilish face */}
      <ellipse cx="18" cy="20.5" rx="6.5" ry="6" fill="#D85C3A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Wild bushy beard */}
      <path
        d="M 11 21 C 10 28, 14 33, 18 33 C 22 33, 26 28, 25 21 Z"
        fill="#E8D8B8"
        stroke="#1A1612"
        strokeWidth="1.8"
      />
      {/* Crooked toothy grin */}
      <path d="M 14.5 23.2 Q 18 25.2 21.5 23.2" fill="#2A0808" stroke="#1A1612" strokeWidth="1.2" />
      <rect x="16" y="23.2" width="1.6" height="1.5" fill="#F2D16B" />
      <rect x="18.4" y="23.2" width="1.6" height="1.5" fill="#E6B84D" />
      {/* Round spectacles & red nose */}
      <circle cx="15.2" cy="19.2" r="2.1" fill="#A8D8EA" fillOpacity="0.45" stroke="#1A1612" strokeWidth="1.3" />
      <circle cx="20.8" cy="19.2" r="2.1" fill="#A8D8EA" fillOpacity="0.45" stroke="#1A1612" strokeWidth="1.3" />
      <circle cx="18" cy="20.6" r="1.6" fill="#C83228" stroke="#1A1612" strokeWidth="1.1" />
      {/* Wooden briar pipe */}
      <line x1="20.5" y1="24" x2="27" y2="25" stroke="#5C2C16" strokeWidth="2" strokeLinecap="round" />
      <rect x="26" y="22" width="3.2" height="4.2" rx="0.7" fill="#7A3A1E" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Village Čert with horns (👹 / devil / cert)
 */
export const LadaDevilIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský čertík" {...props}>
    <g className="lada-anim-flicker">
      {/* Black furry head */}
      <circle cx="18" cy="20" r="10" fill="#2A170A" stroke="#1A1612" strokeWidth="2.4" />
      {/* Red horns */}
      <path d="M 12 14 C 11 8, 8 7, 7 8 C 8 12, 11 15, 12 14" fill="#C83E31" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 24 14 C 25 8, 28 7, 29 8 C 28 12, 25 15, 24 14" fill="#C83E31" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Glowing yellow devil eyes */}
      <circle cx="14" cy="18" r="2.2" fill="#FDE047" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="22" cy="18" r="2.2" fill="#FDE047" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="14" cy="18" r="1" fill="#1A1612" />
      <circle cx="22" cy="18" r="1" fill="#1A1612" />
      {/* Playful red tongue sticking out */}
      <path d="M 16 24 C 16 29, 20 29, 20 24 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Mill pond wave & ripple (🌊 / water / wave)
 */
export const LadaWaterWaveIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vodnická vlnka" {...props}>
    <g className="lada-anim-rock">
      {/* Primary crest */}
      <path
        d="M 5 26 C 9 26, 12 21, 16 21 C 21 21, 23 27, 28 27 C 32 27, 33 24, 33 24 C 33 24, 30 31, 23 31 C 18 31, 16 26, 12 26 C 8 26, 6 29, 5 29 Z"
        fill="#3A76A8"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Curling upper crest */}
      <path
        d="M 12 18 C 17 18, 20 12, 26 12 C 30 12, 32 15, 30 18 C 27 18, 25 15, 23 15 C 19 15, 17 21, 12 21 Z"
        fill="#38BDF8"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* White foam crest */}
      <circle cx="29" cy="14" r="2.2" fill="#FFFDF6" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="26" cy="13" r="1.5" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Forest animal paw print in snow (🐾 / paw)
 */
export const LadaPawPrintIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Stopa ve sněhu" {...props}>
    <g className="lada-anim-pulse" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8">
      {/* Main pad */}
      <ellipse cx="18" cy="23" rx="6.5" ry="5.5" />
      {/* 4 toe pads */}
      <ellipse cx="10" cy="15" rx="2.2" ry="3.2" transform="rotate(-25 10 15)" />
      <ellipse cx="15" cy="11" rx="2.4" ry="3.5" transform="rotate(-10 15 11)" />
      <ellipse cx="21" cy="11" rx="2.4" ry="3.5" transform="rotate(10 21 11)" />
      <ellipse cx="26" cy="15" rx="2.2" ry="3.2" transform="rotate(25 26 15)" />
    </g>
  </svg>
);

/**
 * Village white goose (🪿 / goose)
 */
export const LadaVillageGooseIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Bílá husa" {...props}>
    <g className="lada-anim-step">
      {/* Plump goose body & long neck */}
      <path
        d="M 9 12 C 9 9, 12 7, 14 7 C 16 7, 18 9, 17 14 L 16 20 C 14 20, 10 22, 10 26 C 10 30, 16 31, 23 31 C 29 31, 31 27, 31 23 C 31 20, 27 19, 22 19 L 21 14 C 21 8, 17 5, 13 5 C 9 5, 6 9, 6 13 Z"
        fill="#FFFDF6"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Orange bill */}
      <polygon points="6,9 1,11 6,13" fill="#D97706" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="11" cy="8.5" r="1.1" fill="#1A1612" />
      {/* Webbed orange feet */}
      <line x1="16" y1="31" x2="16" y2="34" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="22" y1="31" x2="22" y2="34" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Snow-laden spruce pine tree (🌲 / pine)
 */
export const LadaSpruceTreeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zasněžený smrček" {...props}>
    <g className="lada-anim-rock">
      {/* Trunk */}
      <rect x="16" y="27" width="4" height="6" fill="#5E3A21" stroke="#1A1612" strokeWidth="2" />
      {/* Tier 3 (bottom) */}
      <polygon points="18,17 7,28 29,28" fill="#3D7843" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 9 27 C 13 25, 23 25, 27 27 L 29 28 L 7 28 Z" fill="#FFFDF6" />
      {/* Tier 2 (middle) */}
      <polygon points="18,10 9,20 27,20" fill="#3D7843" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 11 19 C 14 18, 22 18, 25 19 L 27 20 L 9 20 Z" fill="#FFFDF6" />
      {/* Tier 1 (top) */}
      <polygon points="18,3 12,12 24,12" fill="#3D7843" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 18,3 L 13,11 C 15,10, 21,10, 23,11 Z" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Woolly folk sheep (🐑 / sheep)
 */
export const LadaFolkSheepIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Beránek" {...props}>
    <g className="lada-anim-float">
      {/* Fluffy wool cloud body */}
      <path
        d="M 13 14 C 11 11, 15 8, 18 9 C 21 7, 26 9, 26 13 C 29 13, 31 16, 30 20 C 31 24, 28 27, 24 27 C 22 29, 17 29, 14 27 C 10 27, 8 23, 9 19 C 7 16, 10 13, 13 14 Z"
        fill="#FAF5E8"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Dark head and ears */}
      <ellipse cx="10" cy="18" rx="4" ry="4.5" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="9" cy="17" r="0.9" fill="#FAF5E8" />
      {/* Wooden bell collar */}
      <circle cx="13" cy="22" r="1.8" fill="#D9A036" stroke="#1A1612" strokeWidth="1.2" />
      {/* Sturdy black legs */}
      <line x1="14" y1="27" x2="14" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="18" y1="27" x2="18" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="22" y1="27" x2="22" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="26" y1="27" x2="26" y2="33" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Sturdy farm ox (🐂 / ox)
 */
export const LadaFarmOxIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vesnický vůl" {...props}>
    <g className="lada-anim-float">
      {/* Ox body */}
      <path
        d="M 11 16 L 27 16 C 30 16, 31 20, 31 25 L 30 27 L 11 27 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Massive head */}
      <path d="M 7 14 L 14 14 L 13 23 L 6 22 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Curved horns */}
      <path d="M 8 14 C 6 10, 6 6, 9 5 C 10 8, 9 12, 10 14" fill="#E8DCC2" stroke="#1A1612" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M 12 14 C 13 10, 14 6, 17 5 C 16 8, 14 12, 13 14" fill="#E8DCC2" stroke="#1A1612" strokeWidth="1.8" strokeLinejoin="round" />
      {/* Legs */}
      <line x1="10" y1="26" x2="10" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="26" x2="14" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="26" y1="26" x2="26" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="29" y1="26" x2="29" y2="33" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Mill pond frog (🐸 / frog)
 */
export const LadaPondFrogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vodnická žabka" {...props}>
    <g className="lada-anim-pulse">
      {/* Plump green body */}
      <ellipse cx="18" cy="22" rx="10" ry="8" fill="#4D7C0F" stroke="#1A1612" strokeWidth="2.4" />
      {/* Big yellow eyes */}
      <circle cx="12" cy="13" r="4" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="24" cy="13" r="4" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="12" cy="13" r="1.8" fill="#1A1612" />
      <circle cx="24" cy="13" r="1.8" fill="#1A1612" />
      {/* Wide smiling frog mouth */}
      <path d="M 12 23 C 15 26, 21 26, 24 23" fill="none" stroke="#1A1612" strokeWidth="2" strokeLinecap="round" />
      {/* Webbed feet */}
      <path d="M 8 28 L 4 31 M 28 28 L 32 31" stroke="#1A1612" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Fairground mirror (🪞 / mirror)
 */
export const LadaFairgroundMirrorIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pouťové zrcátko" {...props}>
    <g className="lada-anim-float">
      {/* Turned handle */}
      <line x1="18" y1="27" x2="18" y2="34" stroke="#1A1612" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="18" y1="27" x2="18" y2="34" stroke="#8C5A35" strokeWidth="2.2" strokeLinecap="round" />
      {/* Ornate carved frame */}
      <circle cx="18" cy="15" r="11" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      {/* Shiny glass */}
      <circle cx="18" cy="15" r="8" fill="#E0F2FE" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="15" cy="12" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Coiled hemp rope (🪢 / rope)
 */
export const LadaHempRopeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Konopný uzel" {...props}>
    <g className="lada-anim-rock">
      {/* Rope knot loops */}
      <circle cx="14" cy="16" r="6" fill="none" stroke="#1A1612" strokeWidth="4.2" />
      <circle cx="14" cy="16" r="6" fill="none" stroke="#D9A036" strokeWidth="2.6" />
      <circle cx="22" cy="16" r="6" fill="none" stroke="#1A1612" strokeWidth="4.2" />
      <circle cx="22" cy="16" r="6" fill="none" stroke="#D9A036" strokeWidth="2.6" />
      {/* Loose ends */}
      <line x1="9" y1="22" x2="7" y2="30" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="9" y1="22" x2="7" y2="30" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="27" y1="22" x2="29" y2="30" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="27" y1="22" x2="29" y2="30" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Granite & red brick fortress wall (🧱 / wall)
 */
export const LadaStoneWallIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kamenná zídka" {...props}>
    <g className="lada-anim-float">
      {/* Wall base */}
      <rect x="5" y="9" width="26" height="20" rx="1.5" fill="#C83E31" stroke="#1A1612" strokeWidth="2.4" />
      {/* Mortar joints */}
      <line x1="5" y1="15" x2="31" y2="15" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="5" y1="22" x2="31" y2="22" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="14" y1="9" x2="14" y2="15" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="23" y1="9" x2="23" y2="15" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="18" y1="15" x2="18" y2="22" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="10" y1="22" x2="10" y2="29" stroke="#FAF5E8" strokeWidth="1.8" />
      <line x1="22" y1="22" x2="22" y2="29" stroke="#FAF5E8" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Clay honey pot (🍯 / honey)
 */
export const LadaHoneyPotIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hrnec medu" {...props}>
    <g className="lada-anim-float">
      {/* Clay jar body */}
      <path
        d="M 11 14 C 7 17, 7 28, 12 30 C 14 31, 22 31, 24 30 C 29 28, 29 17, 25 14 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Rim collar */}
      <ellipse cx="18" cy="13" rx="7" ry="2.5" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
      {/* Dripping golden honey */}
      <path
        d="M 14 13 C 14 17, 16 19, 17 21 C 18 22, 19 21, 19 18 C 21 20, 22 17, 22 13 Z"
        fill="#FDE047"
        stroke="#1A1612"
        strokeWidth="1.6"
      />
      <circle cx="17.5" cy="19.5" r="0.9" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Knitted woolen sock (🧦 / sock)
 */
export const LadaWoolSockIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pletená ponožka" {...props}>
    <g className="lada-anim-rock">
      {/* Sock contour */}
      <path
        d="M 13 6 L 23 6 L 23 18 C 23 20, 27 23, 29 26 C 29 29, 26 31, 22 30 L 14 26 C 11 24, 13 18, 13 18 Z"
        fill="#C83E31"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Cream wool cuff and stripes */}
      <rect x="13" y="6" width="10" height="3" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      <line x1="13" y1="13" x2="23" y2="13" stroke="#FAF5E8" strokeWidth="2" />
      <line x1="13" y1="16" x2="23" y2="16" stroke="#FAF5E8" strokeWidth="2" />
    </g>
  </svg>
);

/**
 * Carved bone dice (🎲 / dice)
 */
export const LadaBoneDiceIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hrací kostka" {...props}>
    <g className="lada-anim-rock">
      {/* Isometric cube faces */}
      <polygon points="18,5 29,11 18,17 7,11" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      <polygon points="7,11 18,17 18,31 7,24" fill="#E8DCC2" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      <polygon points="18,17 29,11 29,24 18,31" fill="#D4CBBA" stroke="#1A1612" strokeWidth="2.3" strokeLinejoin="round" />
      {/* Carved dots */}
      <circle cx="18" cy="11" r="1.3" fill="#C83E31" />
      <circle cx="12" cy="21" r="1.2" fill="#1A1612" />
      <circle cx="15" cy="24" r="1.2" fill="#1A1612" />
      <circle cx="23" cy="21" r="1.2" fill="#1A1612" />
      <circle cx="25" cy="25" r="1.2" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Folk painted warning sign (⚠️ / ⚠ / 🚨 / warning)
 */
export const LadaWarningSignIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Výstražná tabulka" {...props}>
    <g className="lada-anim-shiver">
      {/* Triangular painted village sign */}
      <polygon
        points="18,4 32,29 4,29"
        fill="#FAF5E8"
        stroke="#1A1612"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      {/* Red inner border */}
      <polygon points="18,8 28,26 8,26" fill="none" stroke="#C83E31" strokeWidth="2.8" strokeLinejoin="round" />
      {/* Bold exclamation mark */}
      <line x1="18" y1="13" x2="18" y2="20" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="24" r="1.5" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Embroidered folk checkmark (✅ / ✓ / check)
 */
export const LadaCheckmarkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Splněno" {...props}>
    <g className="lada-anim-pulse">
      <path
        d="M 8 18 L 15 25 L 28 9"
        fill="none"
        stroke="#1A1612"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 8 18 L 15 25 L 28 9"
        fill="none"
        stroke="#4D7C0F"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

/**
 * Crossed birch sticks (❌ / ✕ / 🛑 / cancel)
 */
export const LadaCrossCancelIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zrušit" {...props}>
    <g className="lada-anim-rock">
      <line x1="8" y1="8" x2="28" y2="28" stroke="#1A1612" strokeWidth="4.6" strokeLinecap="round" />
      <line x1="8" y1="8" x2="28" y2="28" stroke="#C83E31" strokeWidth="2.8" strokeLinecap="round" />
      <line x1="28" y1="8" x2="8" y2="28" stroke="#1A1612" strokeWidth="4.6" strokeLinecap="round" />
      <line x1="28" y1="8" x2="8" y2="28" stroke="#C83E31" strokeWidth="2.8" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Carved wooden direction pointer (➔ / → / arrow)
 */
export const LadaTavernArrowIcon: React.FC<LadaIconProps & { direction?: 'left' | 'right' }> = ({ size = '1.2em', direction = 'right', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ukazatel cesty" {...props}>
    <g className="lada-anim-float" transform={direction === 'left' ? 'scale(-1, 1) translate(-36, 0)' : undefined}>
      {/* Pointing tavern finger sign */}
      <path
        d="M 6 15 L 20 15 L 20 10 L 31 18 L 20 26 L 20 21 L 6 21 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="18" r="1.3" fill="#2A170A" />
    </g>
  </svg>
);

/**
 * Hand-inked question mark on parchment (❓ / question)
 */
export const LadaQuestionMarkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Otazník" {...props}>
    <g className="lada-anim-float">
      <circle cx="18" cy="18" r="14" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.2" />
      <path
        d="M 13 13 C 13 9, 23 9, 23 15 C 23 19, 18 19, 18 23"
        fill="none"
        stroke="#1A1612"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="27" r="1.8" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Glowing tallow lantern / inspiration spark (💡 / hint / idea)
 */
export const LadaLanternSparkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ponocenská lucerna" {...props}>
    <g className="lada-anim-flicker">
      {/* Hanging ring */}
      <circle cx="18" cy="6" r="3" fill="none" stroke="#1A1612" strokeWidth="2" />
      {/* Lantern cap */}
      <polygon points="18,8 10,13 26,13" fill="#2A170A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Glass case with glowing flame */}
      <rect x="11" y="13" width="14" height="15" fill="#FEF08A" stroke="#1A1612" strokeWidth="2.2" />
      <path d="M 18 16 C 18 16, 15 19, 15 22 C 15 24, 16 25, 18 25 C 20 25, 21 24, 21 22 C 21 19, 18 16, 18 16 Z" fill="#F59E0B" />
      {/* Base */}
      <rect x="9" y="28" width="18" height="3" fill="#2A170A" stroke="#1A1612" strokeWidth="2" />
    </g>
  </svg>
);

/**
 * Folded realm parchment map (🗺️ / map)
 */
export const LadaFoldedMapIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovská mapa" {...props}>
    <g className="lada-anim-float">
      {/* 3 pleated accordion folds */}
      <polygon points="6,9 14,6 14,27 6,30" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="14,6 22,9 22,30 14,27" fill="#E8DCC2" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <polygon points="22,9 30,6 30,27 22,30" fill="#F3E9D2" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* River line and mountain symbol */}
      <path d="M 8 20 C 12 18, 17 21, 28 17" fill="none" stroke="#3A76A8" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 16 14 L 18 10 L 20 14" fill="none" stroke="#8C5A35" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Leather hunting knapsack (🎒 / 🧳 / bag)
 */
export const LadaKnapsackIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Lovecká brašna" {...props}>
    <g className="lada-anim-rock">
      {/* Bag body */}
      <rect x="8" y="14" width="20" height="17" rx="3" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Flap cover */}
      <path d="M 7 14 C 7 14, 18 24, 29 14 L 28 11 L 8 11 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Buckle */}
      <rect x="16.5" y="19" width="3" height="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Wooden village crate (📦 / crate / box)
 */
export const LadaStorageCrateIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Dřevěná bedýnka" {...props}>
    <g className="lada-anim-float">
      <rect x="6" y="10" width="24" height="20" rx="1.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      <line x1="6" y1="10" x2="30" y2="30" stroke="#5E3A21" strokeWidth="2" />
      <line x1="30" y1="10" x2="6" y2="30" stroke="#5E3A21" strokeWidth="2" />
      <rect x="6" y="10" width="24" height="20" fill="none" stroke="#2A170A" strokeWidth="2.4" />
    </g>
  </svg>
);

/**
 * Glazed village ceramic jug (🏺 / jug / urn)
 */
export const LadaClayAmphoraIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Keramický džbán" {...props}>
    <g className="lada-anim-rock">
      {/* Loop handle */}
      <path d="M 23 13 C 29 13, 29 23, 22 25" fill="none" stroke="#1A1612" strokeWidth="2.6" strokeLinecap="round" />
      {/* Jug body */}
      <path
        d="M 13 8 L 23 8 L 21 14 C 26 17, 26 27, 21 30 L 15 30 C 10 27, 10 17, 15 14 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Painted floral band */}
      <line x1="12" y1="21" x2="24" y2="21" stroke="#3A76A8" strokeWidth="2.2" />
    </g>
  </svg>
);

/**
 * Brass pocket compass (🧭 / compass)
 */
export const LadaCompassIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mosazný kompas" {...props}>
    <g className="lada-anim-rock">
      {/* Case ring */}
      <circle cx="18" cy="18" r="13" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" />
      <circle cx="18" cy="18" r="10" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      {/* Blued & red compass needle */}
      <polygon points="18,10 15,18 18,16" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="18,10 21,18 18,16" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="18,26 15,18 18,20" fill="#3A76A8" stroke="#1A1612" strokeWidth="1.2" />
      <polygon points="18,26 21,18 18,20" fill="#3A76A8" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="18" cy="18" r="1.5" fill="#2A170A" />
    </g>
  </svg>
);

/**
 * Turning watermill paddle wheel (🔄 / refresh)
 */
export const LadaWatermillTurnIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Otáčení" {...props}>
    <g className="lada-anim-cog">
      <circle cx="18" cy="18" r="11" fill="none" stroke="#8C5A35" strokeWidth="3" />
      <line x1="18" y1="7" x2="18" y2="29" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="7" y1="18" x2="29" y2="18" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="10" y1="10" x2="26" y2="26" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="10" y1="26" x2="26" y2="10" stroke="#1A1612" strokeWidth="2.2" />
      {/* 2 circular arrows */}
      <path d="M 28 14 C 29 18, 27 24, 22 28" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="18" cy="18" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="1.8" />
    </g>
  </svg>
);

/**
 * Iron ash bucket with broom (🗑️ / 🗑 / trash / delete)
 */
export const LadaAshBucketIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kbelík s popelem" {...props}>
    <g className="lada-anim-rock">
      {/* Broom sticking out */}
      <line x1="12" y1="6" x2="20" y2="20" stroke="#8C5A35" strokeWidth="2.5" strokeLinecap="round" />
      {/* Bucket body */}
      <path
        d="M 10 15 L 26 15 L 24 30 C 24 31, 23 32, 21 32 L 15 32 C 13 32, 12 31, 12 30 Z"
        fill="#2A170A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Iron handle arc */}
      <path d="M 8 15 C 8 8, 28 8, 28 15" fill="none" stroke="#1A1612" strokeWidth="2.2" />
    </g>
  </svg>
);

/**
 * Village blacksmith balance beam (⚖️ / scales)
 */
export const LadaBalanceScalesIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovářské váhy" {...props}>
    <g className="lada-anim-rock">
      {/* Center column & base */}
      <line x1="18" y1="7" x2="18" y2="30" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 12 30 L 24 30 L 25 33 L 11 33 Z" fill="#2A170A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Horizontal beam */}
      <line x1="6" y1="12" x2="30" y2="12" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
      {/* Left pan */}
      <line x1="8" y1="12" x2="5" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <line x1="8" y1="12" x2="11" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 4 22 C 4 25, 12 25, 12 22 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
      {/* Right pan */}
      <line x1="28" y1="12" x2="25" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <line x1="28" y1="12" x2="31" y2="22" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 24 22 C 24 25, 32 25, 32 22 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Josef Lada painter's palette (🎨 / palette / art)
 */
export const LadaPainterPaletteIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malířská paleta" {...props}>
    <g className="lada-anim-float">
      {/* Kidney wooden palette */}
      <path
        d="M 18 5 C 27 5, 32 12, 30 20 C 29 25, 23 27, 24 30 C 24 33, 19 32, 16 32 C 8 32, 4 25, 4 18 C 4 10, 11 5, 18 5 Z"
        fill="#8C5A35"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Thumb hole */}
      <ellipse cx="23" cy="24" rx="2.5" ry="3.5" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      {/* Gouache paint dollops */}
      <circle cx="11" cy="11" r="2.2" fill="#C83E31" />
      <circle cx="17" cy="9" r="2.2" fill="#D9A036" />
      <circle cx="23" cy="11" r="2.2" fill="#3A76A8" />
      <circle cx="10" cy="17" r="2.2" fill="#4D7C0F" />
      <circle cx="9" cy="23" r="2" fill="#FFFDF6" />
    </g>
  </svg>
);

/**
 * Flask of Moravian slivovitz (🧪 / flask / potion)
 */
export const LadaSlivovitzFlaskIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Slivovice" {...props}>
    <g className="lada-anim-float">
      {/* Cork stopper */}
      <rect x="15" y="4" width="6" height="4" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.8" />
      {/* Bottle neck and flask belly */}
      <path
        d="M 14 8 L 22 8 L 22 13 L 28 25 C 30 29, 27 32, 23 32 L 13 32 C 9 32, 6 29, 8 25 L 14 13 Z"
        fill="#E0F2FE"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Glowing amber slivovitz liquid */}
      <path d="M 11 20 L 25 20 L 27 27 C 27 30, 24 31, 22 31 L 14 31 C 12 31, 9 30, 9 27 Z" fill="#D9A036" />
      <circle cx="18" cy="24" r="1.5" fill="#FEF08A" className="lada-anim-foam" />
    </g>
  </svg>
);

/**
 * Folk puppet theatre booth (🎬 / theatre)
 */
export const LadaPuppetBoothIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Loutkové divadélko" {...props}>
    <g className="lada-anim-float">
      {/* Wooden arch frame */}
      <rect x="5" y="6" width="26" height="25" rx="2" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Inner stage opening */}
      <rect x="9" y="12" width="18" height="15" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Draped red velvet curtains */}
      <path d="M 9 12 C 14 12, 13 22, 9 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 27 12 C 22 12, 23 22, 27 22 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
      <path d="M 9 12 C 14 16, 22 16, 27 12 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.5" />
    </g>
  </svg>
);

/**
 * Carved shepherd's willow flute (🪈 / pastyrska_pistala)
 */
export const LadaShepherdsPipeIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pastýřská píšťalka" {...props}>
    <g className="lada-anim-rock">
      {/* Willow whistle tube */}
      <line x1="6" y1="30" x2="28" y2="8" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
      <line x1="6" y1="30" x2="28" y2="8" stroke="#D9A036" strokeWidth="2.6" strokeLinecap="round" />
      {/* Tone holes */}
      <circle cx="13" cy="23" r="1.1" fill="#1A1612" />
      <circle cx="17" cy="19" r="1.1" fill="#1A1612" />
      <circle cx="21" cy="15" r="1.1" fill="#1A1612" />
      {/* Beveled labium mouth */}
      <rect x="25" y="7" width="2" height="3" fill="#8C5A35" />
    </g>
  </svg>
);

/**
 * Smoked Prague ham on the bone (🍖 / 🥩 / meat)
 */
export const LadaSmokedHamIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Uzená kýta" {...props}>
    <path d="M 18 10 C 17 6, 20 4, 19 2" fill="none" stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-steam-1" />
    <g className="lada-anim-float">
      {/* White bone end */}
      <line x1="7" y1="29" x2="14" y2="22" stroke="#FAF5E8" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="6" cy="30" r="2" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.5" />
      {/* Big smoked ham joint */}
      <ellipse cx="22" cy="18" rx="8.5" ry="6.5" transform="rotate(-30 22 18)" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" />
      {/* Tender pink cut face */}
      <ellipse cx="25" cy="16" rx="5" ry="4" transform="rotate(-30 25 16)" fill="#C83E31" stroke="#1A1612" strokeWidth="1.6" />
      <circle cx="25" cy="16" r="1.5" fill="#FAF5E8" />
    </g>
  </svg>
);

/**
 * Curious field mouse Rézinka (🐭 / mouse / rezinka)
 */
export const LadaMouseIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Myška Rézinka" {...props}>
    <g className="lada-anim-rock">
      {/* Curled pinkish tail */}
      <path d="M 6 25 C 4 23, 3 17, 7 14 C 9 12, 10 15, 8 18 C 7 20, 9 22, 12 23" fill="none" stroke="#DCA884" strokeWidth="2" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="19" cy="22" rx="9" ry="7" fill="#8C7355" stroke="#1A1612" strokeWidth="2.4" />
      {/* Pale belly patch */}
      <ellipse cx="21" cy="24" rx="5" ry="3.5" fill="#FAF5E8" />
      {/* Left back ear */}
      <circle cx="17" cy="11" r="4.2" fill="#8C7355" stroke="#1A1612" strokeWidth="2" />
      <circle cx="17" cy="11" r="2.2" fill="#E8A598" />
      {/* Head */}
      <ellipse cx="24" cy="17" rx="6.5" ry="5.5" transform="rotate(10 24 17)" fill="#9C8365" stroke="#1A1612" strokeWidth="2.4" />
      {/* Right front ear */}
      <circle cx="23" cy="10" r="4.5" fill="#9C8365" stroke="#1A1612" strokeWidth="2.2" />
      <circle cx="23" cy="10" r="2.4" fill="#E8A598" />
      {/* Tiny black bead eye with shine */}
      <circle cx="26" cy="15" r="1.6" fill="#1A1612" />
      <circle cx="26.5" cy="14.5" r="0.6" fill="#FAF5E8" />
      {/* Cute pink snout / nose */}
      <circle cx="29.5" cy="19" r="1.5" fill="#E8A598" stroke="#1A1612" strokeWidth="1.2" />
      {/* Whiskers */}
      <line x1="28" y1="18" x2="34" y2="16" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="19.5" x2="35" y2="20" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="28" y1="21" x2="33" y2="23.5" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      {/* Little paws holding crumb */}
      <ellipse cx="24" cy="24" rx="2" ry="1.4" fill="#E8A598" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="26" cy="24.5" r="1.2" fill="#D9A036" stroke="#1A1612" strokeWidth="0.8" />
    </g>
  </svg>
);

/**
 * Heavy blacksmith forge hammer (🔨 / hammer / kladivo)
 */
export const LadaHammerIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kovářské kladivo" {...props}>
    <g className="lada-anim-rock">
      {/* Wooden ash handle */}
      <path
        d="M 10 28 L 22 14"
        stroke="#8C5A35"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <path
        d="M 10 28 L 22 14"
        stroke="#D9A036"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Forged iron hammer head */}
      <polygon
        points="17,10 26,4 31,10 22,17"
        fill="#374151"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Striking face */}
      <line x1="26" y1="4" x2="31" y2="10" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" />
      {/* Eye rivet / wedge */}
      <circle cx="22" cy="12" r="1.6" fill="#1A1612" />
      <circle cx="22" cy="12" r="0.7" fill="#F3E9D2" />
    </g>
  </svg>
);

/**
 * Three-tined forged blacksmith pitchfork (🔱 / pitchfork / vidle)
 */
export const LadaPitchforkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kované vidle" {...props}>
    <g className="lada-anim-rock">
      {/* Wooden handle */}
      <line x1="8" y1="30" x2="20" y2="18" stroke="#8C5A35" strokeWidth="3.6" strokeLinecap="round" />
      <line x1="8" y1="30" x2="20" y2="18" stroke="#D9A036" strokeWidth="2.0" strokeLinecap="round" />
      {/* Iron socket */}
      <ellipse cx="20" cy="18" rx="2.5" ry="3.5" transform="rotate(-45 20 18)" fill="#2A170A" stroke="#1A1612" strokeWidth="1.8" />
      {/* Central prong */}
      <path d="M 20 18 L 29 9" stroke="#1A1612" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M 20 18 L 29 9" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round" />
      {/* Left curved tine */}
      <path d="M 18 19 C 19 14, 22 9, 26 4" fill="none" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 18 19 C 19 14, 22 9, 26 4" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
      {/* Right curved tine */}
      <path d="M 21 17 C 26 17, 31 19, 34 14" fill="none" stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M 21 17 C 26 17, 31 19, 34 14" fill="none" stroke="#CBD5E1" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Threshing flail & golden wheat sheaf (🌾 / flail / cep / obili)
 */
export const LadaGrainFlailIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Dřevěný cep na obilí" {...props}>
    <g className="lada-anim-rock" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Main crooked handle in warm, hand-carved wood. */}
      <path d="M 5 32 Q 10 26 14.5 19 Q 18 13.5 21 8" stroke="#1A1612" strokeWidth="5.1" />
      <path d="M 5 32 Q 10 26 14.5 19 Q 18 13.5 21 8" stroke="#A66A32" strokeWidth="3.2" />
      <path d="M 6 30 Q 11 25 15 19 Q 18.4 13.8 20 9.5" stroke="#E8BD79" strokeWidth="0.9" />
      <path d="M 8 27 l 3 -3 M 12 21 l 3 -3 M 15.8 16.2 l 2 -2" stroke="#5B3418" strokeWidth="0.8" />
      <ellipse cx="12.4" cy="22.4" rx="1.5" ry="0.9" transform="rotate(-52 12.4 22.4)" stroke="#4A2B18" strokeWidth="0.8" />
      {/* Grip and pivot end wrapped in dark leather strips. */}
      <path d="M 4.8 31.6 l 3.8 -2.4 M 6.2 33.1 l 3.8 -2.4 M 18.8 10 l 3.6 1.8 M 19.7 8.2 l 3.6 1.8 M 20.6 6.5 l 3.6 1.8" stroke="#3B2114" strokeWidth="2.1" />
      <circle cx="22.4" cy="8.2" r="2.2" fill="#6F421F" stroke="#1A1612" strokeWidth="1.2" />
      {/* Flexible loop joins the loose wooden striker. */}
      <path d="M 22.8 7.7 C 27 2.8 31 5.4 29.2 9.2 C 28.6 10.5 26.7 11.5 25 12.1" stroke="#2A170A" strokeWidth="2.3" />
      <path d="M 23.3 7.7 C 26.7 4.4 29.3 5.8 28 8.7" stroke="#B97839" strokeWidth="0.9" />
      {/* Heavy cylindrical beater with highlights and wood grain. */}
      <path d="M 24.5 12.4 Q 27.8 10.6 30 13.2 L 34 24.5 Q 34.5 27.1 32.1 28.4 Q 29.5 29.2 28.2 26.7 L 23 16 Q 22.1 13.8 24.5 12.4 Z" fill="#B97839" stroke="#1A1612" strokeWidth="1.7" />
      <path d="M 25.1 14.1 Q 28.1 13.1 29.5 15.8 L 32.6 24.3 Q 33 26 31.8 26.8" stroke="#E8BD79" strokeWidth="1.3" />
      <path d="M 26 18 l 2.8 2.5 M 28.2 23 l 2.1 1.2" stroke="#6F421F" strokeWidth="0.9" />
      <path d="M 23.5 14.7 l 3.1 -1.4 M 24.5 16.5 l 3.1 -1.5 M 25.4 18.3 l 3.2 -1.5" stroke="#3B2114" strokeWidth="1.8" />
      <path d="M 30.9 28.2 l 2 -1.2" stroke="#5B3418" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * Busy bumblebee & honeybee swarm with straw skep (🐝 / bees / vcely / roj)
 */
export const LadaBeeSwarmIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Včelí roj" {...props}>
    {/* Straw beehive skep */}
    <path
      d="M 10 30 C 9 20, 13 14, 18 14 C 23 14, 27 20, 26 30 Z"
      fill="#D9A036"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    <path d="M 11 25 Q 18 27 25 25" fill="none" stroke="#8C5A35" strokeWidth="1.6" />
    <path d="M 12 20 Q 18 22 24 20" fill="none" stroke="#8C5A35" strokeWidth="1.6" />
    {/* Entrance flight hole */}
    <ellipse cx="18" cy="27" rx="2.5" ry="1.8" fill="#1A1612" />
    {/* Bee 1 (flying right) */}
    <g className="lada-anim-float">
      <ellipse cx="25" cy="10" rx="3.5" ry="2.2" transform="rotate(-15 25 10)" fill="#FBBF24" stroke="#1A1612" strokeWidth="1.4" />
      <line x1="24" y1="8.5" x2="24" y2="11.5" stroke="#1A1612" strokeWidth="1.2" />
      <line x1="26" y1="9" x2="26" y2="12" stroke="#1A1612" strokeWidth="1.2" />
      {/* Gossamer wings */}
      <ellipse cx="24" cy="6" rx="2" ry="3" transform="rotate(20 24 6)" fill="#E0F2FE" opacity="0.85" stroke="#1A1612" strokeWidth="1" />
    </g>
    {/* Bee 2 (flying left) */}
    <g className="lada-anim-rock">
      <ellipse cx="9" cy="12" rx="3" ry="2" transform="rotate(20 9 12)" fill="#FBBF24" stroke="#1A1612" strokeWidth="1.4" />
      <line x1="9" y1="10.5" x2="9" y2="13.5" stroke="#1A1612" strokeWidth="1.2" />
      <ellipse cx="10" cy="8.5" rx="1.8" ry="2.6" transform="rotate(-20 10 8.5)" fill="#E0F2FE" opacity="0.85" stroke="#1A1612" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * Ceramic soup bowl of steaming village garlic broth (🥣 / soup / polevka / miska)
 */
export const LadaSoupBowlIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hliněná miska s polévkou" {...props}>
    {/* Steam wisps */}
    <path d="M 14 10 C 13 8, 15 6, 14 4" fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-float" />
    <path d="M 18 11 C 17 8, 20 6, 19 3" fill="none" stroke="#E5E7EB" strokeWidth="2.0" strokeLinecap="round" className="lada-anim-float" />
    <path d="M 23 10 C 22 8, 24 6, 23 4" fill="none" stroke="#D1D5DB" strokeWidth="1.8" strokeLinecap="round" className="lada-anim-float" />
    {/* Clay bowl body */}
    <path
      d="M 6 15 C 6 27, 13 31, 18 31 C 23 31, 30 27, 30 15 Z"
      fill="#C27D38"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Bowl foot */}
    <rect x="13" y="30" width="10" height="2.5" rx="1" fill="#8C4A1F" stroke="#1A1612" strokeWidth="1.8" />
    {/* Rim ellipse */}
    <ellipse cx="18" cy="15" rx="12" ry="4.5" fill="#8C4A1F" stroke="#1A1612" strokeWidth="2.4" />
    {/* Steaming golden broth interior */}
    <ellipse cx="18" cy="15" rx="10.5" ry="3.5" fill="#EAB308" stroke="#1A1612" strokeWidth="1.2" />
    {/* Floating herbs & croutons */}
    <circle cx="15" cy="14" r="1.2" fill="#15803D" />
    <circle cx="21" cy="16" r="1" fill="#15803D" />
    <rect x="17" y="14" width="2" height="2" fill="#78350F" />
    {/* Folk painted glaze stripe */}
    <path d="M 8 20 C 12 24, 24 24, 28 20" fill="none" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Shepherd's warm patched woollen coat (🧥 / coat / kabat / hubertus)
 */
export const LadaPatchedCoatIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Záplatovaný kabát" {...props}>
    {/* Coat body */}
    <path
      d="M 12 8 L 6 15 L 10 18 L 10 32 L 26 32 L 26 18 L 30 15 L 24 8 Z"
      fill="#475569"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Collar / lapels */}
    <polygon points="12,8 18,17 14,8" fill="#1E293B" stroke="#1A1612" strokeWidth="1.6" />
    <polygon points="24,8 18,17 22,8" fill="#1E293B" stroke="#1A1612" strokeWidth="1.6" />
    {/* Front center seam */}
    <line x1="18" y1="17" x2="18" y2="32" stroke="#1A1612" strokeWidth="2" />
    {/* Bone horn buttons */}
    <circle cx="16.5" cy="20" r="1.3" fill="#D9A036" stroke="#1A1612" strokeWidth="1" />
    <circle cx="16.5" cy="24" r="1.3" fill="#D9A036" stroke="#1A1612" strokeWidth="1" />
    <circle cx="16.5" cy="28" r="1.3" fill="#D9A036" stroke="#1A1612" strokeWidth="1" />
    {/* Folk contrast patches */}
    <rect x="11" y="24" width="4" height="4" rx="0.5" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.4" />
    <line x1="11" y1="23.5" x2="15" y2="23.5" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="1 1" />
    <line x1="11" y1="28.5" x2="15" y2="28.5" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="1 1" />
    <rect x="21" y="19" width="3.5" height="3.5" rx="0.5" fill="#166534" stroke="#1A1612" strokeWidth="1.4" />
  </svg>
);

/**
 * Consecrated chalk with folk blessings (🖍️ / chalk / krida / K+M+B)
 */
export const LadaHolyChalkIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Posvěcená křída" {...props}>
    {/* Tříkrálové křížky */}
    <g stroke="#F3E9D2" strokeWidth="1.8" strokeLinecap="round">
      <line x1="8" y1="8" x2="8" y2="14" />
      <line x1="5" y1="11" x2="11" y2="11" />
      <line x1="28" y1="8" x2="28" y2="14" />
      <line x1="25" y1="11" x2="31" y2="11" />
    </g>
    {/* Chalk stick at angle */}
    <g transform="rotate(-35 18 20)">
      <rect x="15" y="8" width="6" height="20" rx="1.5" fill="#FAF5E8" stroke="#1A1612" strokeWidth="2.4" />
      {/* Chalk tip chamfer */}
      <polygon points="15,8 18,4 21,8" fill="#FDE68A" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Shading stripe */}
      <line x1="16.5" y1="9" x2="16.5" y2="26" stroke="#E2E8F0" strokeWidth="1.4" />
    </g>
    {/* Folk cross drawn on bottom */}
    <g stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="26" x2="18" y2="34" />
      <line x1="14" y1="30" x2="22" y2="30" />
    </g>
  </svg>
);

/**
 * Freshly dug horseradish root with green leaves (🫚 / horseradish / kren / koren)
 */
export const LadaHorseradishRootIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pikantní křen" {...props}>
    {/* Green leafy tuft */}
    <path d="M 12 10 Q 7 5 9 2 Q 13 4 14 9" fill="#15803D" stroke="#1A1612" strokeWidth="1.6" />
    <path d="M 15 10 Q 15 2 18 1 Q 19 4 17 9" fill="#22C55E" stroke="#1A1612" strokeWidth="1.6" />
    <path d="M 17 10 Q 23 5 21 2 Q 18 5 16 9" fill="#15803D" stroke="#1A1612" strokeWidth="1.6" />
    {/* Root body tapering down */}
    <path
      d="M 12 9 C 14 8, 18 8, 20 9 C 21 16, 20 25, 17 33 C 15 25, 12 16, 12 9 Z"
      fill="#F5EDE0"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Earthy rings and ridges */}
    <path d="M 13 14 Q 16 16 19 14" fill="none" stroke="#A16207" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 14 19 Q 16 21 18 19" fill="none" stroke="#A16207" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 15 24 Q 16 26 18 24" fill="none" stroke="#A16207" strokeWidth="1.4" strokeLinecap="round" />
    {/* Little side rootlet */}
    <path d="M 19 22 Q 24 24 23 27" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 13 18 Q 9 20 10 24" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Traditional wooden Easter ratchet rattle (🪇 / rattle / rehtacka / klapacka)
 */
export const LadaRehtackaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Velikonoční řehtačka" {...props}>
    {/* Wooden handle */}
    <line x1="8" y1="32" x2="16" y2="20" stroke="#1A1612" strokeWidth="4.2" strokeLinecap="round" />
    <line x1="8" y1="32" x2="16" y2="20" stroke="#8C5A35" strokeWidth="2.4" strokeLinecap="round" />
    {/* Cogwheel axle */}
    <circle cx="16" cy="20" r="3" fill="#D9A036" stroke="#1A1612" strokeWidth="2" />
    {/* Toothed gear cogwheel */}
    <circle cx="16" cy="20" r="5" fill="none" stroke="#1A1612" strokeWidth="2.2" strokeDasharray="3 2" />
    {/* Wooden rattle frame box */}
    <polygon
      points="16,20 28,12 32,18 20,26"
      fill="#B45309"
      stroke="#1A1612"
      strokeWidth="2.4"
      strokeLinejoin="round"
    />
    {/* Springy wooden reed / blade */}
    <line x1="16" y1="20" x2="28" y2="12" stroke="#FEF3C7" strokeWidth="2.6" strokeLinecap="round" />
    <line x1="16" y1="20" x2="28" y2="12" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
    {/* Sound click sparks */}
    <path d="M 29 8 L 32 6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <path d="M 33 13 L 36 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Carved horn or bone coat button (🔘 / button / knoflik)
 */
export const LadaBoneButtonIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Kostěný knoflík" {...props}>
    {/* Outer button disc */}
    <circle cx="18" cy="18" r="14" fill="#E2D9C8" stroke="#1A1612" strokeWidth="2.6" />
    {/* Recessed inner ring */}
    <circle cx="18" cy="18" r="9.5" fill="#C5B8A5" stroke="#1A1612" strokeWidth="1.8" />
    {/* Four button stitch holes */}
    <circle cx="14" cy="14" r="1.6" fill="#1A1612" />
    <circle cx="22" cy="14" r="1.6" fill="#1A1612" />
    <circle cx="14" cy="22" r="1.6" fill="#1A1612" />
    <circle cx="22" cy="22" r="1.6" fill="#1A1612" />
    {/* Crossed thread sewing */}
    <line x1="14" y1="14" x2="22" y2="22" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="22" y1="14" x2="14" y2="22" stroke="#8C5A35" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Little granddaughter Barunka with red bow on braid & wildflower bouquet (👧 / barunka / devcatko)
 */
export const LadaBarunkaIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vnučka Barunka s kytičkou" {...props}>
    <g className="lada-anim-float">
      {/* Red bodice & white puffed sleeves */}
      <circle cx="10" cy="29" r="3.2" fill="#F4F1EA" stroke="#1A1612" strokeWidth="1.8" />
      <circle cx="26" cy="29" r="3.2" fill="#F4F1EA" stroke="#1A1612" strokeWidth="1.8" />
      <path d="M 12 25 L 24 25 L 25 33 L 11 33 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Side braid & bright red ribbon bow */}
      <path d="M 11 18 Q 7 22 8 27" fill="none" stroke="#7C4D2B" strokeWidth="3.2" strokeLinecap="round" />
      <polygon points="8,26 4,24 5,29 8,27 11,29 12,24" fill="#D9463E" stroke="#1A1612" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Sweet child face */}
      <circle cx="18" cy="17.5" r="7" fill="#F5C396" stroke="#1A1612" strokeWidth="2.1" />
      {/* Parted chestnut-brown hair */}
      <path
        d="M 10.8 17 C 10.5 11, 14.5 9, 18 10.5 C 21.5 9, 25.5 11, 25.2 17 C 22.5 14, 19.5 13, 18 14.5 C 16.5 13, 13.5 14, 10.8 17 Z"
        fill="#7C4D2B"
        stroke="#1A1612"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Eyes, rosy cheeks & smile */}
      <circle cx="15.5" cy="17.5" r="1.2" fill="#1A1612" />
      <circle cx="20.5" cy="17.5" r="1.2" fill="#1A1612" />
      <circle cx="13.8" cy="19.8" r="1.6" fill="#E05A47" opacity="0.55" />
      <circle cx="22.2" cy="19.8" r="1.6" fill="#E05A47" opacity="0.55" />
      <path d="M 16 21 Q 18 22.5 20 21" fill="none" stroke="#1A1612" strokeWidth="1.5" strokeLinecap="round" />
      {/* Wildflower bouquet in front */}
      <circle cx="18" cy="30" r="4" fill="#3A7D2C" stroke="#1A1612" strokeWidth="1.5" />
      <circle cx="16.2" cy="29" r="1.8" fill="#E63946" stroke="#1A1612" strokeWidth="1" />
      <circle cx="19.8" cy="29.2" r="1.7" fill="#FBBF24" stroke="#1A1612" strokeWidth="1" />
      <circle cx="18" cy="27.2" r="1.6" fill="#3B82F6" stroke="#1A1612" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * Hand-bound countryside chronicle & bestiary book (📖 / book / kniha / bestiar)
 */
export const LadaBookIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Venkovský bestiář a kronika" {...props}>
    <g className="lada-anim-float">
      {/* Shadow */}
      <ellipse cx="18" cy="31" rx="13" ry="2.6" fill="#1A1612" opacity="0.25" />
      {/* Leather-bound cover back */}
      <path d="M 6 8 L 18 10 L 30 8 L 30 26 L 18 28 L 6 26 Z" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Aged parchment pages thickness */}
      <path d="M 7 24 L 18 26 L 29 24 L 29 25.5 L 18 27.5 L 7 25.5 Z" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.6" />
      {/* Open pages surface */}
      <path d="M 7 9 L 17.5 11 L 17.5 25.5 L 7 24 Z" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      <path d="M 18.5 11 L 29 9 L 29 24 L 18.5 25.5 Z" fill="#FAF5E8" stroke="#1A1612" strokeWidth="1.8" />
      {/* Inked folklore script lines */}
      <line x1="9" y1="13" x2="15.5" y2="14" stroke="#8C5A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <line x1="9" y1="16.5" x2="15.5" y2="17.5" stroke="#8C5A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <line x1="9" y1="20" x2="14" y2="21" stroke="#8C5A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <line x1="20.5" y1="14" x2="27" y2="13" stroke="#8C5A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <line x1="20.5" y1="17.5" x2="27" y2="16.5" stroke="#8C5A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      <line x1="20.5" y1="21" x2="25" y2="20" stroke="#8C5A35" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
      {/* Center spine ridge */}
      <line x1="18" y1="9.5" x2="18" y2="27.5" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      {/* Red silk bookmark ribbon with star glint */}
      <path d="M 18 10 Q 19 19 22 29 L 24 27 L 26 30 Q 21 19 18 10 Z" fill="#C83E31" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="22" cy="28" r="1.4" fill="#FEF08A" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Authentic painted Czech folk chest (🎁 / chest / truhla / malovana_truhla)
 */
export const LadaChestIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Malovaná truhla" {...props}>
    <g className="lada-anim-float">
      {/* Chest ground shadow */}
      <ellipse cx="18" cy="31" rx="14" ry="3" fill="#1A1612" opacity="0.25" />
      {/* Main wooden chest body */}
      <rect x="5" y="14" width="26" height="15" rx="2" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Arched chest lid */}
      <path d="M 4 14 C 4 9 10 7 18 7 C 26 7 32 9 32 14 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Wrought iron decorative strapping */}
      <line x1="10" y1="7.8" x2="10" y2="29" stroke="#1A1612" strokeWidth="2.2" />
      <line x1="26" y1="7.8" x2="26" y2="29" stroke="#1A1612" strokeWidth="2.2" />
      {/* Lid rim */}
      <line x1="4" y1="14" x2="32" y2="14" stroke="#1A1612" strokeWidth="2.4" />
      {/* Painted folk flower on front */}
      <circle cx="18" cy="21" r="3.2" fill="#C83E31" stroke="#1A1612" strokeWidth="1.2" />
      <circle cx="18" cy="21" r="1.2" fill="#FEF08A" />
      <path d="M 14.5 21 Q 13 18 16 19 Z" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1" />
      <path d="M 21.5 21 Q 23 18 20 19 Z" fill="#4D7C0F" stroke="#1A1612" strokeWidth="1" />
      {/* Forged iron padlock clasp */}
      <rect x="16.5" y="13" width="3" height="4.5" fill="#2A170A" stroke="#1A1612" strokeWidth="1.4" />
      {/* Golden glint on iron corner fitting */}
      <circle cx="26" cy="11" r="1.5" fill="#FEF08A" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Spring green seedling & sprout (🌱 / seedling / sazenicka / predjari)
 */
export const LadaSeedlingIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mladý klíček" {...props}>
    <g className="lada-anim-float">
      {/* Spring crumbly soil mound */}
      <ellipse cx="18" cy="30" rx="11" ry="3.5" fill="#5E3A21" stroke="#1A1612" strokeWidth="2.2" />
      <ellipse cx="18" cy="29" rx="8" ry="2" fill="#8C5A35" />
      {/* Sprout curved stem */}
      <path d="M 18 29 Q 18 20 16 15" fill="none" stroke="#1A1612" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M 18 29 Q 18 20 16 15" fill="none" stroke="#4D7C0F" strokeWidth="2" strokeLinecap="round" />
      {/* Left fresh leaf */}
      <path d="M 16 17 C 11 16 8 11 11 7 C 16 7 17 12 16 17 Z" fill="#4D7C0F" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 12 11 Q 14 12 15 15" fill="none" stroke="#86EFAC" strokeWidth="1.2" strokeLinecap="round" />
      {/* Right fresh leaf */}
      <path d="M 16 15 C 21 13 25 8 22 5 C 18 4 16 10 16 15 Z" fill="#86EFAC" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 18 9 Q 19 11 17 14" fill="none" stroke="#4D7C0F" strokeWidth="1.2" strokeLinecap="round" />
      {/* Dewdrop sparkle */}
      <circle cx="10" cy="8" r="1.3" fill="#FFFFFF" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Autumn oak & linden folk leaf (🍂 / 🍁 / autumn_leaf / leaf / podzim)
 */
export const LadaAutumnLeafIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Podzimní list" {...props}>
    <g className="lada-anim-rock">
      {/* Curved wooden leaf stem */}
      <path d="M 7 30 Q 13 23 16 18" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 7 30 Q 13 23 16 18" fill="none" stroke="#5E3A21" strokeWidth="1.8" strokeLinecap="round" />
      {/* Lobed autumn leaf blade */}
      <path
        d="M 14 20 C 10 18 10 14 13 13 C 11 11 12 7 16 7 C 17 4 21 4 23 6 C 26 4 29 7 28 10 C 31 11 31 15 28 17 C 30 20 27 24 24 23 C 22 25 18 24 16 22 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Warm gouache brick-red blush */}
      <path
        d="M 16 18 C 13 16 14 13 16 12 C 16 9 19 6 21 8 C 24 8 26 12 24 15 C 25 18 22 21 19 20 Z"
        fill="#C83E31"
        opacity="0.8"
      />
      {/* Central ink leaf vein */}
      <path d="M 14 20 Q 20 14 26 8" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      {/* Small side veins */}
      <line x1="17" y1="17" x2="14" y2="15" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="20" y1="14" x2="24" y2="11" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="22" y1="12" x2="19" y2="9" stroke="#1A1612" strokeWidth="1.2" strokeLinecap="round" />
      {/* Morning moisture glint */}
      <circle cx="21" cy="7" r="1.3" fill="#FEF08A" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Weathered cemetery stone cross / headstone (🪦 / ⚰️ / tomb / hrbitov)
 */
export const LadaTombstoneIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hřbitovní kříž" {...props}>
    <g className="lada-anim-shiver">
      {/* Graveyard ground mound */}
      <ellipse cx="18" cy="31" rx="13" ry="3" fill="#1A1612" opacity="0.3" />
      <ellipse cx="18" cy="30" rx="10" ry="2.2" fill="#5E3A21" stroke="#1A1612" strokeWidth="1.6" />
      {/* Stone cross */}
      <path
        d="M 15 5 L 21 5 L 21 11 L 28 11 L 28 17 L 21 17 L 21 30 L 15 30 L 15 17 L 8 17 L 8 11 L 15 11 Z"
        fill="#71717A"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Weathered stone bevel */}
      <path d="M 16 6 L 20 6 L 20 12 L 27 12 L 27 16 L 20 16 L 20 29 L 16 29 Z" fill="#A1A1AA" />
      {/* Incised folk cross mark */}
      <line x1="18" y1="10" x2="18" y2="21" stroke="#1A1612" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="14" y1="14" x2="22" y2="14" stroke="#1A1612" strokeWidth="1.4" strokeLinecap="round" />
      {/* Herb moss patch at base */}
      <ellipse cx="14" cy="29" rx="2.5" ry="1.5" fill="#4D7C0F" />
      <ellipse cx="21" cy="28.5" rx="2" ry="1.2" fill="#4D7C0F" />
    </g>
  </svg>
);

/**
 * Three-headed fairytale dragon head (🐉 / dragon / drak)
 */
export const LadaDragonIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pohádkový drak" {...props}>
    <g className="lada-anim-float">
      {/* Dragon neck */}
      <path d="M 9 32 Q 13 22 17 19 L 23 23 Q 19 28 17 32 Z" fill="#15803D" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Dragon horned head */}
      <path
        d="M 15 19 C 13 13 19 9 24 10 C 27 7 30 8 32 11 C 31 15 29 17 25 18 C 26 21 21 24 17 21 Z"
        fill="#16A34A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Dorsal crest fin spikes */}
      <polygon points="17,14 14,9 18,12" fill="#C83E31" stroke="#1A1612" strokeWidth="1.4" />
      <polygon points="14,19 10,15 15,17" fill="#C83E31" stroke="#1A1612" strokeWidth="1.4" />
      <polygon points="12,24 8,22 13,23" fill="#C83E31" stroke="#1A1612" strokeWidth="1.4" />
      {/* Horn on brow */}
      <path d="M 22 10 Q 25 4 28 5 Q 26 8 25 10 Z" fill="#D9A036" stroke="#1A1612" strokeWidth="1.6" />
      {/* Sharp yellow dragon eye */}
      <circle cx="23" cy="13" r="2.2" fill="#FEF08A" stroke="#1A1612" strokeWidth="1.4" />
      <circle cx="23.5" cy="13" r="1" fill="#1A1612" />
      {/* Snout nostril emitting smoke */}
      <circle cx="29" cy="14" r="0.8" fill="#1A1612" />
      {/* Fire ember tongue */}
      <g className="lada-anim-flicker">
        <path d="M 28 17 Q 34 18 31 22 Q 28 20 27 18 Z" fill="#DC2626" stroke="#1A1612" strokeWidth="1.2" />
        <circle cx="33" cy="19" r="1.2" fill="#FBBF24" />
      </g>
    </g>
  </svg>
);

/**
 * Winter flock crow / raven (🐦‍⬛ / crow / vrana)
 */
export const LadaCrowIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 44 44" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Mrazivá vrána" {...props}>
    <g className="lada-anim-float">
      {/* Far / Right Wing with splayed primary feathers */}
      <path
        d="M 24 18 Q 30 10 38 4 Q 36 11 31 15 Q 37 12 41 10 Q 38 16 32 18 Q 37 18 39 19 Q 35 23 28 22 Q 29 26 26 26 L 22 22 Z"
        fill="#1A212E"
        stroke="#090B12"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Fanned 4-feather tail */}
      <path
        d="M 16 25 L 7 29 Q 6 32 9 32 L 13 30 L 10 35 Q 10 37 13 36 L 15 32 L 14 37 Q 16 39 18 36 L 20 27 Z"
        fill="#1A212E"
        stroke="#090B12"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      {/* Swooping torso & shaggy feathered thighs */}
      <path
        d="M 15 19 Q 13 24 15 29 L 16 32 L 18 30 L 21 31 L 23 32 L 25 27 Q 26 22 23 18 Z"
        fill="#232B3A"
        stroke="#090B12"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      {/* Outstretched yellow scaly legs & dark talons */}
      <path
        d="M 18 31 L 21 38 M 21 38 L 25 37 M 21 38 L 26 40 M 21 38 L 21 42 M 23 31 L 28 36 M 28 36 L 32 35 M 28 36 L 33 38 M 28 36 L 28 40"
        fill="none"
        stroke="#F5A623"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Near / Left Wing with 4 splayed primaries & inner covert line */}
      <path
        d="M 18 19 Q 11 11 4 3 Q 6 11 11 15 Q 5 12 2 9 Q 4 16 10 18 Q 5 18 3 18 Q 6 22 12 22 Q 9 25 11 27 Q 15 27 19 22 Z"
        fill="#232B3A"
        stroke="#090B12"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M 9 13 Q 10 17 13 18 Q 12 21 16 21"
        fill="none"
        stroke="#090B12"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Ruffled head & 3 spiky crown crest tufts */}
      <path
        d="M 17 19 L 15 17 L 17 15 Q 18 12 21 11 L 19 8 L 23 10 L 22 7 L 26 10 L 26 8 Q 29 11 29 15 Q 31 17 29 21 L 23 22 Z"
        fill="#232B3A"
        stroke="#090B12"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Open hooked golden-yellow beak & red tongue */}
      <path
        d="M 22 18 L 27 28 L 29 21 Z"
        fill="#2A1014"
        stroke="#F5A623"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M 24 20 L 26.8 25.5 L 27.6 21 Z" fill="#E53E3E" />
      <path
        d="M 22 17 Q 26 16 30 19 Q 33 22 33 26 Q 29 22 23 19 Z"
        fill="#F5A623"
        stroke="#090B12"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      {/* Fierce scowling cream eyes & V-brow */}
      <ellipse cx="24.5" cy="15.5" rx="2.1" ry="2.6" fill="#FDF8E1" stroke="#090B12" strokeWidth="1.4" />
      <ellipse cx="28.2" cy="16" rx="1.5" ry="2" fill="#FDF8E1" stroke="#090B12" strokeWidth="1.3" />
      <circle cx="25" cy="15.8" r="0.9" fill="#090B12" />
      <circle cx="28" cy="16.2" r="0.7" fill="#090B12" />
      <path d="M 22 13 L 26.8 16.5 L 30 14" fill="none" stroke="#090B12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * Czech two-tailed folk lion head (🦁 / lion / lev)
 */
export const LadaLionIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Český lev" {...props}>
    <g className="lada-anim-float">
      {/* Full golden mane scallops */}
      <path
        d="M 18 6 C 13 6 8 10 7 15 C 6 20 8 26 12 29 C 15 31 21 31 24 29 C 28 26 30 20 29 15 C 28 10 23 6 18 6 Z"
        fill="#D9A036"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Lion face mask */}
      <ellipse cx="18" cy="19" rx="7" ry="7.5" fill="#FEF08A" stroke="#1A1612" strokeWidth="2.2" />
      {/* Royal folk crown */}
      <polygon points="14,10 12,6 15,8 18,5 21,8 24,6 22,10" fill="#C83E31" stroke="#1A1612" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="18" cy="5" r="1.2" fill="#FEF08A" className="lada-anim-glint" />
      {/* Eyes */}
      <ellipse cx="15" cy="17" rx="1.3" ry="1.6" fill="#1A1612" />
      <ellipse cx="21" cy="17" rx="1.3" ry="1.6" fill="#1A1612" />
      {/* Nose & whiskers */}
      <polygon points="17,20 19,20 18,22" fill="#1A1612" />
      <line x1="12" y1="21" x2="16" y2="21" stroke="#1A1612" strokeWidth="1.2" />
      <line x1="20" y1="21" x2="24" y2="21" stroke="#1A1612" strokeWidth="1.2" />
      {/* Tongue */}
      <path d="M 17 23 Q 18 26 19 23 Z" fill="#DC2626" stroke="#1A1612" strokeWidth="1" />
    </g>
  </svg>
);

/**
 * Sleepy village crescent moon (🌙 / moon / mesic)
 */
export const LadaMoonIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Noční měsíc" {...props}>
    <g className="lada-anim-float">
      {/* Crescent moon body */}
      <path
        d="M 23 5 C 13 7 7 17 10 27 C 12 32 17 33 22 31 C 15 28 14 18 20 12 C 22 9 24 7 23 5 Z"
        fill="#FEF08A"
        stroke="#1A1612"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Sleeping face line */}
      <path d="M 13 18 Q 16 19 15 16" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      {/* Closed sleepy eye */}
      <path d="M 14 13 Q 16 15 18 13" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      {/* Nightcap on horn */}
      <polygon points="23,5 29,3 24,9" fill="#C83E31" stroke="#1A1612" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="30" cy="3" r="1.4" fill="#FAF5E8" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Village sleep & fatigue (💤 / sleep / spanek / vycerpany)
 */
export const LadaSleepIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Spánek" {...props}>
    <g className="lada-anim-float">
      {/* Large Z */}
      <path d="M 18 8 L 29 8 L 20 19 L 29 19" fill="none" stroke="#1A1612" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 18 8 L 29 8 L 20 19 L 29 19" fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Medium Z */}
      <path d="M 11 17 L 18 17 L 12 25 L 18 25" fill="none" stroke="#1A1612" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 11 17 L 18 17 L 12 25 L 18 25" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Small Z */}
      <path d="M 6 25 L 11 25 L 7 31 L 11 31" fill="none" stroke="#1A1612" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 6 25 L 11 25 L 7 31 L 11 31" fill="none" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sleep star glint */}
      <circle cx="28" cy="7" r="1.3" fill="#FEF08A" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Carved wooden pause bars (⏸ / pause / pauza)
 */
export const LadaPauseIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pauza" {...props}>
    <g className="lada-anim-rock">
      {/* Left carved wooden bar */}
      <rect x="8" y="7" width="7" height="22" rx="2" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="11.5" y1="10" x2="11.5" y2="26" stroke="#D9A036" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="11.5" cy="9" r="0.9" fill="#1A1612" />
      <circle cx="11.5" cy="27" r="0.9" fill="#1A1612" />
      {/* Right carved wooden bar */}
      <rect x="21" y="7" width="7" height="22" rx="2" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      <line x1="24.5" y1="10" x2="24.5" y2="26" stroke="#D9A036" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="24.5" cy="9" r="0.9" fill="#1A1612" />
      <circle cx="24.5" cy="27" r="0.9" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Tavern tally slate & score ledger (📊 / chart / stats / ucet)
 */
export const LadaStatsLedgerIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hospodský účet a statistiky" {...props}>
    <g className="lada-anim-float">
      {/* Wooden frame */}
      <rect x="6" y="6" width="24" height="25" rx="3" fill="#8C5A35" stroke="#1A1612" strokeWidth="2.4" strokeLinejoin="round" />
      {/* Slate blackboard */}
      <rect x="9" y="9" width="18" height="19" rx="1.5" fill="#1E293B" stroke="#1A1612" strokeWidth="1.6" />
      {/* Chalk tally lines */}
      <line x1="12" y1="13" x2="12" y2="18" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15" y1="13" x2="15" y2="18" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18" y1="13" x2="18" y2="18" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="21" y1="13" x2="21" y2="18" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="11" y1="17" x2="22" y2="14" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      {/* Second row chalk tally */}
      <line x1="12" y1="21" x2="12" y2="25" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15" y1="21" x2="15" y2="25" stroke="#F8FAFC" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18" y1="21" x2="18" y2="25" stroke="#FDE047" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Weathered Gothic castle ruins with battlements & nocturnal glow (🏰 / castle / hrad / zricenina / zlenice)
 */
export const LadaCastleRuinsIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Zřícenina hradu Zlenice" {...props}>
    <g className="lada-anim-float">
      {/* Hillock / foundation rock */}
      <path d="M 4 31 Q 18 28 32 31 L 32 33 L 4 33 Z" fill="#334155" stroke="#1A1612" strokeWidth="2.2" strokeLinejoin="round" />
      {/* Ruined rampart wall */}
      <path
        d="M 6 30 L 6 17 L 11 17 L 11 20 L 15 20 L 15 15 L 20 15 L 20 18 L 24 18 L 24 13 L 30 13 L 30 30 Z"
        fill="#64748B"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Stone brick details */}
      <line x1="8" y1="23" x2="14" y2="23" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18" y1="22" x2="26" y2="22" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="26" x2="22" y2="26" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="11" y1="23" x2="11" y2="26" stroke="#1A1612" strokeWidth="1.4" />
      <line x1="21" y1="18" x2="21" y2="22" stroke="#1A1612" strokeWidth="1.4" />
      {/* Gothic arched window with night depth */}
      <path d="M 23 19 Q 25 15 27 19 L 27 25 L 23 25 Z" fill="#0F172A" stroke="#1A1612" strokeWidth="1.6" strokeLinejoin="round" />
      {/* Window glow glint */}
      <circle cx="25" cy="20" r="1.1" fill="#FEF08A" className="lada-anim-glint" />
      {/* Clinging ivy / moss */}
      <path d="M 6 24 Q 9 24 8 28 Q 6 27 6 24" fill="#22C55E" stroke="#1A1612" strokeWidth="1.2" />
    </g>
  </svg>
);

/**
 * Folkloric spectral White Lady ghost (👻 / ghost / duch / bila_pani / strasidlo)
 */
export const LadaGhostIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Bílá paní a strašidlo" {...props}>
    <g className="lada-anim-float">
      {/* Wispy floating gown with folds */}
      <path
        d="M 18 5 C 12 5, 8 10, 8 17 C 8 22, 6 27, 7 31 C 9 29, 12 32, 14 29 C 16 32, 19 29, 21 32 C 23 29, 26 32, 28 29 C 29 32, 31 28, 29 23 C 28 17, 26 5, 18 5 Z"
        fill="#F8FAFC"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Soft inner shroud fold */}
      <path d="M 11 16 Q 14 24 16 28" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 25 16 Q 22 24 20 28" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
      {/* Folkloric expressive dark eyes */}
      <ellipse cx="14.5" cy="13.5" rx="1.6" ry="2.2" fill="#1A1612" />
      <ellipse cx="21.5" cy="13.5" rx="1.6" ry="2.2" fill="#1A1612" />
      {/* Eye shine highlights */}
      <circle cx="15" cy="13" r="0.6" fill="#FFFFFF" />
      <circle cx="22" cy="13" r="0.6" fill="#FFFFFF" />
      {/* Gentle mouth */}
      <ellipse cx="18" cy="18" rx="1.3" ry="1.6" fill="#1A1612" />
      {/* Floating spectral glint */}
      <circle cx="24" cy="9" r="1.2" fill="#FEF08A" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Authentic Czech village snowman with old pot, carrot & birch twigs (☃️ / snowman / snehulak)
 */
export const LadaSnowmanIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Ladovský sněhulák" {...props}>
    <g className="lada-anim-rock">
      {/* Bottom large snowball */}
      <ellipse cx="18" cy="26" rx="9" ry="7.5" fill="#FFFFFF" stroke="#1A1612" strokeWidth="2.3" />
      {/* Bottom snowball shadow */}
      <path d="M 12 29 Q 18 33 24 29" fill="none" stroke="#CBD5E1" strokeWidth="1.8" strokeLinecap="round" />
      {/* Middle snowball */}
      <ellipse cx="18" cy="17" rx="6.5" ry="5.5" fill="#FFFFFF" stroke="#1A1612" strokeWidth="2.3" />
      {/* Coal buttons */}
      <circle cx="18" cy="15.5" r="1.1" fill="#1A1612" />
      <circle cx="18" cy="18.5" r="1.1" fill="#1A1612" />
      <circle cx="18" cy="24" r="1.2" fill="#1A1612" />
      <circle cx="18" cy="27" r="1.2" fill="#1A1612" />
      {/* Head snowball */}
      <ellipse cx="18" cy="9.5" rx="4.8" ry="4.2" fill="#FFFFFF" stroke="#1A1612" strokeWidth="2.2" />
      {/* Coal eyes */}
      <circle cx="16" cy="8.8" r="0.9" fill="#1A1612" />
      <circle cx="20" cy="8.8" r="0.9" fill="#1A1612" />
      {/* Coal smile dots */}
      <circle cx="16" cy="11.5" r="0.5" fill="#1A1612" />
      <circle cx="17.2" cy="12" r="0.5" fill="#1A1612" />
      <circle cx="18.8" cy="12" r="0.5" fill="#1A1612" />
      <circle cx="20" cy="11.5" r="0.5" fill="#1A1612" />
      {/* Pointed orange carrot nose */}
      <polygon points="17.5,9.5 24,11 17.5,11.5" fill="#EA580C" stroke="#1A1612" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Cooking pot on head (hrnec jako čepice) */}
      <path d="M 13.5 6 L 15 1.5 L 21 1.5 L 22.5 6 Z" fill="#64748B" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      <line x1="13" y1="6" x2="23" y2="6" stroke="#1A1612" strokeWidth="2.2" strokeLinecap="round" />
      {/* Pot ear handle */}
      <path d="M 14 3 C 12 3 12 5 14 5" fill="none" stroke="#1A1612" strokeWidth="1.4" />
      {/* Twig birch broom in arm */}
      <line x1="24" y1="29" x2="28" y2="10" stroke="#8C5A35" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M 27 10 L 29 4 L 31 10 L 26 9 Z" fill="#8C5A35" stroke="#1A1612" strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  </svg>
);

/**
 * Hrusice spotted village dog / voříšek (🐕 / dog / pes / vorisek / hafik)
 */
export const LadaVillageDogIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Hrusický voříšek" {...props}>
    <g className="lada-anim-rock">
      {/* Plump dog body */}
      <ellipse cx="17" cy="21" rx="8" ry="6" fill="#FDFBF7" stroke="#1A1612" strokeWidth="2.3" />
      {/* Brown spot on back */}
      <ellipse cx="18" cy="19" rx="3.5" ry="2.5" fill="#8C5A35" />
      {/* Front and back legs */}
      <rect x="11" y="24" width="3" height="7" rx="1.5" fill="#FDFBF7" stroke="#1A1612" strokeWidth="2" />
      <rect x="16" y="24" width="3" height="7" rx="1.5" fill="#FDFBF7" stroke="#1A1612" strokeWidth="2" />
      <rect x="21" y="24" width="3" height="7" rx="1.5" fill="#FDFBF7" stroke="#1A1612" strokeWidth="2" />
      {/* Curled wagging tail */}
      <path d="M 9 20 C 5 17, 6 12, 10 13" fill="none" stroke="#1A1612" strokeWidth="3" strokeLinecap="round" />
      <path d="M 9 20 C 5 17, 6 12, 10 13" fill="none" stroke="#FDFBF7" strokeWidth="1.8" strokeLinecap="round" />
      {/* Cheerful dog head */}
      <circle cx="24" cy="14" r="5" fill="#FDFBF7" stroke="#1A1612" strokeWidth="2.3" />
      {/* Dark patch over one eye and ear */}
      <path d="M 24 9 C 27 9, 29 11, 28 14 C 27 16, 24 16, 24 14 Z" fill="#8C5A35" />
      {/* Floppy dog ears */}
      <path d="M 21 10 C 19 7, 18 11, 19 13 Z" fill="#FDFBF7" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 26 9 C 29 7, 30 11, 29 13 Z" fill="#8C5A35" stroke="#1A1612" strokeWidth="2" strokeLinejoin="round" />
      {/* Snout and nose */}
      <ellipse cx="28" cy="15.5" rx="2.5" ry="2" fill="#FDFBF7" stroke="#1A1612" strokeWidth="1.6" />
      <circle cx="29.5" cy="15" r="1" fill="#1A1612" />
      {/* Dark button eye with spark */}
      <circle cx="23.5" cy="13.5" r="1.1" fill="#1A1612" />
      <circle cx="23.8" cy="13.2" r="0.4" fill="#FFFFFF" />
      {/* Red village collar */}
      <path d="M 21 18 Q 23 20 26 18" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Waterman's dripping felt top hat with ribbon (🎩 / tophat / cylinder / vodnik_klobouk)
 */
export const LadaWatermanHatIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Vodnický cylinder" {...props}>
    <g className="lada-anim-rock">
      {/* Flared curved hat brim */}
      <ellipse cx="18" cy="26" rx="14" ry="4" fill="#1E3A2F" stroke="#1A1612" strokeWidth="2.3" />
      {/* Felt hat crown */}
      <path
        d="M 10 25 L 11 11 C 11 8, 25 8, 25 11 L 26 25 Z"
        fill="#142B23"
        stroke="#1A1612"
        strokeWidth="2.3"
        strokeLinejoin="round"
      />
      {/* Curved hat crown top */}
      <ellipse cx="18" cy="10" rx="7" ry="2.5" fill="#1E3A2F" stroke="#1A1612" strokeWidth="2" />
      {/* Red silk ribbon */}
      <path d="M 10.5 22 Q 18 25 25.5 22 L 25.8 25 Q 18 28 10.2 25 Z" fill="#DC2626" stroke="#1A1612" strokeWidth="1.6" />
      {/* Ribbon bow ends fluttering */}
      <path d="M 24 23 L 29 25 L 28 28 L 24 25 Z" fill="#DC2626" stroke="#1A1612" strokeWidth="1.3" />
      {/* Dripping crystal-blue water droplets */}
      <path d="M 9 29 Q 8 32 9 33 Q 10 32 9 29 Z" fill="#38BDF8" stroke="#1A1612" strokeWidth="1.1" />
      <g className="lada-anim-glint">
        <path d="M 18 29 Q 17 33 18 34 Q 19 33 18 29 Z" fill="#38BDF8" stroke="#1A1612" strokeWidth="1.1" />
      </g>
      <path d="M 27 29 Q 26 32 27 33 Q 28 32 27 29 Z" fill="#38BDF8" stroke="#1A1612" strokeWidth="1.1" />
    </g>
  </svg>
);

/**
 * Folk marsh marigold meadow flower / blatouch (🌼 / flower / kvet / blatouch / hermanek)
 */
export const LadaMeadowFlowerIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Venkovský blatouch a luční kvítek" {...props}>
    <g className="lada-anim-pulse">
      {/* Rustic stem */}
      <path d="M 18 24 Q 19 29 17 33" fill="none" stroke="#15803D" strokeWidth="2.4" strokeLinecap="round" />
      {/* Green serrated leaf */}
      <path d="M 18 28 Q 23 27 25 24 Q 21 24 18 28" fill="#22C55E" stroke="#1A1612" strokeWidth="1.6" strokeLinejoin="round" />
      {/* 5 Plump sunny yellow petals */}
      <circle cx="18" cy="9" r="4.8" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="24.5" cy="14" r="4.8" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="22" cy="22" r="4.8" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="14" cy="22" r="4.8" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      <circle cx="11.5" cy="14" r="4.8" fill="#FDE047" stroke="#1A1612" strokeWidth="2" />
      {/* Warm ochre blossom center */}
      <circle cx="18" cy="16.5" r="4.2" fill="#D97706" stroke="#1A1612" strokeWidth="2.1" />
      <circle cx="16.8" cy="15.5" r="0.8" fill="#FEF08A" />
      <circle cx="19.2" cy="17" r="0.8" fill="#FEF08A" />
    </g>
  </svg>
);

/**
 * Folkloric blazing village sun with wavy ink rays (☀️ / sun / slunce / polednice / jasno)
 */
export const LadaVillageSunIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Polední venkovské slunce" {...props}>
    <g className="lada-anim-pulse">
      {/* 8 Wavy radiating rays */}
      <g stroke="#1A1612" strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M 18 3 Q 19 6 18 8" stroke="#EA580C" strokeWidth="3" />
        <path d="M 18 3 Q 19 6 18 8" />
        <path d="M 18 28 Q 17 30 18 33" stroke="#EA580C" strokeWidth="3" />
        <path d="M 18 28 Q 17 30 18 33" />
        <path d="M 3 18 Q 6 19 8 18" stroke="#EA580C" strokeWidth="3" />
        <path d="M 3 18 Q 6 19 8 18" />
        <path d="M 28 18 Q 30 17 33 18" stroke="#EA580C" strokeWidth="3" />
        <path d="M 28 18 Q 30 17 33 18" />
        <path d="M 7 7 Q 10 9 11 11" stroke="#EA580C" strokeWidth="2.6" />
        <path d="M 7 7 Q 10 9 11 11" />
        <path d="M 25 25 Q 26 27 29 29" stroke="#EA580C" strokeWidth="2.6" />
        <path d="M 25 25 Q 26 27 29 29" />
        <path d="M 29 7 Q 27 10 25 11" stroke="#EA580C" strokeWidth="2.6" />
        <path d="M 29 7 Q 27 10 25 11" />
        <path d="M 11 25 Q 9 27 7 29" stroke="#EA580C" strokeWidth="2.6" />
        <path d="M 11 25 Q 9 27 7 29" />
      </g>
      {/* Golden sun core */}
      <circle cx="18" cy="18" r="8" fill="#FBBF24" stroke="#1A1612" strokeWidth="2.4" />
      {/* Inner warm warmth ring */}
      <circle cx="18" cy="18" r="5" fill="#F59E0B" stroke="#1A1612" strokeWidth="1.5" />
      {/* Sun glint spark */}
      <circle cx="16" cy="16" r="1.3" fill="#FFFDF0" className="lada-anim-glint" />
    </g>
  </svg>
);

/**
 * Barefoot Shepherd boy with feather in hair, red neckerchief, blue vest & wooden flute (pasacek / shepherd)
 */
export const LadaPasacekIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pasáček s píšťalkou a pírkem" {...props}>
    <g className="lada-anim-float">
      {/* Blue vest shoulders & red neckerchief */}
      <path
        d="M 7 33 C 8 27, 12 25, 18 25 C 24 25, 28 27, 29 33 Z"
        fill="#1D5BA6"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="30" r="1.2" fill="#F59E0B" />
      <circle cx="23" cy="30" r="1.2" fill="#F59E0B" />
      {/* Red neckerchief */}
      <path
        d="M 11 25 C 14 28, 22 28, 25 25 L 21 31 L 18 28 L 15 31 Z"
        fill="#D9463E"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Long barred feather behind ear */}
      <path
        d="M 11 14 C 7 8, 6 3, 9 2 C 12 4, 13 9, 13 14 Z"
        fill="#D6C7B2"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="8.8" cy="5.5" r="1.5" fill="#6B4423" />
      <line x1="11.5" y1="13" x2="8.8" y2="4" stroke="#1A1612" strokeWidth="1.2" />
      {/* Cheerful boy face */}
      <circle cx="18" cy="18.5" r="7.5" fill="#F5C396" stroke="#1A1612" strokeWidth="2.2" />
      {/* Tousled chestnut-brown hair */}
      <path
        d="M 10 17 C 9 11, 13 8, 16 9 L 17 6.5 L 20 9 L 23 7.5 L 24 10 C 26 11, 27 14, 25.5 17 C 23 13.5, 14 13.5, 10 17 Z"
        fill="#7C4D2B"
        stroke="#1A1612"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Bright eyes, rosy cheeks & smile */}
      <circle cx="15.5" cy="18" r="1.3" fill="#1A1612" />
      <circle cx="20.8" cy="18" r="1.3" fill="#1A1612" />
      <circle cx="13.8" cy="20.5" r="1.7" fill="#E05A47" opacity="0.6" />
      <circle cx="22.2" cy="20.5" r="1.7" fill="#E05A47" opacity="0.6" />
      <path d="M 16 21.8 Q 18.2 23.5 20.5 21.8" fill="none" stroke="#1A1612" strokeWidth="1.6" strokeLinecap="round" />
      {/* Wooden shepherd's flute (píšťalka) held diagonally */}
      <path
        d="M 22 22 L 32 15 L 33.5 17.2 L 23.5 24 Z"
        fill="#D4A359"
        stroke="#1A1612"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="26.5" cy="20.2" r="0.7" fill="#1A1612" />
      <circle cx="29" cy="18.5" r="0.7" fill="#1A1612" />
    </g>
  </svg>
);

/**
 * Devout Sexton / Churchwarden in brown fedora hat with golden cross & holy water sprinkler (kostelnik / sexton)
 */
export const LadaKostelnikIcon: React.FC<LadaIconProps> = ({ size = '1.2em', className = '', style = {}, ...props }) => (
  <svg viewBox="0 0 36 36" style={baseSvgStyle(size, style)} className={className} role="img" aria-label="Pobožný kostelník s kropáčem" {...props}>
    <g className="lada-anim-float">
      {/* Olive-brown coat & dark waistcoat shoulders */}
      <path
        d="M 6 34 C 7 27, 11 25, 17 25 C 23 25, 27 27, 28 34 Z"
        fill="#7C5A3F"
        stroke="#1A1612"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Golden cross on chest */}
      <line x1="17" y1="26" x2="17" y2="33" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="14.5" y1="28.5" x2="19.5" y2="28.5" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      {/* Grey hair tufts at sides */}
      <circle cx="9.5" cy="19" r="2.6" fill="#9CA3AF" stroke="#1A1612" strokeWidth="1.6" />
      <circle cx="24.5" cy="19" r="2.6" fill="#9CA3AF" stroke="#1A1612" strokeWidth="1.6" />
      {/* Stern face */}
      <circle cx="17" cy="19" r="7.2" fill="#F5C396" stroke="#1A1612" strokeWidth="2.2" />
      {/* Stern eyes & eyebrows */}
      <circle cx="14.5" cy="17.5" r="1.2" fill="#1A1612" />
      <circle cx="19.5" cy="17.5" r="1.2" fill="#1A1612" />
      <line x1="12.5" y1="15.5" x2="16" y2="16" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="18" y1="16" x2="21.5" y2="15.5" stroke="#4B5563" strokeWidth="1.6" strokeLinecap="round" />
      {/* Prominent bulbous red nose & thick grey mustache */}
      <circle cx="17" cy="19.8" r="2.1" fill="#E06D53" stroke="#1A1612" strokeWidth="1.4" />
      <path
        d="M 11.5 22.5 Q 17 20 22.5 22.5 Q 19.5 24.5 17 22.8 Q 14.5 24.5 11.5 22.5 Z"
        fill="#9CA3AF"
        stroke="#1A1612"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Brown felt fedora hat with dark band */}
      <path
        d="M 10 12 L 11.5 5.5 Q 14.5 4.5 17 6 Q 19.5 4.5 22.5 5.5 L 24 12 Z"
        fill="#7C5836"
        stroke="#1A1612"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <rect x="10.5" y="9.5" width="13" height="2.4" fill="#3E2723" stroke="#1A1612" strokeWidth="1.4" />
      <ellipse cx="17" cy="12.2" rx="10.5" ry="2.5" fill="#7C5836" stroke="#1A1612" strokeWidth="2.1" />
      {/* Raised straw sprinkler brush (kropáč) & blue holy water droplets */}
      <line x1="27" y1="26" x2="30" y2="17" stroke="#8C5A35" strokeWidth="2.4" strokeLinecap="round" />
      <polygon points="28,17 27,11 33,12 31.5,18" fill="#EAB308" stroke="#1A1612" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="29" cy="7.5" r="1.4" fill="#38BDF8" stroke="#1A1612" strokeWidth="1" className="lada-anim-glint" />
      <circle cx="33.5" cy="9.5" r="1.3" fill="#38BDF8" stroke="#1A1612" strokeWidth="1" />
    </g>
  </svg>
);

