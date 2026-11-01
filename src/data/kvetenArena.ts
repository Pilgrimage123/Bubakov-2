/**
 * Květen v Hrusicích – Arena Geometry, POIs, Obstacles & Environmental Rules (5. úroveň)
 *
 * Implements the May village arena for Stage 5 ("5. Květen v Hrusicích – Májová slavnost"):
 * - Uses the exact same physical arena boundaries (-1920..1920 x -1675..1675) and obstacle layout
 *   as Stage 1 (Březen), but completely transformed by May seasonal motifs from Josef Lada's "Květen":
 *   - Ornate outer border with KVĚTEN banner, crawling cockchafers (chrousti), and lilac blossoms.
 *   - Central village green with the tall decorated Maypole (Májka) and circle dancers in folk costumes.
 *   - Wayside roadside post with framed image of Sv. Jan Nepomucký (feast May 16) with 5-star halo.
 *   - Upper pasture with grazing sheep and flute-playing shepherd ("V máji nemá pastýřovi oschnout hůl").
 *   - Blooming orchard by the hilltop church where maidens weave flower wreaths (vití věnečků).
 *   - Warm open brook shallows where barefoot boys splash and play by the watermill.
 *   - Lower goat grove with spotted goats ("Máj, vyženeme kozy v háj").
 *   - Fully thawed warm water in pond and stream (no winter ice floes, lush water lilies).
 */

import {
  MARCH_ARENA_BOUNDS,
  MARCH_THAW_OBSTACLES,
  MARCH_FOREST_ZONES,
  MARCH_THAW_ROOF_ZONES,
  MARCH_POND_REGION,
  MARCH_BRIDGE_BOUNDS,
  MARCH_STREAM_WAYPOINTS,
  clampToMarchArenaBounds,
  resolveMarchThawObstacles,
  collideCircleWithObstacles,
  hasTerrainLineOfSight,
  hasRoofsInView,
  isEntityBehindMarchRoof,
  isPointInMarchPondWater,
  isPointOnMarchBridge,
  isPointInMarchStreamWater,
  isAquaticEnemy,
} from './marchThawArena';

export type KvetenPoiId =
  | 'fields'
  | 'church'
  | 'tavern'
  | 'village'
  | 'school'
  | 'pond'
  | 'mill'
  | 'forest'
  | 'shrine';

export interface KvetenPoi {
  id: KvetenPoiId;
  title: string;
  x: number;
  y: number;
  radius: number;
  hint: string;
}

export const KVETEN_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const KVETEN_OBSTACLES = MARCH_THAW_OBSTACLES;
export const KVETEN_FOREST_ZONES = MARCH_FOREST_ZONES;
export const KVETEN_ROOF_ZONES = MARCH_THAW_ROOF_ZONES;
export const KVETEN_POND_REGION = MARCH_POND_REGION;
export const KVETEN_BRIDGE_BOUNDS = MARCH_BRIDGE_BOUNDS;
export const KVETEN_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;

/**
 * Landmarks and Tactical POIs for Stage 5 ("Májová slavnost").
 * Fully preserving Stage 1 coordinates, transformed with May folklore motifs.
 */
