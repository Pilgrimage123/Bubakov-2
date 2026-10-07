# Bubákov — Changelog

> **Source of truth:** aktuální implementace v `src/`. Historické hodnoty, které byly později změněny, nejsou uváděny jako aktuální stav.

## 2026-10-07 — Konsolidace changelogu a audit proti aktuální hře

### Aktuální stav systému zbraní
- Čtyři zbraně mají nový **osmirankový progression systém**: Osikový prut, Válečnice, Česneková topinka a Kyselé okurky.
- Ranky **3 / 5 / 8** jsou milestone ranky se dvěma vzájemně výlučnými volbami.
- Ranky **2 / 4 / 6 / 7** mají standardní progres:
  - +12 % damage za rank,
  - +8 procentních bodů weapon cooldown bonusu za rank,
  - +6 % area za rank.
- Interně se základní weapon damage násobí faktorem `1 + (level - 1) × 0,12`; area faktorem `1 + (level - 1) × 0,06`.
- Weapon cooldown používá:
  `baseCooldown / (1 + playerCooldownBonus + weaponCooldownBonus)`
  s minimem **50 % base cooldownu**.
- Milestone cooldown modifikátory se aplikují dodatečně jako násobitel.
- Milestone efekty jsou kumulativní a aktivují se pouze z voleb uložených v `weapon.milestones`.
- Validace vyžaduje přesně 8 ranků, milestone pouze na 3/5/8 a unikátní ID voleb.
- Starý mastery stav zůstává pouze kvůli kompatibilitě uložených her; nové mastery volby se negenerují.
- Tulák má **+30 flat damage ke všem zbraním**, který se přičítá k base damage před globálním damage multiplikátorem.

### Aktuální základní hodnoty čtyř milestone zbraní
| Zbraň | Base damage | Base cooldown |
|---|---:|---:|
| Osikový prut | 18 | 0,80 s |
| Válečnice | 34 | 0,55 s |
| Česneková topinka | 1 | 0,35 s |
| Kyselé okurky | 20 | 1,15 s |

### Aktuální milestone volby
- **Osikový prut**
  - Rank 3: Široký švih / Rázný bác
  - Rank 5: Prut větrník / Pevná násada
  - Rank 8: Prut košťátko / Prachová smršť
- **Válečnice**
  - Rank 3: Válečnický kruh / Rázný váleček
  - Rank 5: Dvojnásobný bác / druhá specializace kruhu
  - Rank 8: Válečnický kruh+ / Velký úklid
- **Česneková topinka**
  - Rank 3: Široký obláček / Silný obláček
  - Rank 5: Těžký obláček / specializace plochy
  - Rank 8: Velký česnekový oblak / Kyselý česnekový bác
- **Kyselé okurky**
  - Rank 3: Křupavá porce / specializace síly
  - Rank 5: Kyselá svačina / specializace síly
  - Rank 8: Velká okurková porce / Kyselý déšť

### Aktuální pasivní bonusy
- **Opravdová káva:** interně +0,1111111111 cooldown bonus; při použitém vzorci to odpovídá přibližně **−10 % efektivního cooldownu**.
- **Krvavé jelito:** `damageMultiplier × 1,15`, tedy **+15 % damage multiplikativně za stack**.
- **Medvědí mast:** **+30 Max Kuráž** a současně +30 aktuální Kuráže při získání.
- **Veselá mysl a písnička:** **+3 Kuráž každých 5 s za stack**.
- **Toulavé boty sedmimílové:** **+20 speed** z level-up volby.
- **Magnetický měšec:** **+30 pickup radius**.
- Truhla má pro Toulavé boty aktuálně samostatnou odměnu **+25 speed**.

### Aktuální drop hodnoty
- Běžná truhla: **29 400 bodů**.
- Potion: **450 bodů**.
- Bread: **250 bodů**.
- Soul: **120 bodů**.
- Coin: **20 bodů**.
- Bossové mají garantovanou boss loot logiku; miniboss při zklidnění generuje vlastní odměny.

### Aktuální miniboss systém
- Miniboss render scale: **1,75×**.
- Miniboss collision radius: **1,65×** základního radiusu.
- Minimální HP minibosse: **1 400**.
- Poise resist minibosse: minimálně **0,82**.
- Food resist minibosse: minimálně **0,78**.
- Willpower minibosse: minimálně **0,85**.
- Damage minibosse se počítá jako `stats.damage × 1,35 × 1,6`.
- Miniboss získává minimálně 25 coin value a 20 XP.
- Minibossové mají vlastní overhead HP, zlatou auru a jsou vizuálně zvětšeni.

### Aktuální opravy gameplay loopu
- Opravena stale-closure chyba herního loopu přes aktuální `gameStateRef` / synchronizované ref hodnoty.
- Dropy se nyní spolehlivě magnetizují a sbírají.
- Kontakt nepřítele s lovcem nyní správně způsobuje damage.
- Útěkový stav má prioritu před běžnou AI a synchronizuje rychlost, směr, pozici i animaci.
- SpatialHash používá aktuální pozice po pohybu nepřátel a je plně typovaný.
- Expirované projektily se ve stejném snímku již neúčastní kolizí.
- Boss HP HUD je oddělen od gameplay `takeDamage()`.
- Neznámé enemy ID vyvolá explicitní chybu.
- Final-boss victory je vázána na skutečného finálního bosse levelu.

