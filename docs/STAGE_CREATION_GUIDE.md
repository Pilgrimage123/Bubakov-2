# Bubákov Stage Creation Guide (`docs/STAGE_CREATION_GUIDE.md`)

> **Document Path**: `docs/STAGE_CREATION_GUIDE.md`

This guide documents the complete end-to-end engineering, folklore design, procedural map & landmark rendering, and verification process for creating new playable stages (**Výpravy**) in **Bubákov**. It synthesizes architectural rules from `GLOSSARY.md`, ADRs `0001`–`0040`, and the production implementations of Stages 1 through 12 (March *Předjaří* through August *Srpen*).

---

## 1. Domain Model & Campaign Hierarchy

Before writing any code, align your design with the canonical three-tier domain model established in **ADR 0036** and **ADR 0037**:

1. **Kraj (Folklore Region / Calendar Month)**
   - The overarching seasonal and folkloric setting in Hrusice (e.g., *Předjaří v Hrusicích*, *Duben v Hrusicích*, *Květen v Hrusicích*, *Červen v Hrusicích*, *Červenec v Hrusicích*, *Srpen v Hrusicích*).
   - Each calendar month hosts a **paired Day and Night expedition**.
2. **Aréna (Physical Battlefield & Spatial Layout)**
   - The physical map geometry, boundary polygon (`MARCH_ARENA_BOUNDS`), 9 canonical Points of Interest (POIs), obstacle footprints, stream waypoints, and roof occlusion zones.
   - Identified by an **ASCII `snake_case` Czech ID without diacritics** (**ADR 0021 / ADR 0031**, e.g., `breznove_tani`, `dubnova_naves`, `kvetnova_naves`, `cervnova_senosec`, `cervencove_zne`, `srpnova_slavnost`, `vavrinecka_noc`).
   - A Day and Night expedition pair can either share the same `arena.id` (with `isNightLevel` toggling night POIs, palettes, and lighting) or use linked day/night arena IDs backed by the same spatial module.
3. **Výprava (Playable Expedition / Stage)**
   - A single 5-minute (`300 s`) survival campaign level.
   - **Indexing rule**: Internal code (`GameLevelId`) is **0-indexed** (`0, 1, 2, ...`), whereas player-facing UI (`badge`, `name`) is strictly **1-indexed** (`1. Úroveň`, `2. Úroveň`, ...).
   - **Even-indexed IDs (`0, 2, 4, 6, 8, 10, ...`)** are **Day Expeditions** (*Denní výprava*, `isNightLevel` omitted/false).
   - **Odd-indexed IDs (`1, 3, 5, 7, 9, 11, ...`)** are **Night Expeditions** (*Noční výprava*, `isNightLevel: true`).

### Campaign Calendar Overview (Stages 1–12 Reference)

| UI Stage | `GameLevelId` | Mode | Title (`name`) | Arena ID | MiniBoss (`85 s`) | MidBoss (`185 s`) | Final Boss (`300 s`) |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **1. Úroveň** | `0` | Day | Předjaří v Hrusicích – Denní tání | `breznove_tani` | `blatouch` | `vodnicek` | `vrana` (Hejno mrazivých vran) |
| **2. Úroveň** | `1` | Night | Předjaří v Hrusicích – Noční mrazy | `breznove_tani` | `tajici_snehulak` | `mrazivy_obr` | `morana` |
| **3. Úroveň** | `2` | Day | Duben v Hrusicích – Dubnový den | `dubnova_naves` | `beranek` | `carodejnice_stara` | `vrchni_carodejnice` |
| **4. Úroveň** | `3` | Night | Duben v Hrusicích – Dubnová noc | `dubnova_naves` | `klekanice` | `drab` | `vrchni_carodejnice` (Sabat) |
| **5. Úroveň** | `4` | Day | Květen v Hrusicích – Májová slavnost | `kvetnova_naves` | `carodejnice_zaspalka` | `hastrman` | `ledovi_muzi` (Pankrác, Servác, Bonifác) |
| **6. Úroveň** | `5` | Night | Květen v Hrusicích – Májová noc | `kvetnova_naves` | `zbojnik` | `mlynar` | `hejkal` |
| **7. Úroveň** | `6` | Day | Červen v Hrusicích – Senoseč a pekelný žár | `cervnova_senosec` | `kralovsky_vele_rak` | `cert_sekac` | `kralovska_polednice` |
| **8. Úroveň** | `7` | Night | Červen v Hrusicích – Červnová noc | `cervnova_senosec` | `rusalka` | `ohnivy_sudlicka` | `svatojansky_vladce` |
| **9. Úroveň** | `8` | Day | Červenec v Hrusicích – Žně na sv. Markétu | `cervencove_zne` | `krecek_obilnik` | `zitna_matka` | `hromotluk_marketa` |
| **10. Úroveň** | `9` | Night | Červenec v Hrusicích – Bouře sv. Eliáše | `cervencove_zne` | `bila_pani` | `bezhlavy_rytir` | `drak` |
| **11. Úroveň** | `10` | Day | Srpen v Hrusicích – Dožínková slavnost | `srpnova_slavnost` | `kralovsky_cmelak` | `zlatohlavek_zrout` | `dozinkovy_chasnik` |
| **12. Úroveň** | `11` | Night | Srpen v Hrusicích – Vavřinecká noc | `vavrinecka_noc` | `netopyr_usatec` | `nocni_mura` | `vyr_velky` |

---

## 2. Complete Architecture & File Touchpoint Map

