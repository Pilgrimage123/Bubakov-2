# Sjednocení identifikátorů lovců a strašidel, vyčištění distribučního bundlu a ochrana složky public

## Kontext
V návaznosti na kanonizaci zbraní v ADR 0021 a zavedení nových spritů v ADR 0030 vykazovala kódová základna několik architektonických nekonzistencí a výkonnostních dluhů:
1. **Tříštivost identifikátorů postav a entit**: Lovci byli v typech i datech zapsáni hybridně – část v češtině (`krajanek`, `korenarka`), ale většina v angličtině (`wanderer`, `shepherd`, `watchman`, `sexton`, `granny`). Podobně v bestiáři z 58 strašidel zůstávala dvě základní s anglickým ID (`skeleton`, `skeleton_scythe`).
2. **Přetížení distribučních artefaktů rastry z externího prototypování**: Ve složce `public/assets/aistudio/` leželo 13 velkých rastrových souborů (přes 24 MB), které vznikly při dřívějším rychlém webovém prototypování v Google AI Studiu. Žádný z nich nebyl v herním běhu aktivně používán, avšak Vite je při každém sestavení kopíroval do produkční složky `dist/`.
3. **Monolitický 2,5MB JavaScript bundle**: Celá aplikace se kompilovala do jediného masivního souboru `index.js`, což zatěžovalo parsování a paměť prohlížeče i v situaci, kdy hráč pouze hrál hru a nepotřeboval otevírat vývojářská okna (`AnimationTesterModal`, `TestModeModal`, `PlanModal`, `BestiaryModal`).
4. **Zbytky zastaralé simulační logiky a reliktní parametry**: V `App.tsx` přežívaly staré záložní hodnoty Kuráže u Hejna mrazivých vran (`|| 168` namísto balancovaných 38 z ADR 0030) a duplicitní časovač pasivní fajfky `fajfkaLevel`, jež po povýšení Bylinkové fajfky na plnohodnotnou zbraň (ADR 0015) nechtěně zdvojoval kouřové efekty.

## Rozhodnutí

### 1. Kanonizace identifikátorů lovců a strašidel na český `snake_case`
- Zavedeny autoritativní české identifikátory:
  - Lovci: `krajanek`, `tulak`, `pasacek`, `korenarka`, `ponocny`, `kostelnik`, `babicka`.
  - Kostlivci: `kostlivec` (*Kostlivec ze svatého Jiří*) a `kostlivec_kosa` (*Kostlivec s rezavou kosou*).
- V `src/game/migration.ts` i v datových registrech (`HUNTER_DETAILS`, `HUNTER_UNLOCKS`, `ENEMIES`) byla zavedena obousměrná normalizace a vrstva neenumerovatelných aliasů (`toCanonicalHunterId`, `toCanonicalEnemyId`), která garantuje 100% zachování uložených pozic v LocalStorage i stabilitu počtu 58 kanonických strašidel v zátěžových benchmarcích.

### 2. Ochrana složky `public` a zákaz ukládání rastrových experimentů
- Z repozitáře bylo kompletně odstraněno všech 13 nepoužívaných souborů v `public/assets/aistudio/` (úspora 24,2 MB).
- V `AGENTS.md` a v `.gitignore` byla zavedena striktní pravidla: adresář `public/assets/` nesmí sloužit jako odkladiště experimentálních obrázků z AI Studia; veškeré herní postavy musí být výhradně autentické procedurální canvasové rutiny či vektorové Smart SVG komponenty.

### 3. Zavedení Code-Splittingu a asynchronních vývojářských modálů
- V `vite.config.ts` byla nakonfigurována strategie `manualChunks`:
  - `vendor-react`: React a React-DOM.
  - `smart-svg`: komplexní vektorové animační komponenty.
  - `lada-renderer` a `lada-icons`: kreslicí canvasové rutiny a ladovské ikony.
  - `march-thaw-landscape`: rozsáhlá SVG mapa arény.
- V `src/components/AppModals.tsx` byly vývojářské a zřídka otevírané dialogy (`AnimationTesterModal`, `TestModeModal`, `PlanModal`, `BestiaryModal`, `SettingsDevModal`, `ArsenalModal`, `CombatTextSettingsModal`, `ResetProgressModal`) převedeny na asynchronní načítání pomocí `React.lazy()` a chráněny hranicí `<Suspense fallback={null}>`.
- Hlavní herní JS bundle pro prvotní načtení klesl z 2 478 kB na 1 209 kB (komprese gzip klesla na 338 kB).

### 4. Oprava logiky Hejna vran a vyčištění fajfky
- Záložní výpočet celkové Kuráže vraního hejna v `App.tsx` byl opraven na korektních 38 Kuráže na vránu.
- Odstraněn zastaralý blok pasivního časovače `fajfkaLevel` v simulační smyčce; *Bylinková fajfka* se spouští výhradně autoritativní zbraňovou cestou přes `weapons.ts`.
- Sirotčí test `src/game/frostAura.test.ts` byl přesunut na kanonické místo `tests/frostAura.test.ts`, nepoužívaný komponent `AnimatedBubak.tsx` byl smazán a vyčištěny reliktní soubory `bun.lock` a `arena_performance_bundle.txt`.

## Důsledky
- Kódová základna i datové struktury jsou v plném souladu s českým doménovým jazykem hry.
- Velikost buildu a spotřeba paměti klesly o více než 50 % a build probíhá s nulovým počtem varování.
- Starší uložené pozice hráčů zůstávají plně funkční díky transparentní migrační vrstvě.
