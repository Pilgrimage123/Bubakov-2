/**
 * Červen v Hrusicích – Arena Geometry, POIs, Obstacles & Environmental Rules (7. úroveň)
 *
 * Implements the June village and harvest arena for Stage 7 ("7. Červen v Hrusicích – Senoseč a pekelný žár"):
 * - Uses the exact same physical arena boundaries (-1920..1920 x -1675..1675) and base obstacle footprint
 *   as Stage 1 (Březen), completely transformed by June seasonal motifs from Josef Lada's "ČERVEN":
 *   - Ornate outer border with ČERVEN banner, meadow flowers (daisies, cornflowers, buttercups).
 *   - Golden haymaking meadows (senoseč) with horse-drawn hay wagons and haystacks (kopy sena)
 *     acting as tactical cover and pathing obstacles.
 *   - Pilgrimage tree shrine of St. Anthony of Padua (feast June 13) with framed icon, braided flower
 *     wreath, and squirrel in the foliage. Interactive blessing on [E] vacuum-pulls all loose drops and grants holy shield.
 *   - Shaded blueberry woods (Borůvkový háj) with gathering baskets and blueberry bushes interactive on [E].
 *   - Deep river weir and crayfish pools labeled "NA RACÍCH" where boys catch crayfish beneath willow roots.
 *   - Village tavern with shaded porch and cool buttermilk jugs interactive on [E].
 *   - Village green and hilltop church ringing bells against summer thunderstorms interactive on [E].
 *   - Fully thawed warm summer pond and brook with water lilies, without any winter ice.
 *   - Strictly zero graveyard, tombstone, or undead decor.
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
  type MarchObstacle,
} from './marchThawArena';

export type ArenaObstacle = MarchObstacle;

export type CervenPoiId =
  | 'fields'
  | 'church'
  | 'tavern'
  | 'village'
  | 'school'
  | 'pond'
  | 'mill'
  | 'forest'
  | 'shrine';

export interface CervenPoi {
  id: CervenPoiId;
  title: string;
  x: number;
  y: number;
  radius: number;
  hint: string;
  interactPrompt?: string;
}

export const CERVEN_ARENA_BOUNDS = MARCH_ARENA_BOUNDS;
export const CERVEN_FOREST_ZONES = MARCH_FOREST_ZONES;
export const CERVEN_ROOF_ZONES = MARCH_THAW_ROOF_ZONES;
export const CERVEN_POND_REGION = MARCH_POND_REGION;
export const CERVEN_BRIDGE_BOUNDS = MARCH_BRIDGE_BOUNDS;
export const CERVEN_STREAM_WAYPOINTS = MARCH_STREAM_WAYPOINTS;

/**
 * Tactical Haystack Obstacles scattered across the harvest fields.
 * These act as soft-cover obstacles that block straight enemy charges and direct projectile lines.
 */
export const CERVEN_HAYSTACK_OBSTACLES: ArenaObstacle[] = [
  { id: 'haystack_1', kind: 'prop', shape: 'circle', x: 160, y: -880, radius: 26 },
  { id: 'haystack_2', kind: 'prop', shape: 'circle', x: 290, y: -940, radius: 30 },
  { id: 'haystack_3', kind: 'prop', shape: 'circle', x: 380, y: -1080, radius: 28 },
  { id: 'haystack_4', kind: 'prop', shape: 'circle', x: 120, y: -1120, radius: 24 },
  { id: 'haystack_5', kind: 'prop', shape: 'circle', x: -80, y: -960, radius: 25 },
];

export const CERVEN_OBSTACLES: ArenaObstacle[] = [
  ...MARCH_THAW_OBSTACLES,
  ...CERVEN_HAYSTACK_OBSTACLES,
];

/**
 * Landmarks and Tactical POIs for Stage 7 ("Letní senoseč a pekelný žár").
 * Matching Stage 1 coordinates, transformed with authentic June folklore motifs.
 */
