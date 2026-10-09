# Fázová integrace vyčleněného herního enginu do App.tsx

## Kontext
Herní logika a simulační smyčka byly historicky zapsány přímo uvnitř rozsáhlé komponenty `src/App.tsx` (přes 9 300 řádků). V rámci integračního stagingu vznikla nová modulární headless třída `GameEngine` v `src/game/engine.ts` s vlastními testy. Kompletní jednorázový přepis simulační a renderovací smyčky v `App.tsx` by nesl nepřijatelné riziko regrese grafického plátna, kamerového systému a příběhových cutscén.

## Rozhodnutí
Rozhodli jsme se pro fázovou integraci přes adaptér (Phase-1 Adapter). `App.tsx` propojí svůj `engineRef.current` a deleguje klíčové subsystémy – režiséra vln (`RunDirector`), generování a magnetismus odměn (`SmartDrops`) a vyhodnocování zbraní a milníků (`weaponMilestones`) – na modulární vrstvu, zatímco Canvas render pipeline, obsluha vstupu a specifické scénky zůstávají v `App.tsx` stabilní.

## Důsledky
Simulace získává výhody deterministického a otestovaného enginu bez vizuálních regresí. Úplné vyčlenění Canvas renderu do čistě pasivní zobrazovací vrstvy proběhne v navazující fázi po stabilizaci stagingu.
