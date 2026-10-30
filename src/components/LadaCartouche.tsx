import React from 'react';

interface LadaCartoucheProps {
  children: React.ReactNode;
  variant?: 'red' | 'green' | 'ochre' | 'paper' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  title?: string;
}

const CARTOUCHE_ANIM_STYLES = `
  @keyframes ladaCartoucheFlowerSpin {
    0% { transform: rotate(0deg) scale(0.95); }
    50% { transform: rotate(180deg) scale(1.1); }
    100% { transform: rotate(360deg) scale(0.95); }
  }
  @keyframes ladaCartoucheLeafBreath {
    0%, 100% { transform: rotate(-5deg) scale(0.95); }
    50% { transform: rotate(6deg) scale(1.07); }
  }
  .lada-cartouche-flower-l {
    animation: ladaCartoucheFlowerSpin 10s linear infinite;
  }
  .lada-cartouche-flower-r {
    animation: ladaCartoucheFlowerSpin 10s linear infinite reverse;
  }
  .lada-cartouche-leaf {
    animation: ladaCartoucheLeafBreath 2.8s ease-in-out infinite;
  }
  @media (prefers-reduced-motion: reduce) {
    .lada-cartouche-flower-l, .lada-cartouche-flower-r, .lada-cartouche-leaf {
      animation: none !important;
    }
  }
`;

/**
 * Hand-drawn folk oval cartouche inspired directly by the publisher mark
 * "( PRÁCE )" at the bottom of Josef Lada's "Bubáci a hastrmani" book cover,
 * adorned with animated colorful Czech village flowers on both sides.
 */
export const LadaCartouche: React.FC<LadaCartoucheProps> = ({
  children,
  variant = 'paper',
  className = '',
  size = 'md',
  onClick,
  title,
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs gap-1.5',
    md: 'px-3.5 py-1 text-sm gap-2',
    lg: 'px-5 py-2 text-base gap-2.5',
  }[size];

  const flowerSize = {
    sm: 13,
    md: 15,
    lg: 18,
  }[size];

  const variantStyles = {
    paper: {
      background: '#FAF6ED',
      color: '#1C1610',
      borderColor: '#1C1610',
    },
    red: {
      background: '#C53026',
      color: '#FAF5E8',
      borderColor: '#1C1610',
    },
    green: {
      background: '#3A7843',
      color: '#FAF5E8',
      borderColor: '#1C1610',
    },
    ochre: {
      background: '#D9A036',
      color: '#1C1610',
      borderColor: '#1C1610',
    },
    dark: {
      background: '#3E2515',
      color: '#FEF3C7',
      borderColor: '#1C1610',
    },
  }[variant];

  const leftPetalFill = variant === 'red' ? '#FACC15' : variant === 'ochre' ? '#E6392B' : '#E11D48';
  const rightPetalFill = variant === 'green' ? '#FACC15' : '#38BDF8';
  const leafFill = variant === 'green' ? '#86EFAC' : '#22C55E';

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center font-bold tracking-wider select-none ${sizeClasses} ${className}`}
      style={{
        ...variantStyles,
        fontFamily: "'Eczar', serif",
        borderRadius: '9999px',
        border: '2.5px solid #1C1610',
        outline: '1.5px solid #1C1610',
        outlineOffset: '2px',
        boxShadow: onClick ? '2px 2px 0px #1C1610' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        textTransform: 'uppercase',
      }}
    >
      <style>{CARTOUCHE_ANIM_STYLES}</style>
      {/* Left animated folk flower */}
      <svg
        width={flowerSize}
        height={flowerSize}
        viewBox="-11 -11 22 22"
        className="shrink-0 overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        <g className="lada-cartouche-leaf">
          <path d="M 0,0 C -5,-4 -9,-2 -8,2 C -7,5 -3,4 0,0 Z" fill={leafFill} stroke="#1C1610" strokeWidth="1.2" />
          <path d="M 0,0 C 5,4 9,2 8,-2 C 7,-5 3,-4 0,0 Z" fill={leafFill} stroke="#1C1610" strokeWidth="1.2" />
        </g>
        <g className="lada-cartouche-flower-l">
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              transform={`rotate(${deg})`}
              d="M 0,0 C -3,-3.2 -3.4,-7.5 0,-8.2 C 3.4,-7.5 3,-3.2 0,0 Z"
              fill={leftPetalFill}
              stroke="#1C1610"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="0" cy="0" r="2.7" fill="#FACC15" stroke="#1C1610" strokeWidth="1.1" />
          <circle cx="0" cy="0" r="0.8" fill="#1C1610" />
        </g>
      </svg>

      <span>{children}</span>

      {/* Right animated folk flower */}
      <svg
        width={flowerSize}
        height={flowerSize}
        viewBox="-11 -11 22 22"
        className="shrink-0 overflow-visible pointer-events-none"
        aria-hidden="true"
      >
        <g className="lada-cartouche-leaf">
          <path d="M 0,0 C 5,-4 9,-2 8,2 C 7,5 3,4 0,0 Z" fill={leafFill} stroke="#1C1610" strokeWidth="1.2" />
          <path d="M 0,0 C -5,4 -9,2 -8,-2 C -7,-5 -3,-4 0,0 Z" fill={leafFill} stroke="#1C1610" strokeWidth="1.2" />
        </g>
        <g className="lada-cartouche-flower-r">
          {[0, 72, 144, 216, 288].map((deg) => (
            <path
              key={deg}
              transform={`rotate(${deg})`}
              d="M 0,0 C -3,-3.2 -3.4,-7.5 0,-8.2 C 3.4,-7.5 3,-3.2 0,0 Z"
              fill={rightPetalFill}
              stroke="#1C1610"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          ))}
          <circle cx="0" cy="0" r="2.7" fill="#F59E0B" stroke="#1C1610" strokeWidth="1.1" />
          <circle cx="0" cy="0" r="0.8" fill="#1C1610" />
        </g>
      </svg>
    </Tag>
  );
};

