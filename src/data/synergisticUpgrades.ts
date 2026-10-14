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

const PROJECTILE_UPGRADE_WEAPONS: Array<{ id: WeaponId; name: string }> = [
  { id: 'kysela_okurka', name: 'Kyselá okurka' },
  { id: 'povidlove_buchty', name: 'Povidlové buchty' },
  { id: 'devatero_kviti', name: 'Devatero kvítí' },
  { id: 'snehova_koule', name: 'Sněhová koule' },
  { id: 'kynuty_kolac', name: 'Kynutý koláč' },
  { id: 'horky_brambor', name: 'Horký brambor' },
  { id: 'vceli_roj', name: 'Včelí roj' },
  { id: 'svecena_kropenka', name: 'Kropenka se svěcenou vodou' },
];

for (const weapon of PROJECTILE_UPGRADE_WEAPONS) {
  const definitions: Array<{
    suffix: string;
    name: string;
    description: string;
    archetype: SynergisticArchetype;
    statModifiers: SynergisticUpgradeDef['statModifiers'];
  }> = [
    {
      suffix: 'proj_barrage',
      name: 'Kobercový nálet',
      description: `+130 % projektilů, −30 % poškození pro ${weapon.name}.`,
      archetype: 'swarm',
      statModifiers: { projectileCountMult: 2.3, baseDamageMult: 0.70 },
    },
    {
      suffix: 'cd_hyper',
      name: 'Rychlopalný mechanismus',
      description: `−30 % cooldownu pro ${weapon.name}.`,
      archetype: 'tempo',
      statModifiers: { cooldownMult: 0.70 },
    },
    {
      suffix: 'dmg_heavy',
      name: 'Těžká munice',
      description: `+100 % poškození pro ${weapon.name}.`,
      archetype: 'burst',
      statModifiers: { baseDamageMult: 2.0 },
    },
  ];

  for (const definition of definitions) {
    const id = `${definition.suffix}_${weapon.id}`;
    SYNERGISTIC_UPGRADES[id] = {
      id,
      weaponId: weapon.id,
      name: definition.name,
      description: definition.description,
      archetype: definition.archetype,
      statModifiers: definition.statModifiers,
    };
  }
}


 
// Shared specializations for every weapon that fires actual projectiles.
// Values map to the existing WeaponStats calculation: +130% count means x2.3.
  return upgrades;
})();



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
