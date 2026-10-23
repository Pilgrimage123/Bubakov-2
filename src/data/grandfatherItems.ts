import type { RareItemType } from '../types';

export type GrandfatherEffect =
  | { type: 'speed'; amount: number }
  | { type: 'pickup_radius'; amount: number }
  | { type: 'damage_multiplier'; amount: number }
  | { type: 'max_hp'; amount: number }
  | { type: 'luck'; amount: number }
  | { type: 'regen'; amount: number }
  | { type: 'cooldown'; amount: number }
  | { type: 'nabijeni'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'coins'; amount: number }
  | { type: 'weapon'; weaponId: string }
  | { type: 'rare_instant'; rareItemId: RareItemType }
  | { type: 'arcivzacny_ananas' }
  | { type: 'fajfka' }
  | { type: 'bear_mask' }
  | { type: 'holy_circle'; damageReduction: number }
  | { type: 'kren_spice'; foodResistReduction: number; snackBonusDmg: number }
  | { type: 'gingerbread_heart'; cdReductionMult: number; giantHeal: number }
  | { type: 'ulezely_syrecek'; duration: number; speedMultiplier: number; attackSpeedMultiplier: number }
  | { type: 'pivni_tacek'; targetEnemies: number; cooldownReduction: number; buffDuration: number }
  // --- Nové efekty dědečkovy nůše ---
  | { type: 'sticky_plum_jam'; slowRatio: number; poiseReduction: number }
  | { type: 'goat_bell'; intervalSec: number; radius: number }
  | { type: 'itchy_socks'; speedBonus: number; movingCooldownBonus: number };

export interface GrandfatherItemDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  baseCost: number;
  maxStacks?: number;
  luckWeight?: number;
  isWeapon?: boolean;
  weaponId?: string;
  isRareInstant?: boolean;
  isAnanas?: boolean;
  effect: GrandfatherEffect;
}

