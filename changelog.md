# Bubákov — Changelog

> **Source of truth:** aktuální implementace v `src/`. Historické hodnoty, které byly později změněny, nejsou uváděny jako aktuální stav.

## 2026-10-06 — Konsolidace herních změn a sjednocení changelogu

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

## 2026-10-06 — Historické feature změny doplněné při auditu commitů

### Character-specific ultimate scénky
- **Pasáček** dostal příběhovou ultimate scénku se zastavením herního času, zvukem pastýřské píšťalky a následným útokem stáda.
- Ve scénce je vytvořeno **22 ovcí/beranů**; hlavní zásah způsobuje **140 × damageMultiplier** fyzického poškození v dosahu 560 a výrazný knockback.
- Po hlavním zásahu pokračuje po dobu přibližně **3,6 s** pravidelný trample efekt s poškozením **35 × damageMultiplier**.
- **Kořenářka** dostala vlastní příběhovou scénku se zastavením času, zvukem očistného kadidla a bylinným sanctuariem.
- Účinek Kořenářky obnovuje **55 HP**, přidává **30 dočasného štítu**, poskytuje až **1,8 s nezranitelnosti**, způsobuje **120 × damageMultiplier** přírodního poškození v dosahu 480 a aplikuje soak/slow.
- Následné sanctuary trvá **4,8 s**, léčí v pulsech po **6 HP** a způsobuje další **25 × damageMultiplier** přírodního poškození.
- Scénky lze klávesou Space přeskočit/urychlit na jejich účinek nebo dokončit.

### Tulák — Pověstná sukovice
- Ultimate Tuláka byla přepracována na **Pověstnou sukovici**.
- Součástí změny byla úprava cooldown balance a odstranění redundantní spodní lišty speciální schopnosti na dotykových zařízeních.

### Level-up a combat balance
- Výběr level-up odměn byl změněn na strukturu **1 bojová volba + 1 pasivní volba + 1 wildcard volba**.
- Byly současně upraveny hodnoty základních pasiv a vybraných zbraní; výsledný aktuální stav je uveden v hlavní konsolidované sekci výše.

### Balancování nepřátel a pokladů
- V rámci historického balance passu byl práh běžné truhly zvýšen z **9 800 na 29 400 bodů**, čímž se frekvence běžných truhel snížila na třetinu.
- Poškození nepřátel bylo v tomto passu zvýšeno o **60 %**; u minibossů se tato změna promítla do jejich výsledného damage vzorce uvedeného výše.

### Přejmenování zbraně
- **Vrbový prut** byl přejmenován na **Osikový prut** a název byl sjednocen napříč daty, UI, popisy a ikonami.

### Rozšíření postav a levelů
- Do hry byly přidány postavy **Kostelník** a **Babička** včetně jejich zvukových efektů a speciálních schopností.
- Progres levelů byl rozšířen z původních 3 na **6 herních úrovní**.
- Byl rozšířen systém průběžné synchronizace statistik a vítězného přechodu do výsledkové obrazovky.

### Registry hry
- Audit registru bestiáře potvrdil **49 registrovaných enemy položek**, přičemž číslo zahrnuje i variantní/posílené nepřátele.
- Počet zbraní v UI byl sjednocen přímo s registrem `WEAPONS`; aktuálně je registrováno **12 zbraní**.

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
