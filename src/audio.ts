import React from 'react';
import { isGameEffectEnabled } from './game/effectSettings';

var SoundManager = class {
	ctx: any = null;
	enabled: boolean = true;
	menuMusic: any = null;
	musicFadeInterval: any = null;
	musicEnabled: boolean = true;
	musicVolume: number = 0.4;
	musicUnlockedListenerAdded: boolean = false;
	lastCombatHitAt: number = -Infinity;

	constructor() {
		this.ctx = null;
		this.enabled = true;
		this.menuMusic = null;
		this.musicFadeInterval = null;
		this.musicEnabled = true;
		this.musicVolume = .4;
		this.musicUnlockedListenerAdded = false;
		this.lastCombatHitAt = -Infinity;
	}
	init() {
		if (!this.ctx && typeof window !== "undefined") {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (AudioCtx) this.ctx = new AudioCtx();
		}
		if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
	}
	initMenuMusic() {
		if (typeof window === "undefined") return;
		if (!this.menuMusic) try {
			const audio = new Audio("/audio/bubakov_menu.mp3");
			audio.loop = true;
			audio.volume = this.musicVolume;
			this.menuMusic = audio;
		} catch (e) {
			console.warn("Nelze načíst hudbu menu:", e);
		}
	}
	playMenuMusic(fadeIn = true) {
		if (!this.musicEnabled || !isGameEffectEnabled('musicEnabled')) return;
		this.init();
		this.initMenuMusic();
		if (!this.menuMusic) return;
		if (this.musicFadeInterval) {
			clearInterval(this.musicFadeInterval);
			this.musicFadeInterval = null;
		}
		if (fadeIn) {
			this.menuMusic.volume = .05;
			const targetVol = this.musicVolume;
			const step = Math.max(.01, (targetVol - .05) / 12);
			this.musicFadeInterval = setInterval(() => {
				if (!this.menuMusic) return;
				if (this.menuMusic.volume + step >= targetVol) {
					this.menuMusic.volume = targetVol;
					clearInterval(this.musicFadeInterval);
					this.musicFadeInterval = null;
				} else this.menuMusic.volume = Math.min(targetVol, this.menuMusic.volume + step);
			}, 50);
		} else this.menuMusic.volume = this.musicVolume;
		const promise = this.menuMusic.play();
		if (promise && typeof promise.catch === "function") promise.catch(() => {
			if (!this.musicUnlockedListenerAdded && typeof window !== "undefined") {
				this.musicUnlockedListenerAdded = true;
				const unlock = () => {
					window.removeEventListener("pointerdown", unlock);
					window.removeEventListener("keydown", unlock);
					if (this.enabled && this.musicEnabled && this.menuMusic) this.menuMusic.play().catch(() => {});
				};
				window.addEventListener("pointerdown", unlock, { once: true });
				window.addEventListener("keydown", unlock, { once: true });
			}
		});
	}
	stopMenuMusic(fadeOut = true) {
		if (!this.menuMusic) return;
		if (this.musicFadeInterval) {
			clearInterval(this.musicFadeInterval);
			this.musicFadeInterval = null;
		}
		if (fadeOut && !this.menuMusic.paused && this.menuMusic.volume > .05) {
			const step = this.menuMusic.volume / 10;
			this.musicFadeInterval = setInterval(() => {
				if (!this.menuMusic) return;
				if (this.menuMusic.volume - step <= .02) {
					this.menuMusic.volume = 0;
					this.menuMusic.pause();
					clearInterval(this.musicFadeInterval);
					this.musicFadeInterval = null;
				} else this.menuMusic.volume = Math.max(0, this.menuMusic.volume - step);
			}, 40);
		} else this.menuMusic.pause();
	}
	toggleMusic() {
		this.musicEnabled = !this.musicEnabled;
		if (!this.musicEnabled) this.stopMenuMusic(true);
		else this.playMenuMusic(true);
		return this.musicEnabled;
	}
	toggle() {
		this.enabled = !this.enabled;
		if (!this.enabled) this.stopMenuMusic(false);
		else if (this.musicEnabled) this.playMenuMusic(true);
		return this.enabled;
	}
	playTone(freq, type, duration, vol = .15, endVol = .001) {
		if (!this.enabled || !isGameEffectEnabled('soundEffectsEnabled')) return;
		try {
			this.init();
			if (!this.ctx) return;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = type;
			osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
			gain.gain.setValueAtTime(vol, this.ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(Math.max(1e-4, endVol), this.ctx.currentTime + duration);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start();
			osc.stop(this.ctx.currentTime + duration);
		} catch {}
	}
	coin() {
		this.playTone(880, "sine", .1, .12);
		setTimeout(() => this.playTone(1320, "sine", .15, .1), 50);
	}
	bigCoin() {
		this.playTone(980, "sine", .12, .18);
		setTimeout(() => this.playTone(1480, "sine", .16, .15), 60);
		setTimeout(() => this.playTone(1960, "sine", .22, .12), 120);
	}
	gingerbreadPickup() {
		this.playTone(420, "triangle", .07, .11);
		setTimeout(() => this.playTone(620, "triangle", .11, .09), 35);
	}
	grandfatherCall() {
		this.playTone(190, "triangle", .18, .13);
		setTimeout(() => this.playTone(150, "triangle", .24, .1), 80);
	}
	horseshoe() {
		this.playTone(1760, "sine", .35, .22, 1e-4);
		setTimeout(() => this.playTone(2637, "sine", .4, .18, 1e-4), 70);
		setTimeout(() => this.playTone(3520, "sine", .5, .15, 1e-4), 140);
	}


	cuckooClock() {
		this.playTone(400, "sawtooth", .06, .2, .01);
		setTimeout(() => this.playTone(1046, "triangle", .2, .25), 80);
		setTimeout(() => this.playTone(784, "triangle", .35, .3), 280);
	}


	milestoneChosen(audioSfxTag?: string) {
		this.levelUp();
		if (!audioSfxTag) return;
		try {
			if (audioSfxTag.includes('cane') && typeof (this as any).caneWhip === 'function') {
				(this as any).caneWhip(false);
			} else if (audioSfxTag.includes('granny') && typeof (this as any).valecWhack === 'function') {
				(this as any).valecWhack();
			} else if (audioSfxTag.includes('candle') && typeof (this as any).candlePulse === 'function') {
				(this as any).candlePulse();
			} else if (audioSfxTag.includes('snow') || audioSfxTag.includes('frost')) {
				this.freeze();
			} else if (audioSfxTag.includes('splash') || audioSfxTag.includes('aspersorium')) {
				this.splash();
			} else if (audioSfxTag.includes('hit') || audioSfxTag.includes('smash') || audioSfxTag.includes('pitchfork')) {
				this.heavyHit();
			} else {
				this.slash();
			}
		} catch {}
	}


	grandfatherOpen() {
		this.playTone(240, "triangle", .15, .08);
		setTimeout(() => this.playTone(320, "sine", .22, .12), 60);
		setTimeout(() => this.playTone(480, "triangle", .35, .15), 130);
	}
	grandfatherReroll() {
		this.playTone(180, "sawtooth", .1, .06);
		setTimeout(() => this.playTone(220, "triangle", .12, .08), 50);
		setTimeout(() => this.playTone(330, "sine", .18, .12), 110);
		setTimeout(() => this.playTone(440, "triangle", .22, .1), 180);
	}
	mouseSqueak() {
		this.playTone(1850, "sine", .08, .14);
		setTimeout(() => this.playTone(2400, "sine", .09, .12), 40);
	}
	grandfatherPurchase() {
		this.playTone(260, "square", .06, .1);
		setTimeout(() => this.playTone(180, "triangle", .14, .09), 45);
		setTimeout(() => this.playTone(380, "sine", .2, .12), 90);
	}
	slash() {
		this.playTone(220, "triangle", .12, .2);
	}
	caneWhip(soaked = false) {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;

			// 1. Air cutting whoosh with pitch sweep from high to low
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(820, now);
			osc.frequency.exponentialRampToValueAtTime(170, now + 0.16);
			gain.gain.setValueAtTime(0.24, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start();
			osc.stop(now + 0.20);

			// 2. Whip-crack snap (high frequency burst + resonant pop)
			setTimeout(() => {
				if (!this.ctx) return;
				const snapTime = this.ctx.currentTime;
				const snapOsc = this.ctx.createOscillator();
				const snapGain = this.ctx.createGain();
				snapOsc.type = "triangle";
				snapOsc.frequency.setValueAtTime(1100, snapTime);
				snapOsc.frequency.exponentialRampToValueAtTime(140, snapTime + 0.08);
				snapGain.gain.setValueAtTime(0.28, snapTime);
				snapGain.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.09);
				snapOsc.connect(snapGain);
				snapGain.connect(this.ctx.destination);
				snapOsc.start();
				snapOsc.stop(snapTime + 0.10);
			}, 40);

			// 3. If soaked with pond water (Mokrý prut): wet water splash & spray
			if (soaked) {
				setTimeout(() => {
					this.playTone(320, "triangle", 0.14, 0.22, 0.01);
					setTimeout(() => this.playTone(210, "sine", 0.18, 0.24, 0.001), 40);
				}, 30);
			}
		} catch {}
	}
	heavyHit() {
		this.playTone(140, "triangle", .18, .3);
		setTimeout(() => this.playTone(90, "sawtooth", .22, .25), 40);
	}
	zernovSlam() {
		// Deep resonant bass rumble and heavy stone ground impact
		this.playTone(65, "triangle", 0.45, 0.42, 0.001);
		setTimeout(() => this.playTone(45, "sawtooth", 0.38, 0.35, 0.001), 30);
		setTimeout(() => this.playTone(85, "sine", 0.28, 0.22, 0.001), 70);
	}
	zernovHammer() {
		// Sharp metallic oškrt clang on hard granite
		this.playTone(1180, "triangle", 0.06, 0.24, 0.005);
		setTimeout(() => this.playTone(620, "sine", 0.12, 0.28, 0.001), 15);
		setTimeout(() => this.playTone(140, "sawtooth", 0.08, 0.15, 0.01), 25);
	}
	zernovDrift() {
		// Gravel skid, tearing mud and quartz friction
		this.playTone(180, "sawtooth", 0.12, 0.22, 0.01);
		setTimeout(() => this.playTone(135, "sawtooth", 0.14, 0.24, 0.01), 35);
		setTimeout(() => this.playTone(95, "triangle", 0.16, 0.18, 0.005), 70);
	}
	zernovBounce() {
		// Pinball ricochet: loud ringing metallic clatter bouncing under angle
		this.playTone(120, "sawtooth", 0.24, 0.40, 0.001);
		setTimeout(() => this.playTone(340, "triangle", 0.18, 0.32, 0.001), 25);
		setTimeout(() => this.playTone(560, "sine", 0.22, 0.26, 0.001), 60);
	}
	zernovCrack() {
		// Fracturing stone crunch on elite boogeymen and frost jezinkas
		this.playTone(260, "sawtooth", 0.12, 0.36, 0.001);
		setTimeout(() => this.playTone(150, "triangle", 0.16, 0.30, 0.001), 30);
		setTimeout(() => this.playTone(85, "sawtooth", 0.20, 0.25, 0.001), 60);
	}
	valecWhack() {
		this.playTone(220, "triangle", 0.08, 0.35);
		setTimeout(() => this.playTone(110, "sawtooth", 0.16, 0.32), 20);
		setTimeout(() => this.playTone(70, "sine", 0.22, 0.28), 45);
	}
	hit() {
		this.playTone(120, "sawtooth", .1, .25);
	}
	combatHit(minInterval = .08) {
		const now = typeof performance !== "undefined" ? performance.now() : Date.now();
		if (now - this.lastCombatHitAt < minInterval * 1e3) return;
		this.lastCombatHitAt = now;
		this.hit();
	}
	levelUp() {
		[
			440,
			554,
			659,
			880
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "triangle", .2, .18), i * 80);
		});
	}
	chest() {
		[
			523,
			659,
			784,
			1046
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", .25, .2), i * 100);
		});
	}
	slotTick() {
		this.playTone(560 + Math.random() * 90, "triangle", .035, .07, .005);
	}
	slotStop() {
		this.playTone(520, "sine", .12, .18);
		setTimeout(() => this.playTone(780, "sine", .16, .16), 40);
	}
	slotJackpot() {
		[
			523,
			659,
			784,
			1046,
			1318
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "triangle", .22, .22), i * 75);
		});
	}
	boss() {
		this.playTone(80, "sawtooth", .7, .35);
		setTimeout(() => this.playTone(65, "sawtooth", .9, .35), 250);
	}
	victory() {
		[
			523,
			659,
			784,
			1046,
			1318
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "triangle", .25, .2), i * 90);
		});
	}
	soul() {
		[
			659,
			880,
			1108,
			1320
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", .18, .15), i * 65);
		});
	}
	horn() {
		[
			196,
			261,
			329,
			392
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sawtooth", .4, .25), i * 110);
		});
	}
	freeze() {
		[
			1046,
			1318,
			1568
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", .15, .15), i * 60);
		});
	}
	roar() {
		this.playTone(70, "sawtooth", .8, .4);
		setTimeout(() => this.playTone(55, "sawtooth", 1, .4), 200);
	}
	cheer() {
		[
			523,
			659,
			784,
			1046
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "triangle", .2, .2), i * 75);
		});
	}
	potion() {
		[
			520,
			680,
			850
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", .14, .18), i * 70);
		});
	}
	splash() {
		this.playTone(280, "triangle", .22, .28, .01);
		setTimeout(() => this.playTone(180, "sine", .35, .32, .001), 60);
		setTimeout(() => this.playTone(130, "sawtooth", .28, .2, .001), 120);
	}
	snack() {
		this.playTone(330, "triangle", .08, .15, .01);
		setTimeout(() => this.playTone(440, "triangle", .09, .16, .01), 60);
		setTimeout(() => this.playTone(392, "sine", .12, .14, .01), 130);
	}
	sukoviceWhirl() {
		this.playTone(190, "sawtooth", .32, .35, .01);
		setTimeout(() => this.playTone(130, "triangle", .28, .38, .01), 60);
		setTimeout(() => this.playTone(95, "sawtooth", .32, .42, .01), 140);
		setTimeout(() => this.playTone(65, "triangle", .45, .48, .001), 220);
	}
	bell() {
		this.playTone(440, "sine", 1.2, .3, 1e-4);
		this.playTone(880, "sine", .8, .15, 1e-4);
	}
	candlePulse() {
		this.playTone(659, "sine", .55, .16, .001);
		setTimeout(() => this.playTone(988, "sine", .75, .12, 1e-4), 60);
	}
	churchBell() {
		const base = 98;
		[
			1,
			2,
			2.4,
			3,
			4.2,
			5.4
		].forEach((mul, i) => {
			this.playTone(base * mul, "sine", Math.max(.8, 3.4 - i * .4), .3 / (1 + i * .55), 1e-4);
		});
		setTimeout(() => this.playTone(base, "sine", 3, .2, 1e-4), 950);
		setTimeout(() => this.playTone(base * 2.4, "sine", 2, .08, 1e-4), 950);
	}
	timeStop() {
		[
			660,
			520,
			400,
			300
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", .45, .16, 1e-4), i * 110);
		});
	}
	kindChime() {
		[
			523,
			659,
			784,
			988,
			1175
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", 1.3, .13, 1e-4), i * 200);
		});
	}
	shepherdFlock() {
		if (!this.enabled) return;
		[
			784,
			880,
			1046,
			1318,
			1175,
			1318
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "triangle", .18, .22, .01), i * 90);
		});
		setTimeout(() => {
			[
				1568,
				2093,
				1760,
				2349,
				1975,
				2637
			].forEach((freq, i) => {
				setTimeout(() => this.playTone(freq, "sine", .22, .12, .001), i * 65);
			});
		}, 450);
		setTimeout(() => {
			for (let i = 0; i < 9; i++) setTimeout(() => {
				this.playTone(110 + i % 3 * 20, "sawtooth", .08, .2, .01);
				this.playTone(65, "triangle", .13, .26, .005);
			}, i * 85);
		}, 700);
	}
	herbalIncense() {
		if (!this.enabled) return;
		[
			220,
			280,
			190,
			240,
			310,
			260
		].forEach((freq, i) => {
			setTimeout(() => this.playTone(freq, "sine", .14, .15, .01), i * 70);
		});
		setTimeout(() => {
			[
				523,
				659,
				784,
				1046,
				1318,
				1568
			].forEach((freq, i) => {
				setTimeout(() => this.playTone(freq, "sine", .8, .14 / (1 + i * .2), 1e-4), i * 110);
			});
		}, 400);
		setTimeout(() => {
			[
				880,
				1175,
				1397,
				1760,
				2093
			].forEach((freq, i) => {
				setTimeout(() => this.playTone(freq, "triangle", .45, .11, .001), i * 90);
			});
		}, 850);
	}
	sheepBell() {
		this.playTone(1568, "sine", .18, .14, .001);
		setTimeout(() => this.playTone(2093, "sine", .22, .12, .001), 60);
	}
	rooster() {
		this.playTone(587, "triangle", .2, .2);
		setTimeout(() => this.playTone(659, "triangle", .25, .25), 180);
		setTimeout(() => this.playTone(523, "triangle", .2, .25), 400);
		setTimeout(() => this.playTone(784, "triangle", .6, .35), 580);
	}
	thunder() {
		this.playTone(110, "sawtooth", .3, .35, .1);
		setTimeout(() => this.playTone(65, "sawtooth", .8, .4, .001), 120);
		setTimeout(() => this.playTone(45, "sawtooth", 1.2, .3, .001), 350);
	}
	pause() {
		this.playTone(520, "sine", .12, .15);
		setTimeout(() => this.playTone(390, "sine", .15, .12), 60);
	}
	resume() {
		this.playTone(390, "sine", .12, .12);
		setTimeout(() => this.playTone(520, "sine", .15, .15), 60);
	}
	smokePuff() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// 1. Soft whimsical poof / pop pitch drop (triangle wave)
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = "triangle";
			osc.frequency.setValueAtTime(320, now);
			osc.frequency.exponentialRampToValueAtTime(75, now + 0.28);
			gain.gain.setValueAtTime(0.2, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start();
			osc.stop(now + 0.35);

			// 2. Gentle airy noise burst / whoosh for the soft smoke puff
			const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
			const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
			const output = noiseBuffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				output[i] = (Math.random() * 2 - 1) * 0.35;
			}
			const whiteNoise = this.ctx.createBufferSource();
			whiteNoise.buffer = noiseBuffer;

			const filter = this.ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(900, now);
			filter.frequency.exponentialRampToValueAtTime(180, now + 0.35);

			const noiseGain = this.ctx.createGain();
			noiseGain.gain.setValueAtTime(0.18, now);
			noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

			whiteNoise.connect(filter);
			filter.connect(noiseGain);
			noiseGain.connect(this.ctx.destination);

			whiteNoise.start();
		} catch {}
	}
	bootSnowCrunch() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
			const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
			const output = noiseBuffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				output[i] = (Math.random() * 2 - 1) * 0.3;
			}
			const whiteNoise = this.ctx.createBufferSource();
			whiteNoise.buffer = noiseBuffer;
			const filter = this.ctx.createBiquadFilter();
			filter.type = "bandpass";
			filter.frequency.setValueAtTime(1400, now);
			filter.Q.setValueAtTime(2.2, now);
			const gain = this.ctx.createGain();
			gain.gain.setValueAtTime(0.14, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
			whiteNoise.connect(filter);
			filter.connect(gain);
			gain.connect(this.ctx.destination);
			whiteNoise.start();
		} catch {}
	}
	ponocnyHorn() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// 1. Deep resonant brass blast (Night watchman cow horn)
			const osc1 = this.ctx.createOscillator();
			const osc2 = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			const filter = this.ctx.createBiquadFilter();

			osc1.type = "sawtooth";
			osc2.type = "triangle";
			osc1.frequency.setValueAtTime(110, now);
			osc1.frequency.linearRampToValueAtTime(146.8, now + 0.35);
			osc1.frequency.exponentialRampToValueAtTime(110, now + 1.6);

			osc2.frequency.setValueAtTime(164.8, now);
			osc2.frequency.linearRampToValueAtTime(220, now + 0.35);
			osc2.frequency.exponentialRampToValueAtTime(164.8, now + 1.6);

			filter.type = "lowpass";
			filter.frequency.setValueAtTime(450, now);
			filter.frequency.linearRampToValueAtTime(1200, now + 0.4);
			filter.frequency.exponentialRampToValueAtTime(280, now + 2.0);

			gain.gain.setValueAtTime(0.01, now);
			gain.gain.linearRampToValueAtTime(0.38, now + 0.25);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

			osc1.connect(filter);
			osc2.connect(filter);
			filter.connect(gain);
			gain.connect(this.ctx.destination);

			osc1.start(now);
			osc2.start(now);
			osc1.stop(now + 2.3);
			osc2.stop(now + 2.3);

			// 2. Muffle / pause background music for muffled winter silence
			if (this.menuMusic && !this.menuMusic.paused) {
				const prevVol = this.menuMusic.volume;
				this.menuMusic.volume = 0.02;
				setTimeout(() => {
					if (this.menuMusic && this.musicEnabled) {
						this.menuMusic.volume = prevVol;
					}
				}, 5000);
			}

			// 3. Speech chant: "Chval každý duch Hospodina!"
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				try {
					const utterance = new SpeechSynthesisUtterance("Chval každý duch Hospodina!");
					utterance.lang = "cs-CZ";
					utterance.pitch = 0.65; // deep solemn night watchman voice
					utterance.rate = 0.85;
					utterance.volume = 0.75;
					window.speechSynthesis.cancel();
					window.speechSynthesis.speak(utterance);
				} catch {}
			}
		} catch {}
	}
	masopustRattle() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// Rapid series of 9 loud, snappy wooden clatter clicks
			for (let i = 0; i < 9; i++) {
				const t = now + i * 0.038;
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "sawtooth";
				osc.frequency.setValueAtTime(480 + (i % 3) * 120, t);
				gain.gain.setValueAtTime(0.28, t);
				gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
				osc.connect(gain);
				gain.connect(this.ctx.destination);
				osc.start(t);
				osc.stop(t + 0.035);
			}
			// Heavy wooden resonance thud
			const sub = this.ctx.createOscillator();
			const subGain = this.ctx.createGain();
			sub.type = "triangle";
			sub.frequency.setValueAtTime(140, now);
			sub.frequency.exponentialRampToValueAtTime(45, now + 0.35);
			subGain.gain.setValueAtTime(0.35, now);
			subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
			sub.connect(subGain);
			subGain.connect(this.ctx.destination);
			sub.start(now);
			sub.stop(now + 0.42);
		} catch {}
	}
	grandmothersApron() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// 1. Brisk breeze whistling through trees (swept bandpass noise)
			const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
			const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
			const output = noiseBuffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				output[i] = (Math.random() * 2 - 1) * 0.3;
			}
			const windSource = this.ctx.createBufferSource();
			windSource.buffer = noiseBuffer;
			const windFilter = this.ctx.createBiquadFilter();
			windFilter.type = "bandpass";
			windFilter.frequency.setValueAtTime(400, now);
			windFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.3);
			windFilter.frequency.exponentialRampToValueAtTime(350, now + 0.6);
			const windGain = this.ctx.createGain();
			windGain.gain.setValueAtTime(0.18, now);
			windGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
			windSource.connect(windFilter);
			windFilter.connect(windGain);
			windGain.connect(this.ctx.destination);
			windSource.start(now);

			// 2. Playful xylophone / glockenspiel rattle arpeggio (pickups scurrying into pockets)
			const notes = [880, 1046.5, 1174.7, 1318.5, 1568, 1760, 2093];
			for (let i = 0; i < notes.length; i++) {
				const nt = now + 0.12 + i * 0.055;
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "sine";
				osc.frequency.setValueAtTime(notes[i], nt);
				gain.gain.setValueAtTime(0.18, nt);
				gain.gain.exponentialRampToValueAtTime(0.001, nt + 0.18);
				osc.connect(gain);
				gain.connect(this.ctx.destination);
				osc.start(nt);
				osc.stop(nt + 0.2);
			}
		} catch {}
	}
	slivoviceSplash() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// 1. Wet glug-glug bubbles
			for (let i = 0; i < 3; i++) {
				const t = now + i * 0.08;
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "sine";
				osc.frequency.setValueAtTime(420 - i * 40, t);
				osc.frequency.exponentialRampToValueAtTime(160, t + 0.07);
				gain.gain.setValueAtTime(0.22, t);
				gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
				osc.connect(gain);
				gain.connect(this.ctx.destination);
				osc.start(t);
				osc.stop(t + 0.075);
			}
			// 2. Fiery whoosh vapour cloud
			const whooshBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.45), this.ctx.sampleRate);
			const out = whooshBuffer.getChannelData(0);
			for (let i = 0; i < out.length; i++) out[i] = (Math.random() * 2 - 1) * 0.35;
			const whooshSource = this.ctx.createBufferSource();
			whooshSource.buffer = whooshBuffer;
			const filter = this.ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.setValueAtTime(800, now + 0.15);
			filter.frequency.exponentialRampToValueAtTime(200, now + 0.55);
			const wGain = this.ctx.createGain();
			wGain.gain.setValueAtTime(0.2, now + 0.15);
			wGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
			whooshSource.connect(filter);
			filter.connect(wGain);
			wGain.connect(this.ctx.destination);
			whooshSource.start(now + 0.15);

			// 3. Raspy sigh "A je to doma!"
			if (typeof window !== "undefined" && "speechSynthesis" in window) {
				try {
					const utterance = new SpeechSynthesisUtterance("A je to doma!");
					utterance.lang = "cs-CZ";
					utterance.pitch = 0.8;
					utterance.rate = 1.05;
					utterance.volume = 0.8;
					setTimeout(() => {
						try { window.speechSynthesis.speak(utterance); } catch {}
					}, 250);
				} catch {}
			}
		} catch {}
	}
	svandaBagpipes() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// 1. Rustic continuous drone (A2 110Hz + E3 165Hz)
			const drone1 = this.ctx.createOscillator();
			const drone2 = this.ctx.createOscillator();
			const droneGain = this.ctx.createGain();
			drone1.type = "sawtooth";
			drone2.type = "sawtooth";
			drone1.frequency.setValueAtTime(110, now);
			drone2.frequency.setValueAtTime(164.8, now);
			droneGain.gain.setValueAtTime(0.12, now);
			droneGain.gain.linearRampToValueAtTime(0.14, now + 0.4);
			droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
			drone1.connect(droneGain);
			drone2.connect(droneGain);
			droneGain.connect(this.ctx.destination);
			drone1.start(now);
			drone2.start(now);
			drone1.stop(now + 1.85);
			drone2.stop(now + 1.85);

			// 2. Jaunty squealing polka chanter riff
			const riff = [440, 493.88, 554.37, 659.25, 554.37, 493.88, 440, 659.25, 740, 880];
			for (let i = 0; i < riff.length; i++) {
				const t = now + i * 0.075;
				const chanter = this.ctx.createOscillator();
				const chanterGain = this.ctx.createGain();
				chanter.type = "sawtooth";
				chanter.frequency.setValueAtTime(riff[i], t);
				chanterGain.gain.setValueAtTime(0.16, t);
				chanterGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
				chanter.connect(chanterGain);
				chanterGain.connect(this.ctx.destination);
				chanter.start(t);
				chanter.stop(t + 0.075);
			}
		} catch {}
	}
	kominikButton() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// 1. Cheerful two-tone whistle (1760Hz -> 2093Hz)
			const osc1 = this.ctx.createOscillator();
			const gain1 = this.ctx.createGain();
			osc1.type = "sine";
			osc1.frequency.setValueAtTime(1760, now);
			gain1.gain.setValueAtTime(0.24, now);
			gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
			osc1.connect(gain1);
			gain1.connect(this.ctx.destination);
			osc1.start(now);
			osc1.stop(now + 0.15);

			const osc2 = this.ctx.createOscillator();
			const gain2 = this.ctx.createGain();
			osc2.type = "sine";
			osc2.frequency.setValueAtTime(2093, now + 0.12);
			gain2.gain.setValueAtTime(0.26, now + 0.12);
			gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
			osc2.connect(gain2);
			gain2.connect(this.ctx.destination);
			osc2.start(now + 0.12);
			osc2.stop(now + 0.35);

			// 2. Metallic rattle of chimney ball-and-chain
			for (let i = 0; i < 4; i++) {
				const t = now + 0.18 + i * 0.045;
				const ch = this.ctx.createOscillator();
				const chGain = this.ctx.createGain();
				ch.type = "triangle";
				ch.frequency.setValueAtTime(2400 + i * 280, t);
				chGain.gain.setValueAtTime(0.12, t);
				chGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
				ch.connect(chGain);
				chGain.connect(this.ctx.destination);
				ch.start(t);
				ch.stop(t + 0.045);
			}
		} catch {}
	}
	ananasPickup() {
		if (!this.enabled) return;
		try {
			this.init();
			if (!this.ctx) return;
			const now = this.ctx.currentTime;
			// Bright celebratory fanfare chord (C5, E5, G5, C6)
			const freqs = [523.25, 659.25, 783.99, 1046.5];
			freqs.forEach((f, idx) => {
				const osc = this.ctx.createOscillator();
				const gain = this.ctx.createGain();
				osc.type = "triangle";
				osc.frequency.setValueAtTime(f, now + idx * 0.04);
				gain.gain.setValueAtTime(0.2, now + idx * 0.04);
				gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
				osc.connect(gain);
				gain.connect(this.ctx.destination);
				osc.start(now + idx * 0.04);
				osc.stop(now + 0.75);
			});
		} catch {}
	}
};
var sound = new SoundManager();

export { SoundManager, sound };
