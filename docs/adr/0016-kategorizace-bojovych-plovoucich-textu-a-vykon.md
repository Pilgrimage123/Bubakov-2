# Kategorizace bojových plovoucích textů, uživatelské předvolby a optimalizace výkonu

## Kontext
V bojové aréně Bubákova se v průběhu výpravy zobrazuje velké množství plovoucího textu (číselná poškození, léčení, nápřahy strašidel, hlášky lovce, zisky perníčků a krejcarů, oznámení bossů a odemčení).
Tento stav způsoboval dva problémy:
1. **Výkonnostní zátěž**: Při desítkách a stovkách nepřátel na obrazovce generoval engine velké množství instancí `DamageText`. Dosavadní filtrování probíhalo až v renderovací smyčce přes nákladné regulární výrazy (`shouldDrawFloatingText(txt.text)`), a samotné vykreslování písma s tušovou konturou (`ctx.strokeText` + `ctx.fillText`) představovalo zásadní zátěž pro Canvas na méně výkonných a mobilních zařízeních.
2. **Vizuální přehlcení a vyrušování hráče**: Hráč neměl možnost přizpůsobit si, které texty chce vidět. Příběhové hlášky, názvy nápřahů či drobná kořist zakrývaly klíčové taktické informace (úbytek Kuráže, stavové efekty).

## Rozhodnutí

### 1. Rozdělení do 9 sémantických kategorií (`CombatTextCategory`)
Zaveden pevný, typovaný výčet 9 kategorií bojových plovoucích textů:
- `enemyDamage`: Číselná zranění nepřátel (běžná bílá čísla, kritické zásahy `💥`, blesky `⚡`)
- `hunterDamage`: Zranění a úbytek Kuráže lovce (červená čísla při zásahu lovce, odrazy)
- `healing`: Léčení a obnova Kuráže (obnovená Kuráž z jitrnic, placek a schopností)
- `combatStates`: Bojové reakce a stavy (*Dodge, Minul, Štít pohltil, Vyčerpán, Imunní, Usmířen*)
- `attackWindups`: Názvy nápřahů a útoků (telegrafované nápřahy bubáků a názvy úderů zbraní)
- `combatShouts`: Bojové pokřiky a atmosféra (hlášky lovce při Zoufalé kuráži a příběhové pokřiky)
- `lootResources`: Zisky kořisti a surovin (*Perníčky, Krejcary, Dušičky, Cukrový spěch*)
- `unlocksMilestones`: Odemčení a milníky (*Nová zbraň, nový lovec, odemčená krajina, milník zbraně*)
- `bossAnnouncements`: Globální oznámení a bossové (*Příchod bosse, poklad vládce bubáků, zklidnění*)

### 2. Náhrada regulárních výrazů za $O(1)$ filtraci
Každý vytvářený `DamageText` nese explicitní identifikátor kategorie. Běhové vyhodnocování regulárními výrazy je zcela odstraněno ve prospěch okamžitého boolean lookupu v nastavení hráče. U vypnutých kategorií navíc dochází k potlačení alokace již v enginu, čímž se šetří paměť a garbage collection.

### 3. Tři rychlé předvolby (Presety)
Nad 9 jednotlivými přepínači jsou k dispozici 3 rychlé předvolby:
- **Plná atmosféra** (výchozí stav): Všech 9 kategorií zapnuto.
- **Taktický režim**: Zapnuty klíčové bojové a informační kategorie (`enemyDamage`, `hunterDamage`, `healing`, `combatStates`, `unlocksMilestones`, `bossAnnouncements`). Vypnuty zbytné texty (`attackWindups`, `combatShouts`, `lootResources`).
- **Čistý výkon**: Vypnuto všech 9 kategorií pro maximální snímkovou frekvenci (stálých 60 FPS i na slabých zařízeních).
- **Vlastní**: Automatický stav při jakékoliv manuální úpravě zaškrtávátek.

### 4. Uživatelské rozhraní a dostupnost
Nastavení je přístupné ze dvou míst:
1. Přímo z okna pozastavení hry (*Pauza / Esc*) přes tlačítko `💬 Texty v boji`, které otevírá samostatný ladovský dialog `CombatTextSettingsModal` bez přeplnění pauzovací obrazovky.
2. Z hlavní nabídky i vesnice v rámci globálního dialogu *⚙️ Nastavení a vývoj*.

### 5. Trvalé ukládání (Persistence)
Uživatelská volba je trvale uložena v objektu `meta.combatTextSettings` v `localStorage` s bezpečnou výchozí hodnotou při absenci dat.

## Důsledky
- Hráč získává plnou svobodu volby mezi maximální stylizací a čistou taktickou přehledností.
- Zásadní úleva pro vykreslovací smyčku Canvasu a procesor na mobilních zařízeních.
- Kód je čistě typovaný, bezpečný a zbavený křehkých regulárních výrazů testovaných v každém snímku.
