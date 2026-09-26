// Web Audio API Synthesizer with Czech Folk/Village sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazy audio context creation on user interaction
  }

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  public playTone(freq: number, type: OscillatorType, duration: number, vol = 0.15, endVol = 0.001) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol), this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  }

  public coin() {
    this.playTone(880, 'sine', 0.1, 0.12);
    setTimeout(() => this.playTone(1320, 'sine', 0.15, 0.1), 50);
  }

  public bigCoin() {
    this.playTone(980, 'sine', 0.12, 0.18);
    setTimeout(() => this.playTone(1480, 'sine', 0.16, 0.15), 60);
    setTimeout(() => this.playTone(1960, 'sine', 0.22, 0.12), 120);
  }

  public slash() {
    this.playTone(220, 'triangle', 0.12, 0.2);
  }

  public heavyHit() {
    this.playTone(140, 'triangle', 0.18, 0.3);
    setTimeout(() => this.playTone(90, 'sawtooth', 0.22, 0.25), 40);
  }

  public hit() {
    this.playTone(120, 'sawtooth', 0.1, 0.25);
  }

  public levelUp() {
    [440, 554, 659, 880].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.18), i * 80);
    });
  }

  public chest() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.25, 0.2), i * 100);
    });
  }

  public boss() {
    this.playTone(80, 'sawtooth', 0.7, 0.35);
    setTimeout(() => this.playTone(65, 'sawtooth', 0.9, 0.35), 250);
  }

  public victory() {
    [523, 659, 784, 1046, 1318].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.25, 0.2), i * 90);
    });
  }

  public soul() {
    [659, 880, 1108, 1320].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.18, 0.15), i * 65);
    });
  }

  public horn() {
    [196, 261, 329, 392].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.25), i * 110);
    });
  }

  public freeze() {
    [1046, 1318, 1568].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.15, 0.15), i * 60);
    });
  }

  public roar() {
    this.playTone(70, 'sawtooth', 0.8, 0.4);
    setTimeout(() => this.playTone(55, 'sawtooth', 1.0, 0.4), 200);
  }

  public cheer() {
    [523, 659, 784, 1046].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.2), i * 75);
    });
  }

  public potion() {
    [520, 680, 850].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.14, 0.18), i * 70);
    });
  }

  public bell() {
    this.playTone(440, 'sine', 1.2, 0.3, 0.0001);
    this.playTone(880, 'sine', 0.8, 0.15, 0.0001);
  }

  public rooster() {
    // Rooster crow imitation (Cock-a-doodle-doo!)
    this.playTone(587, 'triangle', 0.2, 0.2);
    setTimeout(() => this.playTone(659, 'triangle', 0.25, 0.25), 180);
    setTimeout(() => this.playTone(523, 'triangle', 0.2, 0.25), 400);
    setTimeout(() => this.playTone(784, 'triangle', 0.6, 0.35), 580);
  }
}

export const sound = new SoundManager();
