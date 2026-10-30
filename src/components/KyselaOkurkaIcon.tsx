import React from 'react';
import { LadaCanvasSvg } from './LadaCanvasIcon';

export interface KyselaOkurkaIconProps {
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export const KyselaOkurkaIcon: React.FC<KyselaOkurkaIconProps> = ({
  size = 48,
  className = '',
  style = {},
  ...props
}) => {
  const s = typeof size === 'number' ? `${size}px` : size;
  return (
    <LadaCanvasSvg
      width={s}
      height={s}
      viewBox="0 0 64 64"
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        overflow: 'visible',
        flexShrink: 0,
        ...style,
      }}
      role="img"
      aria-label="Kyselá okurka ze znojemského nálevu"
      {...props}
    >
      <g className="lada-anim-rock">
        {/* Plump pickled gherkin */}
        <g transform="rotate(-25 32 32)">
          <path
            d="M18 11 Q32 6 46 13 L43 50 Q32 58 21 50Z"
            fill="#5E9F3B"
            stroke="#193B18"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path
            d="M23 18 Q32 15 41 18 M23 28 Q32 25 41 28 M23 38 Q32 35 40 38"
            fill="none"
            stroke="#A8D96D"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Pickling warts */}
          <circle cx="27" cy="22" r="1.6" fill="#193B18" />
          <circle cx="36" cy="32" r="1.6" fill="#193B18" />
          <circle cx="29" cy="43" r="1.6" fill="#193B18" />
        </g>
        {/* Dill sprig on gherkin */}
        <path d="M50 11 Q57 14 55 20" fill="none" stroke="#7FBF4D" strokeWidth="3" strokeLinecap="round" />
        {/* Shiny brine glint */}
        <circle cx="53" cy="27" r="2.2" fill="#A7F3D0" className="lada-anim-glint" />
      </g>
    </LadaCanvasSvg>
  );
};
