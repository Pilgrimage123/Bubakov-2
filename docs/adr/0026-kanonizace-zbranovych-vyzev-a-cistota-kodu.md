# 0026 - Kanonizace zbraňových výzev, obnova JSX a čistota kódu

## Stav
Přijato

## Kontext
V návaznosti na ADR 0021 (české snake_case identifikátory zbraní) a ADR 0023 (lokalizace) se v repozitáři nahromadilo několik technických dluhů, nekonzistencí a poškozených souborů:
1. **Poškození komponent esbuildem/transpilérem**: Sedm komponent v `src/components/` (`KrejcarIcon.tsx`, `CzechBuchtaIcon.tsx`, `ResetProgressModal.tsx`, `ArsenalModal.tsx`, `HunterUnlockModal.tsx`, `BestiaryModal.tsx`, `WeaponUnlockModal.tsx`) bylo znehodnoceno transpilovanými zbytky (`import_jsx_runtime`, `(0, import_jsx_runtime.jsx)`, `import_react`).
2. **Nekonzistentní klíče ve zbraňových výzvách**: V `src/data/weaponUnlocks.ts` přetrvávaly staré anglické (`pitchfork`, `halberd`, `flail`, `herbs`, `snowball`, `kolac`, `potato`, `bees`, `holywater`) a pomlčkové klíče (`cesnekova-topinka`, `kysela-okurka`), a chyběly 3 dědečkovy zbraně (`bylinkova_fajfka`, `formansky_bic`, `splaseny_houser`).
3. **Mutace exportovaných struktur v běhu**: Moduly `weapons.ts` a `weaponUnlocks.ts` při startu v cyklu mutovaly exportovaný objekt a zaplňovaly jej aliasy, což vedlo k duplicitám v `Object.keys()` a riziku znečištění výčtů v UI (např. v Arzenálu).
4. **Rozpory v textech lovců a bestiáře**: Popisy v `cs.ts` a `en.ts` pro Pasáčka a Kostelníka odkazovaly na neaktuální zbraně a schopnosti (Pasáček začíná s `Povidlovými buchtami` a `Dusotem stáda`, Kostelník se `Svěcenou kropenkou` a `Farním požehnáním`). V bestiáři byl boss `cert` v češtině pojmenován jako `Rohatej čert`, ačkoliv GLOSSARY a `enemies.ts` stanovují `Pekelný Čert`.
5. **Riziko ztráty progresu v migraci**: Migrační funkce v `src/game/migration.ts` předpokládala číselné hodnoty pro `weaponKillCounts`, což při migraci objektových statistik (`{ [enemyId]: count }`) mohlo vést k vynulování progresu hráče.

## Rozhodnutí
1. **Kompletní de-transpilace komponent**: Všech 7 komponent bylo zrekonstruováno do čistého, čitelného a typově bezpečného React 19 JSX/TSX bez jakýchkoliv artefaktů kompilátoru.
2. **Kanonizace klíčů v `weaponUnlocks.ts`**: Veškeré definice v `RAW_WEAPON_UNLOCKS` byly sjednoceny na kanonický český `snake_case`. Byla doplněna plnohodnotná data pro zbývající 3 zbraně (`bylinkova_fajfka`, `formansky_bic`, `splaseny_houser`), čímž všech 18 kanonických zbraní ze zbrojnice disponuje folklórním popisem i statistikami.
3. **Nemutující Proxy rozhraní**: Exportované objekty `WEAPONS` i `WEAPON_UNLOCKS` jsou nyní zapouzdřeny v `Proxy`. `Object.keys()` striktně vrací pouze 18 kanonických klíčů, zatímco přístup přes starší aliasy (`WEAPON_LEGACY_ALIASES`) je transparentně přesměrován bez modifikace cílového objektu.
4. **Bezpečná migrace LocalStorage**: V `migration.ts` byl upraven kód pro `weaponKillCounts` tak, aby bezpečně sloučil jak historické číselné součty, tak podrobné rozbory zabitých monster pod kanonické ID zbraně.
5. **Harmonizace lokalizací a doménového modelu**: Popisy lovců byly sladěny s `HUNTER_DETAILS` (Pasáček: Povidlové buchty / Dusot stáda; Kostelník: Svěcená kropenka / Farní požehnání). V českém bestiáři byl `cert` sjednocen na `Pekelný Čert`.

## Důsledky
- Kód je čistý, plně čitelný a splňuje vysoký standard řemeslného zpracování v React 19.
- Arzenál zobrazuje přesně 18 kanonických zbraní bez duplicit či neznámých ID.
- Staré uložené pozice v prohlížeči jsou 100% zpětně kompatibilní a migrují se beze ztráty progresu.
- Všechny automatické testy a linting procházejí bez chyb (431 testů).
