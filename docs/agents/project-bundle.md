# Project Bundle for Performance Analysis

When exporting or bundling the codebase into a single text file (e.g. for LLM analysis, external review, or performance profiling), avoid raw recursive dumping of the repository.

## Canonical script

```bash
node scripts/export-project-bundle.cjs
```

Or via npm script:

```bash
npm run bundle
```

Or via PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/export-project-bundle.ps1
```

Or specify a custom output path:

```bash
node scripts/export-project-bundle.cjs /path/to/output.txt
```

Default target is always the user's Documents folder: `[MyDocuments]\cely_bubakov.txt`.

## Filtering rules

### Included
- **Configuration**: `package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`.
- **Architecture & Domain**: `GLOSSARY.md`, all ADRs (`docs/adr/*.md`), and specs (`docs/specs/*.md`).
- **Core Runtime & Rendering**:
  - `src/App.tsx`, `src/main.tsx`, `src/types.ts`, `src/constants.ts`, `src/index.css`.
  - All game simulation engine files (`src/game/*` excluding `.test.ts`).
  - All rendering pipeline files (`src/render/*`).
  - Entity and balance data (`src/data/*`).
  - Active UI HUD and gameplay dialogs (`src/components/*` except dev modals).
- **Performance Verification Tests**:
  - `tests/zeroAllocationRender.test.ts`
  - `tests/arenaRenderer.test.ts`
  - `tests/chunkCache.test.ts`
  - `tests/glyphAtlas.test.ts`
  - `tests/downscaledLighting.test.ts`

### Excluded
- **Binaries & Media**: Audio (`public/audio/*.mp3`), images (`.png`, `.jpg`, `.webp`), fonts (`.woff`, `.ttf`).
- **Package Lockfiles**: `package-lock.json`, `bun.lock`, `skills-lock.json`.
- **Change History**: `changelog.md`.
- **Previous Bundles**: Any `.txt` bundle in repo root (e.g. `arena_performance_bundle.txt`, `cely_projekt.txt`).
- **Localization Dictionaries**: `src/i18n/locales/*` (huge text string tables with no runtime logic).
- **Internal Dev / Debug Modals**:
  - `src/components/AnimationTesterModal.tsx`
  - `src/components/TestModeModal.tsx`
  - `src/components/SettingsDevModal.tsx`
  - `src/components/KronikaChanges.tsx`
- **Generic Unit Tests**: Regular unit tests in `tests/` that do not test GC or frame budgets.
