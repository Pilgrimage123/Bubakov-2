import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GAME_LEVELS } from '../data/levels';
import { sound } from '../audio';
import { WEAPONS } from '../data/weapons';
import { Lada } from '../render/ladaRenderer';
import { GameIcon } from './GameIcon';
import { HUNTER_UNLOCKS } from '../data/hunterUnlocks';
import { LadaBotanicalFlourish } from './LadaBotanicalFlourish';

export const HUNTER_KEYS = [
  'wanderer',
  'shepherd',
  'korenarka',
  'watchman',
  'sexton',
  'granny',
];

export const ALL_WEAPON_KEYS = [
  'buns',
  'cane',
  'pitchfork',
  'halberd',
  'flail',
  'herbs',
  'snowball',
  'kolac',
  'potato',
  'bees',
  'hromnicka',
  'holywater',
  'cesnekova-topinka',
  'valecnice',
  'kysela-okurka',
  'splaseny_houser',
  'formansky_bic',
];

export const DEFAULT_HERO_WEAPONS: Record<string, { id: string; level: number }[]> = {
  wanderer: [{ id: 'cane', level: 1 }],
  shepherd: [{ id: 'buns', level: 1 }],
  korenarka: [{ id: 'herbs', level: 1 }],
  watchman: [{ id: 'halberd', level: 1 }],
  sexton: [{ id: 'holywater', level: 1 }],
  granny: [{ id: 'kolac', level: 1 }],
};

export const HUNTER_DRAW_MAP: Record<string, any> = {
  wanderer: Lada.drawWanderer,
  shepherd: Lada.drawShepherd,
  korenarka: Lada.drawKorenarka,
  watchman: Lada.drawWatchman,
  sexton: Lada.drawSexton,
  granny: Lada.drawGranny,
};

export const HUNTER_STATS_INFO: Record<string, { hp: number; speed: number; pickup: number; ability: string; role: string }> = {
  wanderer: {
    hp: 200,
    speed: 165,
    pickup: 75,
    ability: 'Pověstná sukovice (21 s)',
    role: 'Všestranný vytrvalec s vysokou kuráží (200), osikovým prutem a tuláckým instinktem (+35 % poškození)',
  },
  shepherd: {
    hp: 110,
    speed: 220,
    pickup: 160,
    ability: 'Dusot stáda (30 s)',
    role: 'Bleskový běžec s velkým dosahem sběru mincí a buchet, přivolává běžící stádo beranů',
  },
  korenarka: {
    hp: 125,
    speed: 180,
    pickup: 105,
    ability: 'Očistné kadidlo (30 s)',
    role: 'Ranhojička s léčivými bylinkami, pasivní regenerací kuráže (+2/4 s) a hojivým sanctuariem',
  },
  watchman: {
    hp: 140,
    speed: 175,
    pickup: 115,
    ability: 'Noční roh a poplach (30 s)',
    role: 'Obrněný strážce noci s kovanou halapartnou a posvěcenou lucernou (stálá svatá aura)',
  },
  sexton: {
    hp: 135,
    speed: 170,
    pickup: 110,
    ability: 'Farní požehnání (35 s)',
    role: 'Pobožný služebník se svěcenou vodou a plošným vymýcením démonů a nemrtvých',
  },
  granny: {
    hp: 130,
    speed: 165,
    pickup: 125,
    ability: 'Chléb se solí a vlídné slovo (45 s)',
    role: 'Laskavá babička s vnučkou Barunkou, kynutým koláčem a zastavením času s nasycením bubáků',
  },
};

export const WEAPON_TYPE_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  food: { label: 'Jídlo', bg: '#D97706', color: '#FFFFFF' },
  physical: { label: 'Fyzické', bg: '#4B5563', color: '#FFFFFF' },
  nature: { label: 'Přírodní', bg: '#15803D', color: '#FFFFFF' },
  ice: { label: 'Mrazivé', bg: '#0284C7', color: '#FFFFFF' },
  holy: { label: 'Svaté', bg: '#CA8A04', color: '#FFFFFF' },
  fire: { label: 'Ohnivé', bg: '#DC2626', color: '#FFFFFF' },
  magic: { label: 'Kouzelné', bg: '#9333EA', color: '#FFFFFF' },
  valecnice: { label: 'Válečnice', bg: '#9A3412', color: '#FFFFFF' },
  garlic: { label: 'Česnek / Aura', bg: '#B45309', color: '#FFFFFF' },
  pickle: { label: 'Kyselé', bg: '#15803D', color: '#FFFFFF' },
};

export type GrandfatherCategoryKey = 'all' | 'passive' | 'folklore' | 'treasure' | 'consumable' | 'synergy';

export interface SandboxGrandfatherUpgradeItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  category: 'passive' | 'folklore' | 'treasure' | 'consumable' | 'synergy';
  categoryLabel: string;
  categoryColor: string;
  statHint: string;
}

