# ADR 0020: Modulární vrstvy renderovací pipeline arény a izolovaný Y-buffer

## Kontext

Po odmítnutí Phaseru v ADR 0017 a zavedení primárního švu `renderArena` vyvstala potřeba vyčlenit zbývající monolitické části vykreslování z `App.tsx` (střely, částice, dropy, telegrafy útoků) a vyřešit bezpečné sdílení scratch paměti pro hloubkové řazení (Y-sorting).

Původní prototyp používal globální modulový scratch buffer pro řazení entit, což neslo riziko souběhu při vícenásobných plátnech (např. v testovacích benchmarcích nebo náhledech) a neposkytovalo izolaci mezi vrstvami arény.

## Rozhodnutí

Rozhodli jsme se rozdělit renderovací pipeline do specializovaných, izolovaných modulů pro každou vrstvu arény s jednotným přístupem k frustum cullingu:

1. **Modulární renderery vrstev**:
   - `src/render/renderDrops.ts`: Frustum-culled vykreslování perníčků, mincí, lektvarů, truhel a vzácných předmětů.
   - `src/render/renderParticles.ts`: Vykreslování částic s přísnými stropy rozpočtu podle grafického profilu.
   - `src/render/renderProjectiles.ts`: Vykreslování střel a projektilů arény (hromničky, řemdihy, kropenky, jitrnice atd.).
   - `src/render/renderTelegraphs.ts`: Vykreslování varovných zón a nápřahů elitních monster a bossů.

2. **Izolovaný Y-buffer v instanci `ArenaRenderer`**:
   - Třída `ArenaRenderer` v `src/render/arenaRenderer.ts` zapouzdřuje instance vlastních scratch polí (`Float64Array`, `Int32Array`) pro hloubkové řazení bez alokace paměti na haldě (zero allocation).
   - Scratch buffery nejsou sdíleny globálně mezi plátny ani testovacími instancemi.

3. **Jednotný vstupní bod `renderArena`**:
   - `App.tsx` volá pouze jednotný renderovací šev `renderArena`, který koordinuje pozadí, statické kulisy (`ChunkBitmapCache`), hloubkově řazené entity, vrstvy projektilů, dropů, částic, telegrafů a kvašového osvětlení.

## Důsledky

Renderovací pipeline je plně modulární, přísně testovatelná v izolaci (`tests/arenaRenderer.test.ts`), netrpí paměťovými úniky a bezpečně škáluje napříč výkonnostními profily při stabilních 60 FPS.