export const CERVEN_POIS: Record<CervenPoiId, CervenPoi> = {
  fields: {
    id: 'fields',
    title: 'Zlaté louky a senoseč',
    x: 225,
    y: -975,
    radius: 340,
    hint: 'SENOSEČ: Ženci nakládají voňavé seno na žebřiňák („Červen studený – sedláku milý“) — kupky sena brzdí dotírající havěť!',
    interactPrompt: 'Odpočinek ve stínu kupky sena [E]',
  },
  church: {
    id: 'church',
    title: 'Hrusický kostel a mrakozvon',
    x: -800,
    y: -650,
    radius: 320,
    hint: 'KOSTEL: Zvonice se zvonem zvonícím proti letní bouři [E] — svaté odražení a +20 % zbroj!',
    interactPrompt: 'Zazvonit proti mračnům a bleskům [E]',
  },
  tavern: {
    id: 'tavern',
    title: 'Letní hospoda pod lipou',
    x: 440,
    y: -75,
    radius: 260,
    hint: 'HOSPODA: Stinná pavlač s korbelem ležáku a džbánem chladného podmáslí [E] — Kuráž (+25 % útok)!',
    interactPrompt: 'Napít se chladivého podmáslí [E]',
  },
  village: {
    id: 'village',
    title: 'Hrusická náves a vozy',
    x: 50,
    y: -75,
    radius: 360,
    hint: 'NÁVES: Ruch okolo dřevěných trakařů a vozů se senem (+15 % rychlost pohybu)!',
  },
  school: {
    id: 'school',
    title: 'Hrusická škola a luční herbář',
    x: 125,
    y: 550,
    radius: 240,
    hint: 'ŠKOLA: Luční kvítí na zápražích a těšení na prázdniny — bystrá mysl (+20 % dosah sběru)!',
  },
  pond: {
    id: 'pond',
    title: 'Vyhřátý rybník s lekníny',
    x: -725,
    y: 615,
    radius: 350,
    hint: 'RYBNÍK: Teplá letní hladina bez ledových ker, husté rákosí a rozkvetlé lekníny.',
  },
  mill: {
    id: 'mill',
    title: 'Tůně „Na racích“ u jezu',
    x: 650,
    y: 725,
    radius: 225,
    hint: 'NA RACÍCH: Kamenitý jez pod vrbovými kořeny — hluboké tůně s obřími říčními raky!',
  },
  forest: {
    id: 'forest',
    title: 'Borůvkový háj a lesní jahody',
    x: -1225,
    y: -475,
    radius: 340,
    hint: 'BORŮVKOVÝ HÁJ: Stinný les plný nůší s borůvkami a lesními jahůdkami [E] — sladké osvěžení a zrychlení!',
    interactPrompt: 'Posbírat lesní borůvky a jahody [E]',
  },
  shrine: {
    id: 'shrine',
    title: 'Poutní strom Sv. Antonína Paduánského',
    x: -675,
    y: -38,
    radius: 190,
    hint: 'SV. ANTONÍN: Poutní kmen se zarámovaným obrazem a věncem z lučního kvítí [E] — přitáhne všechny ztracené kapky a dá svatý štít!',
    interactPrompt: 'Požehnání sv. Antonína: stáhnout všechny kapky [E]',
  },
};

export const CERVEN_POIS_LIST: CervenPoi[] = Object.values(CERVEN_POIS);

export const CERVEN_NIGHT_POIS: Record<CervenPoiId, CervenPoi> = {
  fields: {
    ...CERVEN_POIS.fields,
    title: 'Noční meze se svatojánským býlím (Severní lán)',
    hint: 'NOČNÍ MEZE: Tiché kupky sena voní mateřídouškou a v mezích září svatojánské byliny (+15 % krytí).',
  },
  church: {
    ...CERVEN_POIS.church,
    title: 'Kostel sv. Václava o svatojánské noci',
    hint: 'KOSTEL V NOCI: Kostelní okna hřejivě září do tmy; [E] Zazvoň na Půlnoční zvon (vystraší okolní běsy na 4 s)!',
    interactPrompt: 'Zazvonit na Půlnoční zvon [E]',
  },
  tavern: {
    ...CERVEN_POIS.tavern,
    title: 'Hospoda U Sejků o svatojánské noci',
    hint: 'HOSPODA V NOCI: Okna hospody teplounce svítí; [E] Svatojánské medové pivo (+35 Kuráž a +25 % poškození na 8 s)!',
    interactPrompt: 'Dát si svatojánské medové pivo [E]',
  },
  village: {
    ...CERVEN_POIS.village,
    title: 'Svatojánská náves s ohníčkem',
    hint: 'NÁVES V NOCI: Sekáči spí v chalupách, na návsi praská svatojánský ohníček a krouží svatojánské mušky.',
  },
  school: {
    ...CERVEN_POIS.school,
    title: 'Hrusická škola o letní noci',
    hint: 'ŠKOLA V NOCI: Školní okna jsou potmě, u dřevěného plotu kvete čarovný černobýl a routa.',
  },
  pond: {
    ...CERVEN_POIS.pond,
    title: 'Měsíční rybník s bludičkami a Rusalkou',
    hint: 'RYBNÍK V NOCI: V rákosí tančí bludičky a z hluboké tůně se ozývá vábivý zpěv Rusalky!',
  },
  mill: {
    ...CERVEN_POIS.mill,
    title: 'Noční jez a tůně pod vrbami',
    hint: 'JEZ V NOCI: Pod starými vrbami šplouchá černá voda, po proudu plují svatojánské věnečky.',
  },
  forest: {
    ...CERVEN_POIS.forest,
    title: 'Svatojánský hvozd a Poklad v zemi',
    hint: 'SVATOJÁNSKÝ HVOZD: Nasbírej devatero svatojánských bylin, aby v hvozdu rozkvetlo Zlaté kapradí a otevřelo Poklad v zemi! [E] Lesní studánka.',
    interactPrompt: 'Osvěžit se u lesní studánky [E]',
  },
  shrine: {
    ...CERVEN_POIS.shrine,
    title: 'Poutní strom Sv. Antonína se svatojánskými svíčkami',
    hint: 'SV. ANTONÍN V NOCI: Poutní kmen se svatojánskými svíčkami [E] — přitáhne ztracené kapky a daruje svatou záři!',
    interactPrompt: 'Svatojánské požehnání: stáhnout kapky [E]',
  },
};