export const KVETEN_POIS: Record<KvetenPoiId, KvetenPoi> = {
  fields: {
    id: 'fields',
    title: 'Májové pastviny a ovce',
    x: 225,
    y: -975,
    radius: 340,
    hint: 'PASTVINY: Pastýř s píšťalou pod májovým deštíkem („V máji nemá pastýři oschnout hůl“) — +15 % rychlost a zlaté zrní!',
  },
  church: {
    id: 'church',
    title: 'Kostel na vrchu a věnečky',
    x: -800,
    y: -650,
    radius: 320,
    hint: 'KOSTEL: Kvetoucí sad, vití věnečků a májová zvonice [E] — svaté požehnání a +20 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Májová hospoda',
    x: 440,
    y: -75,
    radius: 260,
    hint: 'HOSPODA: Májový ležák a posvícenské koláče [E] — kuráž (+20 % útok)!',
  },
  village: {
    id: 'village',
    title: 'Náves s májkou a krojovaný tanec',
    x: 50,
    y: -75,
    radius: 360,
    hint: 'MÁJKA A TANEČNÍCI: Ochranná aura vysoké májky s pentlemi (+25 % obrana a rychlejší regenerace)!',
  },
  school: {
    id: 'school',
    title: 'Májová škola',
    x: 125,
    y: 550,
    radius: 240,
    hint: 'ŠKOLA: Šeříkem vyzdobená škola — bystrá mysl (+15 % dosah sběru)!',
  },
  pond: {
    id: 'pond',
    title: 'Vyhřátý rybník Brčálník',
    x: -725,
    y: 615,
    radius: 350,
    hint: 'RYBNÍK: Vyhřátá voda plná žab a leknínů, vodníci číhají v rákosí!',
  },
  mill: {
    id: 'mill',
    title: 'Mlýn a koupaliště v potoce',
    x: 650,
    y: 725,
    radius: 225,
    hint: 'MLÝN: Chlapci se cachtají v potoce u stavidla — svěží proud!',
  },
  forest: {
    id: 'forest',
    title: 'Májový kozí háj',
    x: -1225,
    y: -475,
    radius: 340,
    hint: 'KOZÍ HÁJ: „Máj, vyženeme kozy v háj“ — lesní úkryt před útoky!',
  },
  shrine: {
    id: 'shrine',
    title: 'Sloup sv. Jana Nepomuckého',
    x: -675,
    y: -38,
    radius: 190,
    hint: 'SV. JAN NEPOMUCKÝ: Poutní sloup sv. Jana Nepomuckého (svátek 16. května) — posvátná aura zahání kletby!',
  },
};

export const KVETEN_POIS_LIST: KvetenPoi[] = Object.values(KVETEN_POIS);

export const KVETEN_NIGHT_POIS: Record<KvetenPoiId, KvetenPoi> = {
  fields: {
    id: 'fields',
    title: 'Opuštěné pastviny pod hvězdami',
    x: 225,
    y: -975,
    radius: 340,
    hint: 'NOČNÍ PASTVINY: Pastýř zahnal ovce do ovčína — chladná májová rosa na pažitu zrychluje krok (+15 %)!',
  },
  church: {
    id: 'church',
    title: 'Noční kostel a šeříkový sad',
    x: -800,
    y: -650,
    radius: 320,
    hint: 'KOSTEL V NOCI: Půlnoční májová zvonice [E] — zahání noční můry, umrlce a dává +20 % zbroj!',
  },
  tavern: {
    id: 'tavern',
    title: 'Rozsvícená májová hospoda',
    x: 440,
    y: -75,
    radius: 260,
    hint: 'NOČNÍ HOSPODA: Tanečníci z návsi popíjejí uvnitř — májový džbánek [E] dodá kuráž (+20 % útok)!',
  },
  village: {
    id: 'village',
    title: 'Zšeřelá májka a svítící chalupy',
    x: 50,
    y: -75,
    radius: 360,
    hint: 'NOČNÍ MÁJKA: Náves utichla, okna chalup hřejí a lucerny u májky dávají +25 % obranu a regeneraci!',
  },
  school: {
    id: 'school',
    title: 'Ztichlá škola u šeříků',
    x: 125,
    y: 550,
    radius: 240,
    hint: 'ŠKOLA V NOCI: Vůně nočního šeříku bystří smysly ve tmě (+20 % dosah sběru a +15 % kadence)!',
  },
  pond: {
    id: 'pond',
    title: 'Měsíční rybník s rejem bludiček',
    x: -725,
    y: 615,
    radius: 350,
    hint: 'NOČNÍ RYBNÍK: Mezi lekníny krouží barevná hejna bludiček — pozor na topivce v hlubině!',
  },
  mill: {
    id: 'mill',
    title: 'Prokletý mlýn a noční náhon',
    x: 650,
    y: 725,
    radius: 225,
    hint: 'NOČNÍ MLÝN: Chlapci už spí doma a u stavidel číhá Prokletý Mlynář — proud strhává kostlivce!',
  },
  forest: {
    id: 'forest',
    title: 'Hluboký Hejkalův hvozd',
    x: -1225,
    y: -475,
    radius: 340,
    hint: 'HEJKALŮV HVOZD: Kozy jsou v chlévě a v lese planou oči Půlnočního Hejkala (+15 % krytí ve větvích)!',
  },
  shrine: {
    id: 'shrine',
    title: 'Sv. Jan Nepomucký se svatojánskými muškami',
    x: -675,
    y: -38,
    radius: 190,
    hint: 'SV. JAN NEPOMUCKÝ: Pět hvězd a roj svatojánských mušek [E] prozařuje tmu a zahání kletby Hejkala!',
  },
};

