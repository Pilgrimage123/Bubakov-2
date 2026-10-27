import type { WeaponId, SynergisticArchetype, SynergisticUpgradeDef } from '../types';

export const SYNERGISTIC_UPGRADES: Record<string, SynergisticUpgradeDef> = {
  // Kyselá okurka
  pickle_flood: {
    id: 'pickle_flood',
    weaponId: 'kysela_okurka',
    name: 'Záplava okurek',
    description: '+130 % projektilů, -30 % poškození. Pokryje bojiště salvou drobnějších okurek.',
    archetype: 'swarm',
    statModifiers: {
      projectileCountMult: 2.3,
      baseDamageMult: 0.70,
    },
  },
  pickle_crunch: {
    id: 'pickle_crunch',
    weaponId: 'kysela_okurka',
    name: 'Kyselý koncentrát',
    description: '+55 % poškození, +12 % nabíjení. Silný výpad těžkými křupavými okurkami.',
    archetype: 'burst',
    statModifiers: {
      baseDamageMult: 1.55,
      cooldownMult: 0.90,
    },
  },

  // Osikový prut
  cane_whirl: {
    id: 'cane_whirl',
    weaponId: 'osikovy_prut',
    name: 'Proutěný vír',
    description: '+40 % dosah švihu, +20 % nabíjení, -20 % poškození.',
    archetype: 'swarm',
    statModifiers: {
      areaRadiusMult: 1.40,
      cooldownMult: 0.85,
      baseDamageMult: 0.80,
    },
  },
  cane_heavy: {
    id: 'cane_heavy',
    weaponId: 'osikovy_prut',
    name: 'Bukový mlat',
    description: '+65 % poškození, +50 % odhození, -15 % nabíjení.',
    archetype: 'heavy',
    statModifiers: {
      baseDamageMult: 1.65,
      knockbackMult: 1.50,
      cooldownMult: 1.15,
    },
  },

  // Povidlové buchty
  buns_generosity: {
    id: 'buns_generosity',
    weaponId: 'povidlove_buchty',
    name: 'Cukrářská štědrost',
    description: '+120 % buchet v salvě, -30 % doba mlsání.',
    archetype: 'swarm',
    statModifiers: {
      projectileCountMult: 2.2,
      baseDamageMult: 0.85,
    },
  },
  buns_dense: {
    id: 'buns_dense',
    weaponId: 'povidlove_buchty',
    name: 'Hutné povidlí',
    description: '+50 % poškození, +40 % trvání mlsání, +12 % nabíjení.',
    archetype: 'burst',
    statModifiers: {
      baseDamageMult: 1.50,
      cooldownMult: 0.90,
      statusDurationSec: 2.5,
    },
  },

  // Válečnice
  valecnice_orbit: {
    id: 'valecnice_orbit',
    weaponId: 'valecnice',
    name: 'Rychlé válení',
    description: '+40 % dosah oběhu, +25 % nabíjení, -15 % poškození.',
    archetype: 'tempo',
    statModifiers: {
      areaRadiusMult: 1.40,
      cooldownMult: 0.80,
      baseDamageMult: 0.85,
    },
  },
  valecnice_strike: {
    id: 'valecnice_strike',
    weaponId: 'valecnice',
    name: 'Rázný váleček',
    description: '+60 % poškození, +30 % odhození.',
    archetype: 'heavy',
    statModifiers: {
      baseDamageMult: 1.60,
      knockbackMult: 1.30,
    },
  },

  // Kovářské vidle
  pitchfork_spread: {
    id: 'pitchfork_spread',
    weaponId: 'kovarske_vidle',
    name: 'Trojitý bodec',
    description: '+100 % hrotů (širší vějíř), -25 % poškození.',
    archetype: 'swarm',
    statModifiers: {
      projectileCountMult: 2.0,
      baseDamageMult: 0.75,
    },
  },
  pitchfork_pierce: {
    id: 'pitchfork_pierce',
    weaponId: 'kovarske_vidle',
    name: 'Kalená ocel',
    description: '+60 % poškození, +2 průraz, +15 % nabíjení.',
    archetype: 'burst',
    statModifiers: {
      baseDamageMult: 1.60,
      pierceDelta: 2,
      cooldownMult: 0.88,
    },
  },

  // Dřevěný cep na obilí
  flail_threshing_stance: {
    id: 'flail_threshing_stance',
    weaponId: 'dreveny_cep',
    name: 'Pevný postoj na mlatu',
    description: '+45 % kritické poškození, +40 % kritický odhoz, +12 % šance na kritický zásah, +25 % základní poškození i odhoz.',
    archetype: 'heavy',
    statModifiers: {
      baseDamageMult: 1.25,
      knockbackMult: 1.25,
      critChanceBonus: 0.12,
      critDamageMult: 1.45,
      critKnockbackMult: 1.40,
    },
  },
  flail_barn_sweep: {
    id: 'flail_barn_sweep',
    weaponId: 'dreveny_cep',
    name: 'Výprask ve stodole',
    description: '+30 % poloměr rázové vlny, +15 % nabíjení, +25 % kritický odhoz.',
    archetype: 'burst',
    statModifiers: {
      areaRadiusMult: 1.30,
      cooldownMult: 0.87,
      critKnockbackMult: 1.25,
    },
  },
};


export const SYNERGISTIC_UPGRADES_BY_WEAPON: Record<string, SynergisticUpgradeDef[]> = {};
for (const upgrade of Object.values(SYNERGISTIC_UPGRADES)) {
  if (!SYNERGISTIC_UPGRADES_BY_WEAPON[upgrade.weaponId]) {
    SYNERGISTIC_UPGRADES_BY_WEAPON[upgrade.weaponId] = [];
  }
  SYNERGISTIC_UPGRADES_BY_WEAPON[upgrade.weaponId].push(upgrade);
}

export function getSynergisticUpgradesForWeapon(weaponId: string): SynergisticUpgradeDef[] {
  return SYNERGISTIC_UPGRADES_BY_WEAPON[weaponId] || [];
}

export function getSynergisticUpgrade(id: string): SynergisticUpgradeDef | undefined {
  return SYNERGISTIC_UPGRADES[id];
}