Adding a new stage pair touches **8 cohesive layers** across the codebase. Missing any of the hardcoded level-ID branches below will cause test failures, culled map borders, or runtime parity bugs:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TYPES, TIMELINE PHASES & LEVEL REGISTRY                                  │
│    • src/types.ts              (Extend GameLevelId union)                   │
│    • src/data/levels.ts        (Add GameLevelDef in GAME_LEVELS)            │
│    • src/constants.ts          (Update getCurrentDayPhase(seconds, levelId) │
│                                 and add new enemy costs to ENEMY_POINTS)    │
│    • src/data/levelUnlocks.ts  (Extend LEVEL_ORDER, isLevelFullyUnlocked,   │
│                                 computeLevelProgress, & LEVEL_UNLOCKS)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. SPATIAL ARENA & 10 DECOR LANDMARKS (1 BORDER + 9 POIs)                   │
│    • src/data/<month>Arena.ts  (9 Day/Night POIs, 10 <MONTH>_DECOR items,   │
│                                 special obstacles, water drift, [E] states) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. ENEMIES, SWARMS, NIGHT FORMATIONS & DIRECTOR                             │
│    • src/data/enemies.ts       (Define enemy & boss stats, sizes, colors)   │
│    • src/data/enemyUnlocks.ts  (Bestiary progressive lore & reveal tiers)   │
│    • src/game/director.ts      (STAGE_THREAT_MULTIPLIERS, category filter   │
│                                 in isRegularSpawnAllowedForLevel, and       │
│                                 isNightLevel in getWeightedPool)            │
│    • src/game/virtualLeaderCrowWave.ts (Update isCrowWaveNightLevel for     │
│                                 night wisp swarms / night pack formations)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PROCEDURAL MAP, DAY/NIGHT LIGHTING & LANDSCAPE PIPELINE                  │
│    • src/render/<month>SvgLandscape.ts (draw<Month>Decoration for all 10    │
│                                         <MONTH>_DECOR types, day & night)   │
│    • src/render/arenaRenderer.ts       (Ground theme colors, 3200px/560px   │
│                                         frustum culling extents, and        │
│                                         isDaylightStage sun overlay check)  │
│    • src/render/chunkCache.ts          (Register <month>_* in isDynamicItem)│
│    • src/render/ladaRenderer.ts        (Dispatch <month>_* in               │
│                                         Lada.drawDecoration + enemy sprites)│
│    • src/render/bakedBubakAtlas.ts     (Register regular spooks in atlas)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. DUAL-RUNTIME SIMULATION PARITY (CRITICAL — ADR 0037)                     │
│    • src/game/engineState.ts   (Add stage runtime state & activePoiPrompt)  │
│    • src/game/engine.ts        (Init state, decor, POIs, [E] interactions,  │
│                                 enemy AI, boss phases, drop bounds clamp)   │
│    • src/App.tsx               (Mirror Decor.draw, generateDecorForLevel,   │
│                                 night lightSources, [E] POIs, enemy/boss    │
│                                 AI, and drop bounds clamping)               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. TROPHIES, STORYBOOK UI & LOCALIZATION                                    │
│    • src/data/trophies.ts      (Stage completion & mechanic trophies)       │
│    • src/components/LadaStorybookSpread.tsx (Storybook map vignette)        │
│    • src/i18n/locales/cs.ts & en.ts (Level, POI, enemy & boss translations) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. AUTOMATED VERIFICATION SUITES                                            │
│    • tests/allStagesAudit.test.ts          (Global 12+ stage invariant test)│
│    • tests/allStagesMapsAndSeasons.test.ts (Global landmark & stack test)   │
│    • tests/level<id><Month>.test.ts        (Stage-specific E2E unit suite)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Implementation Guide

### Step 1: Extend `GameLevelId`, `GAME_LEVELS`, and `getCurrentDayPhase`

1. **`src/types.ts`**: Extend the 0-indexed `GameLevelId` union:
   ```ts
   export type GameLevelId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
   ```
2. **`src/constants.ts` (`getCurrentDayPhase`)**:
   > **CRITICAL OMISSION TRAP**: `getCurrentDayPhase(seconds, levelId)` in `src/constants.ts` uses explicit `levelId === ...` checks! If you do not add your new `levelId` here, Night stages will start in `'noon'` instead of `'dusk'` (failing `allStagesAudit.test.ts`), and Day stages will erroneously transition into deep night at `180 s`.
   - For **Spring-style pure Day stages** (`Poledne 0–150 s` $\rightarrow$ `Odpoledne 150 s+`), add `levelId` to the first branch (`levelId === 0 || levelId === 2 || levelId === 4`).
   - For **Harvest/Late-Summer/Autumn Day stages** (`Poledne 0–120 s` $\rightarrow$ `Odpoledne 120–220 s` $\rightarrow$ `Podvečer 220–300 s` $\rightarrow$ `Kuropění 300 s+`), add `levelId` to the second branch (`levelId === 6 || levelId === 8 || levelId === 10 || levelId === 12`).
   - For **Night stages** (`Soumrak 0–100 s` $\rightarrow$ `Hluboká noc 100–200 s` $\rightarrow$ `Půlnoc 200–300 s` $\rightarrow$ `Kuropění 300 s+`), add `levelId` to the third branch (`levelId === 1 || levelId === 3 || levelId === 5 || levelId === 7 || levelId === 9 || levelId === 11 || levelId === 13`).
3. **`src/data/levels.ts` (`GAME_LEVELS`)**:
   - **Naming Rule (ADR 0021 / ADR 0031)**: All IDs (`arena.id`, `miniBoss.id`, `midBoss.id`, `finalBoss.id`, `spawnPools` entries) must be **ASCII `snake_case` without diacritics or spaces** (e.g., `kralovsky_srsen`, never `královský_ sršeň`).
   - **Day vs. Night Rules**:
     - Day levels (`id % 2 === 0`) omit `isNightLevel` (or set `false`) and **must exclude undead enemies** (`kostlivec`, `umrlec`, `hrobnik`, etc.).
     - Night levels (`id % 2 === 1`) **must** set `isNightLevel: true`.
   - **Required `poiOrder`**: Must include at least the 9 canonical Hrusice POIs (`fields`, `church`, `tavern`, `village`, `school` or `orchard`, `pond`, `mill`, `forest`, `shrine`).
   - **Required `decorTypes`**: Must always include `'cottage'`, `'tree'`, and `'rock'`, plus stage-specific decor items.
   - **Canonical Boss Timings (ADR 0037)**:
     - `miniBoss.time`: **`85`** seconds
     - `midBoss.time`: **`185`** seconds
     - `finalBoss.time`: **`300`** seconds

