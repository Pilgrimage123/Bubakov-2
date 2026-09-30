import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const audioDir = path.resolve(rootDir, 'public/audio');
const outMp3 = path.resolve(audioDir, 'bubakov_menu.mp3');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const SAMPLE_RATE = 44100;
const BPM = 126;
const BEAT = 60 / BPM; // ~0.476s
const EIGHTH = BEAT / 2; // ~0.238s
const SIXTEENTH = BEAT / 4; // ~0.119s

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function noteFreq(name) {
  if (!name || name === 'R') return 0;
  let pitch = name.slice(0, -1);
  const oct = parseInt(name.slice(-1), 10);
  if (pitch === 'Bb') pitch = 'A#';
  if (pitch === 'Db') pitch = 'C#';
  if (pitch === 'Eb') pitch = 'D#';
  if (pitch === 'Gb') pitch = 'F#';
  if (pitch === 'Ab') pitch = 'G#';
  const semi = NOTE_NAMES.indexOf(pitch);
  if (semi === -1) return 0;
  const n = (oct - 4) * 12 + (semi - 9);
  return 440 * Math.pow(2, n / 12);
}

// 76 bars in 2/4 time = 152 quarter beats (~72.4 seconds)
const TOTAL_BEATS = 152;
const TOTAL_DURATION = TOTAL_BEATS * BEAT + 1.5;
const TOTAL_SAMPLES = Math.ceil(TOTAL_DURATION * SAMPLE_RATE);

console.log(`Generating Bubakov polka soundtrack...`);
console.log(`Duration: ${TOTAL_DURATION.toFixed(1)}s, ${TOTAL_SAMPLES} samples`);

const leftBuffer = new Float32Array(TOTAL_SAMPLES);
const rightBuffer = new Float32Array(TOTAL_SAMPLES);

function addSample(idx, leftVal, rightVal) {
  if (idx >= 0 && idx < TOTAL_SAMPLES) {
    leftBuffer[idx] += leftVal;
    rightBuffer[idx] += rightVal;
  }
}

// 1. TUBA / HELIKON BASS
function playTuba(startSec, note, durSec, vol = 0.55) {
  const freq = noteFreq(note);
  if (freq === 0) return;
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / totalSamples;
    let env = 1.0;
    if (t < 0.015) env = t / 0.015;
    else env = Math.exp(-progress * 2.8);

    const p1 = Math.sin(2 * Math.PI * freq * t);
    const p2 = 0.65 * Math.sin(4 * Math.PI * freq * t);
    const p3 = 0.35 * Math.sin(6 * Math.PI * freq * t);
    const p4 = 0.18 * Math.sin(8 * Math.PI * freq * t);
    const bite = t < 0.03 ? (Math.random() * 2 - 1) * 0.15 * Math.exp(-t * 80) : 0;

    const val = (p1 + p2 + p3 + p4 + bite) * env * vol * 0.42;
    addSample(startSample + i, val * 0.95, val * 0.95);
  }
}

// 2. ACCORDION / HELIGONKA CHORD
function playAccordion(startSec, notes, durSec, vol = 0.45) {
  const freqs = notes.map(noteFreq).filter(f => f > 0);
  if (freqs.length === 0) return;
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let env = 1.0;
    if (t < 0.01) env = t / 0.01;
    else env = Math.exp(-i / (SAMPLE_RATE * 0.12));

    let sum = 0;
    for (const f of freqs) {
      const r1 = Math.sin(2 * Math.PI * f * t);
      const r2 = 0.8 * Math.sin(2 * Math.PI * (f + 2.8) * t);
      const r3 = 0.4 * Math.sin(4 * Math.PI * f * t);
      sum += (r1 + r2 + r3);
    }
    const val = (sum / freqs.length) * env * vol * 0.28;
    addSample(startSample + i, val * 1.15, val * 0.85);
  }
}

