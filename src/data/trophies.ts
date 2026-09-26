import { Trophy } from '../types';

export const TROPHIES: Trophy[] = [
  {
    id: 'souls_5',
    title: '🏺 Spasitel dušiček',
    desc: 'Osvoboď celkem alespoň 5 uvězněných dušiček z hastrmanských hrníčků.',
    reward: 60,
    isMet: (meta) => (meta.totalSoulsSaved || 0) >= 5,
    getProgress: (meta) => ({ cur: Math.min(5, meta.totalSoulsSaved || 0), max: 5 }),
  },
  {
    id: 'souls_20',
    title: '✨ Ochránce rybničních tůní',
    desc: 'Osvoboď celkem alespoň 20 dušiček z hrníčků vodníků a topivců.',
    reward: 120,
    isMet: (meta) => (meta.totalSoulsSaved || 0) >= 20,
    getProgress: (meta) => ({ cur: Math.min(20, meta.totalSoulsSaved || 0), max: 20 }),
  },
  {
    id: 'cert_slain',
    title: '👹 Krotitel pekelníků',
    desc: 'Přemož alespoň jednou obávaného bosse Pekelného Čerta.',
    reward: 100,
    isMet: (meta) => (meta.bestiaryKills.cert || 0) >= 1,
    getProgress: (meta) => ({ cur: Math.min(1, meta.bestiaryKills.cert || 0), max: 1 }),
  },
  {
    id: 'hejkal_slain',
    title: '🌲 Vládce půlnočního hvozdu',
    desc: 'Postav se obřímu Půlnočnímu Hejkalovi a pokoř ho v boji.',
    reward: 160,
    isMet: (meta) => (meta.bestiaryKills.hejkal || 0) >= 1,
    getProgress: (meta) => ({ cur: Math.min(1, meta.bestiaryKills.hejkal || 0), max: 1 }),
  },
  {
    id: 'chasnik_rescued',
    title: '🌾 Věrný vesnický soused',
    desc: 'Zachraň alespoň jednou v aréně obklíčeného vesnického chasníka Kubu.',
    reward: 50,
    isMet: (meta) => (meta.totalChasnikSaved || 0) >= 1,
    getProgress: (meta) => ({ cur: Math.min(1, meta.totalChasnikSaved || 0), max: 1 }),
  },
  {
    id: 'chasnik_5',
    title: '🤝 Rychtářův pravý přítel',
    desc: 'Zachraň celkem alespoň 5 vesnických chasníků.',
    reward: 100,
    isMet: (meta) => (meta.totalChasnikSaved || 0) >= 5,
    getProgress: (meta) => ({ cur: Math.min(5, meta.totalChasnikSaved || 0), max: 5 }),
  },
  {
    id: 'survive_dawn',
    title: '🐓 Kohoutí vítěz (Přežití noci)',
    desc: 'Přežij všech 6 minut noci až do ranního kuropění a svítání!',
    reward: 200,
    isMet: (meta) => (meta.highestSurviveTime || 0) >= 360,
    getProgress: (meta) => ({ cur: Math.min(360, Math.floor(meta.highestSurviveTime || 0)), max: 360 }),
  },
  {
    id: 'polednice_slain',
    title: '☀️ Stín srpového žáru',
    desc: 'Přemož alespoň 3 zákeřné Polednice v pravé poledne.',
    reward: 80,
    isMet: (meta) => (meta.bestiaryKills.polednice || 0) >= 3,
    getProgress: (meta) => ({ cur: Math.min(3, meta.bestiaryKills.polednice || 0), max: 3 }),
  },
  {
    id: 'kills_100',
    title: '⚔️ Postrach nočních bubáků',
    desc: 'Přemož v bojích celkem alespoň 100 venkovských strašidel.',
    reward: 80,
    isMet: (meta) => Object.values(meta.bestiaryKills || {}).reduce((a, b) => a + b, 0) >= 100,
    getProgress: (meta) => {
      const sum = Object.values(meta.bestiaryKills || {}).reduce((a, b) => a + b, 0);
      return { cur: Math.min(100, sum), max: 100 };
    },
  },
  {
    id: 'kills_300',
    title: '🏰 Legendární venkovský hrdina',
    desc: 'Přemož v bojích celkem alespoň 300 venkovských strašidel.',
    reward: 200,
    isMet: (meta) => Object.values(meta.bestiaryKills || {}).reduce((a, b) => a + b, 0) >= 300,
    getProgress: (meta) => {
      const sum = Object.values(meta.bestiaryKills || {}).reduce((a, b) => a + b, 0);
      return { cur: Math.min(300, sum), max: 300 };
    },
  },
  {
    id: 'winter_walker',
    title: '❄️ Kráčející vánicí',
    desc: 'Přemož v ladovském mrazu alespoň 5 zimních Meluzín.',
    reward: 60,
    isMet: (meta) => (meta.bestiaryKills.meluzina || 0) >= 5,
    getProgress: (meta) => ({ cur: Math.min(5, meta.bestiaryKills.meluzina || 0), max: 5 }),
  },
  {
    id: 'village_patron',
    title: '🍺 Vesnický mecenáš',
    desc: 'Vylepši alespoň jedno hospodské řemeslo na 3. nebo vyšší úroveň.',
    reward: 80,
    isMet: (meta) =>
      (meta.ovenLevel || 0) >= 3 ||
      (meta.scarecrowLevel || 0) >= 3 ||
      (meta.millLevel || 0) >= 3 ||
      (meta.wallLevel || 0) >= 3 ||
      (meta.regenLevel || 0) >= 3,
    getProgress: (meta) => {
      const max = Math.max(
        meta.ovenLevel || 0,
        meta.scarecrowLevel || 0,
        meta.millLevel || 0,
        meta.wallLevel || 0,
        meta.regenLevel || 0
      );
      return { cur: Math.min(3, max), max: 3 };
    },
  },
];
