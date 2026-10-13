# Odstranění skrytých bonusů nepřátel (Zero-Hidden-Cheat Policy)

Zajištění transparentního bojového systému, kde strašidla a bubáci nikdy nezískávají skryté statistické bonusy (žádné umělé škálování životů/Kuráže, žádná skrytá odolnost proti odhození, žádné skryté zvyšování poškození či rychlosti z adaptivního tlaku Režiséra). Jediné povolené úpravy statistik plynou z explicitních schopností nestvůr a zřetelných přívlastků (Vichřicový, Hromový, Kamenný, Pekelný).

## Uživatelská rozhodnutí & kritické volby

> [!IMPORTANT]
> Na základě ujasnění v 1. fázi byla potvrzena následující pravidla:
> - **Dynamický tlak Režiséra (`pressureMultiplier`)**: Odstranit veškeré skryté zrychlování a navyšování odolnosti nepřátel (`e.speed *= ...`, `e.poiseResist += ...`) při dominanci hráče.
> - **Taktické formace**: Ponechat pevné taktické role formací (např. obkličující křídla a předvoj), avšak bez skrytých multiplikátorů z tlaku.
> - **Základní statistiky nepřátel**: Všechna strašidla se líhnou s přesnými základními statistikami definovanými v bestiáři `ENEMIES[id]`. Odstraňují se skryté multiplikátory životů a skryté miniboss buffy (`poiseResist`, `damage`, `hunger`).
> - **Explicitní schopnosti a folklórní mechaniky**: Zachovat explicitní schopnosti nestvůr (Stínová záštita pro kategorii stínů ve tmě, aura Bludičky, mariášové karty Čerta) a přívlastky.

---

## 1. Přehled a cíl změn

- **Co změna přináší**: Úplnou transparentnost a čitelnost bojového střetu. Hráč ví, že když čelí Kostlivci nebo Raráškovi, nestvůra má vždy identické atributy podle Kodexu/Bestiáře. Obtížnost hry a Režisér výpravy škálují tempo střetnutí, kompozici vln a četnost elit, nikoliv skryté staty jednotlivých řadových nepřátel.
- **Cílová skupina**: Hráči oceňující férový rogue-lite zážitek, kde znalost slabin a vlastností bubáků platí bez skrytých deformací.
- **Klíčová hodnota**: Odstranění frustrace z "gumových" a nepředvídatelně zrychlených či odolných monster při úspěšném hraní.

---

## 2. Uživatelská zkušenost & herní design

- **Vizuální a herní zpětná vazba**:
  - Pokud má nepřítel zvláštní vlastnost, hráč ji vidí na první pohled:
    - **Přívlastky**: Zřetelná ladovská runová aura, ikona a banner (Vichřicový, Hromový, Kamenný, Pekelný).
    - **Explicitní schopnosti**: Vizuální kvašová záře Stínové záštity (rozpadající se při vstupu do světla Petrolejky s omráčením), hořící lávová stopa Pekelného čerta.
    - **Taktické formace**: Formace mají jasné geometrické rozmístění (kleště z obou stran, kovadlina zepředu), ne neviditelná kouzla zvedající staty v pozadí.

---

## 3. Klíčová systémová rozhodnutí

- **Rozhodnutí 1: Čisté líhnutí ze základních dat (`ENEMIES[id]`)**:
  - *Zvolený přístup*: V `createHeadlessEnemy` (`engine.ts`) i `createEnemyInstance` (`App.tsx`) se `hp`, `speed`, `damage`, `poiseResist`, `foodResist`/`hunger` a `willpower` nastavují přímo z `stats = ENEMIES[resolvedId]`.
  - *Důvod*: Zaručuje absolutní konzistenci napříč všemi úrovněmi a zamezuje skrytému ztěžování.
  - *Alternativa*: Ponechat multiplikátory pro minibosse — zamítnuto uživatelem, každý nepřítel má své definované statistiky v bestiáři.

