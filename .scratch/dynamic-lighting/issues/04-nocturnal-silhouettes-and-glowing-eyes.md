# 04: Noční siluety a svítící oči bubáků v temnotě mimo dosah svitu

**What to build:**
Vizuální prvek "očí ve tmě": pokud je bubák v aktivní noční fázi (Noc, Půlnoc) a nachází se mimo poloměr jakéhokoliv aktivního světla, jeho silueta je potlačena v temnotě a vykreslují se jeho svítící ladovské oči (páry žlutých/červených/bílých teček s inkoustovou konturou).

**Blocked by:** 02-canvas-2d-lighting-renderer.md

**Status:** ready-for-agent

- [ ] Přidat helper v `src/render/lightingRenderer.ts` nebo `src/render/ladaRenderer.ts` pro ověření, zda je bod osvětlen (`isPointLit(x, y, lights)`).
- [ ] Vykreslit stylizované oči ve tmě nad pozicí neosvětlených bubáků v `src/render/lightingRenderer.ts` v emissivní vrstvě nad maskou temnoty.
- [ ] Různé barvy očí dle typu bubáka (např. Čert / Pekelníci = ohnivě rudé, Polní = žluté, Vodní = bledě modré).
- [ ] Testy ověřující kalkulaci `isPointLit` a barev očí bubáků.
