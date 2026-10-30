import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export interface HalapartnaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const HalapartnaIcon: React.FC<HalapartnaIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  return (
    <LadaCanvasSvg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        ...style,
      }}
      aria-label="Kovaná halapartna s širokou sekerou a čtyřlístkovým otvorem"
      {...props}
    >
      <defs>
        {/* Soft shadow under halberd */}
        <radialGradient id="halberdShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1E1710" stopOpacity="0.38" />
          <stop offset="70%" stopColor="#1E1710" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#1E1710" stopOpacity="0" />
        </radialGradient>

        {/* Ash / Oak wood shaft gradient */}
        <linearGradient id="halberdWood" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5A3416" />
          <stop offset="25%" stopColor="#8C582B" />
          <stop offset="50%" stopColor="#A8723C" />
          <stop offset="75%" stopColor="#B8824A" />
          <stop offset="100%" stopColor="#78441E" />
        </linearGradient>

        {/* Wood highlight streak */}
        <linearGradient id="halberdWoodHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C99B66" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#DFBA8A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C99B66" stopOpacity="0.7" />
        </linearGradient>

        {/* Forged aged iron metal gradient */}
        <linearGradient id="halberdSteel" x1="0%" y1="100%" x2="80%" y2="20%">
          <stop offset="0%" stopColor="#2D3748" />
          <stop offset="20%" stopColor="#4A5568" />
          <stop offset="40%" stopColor="#718096" />
          <stop offset="65%" stopColor="#A0AEC0" />
          <stop offset="85%" stopColor="#718096" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Rust patina subtle warm wash */}
        <radialGradient id="halberdRust" cx="65%" cy="35%" r="45%">
          <stop offset="0%" stopColor="#9C4221" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#78350F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#451A03" stopOpacity="0" />
        </radialGradient>

        {/* Sharp cutting blade edge highlight */}
        <linearGradient id="halberdEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.4" />
        </linearGradient>

        {/* Steel band gradient */}
        <linearGradient id="halberdRing" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Ground shadow beneath base */}
      <ellipse cx="28" cy="108" rx="20" ry="4" fill="url(#halberdShadow)" />

      {/* Main Halberd Group: diagonal orientation from (26, 106) to (95, 12) */}
      <g id="halberd-art" className="lada-anim-rock">
        {/* ========================================================
            1. WOODEN SHAFT (Topůrko)
            ======================================================== */}
        {/* Wooden shaft body with Lada black ink outline */}
        <path
          d="M 27.5 106.5 L 72.5 39.5 L 77.2 42.6 L 32.2 109.6 Z"
          fill="url(#halberdWood)"
          stroke="#1F1810"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Woodgrain highlight ridge */}
        <path
          d="M 29.5 106.8 L 73.5 40.5"
          fill="none"
          stroke="url(#halberdWoodHighlight)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Wood knots and grain striations */}
        <path
          d="M 40 89 L 41 87.5
             M 48 76 L 50 73
             M 58 62 L 60 59
             M 64 53 L 65 51.5"
          fill="none"
          stroke="#38210F"
          strokeWidth="1.0"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* ========================================================
            2. IRON BANDS & RIVETS (Okované kroužky a nýty)
            ======================================================== */}
        {/* Butt-cap iron shoe at bottom (Patka / botka ratiště) */}
        <path
          d="M 24.5 103.5 L 29.5 96 L 35.5 100 L 30.5 107.5 Z"
          fill="url(#halberdRing)"
          stroke="#18130E"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Stud rivets on bottom shoe */}
        <circle cx="28.5" cy="101" r="1.1" fill="#CBD5E1" stroke="#0F172A" strokeWidth="0.6" />
        <circle cx="31.5" cy="103" r="1.1" fill="#CBD5E1" stroke="#0F172A" strokeWidth="0.6" />

        {/* Intermediate reinforcing iron collar (Středová objímka) */}
        <path
          d="M 52.5 69.5 L 56.5 63.5 L 61.2 66.6 L 57.2 72.6 Z"
          fill="url(#halberdRing)"
          stroke="#18130E"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="56" cy="67.5" r="1.1" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
        <circle cx="58.5" cy="69.2" r="1.1" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />

        {/* Top socket collar joining shaft to head (Horní objímka pod čepelí) */}
        <path
          d="M 70.5 42.5 L 74.5 36.5 L 79.2 39.6 L 75.2 45.6 Z"
          fill="url(#halberdRing)"
          stroke="#18130E"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="74" cy="40.5" r="1.1" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
        <circle cx="76.5" cy="42.2" r="1.1" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />

        {/* ========================================================
            3. FORGED HALBERD HEAD (Kovaná hlava halapartny)
            Spear point + Crescent Axe + Rear Beak + 4-Leaf Clover Cutout
            ======================================================== */}
        <g id="halberd-blade">
          {/* Main blade silhouette:
              Starting from socket (74, 38)
              -> Spear center spine
              -> Long tapering spear tip (94, 9)
              -> Front blade base notch (82, 28)
              -> Crescent axe upper horn (106, 25)
              -> Deeply curved sweeping crescent cutting edge (103, 38) to lower horn (89, 56)
              -> Axe inner lower curve back to socket (78, 43)
              -> Socket back side
              -> Rear beak lower curve (60, 42)
              -> Rear pointed pick tip (58, 41)
              -> Rear beak top curve and socket junction
          */}
          <path
            d="M 73.5 38
               L 77.5 32
               L 80 27
               L 95 8.5
               L 87 23
               C 85.5 25, 84 27.5, 84 29
               C 85 28.5, 89 27, 95 25.5
               C 101 24, 105 24.5, 106.5 25
               C 105 29, 99 37, 98 42
               C 96.8 47.5, 95 52, 89.5 56
               C 85 52, 81 48, 80 43
               L 76 40
               L 72.5 42
               C 70 41, 65 42.5, 60.5 43
               L 57.5 41.5
               C 61 38, 64 35, 69.5 35.5
               C 71 33, 72.5 31, 74 29
               L 78 28
               L 77 34
               Z"
            fill="url(#halberdSteel)"
            stroke="#16120D"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Rust / aged patina overlay wash */}
          <path
            d="M 78 30
               C 83 28, 92 26.5, 98 26
               C 96 32, 94 40, 93 45
               C 88 51, 84 48, 80 43
               L 76 40
               Z"
            fill="url(#halberdRust)"
          />

          {/* Central forged reinforcing rib on the spearhead */}
          <path
            d="M 76.5 35 L 82 25 L 94 9.5"
            fill="none"
            stroke="#1A202C"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M 77.5 34.5 L 82.5 25 L 93.5 11"
            fill="none"
            stroke="url(#halberdEdge)"
            strokeWidth="1.0"
            strokeLinecap="round"
          />

          {/* Crescent Axe Cutting Edge Glint (Leštěné ostří sekery) */}
          <path
            d="M 106 25.5
               C 104.5 29.5, 98.8 37.5, 97.8 42.5
               C 96.6 47.8, 94.8 52.2, 89.5 55.8"
            fill="none"
            stroke="url(#halberdEdge)"
            strokeWidth="2.0"
            strokeLinecap="round"
          />

          {/* Rear pick hook sharp spine */}
          <path
            d="M 58 41.6 L 69 36"
            fill="none"
            stroke="url(#halberdEdge)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Decorative Four-leaf Clover / Trefoil Cutout (Čtyřlístkový otvor v sekeře) */}
          {/* Centered at (90.5, 37.5) with authentic punch-out holes and Lada ink border */}
          <g id="clover-cutout" transform="translate(90.5, 38) rotate(18)">
            {/* Dark background / see-through hole */}
            {/* Top leaf */}
            <circle cx="0" cy="-3.6" r="2.2" fill="#241B14" stroke="#100C08" strokeWidth="1.1" />
            {/* Bottom leaf */}
            <circle cx="0" cy="3.6" r="2.2" fill="#241B14" stroke="#100C08" strokeWidth="1.1" />
            {/* Left leaf */}
            <circle cx="-3.6" cy="0" r="2.2" fill="#241B14" stroke="#100C08" strokeWidth="1.1" />
            {/* Right leaf */}
            <circle cx="3.6" cy="0" r="2.2" fill="#241B14" stroke="#100C08" strokeWidth="1.1" />
            {/* Central intersection clearing */}
            <circle cx="0" cy="0" r="2.5" fill="#241B14" />
            {/* Beveled metal edge inside the cutout */}
            <path
              d="M -2.5 -2.5 L -1 -1 M 2.5 -2.5 L 1 -1 M -2.5 2.5 L -1 1 M 2.5 2.5 L 1 1"
              stroke="#94A3B8"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
          </g>

          {/* Forged hammer marks and age pitting */}
          <circle cx="83" cy="36" r="0.7" fill="#1E293B" />
          <circle cx="86" cy="32" r="0.6" fill="#1E293B" />
          <circle cx="95" cy="32" r="0.7" fill="#1E293B" />
          <circle cx="92" cy="46" r="0.6" fill="#1E293B" />
          <circle cx="64" cy="39" r="0.6" fill="#1E293B" />
          {/* Spear tip glint */}
          <circle cx="93.5" cy="14" r="1.6" fill="#FFFFFF" className="lada-anim-glint" />
        </g>
      </g>
    </LadaCanvasSvg>
  );
};
