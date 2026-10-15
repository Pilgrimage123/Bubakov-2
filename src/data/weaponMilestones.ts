import type {
  MilestoneChoice,
  WeaponId,
  WeaponRankDef,
  MeleeNormalUpgradeDef,
  AuraNormalUpgradeDef,
  ProjectileNormalUpgradeDef,
  WeaponNormalUpgradeDef,
  WeaponNormalUpgradeCategory,
} from '../types';
import { WEAPON_LEGACY_ALIASES } from './weapons';
import { getSynergisticUpgrade } from './synergisticUpgrades';

export interface WeaponStats {
  damageMult: number;
  cooldownMult: number;
  areaRadiusMult: number;
  pierce: number;
  projectileCount: number;
  projectileCountMult: number;
  knockbackMult: number;
  statusDurationSec: number;
  specialMechanicFlag?: string;
  cooldownReduction?: number;
  ignoreResist?: number;
}

export type WeaponMilestonesSet = Set<WeaponId> & {
  readonly length: number;
  map<U>(callback: (value: WeaponId, index: number, array: WeaponId[]) => U): U[];
};

export const WEAPONS_WITH_MILESTONES: WeaponMilestonesSet = new Set<WeaponId>([
  'osikovy_prut',
  'valecnice',
  'cesnekova_topinka',
  'kysela_okurka',
  'povidlove_buchty',
  'kovarske_vidle',
  'kovana_halapartna',
  'dreveny_cep',
  'devatero_kviti',
  'snehova_koule',
  'kynuty_kolac',
  'horky_brambor',
  'vceli_roj',
  'hromnicka',
  'svecena_kropenka',
  'bylinkova_fajfka',
  'formansky_bic',
  'splaseny_houser',
]) as WeaponMilestonesSet;

Object.defineProperty(WEAPONS_WITH_MILESTONES, 'length', {
  get() {
    return this.size;
  },
  configurable: true,
});
(WEAPONS_WITH_MILESTONES as any).map = function <U>(
  callback: (value: WeaponId, index: number, array: WeaponId[]) => U
): U[] {
  return Array.from(this as Set<WeaponId>).map(callback);
};


const makeChoice = (
  id: string,
  name: string,
  description: string,
  visualEffectTag: string,
  audioSfx: string,
  statModifiers: MilestoneChoice['statModifiers'],
): MilestoneChoice => ({
  id,
  name,
  description,
  visualEffectTag,
  audioSfx,
  statModifiers,
});

