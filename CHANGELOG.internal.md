# Bubákov – Internal Changelog

## 2026-10-02 — Stage selection separated into dedicated screen preceding hunter selection
- Separated expedition (stage) selection and hunter selection into two distinct sequential screens:
  - Screen 1 (Výběr výpravy): Dedicated screen for choosing from all 6 progressive stages with rich lore, key enemies preview, seasonal themes, boss hints, and unlock challenges/milestones. Selected stage is confirmed via a prominent callout bar with "Pokračovat k výběru lovce ➔".
  - Screen 2 (Výběr lovce): Dedicated screen for choosing from the 6 folk heroes with real-time animated Ladovská canvas portraits, abilities, and starting weapons. Includes an persistent chosen-stage header chip with easy navigation back to stage selection ("⬅️ Zpět k výběru výpravy").
- Preserved menu music playback across both screens without interruption.
- Updated tally progression, tavern navigation, and unlock modals to seamlessly route through the two-screen flow.

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

## 2026-10-02 — Boss mechanics audit and fixes
- Fixed TypeScript compile error in `App.tsx` where village upgrade variables (`millBonusSpeed`, `scarecrowBonusPickup`, `ovenDmgMult`, `wallDmgRed`) were declared twice and `wallBonusHp` was 0.
- Resolved race condition in `saveMeta` where `metaRef.current` was not updated synchronously, causing subsequent immediate calls (e.g. `triggerLevelVictory`) to overwrite newly recorded `bestiaryKills` and progress counters with stale meta state.
- Fixed boss mechanics loop where generic cadence banner checks were chained as an `else if` on level 4, causing spurious repetitive HUD warning banners across levels 1, 2, and 3, and bypassing mechanics on level 4.
- Implemented full dedicated Phase 2 enrage and dynamic combat mechanics for Level 5 boss (Bezhlavý rytíř: "Prokletí hlásky", rebounded boomerang head projectile, and heavy cavalry strike) and Level 6 boss (Tříhlavý drak: "Probuzení všech tří hlav", dragon flame breath cone, and falling icicles from cavern ceiling).
- Fixed boomerang projectile collision handling so Bezhlavý rytíř's flying head rebounds back across the arena instead of vanishing on contact with the player, while guarding against multi-frame damage.
- Fixed `createEnemyInstance` so HP scaling multipliers are correctly applied to mini-bosses and mid-bosses rather than only when `isBoss` is true.
- Fixed `levelUnlocks.ts` `getLevelProgress` bossDefeated check to support levels 4, 5, and 6 (`obr`, `mlynar`, `bezhlavy_rytir`).
- Added missing `hejkal` check in final boss victory detection alongside other boss IDs.
- Added trophy definitions for levels 4, 5, and 6 bosses and level completions.

## 2026-10-02 — Treasure drop threshold and slot machine effect
- Increased treasure chest drop threshold (`DROP_THRESHOLDS.chest`) 7x (from 100 to 700 points).
- Scaled chest unlock formula and HUD progress indicator to display dynamically against 700 points (`runStats.chestProgress / DROP_THRESHOLDS.chest`).
- Implemented full authentic Ladovská slot machine effect for opening treasure chests (Malovaná truhla):
  - 3-reel spinning cabinet with cylindrical gradient windows, animated rolling symbol strips, and dark ink typography.
  - Staggered deceleration sequence with sound ticking (`sound.slotTick()`), metallic latch locks (`sound.slotStop()`), and jackpot fanfare (`sound.slotJackpot()`).
  - Added skip button and keyboard controls (Space / Enter to skip spinning or claim rewards).
  - Rewards include krejcars, health/speed boosts, buns, and active weapon level upgrades.