// 3. TRUMPET / KRIDLOVKA
function playTrumpet(startSec, note, durSec, vol = 0.5, pan = 0.2) {
  const freq = noteFreq(note);
  if (freq === 0) return;
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / totalSamples;
    let env = 1.0;
    if (t < 0.02) env = t / 0.02;
    else if (progress > 0.8) env = (1.0 - progress) / 0.2;
    else env = 1.0 - progress * 0.15;

    const vib = durSec > 0.25 && t > 0.15 ? Math.sin(2 * Math.PI * 5.2 * t) * (freq * 0.012) : 0;
    const currentFreq = freq + vib;

    const h1 = Math.sin(2 * Math.PI * currentFreq * t);
    const h2 = 0.55 * Math.sin(4 * Math.PI * currentFreq * t);
    const h3 = 0.40 * Math.sin(6 * Math.PI * currentFreq * t);
    const h4 = 0.25 * Math.sin(8 * Math.PI * currentFreq * t);
    const h5 = 0.15 * Math.sin(10 * Math.PI * currentFreq * t);

    const val = (h1 + h2 + h3 + h4 + h5) * env * vol * 0.26;
    addSample(startSample + i, val * (1 - pan), val * (1 + pan));
  }
}

// 4. CLARINET / KLARINET
function playClarinet(startSec, note, durSec, vol = 0.48, pan = -0.25) {
  const freq = noteFreq(note);
  if (freq === 0) return;
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / totalSamples;
    let env = 1.0;
    if (t < 0.015) env = t / 0.015;
    else if (progress > 0.82) env = (1.0 - progress) / 0.18;
    else env = 1.0 - progress * 0.2;

    const vib = durSec > 0.28 && t > 0.18 ? Math.sin(2 * Math.PI * 5.8 * t) * (freq * 0.009) : 0;
    const currentFreq = freq + vib;

    const o1 = Math.sin(2 * Math.PI * currentFreq * t);
    const o3 = 0.65 * Math.sin(6 * Math.PI * currentFreq * t);
    const o5 = 0.35 * Math.sin(10 * Math.PI * currentFreq * t);
    const o7 = 0.18 * Math.sin(14 * Math.PI * currentFreq * t);
    const o2 = 0.15 * Math.sin(4 * Math.PI * currentFreq * t);

    const val = (o1 + o3 + o5 + o7 + o2) * env * vol * 0.25;
    addSample(startSample + i, val * (1 - pan), val * (1 + pan));
  }
}

// 5. TROMBONE / BARYTON
function playTrombone(startSec, note, durSec, vol = 0.45) {
  const freq = noteFreq(note);
  if (freq === 0) return;
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / totalSamples;
    let env = 1.0;
    if (t < 0.02) env = t / 0.02;
    else if (progress > 0.75) env = (1.0 - progress) / 0.25;
    else env = 1.0 - progress * 0.25;

    const h1 = Math.sin(2 * Math.PI * freq * t);
    const h2 = 0.7 * Math.sin(4 * Math.PI * freq * t);
    const h3 = 0.4 * Math.sin(6 * Math.PI * freq * t);
    const h4 = 0.2 * Math.sin(8 * Math.PI * freq * t);

    const val = (h1 + h2 + h3 + h4) * env * vol * 0.28;
    addSample(startSample + i, val * 0.9, val * 1.1);
  }
}

// 6. PERCUSSION
function playBassDrum(startSec, vol = 0.65) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const durSec = 0.25;
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 22);
    const pitch = 38 + 57 * Math.exp(-t * 40);
    const val = Math.sin(2 * Math.PI * pitch * t) * env * vol * 0.6;
    addSample(startSample + i, val, val);
  }
}

function playSnare(startSec, vol = 0.45) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const durSec = 0.18;
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 30);
    const noise = (Math.random() * 2 - 1) * 0.7;
    const tone = Math.sin(2 * Math.PI * 185 * t) * 0.3 * Math.exp(-t * 25);
    const val = (noise + tone) * env * vol * 0.4;
    addSample(startSample + i, val, val);
  }
}

function playSnareRoll(startSec, durSec, vol = 0.35) {
  const hits = Math.floor(durSec / 0.045);
  for (let h = 0; h < hits; h++) {
    const progress = h / hits;
    const hitVol = vol * (0.4 + progress * 0.6 + (Math.random() * 0.15 - 0.07));
    playSnare(startSec + h * 0.045, hitVol);
  }
}

function playWoodblock(startSec, high = false, vol = 0.5) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const durSec = 0.08;
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);
  const freq = high ? 1550 : 1150;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 90);
    const click = Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(2 * Math.PI * freq * 2.4 * t);
    const val = click * env * vol * 0.45;
    addSample(startSample + i, val * 1.1, val * 0.9);
  }
}

