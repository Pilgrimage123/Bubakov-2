# Fázová integrace vyčleněného herního enginu do App.tsx

## Kontext
Herní logika a simulační smyčka byly historicky zapsány přímo uvnitř rozsáhlé komponenty `src/App.tsx` (přes 9 300 řádků). V rámci integračního stagingu vznikla nová modulární headless třída `GameEngine` v `src/game/engine.ts` s vlastními testy. Kompletní jednorázový přepis simulační a renderovací smyčky v `App.tsx` by nesl nepřijatelné riziko regrese grafického plátna, kamerového systému a příběhových cutscén.

## Rozhodnutí
Rozhodli jsme se pro fázovou integraci přes adaptér (Phase-1 Adapter). `App.tsx` propojí svůj `engineRef.current` a deleguje klíčové subsystémy – Režiséra výpravy (`RunDirector`) s taktickým pacingem a varovnými bannery a vyhodnocování milníků zbraní (`weaponMilestones` a `WeaponMilestoneModal`) – na modulární vrstvu, zatímco Canvas render pipeline, obsluha vstupu, dosavadní správa dropů a specifické scénky zůstávají v `App.tsx` stabilní. Pokročilá fúze a magnetické vlny ze `SmartDrops` jsou odloženy do Fáze 2.

## Důsledky
Simulace získává výhody deterministického režiséra a otestovaných milníků zbraní bez vizuálních regresí. Úplné vyčlenění Canvas renderu a integrace `SmartDrops` proběhne v navazující fázi po stabilizaci stagingu.

