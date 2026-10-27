export type SmartCharacterState = 'idle' | 'walk' | 'sprint' | 'action' | 'react' | 'flee';
export type SmartSvgState = SmartCharacterState;

export type SmartCharacterId =
  | 'dedecek_nuse'
  | 'dedecek_arena';

export interface SmartCharacterProps {
  /** Active animation state / action */
  state?: SmartCharacterState;
  /** Normalized animation time in seconds */
  time?: number;
  /** Playback speed multiplier (default 1) */
  speed?: number;
  /** Whether the internal animation loop is actively running */
  isPlaying?: boolean;
  /** Horizontal facing direction: 1 = right, -1 = left */
  direction?: 1 | -1;
  /** Size in pixels (width or max dimension) */
  size?: number | string;
  /** Whether mouse pointer tracking is enabled */
  interactive?: boolean;
  /** Optional custom CSS classes */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
  /** Callback triggered when the character is clicked */
  onClick?: () => void;
  /** Feature toggles */
  features?: {
    showCompanion?: boolean;      // Mouse Rézinka in wicker basket
    showHeadGlow?: boolean;       // Horns / brimstone glow
    showParticles?: boolean;      // Gold sparks / pipe smoke
    showShadow?: boolean;         // Folk ground shadow
    showOutline?: boolean;        // High contrast Lada ink outline
    showMillstone?: boolean;
    showSmoke?: boolean;          // Herbal pipe smoke
    showBossAura?: boolean;
  };
}

export type SmartSvgProps = SmartCharacterProps;

export interface MousePointerState {
  x: number; // -1 to 1 normalized relative to character center
  y: number; // -1 to 1 normalized relative to character center
  isHovered: boolean;
}
