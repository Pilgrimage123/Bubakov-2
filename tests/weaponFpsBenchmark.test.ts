import { describe, it, expect } from 'vitest';
import {
  runDeterministicWeaponStressBenchmark,
  type WeaponStressBenchmarkResult,
} from '../src/game/benchmark';

describe('Weapon FPS Performance Benchmark & Ranking', () => {
  const CANONICAL_WEAPONS: { id: string; name: string }[] = [
    { id: 'povidlove_buchty', name: 'Povidlové buchty' },
    { id: 'osikovy_prut', name: 'Osikový prut' },
    { id: 'hromnicka', name: 'Hromnička' },
    { id: 'kovarske_vidle', name: 'Kovářské vidle' },
    { id: 'kovana_halapartna', name: 'Kovaná halapartna' },
    { id: 'dreveny_cep', name: 'Dřevěný cep' },
    { id: 'devatero_kviti', name: 'Devatero kvítí' },
    { id: 'snehova_koule', name: 'Sněhová koule' },
    { id: 'kynuty_kolac', name: 'Kynutý koláč' },
    { id: 'horky_brambor', name: 'Horký brambor' },
    { id: 'vceli_roj', name: 'Včelí roj' },
    { id: 'svecena_kropenka', name: 'Svěcená kropenka' },
    { id: 'valecnice', name: 'Válečnice' },
    { id: 'cesnekova_topinka', name: 'Česneková topinka' },
    { id: 'kysela_okurka', name: 'Kyselá okurka' },
    { id: 'bylinkova_fajfka', name: 'Bylinková fajfka' },
    { id: 'formansky_bic', name: 'Formanský bič' },
    { id: 'splaseny_houser', name: 'Splašený houser' },
  ];

  it('profiles all 18 weapons at Rank 8 and ranks them by performance intensity', () => {
    const results: (WeaponStressBenchmarkResult & { name: string })[] = [];

    for (const w of CANONICAL_WEAPONS) {
      const res = runDeterministicWeaponStressBenchmark({
        weaponId: w.id,
        level: 8,
        profile: 'balanced',
        frameCount: 120,
        enemyCount: 50,
      });
      results.push({ ...res, name: w.name });
    }

    // Sort descending by p95 frame time (highest ms = most demanding)
    results.sort((a, b) => b.p95Ms - a.p95Ms);

    // Format console ranking table
    console.log('\n==================================================================================================');
    console.log('       ŽEBŘÍČEK VÝKONNOSTNÍ NÁROČNOSTI ZBRANÍ (Rank 8, Balanced Profile, 50 nepřátel, 120 snímků)');
    console.log('==================================================================================================');
    console.log(
      'Pořadí'.padEnd(7) +
      'Zbraň'.padEnd(22) +
      'p95 (ms)'.padEnd(11) +
      'p50 (ms)'.padEnd(11) +
      'Průměr'.padEnd(11) +
      'Simulace'.padEnd(11) +
      'Render'.padEnd(11) +
      'Střely (celk)'.padEnd(15) +
      'Seky (celk)'
    );
    console.log('------------------------------------------------------------------------------------------------------------------');

    results.forEach((r, idx) => {
      const rankStr = `${idx + 1}.`.padEnd(7);
      const nameStr = r.name.padEnd(22);
      const p95Str = `${r.p95Ms.toFixed(3)} ms`.padEnd(11);
      const p50Str = `${r.p50Ms.toFixed(3)} ms`.padEnd(11);
      const meanStr = `${r.meanMs.toFixed(3)} ms`.padEnd(11);
      const simStr = `${r.phaseAverages.simulation.toFixed(3)} ms`.padEnd(11);
      const renStr = `${r.phaseAverages.render.toFixed(3)} ms`.padEnd(11);
      const projStr = `${r.totalSpawned.projectiles}`.padEnd(15);
      const slashStr = `${r.totalSpawned.slashes}`;

      console.log(`${rankStr}${nameStr}${p95Str}${p50Str}${meanStr}${simStr}${renStr}${projStr}${slashStr}`);
    });
    console.log('==================================================================================================================\n');

    expect(results).toHaveLength(18);

    // Every weapon must pass the 60 FPS safety budget (< 16.7 ms)
    for (const res of results) {
      expect(res.p95Ms).toBeLessThan(16.7);
    }
  });
});