- **Rozhodnutí 2: Očištění Režiséra výpravy (`RunDirector`) od skrytých statových buffů**:
  - *Zvolený přístup*:
    - V `executeTacticalSpawns` odstranit `this.pressureMultiplier > 1.2` buffy na rychlost a odolnost.
    - V `spawnPrefixedEnemy` odstranit tlakový rychlostní buff.
    - Ve formacích (`spawnKlestoveSevreni`, `spawnHammerAndAnvil`, `spawnEscortSwarms`, `spawnArchitects`, `spawnAntiKiteInterception`, `executeDrtivyPrepad`) odstranit dodatečné multiplikátory závislé na `pressureMultiplier`.
    - V `spendExcessBudgetOnElite` (Ostřílení běsi) zrušit náhodné navyšování rychlosti a poise resistu již živým nepřátelům na ploše. Místo toho Režisér utrácí přebytečný rozpočet za nasazení nových taktických elit či formací v mezích limitu.
  - *Důvod*: Režisér má modulovat hrozbu skladbou a kadencí vln, ne potají "přitápět" statistikami jednotek.

- **Rozhodnutí 3: Zachování folklórních schopností a přívlastků**:
  - *Zvolený přístup*: Přívlastky z `ENEMY_PREFIX_DEFS` i Stínová záštita (`evaluateShadowDefense` / `getShadowDefenseMultipliers`) zůstávají plně aktivní jako explicitní pravidla svícení a přívlastků.

---

## 4. Technická architektura & tok dat

```
┌────────────────────────────────────────────────────────┐
│                      BESTIÁŘ                           │
│        src/data/enemies.ts (ENEMIES[id])               │
│   (Pevná Kuráž, Základní rychlost, Poškození, Resist)  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   PŘÍVLASTKY MONSTER                   │
│       src/types.ts (ENEMY_PREFIX_DEFS[prefix])         │
│   (Explicitní bonusy: vichřicový, kamenný, atd.)       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                 ENGINE & LÍHNUTÍ ENTIT                 │
│  src/game/engine.ts & src/App.tsx                      │
│  - finalHp = stats.hp (+ prefix)                       │
│  - speed = stats.speed (+ prefix)                      │
│  - damage = stats.damage                               │
│  - poiseResist = stats.poiseResist (+ prefix)          │
│  - ŽÁDNÉ skryté multiplikátory ani clampy              │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                   REŽISÉR VÝPRAVY                      │
│                src/game/director.ts                    │
│  - Řídí pouze rozpočet hrozeb, pauzy (lull),           │
│    četnost a složení vln a taktické formace            │
│  - ŽÁDNÉ skryté buffy z pressureMultiplier             │
└────────────────────────────────────────────────────────┘
```

### Plánované úpravy v souborech:
1. `src/game/engine.ts`:
   - V `createHeadlessEnemy`: Odstranit skryté multiplikátory HP, `isMiniboss` úpravy `poiseResist`, `foodResist`, `hunger`, `willpower`, `damage` a `speed`, a odstranit level-specifickou redukci rychlosti Polednice.
2. `src/App.tsx`:
   - V `createEnemyInstance`: Synchronizovat stejné odstranění skrytých bonusů jako v `createHeadlessEnemy`.
3. `src/game/director.ts`:
   - Odstranit všechny větve `if (this.pressureMultiplier > 1.2)` aplikující `speed` a `poiseResist` buffy.
   - Odstranit dynamické navyšování statů v `spendExcessBudgetOnElite`.
4. `docs/adr/0008-odstraneni-skrytych-bonusu-nepratel.md`:
   - Zaznamenat architektonické rozhodnutí o odstranění skrytých bonusů a zachování Zero-Hidden-Cheat principu.
5. `tests/`:
   - Aktualizovat a rozšířit testy v `tests/enemyPrefixes.test.ts`, `tests/runDirector.test.ts` a `tests/gameEngine.test.ts` pro ověření striktního dodržování základních statistik.