export const ALL_GRANDFATHER_UPGRADES: SandboxGrandfatherUpgradeItem[] = [
  // --- 1. Trvalá posílení & pasivky (Passive Stat Upgrades) ---
  {
    id: 'sedmimile_krpce',
    name: 'Sedmimílové krpce',
    icon: '🥾',
    description: '+20 rychlost pohybu za každou úroveň.',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Rychlost',
    categoryColor: '#0284C7',
    statHint: '+20 rychlost / úr.',
  },
  {
    id: 'pytlacka_lucerna',
    name: 'Pytlácká petrolejka',
    icon: '🪔',
    description: '+30 dosahu sběru perníčků i krejcarů za každou úroveň.',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Dosah sběru',
    categoryColor: '#D97706',
    statHint: '+30 dosah sběru / úr.',
  },
  {
    id: 'zaplacovany_kabat',
    name: 'Záplatovaný kabát',
    icon: '🧥',
    description: '+25 maximální Kuráž za každou úroveň.',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Kuráž',
    categoryColor: '#16A34A',
    statHint: '+25 max. Kuráž / úr.',
  },
  {
    id: 'krajac_na_podmasli',
    name: 'Krajáč na podmáslí',
    icon: '🥣',
    description: '+0,6 regenerace Kuráže / s za každou úroveň.',
    maxLevel: 4,
    category: 'passive',
    categoryLabel: 'Regenerace',
    categoryColor: '#059669',
    statHint: '+0,6 reg/s / úr.',
  },
  {
    id: 'podkova_pro_stesti',
    name: 'Podkova pro štěstí',
    icon: '🍀',
    description: '+10 ŠTĚSTÍ za úroveň (lepší kritiky a hodnotnější kořist).',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Štěstí',
    categoryColor: '#CA8A04',
    statHint: '+10 Štěstí / úr.',
  },
  {
    id: 'bylinkova_fajfka',
    name: 'Bylinková fajfka',
    icon: '🪈',
    description: '+1,2 regenerace Kuráže / s a vyfukuje Oblak bylinného dýmu, který zraňuje běsy a léčí lovce.',
    maxLevel: 3,
    category: 'passive',
    categoryLabel: 'Regen & Dým',
    categoryColor: '#059669',
    statHint: '+1,2 reg/s & fajfka',
  },
  {
    id: 'krvave_jelito',
    name: 'Krvavé jelito',
    icon: 'krvave_jelito',
    description: '+15 % trvalé zranění všech úderů a zbraní za každou úroveň.',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Zranění',
    categoryColor: '#B91C1C',
    statHint: '+15 % dmg / úr.',
  },
  {
    id: 'opravdova_kava',
    name: 'Opravdová káva',
    icon: 'opravdova_kava',
    description: '+15 % nabíjení všech zbraní za každou úroveň (rychlejší údery).',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Nabíjení',
    categoryColor: '#78350F',
    statHint: '+15 % nabíjení / úr.',
  },
  {
    id: 'medvedi_mast',
    name: 'Medvědí mast',
    icon: 'medvedi_mast',
    description: '+30 maximální Kuráž i okamžité zhojení za každou úroveň.',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Kuráž',
    categoryColor: '#15803D',
    statHint: '+30 Kuráž & zhojení',
  },
  {
    id: 'maska_medveda',
    name: 'Maska medvěda',
    icon: '🐻',
    description: 'Přeléčení (overheal) Kuráže se udělí jako 50 % zranění nepřátelům do vzdálenosti 230 px. Další vylepšování Masky: všechno léčení Kuráže a maskou udělené zranění větší o 20 %.',
    maxLevel: 4,
    category: 'passive',
    categoryLabel: 'Maska medvěda',
    categoryColor: '#854D0E',
    statHint: '50 % overheal zranění +20 %/úr.',
  },
  {
    id: 'vesela_mysl',
    name: 'Veselá mysl a písnička',
    icon: '🎵',
    description: '+3 Kuráž doplňováno každých 5 s (+0,6 reg/s za úroveň).',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Regenerace',
    categoryColor: '#059669',
    statHint: '+0,6 reg/s / úr.',
  },
  {
    id: 'kynuty_kolac_perk',
    name: 'Pomeranč z Orientu',
    icon: 'pomeranc_z_orientu',
    description: '+25 maximální Kuráž i okamžité posílení za každou úroveň.',
    maxLevel: 5,
    category: 'passive',
    categoryLabel: 'Kuráž',
    categoryColor: '#EA580C',
    statHint: '+25 max. Kuráž / úr.',
  },

  // --- 2. Folklórní posvěcení & mechaniky (Folklore Blessings) ---
  {
    id: 'trikralova_krida',
    name: 'Posvěcená tříkrálová křída',
    icon: '🖍️',
    description: 'Při zastavení nakreslí ochranný kruh: odrazí nemrtvé i čerty a sníží utržené zranění o 20 % za úroveň.',
    maxLevel: 3,
    category: 'folklore',
    categoryLabel: 'Ochranný kruh',
    categoryColor: '#CA8A04',
    statHint: '-20 % zranění v kruhu / úr.',
  },
  {
    id: 'strouhany_kren',
    name: 'Strouhaný křen v ubrousku',
    icon: '🫚',
    description: '-25 % odolnost bubáků vůči jídlu a +15 % poškození do mlsajících cílů za úroveň.',
    maxLevel: 4,
    category: 'folklore',
    categoryLabel: 'Mlsání',
    categoryColor: '#16A34A',
    statHint: '-25 % jídlo resist, +15 % mls dmg',
  },
  {
    id: 'poutove_srdce',
    name: 'Pouťové perníkové srdce',
    icon: '💝',
    description: 'Sebrané perníčky okamžitě dobíjejí schopnost (+0,2 s / +0,6 s / +2 s k nabití) a obří perníčky navíc zhojí 8 Kuráže.',
    maxLevel: 4,
    category: 'folklore',
    categoryLabel: 'Perníčky',
    categoryColor: '#DB2777',
    statHint: 'Dobíjení & zhojení 8 Kuráže',
  },
  {
    id: 'ulezely_syrecek',
    name: 'Uleželý syreček v kapse',
    icon: '🧀',
    description: 'Při nápřahu nepřítele v těsné blízkosti ho závan ze syrečku na 4 s vyčerpá (poloviční rychlost i útok).',
    maxLevel: 3,
    category: 'folklore',
    categoryLabel: 'Vyčerpání běsů',
    categoryColor: '#EAB308',
    statHint: '-50 % rychlost i útok běsů',
  },
  {
    id: 'pivni_tacek',
    name: 'Pivní tácek s čárkami',
    icon: '🍺',
    description: 'Při pití piva, kořalky či cikorky vypadnou krejcary z 8 běsů a propůjčí +35 % rychlost nabíjení na 6 s.',
    maxLevel: 4,
    category: 'folklore',
    categoryLabel: 'Hospodský buff',
    categoryColor: '#B45309',
    statHint: 'Mince z běsů & +35 % nabíjení',
  },
  {
    id: 'bezedny_krajac_povidel',
    name: 'Bezedný krajáč povidel',
    icon: '🍯',
    description: 'Bubákům zalepí paty (-20 % poise) a po zahnání zanechají zpomalující povidlovou louži.',
    maxLevel: 4,
    category: 'folklore',
    categoryLabel: 'Povidla & Louže',
    categoryColor: '#7C2D12',
    statHint: 'Zpomalující louže & snížení poise',
  },
  {
    id: 'zvonek_zatoulane_kozy',
    name: 'Zvonek ze zatoulané kozy',
    icon: '🔔',
    description: 'Každé 4 s běhu cinkne: vyruší nápřah blízkých strašidel a přitáhne okolní perníčky i krejcary.',
    maxLevel: 4,
    category: 'folklore',
    categoryLabel: 'Cinknutí & Rušení',
    categoryColor: '#CA8A04',
    statHint: 'Ruší nápřah & pulzní magnet',
  },
  {
    id: 'babicciny_kousave_fusekle',
    name: 'Babiččiny kousavé fusekle',
    icon: '🧦',
    description: '+15 rychlost pohybu, plná imunita na led a mráz a v pohybu o 12 % rychlejší útoky.',
    maxLevel: 4,
    category: 'folklore',
    categoryLabel: 'Mrazuvzdornost',
    categoryColor: '#0284C7',
    statHint: '+15 spd, ledová imunita, +12 % kadence',
  },
  {
    id: 'arcivzacny_ananas',
    name: 'Arcivzácný ananas',
    icon: '🍍',
    description: '+30 % max. Kuráž i rychlost, plně doplní Kuráž a daruje 10 s nezranitelnost.',
    maxLevel: 2,
    category: 'folklore',
    categoryLabel: 'Císařský klenot',
    categoryColor: '#F59E0B',
    statHint: '+30 % Kuráž i rychlost & nesmrtelnost',
  },

  // --- 3. Vzácné předměty & okamžité poklady (Instant Utility & Treasures) ---
  {
    id: 'ponocny_horn',
    name: 'Trouba obecního ponocného',
    icon: '📯',
    description: 'Zastaví čas a zmrazí všechna strašidla i nepřátelské střely na 5 sekund.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Zastavení času',
    categoryColor: '#0284C7',
    statHint: '5 s úplné zmrazení času',
  },
  {
    id: 'masopust_rattle',
    name: 'Masopustní řehtačka',
    icon: '🪇',
    description: 'Smete řadová strašidla, bossům odebere 35 % zdraví a vytvoří rázový štít na 2 s.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Masopustní smršť',
    categoryColor: '#DC2626',
    statHint: 'Plošné smetení & 35 % boss dmg',
  },
  {
    id: 'babicka_apron',
    name: 'Babiččina kropenatá zástěra',
    icon: '🧺',
    description: 'V mžiku přitáhne všechny perníčky i kořist z celé mapy a zhojí 15 Kuráže.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Globální magnet',
    categoryColor: '#2563EB',
    statHint: 'Okamžitý sběr a +15 Kuráže',
  },
  {
    id: 'slivovice_splash',
    name: 'Hlt slivovice z modrého džbánku',
    icon: '🏺',
    description: 'Vyčistí postihy, omráčí nepřátele v 180° oblouku na 4,5 s a zapálí střely modrým plamenem.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Slivovice',
    categoryColor: '#9333EA',
    statHint: '4,5 s stun oblouk & modrý oheň',
  },
  {
    id: 'svanda_bagpipes',
    name: 'Dudácká čertovská skočná',
    icon: '🎶',
    description: 'Přinutí strašidla bít se mezi sebou na 6 s a zdvojnásobí vypadávající kořist.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Rozpoutání rvačky',
    categoryColor: '#EA580C',
    statHint: '6 s vzájemný boj strašidel',
  },
  {
    id: 'kominik_button',
    name: 'Kominický knoflík pro štěstí',
    icon: '🔘',
    description: '7 s úplné nehmotnosti a zaručených maximálních kritických zásahů, sazemi oslepí nepřátele.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Štěstí & Nehmotnost',
    categoryColor: '#CA8A04',
    statHint: '7 s nehmotnost & jisté kritiky',
  },
  {
    id: 'kovarska_podkova',
    name: 'Kovářská podkova',
    icon: '🧲',
    description: 'V mžiku přitáhne všechny perníčky, krejcary i dušičky a na 5 s zdvojnásobí Štěstí.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Magnet kořisti',
    categoryColor: '#D97706',
    statHint: 'Přitáhne kořist a 2x Štěstí',
  },
  {
    id: 'hlineny_kohoutek',
    name: 'Hliněný kohoutek',
    icon: '🐓',
    description: 'Ranní zakokrhání smete běžná strašidla, bossům udělí 650 svatého poškození a vystraší přeživší na 3 s.',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Rozbřesk',
    categoryColor: '#EAB308',
    statHint: 'Smetení havěti, 650 svatý dmg & strach',
  },
  {
    id: 'vyrezavane_kukacky',
    name: 'Vyřezávané kukačky',
    icon: '⏰',
    description: 'Zastaví čas na 4 sekundy a popožene krok lovce (+40 rychlost pohybu).',
    maxLevel: 10,
    category: 'treasure',
    categoryLabel: 'Zastavení času',
    categoryColor: '#0284C7',
    statHint: '4 s mráz času & +40 rychlost',
  },
  {
    id: 'tepla_cikorka',
    name: 'Teplá cikorka',
    icon: 'tepla_cikorka',
    description: '+30 okamžité doplnění Kuráže loveckým nápojem.',
    maxLevel: 10,
    category: 'consumable',
    categoryLabel: 'Doplnění Kuráže',
    categoryColor: '#16A34A',
    statHint: '+30 Kuráž',
  },
  {
    id: 'zejdlik_piva',
    name: 'Žejdlík piva',
    icon: 'zejdlik_piva',
    description: '+40 okamžité doplnění Kuráže poctivým ležákem.',
    maxLevel: 10,
    category: 'consumable',
    categoryLabel: 'Doplnění Kuráže',
    categoryColor: '#16A34A',
    statHint: '+40 Kuráž',
  },
  {
    id: 'panak_koralky',
    name: 'Panák kořalky',
    icon: 'panak_koralky',
    description: '+55 okamžité doplnění Kuráže ostrou pálenkou.',
    maxLevel: 10,
    category: 'consumable',
    categoryLabel: 'Doplnění Kuráže',
    categoryColor: '#16A34A',
    statHint: '+55 Kuráž',
  },
  {
    id: 'pekeln_poklad_drobny',
    name: 'Pekelný měšec',
    icon: 'pekeln_poklad_drobny',
    description: 'Dědeček ti hned vyplatí 40 krejcarů do měšce.',
    maxLevel: 10,
    category: 'consumable',
    categoryLabel: 'Krejcary',
    categoryColor: '#CA8A04',
    statHint: '+40 krejcarů / úr.',
  },
  {
    id: 'pekeln_poklad_stribrny',
    name: 'Pekelný stříbrňák',
    icon: 'pekeln_poklad_stribrny',
    description: 'Dědeček ti hned vyplatí 100 krejcarů do měšce.',
    maxLevel: 10,
    category: 'consumable',
    categoryLabel: 'Krejcary',
    categoryColor: '#CA8A04',
    statHint: '+100 krejcarů / úr.',
  },
  {
    id: 'pekeln_poklad_zlaty',
    name: 'Pekelný tolar z pekla',
    icon: 'pekeln_poklad_zlaty',
    description: 'Dědeček ti hned vyplatí 250 krejcarů do měšce.',
    maxLevel: 10,
    category: 'consumable',
    categoryLabel: 'Krejcary',
    categoryColor: '#CA8A04',
    statHint: '+250 krejcarů / úr.',
  },

  // --- 4. Synergická vylepšení zbraní z nůše (Synergistic Upgrades) ---
  {
    id: 'pickle_flood',
    name: 'Záplava okurek',
    icon: 'kysela_okurka',
    description: '+130 % projektilů, -30 % poškození. Pokryje bojiště salvou drobnějších okurek.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Kyselá okurka',
    categoryColor: '#15803D',
    statHint: '+130 % okurek, -30 % dmg',
  },
  {
    id: 'pickle_crunch',
    name: 'Kyselý koncentrát',
    icon: 'kysela_okurka',
    description: '+55 % poškození, -10 % cooldown. Silný výpad těžkými křupavými okurkami.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Kyselá okurka',
    categoryColor: '#15803D',
    statHint: '+55 % dmg, -10 % cooldown',
  },
  {
    id: 'cane_whirl',
    name: 'Proutěný vír',
    icon: 'osikovy_prut',
    description: '+40 % dosah švihu, -15 % cooldown, -20 % poškození.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Osikový prut',
    categoryColor: '#B45309',
    statHint: '+40 % dosah, -15 % cooldown',
  },
  {
    id: 'cane_heavy',
    name: 'Bukový mlat',
    icon: 'osikovy_prut',
    description: '+65 % poškození, +50 % odhození, +15 % cooldown.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Osikový prut',
    categoryColor: '#B45309',
    statHint: '+65 % dmg, +50 % odhození',
  },
  {
    id: 'buns_generosity',
    name: 'Cukrářská štědrost',
    icon: 'czech_buchta',
    description: '+120 % buchet v salvě, -30 % doba mlsání.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Povidlové buchty',
    categoryColor: '#D97706',
    statHint: '+120 % buchet, -30 % mlsání',
  },
  {
    id: 'buns_dense',
    name: 'Hutné povidlí',
    icon: 'czech_buchta',
    description: '+50 % poškození, +40 % trvání mlsání, -10 % cooldown.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Povidlové buchty',
    categoryColor: '#D97706',
    statHint: '+50 % dmg, +40 % mlsání',
  },
  {
    id: 'valecnice_orbit',
    name: 'Rychlé válení',
    icon: 'valecnice',
    description: '+40 % dosah oběhu, -20 % cooldown, -15 % poškození.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Válečnice',
    categoryColor: '#9A3412',
    statHint: '+40 % oběh, -20 % cooldown',
  },
  {
    id: 'valecnice_strike',
    name: 'Rázný váleček',
    icon: 'valecnice',
    description: '+60 % poškození, +30 % odhození.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Válečnice',
    categoryColor: '#9A3412',
    statHint: '+60 % dmg, +30 % odhození',
  },
  {
    id: 'pitchfork_spread',
    name: 'Trojitý bodec',
    icon: '🔱',
    description: '+100 % hrotů (širší vějíř), -25 % poškození.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Kovářské vidle',
    categoryColor: '#4B5563',
    statHint: '+100 % hrotů vidlí',
  },
  {
    id: 'pitchfork_pierce',
    name: 'Kalená ocel',
    icon: '🔱',
    description: '+60 % poškození, +2 průraz, -12 % cooldown.',
    maxLevel: 1,
    category: 'synergy',
    categoryLabel: 'Kovářské vidle',
    categoryColor: '#4B5563',
    statHint: '+60 % dmg, +2 průraz, -12 % CD',
  },
];

