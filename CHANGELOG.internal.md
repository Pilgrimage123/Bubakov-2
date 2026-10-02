# Bubákov – Internal Changelog

## 2026-10-02 — Production cleanup / standalone retirement

### Production workflow
- Retired legacy standalone HTML/TXT generation from the npm build.
- Retired the in-game standalone HTML/TXT download controls and helpers.
- Removed the obsolete standalone download CSS.
- Standard Vite `dist/` output is the canonical production artifact.

### Gameplay correctness
- Kept the canonical `DAWN_TIME_SECONDS = 360` constant.
- Updated the duplicated dawn victory check in `PlanModal.tsx` to use the canonical constant, avoiding the previous timing mismatch.

### Data preservation
- Preserved the complete current source tree and game assets from the supplied production-cleanup archive.
- Preserved the 49-entry enemy registry, including the palette variants (Sazový rarášek, Krvavý kostlivec, Močálová ropucha, Obrněný hejtman lapků).
- No game data was intentionally removed as part of the standalone cleanup.
