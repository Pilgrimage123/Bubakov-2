import React, { useCallback } from 'react';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';
import { LadaGrandfatherCanvasPreview } from './LadaGrandfatherCanvasPreview';

interface GrandfatherSceneProps {
  mode?: 'desktop' | 'mobile';
  state: 'idle' | 'reaching' | 'pulling' | 'rerolling' | 'purchasing';
  activeItemName?: string;
  activeItemIcon?: string;
  onMousePet?: () => void;
}

/**
 * GrandfatherScene - The atmospheric animated stage in Dědeček's shop.
 * Renders the authentic Ladovská Canvas 2D illustration of Čertův Dědeček
 * opening his giant woven wicker basket (nůše), with interactive cursor tracking,
 * sound effects, and the cheerful companion mouse Rézinka!
 */
export function GrandfatherScene({
  mode = 'desktop',
  state,
  activeItemName,
  activeItemIcon,
  onMousePet,
}: GrandfatherSceneProps) {
  const isMobile = mode === 'mobile';

  const handleSceneClick = useCallback(() => {
    try {
      sound.mouseSqueak();
    } catch {
      // Safe audio fallback
    }
    if (onMousePet) onMousePet();
  }, [onMousePet]);

  const isInteracting =
    state === 'reaching' ||
    state === 'pulling' ||
    state === 'purchasing' ||
    state === 'rerolling';
  const isMoving = state === 'reaching';

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at bottom, #FDF3DB 0%, #F5E6CA 70%, #E7D7B6 100%)',
        border: '3px solid #451A03',
        borderRadius: 14,
        padding: isMobile ? '4px' : '8px',
        boxShadow: 'inset 0 0 16px rgba(69, 26, 3, 0.18), 3px 3px 0 rgba(0,0,0,0.25)',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={handleSceneClick}
    >
      <LadaGrandfatherCanvasPreview
        width={isMobile ? 320 : 380}
        height={isMobile ? 280 : 330}
        scale={isMobile ? 2.0 : 2.35}
        isInteracting={isInteracting}
        isMoving={isMoving}
      />

      {/* Floating prompt tooltip */}
      <div
        onClick={handleSceneClick}
        style={{
          position: 'absolute',
          bottom: 6,
          right: 12,
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#78350F',
          background: 'rgba(254, 243, 199, 0.92)',
          padding: '2px 8px',
          borderRadius: 6,
          border: '1px solid #B45309',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        }}
        title="Klikni a pohlaď zvědavou myšku Rézinku v nůši!"
      >
        <GameIcon icon="rezinka" size={14} /> Rézinka hlídá perníčky
      </div>

      {activeItemName && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 12,
            background: 'rgba(30, 17, 8, 0.85)',
            border: '2px solid #F59E0B',
            borderRadius: 8,
            padding: '4px 10px',
            color: '#FEF3C7',
            fontSize: '0.82rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {activeItemIcon && <GameIcon icon={activeItemIcon} size={16} />}
          <span>{activeItemName}</span>
        </div>
      )}
    </div>
  );
}