function playCymbal(startSec, vol = 0.4) {
  const startSample = Math.floor(startSec * SAMPLE_RATE);
  const durSec = 1.1;
  const totalSamples = Math.floor(durSec * SAMPLE_RATE);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 4.2);
    const noise = (Math.random() * 2 - 1);
    const ring = Math.sin(2 * Math.PI * 3400 * t) * 0.2 + Math.sin(2 * Math.PI * 5200 * t) * 0.15;
    const val = (noise * 0.65 + ring) * env * vol * 0.3;
    addSample(startSample + i, val * 1.1, val * 0.9);
  }
}

function barSec(b) {
  return (b - 1) * 2 * BEAT;
}

function addOompahSection(startBar, endBar, chordMap) {
  for (let b = startBar; b <= endBar; b++) {
    const chordInfo = chordMap[b] || { chord: ['C4', 'E4', 'G4'], root: 'C2', fifth: 'G1' };
    const t1 = barSec(b);
    const t1_5 = t1 + EIGHTH;
    const t2 = t1 + BEAT;
    const t2_5 = t2 + EIGHTH;

    playTuba(t1, chordInfo.root, EIGHTH * 1.1, 0.58);
    playTuba(t2, chordInfo.fifth, EIGHTH * 1.1, 0.52);

    playAccordion(t1_5, chordInfo.chord, SIXTEENTH * 1.4, 0.42);
    playAccordion(t2_5, chordInfo.chord, SIXTEENTH * 1.4, 0.46);

    playBassDrum(t1, 0.62);
    playSnare(t2, 0.44);
  }
}

// 1. INTRO (Bars 1 - 4)
playTuba(barSec(1), 'G2', BEAT * 0.9, 0.65);
playSnare(barSec(1) + BEAT, 0.45);
playTuba(barSec(2), 'C3', BEAT * 0.9, 0.65);
playSnare(barSec(2) + BEAT, 0.45);
playTuba(barSec(3), 'G2', BEAT * 0.9, 0.65);
playSnare(barSec(3) + BEAT, 0.45);

playTuba(barSec(4), 'C3', EIGHTH, 0.65);
playTuba(barSec(4) + EIGHTH, 'D3', EIGHTH, 0.65);
playTuba(barSec(4) + BEAT, 'E3', EIGHTH, 0.65);
playTuba(barSec(4) + BEAT + EIGHTH, 'F3', EIGHTH, 0.65);
playSnareRoll(barSec(4), BEAT * 2, 0.42);
playCymbal(barSec(5), 0.55);

const C_CHORD = { chord: ['C4', 'E4', 'G4'], root: 'C2', fifth: 'G1' };
const G7_CHORD = { chord: ['B3', 'D4', 'F4', 'G4'], root: 'G1', fifth: 'D2' };
const F_CHORD = { chord: ['C4', 'F4', 'A4'], root: 'F1', fifth: 'C2' };
const C7_CHORD = { chord: ['C4', 'E4', 'G4', 'Bb4'], root: 'C2', fifth: 'G1' };

// 2. SECTION A (Bars 5 - 20)
const chordsA = {};
for (let b = 5; b <= 20; b++) {
  if (b === 5 || b === 6 || b === 9 || b === 10 || b === 13 || b === 14 || b === 17 || b === 18) {
    chordsA[b] = C_CHORD;
  } else if (b === 7 || b === 8 || b === 11 || b === 15 || b === 16 || b === 19) {
    chordsA[b] = G7_CHORD;
  } else if (b === 12 || b === 20) {
    chordsA[b] = C_CHORD;
  }
}
addOompahSection(5, 20, chordsA);