export const CERVEN_NIGHT_POIS_LIST: CervenPoi[] = Object.values(CERVEN_NIGHT_POIS);

export function getCervenPois(isNight = false): Record<CervenPoiId, CervenPoi> {
  return isNight ? CERVEN_NIGHT_POIS : CERVEN_POIS;
}

export function getCervenPoisList(isNight = false): CervenPoi[] {
  return isNight ? CERVEN_NIGHT_POIS_LIST : CERVEN_POIS_LIST;
}

export interface SvatojanskaBylinaDef {
  id: string;
  name: string;
  nameCs?: string;
  icon?: string;
  color?: string;
  flowerColor: string;
  glowColor: string;
  x: number;
  y: number;
  poiId: CervenPoiId;
}

export interface SvatojanskaBylinaState extends SvatojanskaBylinaDef {
  collected: boolean;
}

export interface SvatojanskyPokladState {
  x: number;
  y: number;
  unlocked: boolean;
  opened: boolean;
  unlockTime: number;
}

export const SVATOJANSKE_BYLINY_DEFS: readonly SvatojanskaBylinaDef[] = [
  {
    id: 'trezalka',
    name: 'Třezalka svatojánská',
    flowerColor: '#FACC15',
    glowColor: '#FEF08A',
    x: CERVEN_POIS.fields.x - 160,
    y: CERVEN_POIS.fields.y + 70,
    poiId: 'fields',
  },
  {
    id: 'materidouska',
    name: 'Mateřídouška z mezí',
    flowerColor: '#C084FC',
    glowColor: '#E9D5FF',
    x: CERVEN_POIS.fields.x + 210,
    y: CERVEN_POIS.fields.y + 40,
    poiId: 'fields',
  },
  {
    id: 'lipovy_kvet',
    name: 'Květ staré lípy',
    flowerColor: '#FDE047',
    glowColor: '#FEF9C3',
    x: CERVEN_POIS.tavern.x + 135,
    y: CERVEN_POIS.tavern.y + 95,
    poiId: 'tavern',
  },
  {
    id: 'cernobyl',
    name: 'Čarovný černobýl',
    flowerColor: '#A3E635',
    glowColor: '#D9F99D',
    x: CERVEN_POIS.school.x - 140,
    y: CERVEN_POIS.school.y + 115,
    poiId: 'school',
  },
  {
    id: 'devetsil',
    name: 'Devětsil u tůně',
    flowerColor: '#38BDF8',
    glowColor: '#BAE6FD',
    x: CERVEN_POIS.pond.x - 185,
    y: CERVEN_POIS.pond.y - 95,
    poiId: 'pond',
  },
  {
    id: 'bludny_kosatec',
    name: 'Vodní kosatec z rákosí',
    flowerColor: '#22D3EE',
    glowColor: '#A5F3FC',
    x: CERVEN_POIS.mill.x - 95,
    y: CERVEN_POIS.mill.y - 110,
    poiId: 'mill',
  },
  {
    id: 'salvej',
    name: 'Šalvěj pod kostelem',
    flowerColor: '#818CF8',
    glowColor: '#C7D2FE',
    x: CERVEN_POIS.church.x + 170,
    y: CERVEN_POIS.church.y + 145,
    poiId: 'church',
  },
  {
    id: 'routa',
    name: 'Routa u sv. Antonína',
    flowerColor: '#FBBF24',
    glowColor: '#FDE68A',
    x: CERVEN_POIS.shrine.x + 95,
    y: CERVEN_POIS.shrine.y - 75,
    poiId: 'shrine',
  },
  {
    id: 'kapradi',
    name: 'Zlaté kapradí z hvozdu',
    flowerColor: '#F59E0B',
    glowColor: '#FEF08A',
    x: CERVEN_POIS.forest.x - 180,
    y: CERVEN_POIS.forest.y + 80,
    poiId: 'forest',
  },
];