## 2026-10-06 — Weapon milestone progression v2
- Implementován osmirankový progression systém pro čtyři hlavní milestone zbraně.
- Milestone volby jsou na ranku 3, 5 a 8.
- Přidány unikátní efekty a vizuální/audio tagy milestone voleb.
- Přidána runtime validace struktury milestone systému.
- Cooldown byl převeden na explicitní bonusový model s 50% cooldown capem.

## 2026-10-06 — Rework mastery a rebalance zbraní
- Generické mastery bonusy damage/cooldown/projektilů byly nahrazeny weapon-specific milestone efekty.
- Legacy mastery API zůstává pouze kvůli kompatibilitě starých save/import dat.
- Tulák získal +30 flat damage ke všem zbraním.
- Level zbraně již není samostatně skrytě násoben dalším implicitním combat bonusem mimo explicitní progression systém.

## 2026-10-06 — Nové zbraně
- Přidány Válečnice, Česneková topinka a Kyselé okurky.
- Válečnice používá orbitující váleček, knockback a od ranku 8 může získat další orbitující instanci.
- Česneková topinka používá permanentní kruhovou auru, knockback a na vysokých rankách zpomalení.
- Kyselé okurky používají cílené projektily a stav Přejedení; při vysokém počtu stacků nepřítel zezelená, zeslábne a přijímá více damage.
- Přidány React/SVG ikony a renderery nových zbraní.
- Nové zbraně jsou dostupné v arzenálu.

## 2026-10-06 — Opravy AI, lifecycle a kolizí
- Opravena útěková AI, která mohla přehrávat útěkovou animaci bez skutečného pohybu.
- Opravena stale closure chyba blokující sběr dropů a kontaktové poškození.
- Stabilizován dlouho žijící Canvas/requestAnimationFrame loop.
- Zlepšena lifecycle správa status efektů a prostorového indexu.
- Přidána ochrana proti zastaralým pozicím v SpatialHash.

## 2026-10-05 — Bossové a minibossové
- Pekelný čert dostal výrazný charge s windupem, zvýšenou rychlostí, telegrafem, nárazem a brake fází.
- Prokletý sněhulák byl přejmenován na Zlomyslného sněhuláka a dostal vlastní renderer.
- Bossové a minibossové dostali vlastní ladovské rendery namísto generických sprite fallbacků.
- Tříhlavý drak dostal samostatné animace a útoky jednotlivých hlav.

## 2026-10-05 — Drop systém
- Zavedena variabilní tematická afinity dropů podle kategorií nepřátel.
- Přidány přímé náhodné dropy.
- Usmíření jídlem může vytvářet bonusové odměny.
- Bossové vytvářejí velkou fontánu kořisti.
- Dropy používají fyzikální rozptyl.
- Mince mají více nominálních hodnot.

## 2026-10-04 — Vizuální a obsahové úpravy
- Kynutý koláč dostal nový renderer a SVG grafiku.
- Léčivá buchta byla nahrazena hruškou.
- Svatovítský balzám byl nahrazen jitrnicí.
- Přidány ladovské dekorace HUDu, karet a modálů.
- Čert dostal nový sprite, animace, rohy, oči, jazyk, ocas a jiskry.
- Čert byl na titulní obrazovce přesunut na pravou stranu nápisu Bubákov.

## 2026-10-03 — HUD a mobilní ovládání
- Přidán horní ukazatel Kuráže a XP.
- HUD byl omezen pro mobilní viewport.
- Odstraněna duplicitní lišta speciální schopnosti na dotykových zařízeních.
- Touch controls respektují `100dvh`, `visualViewport` a safe-area insety.
- Přidána podpora landscape a velmi úzkých displejů.

## 2026-10-02 — Performance
- Přidán prostorový hash pro broad-phase collision queries.
- Přidán living-enemy snapshot.
- Použity squared-distance testy.
- Přidáno viewport culling.
- Přidán in-place cleanup entit.
- SpatialHash byl následně přepracován na znovupoužitelný numerický index s retenčními buffery.
- Přidán frame-time clamp proti simulačním burstům.

## 2026-10-04 — Testovací režim
- Zbraně lze v sandboxu nastavit až na úroveň 0.
- Zbraň úrovně 0 se nepovažuje za aktivní.
- Sandbox vyžaduje alespoň jednu aktivní zbraň.

## Poznámka k historickým hodnotám
Následující hodnoty byly během vývoje změněny a **nesmí být interpretovány jako aktuální**:
- Káva: původně −15 %, aktuálně efektivně −10 %.
- Jelito: původně +20 %, aktuálně +15 %.
- Medvědí mast: původně +25 Max Kuráž, aktuálně +30.
- Chest threshold: původně 700 → 9 800 → aktuálně 29 400.
- Starý mastery systém byl nahrazen milestone progression systémem.
