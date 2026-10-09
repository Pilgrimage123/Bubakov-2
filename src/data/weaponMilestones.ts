import type { MilestoneChoice, WeaponId, WeaponRankDef } from '../types';
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
}

export const WEAPONS_WITH_MILESTONES: WeaponId[] = [
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
];

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
      makeChoice('cane_burst_5', 'Pevná násada', 'Silnější bác přidá průraz a udrží tempo útoků.', 'piercing_blow', 'cane_whip', { baseDamageMult: 1.20, pierceDelta: 1, cooldownMult: 0.97 }),
    ],
    8: [
      makeChoice('cane_crowd_8', 'Prut košťátko', 'Mimořádně široký bác vypráší celé kolečko kolem lovce.', 'broom_sweep', 'cane_whip', { areaRadiusMult: 1.20, knockbackMult: 1.25, cooldownMult: 0.94 }),
      makeChoice('cane_burst_8', 'Prachová smršť', 'Každý švih rozpráší houf, přidá průraz a ještě trochu zrychlí kadenci.', 'dust_storm', 'cane_whip', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
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
      makeChoice('buns_crowd_3', 'Povidlová nadílka', 'Víc buchet v salvě omámí mlsající bubáky na delší dobu.', 'bun_scatter', 'buns_eat', { projectileCountDelta: 1, statusDurationSec: 2.2 }),
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
      makeChoice('pitchfork_burst_5', 'Kalený trojzubec', 'Prudký výpad probodne řady bubáků a způsobí krvavé rány.', 'heavy_thrust', 'slash', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
    8: [
      makeChoice('pitchfork_crowd_8', 'Hradba z vidlí', 'Mocný výpad odhodí celé hejno potvor daleko do tmy a vytvoří bezpečný prostor.', 'fork_barricade', 'slash', { areaRadiusMult: 1.25, knockbackMult: 1.45, cooldownMult: 0.92 }),
      makeChoice('pitchfork_burst_8', 'Mistrovský kovářský hrot', 'Mistrovské dílo z vesnické výhně probodne jakéhokoliv bubáka s obrovskou silou a rychlostí.', 'master_forge', 'slash', { baseDamageMult: 1.32, pierceDelta: 1, cooldownMult: 0.90 }),
    ],
  },
  kovana_halapartna: {
    3: [
      makeChoice('halberd_crowd_3', 'Široký oblouk', 'Dlouhý sečný oblouk pokryje celý půlkruh před ponocným.', 'wide_sweep', 'slash', { areaRadiusMult: 1.18, knockbackMult: 1.20 }),
      makeChoice('halberd_burst_3', 'Drábský zásek', 'Těžká sekera na hrotu zasadí zdrcující ránu prvnímu cíli.', 'heavy_cleave', 'slash', { baseDamageMult: 1.20, cooldownMult: 0.96 }),
    ],
    5: [
      makeChoice('halberd_crowd_5', 'Kolenářský sek', 'Nízký švih podrazí nohy útočícímu houfu a odrazí je vzad.', 'low_sweep', 'slash', { areaRadiusMult: 1.22, knockbackMult: 1.30 }),
      makeChoice('halberd_burst_5', 'Hák a hrot', 'Kombinace háku a hrotu snadno rozpoltí těžká strašidla a zrychlí nápřah.', 'hook_point', 'slash', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.93 }),
    ],
    8: [
      makeChoice('halberd_crowd_8', 'Ponocného stráž', 'Gigantický sečný oblouk zamete všechna strašidla v dosahu a vyčistí bojiště.', 'night_guard', 'slash', { areaRadiusMult: 1.28, knockbackMult: 1.40, cooldownMult: 0.92 }),
      makeChoice('halberd_burst_8', 'Rychtářův rozsudek', 'Nekompromisní katovský zásek s maximálním poškozením proráží houfy bez zaváhání.', 'bailiff_judgment', 'slash', { baseDamageMult: 1.32, pierceDelta: 1, cooldownMult: 0.90 }),
    ],
  },
  dreveny_cep: {
    3: [
      makeChoice('flail_crowd_3', 'Rázová vlna', 'Dopad cepu do hlíny zvedne širší prachovou rázovou vlnu a odhodí bubáky.', 'shockwave', 'heavy_hit', { areaRadiusMult: 1.20, knockbackMult: 1.25 }),
      makeChoice('flail_burst_3', 'Těžké okování', 'Okované tělo cepu zasadí drtivou pecku a zkrátí nápřah.', 'iron_band', 'heavy_hit', { baseDamageMult: 1.22, cooldownMult: 0.95 }),
    ],
    5: [
      makeChoice('flail_crowd_5', 'Mlatcovo dupnutí', 'Otřes země zasáhne ještě větší plochu a zviklá útočící příšery.', 'ground_thud', 'heavy_hit', { areaRadiusMult: 1.25, knockbackMult: 1.35, statusDurationSec: 1.0 }),
      makeChoice('flail_burst_5', 'Kalený řetěz', 'Pevnější řetěz umožní mlatci švihat s vyšší razancí a kratší prodlevou.', 'forged_chain', 'heavy_hit', { baseDamageMult: 1.26, cooldownMult: 0.93 }),
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
};

const makeRank = (rank: number, choices?: [MilestoneChoice, MilestoneChoice]): WeaponRankDef => ({
  rank,
  isMilestone: !!choices,
  passiveBonusDescription:
    rank === 1
      ? 'Základní síla zbraně.'
      : choices
        ? 'Milník: vyber jednu ze dvou specializací.'
        : '+12 % damage, +8 % cooldown bonus, +6 % area.',
  flatDamageBonus: 0,
  cooldownReductionBonus: Math.max(0, (rank - 1) * 0.08),
  areaBonus: Math.max(0, (rank - 1) * 0.06),
  ...(choices ? { choices } : {}),
});

export const WEAPON_RANK_DEFS: Partial<Record<WeaponId, WeaponRankDef[]>> = Object.fromEntries(
  WEAPONS_WITH_MILESTONES.map((id) => {
    const choices = MILESTONES[id];
    return [
      id,
      [
        makeRank(1),
        makeRank(2),
        makeRank(3, choices?.[3]),
        makeRank(4),
        makeRank(5, choices?.[5]),
        makeRank(6),
        makeRank(7),
        makeRank(8, choices?.[8]),
      ],
    ];
  }),
);

export function resolveCanonicalWeaponId(id: string): WeaponId | undefined {
  if (WEAPONS_WITH_MILESTONES.includes(id as WeaponId)) return id as WeaponId;
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
  return Math.max(
    base * 0.50,
    base / (1 + Math.max(0, playerCooldownBonus) + Math.max(0, weaponCooldownBonus)),
  );
}

export function getRankedWeaponStats(id: string, level: number, w?: any): WeaponStats {
  const canonical = resolveCanonicalWeaponId(id);
  const safeLevel = Math.min(8, Math.max(1, Math.floor(level || 1)));
  const stats: WeaponStats = {
    damageMult: 1 + (safeLevel - 1) * 0.12,
    cooldownMult: 1,
    areaRadiusMult: 1 + (safeLevel - 1) * 0.06,
    pierce: 0,
    projectileCount: 0,
    projectileCountMult: 1,
    knockbackMult: 1,
    statusDurationSec: 0,
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
    stats.projectileCountMult *= mods.projectileCountMult ?? 1;
    stats.knockbackMult *= mods.knockbackMult ?? 1;
    if (mods.statusDurationSec !== undefined) {
      stats.statusDurationSec = Math.max(stats.statusDurationSec, mods.statusDurationSec);
    }
    if (mods.specialMechanicFlag) {
      stats.specialMechanicFlag = mods.specialMechanicFlag;
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
