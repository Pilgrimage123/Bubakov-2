# 03: Únor – Den: Masopustní průvod a koblihy (Stage 23 / Level 22)

**What to build:** Kompletní vertikální řez 23. fází (Předposlední úroveň celoročního cyklu: Únor v Hrusicích – Denní masopustní průvod). Hráč zažije bujaré masopustní veselí na zasněžené návsi, kde může u hospody pomoci smažit čerstvé koblihy pro okamžitou obnovu kuráže a rychlostní bonus. Proti hráči stojí pestrý masopustní průvod maškar – Laufr, Bába s nůší, Koblihový rarach, MiniBoss Masopustní medvěd s medvědářem, MeziBoss Slaměný panák a VeleBoss Rychtář maškar.

**Blocked by:** 02: Aktualizace `STAGE_CREATION_GUIDE.md` a architektonických pravidel pro 24 fází

**Status:** closed

- [x] Rozšířit `GameLevelId` v `src/types.ts` o hodnotu `22` a nastavit konstanty denní fáze, body nepřátel a rozmary běhu.
- [x] Definovat denní masopustní nepřátele a bossy v `src/data/enemies.ts` a začlenit je do `src/data/levels.ts` (Level 22) při dodržení Pravidla trojjedinosti vln.
- [x] Vytvořit autentické vektorové Ladovské vykreslovací rutiny v `src/render/ladaRenderer.ts`, zaregistrovat konfigurace v `src/render/bakedBubakAtlas.ts` a `src/components/gpu-animation/enemyCatalog.ts`.
- [x] Implementovat arénu a krajinné prvky v `src/data/unorArena.ts` a `src/render/unorSvgLandscape.ts` s ohniskem smažení masopustních koblih.
- [x] Zabezpečit 100% duální paritu ADR 0037 mezi `src/game/engine.ts` a `src/App.tsx` (hráč, monstra, drop clamping, kolize Dědečka).
- [x] Přidat lokalizaci do `cs.ts` a `en.ts`, odemykací podmínku v `src/data/levelUnlocks.ts` a trofej `level22_completed`.
- [x] Napsat a ověřit jednotkový testovací balík pro úroveň 22.