---

### Step 2: Register Sequential Unlocks in `src/data/levelUnlocks.ts`

1. Append the new level ID(s) to `LEVEL_ORDER`.
2. In `isLevelFullyUnlocked(id, meta)`, add the unlock condition referencing the **previous stage's `finalBoss.id`** and `meta.completedLevels[id - 1]`:
   ```ts
   if (id === 12 && ((meta?.bestiaryKills?.vyr_velky || 0) >= 1 || !!meta?.completedLevels?.[11])) return true;
   ```
3. In `LEVEL_UNLOCKS`, add `makeSequentialUnlock(id, targetEnemies)` where `targetEnemies` lists 3–5 iconic enemies/bosses from stage `id - 1`. Every enemy ID in `targetEnemies` **must** exist in `ENEMIES` (verified by `tests/allStagesAudit.test.ts`).

---

### Step 3: Build the Spatial Arena, 9 POIs & 10 Decor Landmarks (`src/data/<month>Arena.ts`)

Model your spatial module after `src/data/srpenArena.ts` and `src/data/cervenecArena.ts`:

1. **Reuse Canonical Hrusice Topology**:
   Import `MARCH_ARENA_BOUNDS` (`[-1920..1920, -1675..1675]`), `MARCH_THAW_OBSTACLES`, `MARCH_THAW_POIS`, `MARCH_FOREST_ZONES`, `MARCH_THAW_ROOF_ZONES`, `MARCH_POND_REGION`, and `MARCH_STREAM_WAYPOINTS` from `./marchThawArena`.
2. **Define Day & Night POI Dictionaries**:
   Export `<MONTH>_POIS` and `<MONTH>_NIGHT_POIS` covering all 9 `MarchThawPoiId` keys at their canonical Hrusice coordinates:
   - `fields`: `(x: 225, y: -975, radius: 220)` — Northern fields & crops
   - `church`: `(x: -800, y: -650, radius: 190)` — Hilltop Church of St. Nicholas
   - `tavern`: `(x: 440, y: -75, radius: 175)` — Village Tavern (*Hospoda U Sejků*)
   - `village`: `(x: 50, y: -75, radius: 185)` — Central Village Green (*Náves*)
   - `school`: `(x: 125, y: 550, radius: 175)` — Schoolhouse & Orchard
   - `pond`: `(x: -725, y: 615, radius: 250)` — Hrusice Pond (*Rybník Brčálník*)
   - `mill`: `(x: -880, y: 110, radius: 185)` — Water Mill (*Mlýn*)
   - `forest`: `(x: 650, y: 725, radius: 220)` — Deep Hrusice Woods (*Hvozd*)
   - `shrine`: `(x: 820, y: -620, radius: 165)` — Roadside Shrine (*Boží muka*)
3. **Export the 10-Item `<MONTH>_DECOR` Array**:
   Export `<MONTH>_DECOR` containing **10 landmark decor items** (1 border cartouche at `(0, 0)` + 9 POI landmarks positioned at their exact `<MONTH>_POIS.<poi>.x/y` coordinates):
   ```ts
   export const ZARI_DECOR = [
     { type: 'zari_border', x: 0, y: 0, scale: 1.25 },
     { type: 'zari_fields', x: ZARI_POIS.fields.x, y: ZARI_POIS.fields.y, scale: 1 },
     { type: 'zari_church', x: ZARI_POIS.church.x, y: ZARI_POIS.church.y, scale: 1 },
     { type: 'zari_village', x: ZARI_POIS.village.x, y: ZARI_POIS.village.y, scale: 1 },
     { type: 'zari_tavern', x: ZARI_POIS.tavern.x, y: ZARI_POIS.tavern.y, scale: 1 },
     { type: 'zari_pond', x: ZARI_POIS.pond.x, y: ZARI_POIS.pond.y, scale: 1 },
     { type: 'zari_mill', x: ZARI_POIS.mill.x, y: ZARI_POIS.mill.y, scale: 1 },
     { type: 'zari_forest', x: ZARI_POIS.forest.x, y: ZARI_POIS.forest.y, scale: 1 },
     { type: 'zari_shrine', x: ZARI_POIS.shrine.x, y: ZARI_POIS.shrine.y, scale: 1 },
     { type: 'zari_school', x: ZARI_POIS.school.x, y: ZARI_POIS.school.y, scale: 1 },
   ] as const;
   ```
4. **Define Stage-Specific Tactical Obstacles**:
   Add 4–8 seasonal obstacles (`<MONTH>_SPECIAL_OBSTACLES`) with ground-footprint colliders (**Základový půdorys stavby**, ADR 0034):
   - Use `shape: 'box'` (with `halfW`, `halfH`, `cornerRadius`) or `shape: 'circle'` (with `radius`).
   - Set `blocksSight: true` for tall solid cover (wagons, haystacks, stone walls) that block enemy line-of-sight, or `blocksSight: false` for low waist-high structures (ovens, cauldrons, fences).

---

## 4. Detailed Guide: How to Draw Stage Maps by Month & Day/Night

Map rendering in Bubákov combines **month-specific folkloric transformation** of Hrusice with **dynamic Day/Night visual & lighting shifts**. All map drawing happens procedurally on Canvas 2D in `src/render/<month>SvgLandscape.ts` and is orchestrated by `src/render/arenaRenderer.ts`.