const MILESTONES: Partial<Record<WeaponId, Record<3 | 5 | 8, [MilestoneChoice, MilestoneChoice]>>> = {
  osikovy_prut: {
    3: [
      makeChoice('cane_crowd_3', 'Široký švih', 'Široký oblouk pomůže vyprášit kožichy celého houfu.', 'wide_sweep', 'cane_whip', { areaRadiusMult: 1.14, knockbackMult: 1.20 }),
      makeChoice('cane_burst_3', 'Rázný bác', 'Každý bác má větší razanci a prut udeří svižněji.', 'strong_blow', 'cane_whip', { baseDamageMult: 1.18, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('cane_crowd_5', 'Prut větrník', 'Švih rozpráší houf a udrží bubáky v bezpečném odstupu.', 'wind_sweep', 'cane_whip', { areaRadiusMult: 1.16, knockbackMult: 1.22 }),
      makeChoice('cane_burst_5', 'Pevná násada', 'Silnější bác ignoruje 25 % odolností strašidel a udrží tempo útoků.', 'piercing_blow', 'cane_whip', { baseDamageMult: 1.20, ignoreResist: 0.25, cooldownMult: 0.97 }),
    ],
    8: [
      makeChoice('cane_crowd_8', 'Prut košťátko', 'Mimořádně široký bác vypráší celé kolečko kolem lovce.', 'broom_sweep', 'cane_whip', { areaRadiusMult: 1.20, knockbackMult: 1.25, cooldownMult: 0.94 }),
      makeChoice('cane_burst_8', 'Prachová smršť', 'Každý švih rozpráší houf, ignoruje 40 % odolností strašidel a ještě trochu zrychlí kadenci.', 'dust_storm', 'cane_whip', { baseDamageMult: 1.24, ignoreResist: 0.40, cooldownMult: 0.94 }),
    ],
  },
  valecnice: {
    3: [
      makeChoice('valecnice_crowd_3', 'Široké kolo', 'Širší strážný okruh (+15 %), dosah úderu (až 67 px) a vyšší odhoz bubáků.', 'wide_orbit', 'granny_attack', { areaRadiusMult: 1.15, knockbackMult: 1.25 }),
      makeChoice('valecnice_burst_3', 'Rázný váleček', 'Váleček má těžký bác (+20 % dmg), omráčení na 3,6 s a svižnější kadenci.', 'heavy_roll', 'granny_attack', { baseDamageMult: 1.20, cooldownMult: 0.95, statusDurationSec: 1.2 }),
    ],
    5: [
      makeChoice('valecnice_crowd_5', 'Válečnický kruh', 'Přiběhne druhá Válečnice do kruhu! Dvojitý perimetr a brutální odhoz.', 'war_circle', 'granny_attack', { areaRadiusMult: 1.15, knockbackMult: 1.25, projectileCountDelta: 1 }),
      makeChoice('valecnice_burst_5', 'Průrazný bác', 'Těžký úder ještě lépe proráží odpor monster, prodlouží omráčení na 3,9 s a odhodí i těžká monstra.', 'double_blow', 'granny_attack', { baseDamageMult: 1.22, knockbackMult: 1.25, cooldownMult: 0.95, statusDurationSec: 1.3 }),
    ],
    8: [
      makeChoice('valecnice_crowd_8', 'Válečnická garda', 'Třetí Válečnice do kruhu! Obří perimetr (160+ px), masivní odhoz a omráčení celého houfu.', 'great_circle', 'granny_attack', { areaRadiusMult: 1.20, knockbackMult: 1.35, projectileCountDelta: 1, cooldownMult: 0.92 }),
      makeChoice('valecnice_burst_8', 'Velký úklid', 'Drtivý váleček má maximální sílu (+30 % dmg), omráčení na 4,5 s a svižnou kadenci.', 'big_cleanup', 'granny_attack', { baseDamageMult: 1.30, knockbackMult: 1.30, cooldownMult: 0.92, statusDurationSec: 1.5 }),
    ],
  },
  cesnekova_topinka: {
    3: [
      makeChoice('garlic_crowd_3', 'Široký smrádek', 'Voňavá zóna je větší a lépe drží bubáky od lovce.', 'wide_aura', 'garlic_pulse', { areaRadiusMult: 1.14, knockbackMult: 1.18 }),
      makeChoice('garlic_burst_3', 'Silný obláček', 'Puls česneku má větší sílu a rychlejší tempo.', 'strong_puff', 'garlic_pulse', { baseDamageMult: 1.16, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('garlic_crowd_5', 'Česneková stopa', 'Aura se rozšíří a omámení bubáci zůstanou déle mimo dosah.', 'scent_trail', 'garlic_pulse', { areaRadiusMult: 1.16, statusDurationSec: 1.5, knockbackMult: 1.18 }),
      makeChoice('garlic_burst_5', 'Těžký obláček', 'Silnější puls přidá škáluje poškození a drží svižnou kadenci.', 'heavy_puff', 'garlic_pulse', { baseDamageMult: 1.18, cooldownMult: 0.96 }),
    ],
    8: [
      makeChoice('garlic_crowd_8', 'Velký česnekový oblak', 'Mohutný oblak vyčistí široké okolí a bubákům se zamotají nohy.', 'garlic_cloud', 'garlic_pulse', { areaRadiusMult: 1.20, knockbackMult: 1.25, statusDurationSec: 2, cooldownMult: 0.94 }),
      makeChoice('garlic_burst_8', 'Kyselý česnekový bác', 'Silnější puls drží tempo a má výraznější sílu.', 'garlic_burst', 'garlic_pulse', { baseDamageMult: 1.24, cooldownMult: 0.94 }),
    ],
  },
  kysela_okurka: {
    3: [
      makeChoice('pickle_crowd_3', 'Rozhozená porce', 'Přibude okurka a širší záběr zasáhne víc houfů.', 'pickle_scatter', 'pickle_throw', { projectileCountDelta: 1, areaRadiusMult: 1.08 }),
      makeChoice('pickle_burst_3', 'Křupavá porce', 'Kyselá okurka má větší sílu a kratší přípravu.', 'pickle_crunch', 'pickle_throw', { baseDamageMult: 1.16, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('pickle_crowd_5', 'Křížová porce', 'Další projektil proráží první cíl a pokračuje dál.', 'pickle_crossfire', 'pickle_throw', { projectileCountDelta: 1, pierceDelta: 1, areaRadiusMult: 1.08 }),
      makeChoice('pickle_burst_5', 'Kyselá svačina', 'Silnější porce proráží první cíl a drží svižné tempo.', 'pickle_burst', 'pickle_throw', { baseDamageMult: 1.18, pierceDelta: 1, cooldownMult: 0.97 }),
    ],
    8: [
      makeChoice('pickle_crowd_8', 'Velká okurková porce', 'Více projektilů rozpráší houf ve větším záběru a letí přes první cíle.', 'big_pickle_scatter', 'pickle_throw', { projectileCountDelta: 1, pierceDelta: 1, areaRadiusMult: 1.10, cooldownMult: 0.94 }),
      makeChoice('pickle_burst_8', 'Kyselý déšť', 'Silnější projektily, průraz a svižnější kadence udělají z porce pořádný fofr.', 'pickle_rain', 'pickle_throw', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
  },
  povidlove_buchty: {
    3: [
      makeChoice('buns_crowd_3', 'Povidlová vůně', 'Oblak povidlové vůně má o 40 % větší poloměr i trvání.', 'plum_scent', 'buns_eat', { projectileCountDelta: 1, statusDurationSec: 2.2, specialMechanicFlag: 'plum_scent_plus' }),
      makeChoice('buns_burst_3', 'Cukrové sypání', 'Čerstvě upečené buchty s pořádnou vrstvou cukru mají vyšší sílu a rychlejší pečení.', 'sugar_dust', 'buns_eat', { baseDamageMult: 1.18, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('buns_crowd_5', 'Pekáč pro celou ves', 'Z pekáče létá ještě více sladkých buchet se širším rozptylem.', 'baking_pan', 'buns_eat', { projectileCountDelta: 1, areaRadiusMult: 1.15, statusDurationSec: 2.5 }),
      makeChoice('buns_burst_5', 'Hutné švestkové povidlí', 'Hutná náplň snadno proletí prvním bubákem a zasadí těžkou ránu.', 'plum_jam', 'buns_eat', { baseDamageMult: 1.22, pierceDelta: 1, cooldownMult: 0.95 }),
    ],
    8: [
      makeChoice('buns_crowd_8', 'Posvícenská hostina', 'Obrovská záplava sladkých buchet zastaví celý houf mlsounů na dlouhé sekundy.', 'village_feast', 'buns_eat', { projectileCountDelta: 2, areaRadiusMult: 1.20, statusDurationSec: 3.0, cooldownMult: 0.92 }),
      makeChoice('buns_burst_8', 'Babiččino tajemství', 'Dokonale vypečené buchty s rumovým povidlím mají drtivou sílu a bleskovou přípravu.', 'secret_recipe', 'buns_eat', { baseDamageMult: 1.30, pierceDelta: 1, cooldownMult: 0.90 }),
    ],
  },
  kovarske_vidle: {
    3: [
      makeChoice('pitchfork_crowd_3', 'Široké hroty', 'Tři kalené hroty zasáhnou širší koridor a prudce odhodí útočníky.', 'wide_fork', 'slash', { areaRadiusMult: 1.16, knockbackMult: 1.25 }),
      makeChoice('pitchfork_burst_3', 'Ocelový bodec', 'Kalená ocel snadno proniká kůží bubáků a útočí svižněji.', 'steel_point', 'slash', { baseDamageMult: 1.20, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('pitchfork_crowd_5', 'Jasanové ratiště', 'Dlouhé jasanové ratiště prodlouží bodnutí a udrží odstup od celého houfu.', 'long_reach', 'slash', { areaRadiusMult: 1.20, knockbackMult: 1.30 }),
      makeChoice('pitchfork_burst_5', 'Kalený trojzubec', 'Prudký výpad ignoruje 25 % odolností strašidel a způsobí krvavé rány.', 'heavy_thrust', 'slash', { baseDamageMult: 1.24, ignoreResist: 0.25, cooldownMult: 0.94 }),
    ],
    8: [
      makeChoice('pitchfork_crowd_8', 'Hradba z vidlí', 'Mocný výpad odhodí celé hejno potvor daleko do tmy a vytvoří bezpečný prostor.', 'fork_barricade', 'slash', { areaRadiusMult: 1.25, knockbackMult: 1.45, cooldownMult: 0.92 }),
      makeChoice('pitchfork_burst_8', 'Mistrovský kovářský hrot', 'Mistrovské dílo z vesnické výhně ignoruje 40 % odolností jakéhokoliv bubáka s obrovskou silou a rychlostí.', 'master_forge', 'slash', { baseDamageMult: 1.32, ignoreResist: 0.40, cooldownMult: 0.90 }),
    ],
  },
  kovana_halapartna: {
    3: [
      makeChoice('halberd_crowd_3', 'Široký oblouk', 'Dlouhý sečný oblouk pokryje celý půlkruh před ponocným.', 'wide_sweep', 'slash', { areaRadiusMult: 1.18, knockbackMult: 1.20 }),
      makeChoice('halberd_burst_3', 'Drábský zásek', 'Těžká sekera na hrotu zasadí zdrcující ránu prvnímu cíli.', 'heavy_cleave', 'slash', { baseDamageMult: 1.20, cooldownMult: 0.96 }),
    ],
    5: [
      makeChoice('halberd_crowd_5', 'Kolenářský sek', 'Nízký švih podrazí nohy útočícímu houfu a odrazí je vzad.', 'low_sweep', 'slash', { areaRadiusMult: 1.22, knockbackMult: 1.30 }),
      makeChoice('halberd_burst_5', 'Hák a hrot', 'Kombinace háku a hrotu ignoruje 25 % odolností strašidel a zrychlí nápřah.', 'hook_point', 'slash', { baseDamageMult: 1.24, ignoreResist: 0.25, cooldownMult: 0.93 }),
    ],
    8: [
      makeChoice('halberd_crowd_8', 'Ponocného stráž', 'Gigantický sečný oblouk zamete všechna strašidla v dosahu a vyčistí bojiště.', 'night_guard', 'slash', { areaRadiusMult: 1.28, knockbackMult: 1.40, cooldownMult: 0.92 }),
      makeChoice('halberd_burst_8', 'Rychtářův rozsudek', 'Nekompromisní katovský zásek s maximálním poškozením ignoruje 40 % odolností a proráží houfy bez zaváhání.', 'bailiff_judgment', 'slash', { baseDamageMult: 1.32, ignoreResist: 0.40, cooldownMult: 0.90 }),
    ],
  },
  dreveny_cep: {
    3: [
      makeChoice('flail_crowd_3', 'Rázová vlna', 'Dopad cepu do hlíny zvedne širší prachovou rázovou vlnu a odhodí bubáky.', 'shockwave', 'heavy_hit', { areaRadiusMult: 1.20, knockbackMult: 1.25 }),
      makeChoice('flail_burst_3', 'Těžké okování', 'Okované tělo cepu zasadí drtivou pecku a zkrátí nápřah.', 'iron_band', 'heavy_hit', { baseDamageMult: 1.22, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('flail_crowd_5', 'Mlatcovo dupnutí', 'Otřes země zasáhne ještě větší plochu a zviklá útočící příšery.', 'ground_thud', 'heavy_hit', { areaRadiusMult: 1.25, knockbackMult: 1.35, statusDurationSec: 1.0 }),
      makeChoice('flail_burst_5', 'Kalený řetěz', 'Pevnější řetěz umožní mlatci švihat s vyšší razancí a svižnějším nabíjením.', 'forged_chain', 'heavy_hit', { baseDamageMult: 1.26, cooldownMult: 0.93 }),
    ],
    8: [
      makeChoice('flail_crowd_8', 'Hromové mlatobí', 'Zemětřesný dopad rozmetá celý zástup bubáků na obrovskou vzdálenost.', 'earthquake', 'heavy_hit', { areaRadiusMult: 1.32, knockbackMult: 1.50, cooldownMult: 0.92 }),
      makeChoice('flail_burst_8', 'Žitný drtič', 'Monstrózní úder rozdrtí i ty nejodolnější noční obludy jediným zásahem.', 'rye_crusher', 'heavy_hit', { baseDamageMult: 1.35, cooldownMult: 0.88 }),
    ],
  },
  devatero_kviti: {
    3: [
      makeChoice('herbs_crowd_3', 'Svatojánský věnec', 'Přibude více bylin v kruhu, které vytvoří hustší ochrannou clonu.', 'herb_ring', 'slash', { projectileCountDelta: 1, areaRadiusMult: 1.12 }),
      makeChoice('herbs_burst_3', 'Hořký odvar', 'Koncentrovaná bylinná šťáva pálí nečisté síly s větší silou a kadencí.', 'bitter_brew', 'slash', { baseDamageMult: 1.18, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('herbs_crowd_5', 'Květná záplava', 'Další bylina do věnce a širší rozptyl zažene i dotírající hejna.', 'flower_burst', 'slash', { projectileCountDelta: 2, areaRadiusMult: 1.15 }),
      makeChoice('herbs_burst_5', 'Třezalková záře', 'Posvátná třezalka spálí temnotu, proráží nepřátele a sviští rychleji.', 'st_johns_glow', 'slash', { baseDamageMult: 1.22, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
    8: [
      makeChoice('herbs_crowd_8', 'Rozkvetlá paseka', 'Mohutný kruh devatera bylin pokryje celou mýtinu a odrazí všechno zlé.', 'blooming_meadow', 'slash', { projectileCountDelta: 3, areaRadiusMult: 1.22, knockbackMult: 1.25, cooldownMult: 0.92 }),
      makeChoice('herbs_burst_8', 'Moc svatojánské noci', 'Magická síla letního slunovratu zmnohonásobí poškození a probodne hordy potvor.', 'solstice_power', 'slash', { baseDamageMult: 1.30, pierceDelta: 1, cooldownMult: 0.90 }),
    ],
  },
  snehova_koule: {
    3: [
      makeChoice('snowball_crowd_3', 'Ledová tříšť', 'Přibude sněhová koule v salvě a zásahy pokryjí širší okolí.', 'ice_shards', 'freeze', { projectileCountDelta: 1, areaRadiusMult: 1.10 }),
      makeChoice('snowball_burst_3', 'Umrzlý rampouch', 'Tuhá zmrzlá hrouda zasadí tvrdší ránu a prodlouží ztuhnutí nepřátel.', 'frozen_icicle', 'freeze', { baseDamageMult: 1.18, statusDurationSec: 1.8, cooldownMult: 0.96 }),
    ],
    5: [
      makeChoice('snowball_crowd_5', 'Husté sněžení', 'Další koule v salvě zbrzdí celý houf a udrží bubáky na uzdě.', 'heavy_snow', 'freeze', { projectileCountDelta: 1, knockbackMult: 1.25, areaRadiusMult: 1.14 }),
      makeChoice('snowball_burst_5', 'Kamenné jádro', 'Koule s kamenem uvnitř proráží prvního zasaženého a tvrdě udeří.', 'stone_core', 'freeze', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
    8: [
      makeChoice('snowball_crowd_8', 'Ladovská vánice', 'Lavina sněhových koulí zasype celou pláň a zmrazí i nejzuřivější strašidla.', 'winter_blizzard', 'freeze', { projectileCountDelta: 2, areaRadiusMult: 1.20, statusDurationSec: 2.5, cooldownMult: 0.92 }),
      makeChoice('snowball_burst_8', 'Ledovcový balvan', 'Masivní balvan čistého ledu prorazí houf a způsobí fatální poškození mrazem.', 'glacier_boulder', 'freeze', { baseDamageMult: 1.32, pierceDelta: 1, cooldownMult: 0.90 }),
    ],
  },
  kynuty_kolac: {
    3: [
      makeChoice('kolac_crowd_3', 'Pekáč plný výslužky', 'Koláč se odrazí k více bubákům a šíří lákavou vůni.', 'cake_spread', 'slash', { projectileCountDelta: 1, areaRadiusMult: 1.12 }),
      makeChoice('kolac_burst_3', 'Mandlový věnec', 'Křupavé mandle a poctivý tvaroh zvýší poškození a zrychlí pečení.', 'almond_crust', 'slash', { baseDamageMult: 1.20, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('kolac_crowd_5', 'Svatební koláčky', 'Vícenásobné odrazy udrží celou skupinu bubáků v mlsném omámení.', 'wedding_treats', 'slash', { statusDurationSec: 4.5, areaRadiusMult: 1.16, knockbackMult: 1.15 }),
      makeChoice('kolac_burst_5', 'Máslové mašlování', 'Extra máslo a rum dodají koláči průraz a drtivější dopad.', 'butter_baste', 'slash', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
    8: [
      makeChoice('kolac_crowd_8', 'Královské posvícení', 'Nekonečné odrazy a záplava koláčů promění bojiště v klidnou hostinu.', 'royal_feast', 'slash', { projectileCountDelta: 1, statusDurationSec: 5.0, areaRadiusMult: 1.22, cooldownMult: 0.92 }),
      makeChoice('kolac_burst_8', 'Obří kynutý pecen', 'Monstrózní koláč proráží zástupy a zanechává za sebou spoušť sladkých škod.', 'giant_cake', 'slash', { baseDamageMult: 1.32, pierceDelta: 1, cooldownMult: 0.88 }),
    ],
  },
  horky_brambor: {
    3: [
      makeChoice('potato_crowd_3', 'Žhavé uhlíky', 'Brambor rozprskne hořící uhlíky po větší ploše a zapálí širší okolí.', 'glowing_embers', 'slash', { areaRadiusMult: 1.20, statusDurationSec: 2.5 }),
      makeChoice('potato_burst_3', 'Spálená slupka', 'Přímo z hloubky pece, horký brambor pálí podstatně víc a letí svižněji.', 'crisp_skin', 'slash', { baseDamageMult: 1.20, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('potato_crowd_5', 'Vatřisko', 'Kouřící ohnisko vydrží déle hořet a zastaví postupující strašidla.', 'roaring_fire', 'slash', { areaRadiusMult: 1.24, knockbackMult: 1.20, statusDurationSec: 3.0 }),
      makeChoice('potato_burst_5', 'Prskající bramboračka', 'Další žhavý brambor v salvě prorazí první překážku a popálí cíle.', 'sizzling_potato', 'slash', { projectileCountDelta: 1, pierceDelta: 1, baseDamageMult: 1.15 }),
    ],
    8: [
      makeChoice('potato_crowd_8', 'Pekelný popelník', 'Obrovská hořící zóna spálí na prach celé zástupy útočících bubáků.', 'ash_inferno', 'slash', { areaRadiusMult: 1.30, statusDurationSec: 4.0, cooldownMult: 0.92 }),
      makeChoice('potato_burst_8', 'Lávový brambor', 'Žhnoucí žár z popela roztaví všechno v cestě a zasadí devastující ohnivé rány.', 'lava_core', 'slash', { baseDamageMult: 1.32, pierceDelta: 1, cooldownMult: 0.90 }),
    ],
  },
  vceli_roj: {
    3: [
      makeChoice('bees_crowd_3', 'Hustý bzukot', 'Ze starého klátu vyletí více rozzuřených včel a rozptýlí se v houfu.', 'buzz_swarm', 'slash', { projectileCountDelta: 2, areaRadiusMult: 1.10 }),
      makeChoice('bees_burst_3', 'Lesní žihadla', 'Bodnutí divokých včel pálí mnohem ostřeji a včely létají rychleji.', 'wild_stinger', 'slash', { baseDamageMult: 1.18, cooldownMult: 0.94 }),
    ],
    5: [
      makeChoice('bees_crowd_5', 'Včelí mračno', 'Ještě větší roj vyhledává bubáky na velkou dálku a znejisťuje jejich postup.', 'bee_cloud', 'slash', { projectileCountDelta: 2, knockbackMult: 1.20, cooldownMult: 0.96 }),
      makeChoice('bees_burst_5', 'Jedovatý med', 'Včelí jed oslabí odolnost bubáků, prodlouží bodavé zranění a prorazí houfy.', 'venom_honey', 'slash', { baseDamageMult: 1.24, statusDurationSec: 2.0, pierceDelta: 1 }),
    ],
    8: [
      makeChoice('bees_crowd_8', 'Královnin roj', 'Královna vyvede celý včelín! Záplava včel pokryje bojiště a neustále bodá.', 'queen_swarm', 'slash', { projectileCountDelta: 4, areaRadiusMult: 1.20, cooldownMult: 0.90 }),
      makeChoice('bees_burst_8', 'Sršní zuřivost', 'Ničivá síla divokých lesních žihadel zlikviduje každého bubáka v rekordním čase.', 'hornet_fury', 'slash', { baseDamageMult: 1.32, pierceDelta: 1, cooldownMult: 0.88 }),
    ],
  },
  hromnicka: {
    3: [
      makeChoice('candle_crowd_3', 'Požehnaná záře', 'Jasné světlo svíce se rozlije do širšího okolí a drží noční potvory dál.', 'holy_aura', 'candle_pulse', { areaRadiusMult: 1.20, knockbackMult: 1.25 }),
      makeChoice('candle_burst_3', 'Posvěcený plamínek', 'Žár hromničky pálí nečisté síly svižněji a s větší posvátnou silou.', 'blessed_flame', 'candle_pulse', { baseDamageMult: 1.22, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('candle_crowd_5', 'Ochrana před bouří', 'Mohutná aura zastraší i těžká strašidla a prodlouží jejich omráčení.', 'storm_ward', 'candle_pulse', { areaRadiusMult: 1.25, statusDurationSec: 2.0, knockbackMult: 1.30 }),
      makeChoice('candle_burst_5', 'Hromový záblesk', 'Puls svíce vyšlehne s pronikavou silou a spálí nemrtvé na prach.', 'thunder_flash', 'candle_pulse', { baseDamageMult: 1.26, cooldownMult: 0.92 }),
    ],
    8: [
      makeChoice('candle_crowd_8', 'Svatováclavská aureola', 'Obrovský kruh posvěceného světla ochrání celou vesnici a vyžene veškerou temnotu.', 'sacred_halo', 'candle_pulse', { areaRadiusMult: 1.32, knockbackMult: 1.45, statusDurationSec: 2.5, cooldownMult: 0.90 }),
      makeChoice('candle_burst_8', 'Hromové požehnání', 'Blesková posvátná síla zničí zástupy pekelníků nezadržitelným božským plamenem.', 'divine_blessing', 'candle_pulse', { baseDamageMult: 1.35, cooldownMult: 0.88 }),
    ],
  },
  svecena_kropenka: {
    3: [
      makeChoice('holy_crowd_3', 'Široký vějíř', 'Vějíř svěcených kapek se rozprostře doširoka a zasáhne celé houfy bubáků.', 'wide_fan', 'bell', { projectileCountDelta: 2, areaRadiusMult: 1.12 }),
      makeChoice('holy_burst_3', 'Kropení hříchů', 'Každá posvěcená kapka má vyšší účinek a kněz kropí svižnějším tempem.', 'sin_cleansing', 'bell', { baseDamageMult: 1.20, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('holy_crowd_5', 'Posvátný liják', 'Hustá sprška kapek zasáhne i vzdálené kouty a odrazí temné síly.', 'sacred_downpour', 'bell', { projectileCountDelta: 2, knockbackMult: 1.25, areaRadiusMult: 1.15 }),
      makeChoice('holy_burst_5', 'Křest ohněm a vodou', 'Kapky prorážejí první řady pekelníků a působí hluboké popálení svěcenou vodou.', 'holy_baptism', 'bell', { baseDamageMult: 1.25, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
    8: [
      makeChoice('holy_crowd_8', 'Potopa hříšníků', 'Obrovský vějíř posvěcené vody spláchne celé zástupy nočních strašidel.', 'great_flood', 'bell', { projectileCountDelta: 4, areaRadiusMult: 1.22, knockbackMult: 1.35, cooldownMult: 0.90 }),
      makeChoice('holy_burst_8', 'Milost svatého Jiří', 'Posvěcená voda s maximální silou probodne a okamžitě zničí i nejodolnější ďábly.', 'st_george_grace', 'bell', { baseDamageMult: 1.34, pierceDelta: 1, cooldownMult: 0.88 }),
    ],
  },
  bylinkova_fajfka: {
    3: [
      makeChoice('pipe_cloud_3', 'Hustý bylinný dým', 'Hustší bylinný kouř pokryje širší okolí lovce a déle zklidňuje dotírající bubáky.', 'herbal_smoke', 'smoke_puff', { areaRadiusMult: 1.25, statusDurationSec: 1.5 }),
      makeChoice('pipe_burst_3', 'Štiplavý tabáček', 'Vůně bylin má větší sílu a dým zahání strašidla ve svižnějším tempu.', 'pungent_smoke', 'smoke_puff', { baseDamageMult: 1.25, cooldownMult: 0.94 }),
    ],
    5: [
      makeChoice('pipe_cloud_5', 'Horská mlhovina', 'Rozpínavý oblak provoní louku a omámení bubáci zůstávají dlouho zpomalení.', 'mountain_fog', 'smoke_puff', { areaRadiusMult: 1.30, statusDurationSec: 2.5 }),
      makeChoice('pipe_burst_5', 'Silný výdech', 'Mocný oblak zraňuje nepřátele podstatně tvrději a zkracuje odpočinek mezi tahy z fajfky.', 'potent_puff', 'smoke_puff', { baseDamageMult: 1.30, cooldownMult: 0.90 }),
    ],
    8: [
      makeChoice('pipe_cloud_8', 'Krakonošův opar', 'Bájná krkonošská mlha zahalí celé bojiště, léčivá síla bylin trvá déle a čistí louku.', 'krakonos_shroud', 'smoke_puff', { areaRadiusMult: 1.40, statusDurationSec: 3.5, cooldownMult: 0.92 }),
      makeChoice('pipe_burst_8', 'Léčivý tabák mistrů', 'Vzácné sušené byliny dodají fajfce maximální ničivou i léčivou sílu a bleskový rytmus.', 'master_tobacco', 'smoke_puff', { baseDamageMult: 1.40, cooldownMult: 0.85 }),
    ],
  },
  formansky_bic: {
    3: [
      makeChoice('whip_double_swing_3', 'Kočího dvojšvih', '+1 švih v salvě do kříže.', 'double_swing', 'cane_whip', { projectileCountDelta: 1, baseDamageMult: 1.10 }),
      makeChoice('whip_lead_knot_3', 'Olověný uzlík', '+25 % poškození na špičce a prolomení poiseResist.', 'lead_knot', 'cane_whip', { baseDamageMult: 1.25, ignoreResist: 1.0 }),
    ],
    5: [
      makeChoice('whip_tar_tip_5', 'Dehtový konec', 'Špička biče hoří a přidává fire poškození proti mrazivým běsům.', 'tar_tip', 'cane_whip', { specialMechanicFlag: 'whip_tar_tip', baseDamageMult: 1.20 }),
      makeChoice('whip_wet_strap_5', 'Mokrý řemen', 'Využívá player.hasSoakedCane pro vyšší odhoz a zpomalení.', 'wet_strap', 'cane_whip', { knockbackMult: 1.45, statusDurationSec: 2.0, baseDamageMult: 1.15 }),
    ],
    8: [
      makeChoice('whip_thunder_crack_8', 'Hromové prásknutí', 'Akustický třesk na konci biče vystraší okolní houf na 2 s.', 'thunder_crack', 'cane_whip', { specialMechanicFlag: 'whip_thunder_crack', cooldownMult: 0.92, statusDurationSec: 2.0 }),
      makeChoice('whip_seven_straps_8', 'Sedmero řemenů', 'Bič švihá v širokém kuželu a zasáhne celou skupinu.', 'seven_straps', 'cane_whip', { areaRadiusMult: 1.45, cooldownMult: 0.90, baseDamageMult: 1.15 }),
    ],
  },
  splaseny_houser: {
    3: [
      makeChoice('gander_crowd_3', 'Hejno z návsi', 'Z kurníku vyběhne další houser a společně proženou širší houf bubáků.', 'flock_rush', 'slash', { projectileCountDelta: 1, areaRadiusMult: 1.12 }),
      makeChoice('gander_burst_3', 'Ostrý zobák', 'Houser štípe do lýtek s větší razancí, častěji vytřese krejcar a déle strašidla zdrží.', 'sharp_beak', 'slash', { baseDamageMult: 1.22, statusDurationSec: 1.8, specialMechanicFlag: 'golden_feather' }),
    ],
    5: [
      makeChoice('gander_crowd_5', 'Husí pochod', 'Houseři se odrážejí k dalším cílům a divokým máváním křídel je silně odhazují.', 'goose_march', 'slash', { pierceDelta: 2, knockbackMult: 1.30 }),
      makeChoice('gander_burst_5', 'Rozlícený sykot', 'Bleskové výpady zobákem mají svižnější nabíjení a mnohem vyšší poškození.', 'angry_hiss', 'slash', { baseDamageMult: 1.25, cooldownMult: 0.92 }),
    ],
    8: [
      makeChoice('gander_crowd_8', 'Posvícenská husí jízda', 'Celé hejno houserů zaplaví bojiště a nenechá jediného bubáka v klidu.', 'goose_stampede', 'slash', { projectileCountDelta: 2, pierceDelta: 2, areaRadiusMult: 1.20, cooldownMult: 0.90 }),
      makeChoice('gander_burst_8', 'Král dvorku', 'Obří dominantní houser se zuřivým klovancem srazí a vyplaší i nejtěžší noční běsy.', 'yard_king', 'slash', { baseDamageMult: 1.35, knockbackMult: 1.45, statusDurationSec: 2.5, cooldownMult: 0.88 }),
    ],
  },
};

export const MELEE_NORMAL_UPGRADES: Record<string, MeleeNormalUpgradeDef> = {
  melee_cleave: {
    id: 'melee_cleave',
    name: 'Široký rozmach',
    ui_text: '+120 % velikost švihu, -20 % zranění',
    category: 'melee',
    stats: {
      area_bonus: 1.20,
      damage_bonus: -0.20,
      cooldown_reduction: 0.00,
    },
  },
  melee_reach: {
    id: 'melee_reach',
    name: 'Prodloužený dosah',
    ui_text: '+60 % velikost švihu',
    category: 'melee',
    stats: {
      area_bonus: 0.60,
      damage_bonus: 0.00,
      cooldown_reduction: 0.00,
    },
  },
  melee_flurry: {
    id: 'melee_flurry',
    name: 'Svižná ruka',
    ui_text: '+40 % nabíjení',
    category: 'melee',
    stats: {
      area_bonus: 0.00,
      damage_bonus: 0.00,
      cooldown_reduction: 0.30,
    },
  },
  melee_heavy: {
    id: 'melee_heavy',
    name: 'Drtivý dopad',
    ui_text: '+100 % zranění',
    category: 'melee',
    stats: {
      area_bonus: 0.00,
      damage_bonus: 1.00,
      cooldown_reduction: 0.00,
    },
  },
  melee_titan: {
    id: 'melee_titan',
    name: 'Titánský švih',
    ui_text: '+60 % zranění, +40 % velikost švihu',
    category: 'melee',
    stats: {
      area_bonus: 0.40,
      damage_bonus: 0.60,
      cooldown_reduction: 0.00,
    },
  },
  melee_frenzy: {
    id: 'melee_frenzy',
    name: 'Zběsilé sekání',
    ui_text: '+80 % nabíjení, -25 % velikost švihu',
    category: 'melee',
    stats: {
      area_bonus: -0.25,
      damage_bonus: 0.00,
      cooldown_reduction: 0.45,
    },
  },
};

export const MELEE_WEAPONS: WeaponId[] = [
  'osikovy_prut',
  'kovarske_vidle',
  'kovana_halapartna',
  'dreveny_cep',
  'valecnice',
  'formansky_bic',
];

export const MELEE_WEAPON_NORMAL_UPGRADE_PROGRESSIONS: Partial<Record<WeaponId, Record<2 | 4 | 6 | 7, string>>> = {
  osikovy_prut: {
    2: 'melee_flurry',
    4: 'melee_reach',
    6: 'melee_frenzy',
    7: 'melee_titan',
  },
  formansky_bic: {
    2: 'melee_reach',
    4: 'melee_flurry',
    6: 'melee_heavy',
    7: 'melee_titan',
  },
  kovarske_vidle: {
    2: 'melee_reach',
    4: 'melee_heavy',
    6: 'melee_flurry',
    7: 'melee_titan',
  },
  kovana_halapartna: {
    2: 'melee_cleave',
    4: 'melee_heavy',
    6: 'melee_reach',
    7: 'melee_titan',
  },
  dreveny_cep: {
    2: 'melee_heavy',
    4: 'melee_cleave',
    6: 'melee_frenzy',
    7: 'melee_titan',
  },
  valecnice: {
    2: 'melee_reach',
    4: 'melee_flurry',
    6: 'melee_heavy',
    7: 'melee_titan',
  },
};

export const AURA_NORMAL_UPGRADES: Record<string, AuraNormalUpgradeDef> = {
  aura_overgrowth: {
    id: 'aura_overgrowth',
    name: 'Rozpínavé pole',
    ui_text: '+85 % poloměr zóny, -25 % zranění',
    category: 'aura',
    stats: {
      area_bonus: 0.85,
      damage_bonus: -0.25,
      cooldown_reduction: 0.00,
    },
  },
  aura_reach: {
    id: 'aura_reach',
    name: 'Široké vyzařování',
    ui_text: '+45 % poloměr zóny',
    category: 'aura',
    stats: {
      area_bonus: 0.45,
      damage_bonus: 0.00,
      cooldown_reduction: 0.00,
    },
  },
  aura_pulse: {
    id: 'aura_pulse',
    name: 'Vysoká frekvence',
    ui_text: '+40 % nabíjení pulzů',
    category: 'aura',
    stats: {
      area_bonus: 0.00,
      damage_bonus: 0.00,
      cooldown_reduction: 0.30,
    },
  },
  aura_intensity: {
    id: 'aura_intensity',
    name: 'Smrtící koncentrace',
    ui_text: '+100 % zranění',
    category: 'aura',
    stats: {
      area_bonus: 0.00,
      damage_bonus: 1.00,
      cooldown_reduction: 0.00,
    },
  },
  aura_unstable: {
    id: 'aura_unstable',
    name: 'Přetížené jádro',
    ui_text: '+60 % zranění, +30 % poloměr zóny',
    category: 'aura',
    stats: {
      area_bonus: 0.30,
      damage_bonus: 0.60,
      cooldown_reduction: 0.00,
    },
  },
  aura_singularity: {
    id: 'aura_singularity',
    name: 'Zhroucená zóna',
    ui_text: '+120 % zranění, +40 % nabíjení pulzů, -35 % poloměr zóny',
    category: 'aura',
    stats: {
      area_bonus: -0.35,
      damage_bonus: 1.20,
      cooldown_reduction: 0.30,
    },
  },
};

export const AURA_WEAPONS: WeaponId[] = [
  'hromnicka',
  'cesnekova_topinka',
  'bylinkova_fajfka',
];

export const AURA_WEAPON_NORMAL_UPGRADE_PROGRESSIONS: Partial<Record<WeaponId, Record<2 | 4 | 6 | 7, string>>> = {
  hromnicka: {
    2: 'aura_reach',
    4: 'aura_intensity',
    6: 'aura_pulse',
    7: 'aura_unstable',
  },
  cesnekova_topinka: {
    2: 'aura_overgrowth',
    4: 'aura_pulse',
    6: 'aura_reach',
    7: 'aura_singularity',
  },
  bylinkova_fajfka: {
    2: 'aura_reach',
    4: 'aura_unstable',
    6: 'aura_pulse',
    7: 'aura_intensity',
  },
};

export const PROJECTILE_NORMAL_UPGRADES: Record<string, ProjectileNormalUpgradeDef> = {
  proj_barrage: {
    id: 'proj_barrage',
    name: 'Kobercový nálet',
    ui_text: '+130 % projektilů, -30 % zranění',
    category: 'projectile',
    stats: {
      projectile_bonus: 1.30,
      damage_bonus: -0.30,
      cooldown_reduction: 0.00,
      area_bonus: 0.00,
    },
  },
  cd_hyper: {
    id: 'cd_hyper',
    name: 'Rychlopalný mechanismus',
    ui_text: '+40 % nabíjení',
    category: 'projectile',
    stats: {
      cooldown_reduction: 0.30,
      damage_bonus: 0.00,
      area_bonus: 0.00,
      projectile_bonus: 0.00,
    },
  },
  dmg_heavy: {
    id: 'dmg_heavy',
    name: 'Těžká munice',
    ui_text: '+100 % zranění',
    category: 'projectile',
    stats: {
      damage_bonus: 1.00,
      cooldown_reduction: 0.00,
      area_bonus: 0.00,
      projectile_bonus: 0.00,
    },
  },
  proj_pierce: {
    id: 'proj_pierce',
    name: 'Průrazné kování',
    ui_text: '+2 průraz, -15 % zranění',
    category: 'projectile',
    stats: {
      pierce_bonus: 2,
      damage_bonus: -0.15,
      cooldown_reduction: 0.00,
      area_bonus: 0.00,
    },
  },
  proj_reach: {
    id: 'proj_reach',
    name: 'Dalekonosný rozptyl',
    ui_text: '+50 % dosah a plošný rozstřik',
    category: 'projectile',
    stats: {
      area_bonus: 0.50,
      damage_bonus: 0.00,
      cooldown_reduction: 0.00,
      projectile_bonus: 0.00,
    },
  },
  proj_volley: {
    id: 'proj_volley',
    name: 'Hustá salva',
    ui_text: '+60 % zranění, +40 % projektilů',
    category: 'projectile',
    stats: {
      damage_bonus: 0.60,
      projectile_bonus: 0.40,
      cooldown_reduction: 0.00,
      area_bonus: 0.00,
    },
  },
};

export const PROJECTILE_WEAPONS: WeaponId[] = [
  'kysela_okurka',
  'povidlove_buchty',
  'devatero_kviti',
  'snehova_koule',
  'kynuty_kolac',
  'horky_brambor',
  'vceli_roj',
  'svecena_kropenka',
  'splaseny_houser',
];

export const PROJECTILE_WEAPON_NORMAL_UPGRADE_PROGRESSIONS: Partial<Record<WeaponId, Record<2 | 4 | 6 | 7, string>>> = {
  kysela_okurka: {
    2: 'proj_barrage',
    4: 'cd_hyper',
    6: 'proj_pierce',
    7: 'dmg_heavy',
  },
  povidlove_buchty: {
    2: 'proj_reach',
    4: 'proj_volley',
    6: 'cd_hyper',
    7: 'dmg_heavy',
  },
  devatero_kviti: {
    2: 'proj_barrage',
    4: 'proj_pierce',
    6: 'proj_volley',
    7: 'cd_hyper',
  },
  snehova_koule: {
    2: 'proj_reach',
    4: 'dmg_heavy',
    6: 'cd_hyper',
    7: 'proj_volley',
  },
  kynuty_kolac: {
    2: 'proj_reach',
    4: 'proj_barrage',
    6: 'dmg_heavy',
    7: 'proj_volley',
  },
  horky_brambor: {
    2: 'dmg_heavy',
    4: 'proj_reach',
    6: 'proj_volley',
    7: 'cd_hyper',
  },
  vceli_roj: {
    2: 'proj_barrage',
    4: 'cd_hyper',
    6: 'dmg_heavy',
    7: 'proj_volley',
  },
  svecena_kropenka: {
    2: 'proj_pierce',
    4: 'proj_volley',
    6: 'cd_hyper',
    7: 'dmg_heavy',
  },
  splaseny_houser: {
    2: 'proj_reach',
    4: 'cd_hyper',
    6: 'dmg_heavy',
    7: 'proj_barrage',
  },
};

export const COOLDOWN_REDUCTION_CAP = 0.75;

export function getMeleeNormalUpgrade(id: string): MeleeNormalUpgradeDef | undefined {
  return MELEE_NORMAL_UPGRADES[id];
}

export function getAuraNormalUpgrade(id: string): AuraNormalUpgradeDef | undefined {
  return AURA_NORMAL_UPGRADES[id];
}

export function getProjectileNormalUpgrade(id: string): ProjectileNormalUpgradeDef | undefined {
  return PROJECTILE_NORMAL_UPGRADES[id];
}

export function getWeaponNormalUpgrade(id: string): WeaponNormalUpgradeDef | undefined {
  return MELEE_NORMAL_UPGRADES[id] || AURA_NORMAL_UPGRADES[id] || PROJECTILE_NORMAL_UPGRADES[id];
}

export function getWeaponCategory(weaponId: string): WeaponNormalUpgradeCategory {
  const canonical = resolveCanonicalWeaponId(weaponId);
  if (!canonical) return 'default';
  if (MELEE_WEAPONS.includes(canonical)) return 'melee';
  if (AURA_WEAPONS.includes(canonical)) return 'aura';
  if (PROJECTILE_WEAPONS.includes(canonical)) return 'projectile';
  return 'default';
}

export function getWeaponCooldownReduction(weapon: any): number {
  if (!weapon) return 0;
  if (Array.isArray(weapon.normalUpgrades)) {
    let sum = 0;
    for (const upId of weapon.normalUpgrades) {
      const up = getWeaponNormalUpgrade(upId);
      if (up) sum += up.stats.cooldown_reduction || 0;
    }
    return sum;
  }
  const canonical = resolveCanonicalWeaponId(weapon.id || weapon);
  const lvl = typeof weapon.level === 'number' ? weapon.level : 1;
  const rankDef = canonical ? getWeaponRankDef(canonical, lvl) : undefined;
  return rankDef?.cooldownReductionBonus ?? 0;
}

export function getWeaponCooldownReductionHeadroom(weapon: any): number {
  const current = getWeaponCooldownReduction(weapon);
  return Math.max(0, COOLDOWN_REDUCTION_CAP - current);
}

export function isWeaponAtCooldownCap(weapon: any): boolean {
  return getWeaponCooldownReductionHeadroom(weapon) < 0.01;
}

export function isWeaponNearCooldownCap(weapon: any): boolean {
  return getWeaponCooldownReductionHeadroom(weapon) < 0.15;
}

export function getEligibleNormalUpgrades(weaponId: string, weapon?: any): WeaponNormalUpgradeDef[] {
  const category = getWeaponCategory(weaponId);
  let pool: WeaponNormalUpgradeDef[] = [];
  if (category === 'melee') {
    pool = Object.values(MELEE_NORMAL_UPGRADES);
  } else if (category === 'aura') {
    pool = Object.values(AURA_NORMAL_UPGRADES);
  } else if (category === 'projectile') {
    pool = Object.values(PROJECTILE_NORMAL_UPGRADES);
  } else {
    return [];
  }

  const headroom = getWeaponCooldownReductionHeadroom(weapon);
  // Nedropovat vylepšení s cooldown_reduction > 0, pokud zbývá méně než 10 % do stropu
  if (headroom < 0.10) {
    return pool.filter((up) => (up.stats.cooldown_reduction || 0) <= 0);
  }
  return pool;
}

export function rollRandomWeaponUpgrade(weaponId: string, weapon?: any): WeaponNormalUpgradeDef | undefined {
  const eligible = getEligibleNormalUpgrades(weaponId, weapon);
  if (eligible.length === 0) return undefined;
  const idx = Math.floor(Math.random() * eligible.length);
  return eligible[idx];
}

export function getWeaponActiveCooldownBonus(weapon: any, rankDef?: WeaponRankDef): number {
  if (weapon && Array.isArray(weapon.normalUpgrades)) {
    return Math.min(COOLDOWN_REDUCTION_CAP, getWeaponCooldownReduction(weapon));
  }
  return Math.min(COOLDOWN_REDUCTION_CAP, rankDef?.cooldownReductionBonus ?? Math.max(0, ((weapon?.level || 1) - 1) * 0.08));
}

const makeRank = (rank: number, choices?: [MilestoneChoice, MilestoneChoice]): WeaponRankDef => ({
  rank,
  isMilestone: !!choices,
  passiveBonusDescription:
    rank === 1
      ? 'Základní síla zbraně.'
      : choices
        ? 'Milník: vyber jednu ze dvou specializací.'
        : '+12 % zranění, +8 % nabíjení, +6 % dosah.',
  flatDamageBonus: 0,
  cooldownReductionBonus: Math.max(0, (rank - 1) * 0.08),
  areaBonus: Math.max(0, (rank - 1) * 0.06),
  ...(choices ? { choices } : {}),
});

function createWeaponRanks(id: WeaponId): WeaponRankDef[] {
  const choices = MILESTONES[id];
  const progression = MELEE_WEAPON_NORMAL_UPGRADE_PROGRESSIONS[id]
    || AURA_WEAPON_NORMAL_UPGRADE_PROGRESSIONS[id];

  if (!progression) {
    return [
      makeRank(1),
      makeRank(2),
      makeRank(3, choices?.[3]),
      makeRank(4),
      makeRank(5, choices?.[5]),
      makeRank(6),
      makeRank(7),
      makeRank(8, choices?.[8]),
    ];
  }

  let cumulativeArea = 0;
  let cumulativeDamage = 0;
  let cumulativeCooldown = 0;
  let cumulativePierce = 0;
  let cumulativeProjectileMult = 1;

  const ranks: WeaponRankDef[] = [];
  for (let rank = 1; rank <= 8; rank++) {
    const isMilestone = rank === 3 || rank === 5 || rank === 8;
    const upgradeId = progression[rank as 2 | 4 | 6 | 7];
    const upgrade = upgradeId ? getWeaponNormalUpgrade(upgradeId) : undefined;

    if (upgrade) {
      cumulativeArea += upgrade.stats.area_bonus || 0;
      cumulativeDamage += upgrade.stats.damage_bonus || 0;
      cumulativeCooldown = Math.min(COOLDOWN_REDUCTION_CAP, cumulativeCooldown + (upgrade.stats.cooldown_reduction || 0));
      if (upgrade.stats.pierce_bonus) cumulativePierce += upgrade.stats.pierce_bonus;
      if (upgrade.stats.projectile_bonus) cumulativeProjectileMult *= (1 + upgrade.stats.projectile_bonus);
    }

    if (rank === 1) {
      ranks.push({
        rank: 1,
        isMilestone: false,
        passiveBonusDescription: 'Základní síla zbraně.',
        flatDamageBonus: 0,
        cooldownReductionBonus: 0,
        areaBonus: 0,
        pierceBonus: 0,
        projectileMultBonus: 1,
      });
    } else if (isMilestone) {
      ranks.push({
        rank,
        isMilestone: true,
        passiveBonusDescription: 'Milník: vyber jednu ze dvou specializací.',
        flatDamageBonus: cumulativeDamage,
        cooldownReductionBonus: cumulativeCooldown,
        areaBonus: cumulativeArea,
        pierceBonus: cumulativePierce,
        projectileMultBonus: cumulativeProjectileMult,
        choices: choices?.[rank as 3 | 5 | 8],
      });
    } else {
      ranks.push({
        rank,
        isMilestone: false,
        passiveBonusDescription: upgrade
          ? `${upgrade.name}: ${upgrade.ui_text}`
          : '+12 % zranění, +8 % nabíjení, +6 % dosah.',
        flatDamageBonus: cumulativeDamage,
        cooldownReductionBonus: cumulativeCooldown,
        areaBonus: cumulativeArea,
        pierceBonus: cumulativePierce,
        projectileMultBonus: cumulativeProjectileMult,
        normalUpgradeId: upgrade?.id,
        normalUpgradeName: upgrade?.name,
      });
    }
  }

  return ranks;
}

export const WEAPON_RANK_DEFS: Partial<Record<WeaponId, WeaponRankDef[]>> = Object.fromEntries(
  WEAPONS_WITH_MILESTONES.map((id) => [id, createWeaponRanks(id)]),
);

export function resolveCanonicalWeaponId(id: string): WeaponId | undefined {
  if (WEAPONS_WITH_MILESTONES.has(id as WeaponId)) return id as WeaponId;
  return WEAPON_LEGACY_ALIASES[id];
}

export function getWeaponRankDef(id: string, rank: number): WeaponRankDef | undefined {
  const canonical = resolveCanonicalWeaponId(id);
  const safeRank = Math.floor(rank);
  const defs = canonical ? WEAPON_RANK_DEFS[canonical] : undefined;
  return defs && safeRank >= 1 && safeRank <= 8
    ? defs[safeRank - 1]
    : undefined;
}

export function getMilestoneChoices(id: string, rank: number): [MilestoneChoice, MilestoneChoice] | undefined {
  return getWeaponRankDef(id, rank)?.choices;
}

export function getMilestoneChoice(id: string, rank: number, choiceId: string): MilestoneChoice | undefined {
  return getMilestoneChoices(id, rank)?.find((item) => item.id === choiceId);
}

/**
 * Finds a milestone choice across any of the 3 milestone ranks (3, 5, 8) for a weapon.
 */
export function getWeaponActiveMilestoneChoice(id: string, choiceId: string): MilestoneChoice | undefined {
  return (
    getMilestoneChoice(id, 3, choiceId) ||
    getMilestoneChoice(id, 5, choiceId) ||
    getMilestoneChoice(id, 8, choiceId)
  );
}

/**
 * Returns Roman numeral for milestone indices (0 -> I, 1 -> II, 2 -> III).
 */
export function formatRomanNumeral(index: number): string {
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  return ROMAN[index] || String(index + 1);
}

/**
 * Migration & backwards-compatibility helper for legacy saved runs and profiles.
 * Safe fallback: populates default choices only for milestone ranks that lack an explicit choice.
 * During active gameplay, player choices are routed through GameEngine.upgradeWeapon instead.
 */
export function ensureWeaponMilestones(w: { id: string; level: number; milestones?: any }) {
  if (!w) return;
  if (!w.milestones) w.milestones = [];
  const safeLevel = Math.min(8, Math.max(1, Math.floor(w.level || 1)));
  for (const rank of [3, 5, 8] as const) {
    if (safeLevel >= rank) {
      const choices = getMilestoneChoices(w.id, rank);
      if (choices && choices[0]) {
        const hasChoice = Array.isArray(w.milestones)
          ? choices.some((c) => w.milestones.includes(c.id))
          : !!w.milestones[rank] || !!w.milestones[String(rank)];
        if (!hasChoice) {
          if (Array.isArray(w.milestones)) {
            w.milestones.push(choices[0].id);
          } else {
            w.milestones[rank] = choices[0].id;
          }
        }
      }
    }
  }
}

export function getEffectiveWeaponCooldown(
  baseCooldown: number,
  playerCooldownBonus: number,
  weaponCooldownBonus: number,
): number {
  const base = Math.max(0, baseCooldown);
  const cappedWeaponBonus = Math.min(COOLDOWN_REDUCTION_CAP, Math.max(0, weaponCooldownBonus));
  const playerDivisor = 1 + Math.max(0, playerCooldownBonus);
  const cdAfterWeapon = base * (1 - cappedWeaponBonus);
  return Math.max(0.05, cdAfterWeapon / playerDivisor);
}

export function getRankedWeaponStats(id: string, level: number, w?: any): WeaponStats {
  const canonical = resolveCanonicalWeaponId(id);
  const safeLevel = Math.min(8, Math.max(1, Math.floor(level || 1)));
  const rankDef = canonical ? getWeaponRankDef(canonical, safeLevel) : undefined;
  const isMeleeCustom = canonical && MELEE_WEAPON_NORMAL_UPGRADE_PROGRESSIONS[canonical];
  const isAuraCustom = canonical && AURA_WEAPON_NORMAL_UPGRADE_PROGRESSIONS[canonical];
  const isCategoryCustom = isMeleeCustom || isAuraCustom;

  const hasDynamicNormalUpgrades = Array.isArray(w?.normalUpgrades) && w.normalUpgrades.length > 0;
  let dynamicDamage = 0;
  let dynamicArea = 0;
  let dynamicCooldown = 0;
  let dynamicProjectileMult = 1;
  let dynamicPierce = 0;

  if (hasDynamicNormalUpgrades) {
    for (const upId of w.normalUpgrades) {
      const up = getWeaponNormalUpgrade(upId);
      if (up) {
        if (up.stats.damage_bonus) dynamicDamage += up.stats.damage_bonus;
        if (up.stats.area_bonus) dynamicArea += up.stats.area_bonus;
        if (up.stats.cooldown_reduction) dynamicCooldown += up.stats.cooldown_reduction;
        if (up.stats.projectile_bonus) dynamicProjectileMult *= (1 + up.stats.projectile_bonus);
        if (up.stats.pierce_bonus) dynamicPierce += up.stats.pierce_bonus;
      }
    }
  }

  const effectiveDamageBonus = hasDynamicNormalUpgrades
    ? dynamicDamage
    : isCategoryCustom
      ? (rankDef?.flatDamageBonus ?? 0)
      : (safeLevel - 1) * 0.12;

  const effectiveAreaBonus = hasDynamicNormalUpgrades
    ? dynamicArea
    : isCategoryCustom
      ? (rankDef?.areaBonus ?? 0)
      : (safeLevel - 1) * 0.06;

  const effectiveCooldownReduction = hasDynamicNormalUpgrades
    ? Math.min(COOLDOWN_REDUCTION_CAP, Math.max(0, dynamicCooldown))
    : Math.min(COOLDOWN_REDUCTION_CAP, Math.max(0, rankDef?.cooldownReductionBonus ?? (isCategoryCustom ? 0 : (safeLevel - 1) * 0.08)));

  const effectivePierce = hasDynamicNormalUpgrades
    ? dynamicPierce
    : (rankDef?.pierceBonus ?? 0);

  const effectiveProjectileMult = hasDynamicNormalUpgrades
    ? dynamicProjectileMult
    : (rankDef?.projectileMultBonus ?? 1);

  const stats: WeaponStats = {
    damageMult: Math.max(0.05, 1 + effectiveDamageBonus),
    cooldownMult: 1,
    areaRadiusMult: Math.max(0.10, 1 + effectiveAreaBonus),
    pierce: effectivePierce,
    projectileCount: 0,
    projectileCountMult: effectiveProjectileMult,
    knockbackMult: 1,
    statusDurationSec: 0,
    cooldownReduction: effectiveCooldownReduction,
    ignoreResist: 0,
  };
  if (!canonical) return stats;

  for (const rank of [3, 5, 8] as const) {
    if (safeLevel < rank) continue;
    const rankChoices = WEAPON_RANK_DEFS[canonical]?.[rank - 1]?.choices;
    if (!rankChoices) continue;
    const choiceId = w?.milestones?.[rank];
    const selected = rankChoices.find((item) =>
      Array.isArray(w?.milestones)
        ? w.milestones.includes(item.id)
        : choiceId === item.id || w?.milestones?.[String(rank)] === item.id
    );
    if (!selected) continue;
    const mods = selected.statModifiers;
    stats.damageMult *= mods.baseDamageMult ?? 1;
    stats.cooldownMult *= mods.cooldownMult ?? 1;
    stats.areaRadiusMult *= mods.areaRadiusMult ?? 1;
    stats.pierce += mods.pierceDelta ?? 0;
    stats.projectileCount += mods.projectileCountDelta ?? 0;
    stats.knockbackMult *= mods.knockbackMult ?? 1;
    if (mods.statusDurationSec !== undefined) {
      stats.statusDurationSec = Math.max(stats.statusDurationSec, mods.statusDurationSec);
    }
    if (mods.specialMechanicFlag) {
      stats.specialMechanicFlag = mods.specialMechanicFlag;
    }
    if (mods.ignoreResist !== undefined) {
      stats.ignoreResist = Math.max(stats.ignoreResist || 0, mods.ignoreResist);
    }
  }

  if (Array.isArray(w?.synergisticUpgrades)) {
    for (const synId of w.synergisticUpgrades) {
      const synDef = getSynergisticUpgrade(synId);
      if (!synDef) continue;
      const mods = synDef.statModifiers;
      stats.damageMult *= mods.baseDamageMult ?? 1;
      stats.cooldownMult *= mods.cooldownMult ?? 1;
      stats.areaRadiusMult *= mods.areaRadiusMult ?? 1;
      stats.pierce += mods.pierceDelta ?? 0;
      stats.projectileCount += mods.projectileCountDelta ?? 0;
      stats.projectileCountMult *= mods.projectileCountMult ?? 1;
      stats.knockbackMult *= mods.knockbackMult ?? 1;
      if (mods.statusDurationSec !== undefined) {
        stats.statusDurationSec = Math.max(stats.statusDurationSec, mods.statusDurationSec);
      }
    }
  }

  return stats;
}

export function validateWeaponMilestones(): true {
  const seen = new Set<string>();
  for (const id of WEAPONS_WITH_MILESTONES) {
    const defs = WEAPON_RANK_DEFS[id];
    if (!defs || defs.length !== 8) throw new Error(id + ': expected exactly 8 ranks');
    for (let rank = 1; rank <= 8; rank += 1) {
      const def = defs[rank - 1];
      const milestone = rank === 3 || rank === 5 || rank === 8;
      if (def.rank !== rank) throw new Error(id + ': rank ordering mismatch');
      if (def.isMilestone !== milestone) throw new Error(id + ': milestone flag mismatch at rank ' + rank);
      if (milestone) {
        if (!def.choices || def.choices.length !== 2) throw new Error(id + ': milestone must have exactly 2 choices');
        if (def.choices[0].id === def.choices[1].id) throw new Error(id + ': milestone choices must have different ids');
        for (const choice of def.choices) {
          if (seen.has(choice.id)) throw new Error('Duplicate milestone choice id: ' + choice.id);
          seen.add(choice.id);
        }
      } else if (def.choices) {
        throw new Error(id + ': non-milestone rank must not have choices');
      }
    }
  }
  return true;
}

validateWeaponMilestones();
