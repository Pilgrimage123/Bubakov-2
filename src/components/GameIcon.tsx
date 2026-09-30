import React from 'react';
import { CzechBuchtaIcon } from './CzechBuchtaIcon';
import { KrejcarIcon } from './KrejcarIcon';

interface GameIconProps {
  icon: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function isBuchtaIcon(icon: string): boolean {
  return icon === 'czech_buchta' || icon === '🥟' || icon === 'buns';
}

export function isCoinIcon(icon: string): boolean {
  return icon === '🪙' || icon === 'coin' || icon === 'krejcar' || icon === 'coins';
}

export const GameIcon: React.FC<GameIconProps> = ({
  icon,
  size = '1.2em',
  className = '',
  style = {},
}) => {
  if (isBuchtaIcon(icon)) {
    return <CzechBuchtaIcon size={size} className={className} style={style} />;
  }

  if (isCoinIcon(icon)) {
    return <KrejcarIcon size={size} className={className} style={style} />;
  }

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        fontSize: typeof size === 'number' ? `${size}px` : size,
        ...style,
      }}
    >
      {icon}
    </span>
  );
};