### 4.1 How the 11-Pass Map & Lighting Pipeline Works (`src/render/arenaRenderer.ts`)

Every frame, `ArenaRenderer.renderArena()` executes these map-relevant passes in strict order:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASS 1: BACKDROP GROUND COLOR (Screen Space)                                │
│   Fills canvas with curLvl.groundColor shifted by phase.id:                 │
│   • noon / afternoon : Bright seasonal ground (grass, golden stubble, snow) │
│   • dusk             : Warm amber/russet twilight transition                │
│   • night / midnight : Deep nocturnal slate, forest green, or indigo        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 2a: AMBIENT TINT (World Space)                                         │
│   Overlays phase.ambientTint or curLvl.ambientTint across the camera view.  │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 2b: MAP LANDMARKS & INFRASTRUCTURE (<month>SvgLandscape.ts)            │
│   • <month>_border (at 0,0, culling radius 3200*scale): Draws dirt roads,   │
│     stream, bridges, 4 central cottages, outer frame, title banner & fields.│
│   • 9 <month>_<poi> items (at POI.x/y, culling radius 560*scale): Draws     │
│     Church, Tavern, Village Green, School, Pond, Mill, Forest, Shrine.      │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 3 & 4: DROPS & Y-SORTED ENTITIES (Player, Grandfather, Enemies)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 4b: ROOF OCCLUSION PASS (renderRoofOcclusionPass)                      │
│   When entities/drops walk behind a cottage, tavern, school, mill, or       │
│   church roof (MARCH_THAW_ROOF_ZONES), redraws the roof over them and       │
│   renders a 32%-opacity silhouette of occluded characters on top.           │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 9 (NIGHT STAGES ONLY): STORYBOOK LIGHTING & EMISSIVE PASS              │
│   • renderStorybookLightingComposite(): Multiplies downscaled dark          │
│     lightmap over the scene; cuts out 3-4 stepped gouache halos (Kvašová    │
│     záře) with pen-stipple rims around Petrolejka, windows, Boží muka, and  │
│     bonfires; extrudes 2D shadow volumes behind building occluders.         │
│   • renderNightEmissiveEntitiesPass(): Draws glowing eyes, fireflies,       │
│     Bludičky, Jiskřivci, and fiery devils on top of the darkness.           │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 11 (DAY STAGES ONLY): FOREGROUND SUN & PARALLAX OVERLAY                │
│   • renderSunForegroundOverlay(): Blends pre-rendered 512x512 Josef Lada    │
│     sun keyframes across 7 daytime narrative phases (6:00 sunrise -> 12:00  │
│     laughing noon sun with sunglasses -> 20:00 yawning sunset in nightcap). │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **THREE CRITICAL WIRING RULES IN `src/render/arenaRenderer.ts`**:
> 1. **Ground Theme Color Branch (lines 444–490)**: Add an `else if (curLvl.theme === '<your_theme>')` branch in Pass 1 so the ground color transitions properly between `noon`/`afternoon`, `dusk`, and `night`/`midnight`.
> 2. **Frustum Culling Extents (lines 530–536 & 550–556)**:
>    - You **MUST** add `dec.type === '<month>_border'` to the `3200 * scale` extent check! Because `<month>_border` is anchored at `(0, 0)` and spans `3840 x 3350 px`, omitting it causes the entire road network, stream, and map border to vanish when the player walks `> 560 px` from `(0, 0)`!
>    - You **MUST** add `dec.type.startsWith('<month>_')` to the `560 * scale` extent check so large POI buildings don't pop out of view near camera edges.
> 3. **Daylight Foreground Sun Check (lines 711–730)**: For every new **Daytime stage** (`id % 2 === 0`), add its level ID to `isDaylightStage` in Pass 11 so the animated Josef Lada sun overlay renders during the daytime run.

---

### 4.2 Coordinate System: World-Space `<month>_border` vs. POI-Local Landmarks

When `Decor.draw()` in `src/App.tsx` (or `Lada.drawDecoration()`) invokes your landscape renderer, it first transforms the canvas:
```ts
ctx.save();
ctx.translate(this.x, this.y);
ctx.scale(this.flip * this.scale, this.scale);
draw<Month>Decoration(ctx, this, time, isNight);
ctx.restore();
```
This creates two distinct coordinate spaces inside `draw<Month>SummerLandmark(ctx, type, time, isNight)`:

1. **`type === '<month>_border'` (Placed at `x: 0, y: 0`) — World-Space Origin**:
   Every shape drawn inside the `<month>_border` branch uses global arena coordinates (`[-1920..1920, -1675..1675]`). It is responsible for drawing the **7 village-wide infrastructure layers** in this exact back-to-front order:
   - **0a. Dirt Road Network (`cesty`)**: `lineWidth: 56`, connecting Church `(-800, -650)` $\rightarrow$ Village `(50, -75)` $\rightarrow$ Tavern `(440, -75)`, North Bridge `(425, -455)` $\rightarrow$ Fields `(225, -975)`, South Bridge `(475, 420)` $\rightarrow$ School `(125, 550)` & Forest `(650, 725)`, and West road `(-675, -25)` $\rightarrow$ Pond `(-725, 615)`.
   - **0b. Hrusice Stream (`potok`)**: Follows `<MONTH>_STREAM_WAYPOINTS` with three strokes: outer ink bank (`lineWidth: 96`, `#23170F`), seasonal water body (`lineWidth: 86`), and inner current highlight (`lineWidth: 34`). **Never draw ice floes in summer/autumn months!**
   - **0c. Two Wooden Bridges (`dřevěné mostky`)**: Drawn at `(425, -455)` and `(475, 420)` (`w: 148, h: 66`), matching `isPointOnMarchBridge(x, y)`.
   - **0d. Four Central Village Cottages (`roubenky`)**: Drawn at `(-350, -362, w:250, h:138)`, `(100, -412, w:262, h:144)`, `(-375, -75, w:238, h:138)`, and `(-275, 200, w:250, h:138)` so their visual footprints match the physical collision boxes in `MARCH_THAW_OBSTACLES` and roof zones in `MARCH_THAW_ROOF_ZONES`.
   - **1. Triple-Stroked Arena Border Frame**: `ctx.strokeRect(-1920, -1675, 3840, 3350)` (`#23170F`, `lineWidth: 6`) surrounded by outer seasonal trim rectangles at `(-1930, -1685, 3860, 3370)` and `(-1936, -1691, 3872, 3382)`.
   - **2. Hand-Lettered Monthly Title Cartouche**: Drawn at `ctx.translate(0, -1590)` with curved parchment banner, bold `Eczar, Georgia, serif` title, and seasonal botanical garnishes.
   - **3. Field Tactical Obstacles**: Loop over `<MONTH>_SPECIAL_OBSTACLES` (such as haystacks or grain sheaves in the northern fields) and draw them at `(obs.x, obs.y)`.

