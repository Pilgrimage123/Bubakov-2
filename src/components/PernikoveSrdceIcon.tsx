import React from 'react';

export interface PernikoveSrdceIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * Pouťové perníkové srdce se zrcátkem
 * Autentická lidová ladovská vektorová SVG ikona s bohatým cukrovým zdobením,
 * kvítky, lístky a středovým stříbrným zrcátkem dle tradičních českých poutí.
 */
export const PernikoveSrdceIcon: React.FC<PernikoveSrdceIconProps> = ({
  size = '1.2em',
  className = '',
  style = {},
  ...props
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
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
      aria-label="Pouťové perníkové srdce se zrcátkem"
      {...props}
    >
      <defs>
        {/* Jemný pozemní stín */}
        <filter id="psDropShadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="1.5" dy="3.5" stdDeviation="2.5" floodColor="#261206" floodOpacity="0.4" />
        </filter>

        {/* Zapečený medový kvašový přechod perníku */}
        <radialGradient id="psBake" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#A85724" />
          <stop offset="35%" stopColor="#8C4215" />
          <stop offset="75%" stopColor="#6E2F0B" />
          <stop offset="100%" stopColor="#4A1C04" />
        </radialGradient>

        {/* Přechod pro lesklé červené cukrové perličky */}
        <radialGradient id="psRedPearl" cx="35%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="45%" stopColor="#E11D48" />
          <stop offset="85%" stopColor="#9F1239" />
          <stop offset="100%" stopColor="#4C0519" />
        </radialGradient>

        {/* Zrcadlový odlesk skla (kovové stříbro se světlým diagonálním lomem) */}
        <linearGradient id="psMirror" x1="12%" y1="15%" x2="88%" y2="85%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="22%" stopColor="#E2E8F0" />
          <stop offset="48%" stopColor="#94A3B8" />
          <stop offset="62%" stopColor="#CBD5E1" />
          <stop offset="82%" stopColor="#F8FAFC" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Přechod zelených cukrových lístků */}
        <linearGradient id="psLeaf" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="50%" stopColor="#16A34A" />
          <stop offset="100%" stopColor="#14532D" />
        </linearGradient>

        {/* Zlaté středy kvítků */}
        <radialGradient id="psGold" cx="35%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>
      </defs>

      <g filter="url(#psDropShadow)" className="lada-anim-float">
        {/* HLAVNÍ PERNÍKOVÝ KORPUS SE ZVRÁSNĚNÝM OKRAJEM */}
        <path
          d="M 100,48
             C 85,22 46,18 26,45
             C 8,69 10,105 34,133
             C 52,154 82,176 100,188
             C 118,176 148,154 166,133
             C 190,105 192,69 174,45
             C 154,18 115,22 100,48 Z"
          fill="url(#psBake)"
          stroke="#2D1609"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* VNĚJŠÍ VLNITÁ KRAJKOVÁ POLEVA (Bílý vroubkovaný okraj) */}
        <path
          d="M 100,52
             C 87,28 50,24 32,49
             C 16,71 18,103 40,129
             C 56,148 84,170 100,181
             C 116,170 144,148 160,129
             C 182,103 184,71 168,49
             C 150,24 113,28 100,52 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Druhá vnitřní bílá kontura krajky */}
        <path
          d="M 100,58
             C 89,35 56,31 40,53
             C 26,73 28,100 47,124
             C 62,142 87,162 100,173
             C 113,162 138,142 153,124
             C 172,100 174,73 160,53
             C 144,31 111,35 100,58 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* ČERVENÉ CUKROVÉ PERLIČKY PO OBVODU KRAJKY */}
        {/* Horní levý a pravý oblouk */}
        <circle cx="100" cy="38" r="3.2" fill="url(#psRedPearl)" />
        <circle cx="86" cy="32" r="3" fill="url(#psRedPearl)" />
        <circle cx="114" cy="32" r="3" fill="url(#psRedPearl)" />
        <circle cx="72" cy="29" r="3" fill="url(#psRedPearl)" />
        <circle cx="128" cy="29" r="3" fill="url(#psRedPearl)" />
        <circle cx="56" cy="31" r="3" fill="url(#psRedPearl)" />
        <circle cx="144" cy="31" r="3" fill="url(#psRedPearl)" />
        <circle cx="42" cy="37" r="3" fill="url(#psRedPearl)" />
        <circle cx="158" cy="37" r="3" fill="url(#psRedPearl)" />
        <circle cx="30" cy="48" r="3" fill="url(#psRedPearl)" />
        <circle cx="170" cy="48" r="3" fill="url(#psRedPearl)" />
        <circle cx="22" cy="62" r="3" fill="url(#psRedPearl)" />
        <circle cx="178" cy="62" r="3" fill="url(#psRedPearl)" />
        <circle cx="18" cy="78" r="3" fill="url(#psRedPearl)" />
        <circle cx="182" cy="78" r="3" fill="url(#psRedPearl)" />
        <circle cx="20" cy="95" r="3" fill="url(#psRedPearl)" />
        <circle cx="180" cy="95" r="3" fill="url(#psRedPearl)" />
        <circle cx="26" cy="112" r="3" fill="url(#psRedPearl)" />
        <circle cx="174" cy="112" r="3" fill="url(#psRedPearl)" />
        <circle cx="36" cy="127" r="3" fill="url(#psRedPearl)" />
        <circle cx="164" cy="127" r="3" fill="url(#psRedPearl)" />
        <circle cx="49" cy="141" r="3" fill="url(#psRedPearl)" />
        <circle cx="151" cy="141" r="3" fill="url(#psRedPearl)" />
        <circle cx="64" cy="154" r="2.8" fill="url(#psRedPearl)" />
        <circle cx="136" cy="154" r="2.8" fill="url(#psRedPearl)" />
        <circle cx="80" cy="167" r="2.6" fill="url(#psRedPearl)" />
        <circle cx="120" cy="167" r="2.6" fill="url(#psRedPearl)" />
        <circle cx="100" cy="180" r="2.8" fill="url(#psRedPearl)" />

        {/* BÍLÉ TŘPYTIVÉ TEČKY NA PERLIČKÁCH */}
        <circle cx="99.2" cy="36.8" r="1" fill="#FFFFFF" />
        <circle cx="85.2" cy="30.8" r="0.9" fill="#FFFFFF" />
        <circle cx="113.2" cy="30.8" r="0.9" fill="#FFFFFF" />
        <circle cx="55.2" cy="29.8" r="0.9" fill="#FFFFFF" />
        <circle cx="143.2" cy="29.8" r="0.9" fill="#FFFFFF" />
        <circle cx="21.2" cy="60.8" r="0.9" fill="#FFFFFF" />
        <circle cx="177.2" cy="60.8" r="0.9" fill="#FFFFFF" />
        <circle cx="19.2" cy="93.8" r="0.9" fill="#FFFFFF" />
        <circle cx="179.2" cy="93.8" r="0.9" fill="#FFFFFF" />
        <circle cx="35.2" cy="125.8" r="0.9" fill="#FFFFFF" />
        <circle cx="163.2" cy="125.8" r="0.9" fill="#FFFFFF" />

        {/* LIDOVÉ CUKROVÉ KVĚTINOVÉ ORNAMENTY */}
        {/* Horní levý květ */}
        <g transform="translate(56, 62)">
          <path d="M 0,-10 C -4,-10 -6,-5 0,0 C 6,-5 4,-10 0,-10 Z" fill="url(#psRedPearl)" />
          <path d="M 10,0 C 10,-4 5,-6 0,0 C 5,6 10,4 10,0 Z" fill="url(#psRedPearl)" />
          <path d="M 0,10 C -4,10 -6,5 0,0 C 6,5 4,10 0,10 Z" fill="url(#psRedPearl)" />
          <path d="M -10,0 C -10,-4 -5,-6 0,0 C -5,6 -10,4 -10,0 Z" fill="url(#psRedPearl)" />
          <circle cx="0" cy="0" r="3.2" fill="url(#psGold)" stroke="#2D1609" strokeWidth="0.8" />
          <circle cx="-1" cy="-1" r="0.9" fill="#FFFFFF" />
        </g>

        {/* Horní pravý květ */}
        <g transform="translate(144, 62)">
          <path d="M 0,-10 C -4,-10 -6,-5 0,0 C 6,-5 4,-10 0,-10 Z" fill="url(#psRedPearl)" />
          <path d="M 10,0 C 10,-4 5,-6 0,0 C 5,6 10,4 10,0 Z" fill="url(#psRedPearl)" />
          <path d="M 0,10 C -4,10 -6,5 0,0 C 6,5 4,10 0,10 Z" fill="url(#psRedPearl)" />
          <path d="M -10,0 C -10,-4 -5,-6 0,0 C -5,6 -10,4 -10,0 Z" fill="url(#psRedPearl)" />
          <circle cx="0" cy="0" r="3.2" fill="url(#psGold)" stroke="#2D1609" strokeWidth="0.8" />
          <circle cx="-1" cy="-1" r="0.9" fill="#FFFFFF" />
        </g>

        {/* Spodní levý květ */}
        <g transform="translate(68, 126)">
          <path d="M 0,-8 C -3,-8 -5,-4 0,0 C 5,-4 3,-8 0,-8 Z" fill="url(#psRedPearl)" />
          <path d="M 8,0 C 8,-3 4,-5 0,0 C 4,5 8,3 8,0 Z" fill="url(#psRedPearl)" />
          <path d="M 0,8 C -3,8 -5,4 0,0 C 5,4 3,8 0,8 Z" fill="url(#psRedPearl)" />
          <path d="M -8,0 C -8,-3 -4,-5 0,0 C -4,5 -8,3 -8,0 Z" fill="url(#psRedPearl)" />
          <circle cx="0" cy="0" r="2.8" fill="url(#psGold)" stroke="#2D1609" strokeWidth="0.7" />
        </g>

        {/* Spodní pravý květ */}
        <g transform="translate(132, 126)">
          <path d="M 0,-8 C -3,-8 -5,-4 0,0 C 5,-4 3,-8 0,-8 Z" fill="url(#psRedPearl)" />
          <path d="M 8,0 C 8,-3 4,-5 0,0 C 4,5 8,3 8,0 Z" fill="url(#psRedPearl)" />
          <path d="M 0,8 C -3,8 -5,4 0,0 C 5,4 3,8 0,8 Z" fill="url(#psRedPearl)" />
          <path d="M -8,0 C -8,-3 -4,-5 0,0 C -4,5 -8,3 -8,0 Z" fill="url(#psRedPearl)" />
          <circle cx="0" cy="0" r="2.8" fill="url(#psGold)" stroke="#2D1609" strokeWidth="0.7" />
        </g>

        {/* ZELENÉ CUKROVÉ LÍSTKY A SPIRÁLY */}
        {/* Levá větvička */}
        <path
          d="M 52,74 C 42,84 38,98 44,110"
          fill="none"
          stroke="url(#psLeaf)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path d="M 40,84 C 34,80 32,74 38,72 C 44,70 43,80 40,84 Z" fill="url(#psLeaf)" />
        <path d="M 37,98 C 30,96 28,90 35,88 C 42,86 40,95 37,98 Z" fill="url(#psLeaf)" />

        {/* Pravá větvička */}
        <path
          d="M 148,74 C 158,84 162,98 156,110"
          fill="none"
          stroke="url(#psLeaf)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path d="M 160,84 C 166,80 168,74 162,72 C 156,70 157,80 160,84 Z" fill="url(#psLeaf)" />
        <path d="M 163,98 C 170,96 172,90 165,88 C 158,86 160,95 163,98 Z" fill="url(#psLeaf)" />

        {/* MALÁ ČERVENÁ SRDÍČKA V ORNAMENTECH */}
        {/* Horní středové srdíčko nad zrcátkem */}
        <path
          d="M 100,56 C 96,50 88,50 88,56 C 88,62 100,68 100,68 C 100,68 112,62 112,56 C 112,50 104,50 100,56 Z"
          fill="url(#psRedPearl)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
        {/* Spodní srdíčko pod zrcátkem */}
        <path
          d="M 100,146 C 96,140 88,140 88,146 C 88,152 100,158 100,158 C 100,158 112,152 112,146 C 112,140 104,140 100,146 Z"
          fill="url(#psRedPearl)"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* CENTRÁLNÍ POUŤOVÉ ZRCÁTKO SE STŘÍBRNÝM ODLESKEM */}
        {/* Vnější bílý ozdobný lem zrcátka */}
        <path
          d="M 100,74
             C 92,62 72,62 68,75
             C 64,88 74,103 86,114
             C 94,121 100,126 100,126
             C 100,126 106,121 114,114
             C 126,103 136,88 132,75
             C 128,62 108,62 100,74 Z"
          fill="#FFFFFF"
          stroke="#2D1609"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Lem perliček okolo zrcadla */}
        <circle cx="100" cy="69" r="2.2" fill="url(#psRedPearl)" />
        <circle cx="91" cy="66" r="2" fill="url(#psRedPearl)" />
        <circle cx="109" cy="66" r="2" fill="url(#psRedPearl)" />
        <circle cx="81" cy="68" r="2" fill="url(#psRedPearl)" />
        <circle cx="119" cy="68" r="2" fill="url(#psRedPearl)" />
        <circle cx="73" cy="74" r="2" fill="url(#psRedPearl)" />
        <circle cx="127" cy="74" r="2" fill="url(#psRedPearl)" />
        <circle cx="68" cy="82" r="2" fill="url(#psRedPearl)" />
        <circle cx="132" cy="82" r="2" fill="url(#psRedPearl)" />
        <circle cx="70" cy="92" r="2" fill="url(#psRedPearl)" />
        <circle cx="130" cy="92" r="2" fill="url(#psRedPearl)" />
        <circle cx="76" cy="102" r="2" fill="url(#psRedPearl)" />
        <circle cx="124" cy="102" r="2" fill="url(#psRedPearl)" />
        <circle cx="85" cy="111" r="2" fill="url(#psRedPearl)" />
        <circle cx="115" cy="111" r="2" fill="url(#psRedPearl)" />
        <circle cx="94" cy="118" r="1.8" fill="url(#psRedPearl)" />
        <circle cx="106" cy="118" r="1.8" fill="url(#psRedPearl)" />

        {/* Kovový stříbrný rámeček zrcadla */}
        <path
          d="M 100,78
             C 93,68 76,68 73,79
             C 70,89 79,101 89,110
             C 96,116 100,120 100,120
             C 100,120 104,116 111,110
             C 121,101 130,89 127,79
             C 124,68 107,68 100,78 Z"
          fill="#64748B"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* ZRCADLOVÁ SKLENĚNÁ PLOCHA S ODLESKEM */}
        <path
          d="M 100,80
             C 94,70 78,70 75,80
             C 72,90 80,100 90,108
             C 96,113 100,117 100,117
             C 100,117 104,113 110,108
             C 120,100 128,90 125,80
             C 122,70 106,70 100,80 Z"
          fill="url(#psMirror)"
        />

        {/* Diagonální záblesk a lesk na zrcátku */}
        <path
          d="M 88,74 L 102,74 L 84,112 L 78,106 Z"
          fill="#FFFFFF"
          opacity="0.6"
        />
        <path
          d="M 106,75 L 114,75 L 94,115 L 90,115 Z"
          fill="#FFFFFF"
          opacity="0.35"
        />

        {/* Zářivá třpytivá hvězdička na rohu zrcadla */}
        <g className="lada-anim-glint">
          <path
            d="M 82,82 L 84,86 L 88,88 L 84,90 L 82,94 L 80,90 L 76,88 L 80,86 Z"
            fill="#FFFFFF"
            opacity="0.9"
          />
          <circle cx="82" cy="88" r="1.2" fill="#FEF08A" />
        </g>
      </g>
    </svg>
  );
};
