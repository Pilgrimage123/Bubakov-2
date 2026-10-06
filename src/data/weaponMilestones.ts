import type { MilestoneChoice, WeaponId, WeaponRankDef } from '../types';

export interface WeaponStats {
  damageMult: number;
  cooldownMult: number;
  areaRadiusMult: number;
  pierce: number;
  projectileCount: number;
  knockbackMult: number;
  statusDurationSec: number;
  specialMechanicFlag?: string;
}

const WEAPONS: WeaponId[] = [
  'osikovy_prut',
  'valecnice',
  'cesnekova_topinka',
  'kysele_okurky',
];

const makeChoice = (
  id: string,
  name: string,
  folkNameCzech: string,
  description: string,
  visualEffectTag: string,
  audioSfx: string,
  statModifiers: MilestoneChoice['statModifiers'],
): MilestoneChoice => ({
  id,
  name,
  folkNameCzech,
  description,
  visualEffectTag,
  audioSfx,
  statModifiers,
});

const MILESTONES: Record<WeaponId, Record<3 | 5 | 8, [MilestoneChoice, MilestoneChoice]>> = {
  osikovy_prut: {
    3: [
      makeChoice('cane_crowd_3', 'Široký švih', 'Široký švih', 'Široký oblouk pomůže vyprášit kožichy celého houfu.', 'wide_sweep', 'cane_whip', { areaRadiusMult: 1.14, knockbackMult: 1.20 }),
      makeChoice('cane_burst_3', 'Rázný bác', 'Rázný bác', 'Každý bác má větší razanci a prut udeří svižněji.', 'strong_blow', 'cane_whip', { baseDamageMult: 1.18, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('cane_crowd_5', 'Prut větrník', 'Prut větrník', 'Švih rozpráší houf a udrží bubáky v bezpečném odstupu.', 'wind_sweep', 'cane_whip', { areaRadiusMult: 1.16, knockbackMult: 1.22 }),
      makeChoice('cane_burst_5', 'Pevná násada', 'Pevná násada', 'Silnější bác přidá průraz a udrží tempo útoků.', 'piercing_blow', 'cane_whip', { baseDamageMult: 1.20, pierceDelta: 1, cooldownMult: 0.97 }),
    ],
    8: [
      makeChoice('cane_crowd_8', 'Prut košťátko', 'Prut košťátko', 'Mimořádně široký bác vypráší celé kolečko kolem lovce.', 'broom_sweep', 'cane_whip', { areaRadiusMult: 1.20, knockbackMult: 1.25, cooldownMult: 0.94 }),
      makeChoice('cane_burst_8', 'Prachová smršť', 'Prachová smršť', 'Každý švih rozpráší houf, přidá průraz a ještě trochu zrychlí kadenci.', 'dust_storm', 'cane_whip', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
  },
  valecnice: {
    3: [
      makeChoice('valecnice_crowd_3', 'Široké kolo', 'Široké kolo', 'Válečnice drží širší okruh a lépe vyčistí prostor.', 'wide_orbit', 'granny_attack', { areaRadiusMult: 1.10, knockbackMult: 1.18 }),
      makeChoice('valecnice_burst_3', 'Rázný váleček', 'Rázný váleček', 'Váleček má větší bác a udeří svižněji.', 'heavy_roll', 'granny_attack', { baseDamageMult: 1.16, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('valecnice_crowd_5', 'Válečnický kruh', 'Válečnický kruh', 'Širší kolo přidá jeden orbitující váleček.', 'war_circle', 'granny_attack', { areaRadiusMult: 1.12, knockbackMult: 1.20, projectileCountDelta: 1 }),
      makeChoice('valecnice_burst_5', 'Dvojnásobný bác', 'Dvojnásobný bác', 'Ráznější váleček prorazí první cíl a pokračuje dál.', 'double_blow', 'granny_attack', { baseDamageMult: 1.18, pierceDelta: 1, cooldownMult: 0.97 }),
    ],
    8: [
      makeChoice('valecnice_crowd_8', 'Válečnický kruh+', 'Válečnický kruh+', 'Velký kruh, silný odhoz a další orbitující váleček rozpráší celý houf.', 'great_circle', 'granny_attack', { areaRadiusMult: 1.16, knockbackMult: 1.25, projectileCountDelta: 1, cooldownMult: 0.94 }),
      makeChoice('valecnice_burst_8', 'Velký úklid', 'Velký úklid', 'Rázný váleček má vyšší sílu, průraz a svižnější kadenci.', 'big_cleanup', 'granny_attack', { baseDamageMult: 1.22, pierceDelta: 1, cooldownMult: 0.94 }),
    ],
  },
  cesnekova_topinka: {
    3: [
      makeChoice('garlic_crowd_3', 'Široký smrádek', 'Široký smrádek', 'Voňavá zóna je větší a lépe drží bubáky od lovce.', 'wide_aura', 'garlic_pulse', { areaRadiusMult: 1.14, knockbackMult: 1.18 }),
      makeChoice('garlic_burst_3', 'Silný obláček', 'Silný obláček', 'Puls česneku má větší sílu a rychlejší tempo.', 'strong_puff', 'garlic_pulse', { baseDamageMult: 1.16, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('garlic_crowd_5', 'Česneková stopa', 'Česneková stopa', 'Aura se rozšíří a omámení bubáci zůstanou déle mimo dosah.', 'scent_trail', 'garlic_pulse', { areaRadiusMult: 1.16, statusDurationSec: 1.5, knockbackMult: 1.18 }),
      makeChoice('garlic_burst_5', 'Těžký obláček', 'Těžký obláček', 'Silnější puls přidá škáluje poškození a drží svižnou kadenci.', 'heavy_puff', 'garlic_pulse', { baseDamageMult: 1.18, cooldownMult: 0.96 }),
    ],
    8: [
      makeChoice('garlic_crowd_8', 'Velký česnekový oblak', 'Velký česnekový oblak', 'Mohutný oblak vyčistí široké okolí a bubákům se zamotají nohy.', 'garlic_cloud', 'garlic_pulse', { areaRadiusMult: 1.20, knockbackMult: 1.25, statusDurationSec: 2, cooldownMult: 0.94 }),
      makeChoice('garlic_burst_8', 'Kyselý česnekový bác', 'Kyselý česnekový bác', 'Silnější puls drží tempo a má výraznější sílu.', 'garlic_burst', 'garlic_pulse', { baseDamageMult: 1.24, cooldownMult: 0.94 }),
    ],
  },
  kysele_okurky: {
    3: [
      makeChoice('pickle_crowd_3', 'Rozhozená porce', 'Rozhozená porce', 'Přibude okurka a širší záběr zasáhne víc houfů.', 'pickle_scatter', 'pickle_throw', { projectileCountDelta: 1, areaRadiusMult: 1.08 }),
      makeChoice('pickle_burst_3', 'Křupavá porce', 'Křupavá porce', 'Kyselá okurka má větší sílu a kratší přípravu.', 'pickle_crunch', 'pickle_throw', { baseDamageMult: 1.16, cooldownMult: 0.97 }),
    ],
    5: [
      makeChoice('pickle_crowd_5', 'Křížová porce', 'Křížová porce', 'Další projektil proráží první cíl a pokračuje dál.', 'pickle_crossfire', 'pickle_throw', { projectileCountDelta: 1, pierceDelta: 1, areaRadiusMult: 1.08 }),
      makeChoice('pickle_burst_5', 'Kyselá svačina', 'Kyselá svačina', 'Silnější porce proráží první cíl a drží svižné tempo.', 'pickle_burst', 'pickle_throw', { baseDamageMult: 1.18, pierceDelta: 1, cooldownMult: 0.97 }),
    ],
    8: [
      makeChoice('pickle_crowd_8', 'Velká okurková porce', 'Velká okurková porce', 'Více projektilů rozpráší houf ve větším záběru a letí přes první cíle.', 'big_pickle_scatter', 'pickle_throw', { projectileCountDelta: 1, pierceDelta: 1, areaRadiusMult: 1.10, cooldownMult: 0.94 }),
      makeChoice('pickle_burst_8', 'Kyselý déšť', 'Kyselý déšť', 'Silnější projektily, průraz a svižnější kadence udělají z porce pořádný fofr.', 'pickle_rain', 'pickle_throw', { baseDamageMult: 1.24, pierceDelta: 1, cooldownMult: 0.94 }),
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

export const WEAPON_RANK_DEFS: Record<WeaponId, WeaponRankDef[]> = Object.fromEntries(
  WEAPONS.map((id) => {
    const choices = MILESTONES[id];
    return [
      id,
      [
        makeRank(1),
        makeRank(2),
        makeRank(3, choices[3]),
        makeRank(4),
        makeRank(5, choices[5]),
        makeRank(6),
        makeRank(7),
        makeRank(8, choices[8]),
      ],
    ];
  }),
) as Record<WeaponId, WeaponRankDef[]>;

const ALIASES: Record<string, WeaponId> = {
  cane: 'osikovy_prut',
  osikovy_prut: 'osikovy_prut',
  valecnice: 'valecnice',
  'cesnekova-topinka': 'cesnekova_topinka',
  cesnekova_topinka: 'cesnekova_topinka',
  'kysela-okurka': 'kysele_okurky',
  kysele_okurky: 'kysele_okurky',
};

export function getWeaponRankDef(id: string, rank: number): WeaponRankDef | undefined {
  const canonical = ALIASES[id];
  const safeRank = Math.floor(rank);
  return canonical && safeRank >= 1 && safeRank <= 8
    ? WEAPON_RANK_DEFS[canonical][safeRank - 1]
    : undefined;
}

export function getMilestoneChoices(id: string, rank: number): [MilestoneChoice, MilestoneChoice] | undefined {
  return getWeaponRankDef(id, rank)?.choices;
}

export function getMilestoneChoice(id: string, rank: number, choiceId: string): MilestoneChoice | undefined {
  return getMilestoneChoices(id, rank)?.find((item) => item.id === choiceId);
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
  const canonical = ALIASES[id];
  const safeLevel = Math.min(8, Math.max(1, Math.floor(level || 1)));
  const stats: WeaponStats = {
    damageMult: 1 + (safeLevel - 1) * 0.12,
    cooldownMult: 1,
    areaRadiusMult: 1 + (safeLevel - 1) * 0.06,
    pierce: 0,
    projectileCount: 0,
    knockbackMult: 1,
    statusDurationSec: 0,
  };
  if (!canonical) return stats;

  for (const rank of [3, 5, 8] as const) {
    if (safeLevel < rank) continue;
    const choiceId = w?.milestones?.[rank];
    if (!choiceId) continue;
    const selected = WEAPON_RANK_DEFS[canonical][rank - 1].choices?.find((item) => item.id === choiceId);
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
  }

  return stats;
}

export function validateWeaponMilestones(): true {
  const seen = new Set<string>();
  for (const id of WEAPONS) {
    const defs = WEAPON_RANK_DEFS[id];
    if (defs.length !== 8) throw new Error(id + ': expected exactly 8 ranks');
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