export const GRANDFATHER_ITEMS: GrandfatherItemDef[] = [
  // --- Původní stálé dobroty dědečkovy nůše ---
  { id: 'sedmimile_krpce', name: 'Sedmimílové krpce', icon: '🥾', description: '+20 rychlost pohybu', baseCost: 35, maxStacks: 5, luckWeight: 1, effect: { type: 'speed', amount: 20 } },
  { id: 'pytlacka_lucerna', name: 'Pytlácká petrolejka', icon: '🪔', description: '+30 dosahu sběru', baseCost: 35, maxStacks: 5, luckWeight: 1.1, effect: { type: 'pickup_radius', amount: 30 } },
  { id: 'zaplacovany_kabat', name: 'Záplatovaný kabát', icon: '🧥', description: '+25 maximální Kuráž', baseCost: 45, maxStacks: 5, luckWeight: 0.9, effect: { type: 'max_hp', amount: 25 } },
  { id: 'krajac_na_podmasli', name: 'Krajáč na podmáslí', icon: '🥣', description: '+0,6 regenerace / s', baseCost: 50, maxStacks: 4, luckWeight: 0.8, effect: { type: 'regen', amount: 0.6 } },
  { id: 'podkova_pro_stesti', name: 'Podkova pro štěstí', icon: '🍀', description: '+10 ŠTĚSTÍ', baseCost: 50, maxStacks: 5, luckWeight: 0.8, effect: { type: 'luck', amount: 10 } },

  // --- Předchozí level up pasivní upgrady a posílení ---
  { id: 'krvave_jelito', name: 'Krvavé jelito', icon: 'krvave_jelito', description: '+15 % trvalé zranění všech úderů a zbraní', baseCost: 50, maxStacks: 5, luckWeight: 1.0, effect: { type: 'damage_multiplier', amount: 0.15 } },
  { id: 'opravdova_kava', name: 'Opravdová káva', icon: 'opravdova_kava', description: '+15 % nabíjení všech zbraní', baseCost: 50, maxStacks: 5, luckWeight: 0.9, effect: { type: 'cooldown', amount: 0.15 } },
  { id: 'medvedi_mast', name: 'Medvědí mast', icon: 'medvedi_mast', description: '+30 maximální Kuráž i okamžité zhojení', baseCost: 45, maxStacks: 5, luckWeight: 0.95, effect: { type: 'max_hp', amount: 30 } },
  {
    id: 'maska_medveda',
    name: 'Maska medvěda',
    icon: '🐻',
    description: 'Přeléčení (overheal) Kuráže se udělí jako 50 % zranění nepřátelům do vzdálenosti 230 px. Další vylepšování Masky: všechno léčení Kuráže a maskou udělené zranění větší o 20 %.',
    baseCost: 50,
    maxStacks: 4,
    luckWeight: 0.85,
    effect: { type: 'bear_mask' },
  },
  { id: 'vesela_mysl', name: 'Veselá mysl a písnička', icon: '🎵', description: '+3 Kuráž doplňováno každých 5 s (+0,6 reg/s)', baseCost: 45, maxStacks: 5, luckWeight: 0.85, effect: { type: 'regen', amount: 0.6 } },
  { id: 'tepla_cikorka', name: 'Teplá cikorka', icon: 'tepla_cikorka', description: '+30 okamžité doplnění Kuráže', baseCost: 20, maxStacks: 10, luckWeight: 1.1, effect: { type: 'heal', amount: 30 } },
  { id: 'zejdlik_piva', name: 'Žejdlík piva', icon: 'zejdlik_piva', description: '+40 okamžité doplnění Kuráže', baseCost: 25, maxStacks: 10, luckWeight: 1.1, effect: { type: 'heal', amount: 40 } },
  { id: 'panak_koralky', name: 'Panák kořalky', icon: 'panak_koralky', description: '+55 okamžité doplnění Kuráže', baseCost: 30, maxStacks: 10, luckWeight: 1.1, effect: { type: 'heal', amount: 55 } },
  
  { id: 'kynuty_kolac_perk', name: 'Pomeranč z Orientu', icon: 'pomeranc_z_orientu', description: '+25 maximální Kuráž i okamžité posílení', baseCost: 40, maxStacks: 5, luckWeight: 0.9, effect: { type: 'max_hp', amount: 25 } },

  // --- Nové pasivní posvěcení a dobroty ---
  {
    id: 'trikralova_krida',
    name: 'Posvěcená tříkrálová křída',
    icon: '🖍️',
    description: 'Při zastavení nakreslí ochranný kruh: odrazí nemrtvé i čerty a sníží utržené zranění o 20 %.',
    baseCost: 50,
    maxStacks: 3,
    luckWeight: 0.85,
    effect: { type: 'holy_circle', damageReduction: 0.20 },
  },
  {
    id: 'strouhany_kren',
    name: 'Strouhaný křen v ubrousku',
    icon: '🫚',
    description: '-25 % odolnost bubáků vůči jídlu (platí i na kostlivce) a +15 % poškození do mlsajících cílů.',
    baseCost: 45,
    maxStacks: 4,
    luckWeight: 0.9,
    effect: { type: 'kren_spice', foodResistReduction: 0.25, snackBonusDmg: 0.15 },
  },
  {
    id: 'poutove_srdce',
    name: 'Pouťové perníkové srdce',
    icon: 'poutove_srdce',
    description: 'Sebrané perníčky okamžitě dobíjejí schopnost (+0,2 s / +0,6 s / +2 s k nabití); obří perníčky navíc zhojí 8 Kuráže.',
    baseCost: 50,
    maxStacks: 4,
    luckWeight: 0.85,
    effect: { type: 'gingerbread_heart', cdReductionMult: 1.0, giantHeal: 8 },
  },
  {
    id: 'ulezely_syrecek',
    name: 'Uleželý syreček v kapse',
    icon: '🧀',
    description: 'Při nápřahu nepřítele v těsné blízkosti ho závan ze syrečku na 4 s vyčerpá (poloviční rychlost pohybu i útoku).',
    baseCost: 40,
    maxStacks: 3,
    luckWeight: 0.85,
    effect: { type: 'ulezely_syrecek', duration: 4, speedMultiplier: 0.5, attackSpeedMultiplier: 0.5 },
  },
  {
    id: 'pivni_tacek',
    name: 'Pivní tácek s čárkami',
    icon: '🍺',
    description: 'Při nákupu Piva, Kořalky či Cikorky z 8 nejbližších strašidel vypadnou krejcary a na 6 s propůjčí +35 % nabíjení všech zbraní.',
    baseCost: 35,
    maxStacks: 4,
    luckWeight: 0.85,
    effect: { type: 'pivni_tacek', targetEnemies: 8, cooldownReduction: 0.25, buffDuration: 6 },
  },
  {
    id: 'bezedny_krajac_povidel',
    name: 'Bezedný krajáč povidel',
    icon: '🍯',
    description: 'Zasaženým bubákům zalepí paty (-20 % odolnost vůči odhození) a po zahnání zanechají zpomalující povidlovou louži.',
    baseCost: 45,
    maxStacks: 4,
    luckWeight: 0.9,
    effect: { type: 'sticky_plum_jam', slowRatio: 0.35, poiseReduction: 0.20 },
  },
  {
    id: 'zvonek_zatoulane_kozy',
    name: 'Zvonek ze zatoulané kozy',
    icon: '🔔',
    description: 'Při chůzi vesele cinká. Každé 4 s běhu vyruší nápřah blízkých strašidel a přitáhne okolní perníčky a krejcary.',
    baseCost: 40,
    maxStacks: 4,
    luckWeight: 0.95,
    effect: { type: 'goat_bell', intervalSec: 4.0, radius: 180 },
  },
  {
    id: 'babicciny_kousave_fusekle',
    name: 'Babiččiny kousavé fusekle',
    icon: '🧦',
    description: 'Poctivá ovčí vlna zahřeje v mrazu (+15 rychlost, imunita na led) a tak kouše, že v pohybu zrychluje útoky o 12 %.',
    baseCost: 50,
    maxStacks: 4,
    luckWeight: 0.85,
    effect: { type: 'itchy_socks', speedBonus: 15, movingCooldownBonus: 0.12 },
  },

  // --- Pekelné poklady: nákup se okamžitě promění v krejcary ---
  { id: 'pekeln_poklad_drobny', name: 'Pekelný měšec', icon: 'pekeln_poklad_drobny', description: 'Dědeček ti hned vyplatí 40 krejcarů.', baseCost: 8, maxStacks: 99, luckWeight: 1.0, effect: { type: 'coins', amount: 40 } },
  { id: 'pekeln_poklad_stribrny', name: 'Pekelný stříbrňák', icon: 'pekeln_poklad_stribrny', description: 'Dědeček ti hned vyplatí 100 krejcarů.', baseCost: 18, maxStacks: 99, luckWeight: 0.75, effect: { type: 'coins', amount: 100 } },
  { id: 'pekeln_poklad_zlaty', name: 'Pekelný tolar z pekla', icon: 'pekeln_poklad_zlaty', description: 'Dědeček ti hned vyplatí 250 krejcarů.', baseCost: 40, maxStacks: 99, luckWeight: 0.45, effect: { type: 'coins', amount: 250 } },

  // --- Zbraně (vždy garantována alespoň jedna v nůši) ---
  {
    id: 'wp_splaseny_houser',
    name: 'Splašený houser',
    icon: '🪿',
    description: 'Rozlícený houser z návsi honí bubáky, štípe je do lýtek, ruší jim nápřah a vytřásá z nich krejcary.',
    baseCost: 55,
    maxStacks: 8,
    luckWeight: 0.95,
    isWeapon: true,
    weaponId: 'splaseny_houser',
    effect: { type: 'weapon', weaponId: 'splaseny_houser' },
  },
  {
    id: 'wp_whip',
    name: 'Formanský bič',
    icon: '🪢',
    description: 'Prásknutí bičem přeruší nápřah bubáků, ignoruje úhyb a přitáhne kořist v dráze.',
    baseCost: 55,
    maxStacks: 8,
    luckWeight: 0.95,
    isWeapon: true,
    weaponId: 'formansky_bic',
    effect: { type: 'weapon', weaponId: 'formansky_bic' },
  },
  { id: 'wp_cane', name: 'Osikový prut', icon: 'osikovy_prut', description: 'Rychlý sečný oblouk odhání dotěrné skřítky a zloděje.', baseCost: 55, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'osikovy_prut', effect: { type: 'weapon', weaponId: 'osikovy_prut' } },
  { id: 'wp_cesnekova-topinka', name: 'Česneková topinka', icon: 'cesnekova_topinka', description: 'Smradlavá aura z česnekové topinky s brutálním odhozením.', baseCost: 40, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'cesnekova_topinka', effect: { type: 'weapon', weaponId: 'cesnekova_topinka' } },
  { id: 'wp_valecnice', name: 'Válečnice', icon: 'valecnice', description: 'Rázná paní s válečkem obíhající kolem lovce.', baseCost: 45, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'valecnice', effect: { type: 'weapon', weaponId: 'valecnice' } },
  { id: 'wp_kysela-okurka', name: 'Kyselá okurka', icon: 'kysela_okurka', description: 'Střílí kyselé okurky. Bubáci zeslábnou a dostávají větší rány.', baseCost: 55, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'kysela_okurka', effect: { type: 'weapon', weaponId: 'kysela_okurka' } },
  { id: 'wp_buns', name: 'Povidlové buchty', icon: 'czech_buchta', description: 'Zlatavé buchty pečené v pekáči. Bubáci mlsají na místě.', baseCost: 45, maxStacks: 8, luckWeight: 1.1, isWeapon: true, weaponId: 'povidlove_buchty', effect: { type: 'weapon', weaponId: 'povidlove_buchty' } },
  { id: 'wp_pitchfork', name: 'Kovářské vidle', icon: '🔱', description: 'Třízubé kované vidle prorážejí řady strašidel bodnutím vpřed.', baseCost: 50, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'kovarske_vidle', effect: { type: 'weapon', weaponId: 'kovarske_vidle' } },
  { id: 'wp_halberd', name: 'Kovaná halapartna', icon: 'kovana_halapartna', description: 'Těžká zbraň ponocných. Široký rázný švih zažene celé houfy.', baseCost: 60, maxStacks: 8, luckWeight: 0.9, isWeapon: true, weaponId: 'kovana_halapartna', effect: { type: 'weapon', weaponId: 'kovana_halapartna' } },
  { id: 'wp_flail', name: 'Dřevěný cep na obilí', icon: '🌾', description: 'Drtivý dopad do země vyvolá rázovou vlnu a odhodí nepřátele.', baseCost: 65, maxStacks: 8, luckWeight: 0.85, isWeapon: true, weaponId: 'dreveny_cep', effect: { type: 'weapon', weaponId: 'dreveny_cep' } },
  { id: 'wp_herbs', name: 'Devatery kvítí', icon: '🌿', description: 'Voňavý ochranný věnec bylin v kruhu zahání nečisté síly.', baseCost: 45, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'devatero_kviti', effect: { type: 'weapon', weaponId: 'devatero_kviti' } },
  { id: 'wp_snowball', name: 'Sněhová koule', icon: '❄️', description: 'Tuhá ledová koule ze sněhu, chlad zpomalí každé strašidlo.', baseCost: 45, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'snehova_koule', effect: { type: 'weapon', weaponId: 'snehova_koule' } },
  { id: 'wp_kolac', name: 'Kynutý koláč', icon: 'kynuty_kolac', description: 'Tradiční koláč se odráží mezi bubáky a přiměje je mlsat.', baseCost: 50, maxStacks: 8, luckWeight: 0.95, isWeapon: true, weaponId: 'kynuty_kolac', effect: { type: 'weapon', weaponId: 'kynuty_kolac' } },
  { id: 'wp_potato', name: 'Horký brambor z popela', icon: '🥔', description: 'Brambor z popela popálí bubáky a zanechá kouřící ohnisko.', baseCost: 50, maxStacks: 8, luckWeight: 0.95, isWeapon: true, weaponId: 'horky_brambor', effect: { type: 'weapon', weaponId: 'horky_brambor' } },
  { id: 'wp_bees', name: 'Včelí roj z úlu', icon: '🐝', description: 'Bzučící včely samy vyhledávají nejbližší strašidla.', baseCost: 50, maxStacks: 8, luckWeight: 1.0, isWeapon: true, weaponId: 'vceli_roj', effect: { type: 'weapon', weaponId: 'vceli_roj' } },
  { id: 'wp_hromnicka', name: 'Hromnička', icon: '🕯️', description: 'Posvěcená svíce pulzuje posvátným zraněním a odpuzuje bubáky.', baseCost: 50, maxStacks: 8, luckWeight: 0.9, isWeapon: true, weaponId: 'hromnicka', effect: { type: 'weapon', weaponId: 'hromnicka' } },
  { id: 'wp_holywater', name: 'Kropenka se svěcenou vodou', icon: '✨', description: 'Svěcená voda z kapličky kropí široký vějíř posvátných kapek.', baseCost: 55, maxStacks: 8, luckWeight: 0.9, isWeapon: true, weaponId: 'svecena_kropenka', effect: { type: 'weapon', weaponId: 'svecena_kropenka' } },
  { id: 'wp_fajfka', name: 'Bylinková fajfka', icon: 'bylinkova_fajfka', description: 'Dědečkova hliněná fajfka s vonnými bylinkami. Oblak dýmu zraňuje a zpomaluje běsy a léčí lovce.', baseCost: 55, maxStacks: 8, luckWeight: 0.85, isWeapon: true, weaponId: 'bylinkova_fajfka', effect: { type: 'weapon', weaponId: 'bylinkova_fajfka' } },

  // --- Vzácné poklady a okamžité pomocné předměty (The Classic Trinity & Instant Utility) ---
  { id: 'ponocny_horn', name: 'Trouba obecního ponocného', icon: '📯', description: 'Zastaví čas na 5 sekund a mohutným zatroubením odhodí okolní strašidla.', baseCost: 24, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'ponocny_horn' } },
  { id: 'masopust_rattle', name: 'Masopustní řehtačka', icon: '🪇', description: 'Smete řadová strašidla, bossům vezme 35 % zdraví a vytvoří rázový štít na 2 s.', baseCost: 25, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'masopust_rattle' } },
  { id: 'babicka_apron', name: 'Babiččina kropenatá zástěra', icon: '🧺', description: 'V mžiku přitáhne všechny perníčky i kořist z celé mapy a zhojí 15 Kuráže.', baseCost: 20, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'babicka_apron' } },
  { id: 'slivovice_splash', name: 'Hlt slivovice z modrého džbánku', icon: '🏺', description: 'Vyčistí postihy, omráčí nepřátele v 180° oblouku na 4,5 s a zapálí střely modrým plamenem.', baseCost: 20, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'slivovice_splash' } },
  { id: 'svanda_bagpipes', name: 'Dudácká čertovská skočná', icon: '🎶', description: 'Přinutí strašidla bít se mezi sebou na 6 s a zdvojnásobí kořist.', baseCost: 25, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'svanda_bagpipes' } },
  { id: 'kominik_button', name: 'Kominický knoflík pro štěstí', icon: '🔘', description: '7 s nehmotnosti a zaručených maximálních kritických zásahů, sazemi oslepí nepřátele.', baseCost: 22, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'kominik_button' } },
  { id: 'kovarska_podkova', name: 'Kovářská podkova', icon: '🧲', description: 'V mžiku přitáhne všechny perníčky, krejcary i dušičky a na 5 s zdvojnásobí Štěstí.', baseCost: 18, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'horseshoe' } },
  { id: 'hlineny_kohoutek', name: 'Hliněný kohoutek', icon: '🐓', description: 'Ranní zakokrhání smete běžná strašidla, bossům udělí 650 svatého poškození a vystraší přeživší na 3 s.', baseCost: 22, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'rooster' } },
  { id: 'vyrezavane_kukacky', name: 'Vyřezávané kukačky', icon: '⏰', description: 'Zastaví čas na 4 sekundy a popožene krok lovce (+40 rychlost pohybu).', baseCost: 20, maxStacks: 99, luckWeight: 0.35, isRareInstant: true, effect: { type: 'rare_instant', rareItemId: 'cuckoo_clock' } },

  // --- Arcivzácné posílení ---
  { id: 'arcivzacny_ananas', name: 'Arcivzácný ananas', icon: '🍍', description: '+30 % max. Kuráž i rychlost, plně doplní Kuráž a daruje 10 s nezranitelnost.', baseCost: 125, maxStacks: 2, luckWeight: 0.25, isAnanas: true, effect: { type: 'arcivzacny_ananas' } },
];

export const GRANDFATHER_ITEMS_MAP: Record<string, GrandfatherItemDef> = {};
for (let i = 0; i < GRANDFATHER_ITEMS.length; i++) {
  const item = GRANDFATHER_ITEMS[i];
  GRANDFATHER_ITEMS_MAP[item.id] = item;
}

export function getGrandfatherItem(id: string): GrandfatherItemDef | undefined {
  if (id === 'bylinkova_fajfka') return GRANDFATHER_ITEMS_MAP['wp_fajfka'] || GRANDFATHER_ITEMS_MAP[id];
  return GRANDFATHER_ITEMS_MAP[id];
}