function addMelodyA(startBar, isRepeat = false) {
  let t = barSec(startBar);
  playTrumpet(t, 'G4', EIGHTH, 0.52);
  playClarinet(t, 'G4', EIGHTH, 0.45);
  playTrumpet(t + EIGHTH, 'C5', EIGHTH, 0.54);
  playClarinet(t + EIGHTH, 'C5', EIGHTH, 0.45);
  playTrumpet(t + BEAT, 'E5', EIGHTH, 0.55);
  playClarinet(t + BEAT, 'E5', EIGHTH, 0.46);
  playTrumpet(t + BEAT + EIGHTH, 'G5', EIGHTH, 0.58);
  playClarinet(t + BEAT + EIGHTH, 'G5', EIGHTH, 0.48);

  t = barSec(startBar + 1);
  playTrumpet(t, 'A5', EIGHTH, 0.58);
  playClarinet(t, 'A5', EIGHTH, 0.48);
  playTrumpet(t + EIGHTH, 'G5', EIGHTH, 0.55);
  playClarinet(t + EIGHTH, 'G5', EIGHTH, 0.46);
  playTrumpet(t + BEAT, 'F5', EIGHTH, 0.52);
  playClarinet(t + BEAT, 'F5', EIGHTH, 0.45);
  playTrumpet(t + BEAT + EIGHTH, 'E5', EIGHTH, 0.50);
  playClarinet(t + BEAT + EIGHTH, 'E5', EIGHTH, 0.42);

  t = barSec(startBar + 2);
  playTrumpet(t, 'D5', EIGHTH, 0.50);
  playClarinet(t, 'D5', EIGHTH, 0.44);
  playTrumpet(t + EIGHTH, 'F5', EIGHTH, 0.52);
  playClarinet(t + EIGHTH, 'F5', EIGHTH, 0.45);
  playTrumpet(t + BEAT, 'A5', EIGHTH, 0.56);
  playClarinet(t + BEAT, 'A5', EIGHTH, 0.48);
  playTrumpet(t + BEAT + EIGHTH, 'G5', EIGHTH, 0.54);
  playClarinet(t + BEAT + EIGHTH, 'G5', EIGHTH, 0.46);

  t = barSec(startBar + 3);
  playTrumpet(t, 'E5', BEAT, 0.55);
  playClarinet(t, 'E5', BEAT, 0.48);
  if (isRepeat) {
    playWoodblock(t + BEAT, false, 0.55);
    playWoodblock(t + BEAT + EIGHTH, true, 0.55);
  }

  t = barSec(startBar + 4);
  playTrumpet(t, 'G4', EIGHTH, 0.52);
  playClarinet(t, 'G4', EIGHTH, 0.45);
  playTrumpet(t + EIGHTH, 'C5', EIGHTH, 0.54);
  playClarinet(t + EIGHTH, 'C5', EIGHTH, 0.45);
  playTrumpet(t + BEAT, 'E5', EIGHTH, 0.55);
  playClarinet(t + BEAT, 'E5', EIGHTH, 0.46);
  playTrumpet(t + BEAT + EIGHTH, 'G5', EIGHTH, 0.58);
  playClarinet(t + BEAT + EIGHTH, 'G5', EIGHTH, 0.48);

  t = barSec(startBar + 5);
  playTrumpet(t, 'A5', EIGHTH, 0.58);
  playClarinet(t, 'A5', EIGHTH, 0.48);
  playTrumpet(t + EIGHTH, 'G5', EIGHTH, 0.55);
  playClarinet(t + EIGHTH, 'G5', EIGHTH, 0.46);
  playTrumpet(t + BEAT, 'F5', EIGHTH, 0.52);
  playClarinet(t + BEAT, 'F5', EIGHTH, 0.45);
  playTrumpet(t + BEAT + EIGHTH, 'D5', EIGHTH, 0.48);
  playClarinet(t + BEAT + EIGHTH, 'D5', EIGHTH, 0.42);

  t = barSec(startBar + 6);
  playTrumpet(t, 'B4', EIGHTH, 0.50);
  playClarinet(t, 'B4', EIGHTH, 0.44);
  playTrumpet(t + EIGHTH, 'D5', EIGHTH, 0.52);
  playClarinet(t + EIGHTH, 'D5', EIGHTH, 0.45);
  playTrumpet(t + BEAT, 'G5', EIGHTH, 0.56);
  playClarinet(t + BEAT, 'G5', EIGHTH, 0.48);
  playTrumpet(t + BEAT + EIGHTH, 'B5', EIGHTH, 0.58);
  playClarinet(t + BEAT + EIGHTH, 'B5', EIGHTH, 0.50);

  t = barSec(startBar + 7);
  playTrumpet(t, 'C6', BEAT, 0.62);
  playClarinet(t, 'C6', BEAT, 0.55);
  playSnare(t, 0.55);
  playBassDrum(t, 0.65);
}

addMelodyA(5, false);
addMelodyA(13, true);