export const KVETEN_NIGHT_POIS_LIST: KvetenPoi[] = Object.values(KVETEN_NIGHT_POIS);

export function getKvetenPois(isNight = false): Record<KvetenPoiId, KvetenPoi> {
  return isNight ? KVETEN_NIGHT_POIS : KVETEN_POIS;
}
export function getKvetenPoisList(isNight = false): KvetenPoi[] {
  return isNight ? KVETEN_NIGHT_POIS_LIST : KVETEN_POIS_LIST;
}

export function isInsideKvetenPoi(x: number, y: number, poi: KvetenPoi, padding = 0): boolean {
  const dx = x - poi.x;
  const dy = y - poi.y;
  const maxR = poi.radius + padding;
  return dx * dx + dy * dy <= maxR * maxR;
}

export function resolveKvetenObstacles(
  entity: { x: number; y: number; radius?: number },
  isFlying = false
): void {
  resolveMarchThawObstacles(entity, isFlying);
}

export function collideCircleWithKvetenObstacles(
  x: number,
  y: number,
  radius: number,
  decorList: any[] = []
) {
  return collideCircleWithObstacles(x, y, radius, 4, decorList);
}

export function hasKvetenTerrainLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  decorList: any[] = []
): boolean {
  return hasTerrainLineOfSight(x1, y1, x2, y2, 4, decorList);
}

export function hasKvetenRoofsInView(camera: { x: number; y: number; width?: number; height?: number }, decor?: any[]): boolean {
  const w = camera.width || 1280;
  const h = camera.height || 720;
  return hasRoofsInView(4, decor, camera.x - w / 2, camera.y - h / 2, camera.x + w / 2, camera.y + h / 2);
}

export function isEntityBehindKvetenRoof(
  entity: { x: number; y: number; radius?: number },
  decor?: any[],
  headOffset = 24
) {
  return isEntityBehindMarchRoof(entity.x, entity.y - headOffset, 4, decor, entity.radius || 18);
}

/**
 * Returns water effect for May (warm water with ripples and swimming water lilies, without ice floes).
 */
export function getKvetenWaterEffect(
  x: number,
  y: number,
  time: number
): { inOpenWater: boolean; carryVx: number; carryVy: number } {
  const onBridge = isPointOnMarchBridge(x, y);
  if (onBridge) {
    return { inOpenWater: false, carryVx: 0, carryVy: 0 };
  }

  const streamInfo = isPointInMarchStreamWater(x, y);
  if (streamInfo.inStream) {
    // Gentle warm spring water current (streamInfo.vx/vy is pre-scaled to 68 px/s)
    const currentSpeed = 22;
    return {
      inOpenWater: true,
      carryVx: (streamInfo.vx / 68) * currentSpeed,
      carryVy: (streamInfo.vy / 68) * currentSpeed,
    };
  }

  const inPond = isPointInMarchPondWater(x, y);
  if (inPond) {
    return {
      inOpenWater: true,
      carryVx: Math.sin(time * 0.8) * 4,
      carryVy: Math.cos(time * 0.8) * 4,
    };
  }

  return { inOpenWater: false, carryVx: 0, carryVy: 0 };
}
