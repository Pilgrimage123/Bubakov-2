export type SmartCharacterState = 'idle' | 'walk' | 'sprint' | 'action' | 'react' | 'flee';

export type SmartCharacterId = 'babicka_barunka' | 'bezhlavy_rytir' | 'snehulak' | 'tulak' | 'kostelnik' | 'pasacek';

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
    showCompanion?: boolean;      // Barunka for Babicka
    showHeadGlow?: boolean;       // Severed head fire/glow for Knight
    showParticles?: boolean;      // Magic petals, blood drops, or snow flurries
    showShadow?: boolean;         // Folk ground shadow
    showOutline?: boolean;        // High contrast Lada ink outline
  };
}

export interface MousePointerState {
  x: number; // -1 to 1 normalized relative to character center
  y: number; // -1 to 1 normalized relative to character center
  isHovered: boolean;
}
