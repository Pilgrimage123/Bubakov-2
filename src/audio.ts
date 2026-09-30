// Web Audio API Synthesizer with Czech Folk/Village sound effects

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private menuMusic: HTMLAudioElement | null = null;
  private musicFadeInterval: any = null;
  public musicEnabled: boolean = true;
  public musicVolume: number = 0.4;
  private musicUnlockedListenerAdded: boolean = false;

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

  public initMenuMusic() {
    if (typeof window === 'undefined') return;
    if (!this.menuMusic) {
      try {
        const audio = new Audio('/audio/bubakov_menu.mp3');
        audio.loop = true;
        audio.volume = this.musicVolume;
        this.menuMusic = audio;
      } catch (e) {
        console.warn('Nelze načíst hudbu menu:', e);
      }
    }
  }

  public playMenuMusic(fadeIn = true) {
    if (!this.enabled || !this.musicEnabled) return;
    this.init();
    this.initMenuMusic();
    if (!this.menuMusic) return;

    if (this.musicFadeInterval) {
      clearInterval(this.musicFadeInterval);
      this.musicFadeInterval = null;
    }

    if (fadeIn) {
      this.menuMusic.volume = 0.05;
      const targetVol = this.musicVolume;
      const step = Math.max(0.01, (targetVol - 0.05) / 12);
      this.musicFadeInterval = setInterval(() => {
        if (!this.menuMusic) return;
        if (this.menuMusic.volume + step >= targetVol) {
          this.menuMusic.volume = targetVol;
          clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        } else {
          this.menuMusic.volume = Math.min(targetVol, this.menuMusic.volume + step);
        }
      }, 50);
    } else {
      this.menuMusic.volume = this.musicVolume;
    }

    const promise = this.menuMusic.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        // Autoplay policy prevented playback, auto-unlock on first user interaction
        if (!this.musicUnlockedListenerAdded && typeof window !== 'undefined') {
          this.musicUnlockedListenerAdded = true;
          const unlock = () => {
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
            if (this.enabled && this.musicEnabled && this.menuMusic) {
              this.menuMusic.play().catch(() => {});
            }
          };
          window.addEventListener('pointerdown', unlock, { once: true });
          window.addEventListener('keydown', unlock, { once: true });
        }
      });
    }
  }

  public stopMenuMusic(fadeOut = true) {
    if (!this.menuMusic) return;
    if (this.musicFadeInterval) {
      clearInterval(this.musicFadeInterval);
      this.musicFadeInterval = null;
    }

    if (fadeOut && !this.menuMusic.paused && this.menuMusic.volume > 0.05) {
      const startVol = this.menuMusic.volume;
      const step = startVol / 10;
      this.musicFadeInterval = setInterval(() => {
        if (!this.menuMusic) return;
        if (this.menuMusic.volume - step <= 0.02) {
          this.menuMusic.volume = 0;
          this.menuMusic.pause();
          clearInterval(this.musicFadeInterval);
          this.musicFadeInterval = null;
        } else {
          this.menuMusic.volume = Math.max(0, this.menuMusic.volume - step);
        }
      }, 40);
    } else {
      this.menuMusic.pause();
    }
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMenuMusic(true);
    } else {
      this.playMenuMusic(true);
    }
    return this.musicEnabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMenuMusic(false);
    } else if (this.musicEnabled) {
      this.playMenuMusic(true);
    }
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

  public splash() {
    this.playTone(280, 'triangle', 0.22, 0.28, 0.01);
    setTimeout(() => this.playTone(180, 'sine', 0.35, 0.32, 0.001), 60);
    setTimeout(() => this.playTone(130, 'sawtooth', 0.28, 0.2, 0.001), 120);
  }

  public snack() {
    this.playTone(330, 'triangle', 0.08, 0.15, 0.01);
    setTimeout(() => this.playTone(440, 'triangle', 0.09, 0.16, 0.01), 60);
    setTimeout(() => this.playTone(392, 'sine', 0.12, 0.14, 0.01), 130);
  }

  public bell() {
    this.playTone(440, 'sine', 1.2, 0.3, 0.0001);
    this.playTone(880, 'sine', 0.8, 0.15, 0.0001);
  }

  public candlePulse() {
    // Posvátný hromniční tón svíce: hřejivý vysoký alikvot a jemné plápolavé doznívání
    this.playTone(659, 'sine', 0.55, 0.16, 0.001);
    setTimeout(() => this.playTone(988, 'sine', 0.75, 0.12, 0.0001), 60);
  }

  public churchBell() {
    // Hluboký farní zvon: nízký základní tón + nesouměrné alikvoty s dlouhým doznívání
    const base = 98;
    [1, 2, 2.4, 3, 4.2, 5.4].forEach((mul, i) => {
      this.playTone(base * mul, 'sine', Math.max(0.8, 3.4 - i * 0.4), 0.3 / (1 + i * 0.55), 0.0001);
    });
    // Ozvěna: druhý, tišší úder zvonu
    setTimeout(() => this.playTone(base, 'sine', 3.0, 0.2, 0.0001), 950);
    setTimeout(() => this.playTone(base * 2.4, 'sine', 2.0, 0.08, 0.0001), 950);
  }

  public timeStop() {
    // Čas se zastavuje: klesající tón a tlumený dozvuk
    [660, 520, 400, 300].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.45, 0.16, 0.0001), i * 110);
    });
  }

  public kindChime() {
    // Vlídné zvonění: klidné, hřejivé akordy
    [523, 659, 784, 988, 1175].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 1.3, 0.13, 0.0001), i * 200);
    });
  }

  public rooster() {
    // Rooster crow imitation (Cock-a-doodle-doo!)
    this.playTone(587, 'triangle', 0.2, 0.2);
    setTimeout(() => this.playTone(659, 'triangle', 0.25, 0.25), 180);
    setTimeout(() => this.playTone(523, 'triangle', 0.2, 0.25), 400);
    setTimeout(() => this.playTone(784, 'triangle', 0.6, 0.35), 580);
  }

  public thunder() {
    // Deep thunder rumble with low frequency sawtooth sweep
    this.playTone(110, 'sawtooth', 0.3, 0.35, 0.1);
    setTimeout(() => this.playTone(65, 'sawtooth', 0.8, 0.4, 0.001), 120);
    setTimeout(() => this.playTone(45, 'sawtooth', 1.2, 0.3, 0.001), 350);
  }

  public pause() {
    this.playTone(520, 'sine', 0.12, 0.15);
    setTimeout(() => this.playTone(390, 'sine', 0.15, 0.12), 60);
  }

  public resume() {
    this.playTone(390, 'sine', 0.12, 0.12);
    setTimeout(() => this.playTone(520, 'sine', 0.15, 0.15), 60);
  }
}

export const sound = new SoundManager();