// 3. SECTION B (Bars 21 - 36)
const chordsB = {};
for (let b = 21; b <= 36; b++) {
  if (b === 21 || b === 22 || b === 25 || b === 26 || b === 29 || b === 30 || b === 33 || b === 34) {
    chordsB[b] = C_CHORD;
  } else if (b === 23 || b === 27 || b === 31 || b === 35) {
    chordsB[b] = G7_CHORD;
  } else {
    chordsB[b] = C_CHORD;
  }
}
addOompahSection(21, 36, chordsB);

function addMelodyB(startBar) {
  let t = barSec(startBar);
  playTrumpet(t, 'E5', EIGHTH, 0.56);
  playClarinet(t, 'E5', EIGHTH, 0.48);
  playTrumpet(t + EIGHTH, 'G5', EIGHTH, 0.58);
  playClarinet(t + EIGHTH, 'G5', EIGHTH, 0.50);
  playTrumpet(t + BEAT, 'C6', EIGHTH, 0.62);
  playClarinet(t + BEAT, 'C6', EIGHTH, 0.54);
  playTrumpet(t + BEAT + EIGHTH, 'B5', EIGHTH, 0.58);
  playClarinet(t + BEAT + EIGHTH, 'B5', EIGHTH, 0.50);

  t = barSec(startBar + 1);
  playTrumpet(t, 'A5', EIGHTH, 0.58);
  playClarinet(t, 'A5', EIGHTH, 0.50);
  playTrumpet(t + EIGHTH, 'G5', EIGHTH, 0.55);
  playClarinet(t + EIGHTH, 'G5', EIGHTH, 0.48);
  playTrumpet(t + BEAT, 'E5', EIGHTH, 0.52);
  playClarinet(t + BEAT, 'E5', EIGHTH, 0.45);
  playTrumpet(t + BEAT + EIGHTH, 'C5', EIGHTH, 0.50);
  playClarinet(t + BEAT + EIGHTH, 'C5', EIGHTH, 0.44);

  t = barSec(startBar + 2);
  playTrumpet(t, 'D5', EIGHTH, 0.52);
  playClarinet(t, 'D5', EIGHTH, 0.46);
  playTrumpet(t + EIGHTH, 'F5', EIGHTH, 0.55);
  playClarinet(t + EIGHTH, 'F5', EIGHTH, 0.48);
  playTrumpet(t + BEAT, 'B5', EIGHTH, 0.60);
  playClarinet(t + BEAT, 'B5', EIGHTH, 0.52);
  playTrumpet(t + BEAT + EIGHTH, 'A5', EIGHTH, 0.56);
  playClarinet(t + BEAT + EIGHTH, 'A5', EIGHTH, 0.48);

  t = barSec(startBar + 3);
  playTrumpet(t, 'G5', BEAT, 0.58);
  playClarinet(t, 'G5', BEAT, 0.50);
  playTrombone(t + BEAT, 'G3', SIXTEENTH, 0.52);
  playTrombone(t + BEAT + SIXTEENTH, 'A3', SIXTEENTH, 0.52);
  playTrombone(t + BEAT + EIGHTH, 'B3', SIXTEENTH, 0.54);
  playTrombone(t + BEAT + EIGHTH + SIXTEENTH, 'C4', SIXTEENTH, 0.56);

  t = barSec(startBar + 4);
  playTrumpet(t, 'E5', EIGHTH, 0.56);
  playClarinet(t, 'E5', EIGHTH, 0.48);
  playTrumpet(t + EIGHTH, 'G5', EIGHTH, 0.58);
  playClarinet(t + EIGHTH, 'G5', EIGHTH, 0.50);
  playTrumpet(t + BEAT, 'C6', EIGHTH, 0.62);
  playClarinet(t + BEAT, 'C6', EIGHTH, 0.54);
  playTrumpet(t + BEAT + EIGHTH, 'B5', EIGHTH, 0.58);
  playClarinet(t + BEAT + EIGHTH, 'B5', EIGHTH, 0.50);

  t = barSec(startBar + 5);
  playTrumpet(t, 'A5', EIGHTH, 0.58);
  playClarinet(t, 'A5', EIGHTH, 0.50);
  playTrumpet(t + EIGHTH, 'G5', EIGHTH, 0.55);
  playClarinet(t + EIGHTH, 'G5', EIGHTH, 0.48);
  playTrumpet(t + BEAT, 'F5', EIGHTH, 0.52);
  playClarinet(t + BEAT, 'F5', EIGHTH, 0.45);
  playTrumpet(t + BEAT + EIGHTH, 'D5', EIGHTH, 0.48);
  playClarinet(t + BEAT + EIGHTH, 'D5', EIGHTH, 0.42);

  t = barSec(startBar + 6);
  playTrumpet(t, 'G5', EIGHTH, 0.56);
  playClarinet(t, 'G5', EIGHTH, 0.48);
  playTrumpet(t + EIGHTH, 'A5', EIGHTH, 0.58);
  playClarinet(t + EIGHTH, 'A5', EIGHTH, 0.50);
  playTrumpet(t + BEAT, 'B5', EIGHTH, 0.60);
  playClarinet(t + BEAT, 'B5', EIGHTH, 0.52);
  playTrumpet(t + BEAT + EIGHTH, 'D6', EIGHTH, 0.64);
  playClarinet(t + BEAT + EIGHTH, 'D6', EIGHTH, 0.56);

  t = barSec(startBar + 7);
  playTrumpet(t, 'C6', BEAT, 0.64);
  playClarinet(t, 'C6', BEAT, 0.56);
  playSnare(t, 0.55);
  playBassDrum(t, 0.65);
}