2. **`type === '<month>_<poi>'` (Placed at `x: POI.x, y: POI.y`) — POI-Local Origin `(0, 0)`**:
   Inside each of the 9 POI branches (`<month>_fields`, `<month>_village`, `<month>_tavern`, `<month>_church`, `<month>_school`, `<month>_pond`, `<month>_mill`, `<month>_forest`, `<month>_shrine`), `(0, 0)` is the **center of that POI**!
   - **Relative Offset Rule for Interactive Structures**: If a physical obstacle or interactive state (like `Chlebová pec` at world `x: 45, y: -135`) is drawn inside `<month>_village` (whose POI center is `x: 50, y: -75`), draw it at relative offset `(45 - 50, -135 - (-75)) = (-5, -60)` so the visual sprite aligns 1:1 with the collision box and `[E]` interaction circle!

---

### 4.3 How Map Visuals Evolve by Calendar Month (Seasonal Identity)

Each month transforms the shared Hrusice geography so no two months ever look identical:

| Month (Stages) | Season & Palette | Fields (`fields`) & Obstacles | Village (`village`) & Tavern (`tavern`) | Pond (`pond`), Mill (`mill`) & Forest (`forest`) | Church (`church`) & Shrine (`shrine`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Březen** (1–2) | Early Spring (`#D0D3D4` thawing snow/mud) | Ploughed muddy furrows, melting snowdrifts | Snow-dusted *roubenky*, Granny's warm stove | Cracking pond ice, drifting ice floes (`ice_floe`) | Marian apparition at *Kaplička* |
| **Duben** (3–4) | Mid Spring (`#A8D08D` fresh green grass) | Sprouting green meadows, painted Easter eggs | Tall ribboned spring *Májka*, Walpurgis bonfire | Clear brook, frogs, blooming white cherry orchard | Hilltop church bell, birch grove |
| **Květen** (5–6) | Late Spring (`#A3D48B` lush blossom green) | Pastures with dandelions & buzzing May bugs | Festive Maypole dance ring, foamy May lager | Warm pond with lily pads (*Brčálník*), goat grove | St. John of Nepomuk statue with fireflies |
| **Červen** (7–8) | Early Summer (`#E59866` golden haymaking) | Mown hay meadows, round haystacks (`stohy`), hay wagon | Shaded lime-tree tavern porch with buttermilk jugs | Creek pool *"NA RACÍCH"* with crayfish, blueberry grove | Pilgrimage oak shrine of St. Anthony |
| **Červenec** (9–10) | Mid Summer (`#D97706` amber rye harvest) | Conical grain sheaves (*panáky žita*), poppies & cornflowers | Fairground shooting gallery (*Poutní střelnice*) on green | Swimming ducks, rotating millwheel & flour sacks, raspberries | Church lightning rod (*hromosvod*), St. Elias shrine |
| **Srpen** (11–12) | Late Summer (`#FEF08A` harvest gold / `#1E293B` night) | Dožínky stubble, golden straw stacks & tall sunflowers | Smoking stone Bread Oven (*Chlebová pec*), harvest wagon | Cattails (*orobinec*), dragonflies, ripe red apple orchard, forest rock spring | Blazing St. Lawrence bonfire (*Vavřinecká vatra*) & wheat wreath |

When designing future months (e.g., **Září / September**, **Říjen / October**, **Listopad / November**, **Prosinec / December**):
- **Září (September)**: Plum orchards (*švestkové sady*), bubbling copper plum-butter cauldron (*kotel na povidla*) on the village green, gossamer threads (*babí léto*), golden-orange foliage, and St. Wenceslas feast (*posvícenské koláče*).
- **Říjen (October)**: Potato harvest fires (*bramborová nať*) with baked potatoes in glowing ash, flying dragon kites (*draci na větru*), draining of the Hrusice pond (*výlov rybníka Brčálníku*) with wooden fish vats (*kádě na kapry*), and rust-red oak/beech woods.
- **Listopad (November)**: All Souls' Day (*Dušičky*) candlelit cemetery by the church, bare gnarled trees, Swirling St. Martin's first snow/fog, St. Martin's roast goose & rolls in the tavern.
- **Prosinec (December)**: Deep Josef Lada Christmas snow, frozen pond with ice skaters, glowing Advent windows, St. Nicholas (*Mikuláš, čert a anděl*), and the Hrusice Nativity scene (*betlém*).

---

### 4.4 How to Draw Day vs. Night Variants (`isNight` Parameter & Lighting Rules)

Every procedural landscape function takes `(ctx, type, time, isNight)`. Follow these **7 mandatory Day/Night visual transformation rules** so your map looks like an authentic Josef Lada gouache illustration both at noon and at midnight:

1. **Title Cartouche Banner Switch (`<month>_border`)**:
   - **Day (`isNight === false`)**: Warm parchment fill (`#FFFBEB`), dark ink border (`#23170F`), and festive red lettering (`#DC2626` or `#B91C1C`), e.g. `'SRPEN • DOŽÍNKOVÁ SLAVNOST'`.
   - **Night (`isNight === true`)**: Deep midnight-blue fill (`#0F172A` or `#1E1B4B`), golden-yellow border (`#FACC15` or `#38BDF8`), and glowing gold lettering (`#FDE047`), e.g. `'SRPEN • VAVŘINECKÁ NOC'`.
2. **Cottage & Building Walls, Roofs & Glowing Windows (`drawSummerCottage`)**:
   - **Walls**: Shift from warm sunlit plaster (`#FAF3E0`, `#FFFBEB`, `#FEF3C7`) by day to cool moonlit slate (`#CBD5E1`) at night.
   - **Roofs**: Shift from bright shingle red/terracotta (`#C84B31`, `#DC2626`) by day to dark crimson (`#7F1D1D`, `#991B1B`) at night.
   - **Windows**: Shift from sky-blue panes (`#38BDF8`) by day to **glowing butter-yellow (`#FDE047`)** at night, plus an ambient window glow circle (`if (isNight) { ctx.fillStyle = 'rgba(250, 204, 21, 0.3)'; ... }`).
3. **Dirt Roads & Water Surfaces**:
   - **Dirt Roads**: Shift from sunlit ochre (`#D9B882`) by day to dark umber (`#574636`) at night.
   - **Stream & Pond Water**: Shift from bright cerulean (`#0284C7`, highlight `rgba(186, 230, 253, 0.5)`) by day to deep nocturnal navy (`#0369A1`, highlight `rgba(186, 230, 253, 0.22)`) at night.
4. **Ground Shadows Under Landmarks & Obstacles**:
   - **Day**: Warm sepia-brown (`rgba(92, 58, 24, 0.28)` to `0.35`).
   - **Night**: Deep midnight-indigo (`rgba(10, 15, 30, 0.48)` to `0.55`).
5. **Foliage, Crops & Botanical Motifs**:
   - Darken greens and yellows by 1–2 stops at night (e.g., tree foliage `#16A34A` $\rightarrow$ `#14532D`, straw/sunflowers `#FACC15` $\rightarrow$ `#CA8A04`, spruce `#14532D` $\rightarrow$ `#064E3B`) so vegetation blends naturally under the multiplicative night lightmap.
6. **Nocturnal Emissive Details (`if (isNight)`)**:
   - Add flickering devotional candles inside *Boží muka* niches, glowing embers in bread ovens/cauldrons, and pulsing firelight halos around hilltop bonfires using `Math.sin(time * 6)`:
     ```ts
     if (isNight) {
       const flicker = Math.sin(time * 8) * 2;
       ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
       ctx.beginPath();
       ctx.arc(0, -38, 22 + flicker, 0, Math.PI * 2);
       ctx.fill();
     }
     ```
7. **Register Matching `engine.lightSources` in `src/App.tsx` (Night Stages Only)**:
   - For every odd-numbered Night stage, push 3–4 static world `DynamicLightSource` objects in `src/App.tsx` (around line 4331) at your key nocturnal POIs (e.g., hilltop bonfire `type: 'hearth'`, village green `type: 'bozi_muka'`, tavern porch `type: 'window'`, roadside shrine `type: 'bozi_muka'`).
   - `storybookLightingRenderer.ts` uses these light sources to cut out warm stepped gouache light pools (*Kvašová záře*) in the darkness and cast dynamic 2D shadows behind cottages!

---

## 5. Authoring Folklore Enemies, Swarms, Bosses & Director Rules

### 5.1 Entity Size Hierarchy (*Kotva měřítka* — ADR 0034)
All entity radii and heights in `src/data/enemies.ts` are anchored to the adult Hunter (`height: 75–80 px`, `radius: 20 px`):

| Tier | Category / Role | Collision `radius` | Visual `size` | Examples |
| :--- | :--- | :---: | :---: | :--- |
| **1. Drobná havěť** | Small vermin, insects, frogs, mice | `11 – 15 px` | `14 – 20` | `mysak`, `chroust`, `zlatohlavek`, `zkazena_kraslice` |
| **2. Řadoví běsi** | Human-sized spooks, witches, carollers | `17 – 22 px` | `22 – 28` | `rehtackar`, `carodejnice_koste`, `zitna_baba`, `nocni_mura` |
| **3. Těžká strašidla** | Brutes, minibosses, armored guards | `25 – 34 px` | `30 – 42` | `drab`, `cert_sekac`, `zbrojnos`, `kralovsky_cmelak` |
| **4. Obludní bossové** | Midbosses & Climax Final Bosses | `36 – 56 px` | `44 – 68` | `morana`, `vrchni_carodejnice`, `drak`, `vyr_velky` |

### 5.2 Registration Checklist for Every New Enemy
Whenever you add a new enemy ID to `src/data/enemies.ts`:
1. **`src/data/enemies.ts`**: Define `name`, `hp`, `speed`, `damage`, `radius`, `size`, `color`, `points`, `category` (`'beasts' | 'sprites' | 'water' | 'forest' | 'undead' | 'demons' | 'frost' | 'bosses'`), and optional flags (`isFlying`, `knockbackResist`, `armor`, `projectileReflectChance`).
2. **`src/constants.ts` (`ENEMY_POINTS`)**: Register the spawn-budget cost for every spawnable enemy in `ENEMY_POINTS`. **(Strictly audited by `tests/allStagesAudit.test.ts`!)**
3. **`src/data/enemyUnlocks.ts`**: Add bestiary progression lore and reveal milestones.
4. **`src/game/director.ts`**:
   - Add `STAGE_THREAT_MULTIPLIERS[levelId]` following **ADR 0038** (progressive scaling where `STAGE_THREAT_MULTIPLIERS[id] >= STAGE_THREAT_MULTIPLIERS[id - 1]`).
   - Update `isRegularSpawnAllowedForLevel(enemyId, levelId)` (lines 57–107) so daytime stages filter out `frost` and `undead` categories and nighttime stages filter out `frost` (unless winter-themed).
   - **Update `isNightLevel` in `RunDirector.getWeightedPool`** (line 1905):
     ```ts
     const isNightLevel = levelId === 1 || levelId === 3 || levelId === 5 || levelId === 7 || levelId === 9 || levelId === 11 || levelId === 13;
     ```
5. **`src/game/virtualLeaderCrowWave.ts`**:
   - Update `isCrowWaveNightLevel(levelId)` (line 65) to include your new odd-numbered Night stage ID so preallocated Night Wisp Swarms (`wisp_swarm`) and Night Packs (`night_pack`) operate on the new night stage.

### 5.3 Boss Design & Multi-Phase Kinematics (ADR 0024)
- **Telegraphed Windups (*Nápřah*)**: Every boss special attack (dives, shockwaves, projectile volleys, boulder throws, feather storms) must have a visible telegraph phase (`0.6–1.2 s`) using `renderTelegraphs.ts` or warning circles before dealing damage.
- **Anchor Boss Calibration (*Kotevní boss výpravy* — ADR 0038)**:
  - Stage 1's Final Boss (`vrana`, 9 crows $\times$ 200 HP = **1,800 base Kuráž**) is the campaign anchor.
  - Tune your boss `hp` in `ENEMIES` and `miniBoss.multiplier` / `midBoss.multiplier` / `finalBoss.multiplier` in `GAME_LEVELS` so effective HP scales smoothly along the campaign curve.
- **Multi-Entity Bosses (e.g., *Ledoví muži*)**:
  - If a final boss spawns as a trio or duo (like Pankrác, Servác, and Bonifác in Stage 5), tag all members with `isFinalBoss: true` and **only trigger level victory when the last surviving member dies**:
    ```ts
    const remainingBosses = state.enemies.filter(
      (other) => other !== e && !other.dead && other.hp > 0 && other.isFinalBoss
    );
    if (remainingBosses.length === 0) {
      triggerLevelVictory();
    }
    ```

---

## 6. Mandatory Client–Engine Parity (*Parita herního klienta* — ADR 0037)

> **CRITICAL ARCHITECTURAL RULE**: Never implement stage mechanics, enemy AI, `[E]` POI interactions, drop bounds clamping, or boss victory conditions only in `src/game/engine.ts`! Every runtime behavior in `src/game/engine.ts` **must** be mirrored 1:1 in `src/App.tsx`.

Use this 9-point parity checklist whenever wiring a new stage:

| Feature / Subsystem | Headless Simulation (`src/game/engine.ts` + `engineState.ts`) | Interactive Browser Client (`src/App.tsx`) |
| :--- | :--- | :--- |
| **1. Initial Arena State** | Add `<month>` state slice and `<month>ActivePoiPrompt` to `EngineState` (`engineState.ts`), initialize in `createInitialEngineState()` and `GameEngine.initRun()`, and add getter/setter on `GameEngine` (verified by `allStagesAudit.test.ts`). | Initialize identical `<month>` state on `engine` when starting/restarting a run on `chosenLevelId`. |
| **2. Decor & Obstacle Setup** | Populate `state.decor` with `<MONTH>_DECOR` when `levelId` matches, and resolve collisions via `resolve<Month>Obstacles()`. | Return `[...<MONTH>_DECOR]` in `generateDecorForLevel()` and call `resolve<Month>Obstacles()` for player and ground enemies. |
| **3. Nighttime Light Sources** | Populate `state.lightSources` for night levels in `engine.ts` / `storybookLighting.ts`. | Push stage-specific `engine.lightSources` (bonfires, village windows, shrines) for odd-numbered Night levels in `App.tsx` (around line 4331). |
| **4. Passive POI Zone Buffs** | Check `getActive<Month>Poi(player.x, player.y, isNight)` each tick to apply passive zone modifiers (speed, armor, evasion, reload). | Mirror the exact `getActive<Month>Poi(...)` zone modifiers and update the HUD POI banner / `[E]` prompt. |
| **5. Interactive `[E]` POIs** | Handle `[E]` key presses inside `church`, `tavern`, `village`, `forest`, `school`, or `shrine` POIs (cooldowns, heals, shockwaves, buffs). | Bind `KeyE` / touch interact button to trigger the exact same cooldowns, floating combat texts, audio cues, and particle bursts. |
| **6. Drop Bounds Clamping** | Add `this.state.activeLevelId === <newId>` to both drop-clamping checks (`clampToMarchArenaBounds(d, 28)` at lines 7867 & 7908). | Add `engine.activeLevelId === <newId>` to both drop-clamping checks (`clampToMarchArenaBounds(d, 28)` at lines 10209 & 10239). |
| **7. Enemy Kinematics & Splits** | Implement custom movement (e.g., sine flight, burrowing, projectile reflection, on-hit splitting) in `engine.ts` enemy loop. | Mirror the exact custom movement, splitting, and hazard creation in `App.tsx` enemy update loop. |
| **8. Boss Spawns (`85/185/300s`)** | Spawn `miniBoss` at `85 s`, `midBoss` at `185 s`, and `finalBoss` at `300 s` (never block `finalBoss` if `midBoss` was skipped in sandbox). | Spawn `miniBoss`, `midBoss`, and `finalBoss` at the exact same timestamps with warning banners and boss music. |
| **9. Boss Attacks & Victory** | Execute boss special cadence, spawn telegraphed hazards, and trigger `levelVictoryTriggered = true` when all final boss entities die. | Execute identical boss attacks, render telegraphs, award trophies (`meta.completedLevels[levelId] = true`), and open victory tally. |

---

## 7. Trophies & Bilingual Localization (`cs.ts` & `en.ts`)

1. **Trophies (`src/data/trophies.ts`)**:
   - Add completion trophies (e.g., `level12_completed`, `level13_completed`) checking `Boolean(meta?.completedLevels?.[12])`.
   - Optionally add a thematic achievement trophy for mastering the stage's signature mechanic (e.g., baking bread in Stage 11 or witnessing Perseid shooting stars in Stage 12).
2. **Bilingual Localization (`src/i18n/locales/cs.ts` & `src/i18n/locales/en.ts`)**:
   Every stage and its bosses are strictly audited by `tests/allStagesAudit.test.ts`. You **must** add non-empty strings to **both** `cs.ts` and `en.ts` for:
   - `level.<id>.name`
   - `level.<id>.subtitle`
   - `bestiary.<miniBossId>.name`
   - `bestiary.<midBossId>.name`
   - `bestiary.<finalBossId>.name`
   - Plus all new regular enemy names (`bestiary.<enemyId>.name`) and descriptions.

---

## 8. Verification, Auditing & Performance Benchmarking

Never consider a new stage complete until all three automated test suites pass:

### 8.1 Update `tests/allStagesAudit.test.ts`
Update the upper loop bound in `tests/allStagesAudit.test.ts` (e.g., from `id <= 11` to `id <= 13`), add `expect(engine.<month>).toBe(engine.state.<month>)` in the state accessor test, and append your new `arena.id` and `theme` to `expectedArenas` and `validThemes`.

### 8.2 Update `tests/allStagesMapsAndSeasons.test.ts`
Add your new stages to `monthConfigs` in `tests/allStagesMapsAndSeasons.test.ts` and add a landmark verification block asserting:
- `<MONTH>_DECOR.length === 10` (`<month>_border` + 9 POI landmarks).
- Non-overlapping coordinates between `village` and `tavern`.
- `draw<Month>Decoration(ctx, d, 2.0, isNight)` does not throw and leaves `ctx.getSaveDepth() === 0` in **both Day (`false`) and Night (`true`) modes**.

### 8.3 Create a Dedicated Stage Test Suite (`tests/level<id><Month>.test.ts`)
Model your stage test file on `tests/level10Srpen.test.ts`:
1. Verify `GAME_LEVELS` metadata, boss schedule (`85 s`, `185 s`, `300 s`), and spawn pools.
2. Verify `LEVEL_UNLOCKS` gating behind the previous stage's final boss.
3. Verify stage completion trophies in `TROPHIES`.
4. Test all 9 POIs, obstacle collision resolution (`resolve<Month>Obstacles`), and flying-unit bypass.
5. Test interactive `[E]` mechanics (cooldown activation, enemy knockback, player buff timer, and healing).
6. Test custom enemy behaviors and all 3 boss special attacks in `GameEngine`.
7. Run `tests/enemyFpsBenchmark.test.ts` (`40` simultaneous instances over `120` frames) to verify that all new procedural enemy drawings stay below the **16.7 ms p95 frame budget** (**ADR 0029**).

---

## 9. Quick Pre-Flight Checklist for Stage Authors

- [ ] `GameLevelId` extended in `src/types.ts` and `GAME_LEVELS` entry added in `src/data/levels.ts` using ASCII `snake_case` IDs without diacritics.
- [ ] `getCurrentDayPhase(seconds, levelId)` updated in `src/constants.ts` for the new Day (`noon` start) and Night (`dusk` start) level IDs.
- [ ] `src/render/arenaRenderer.ts` updated in 3 places: Pass 1 `curLvl.theme` ground colors, Pass 2b frustum culling extents (`3200 * scale` for `<month>_border` and `560 * scale` for `<month>_*`), and Pass 11 `isDaylightStage` sun overlay check.
- [ ] MiniBoss (`85 s`), MidBoss (`185 s`), and Final Boss (`300 s`) defined in `ENEMIES` and `GAME_LEVELS`.
- [ ] All spawnable enemies registered in `ENEMIES`, `ENEMY_POINTS` (`src/constants.ts`), and `enemyUnlocks.ts`.
- [ ] `STAGE_THREAT_MULTIPLIERS`, `isRegularSpawnAllowedForLevel`, and `isNightLevel` (in `getWeightedPool`) updated in `src/game/director.ts`.
- [ ] `isCrowWaveNightLevel` updated in `src/game/virtualLeaderCrowWave.ts` for new Night stages.
- [ ] `LEVEL_ORDER`, `isLevelFullyUnlocked`, and `LEVEL_UNLOCKS` updated in `src/data/levelUnlocks.ts`.
- [ ] Spatial arena module (`src/data/<month>Arena.ts`) exports 9 Day/Night POIs, 10 `<MONTH>_DECOR` items, obstacle footprints, and `[E]` state factories.
- [ ] Procedural landscape (`src/render/<month>SvgLandscape.ts`) renders all 7 infrastructure layers in `<month>_border` and all 9 relative POI landmarks, honors `isNight` across walls/roofs/windows/shadows/foliage/candles, and maintains `ctx.getSaveDepth() === 0`.
- [ ] Landscape wired into `chunkCache.ts`, `Lada.drawDecoration` (`ladaRenderer.ts`), and `Decor.draw` / `generateDecorForLevel` (`App.tsx`).
- [ ] **100% Parity verified** between `src/game/engine.ts` and `src/App.tsx` (state slices, night `lightSources`, `[E]` interactions, drop bounds clamping, enemy AI, boss phases, and multi-boss victory triggers).
- [ ] Czech (`cs.ts`) and English (`en.ts`) translations added for level name, subtitle, and all bosses/enemies.
- [ ] `tests/allStagesAudit.test.ts`, `tests/allStagesMapsAndSeasons.test.ts`, and `tests/level<id><Month>.test.ts` pass completely green.
