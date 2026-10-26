import React, { useCallback } from 'react';
import { sound } from '../audio';
import { GameIcon } from './GameIcon';
import { SmartDedecekNuseSvg } from './svg/SmartDedecekNuseSvg';
import type { SmartCharacterState } from './svg/types';

interface GrandfatherSceneProps {
  mode?: 'desktop' | 'mobile';
  state: 'idle' | 'reaching' | 'pulling' | 'rerolling' | 'purchasing';
  activeItemName?: string;
  activeItemIcon?: string;
  onMousePet?: () => void;
}

/**
 * GrandfatherScene - The atmospheric animated stage in Dědeček's shop.
 * Renders the authentic Smart SVG vector illustration of Čertův Dědeček
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

  // Map the shop's interaction state to the Smart SVG kinematic state
  const svgState: SmartCharacterState =
    state === 'rerolling'
      ? 'sprint'
      : state === 'purchasing' || state === 'pulling'
      ? 'action'
      : state === 'reaching'
      ? 'walk'
      : 'idle';

  const handleSceneClick = useCallback(() => {
    try {
      sound.mouseSqueak();
    } catch {
      // Safe audio fallback
    }
    if (onMousePet) onMousePet();
  }, [onMousePet]);

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
      }}
    >
      <SmartDedecekNuseSvg
        state={svgState}
        size={isMobile ? 320 : 370}
        interactive={true}
        onClick={handleSceneClick}
        features={{
          showCompanion: true,
          showParticles: true,
          showShadow: true,
          showOutline: true,
        }}
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
    </div>
  );
}