addMelodyB(21);
addMelodyB(29);

// 4. SECTION C - TRIO in F Major (Bars 37 - 52)
const chordsTrio = {};
for (let b = 37; b <= 52; b++) {
  if (b === 37 || b === 38 || b === 41 || b === 42 || b === 45 || b === 46 || b === 49 || b === 50) {
    chordsTrio[b] = F_CHORD;
  } else if (b === 39 || b === 40 || b === 43 || b === 47 || b === 51) {
    chordsTrio[b] = C7_CHORD;
  } else if (b === 44 || b === 52) {
    chordsTrio[b] = F_CHORD;
  }
}
addOompahSection(37, 52, chordsTrio);
playCymbal(barSec(37), 0.5);

function addMelodyTrio(startBar) {
  let t = barSec(startBar);
  playTrombone(t, 'A3', BEAT, 0.55);
  playTrumpet(t, 'A4', BEAT, 0.50);
  playTrombone(t + BEAT, 'F3', EIGHTH, 0.52);
  playTrumpet(t + BEAT, 'F4', EIGHTH, 0.48);
  playTrombone(t + BEAT + EIGHTH, 'G3', EIGHTH, 0.54);
  playTrumpet(t + BEAT + EIGHTH, 'G4', EIGHTH, 0.50);

  t = barSec(startBar + 1);
  playTrombone(t, 'A3', EIGHTH, 0.55);
  playTrumpet(t, 'A4', EIGHTH, 0.52);
  playTrombone(t + EIGHTH, 'Bb3', EIGHTH, 0.56);
  playTrumpet(t + EIGHTH, 'Bb4', EIGHTH, 0.54);
  playTrombone(t + BEAT, 'C4', BEAT, 0.60);
  playTrumpet(t + BEAT, 'C5', BEAT, 0.56);

  t = barSec(startBar + 2);
  playTrombone(t, 'D4', EIGHTH, 0.60);
  playTrumpet(t, 'D5', EIGHTH, 0.56);
  playTrombone(t + EIGHTH, 'C4', EIGHTH, 0.58);
  playTrumpet(t + EIGHTH, 'C5', EIGHTH, 0.54);
  playTrombone(t + BEAT, 'Bb3', EIGHTH, 0.55);
  playTrumpet(t + BEAT, 'Bb4', EIGHTH, 0.52);
  playTrombone(t + BEAT + EIGHTH, 'A3', EIGHTH, 0.52);
  playTrumpet(t + BEAT + EIGHTH, 'A4', EIGHTH, 0.50);

  t = barSec(startBar + 3);
  playTrombone(t, 'G3', BEAT * 1.5, 0.55);
  playTrumpet(t, 'G4', BEAT * 1.5, 0.50);

  t = barSec(startBar + 4);
  playTrombone(t, 'Bb3', BEAT, 0.55);
  playTrumpet(t, 'Bb4', BEAT, 0.50);
  playTrombone(t + BEAT, 'G3', EIGHTH, 0.52);
  playTrumpet(t + BEAT, 'G4', EIGHTH, 0.48);
  playTrombone(t + BEAT + EIGHTH, 'A3', EIGHTH, 0.54);
  playTrumpet(t + BEAT + EIGHTH, 'A4', EIGHTH, 0.50);

  t = barSec(startBar + 5);
  playTrombone(t, 'Bb3', EIGHTH, 0.55);
  playTrumpet(t, 'Bb4', EIGHTH, 0.52);
  playTrombone(t + EIGHTH, 'C4', EIGHTH, 0.58);
  playTrumpet(t + EIGHTH, 'C5', EIGHTH, 0.54);
  playTrombone(t + BEAT, 'D4', BEAT, 0.62);
  playTrumpet(t + BEAT, 'D5', BEAT, 0.58);

  t = barSec(startBar + 6);
  playTrombone(t, 'C4', EIGHTH, 0.58);
  playTrumpet(t, 'C5', EIGHTH, 0.54);
  playTrombone(t + EIGHTH, 'Bb3', EIGHTH, 0.55);
  playTrumpet(t + EIGHTH, 'Bb4', EIGHTH, 0.52);
  playTrombone(t + BEAT, 'A3', EIGHTH, 0.54);
  playTrumpet(t + BEAT, 'A4', EIGHTH, 0.50);
  playTrombone(t + BEAT + EIGHTH, 'G3', EIGHTH, 0.52);
  playTrumpet(t + BEAT + EIGHTH, 'G4', EIGHTH, 0.48);

  t = barSec(startBar + 7);
  playTrombone(t, 'F3', BEAT, 0.62);
  playTrumpet(t, 'F4', BEAT, 0.58);
  playSnare(t, 0.55);
  playBassDrum(t, 0.65);
}

