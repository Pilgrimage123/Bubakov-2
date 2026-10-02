import { DayPhase } from './types';

export const COLORS = {
  parchment: '#F3E9D2',
  parchmentDark: '#E2D5BA',
  ink: '#111111',
  red: '#D1342B',
  mustard: '#D9A036',
  wood: '#5E3A21',
  woodLight: '#8C5A35',
  woodDark: '#3D2210',
  white: '#EAE3D1',
  water: '#3A76A8',
  green: '#4A633B',
  leafGreen: '#4A633B',
  skin: '#E6B89C',
  grey: '#8A887D',
  stoneGrey: '#8A887D',
  bone: '#D4CEB8',
  ice: '#C4E1F6',
  pineGreen: '#233E2B',
  frostWhite: '#F8F9FA',
  purpleDark: '#2C1D38',
  orangeSunset: '#E06D29',
};

export const DAWN_TIME_SECONDS = 360;

// Day-night phases: Poledne -> Odpoledne -> Soumrak -> Hluboká noc -> Půlnoční hodina -> Kuropění (Svítání)
export const DAY_PHASES: DayPhase[] = [
  {
    id: 'noon',
    name: 'Poledne (12:00)',
    timeRange: [0, 60],
    skyColor: '#F7EDD5',
    ambientTint: 'rgba(255, 240, 210, 0)',
    description: 'Slunce stojí vysoko nad polnostmi. Z horkých mezí vylézá polní havěť a zákeřná Polednice!',
    icon: '☀️',
  },
  {
    id: 'afternoon',
    name: 'Odpoledne (15:00)',
    timeRange: [60, 120],
    skyColor: '#F3E4C0',
    ambientTint: 'rgba(217, 160, 54, 0.08)',
    description: 'Stíny se prodlužují. Z hvozdu vylézají divoženky a k rybníkům míří první hastrmani.',
    icon: '🌤️',
  },
  {
    id: 'dusk',
    name: 'Klekání & Soumrak (18:00)',
    timeRange: [120, 180],
    skyColor: '#E2B18E',
    ambientTint: 'rgba(224, 109, 41, 0.2)',
    description: 'Zvoní klekání! Přichází hrozivá Klekánice a v zápachu síry kráčí Pekelný Čert.',
    icon: '🌅',
    bossSpawns: ['cert'],
  },
  {
    id: 'night',
    name: 'Hluboká noc (21:00)',
    timeRange: [180, 240],
    skyColor: '#30394A',
    ambientTint: 'rgba(25, 33, 49, 0.45)',
    description: 'Tma padla na vesnici. Z márnice vstávají umrlci a ve stodolách hučí strašlivý Bubák.',
    icon: '🌙',
  },
  {
    id: 'midnight',
    name: 'Půlnoční hodina (00:00)',
    timeRange: [240, 360],
    skyColor: '#171D28',
    ambientTint: 'rgba(15, 20, 30, 0.65)',
    description: 'Hodina duchů! Ze staletých hvozdů zařval Půlnoční Hejkal a nastává běsnění!',
    icon: '🕛',
    bossSpawns: ['hejkal'],
  },
  {
    id: 'dawn',
    name: 'Kuropění & Svítání (04:00)',
    timeRange: [DAWN_TIME_SECONDS, 99999],
    skyColor: '#FFEBD2',
    ambientTint: 'rgba(255, 220, 180, 0)',
    description: 'Kohout zakokrhal! Noční mocnosti ztrácejí vládu a strašidla prchají do hrobů a bažin!',
    icon: '🐓',
  },
];

export function getCurrentDayPhase(seconds: number): DayPhase {
  for (let i = DAY_PHASES.length - 1; i >= 0; i--) {
    if (seconds >= DAY_PHASES[i].timeRange[0]) {
      return DAY_PHASES[i];
    }
  }
  return DAY_PHASES[0];
}

// -------------------------------------------------------------
// BODOVÝ SYSTÉM DROPŮ
// Každý zahnaný nepřítel přinese body. Body plní samostatná počítadla a jakmile
// počítadlo překročí práh, padne odpovídající předmět (přebytek se přenáší dál).
// -------------------------------------------------------------
export const ENEMY_POINTS: Record<string, number> = {
  zaba: 10, mysak: 14, rarach: 18, sotek: 20, plivnik: 24, zmrzlik: 25, blatouch: 30, skodnik: 30,
  bludicka: 48, vodnicek: 50, vanicka: 50, skeleton: 52, mrazik: 52, pisar: 63, hrobnik: 69,
  skeleton_scythe: 71, meluzina: 85, divozenka: 87, umrlec: 90, certik: 100, hastrman: 110,
  topivec: 128, ohnivy_muz: 142, stodolnik: 145, cerny_pes: 164, severak: 165, klekanice: 179,
  drevorubec: 182, bubak: 211, polednice: 236, drab: 261, hromotluk: 330, cert: 1540,
  hejkal: 2760, obr: 4600,
  zbojnik: 135, jiskrivec: 95, bila_pani: 185, zbrojnos: 290, snehulak: 220, nocni_mura: 110,
  ohnivy_pes: 175, mlynar: 5500, bezhlavy_rytir: 6800, drak: 9900,
  sazovy_rarach: 68, ropucha: 82, krvavy_kostlivec: 130, obrneny_zbojnik: 240,
};

export const DROP_THRESHOLDS = { chest: 100, potion: 450, bread: 250, soul: 120, coin: 20 };

// Načasování scénky Babičky a Barunky (v sekundách): celková délka a okamžik, kdy se rozlije aura laskavosti
export const GRANNY_CUTSCENE = { duration: 5.6, applyAt: 3.2 };
