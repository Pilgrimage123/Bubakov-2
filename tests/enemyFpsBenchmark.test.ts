import { describe, it, expect } from 'vitest';
import {
  runDeterministicEnemyStressBenchmark,
  type EnemyStressBenchmarkResult,
} from '../src/game/benchmark';
import { ENEMIES } from '../src/data/enemies';

describe('Enemy FPS Performance Benchmark & Ranking', () => {
  it('profiles all canonical enemies under 40-entity stress and ranks them by performance intensity', () => {
    const enemyIds = Object.keys(ENEMIES);
    const results: (EnemyStressBenchmarkResult & { name: string })[] = [];

    for (const id of enemyIds) {
      const def = ENEMIES[id];
      const res = runDeterministicEnemyStressBenchmark({
        enemyId: id,
        profile: 'balanced',
        frameCount: 120,
        enemyCount: 40,
      });
      results.push({ ...res, name: def.name || id });
    }

    // Sort descending by p95 frame time (highest ms = most demanding)
    results.sort((a, b) => b.p95Ms - a.p95Ms);

    // Format console ranking table
    console.log('\n==================================================================================================================');
    console.log('       ŽEBŘÍČEK VÝKONNOSTNÍ NÁROČNOSTI STRAŠIDEL (Balanced Profile, 40 instancí, 120 snímků)');
    console.log('==================================================================================================================');
    console.log(
      'Pořadí'.padEnd(7) +
      'Strašidlo'.padEnd(26) +
      'ID'.padEnd(20) +
      'p95 (ms)'.padEnd(11) +
      'p50 (ms)'.padEnd(11) +
      'Průměr'.padEnd(11) +
      'Simulace'.padEnd(11) +
      'Render'.padEnd(11) +
      'Střely'.padEnd(8) +
      'Částice'
    );
    console.log('------------------------------------------------------------------------------------------------------------------');

    results.forEach((r, idx) => {
      const rankStr = `${idx + 1}.`.padEnd(7);
      const nameStr = r.name.padEnd(26);
      const idStr = r.enemyId.padEnd(20);
      const p95Str = `${r.p95Ms.toFixed(3)} ms`.padEnd(11);
      const p50Str = `${r.p50Ms.toFixed(3)} ms`.padEnd(11);
      const meanStr = `${r.meanMs.toFixed(3)} ms`.padEnd(11);
      const simStr = `${r.phaseAverages.simulation.toFixed(3)} ms`.padEnd(11);
      const renStr = `${r.phaseAverages.render.toFixed(3)} ms`.padEnd(11);
      const projStr = `${r.peakEntities.projectiles}`.padEnd(8);
      const partStr = `${r.peakEntities.particles}`;

      console.log(`${rankStr}${nameStr}${idStr}${p95Str}${p50Str}${meanStr}${simStr}${renStr}${projStr}${partStr}`);
    });
    console.log('==================================================================================================================\n');

    expect(results).toHaveLength(enemyIds.length);

    // Every enemy under 40-instance stress must remain within the 60 FPS safety budget (< 16.7 ms)
    for (const res of results) {
      expect(res.p95Ms).toBeLessThan(16.7);
    }
  }, 30000);
});
