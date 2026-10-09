# 02: Ladovský Canvas 2D Lighting Renderer (Offscreen mask & stepped cel-rings)

**What to build:**
Samostatný renderovací modul `src/render/lightingRenderer.ts`, který spravuje offscreen canvas buffer a vykresluje vrstvu ladovského šerosvitu. Světla vyřezávají temnotu pomocí `destination-out` s diskrétními soustřednými prstenci. Integrace do hlavní renderovací smyčky v `src/App.tsx`.

**Blocked by:** 01-light-source-model-engine-query.md

**Status:** completed

- [x] Implementovat `src/render/lightingRenderer.ts` s alokací a škálováním offscreen canvasu (0.5x rozlišení pro maximální výkon).
- [x] Vykreslit noční masku temnoty s ambientní barvou odpovídající úrovni a denní fázi.
- [x] Implementovat funkci pro vyřezávání světelných kruhů (`destination-out`) s ladovským stupňováním (2-3 soustředné prstence se sníženou opacitou).
- [x] Integrovat `lightingRenderer` do render loopu v `src/App.tsx` po vykreslení entit a před damage texty/UI.
- [x] Ověřit, že při denních fázích bez temnoty (Poledne, Úsvit) je renderovací krok přeskočen pro úsporu výkonu.
