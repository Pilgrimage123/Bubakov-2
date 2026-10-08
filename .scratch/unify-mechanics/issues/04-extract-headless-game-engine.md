# 04: Dekompozice bezhlavého modulu GameEngine z App.tsx

**What to build:** Vyčlenění herního stavu, prostorového hashe, časovačů herní smyčky, projektilů a fyziky do samostatného bezhlavého modulu `src/game/engine.ts`, aby herní logika fungovala nezávisle na React re-renderech a umožnila deterministické testování.

**Blocked by:** 02: Zapojení hodnostních statistik zbraní do bojové smyčky a benchmark vyvážení

**Status:** ready-for-agent

- [ ] Vytvořit bezhlavou třídu/modul `GameEngine` v `src/game/engine.ts`, která zapouzdřuje herní entitní stav (hráč, nestvůry, projektily, částice, spatial hash).
- [ ] Zpřístupnit rozhraní metod: `initRun()`, `update(dt)`, `spawnMonster()`, `applyWeaponAction()`, `getVisibleEntities()`.
- [ ] Propojit `App.tsx` s `GameEngine` tak, aby 60 FPS herní smyčka běžela uvnitř Canvasu/requestAnimationFrame bez triggerování React re-renderů.
- [ ] Napsat deterministický integrační test pro `GameEngine` ověřující aktualizaci stavu bez DOMu.