export const SVATOJANSKY_POKLAD_LOCATION = {
  x: -1120,
  y: 920,
  radius: 62,
} as const;

export function createInitialSvatojanskeByliny(): SvatojanskaBylinaState[] {
  return SVATOJANSKE_BYLINY_DEFS.map((def) => {
    const pt = { x: def.x, y: def.y, radius: 22 };
    resolveCervenObstacles(pt, false);
    return {
      ...def,
      x: pt.x,
      y: pt.y,
      nameCs: def.name,
      icon: '🌿',
      color: def.flowerColor,
      collected: false,
    };
  });
}

export function createInitialSvatojanskyPoklad(): SvatojanskyPokladState {
  const pt = { x: SVATOJANSKY_POKLAD_LOCATION.x, y: SVATOJANSKY_POKLAD_LOCATION.y, radius: 28 };
  resolveCervenObstacles(pt, false);
  return {
    x: pt.x,
    y: pt.y,
    unlocked: false,
    opened: false,
    unlockTime: 0,
  };
}

export function isInsideCervenPoi(x: number, y: number, poi: CervenPoi, padding = 0): boolean {
  const dx = x - poi.x;
  const dy = y - poi.y;
  const maxR = poi.radius + padding;
  return dx * dx + dy * dy <= maxR * maxR;
}

export function resolveCervenObstacles(
  entity: { x: number; y: number; radius?: number },
  isFlying = false
): void {
  // First resolve base March obstacles (cottages, churches, mill, rocks)
  resolveMarchThawObstacles(entity, isFlying);

  if (isFlying) return;

  const r = entity.radius || 18;
  // Resolve tactical haystack collisions
  for (const hay of CERVEN_HAYSTACK_OBSTACLES) {
    let dx = entity.x - hay.x;
    let dy = entity.y - hay.y;
    const minDist = hay.radius + r;
    const distSq = dx * dx + dy * dy;
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq);
      if (dist < 0.001) {
        entity.x = hay.x + minDist;
        entity.y = hay.y;
      } else {
        const push = minDist - dist;
        entity.x += (dx / dist) * push;
        entity.y += (dy / dist) * push;
      }
    }
  }

  // Ensure entity stays clamped inside arena bounds
  clampToMarchArenaBounds(entity);
}

export function collideCircleWithCervenObstacles(
  x: number,
  y: number,
  radius: number,
  decorList: any[] = []
) {
  return collideCircleWithObstacles(x, y, radius, 6, decorList);
}

export function hasCervenTerrainLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  decorList: any[] = []
): boolean {
  return hasTerrainLineOfSight(x1, y1, x2, y2, 6, decorList);
}

export function hasCervenRoofsInView(
  camera: { x: number; y: number; width?: number; height?: number },
  decor?: any[]
): boolean {
  const w = camera.width || 1280;
  const h = camera.height || 720;
  return hasRoofsInView(6, decor, camera.x - w / 2, camera.y - h / 2, camera.x + w / 2, camera.y + h / 2);
}

export function isEntityBehindCervenRoof(
  entity: { x: number; y: number; radius?: number },
  decor?: any[],
  headOffset = 24
) {
  return isEntityBehindMarchRoof(entity.x, entity.y - headOffset, 6, decor, entity.radius || 18);
}

/**
 * Returns water effect for June (warm water with ripples and swimming water lilies, without winter ice floes).
 */
export function getCervenWaterEffect(
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
    // Warm summer creek current (streamInfo.vx/vy is pre-scaled to 68 px/s)
    const currentSpeed = 20;
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
      carryVx: Math.sin(time * 0.7) * 3.5,
      carryVy: Math.cos(time * 0.7) * 3.5,
    };
  }

  return { inOpenWater: false, carryVx: 0, carryVy: 0 };
}