addMelodyTrio(37);
addMelodyTrio(45);

// 5. SECTION D - COMIC WOODBLOCK FEATURE (Bars 53 - 64)
for (let b = 53; b <= 64; b++) {
  const t = barSec(b);
  playTuba(t, (b % 2 === 1) ? 'C2' : 'G1', SIXTEENTH * 1.5, 0.55);
  playTuba(t + BEAT, (b % 2 === 1) ? 'G1' : 'C2', SIXTEENTH * 1.5, 0.52);

  playWoodblock(t, false, 0.6);
  playWoodblock(t + EIGHTH, true, 0.55);
  playWoodblock(t + BEAT, false, 0.6);
  playWoodblock(t + BEAT + SIXTEENTH, true, 0.55);
  playWoodblock(t + BEAT + EIGHTH, false, 0.6);
  playWoodblock(t + BEAT + EIGHTH + SIXTEENTH, true, 0.65);

  if (b % 2 === 0) {
    playClarinet(t + BEAT, 'G5', SIXTEENTH, 0.48);
    playClarinet(t + BEAT + SIXTEENTH, 'A5', SIXTEENTH, 0.50);
    playClarinet(t + BEAT + EIGHTH, 'B5', SIXTEENTH, 0.52);
    playClarinet(t + BEAT + EIGHTH + SIXTEENTH, 'C6', SIXTEENTH, 0.56);
  }
}

// 6. SECTION E - GRAND TUTTI POLKA FINALE (Bars 65 - 76)
playCymbal(barSec(65), 0.65);
const chordsFinale = {};
for (let b = 65; b <= 74; b++) {
  if (b === 65 || b === 66 || b === 69 || b === 70 || b === 73) {
    chordsFinale[b] = C_CHORD;
  } else if (b === 67 || b === 68 || b === 71 || b === 72) {
    chordsFinale[b] = G7_CHORD;
  } else {
    chordsFinale[b] = C_CHORD;
  }
}
addOompahSection(65, 74, chordsFinale);
addMelodyA(65, true);

// Bars 75-76: GRAND CZECH POLKA CADENCE
const tFinal1 = barSec(75);
playTrumpet(tFinal1, 'G5', EIGHTH, 0.65);
playClarinet(tFinal1, 'G5', EIGHTH, 0.58);
playTuba(tFinal1, 'G2', EIGHTH, 0.68);
playBassDrum(tFinal1, 0.7);

