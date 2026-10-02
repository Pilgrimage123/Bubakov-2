# Bubákov – Internal Changelog

## 2026-10-02 — Debug / production cleanup

### Repository audit
- Read the repository before making cleanup changes.
- No pre-existing internal changelog file was present in the uploaded repository.
- Audited the legacy standalone HTML/TXT artifacts before removing their production role.
- Parsed the embedded `bubakov-source-tree` snapshot from the legacy HTML.
- Compared all embedded `src/data/*` files against the current repository.
- No current game-data module was found to contain standalone-only data that needed migration.
- The legacy standalone snapshot is older than the current source in the files where it differs (`App.tsx`, `PlanModal.tsx`, `index.css`, `ladaRenderer.ts`, `types.ts`).

### Production workflow
- Retired standalone HTML/TXT generation from the npm build.
- Removed the standalone bundling npm script.
- Retired the in-game HTML/TXT download controls and download helpers.
- Removed standalone-specific CSS.
- Updated `DESIGN_PRINCIPLES.md` so the repository and normal Vite `dist/` build are the canonical source/output.
- Kept historical source/documentation files intact where they may still be useful for project history.

### Gameplay correctness
- Added canonical `DAWN_TIME_SECONDS = 360`.
- Updated the dawn phase to use that constant.
- Updated the victory trigger to use the same constant, eliminating the previous 300-second vs 360-second mismatch.

### Data-preservation rule
- Obsolete standalone artifacts were treated as a migration/audit source before cleanup, not as disposable files.
- No game data was intentionally removed as part of this change.
