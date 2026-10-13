export type MarchThawPoiId = 'fields' | 'church' | 'tavern' | 'pond' | 'mill' | 'forest' | 'shrine';

export interface MarchThawPoi {
  id: MarchThawPoiId;
  title: string;
  x: number;
  y: number;
  radius: number;
  hint: string;
}

/**
 * Fixed, readable landmarks for level 0.  Keeping the layout as data makes
 * the illustrated map and the gameplay zones agree instead of relying on a
 * random decoration scatter.
 */
export const MARCH_THAW_POIS: Record<MarchThawPoiId, MarchThawPoi> = {
  fields: { id: 'fields', title: 'Horní pole', x: 230, y: -940, radius: 250, hint: 'Krávy ne — koňské spřežení! Vyhni se brázdám.' },
  church: { id: 'church', title: 'Kostel na vrchu', x: -720, y: -470, radius: 185, hint: 'Zvonice [E] — svatý otřes (90 s)' },
  tavern: { id: 'tavern', title: 'Hospoda a náves', x: 590, y: -200, radius: 195, hint: 'Pivní soudek [E] — omráčí dav' },
  pond: { id: 'pond', title: 'Rybník', x: -690, y: 470, radius: 220, hint: 'Tající kry: rychleji, ale smýká to.' },
  mill: { id: 'mill', title: 'Mlýn a řeka', x: 650, y: 590, radius: 180, hint: 'Kolo mlýna drtí vše v náhonu.' },
  forest: { id: 'forest', title: 'Hustý les', x: -100, y: 1040, radius: 300, hint: 'Pozor na přepady z houštin.' },
  shrine: { id: 'shrine', title: 'Boží muka', x: -240, y: 120, radius: 125, hint: 'Setrvej u svatyně pro zjevení světce.' },
};

export const MARCH_THAW_DECOR = [
  { type: 'march_banner', x: 0, y: -1280, scale: 1.2 },
  { type: 'march_fields', x: MARCH_THAW_POIS.fields.x, y: MARCH_THAW_POIS.fields.y, scale: 1 },
  { type: 'march_church', x: MARCH_THAW_POIS.church.x, y: MARCH_THAW_POIS.church.y, scale: 1 },
  { type: 'march_village', x: MARCH_THAW_POIS.tavern.x, y: MARCH_THAW_POIS.tavern.y, scale: 1 },
  { type: 'march_pond', x: MARCH_THAW_POIS.pond.x, y: MARCH_THAW_POIS.pond.y, scale: 1 },
  { type: 'march_mill', x: MARCH_THAW_POIS.mill.x, y: MARCH_THAW_POIS.mill.y, scale: 1 },
  { type: 'march_forest', x: MARCH_THAW_POIS.forest.x, y: MARCH_THAW_POIS.forest.y, scale: 1 },
  { type: 'march_shrine', x: MARCH_THAW_POIS.shrine.x, y: MARCH_THAW_POIS.shrine.y, scale: 1 },
] as const;

export const MARCH_THAW_POIS_LIST: MarchThawPoi[] = Object.values(MARCH_THAW_POIS);

export function isInsideMarchPoi(x: number, y: number, poi: MarchThawPoi, padding = 0): boolean {
  const dx = x - poi.x;
  const dy = y - poi.y;
  const r = poi.radius + padding;
  return dx * dx + dy * dy <= r * r;
}