playTrumpet(tFinal1 + EIGHTH, 'C6', EIGHTH, 0.70);
playClarinet(tFinal1 + EIGHTH, 'C6', EIGHTH, 0.62);
playTuba(tFinal1 + EIGHTH, 'C2', EIGHTH, 0.72);
playSnare(tFinal1 + EIGHTH, 0.6);

playTrumpet(tFinal1 + BEAT, 'G5', EIGHTH, 0.65);
playClarinet(tFinal1 + BEAT, 'G5', EIGHTH, 0.58);
playTuba(tFinal1 + BEAT, 'G2', EIGHTH, 0.68);
playBassDrum(tFinal1 + BEAT, 0.7);

playTrumpet(tFinal1 + BEAT + EIGHTH, 'E6', EIGHTH, 0.75);
playClarinet(tFinal1 + BEAT + EIGHTH, 'E6', EIGHTH, 0.65);
playTuba(tFinal1 + BEAT + EIGHTH, 'C3', EIGHTH, 0.75);
playSnare(tFinal1 + BEAT + EIGHTH, 0.65);

const tFinal2 = barSec(76);
playTrumpet(tFinal2, 'D6', SIXTEENTH, 0.65);
playTrumpet(tFinal2 + SIXTEENTH, 'C6', SIXTEENTH, 0.65);
playTrumpet(tFinal2 + EIGHTH, 'B5', SIXTEENTH, 0.65);
playTrumpet(tFinal2 + EIGHTH + SIXTEENTH, 'A5', SIXTEENTH, 0.65);

const tDum1 = tFinal2 + BEAT;
playTrumpet(tDum1, 'G5', SIXTEENTH * 1.5, 0.75);
playTrombone(tDum1, 'G3', SIXTEENTH * 1.5, 0.72);
playTuba(tDum1, 'G1', SIXTEENTH * 1.5, 0.85);
playBassDrum(tDum1, 0.85);
playSnare(tDum1, 0.75);
playCymbal(tDum1, 0.55);

const tDum2 = tDum1 + EIGHTH;
playTrumpet(tDum2, 'C6', EIGHTH * 2, 0.85);
playClarinet(tDum2, 'C6', EIGHTH * 2, 0.75);
playTrombone(tDum2, 'C4', EIGHTH * 2, 0.8);
playTuba(tDum2, 'C2', EIGHTH * 2, 0.95);
playBassDrum(tDum2, 0.95);
playSnare(tDum2, 0.85);
playCymbal(tDum2, 0.75);

console.log('Mastering audio and applying analogue warm compression...');

let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const pL = Math.abs(leftBuffer[i]);
  const pR = Math.abs(rightBuffer[i]);
  if (pL > maxPeak) maxPeak = pL;
  if (pR > maxPeak) maxPeak = pR;
}
console.log(`Peak raw amplitude: ${maxPeak.toFixed(3)}`);

const targetPeak = 0.92;
const gain = maxPeak > 0 ? (targetPeak / maxPeak) : 1.0;

const pcmBuffer = Buffer.alloc(TOTAL_SAMPLES * 4);
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  const lNorm = Math.tanh(leftBuffer[i] * gain);
  const rNorm = Math.tanh(rightBuffer[i] * gain);

  const lInt = Math.max(-32768, Math.min(32767, Math.floor(lNorm * 32767)));
  const rInt = Math.max(-32768, Math.min(32767, Math.floor(rNorm * 32767)));

  pcmBuffer.writeInt16LE(lInt, i * 4);
  pcmBuffer.writeInt16LE(rInt, i * 4 + 2);
}

console.log(`Encoding with ffmpeg (libmp3lame @ 112kbps)...`);
const ffmpeg = spawn('ffmpeg', [
  '-y',
  '-f', 's16le',
  '-ar', String(SAMPLE_RATE),
  '-ac', '2',
  '-i', 'pipe:0',
  '-codec:a', 'libmp3lame',
  '-b:a', '112k',
  outMp3,
]);

ffmpeg.stdin.write(pcmBuffer);
ffmpeg.stdin.end();

ffmpeg.on('close', (code) => {
  if (code === 0) {
    const stats = fs.statSync(outMp3);
    console.log(`🎉 SUCCESS: Generated compressed menu music: ${outMp3}`);
    console.log(`File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error(`FFmpeg failed with code ${code}`);
    process.exit(1);
  }
});
