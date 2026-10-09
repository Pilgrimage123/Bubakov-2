# 01: Datový model světelných zdrojů a headless query v GameEngine

**What to build:**
Definice typů pro dynamické světelné zdroje (`LightSource`, `LightKind`, `LightingEnvironment`) v `src/types.ts` a headless modul `src/game/lighting.ts`, který na základě stavu `GameEngine` deterministicky počítá aktivní světla (lucerna lovce, ambientní intenzita fáze dne, blesky, plameny).

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Přidat rozhraní `LightSource` do `src/types.ts` (`id, x, y, radius, color, intensity, flickerSpeed, pulseAmount, kind`).
- [x] Implementovat `src/game/lighting.ts` s výpočtem ambientní temnoty dle `DayPhase` (Poledne = 0, Klekání = 0.25, Noc = 0.55, Půlnoc = 0.75, Úsvit = 0).
- [x] Vypočítat základní světelný zdroj lovce (lucerna) se škálováním dle charakteru (Ponocný: +25 % dosah).
- [x] Přidat metodu `getVisibleLightSources(viewLeft, viewTop, viewRight, viewBottom)` do `GameEngine`.
- [x] Vytvořit testy `tests/dynamicLighting.test.ts` ověřující generování světel v závislosti na fázi dne a typu lovce.
