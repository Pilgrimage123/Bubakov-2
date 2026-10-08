import React from 'react';

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
		if (!this.enabled || !this.musicEnabled) return;
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
		if (!this.enabled) return;
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
};
var sound = new SoundManager();

export { SoundManager, sound };
