import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SLOT_REEL_BASE_SYMBOLS, SLOT_REEL_STRIPS } from '../src/App';

describe('Treasure Chest Slot Machine Animation', () => {
  it('defines 3 distinct reel strips with Josef Lada folk symbols', () => {
    expect(SLOT_REEL_BASE_SYMBOLS).toHaveLength(3);
    expect(SLOT_REEL_STRIPS).toHaveLength(3);

    SLOT_REEL_BASE_SYMBOLS.forEach((strip) => {
      expect(strip.length).toBeGreaterThanOrEqual(8);
      // Ensure no empty or undefined symbol strings
      strip.forEach((sym) => {
        expect(typeof sym).toBe('string');
        expect(sym.length).toBeGreaterThan(0);
      });
    });

    // Reels must have distinct permutations / starting symbols so they do not spin identically
    const firstSymbols = SLOT_REEL_BASE_SYMBOLS.map((s) => s[0]);
    const uniqueFirstSymbols = new Set(firstSymbols);
    expect(uniqueFirstSymbols.size).toBe(3);
  });

  it('guarantees seamless infinite scrolling where the second half is an exact duplicate of the first half', () => {
    SLOT_REEL_STRIPS.forEach((strip, i) => {
      const base = SLOT_REEL_BASE_SYMBOLS[i];
      expect(strip.length).toBe(base.length * 2);
      expect(strip.length % 2).toBe(0);

      const firstHalf = strip.slice(0, base.length);
      const secondHalf = strip.slice(base.length);

      // When CSS translateY reaches -50%, item at offset 0 becomes secondHalf[0], which matches firstHalf[0]
      expect(firstHalf).toEqual(base);
      expect(secondHalf).toEqual(base);
      expect(firstHalf).toEqual(secondHalf);
    });
  });

  it('verifies App.tsx renders slot reels with staggered class names and click-to-skip support', () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, '../src/App.tsx'), 'utf-8');

    // Reel strip rendering uses SLOT_REEL_STRIPS
    expect(appSource).toContain('SLOT_REEL_STRIPS[i]');
    expect(appSource).toContain('slot-reel-strip-${i}');

    // Reel housing allows clicking to skip spinning
    expect(appSource).toContain('if (slotSpinningRef.current) {');
    expect(appSource).toContain('skipSlotSpin();');

    // Pre-cleanup of timers before state initialization
    expect(appSource).toMatch(
      /slotTimersRef\.current\.forEach\(clearTimeout\);[\s\S]*?slotSoundIntervalRef\.current = null;[\s\S]*?setChestRewards\(selected\);/
    );
  });

  it('verifies index.css defines staggered reel animations and absolute positioning in slot-reel-window', () => {
    const cssSource = fs.readFileSync(path.resolve(__dirname, '../src/index.css'), 'utf-8');

    expect(cssSource).toContain('.slot-spinning-strip {');
    expect(cssSource).toContain('position: absolute;');
    expect(cssSource).toContain('.slot-reel-strip-0 {');
    expect(cssSource).toContain('.slot-reel-strip-1 {');
    expect(cssSource).toContain('.slot-reel-strip-2 {');
    expect(cssSource).toContain('@keyframes slotRollFast {');
    expect(cssSource).toContain('transform: translateY(-50%);');

    // Accessibility check: reduced motion disables the spinning animation
    expect(cssSource).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.slot-spinning-strip/);
  });
});
