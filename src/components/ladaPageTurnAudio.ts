/**
 * ============================================================================
 * PROCEDURAL WEB AUDIO FOLEY FOR 1940s 150GSM WOOD-PULP STORYBOOK PAGES
 * ============================================================================
 * Self-contained Web Audio API synthesizer requiring zero external audio files:
 * 1. Corner Hover (60ms): Dry brush of pink noise through an 1800Hz bandpass
 *    filter (fingertip brushing dry cotton/wood-pulp paper).
 * 2. Full Page Turn (680ms):
 *    - Stage A: The Lift & Arch (0–450ms): Filtered pink/white noise with a
 *      sweeping bandpass filter (600Hz -> 1400Hz -> 500Hz) simulating stiff
 *      paper fibers sliding and flexing.
 *    - Stage B: The Settle Thud (580–680ms): Warm, muted low-pass impulse
 *      (90Hz–140Hz exponentially decaying over 70ms) simulating heavy paper
 *      landing flat against a clothbound hardcover spine.
 * ============================================================================
 */

import { sound } from '../audio';

class LadaPageTurnFoleyEngine {
  private ctx: AudioContext | null = null;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  public muted: boolean = false;
  private lastHoverAt: number = 0;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined' || !sound.enabled) return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioCtx();
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Generates a 1-second Paul Kellet pink-noise buffer blended with crisp white
   * fiber grain for authentic 150gsm wood-pulp paper friction.
   */
  private getPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.pinkNoiseBuffer && this.pinkNoiseBuffer.sampleRate === ctx.sampleRate) {
      return this.pinkNoiseBuffer;
    }
    const length = ctx.sampleRate * 1.0;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
      b6 = white * 0.115926;
      output[i] = pink * 0.8 + white * 0.06;
    }
    this.pinkNoiseBuffer = buffer;
    return buffer;
  }

  /**
   * Corner Hover: Soft, dry 60ms brush of pink noise passed through an 1800Hz
   * bandpass filter (fingertip on dry cotton/wood-pulp paper).
   */
  public playCornerHover(): void {
    const nowMs = performance.now();
    if (nowMs - this.lastHoverAt < 90) return;
    this.lastHoverAt = nowMs;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const source = ctx.createBufferSource();
      source.buffer = this.getPinkNoiseBuffer(ctx);

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1800, now);
      bandpass.Q.setValueAtTime(2.4, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.035, now + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.062);

      source.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      source.start(now, Math.random() * 0.3, 0.065);
      source.stop(now + 0.066);
    } catch {
      // Ignore audio errors in restricted autoplay contexts
    }
  }

  /**
   * Full Page Turn (680ms):
   * 1. The Lift & Arch (0–450ms): Filtered white/pink noise with a sweeping
   *    bandpass filter (600Hz -> 1400Hz -> 500Hz).
   * 2. The Settle Thud (580–680ms): A warm, muted low-pass impulse (90Hz–140Hz
   *    exponentially decaying over 70ms) simulating heavy paper landing flat.
   */
  public playFullPageTurn(delaySeconds = 0): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t0 = ctx.currentTime + delaySeconds;

      // Stage 1: The Lift & Arch (0–450ms)
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.getPinkNoiseBuffer(ctx);

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(1.8, t0);
      bandpass.frequency.setValueAtTime(600, t0);
      bandpass.frequency.exponentialRampToValueAtTime(1400, t0 + 0.21);
      bandpass.frequency.exponentialRampToValueAtTime(500, t0 + 0.45);

      const liftGain = ctx.createGain();
      liftGain.gain.setValueAtTime(0.001, t0);
      liftGain.gain.linearRampToValueAtTime(0.045, t0 + 0.08);
      liftGain.gain.setValueAtTime(0.04, t0 + 0.26);
      liftGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);

      noiseSource.connect(bandpass);
      bandpass.connect(liftGain);
      liftGain.connect(ctx.destination);

      noiseSource.start(t0, Math.random() * 0.2, 0.46);
      noiseSource.stop(t0 + 0.46);

      // Stage 2: The Settle Thud (580–680ms)
      const thudStart = t0 + 0.58;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(138, thudStart);
      osc.frequency.exponentialRampToValueAtTime(90, thudStart + 0.072);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(140, thudStart);

      const thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.001, thudStart);
      thudGain.gain.linearRampToValueAtTime(0.22, thudStart + 0.008);
      thudGain.gain.exponentialRampToValueAtTime(0.001, thudStart + 0.078);

      osc.connect(lowpass);
      lowpass.connect(thudGain);
      thudGain.connect(ctx.destination);

      osc.start(thudStart);
      osc.stop(thudStart + 0.085);
    } catch {
      // Ignore audio errors
    }
  }

  /**
   * Staggered Multi-Page Bookmark Cascade (2 leaves with 140ms stagger)
   */
  public playMultiPageCascade(): void {
    this.playFullPageTurn(0);
    this.playFullPageTurn(0.14);
  }
}

export const ladaPageFoley = new LadaPageTurnFoleyEngine();
