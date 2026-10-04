import React from 'react';

interface LadaCartoucheProps {
  children: React.ReactNode;
  variant?: 'red' | 'green' | 'ochre' | 'paper' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  title?: string;
}

/**
 * Hand-drawn folk oval cartouche inspired directly by the publisher mark
 * "( PRÁCE )" at the bottom of Josef Lada's "Bubáci a hastrmani" book cover.
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
    sm: 'px-3 py-0.5 text-xs',
    md: 'px-4 py-1 text-sm',
    lg: 'px-6 py-2 text-base',
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
      {children}
    </Tag>
  );
};
