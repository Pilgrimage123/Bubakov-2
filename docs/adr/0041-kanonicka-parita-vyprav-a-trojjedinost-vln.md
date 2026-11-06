# 0041. Kanonická parita výprav, rozpočet strašidel a Pravidlo trojjedinosti vln

Datum: 2026-11-06  
Stav: Přijato  
Vazba: `docs/STAGE_CREATION_GUIDE.md`, ADR 0037, ADR 0038

## Kontext

Po rozšíření kampaně na 16 výprav a sepsání uceleného architektonického kodexu `docs/STAGE_CREATION_GUIDE.md` odhalil detailní systémový audit celkem 5 oblastí nesouladu mezi implementací a kodexem:
1. **Chybějící rozpočet strašidel (Past č. 6)**: V `src/constants.ts` v tabulce `ENEMY_POINTS` chyběly bodové hodnoty pro dubnové bosse (`beranek`, `carodejnice_stara`, `vrchni_carodejnice`), což znemožňovalo validní rozpočtový přepočet u Režiséra výpravy.
2. **Překlep v kánonu minibosse**: V Tabulce 2.1 příručky byl jako miniboss 13. úrovně uveden `svestkovy_srsen` namísto skutečného bosse `kralovsky_srsen`.
3. **Narušení Pravidla trojjedinosti vln (Pilíř II.1)**: Ve 2. úrovni (Noční mrazy), 14. úrovni (Svatováclavská noc) a 16. úrovni (Dušičková noc) chyběly v nočních bazénech taktičtí letci/narušitelé nebo drobná havěť.
4. **Narušení Zákona dvojí parity (ADR 0037 / Pilíř IV.1)**:
   - Pro Květen (úrovně 4 a 5) chyběla v bezhlavém `src/game/engine.ts` simulace klávesy `[E]` u hospodského soudku a zvonice a pole `kvetenActivePoiPrompt` neexistovalo v `EngineState`.
   - Pro Červen (úrovně 6 a 7) se `cervenActivePoiPrompt` nenastavoval v React klientu `App.tsx`.
   - Pro Říjen (úrovně 14 a 15) chybělo omezování polohy dropů v `clampToMarchArenaBounds` jak v `engine.ts`, tak v `App.tsx`.
5. **Nekonzistentní smlouva nápovědy HUDu (Pilíř V.2)**: Nápovědy klávesy `[E]` v některých měsících používaly zbytečně rozvláčné věty typu `Stiskni [E]: ...` namísto kanonického infinitivního formátu.

## Rozhodnutí

1. **Doplnění `ENEMY_POINTS`**: Přidány hodnoty `beranek: 700`, `carodejnice_stara: 1500` a `vrchni_carodejnice: 4500` do `src/constants.ts`, které respektují aditivní křivku obtížnosti ADR 0038.
2. **Oprava kánonu v průvodci**: Tabulka 2.1 v `docs/STAGE_CREATION_GUIDE.md` opravena na `kralovsky_srsen`, zatímco `svestkovy_srsen` zůstává řadovým sezónním letcem.
3. **Harmonizace vlnových bazénů**:
   - Do 2. úrovně přidána `vrana` (`isFlying: true`).
   - Do 14. úrovně přidán `svestkovy_srsen` (`isFlying: true`).
   - Do 16. úrovně přidána `zaba` (drobná havěť `radius: 12 px`) a `carodejnice_koste` (`isFlying: true`), čímž jsou splněny všechny tři archetypy při zachování stropu max. 7 výskytů na strašidlo v kampani.
4. **Úplná parita headless enginu a klienta**:
   - Doplněno `kvetenActivePoiPrompt` do `EngineState` a `GameEngine` accessors.
   - Implementována plná 1:1 obsluha klávesy `[E]` pro májový soudek piva i zvonici sv. Mikuláše v `src/game/engine.ts`.
   - Zrcadleno nastavování `cervenActivePoiPrompt` a `kvetenActivePoiPrompt` v `src/App.tsx`.
   - Rozšířen výčet úrovní v `clampToMarchArenaBounds` pro dropy o úrovně 14 a 15 v `engine.ts` i `App.tsx`.
5. **Kanonizace HUD nápovědy**: Všechny výzvy k interakci byly sjednoceny na formát `[E] <Sloveso v infinitivu> <Předmět> (<Název dominanty>)` (např. `[E] Vystřelit růži (Střelnice)`, `[E] Upéct chléb (Chlebová pec)`).
6. **Aktualizace GLOSSARY.md**: Aktualizován pojem Výprava (16 úrovní) a zařazeny klíčové termíny z kodexu (*Ohnisko výpravy*, *Pravidlo trojjedinosti vln*, *Kolizní stín letce*, *Kruhový zásobník terénu*, *Škrcení bojových textů*).

## Důsledky

- Všech 16 výprav je nyní ve stoprocentní shodě s `docs/STAGE_CREATION_GUIDE.md`.
- Headless simulace pro CI testy a reálná hra v prohlížeči jsou dokonale paritní.
- Pravidlo trojjedinosti vln zajišťuje rovnoměrný herní zážitek a zabraňuje stacionárnímu kroužení s jedinou dominantní zbraní.
