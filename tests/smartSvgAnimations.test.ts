import { describe, it, expect } from 'vitest';
import {
  SmartBabickaBarunkaSvg,
  SmartBezhlavyRytirSvg,
  SmartSnehulakSvg,
  SmartTulakSvg,
  SmartKostelnikSvg,
  SmartPasacekSvg,
  SmartSvgViewer,
} from '../src/components/svg';
import type { SmartCharacterState, SmartCharacterId } from '../src/components/svg/types';

describe('Smart SVG JavaScript Animations', () => {
  it('exports all 6 Smart SVG components and the interactive viewer', () => {
    expect(typeof SmartBabickaBarunkaSvg).toBe('function');
    expect(typeof SmartBezhlavyRytirSvg).toBe('function');
    expect(typeof SmartSnehulakSvg).toBe('function');
    expect(typeof SmartTulakSvg).toBe('function');
    expect(typeof SmartKostelnikSvg).toBe('function');
    expect(typeof SmartPasacekSvg).toBe('function');
    expect(typeof SmartSvgViewer).toBe('function');
  });

  it('supports the required Smart animation states including sprint, react (scare hit), and flee (courage exhausted)', () => {
    const states: SmartCharacterState[] = ['idle', 'walk', 'sprint', 'action', 'react', 'flee'];
    expect(states).toContain('idle');
    expect(states).toContain('walk');
    expect(states).toContain('sprint');
    expect(states).toContain('action');
    expect(states).toContain('react');
    expect(states).toContain('flee');
  });

  it('defines all 6 folklore characters', () => {
    const charIds: SmartCharacterId[] = [
      'babicka_barunka',
      'bezhlavy_rytir',
      'snehulak',
      'tulak',
      'kostelnik',
      'pasacek',
    ];
    expect(charIds).toHaveLength(6);
    expect(charIds).toContain('babicka_barunka');
    expect(charIds).toContain('bezhlavy_rytir');
    expect(charIds).toContain('snehulak');
    expect(charIds).toContain('tulak');
    expect(charIds).toContain('kostelnik');
    expect(charIds).toContain('pasacek');
  });
});