export interface TestModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTestRun: (
    hero: any,
    levelId: any,
    weapons: any[],
    grandfatherUpgrades?: Record<string, number>
  ) => void;
  initialLevelId?: number;
  onOpenGrandfatherShop?: () => void;
}

export const TestModeModal: React.FC<TestModeModalProps> = ({
  isOpen,
  onClose,
  onStartTestRun,
  initialLevelId = 1,
  onOpenGrandfatherShop,
}) => {
  const [selectedHero, setSelectedHero] = useState<string>('wanderer');
  const [selectedLevel, setSelectedLevel] = useState<number>(initialLevelId);
  const [activeTab, setActiveTab] = useState<'hero' | 'level' | 'weapons' | 'grandfather'>('hero');

  // Weapons configuration (level 0 to 10)
  const [weaponConfig, setWeaponConfig] = useState<Record<string, { selected: boolean; level: number }>>(() => {
    const init: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      init[key] = { selected: false, level: 0 };
    });
    DEFAULT_HERO_WEAPONS.wanderer.forEach((w) => {
      init[w.id] = { selected: true, level: w.level };
    });
    return init;
  });

  // Grandfather upgrades configuration (level 0 to X)
  const [grandfatherConfig, setGrandfatherConfig] = useState<Record<string, { selected: boolean; level: number }>>(() => {
    const init: Record<string, { selected: boolean; level: number }> = {};
    ALL_GRANDFATHER_UPGRADES.forEach((u) => {
      init[u.id] = { selected: false, level: 0 };
    });
    return init;
  });

  const [grandfatherCategoryFilter, setGrandfatherCategoryFilter] = useState<GrandfatherCategoryKey>('all');
  const [grandfatherSearchQuery, setGrandfatherSearchQuery] = useState<string>('');

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  useEffect(() => {
    if (!isOpen) return;
    let animId: number;
    const start = performance.now();
    const loop = (now: number) => {
      const elapsed = (now - start) / 1000;
      HUNTER_KEYS.forEach((hKey) => {
        const cvs = canvasRefs.current[hKey];
        if (cvs) {
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            const drawFn = HUNTER_DRAW_MAP[hKey];
            if (drawFn) drawFn.call(Lada, ctx, cvs.width / 2, cvs.height * 0.72, elapsed, 0, 0, false, 0.95);
          }
        }
      });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen]);

  // --- WEAPON HANDLERS ---
  const applyHeroDefaultWeapons = (heroType: string) => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      nextConfig[key] = { selected: false, level: 0 };
    });
    (DEFAULT_HERO_WEAPONS[heroType] || [{ id: 'buns', level: 1 }]).forEach((w) => {
      nextConfig[w.id] = { selected: true, level: w.level };
    });
    setWeaponConfig(nextConfig);
    sound.coin();
  };

  const applyAllWeaponsLevel = (level: number) => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      nextConfig[key] = { selected: level > 0, level };
    });
    setWeaponConfig(nextConfig);
    sound.coin();
  };

  const clearAllWeapons = () => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_WEAPON_KEYS.forEach((key) => {
      nextConfig[key] = { selected: false, level: 0 };
    });
    setWeaponConfig(nextConfig);
    sound.coin();
  };

  const toggleWeapon = (id: string) => {
    setWeaponConfig((cur) => {
      const prev = cur[id] || { selected: false, level: 0 };
      const nextSel = !prev.selected;
      return {
        ...cur,
        [id]: {
          selected: nextSel,
          level: nextSel ? (prev.level > 0 ? prev.level : 1) : 0,
        },
      };
    });
    sound.coin();
  };

  const changeWeaponLevel = (id: string, delta: number) => {
    setWeaponConfig((cur) => {
      const currentLevel = cur[id]?.level ?? (cur[id]?.selected ? 1 : 0);
      const nextLevel = Math.max(0, Math.min(10, currentLevel + delta));
      return {
        ...cur,
        [id]: {
          selected: nextLevel > 0,
          level: nextLevel,
        },
      };
    });
    sound.coin();
  };

  const setWeaponToZero = (id: string) => {
    setWeaponConfig((cur) => ({
      ...cur,
      [id]: { selected: false, level: 0 },
    }));
    sound.coin();
  };

  // --- GRANDFATHER UPGRADES HANDLERS ---
  const toggleGrandfatherUpgrade = (id: string) => {
    const item = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === id);
    if (!item) return;
    setGrandfatherConfig((cur) => {
      const prev = cur[id] || { selected: false, level: 0 };
      const nextSel = !prev.selected;
      return {
        ...cur,
        [id]: {
          selected: nextSel,
          level: nextSel ? (prev.level > 0 ? prev.level : 1) : 0,
        },
      };
    });
    sound.coin();
  };

  const changeGrandfatherLevel = (id: string, delta: number) => {
    const item = ALL_GRANDFATHER_UPGRADES.find((u) => u.id === id);
    if (!item) return;
    setGrandfatherConfig((cur) => {
      const currentLevel = cur[id]?.level ?? (cur[id]?.selected ? 1 : 0);
      const nextLevel = Math.max(0, Math.min(item.maxLevel, currentLevel + delta));
      return {
        ...cur,
        [id]: {
          selected: nextLevel > 0,
          level: nextLevel,
        },
      };
    });
    sound.coin();
  };

  const setGrandfatherToZero = (id: string) => {
    setGrandfatherConfig((cur) => ({
      ...cur,
      [id]: { selected: false, level: 0 },
    }));
    sound.coin();
  };

  const setAllGrandfatherPreset = (preset: 'clear' | 'passives_1' | 'passives_max' | 'all_max') => {
    const nextConfig: Record<string, { selected: boolean; level: number }> = {};
    ALL_GRANDFATHER_UPGRADES.forEach((item) => {
      if (preset === 'clear') {
        nextConfig[item.id] = { selected: false, level: 0 };
      } else if (preset === 'passives_1') {
        const isPassive = item.category === 'passive' || item.category === 'folklore';
        nextConfig[item.id] = {
          selected: isPassive,
          level: isPassive ? 1 : 0,
        };
      } else if (preset === 'passives_max') {
        const isPassive = item.category === 'passive' || item.category === 'folklore';
        nextConfig[item.id] = {
          selected: isPassive,
          level: isPassive ? item.maxLevel : 0,
        };
      } else if (preset === 'all_max') {
        nextConfig[item.id] = {
          selected: true,
          level: item.maxLevel,
        };
      }
    });
    setGrandfatherConfig(nextConfig);
    sound.coin();
  };

  const selectedWeaponsList = ALL_WEAPON_KEYS
    .filter((k) => weaponConfig[k]?.selected && (weaponConfig[k]?.level ?? 0) > 0)
    .map((k) => ({
      id: k,
      level: weaponConfig[k]?.level || 1,
    }));

  const selectedGrandfatherList = ALL_GRANDFATHER_UPGRADES
    .filter((u) => grandfatherConfig[u.id]?.selected && (grandfatherConfig[u.id]?.level ?? 0) > 0)
    .map((u) => ({
      id: u.id,
      name: u.name,
      level: grandfatherConfig[u.id]?.level || 1,
      maxLevel: u.maxLevel,
    }));

  // Filtered grandfather upgrades list for display
  const filteredGrandfatherUpgrades = useMemo(() => {
    const query = grandfatherSearchQuery.trim().toLowerCase();
    return ALL_GRANDFATHER_UPGRADES.filter((item) => {
      if (grandfatherCategoryFilter !== 'all' && item.category !== grandfatherCategoryFilter) {
        return false;
      }
      if (query.length > 0) {
        const matchName = item.name.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCategory = item.categoryLabel.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchCategory) return false;
      }
      return true;
    });
  }, [grandfatherCategoryFilter, grandfatherSearchQuery]);

  const handleStart = () => {
    if (selectedWeaponsList.length === 0) {
      sound.hit();
      return;
    }
    sound.cheer();
    const grandfatherPayload: Record<string, number> = {};
    for (const item of selectedGrandfatherList) {
      grandfatherPayload[item.id] = item.level;
    }
    onStartTestRun(selectedHero, selectedLevel, selectedWeaponsList, grandfatherPayload);
  };

  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      style={{
        zIndex: 45,
        background: 'rgba(20, 15, 10, 0.92)',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.coin();
          onClose();
        }
      }}
    >
      <div
        className="panel"
        style={{
          maxWidth: '1020px',
          width: '96%',
          maxHeight: '92vh',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 24px',
          background: 'var(--wood-light)',
          border: '4px solid var(--ink)',
          position: 'relative',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🧪</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.9rem',
                  color: '#FDE047',
                  letterSpacing: '1px',
                  textShadow: '2px 2px 0px var(--ink)',
                }}
              >
                TESTOVACÍ MÓD (SANDBOX)
              </h2>
            </div>
            <LadaBotanicalFlourish height={16} />
            <p
              style={{
                margin: '2px 0 0 0',
                fontWeight: 800,
                fontSize: '0.94rem',
                color: '#FEF3C7',
              }}
            >
              Vyzkoušejte libovolného hrdinu na kterékoliv mapě s libovolnými zbraněmi a všemi upgrady z dědečkovy nůše na úrovni 0-X!
            </p>
          </div>
          <button
            onClick={() => {
              sound.coin();
              onClose();
            }}
            style={{
              background: '#D1342B',
              color: '#FFFFFF',
              border: '2px solid var(--ink)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '1.1rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--ink)',
            }}
            title="Zavřít"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            margin: '8px 0 14px 0',
            borderBottom: '3px solid var(--ink)',
            paddingBottom: '8px',
            flexWrap: 'wrap',
          }}
        >
          {/* TAB 1: HERO */}
          <button
            className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('hero');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
            }}
          >
            <span>👤 1. Hrdina:</span>
            <strong>{HUNTER_UNLOCKS[selectedHero]?.realName || 'Poutník'}</strong>
          </button>

          {/* TAB 2: LEVEL */}
          <button
            className={`tab-btn ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('level');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
            }}
          >
            <span>🗺️ 2. Úroveň:</span>
            <strong>Úr. {selectedLevel} ({GAME_LEVELS[selectedLevel]?.shortTitle})</strong>
          </button>

          {/* TAB 3: WEAPONS */}
          <button
            className={`tab-btn ${activeTab === 'weapons' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('weapons');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
            }}
          >
            <span>🗡️ 3. Startovní zbraně:</span>
            <strong>{selectedWeaponsList.length} vybráno</strong>
          </button>

          {/* TAB 4: GRANDFATHER'S KNAPSACK UPGRADES (LEVEL 0-X) */}
          <button
            className={`tab-btn ${activeTab === 'grandfather' ? 'active' : ''}`}
            onClick={() => {
              sound.coin();
              setActiveTab('grandfather');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 900,
              fontSize: '0.96rem',
              background: activeTab === 'grandfather' ? '#FDE047' : 'var(--parchment)',
              color: 'var(--ink)',
            }}
          >
            <span>🧺 4. Dědečkova nůše (0-X):</span>
            <strong style={{ color: selectedGrandfatherList.length > 0 ? '#15803D' : '#991B1B' }}>
              {selectedGrandfatherList.length} aktivních
            </strong>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '6px',
            minHeight: 0,
          }}
        >
          {/* TAB 1: HERO SELECTION */}
          {activeTab === 'hero' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FEF3C7' }}>
                  Zvolte si hrdinu pro testování (odemčeni jsou všichni):
                </span>
                <button
                  className="lada-btn btn-small"
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    padding: '4px 10px',
                    background: '#15803D',
                    color: '#FFFFFF',
                  }}
                  onClick={() => applyHeroDefaultWeapons(selectedHero)}
                  title="Nastaví startovní zbraně podle zvoleného hrdiny"
                >
                  🎯 Nastavit výchozí zbraně hrdiny
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                  gap: '12px',
                }}
              >
                {HUNTER_KEYS.map((hKey) => {
                  const isSelected = selectedHero === hKey;
                  const hunterDef = HUNTER_UNLOCKS[hKey];
                  const stats = HUNTER_STATS_INFO[hKey];
                  return (
                    <div
                      key={hKey}
                      onClick={() => {
                        sound.coin();
                        setSelectedHero(hKey);
                      }}
                      style={{
                        background: isSelected ? '#FEF3C7' : 'var(--parchment)',
                        border: isSelected ? '4px solid #16A34A' : '3px solid var(--ink)',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(22, 163, 74, 0.4), 5px 5px 0px var(--ink)'
                          : '4px 4px 0px var(--ink)',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        textAlign: 'left',
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#16A34A',
                            color: '#FFFFFF',
                            border: '2px solid var(--ink)',
                            borderRadius: '6px',
                            padding: '2px 7px',
                            fontSize: '0.75rem',
                            fontWeight: 900,
                          }}
                        >
                          ✓ ZVOLENO
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: '#EAE3D1',
                            border: '3px solid var(--ink)',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <canvas
                            ref={(el) => {
                              canvasRefs.current[hKey] = el;
                            }}
                            width={90}
                            height={90}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1.25rem', color: '#111111', fontWeight: 900 }}>
                            {hunterDef?.realName}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: '#78350F', fontWeight: 800, marginBottom: '4px' }}>
                            {hunterDef?.realTitle}
                          </div>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              color: '#111111',
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span>🦁 {stats.hp} Kuráž</span>
                            <span>👟 {stats.speed}</span>
                            <span>🧲 {stats.pickup}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: '8px',
                          background: 'rgba(0,0,0,0.05)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          lineHeight: 1.3,
                        }}
                      >
                        <div style={{ fontWeight: 900, color: '#B45309' }}>⚡ {stats.ability}</div>
                        <div style={{ marginTop: '2px', color: '#374151' }}>{stats.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LEVEL SELECTION */}
          {activeTab === 'level' && (
            <div>
              <div
                style={{
                  marginBottom: '10px',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  color: '#FEF3C7',
                }}
              >
                Zvolte si stage pro testování (přístupných je všech 7 úrovní včetně bossů):
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                  gap: '12px',
                }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((lvlId) => {
                  const lvl = GAME_LEVELS[lvlId];
                  const isSelected = selectedLevel === lvlId;
                  return (
                    <div
                      key={lvlId}
                      onClick={() => {
                        sound.coin();
                        setSelectedLevel(lvlId);
                      }}
                      style={{
                        background: isSelected ? '#FEF3C7' : 'var(--parchment)',
                        border: isSelected ? '4px solid #16A34A' : '3px solid var(--ink)',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        boxShadow: isSelected
                          ? '0 0 16px rgba(22, 163, 74, 0.4), 5px 5px 0px var(--ink)'
                          : '4px 4px 0px var(--ink)',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                        textAlign: 'left',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <span
                          style={{
                            background: isSelected ? '#16A34A' : 'var(--wood-dark)',
                            color: '#FFFFFF',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.78rem',
                            fontWeight: 900,
                          }}
                        >
                          {isSelected ? '✓ ZVOLENO' : `Úroveň ${lvlId + 1}`}
                        </span>
                        <span style={{ fontSize: '1.25rem' }}>{lvl.icon}</span>
                      </div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '1.18rem', fontWeight: 900, color: '#111111' }}>
                        {lvl.name}
                      </h4>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#78350F', marginBottom: '6px' }}>
                        {lvl.subtitle}
                      </div>
                      <p
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: '0.8rem',
                          lineHeight: 1.3,
                          fontWeight: 700,
                          color: '#1F2937',
                        }}
                      >
                        {lvl.description}
                      </p>
                      <div
                        style={{
                          background: 'rgba(209, 52, 43, 0.12)',
                          border: '1.5px solid #D1342B',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: '#991B1B',
                        }}
                      >
                        👑 Velký boss: <strong>{lvl.finalBoss.name}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WEAPONS SELECTION (LEVEL 0-10) */}
          {activeTab === 'weapons' && (
            <div>
              <div
                style={{
                  background: 'var(--parchment)',
                  border: '3px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontWeight: 900, fontSize: '0.94rem', color: '#111111' }}>
                  ⚡ Rychlé předvolby arzenálu:
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#3D2210', color: '#FEF3C7' }}
                    onClick={() => applyHeroDefaultWeapons(selectedHero)}
                    title="Nastaví výchozí startovní zbraně podle vybraného hrdiny"
                  >
                    🎯 Dle hrdiny
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#2563EB', color: '#FFFFFF' }}
                    onClick={() => applyAllWeaponsLevel(1)}
                  >
                    ⚔️ Všechny (Úr. 1)
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#EA580C', color: '#FFFFFF' }}
                    onClick={() => applyAllWeaponsLevel(5)}
                  >
                    🔥 Všechny (Úr. 5 – MAX)
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#7C3AED', color: '#FFFFFF' }}
                    onClick={() => applyAllWeaponsLevel(10)}
                  >
                    👑 Božský arzenál (Úr. 10)
                  </button>
                  <button
                    className="lada-btn btn-small"
                    style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#6B7280', color: '#FFFFFF' }}
                    onClick={clearAllWeapons}
                    title="Vynuluje všechny zbraně na úroveň 0 (pro čistý výběr)"
                  >
                    🧹 Vynulovat vše
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                  gap: '10px',
                }}
              >
                {ALL_WEAPON_KEYS.map((wId) => {
                  const wDef = WEAPONS[wId];
                  if (!wDef) return null;
                  const cfg = weaponConfig[wId] || { selected: false, level: 0 };
                  const isSel = cfg.level > 0 && cfg.selected;
                  const typeTag = WEAPON_TYPE_LABELS[wDef.type] || {
                    label: wDef.type,
                    bg: '#4B5563',
                    color: '#FFFFFF',
                  };
                  const estDmg = cfg.level > 0 ? Math.round(wDef.baseDmg + (cfg.level - 1) * 5) : 0;
                  return (
                    <div
                      key={wId}
                      style={{
                        background: isSel ? '#FEF3C7' : '#EFE7D5',
                        border: isSel ? '3px solid #16A34A' : '2px solid #5C3D28',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        color: 'var(--ink)',
                        boxShadow: isSel ? '0 0 10px rgba(22, 163, 74, 0.25), 3px 3px 0 var(--ink)' : '2px 2px 0 var(--ink)',
                        textAlign: 'left',
                        opacity: cfg.level === 0 ? 0.78 : 1,
                        transition: 'all 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleWeapon(wId)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#16A34A',
                            }}
                          />
                          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            <GameIcon icon={wDef.icon} size={22} />
                          </span>
                          <div>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: '0.98rem',
                                color: cfg.level === 0 ? '#4B5563' : '#111111',
                                lineHeight: 1.2,
                              }}
                            >
                              {wDef.name}
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                background: typeTag.bg,
                                color: typeTag.color,
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                marginTop: '2px',
                              }}
                            >
                              {typeTag.label}
                            </span>
                          </div>
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: isSel ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                            border: '2px solid var(--ink)',
                            borderRadius: '6px',
                            padding: '2px 4px',
                          }}
                        >
                          <button
                            onClick={() => setWeaponToZero(wId)}
                            disabled={cfg.level <= 0}
                            style={{
                              width: '22px',
                              height: '24px',
                              background: cfg.level <= 0 ? '#E5E7EB' : '#FEE2E2',
                              color: cfg.level <= 0 ? '#9CA3AF' : '#DC2626',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level <= 0 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.76rem',
                            }}
                            title="Vynulovat na úroveň 0 (lovec se zbraní nezačne)"
                          >
                            0
                          </button>
                          <button
                            onClick={() => changeWeaponLevel(wId, -1)}
                            disabled={cfg.level <= 0}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: cfg.level <= 0 ? '#E5E7EB' : '#D1342B',
                              color: cfg.level <= 0 ? '#9CA3AF' : '#FFFFFF',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level <= 0 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                            title="Snížit úroveň zbraně (až na 0 = zbraň neaktivní)"
                          >
                            -
                          </button>
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: '0.85rem',
                              minWidth: '48px',
                              textAlign: 'center',
                              color: cfg.level > 0 ? (isSel ? '#111111' : '#4B5563') : '#DC2626',
                            }}
                          >
                            {cfg.level === 0 ? 'Úr. 0' : `Úr. ${cfg.level}`}
                          </span>
                          <button
                            onClick={() => changeWeaponLevel(wId, 1)}
                            disabled={cfg.level >= 10}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: cfg.level >= 10 ? '#E5E7EB' : '#16A34A',
                              color: cfg.level >= 10 ? '#9CA3AF' : '#FFFFFF',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level >= 10 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                            title="Zvýšit úroveň zbraně (až na úroveň 10)"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: cfg.level === 0 ? '#DC2626' : '#4B5563',
                          fontWeight: 700,
                          lineHeight: 1.25,
                        }}
                      >
                        {cfg.level === 0
                          ? '💤 Úroveň 0 – lovec s touto zbraní nezačíná'
                          : `💥 Zásah: ~${estDmg} | ⏱️ Kadence: ${wDef.baseCd} s`}
                        {wDef.desc && (
                          <div
                            style={{
                              fontSize: '0.71rem',
                              color: '#5C3D28',
                              fontStyle: 'italic',
                              marginTop: '2px',
                              lineHeight: 1.2,
                            }}
                          >
                            {wDef.desc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DĚDEČKOVA NŮŠE UPGRADES (LEVEL 0-X) */}
          {activeTab === 'grandfather' && (
            <div>
              {/* TOOLBAR: PRESETS & SEARCH */}
              <div
                style={{
                  background: 'var(--parchment)',
                  border: '3px solid var(--ink)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🧺</span>
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#111111' }}>
                        Upgrady a poklady z Dědečkovy nůše:
                      </strong>
                      <div style={{ fontSize: '0.78rem', color: '#78350F', fontWeight: 800 }}>
                        Vyberte si startovní úroveň od 0 (vypnuto) až po maximum (X) pro každé vylepšení!
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      className="lada-btn btn-small"
                      style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#0284C7', color: '#FFFFFF' }}
                      onClick={() => setAllGrandfatherPreset('passives_1')}
                      title="Nastaví všechna pasivní a folklórní posílení na úroveň 1"
                    >
                      ⚡ Pasivky (Úr. 1)
                    </button>
                    <button
                      className="lada-btn btn-small"
                      style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#EA580C', color: '#FFFFFF' }}
                      onClick={() => setAllGrandfatherPreset('passives_max')}
                      title="Nastaví všechna pasivní a folklórní posílení na jejich maximální úroveň"
                    >
                      🔥 Pasivky (MAX)
                    </button>
                    <button
                      className="lada-btn btn-small"
                      style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#7C3AED', color: '#FFFFFF' }}
                      onClick={() => setAllGrandfatherPreset('all_max')}
                      title="Nastaví naprosto všechna vylepšení, posvěcení i synergie na MAX!"
                    >
                      👑 Plná nůše (Vše MAX)
                    </button>
                    <button
                      className="lada-btn btn-small"
                      style={{ margin: 0, padding: '4px 8px', fontSize: '0.78rem', background: '#6B7280', color: '#FFFFFF' }}
                      onClick={() => setAllGrandfatherPreset('clear')}
                      title="Vynuluje všechna vylepšení z nůše na úroveň 0"
                    >
                      🧹 Vynulovat nůši (0)
                    </button>
                  </div>
                </div>

                {/* CATEGORY FILTER BUTTONS & SEARCH BAR */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    flexWrap: 'wrap',
                    borderTop: '2px dashed #B45309',
                    paddingTop: '8px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'all' as const, label: `🌟 Vše (${ALL_GRANDFATHER_UPGRADES.length})` },
                      { key: 'passive' as const, label: '💪 Trvalá posílení' },
                      { key: 'folklore' as const, label: '✨ Folklórní posvěcení' },
                      { key: 'treasure' as const, label: '📯 Vzácné předměty' },
                      { key: 'consumable' as const, label: '🍖 Svačiny & Krejcary' },
                      { key: 'synergy' as const, label: '⚡ Synergie zbraní' },
                    ].map((tab) => {
                      const isActive = grandfatherCategoryFilter === tab.key;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => {
                            sound.coin();
                            setGrandfatherCategoryFilter(tab.key);
                          }}
                          style={{
                            background: isActive ? '#16A34A' : '#E5E7EB',
                            color: isActive ? '#FFFFFF' : '#1F2937',
                            border: '1.5px solid var(--ink)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.76rem',
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '180px' }}>
                    <input
                      type="text"
                      value={grandfatherSearchQuery}
                      onChange={(e) => setGrandfatherSearchQuery(e.target.value)}
                      placeholder="🔍 Hledat v nůši (např. káva, pírko, křída, syreček...)"
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        border: '2px solid var(--ink)',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        background: '#FFFFFF',
                        color: 'var(--ink)',
                      }}
                    />
                    {grandfatherSearchQuery && (
                      <button
                        onClick={() => setGrandfatherSearchQuery('')}
                        style={{
                          background: '#D1342B',
                          color: '#FFFFFF',
                          border: '1.5px solid var(--ink)',
                          borderRadius: '6px',
                          padding: '3px 7px',
                          fontSize: '0.76rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                        title="Vymazat hledání"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* UPGRADE CARDS GRID */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                  gap: '10px',
                }}
              >
                {filteredGrandfatherUpgrades.map((item) => {
                  const cfg = grandfatherConfig[item.id] || { selected: false, level: 0 };
                  const isSel = cfg.level > 0 && cfg.selected;
                  const isMax = cfg.level >= item.maxLevel;
                  return (
                    <div
                      key={item.id}
                      style={{
                        background: isSel ? '#FEF3C7' : '#EFE7D5',
                        border: isSel
                          ? isMax
                            ? '3px solid #CA8A04'
                            : '3px solid #16A34A'
                          : '2px solid #5C3D28',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        color: 'var(--ink)',
                        boxShadow: isSel
                          ? isMax
                            ? '0 0 10px rgba(202, 138, 4, 0.3), 3px 3px 0 var(--ink)'
                            : '0 0 10px rgba(22, 163, 74, 0.25), 3px 3px 0 var(--ink)'
                          : '2px 2px 0 var(--ink)',
                        textAlign: 'left',
                        opacity: cfg.level === 0 ? 0.76 : 1,
                        transition: 'all 0.1s ease',
                      }}
                    >
                      {/* CARD HEADER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleGrandfatherUpgrade(item.id)}
                            style={{
                              width: '18px',
                              height: '18px',
                              cursor: 'pointer',
                              accentColor: '#16A34A',
                            }}
                          />
                          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            <GameIcon icon={item.icon} size={22} />
                          </span>
                          <div>
                            <div
                              style={{
                                fontWeight: 900,
                                fontSize: '0.96rem',
                                color: cfg.level === 0 ? '#4B5563' : '#111111',
                                lineHeight: 1.2,
                              }}
                            >
                              {item.name}
                            </div>
                            <span
                              style={{
                                display: 'inline-block',
                                background: item.categoryColor,
                                color: '#FFFFFF',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '0.66rem',
                                fontWeight: 800,
                                marginTop: '2px',
                              }}
                            >
                              {item.categoryLabel}
                            </span>
                          </div>
                        </label>

                        {/* LEVEL SELECTOR: 0 - X */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            background: isSel ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                            border: '2px solid var(--ink)',
                            borderRadius: '6px',
                            padding: '2px 4px',
                          }}
                        >
                          <button
                            onClick={() => setGrandfatherToZero(item.id)}
                            disabled={cfg.level <= 0}
                            style={{
                              width: '22px',
                              height: '24px',
                              background: cfg.level <= 0 ? '#E5E7EB' : '#FEE2E2',
                              color: cfg.level <= 0 ? '#9CA3AF' : '#DC2626',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level <= 0 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.76rem',
                            }}
                            title="Vynulovat na úroveň 0 (vypnuto)"
                          >
                            0
                          </button>
                          <button
                            onClick={() => changeGrandfatherLevel(item.id, -1)}
                            disabled={cfg.level <= 0}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: cfg.level <= 0 ? '#E5E7EB' : '#D1342B',
                              color: cfg.level <= 0 ? '#9CA3AF' : '#FFFFFF',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level <= 0 ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                            title="Snížit úroveň (až na 0)"
                          >
                            -
                          </button>
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: '0.82rem',
                              minWidth: '58px',
                              textAlign: 'center',
                              color:
                                cfg.level === 0
                                  ? '#DC2626'
                                  : isMax
                                  ? '#B45309'
                                  : '#15803D',
                            }}
                          >
                            {cfg.level === 0 ? 'Úr. 0' : isMax ? `Úr. ${cfg.level} (MAX)` : `Úr. ${cfg.level}/${item.maxLevel}`}
                          </span>
                          <button
                            onClick={() => changeGrandfatherLevel(item.id, 1)}
                            disabled={cfg.level >= item.maxLevel}
                            style={{
                              width: '24px',
                              height: '24px',
                              background: cfg.level >= item.maxLevel ? '#E5E7EB' : '#16A34A',
                              color: cfg.level >= item.maxLevel ? '#9CA3AF' : '#FFFFFF',
                              border: '1.5px solid var(--ink)',
                              borderRadius: '4px',
                              fontWeight: 900,
                              cursor: cfg.level >= item.maxLevel ? 'not-allowed' : 'pointer',
                              lineHeight: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.9rem',
                            }}
                            title={`Zvýšit úroveň (až na max úroveň ${item.maxLevel})`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* STAT HINT & DESCRIPTION */}
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: cfg.level === 0 ? '#6B7280' : '#1F2937',
                          fontWeight: 700,
                          lineHeight: 1.25,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 800,
                            color: cfg.level === 0 ? '#991B1B' : '#B45309',
                            marginBottom: '2px',
                          }}
                        >
                          {cfg.level === 0 ? '💤 Neaktivní (Úr. 0)' : `✨ Aktivní posílení: Úr. ${cfg.level} × (${item.statHint})`}
                        </div>
                        <div style={{ color: '#4B5563', fontSize: '0.73rem', lineHeight: 1.25 }}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredGrandfatherUpgrades.length === 0 && (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#FEF3C7',
                    fontWeight: 800,
                    fontSize: '1rem',
                  }}
                >
                  Žádné vylepšení neodpovídá hledanému výrazu „{grandfatherSearchQuery}“.
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            borderTop: '3px solid var(--ink)',
            paddingTop: '12px',
            marginTop: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* SUMMARY */}
          <div
            style={{
              textAlign: 'left',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: '#FEF3C7',
            }}
          >
            <span>Vybráno: </span>
            <strong style={{ color: '#FDE047' }}>{HUNTER_UNLOCKS[selectedHero]?.realName}</strong>
            <span> na </span>
            <strong style={{ color: '#FDE047' }}>{GAME_LEVELS[selectedLevel]?.name}</strong>
            <span> s </span>
            <strong style={{ color: selectedWeaponsList.length > 0 ? '#86EFAC' : '#F87171' }}>
              {selectedWeaponsList.length > 0 ? `${selectedWeaponsList.length} zbraněmi` : '0 zbraněmi'}
            </strong>
            {selectedGrandfatherList.length > 0 && (
              <>
                <span> a </span>
                <strong style={{ color: '#FDE047' }}>
                  {selectedGrandfatherList.length} vylepšeními z nůše
                </strong>
              </>
            )}
            {selectedWeaponsList.length === 0 && (
              <span
                style={{
                  color: '#F87171',
                  marginLeft: '6px',
                  fontWeight: 900,
                }}
              >
                (Pro zahájení výpravy vyberte alespoň 1 zbraň s úrovní 1 nebo vyšší!)
              </span>
            )}
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenGrandfatherShop && (
              <button
                className="lada-btn btn-small"
                style={{
                  margin: 0,
                  background: '#B45309',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  boxShadow: '3px 3px 0 var(--ink)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  sound.coin();
                  onOpenGrandfatherShop();
                }}
              >
                🧺 Otevřít nůši naživo
              </button>
            )}
            <button
              className="lada-btn btn-small"
              style={{
                margin: 0,
                background: '#4B5563',
                color: '#FFFFFF',
              }}
              onClick={() => {
                sound.coin();
                onClose();
              }}
            >
              Zrušit
            </button>
            <button
              className="lada-btn btn-small"
              disabled={selectedWeaponsList.length === 0}
              style={{
                margin: 0,
                background: selectedWeaponsList.length > 0 ? '#16A34A' : '#9CA3AF',
                color: '#FFFFFF',
                fontWeight: 900,
                cursor: selectedWeaponsList.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selectedWeaponsList.length > 0 ? '4px 4px 0 var(--ink)' : 'none',
              }}
              onClick={handleStart}
            >
              ⚔️ Spustit testovací výpravu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
