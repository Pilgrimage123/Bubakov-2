import { describe, it, expect } from 'vitest';
import { ENEMIES } from '../src/data/enemies';
import { GAME_LEVELS } from '../src/data/levels';
import { UNHOLY_ENEMY_IDS } from '../src/data/holy';

describe('Level 7: Tactical Červen Enemies, Swarms & Difficulty (+200%)', () => {
  it('registers River Crayfish (rak_ricni) with high defense and normal attack cadence', () => {
    const rak = ENEMIES.rak_ricni;
    expect(rak).toBeDefined();
    expect(rak.id).toBe('rak_ricni');
    expect(rak.name).toBe('Říční rak klepetáč');
    expect(rak.category).toBe('nature');
    expect(rak.hp).toBeGreaterThanOrEqual(180);
    expect(rak.poiseResist).toBeGreaterThanOrEqual(0.6);
    expect(rak.attackCadence).toBe('normal');
    expect(rak.strength).toContain('Čelní krunýř');
  });

  it('registers Blueberry Imp (boruvkovy_diblik) with forest berry-throwing capability', () => {
    const diblik = ENEMIES.boruvkovy_diblik;
    expect(diblik).toBeDefined();
    expect(diblik.id).toBe('boruvkovy_diblik');
    expect(diblik.name).toBe('Borůvkový diblík');
    expect(diblik.category).toBe('nature');
    expect(diblik.speed).toBeGreaterThanOrEqual(100);
    expect(diblik.attackCadence).toBe('fast');
    expect(diblik.strength).toContain('borůvky');
  });

  it('registers Field Mice Swarm (roj_polnich_mysaku) with blistering 145+ speed and rapid attack cadence', () => {
    const mice = ENEMIES.roj_polnich_mysaku;
    expect(mice).toBeDefined();
    expect(mice.id).toBe('roj_polnich_mysaku');
    expect(mice.name).toBe('Roj polních myšáků');
    expect(mice.category).toBe('swarms');
    expect(mice.speed).toBeGreaterThanOrEqual(145);
    expect(mice.attackCadence).toBe('fast');
    expect(mice.attackInterval).toBeLessThanOrEqual(0.5);
  });

  it('registers Soot Devil Swarm (pekelny_roj_sazovniku) as an unholy flying imp swarm', () => {
    const soot = ENEMIES.pekelny_roj_sazovniku;
    expect(soot).toBeDefined();
    expect(soot.id).toBe('pekelny_roj_sazovniku');
    expect(soot.name).toBe('Pekelný roj sazovníků');
    expect(soot.category).toBe('swarms');
    expect(soot.isFlying).toBe(true);
    expect(soot.attackCadence).toBe('fast');
    expect(UNHOLY_ENEMY_IDS.has('pekelny_roj_sazovniku')).toBe(true);
  });

  it('scales June enemy stats and kill requirements by +200% (3x) over Stage 1', () => {
    const stage1 = GAME_LEVELS[0];
    const stage7 = GAME_LEVELS[6];

    // Stage 1 required kills vs Stage 7 required kills
    const stage1FinalKills = stage1.finalBoss.kills; // 220
    const stage7FinalKills = stage7.finalBoss.kills; // 350
    expect(stage7FinalKills).toBeGreaterThan(stage1FinalKills);

    // Regular mob comparison: Stage 1 zaba/rarach HP vs Stage 7 rak_ricni/diblik
    expect(ENEMIES.rak_ricni.hp).toBeGreaterThanOrEqual(ENEMIES.zaba.hp * 4);
    expect(ENEMIES.cert_sekac.hp).toBeGreaterThanOrEqual(3000);
    expect(stage7.miniBoss.multiplier).toBeGreaterThanOrEqual(0.9);
  });

  it('strictly excludes all undead from all spawn pools of Stage 7 while including devils and new swarms', () => {
    const stage7 = GAME_LEVELS[6];
    const allSpawns = Object.values(stage7.spawnPools).flat();

    const undeadBlacklist = [
      'skeleton',
      'kostlivec',
      'kostlivec_kosa',
      'skeleton_scythe',
      'krvavy_kostlivec',
      'umrlec',
      'bila_pani',
      'bezhlavy_rytir',
      'zbrojnos',
      'hrobnik',
      'stodolnik',
    ];

    for (const mob of undeadBlacklist) {
      expect(allSpawns).not.toContain(mob);
    }

    // Required thematic units present
    expect(allSpawns).toContain('roj_polnich_mysaku');
    expect(allSpawns).toContain('pekelny_roj_sazovniku');
    expect(allSpawns).toContain('rak_ricni');
    expect(allSpawns).toContain('certik');
    expect(allSpawns).toContain('pekelny_cert');
    expect(allSpawns).toContain('pekelny_drab');
    expect(allSpawns).toContain('polednice');
  });
});
