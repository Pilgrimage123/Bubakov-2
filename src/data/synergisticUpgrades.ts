import type { WeaponId, SynergisticUpgradeDef } from '../types';

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
    description: '+55 % poškození, -10 % cooldown. Silný výpad těžkými křupavými okurkami.',
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
    description: '+40 % dosah švihu, -15 % cooldown, -20 % poškození.',
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
    description: '+65 % poškození, +50 % odhození, +15 % cooldown.',
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
    description: '+50 % poškození, +40 % trvání mlsání, -10 % cooldown.',
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
    description: '+40 % dosah oběhu, -20 % cooldown, -15 % poškození.',
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
    description: '+60 % poškození, +2 průraz, -12 % cooldown.',
    archetype: 'burst',
    statModifiers: {
      baseDamageMult: 1.60,
      pierceDelta: 2,
      cooldownMult: 0.88,
    },
  },
};

export function getSynergisticUpgradesForWeapon(weaponId: string): SynergisticUpgradeDef[] {
  return Object.values(SYNERGISTIC_UPGRADES).filter((item) => item.weaponId === weaponId);
}

export function getSynergisticUpgrade(id: string): SynergisticUpgradeDef | undefined {
  return SYNERGISTIC_UPGRADES[id];
}
