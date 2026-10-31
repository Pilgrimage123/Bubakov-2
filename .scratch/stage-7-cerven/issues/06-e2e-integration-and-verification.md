# 06: E2E integrace 7. úrovně, balancování obtížnosti a verifikace

**What to build:** The player experiences a seamless, bug-free, and high-intensity full 5-minute playthrough of Stage 7 from level select through intense waves, interactive POI activations, crayfish and devil encounters, all three boss fights, to glorious level victory and trophy unlock, verified by end-to-end integration tests without visual clipping or performance drops.

**Blocked by:** 03: Ladovská vizuální krajina Června a procedurální grafika, 05: Pekelní a červnoví bossové (Vele-rak, Pekelný čert sekáč a Královská Polednice)

**Status:** closed

- [x] Complete end-to-end test suite (`tests/level6Cerven.test.ts`) verifies full progression through Stage 7.
- [x] Expedition menu correctly displays and unlocks Stage 7 when Stage 6 is cleared.
- [x] Full 300 s timeline executes smoothly without runtime exceptions in headless and interactive modes.
- [x] Interactive POIs ([E] St. Anthony vacuum blessing, [E] blueberry gathering, haystack pathing) function consistently during heavy combat.
- [x] Spawn pools correctly spawn both new swarms (mice and soot devils), devils, and seasonal mobs while strictly avoiding any undead.
- [x] All three boss fights (Vele-rak, Čert sekáč, Královská Polednice) spawn on schedule, display banners, execute phases, and award victory on final defeat.
- [x] Game difficulty confirms approximately +200% scaling over Stage 1 in mob density, survivability metrics, and incoming DPS.
- [x] Full test suite passes completely green with no regressions in existing stages.
