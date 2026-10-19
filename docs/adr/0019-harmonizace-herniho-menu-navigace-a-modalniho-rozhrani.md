# Harmonizace herního menu, navigace a modálního rozhraní

## Kontext
S postupným rozšiřováním hry o nové subsystémy (Čertův dědeček, Režisér výpravy, 8-úrovňový model zbraní, obecní budovy v hospodě, bojové plovoucí texty) došlo k roztříštění uživatelského rozhraní a navigačních toků:
1. **Nekonzistentní a rizikové rozhraní v hospodě**: Patička hospody obsahovala 8 nesourodých tlačítek – míchala běžné herní akce s vývojářskými nástroji (`Tester animací`), nastavením zobrazení (`Výkon`, `Světlo`), nebezpečným mazáním postupu (`Vymazat postup` volně přístupný vedle návratového tlačítka) a nefunkčním tlačítkem `Zapnuté efekty`, které se odkazovalo na neexistující záložku v `ControlsModal`.
2. **Absence ovládání audia v hlavní nabídce**: Hráč v hlavní nabídce neměl možnost rychle zapnout nebo vypnout zvuky a hudbu bez nutnosti vstupu do hry.
3. **Přehlcené a redundantní ovládací prvky**: Tlačítko `Texty v boji` bylo duplikováno jak na primární liště v hlavní nabídce i výběru lovce, tak na dvou místech v obrazovce pauzy (`paused`).
4. **Jednosměrné pasti v herní smyčce**: Po skončení výpravy (vítězství nebo útěk) obrazovka vyhodnocení (`tally`) nabízela pouze vstup do hospody, odkud se hráč musel dalším klikem vracet do nabídky, pokud chtěl zvolit jinou výpravu.
5. **Nekonzistence v modálním švu a duplicitní CSS**: Některé modály postrádaly zavírací tlačítko `✕`, nereagovaly na klávesu `Escape` a v souboru `src/index.css` se nacházel více než 1 800 řádků dlouhý duplicitní kaskádový blok přebíjející responzivní pravidla.

## Rozhodnutí

### 1. Sjednocení navigačních lišt (Hlavní nabídka, Výběr lovce a Hospoda)
Všechny tři hlavní předsíňové obrazovky nyní sdílejí jednotnou hierarchii tlačítek:
- **Hlavní akce / Návrat**: `🗺️ Zpět do nabídky` nebo `Pokračovat k výběru lovce ➔`.
- **Herní huby**: `🏘️ Vesnice & Hospoda`, `🗡️ Zbrojnice`, `📖 Bestiář nočního venkova`, `🎮 Ovládání hry`.
- **Nastavení a vývoj**: Jediné tlačítko `⚙️ Nastavení a vývoj`, pod nímž jsou bezpečně a přehledně umístěna veškerá systémová nastavení (grafika, výkon, osvětlení, bojové plovoucí texty), vývojářské nástroje (Sandbox, Tester animací, Plán) i destruktivní správa uloženého postupu.
- Všechny specifické dílčí přepínače a dev nástroje byly z patičky hospody i primárních lišt odstraněny.

### 2. Globální audio přepínače v záhlaví a nastavení
- Do záhlaví hlavní nabídky (`stage select`) i výběru lovce (`hunter select`) byly přidány rychlé přepínače `🔊 Zvuk` a `🎵 Hudba`.
- V modálu `SettingsDevModal` byla vytvořena dedikovaná sekce **Zvuk a hudba** s plnou reaktivní synchronizací do stavu metagry i audio manažeru.
- V obrazovce pozastavení hry (`paused`) je nově k dispozici přepínač vesnické hudby vedle zvukových efektů.

### 3. Zpřehlednění obrazovky pozastavení (Odpočinek u milníku)
- Z horní primární lišty pauzy bylo odstraněno samostatné tlačítko `Texty v boji`, které je nyní plně zastřešeno tlačítkem `⚙️ Nastavení výpravy`.
- V liště rychlých přepínačů zůstal kompaktní indikátor předvolby bojových textů (`💬 Texty: Plné / Taktické / Vypnuto / Vlastní`) s možností okamžitého prokliku do konfigurace kategorií.

### 4. Plynulý návrat z vyhodnocení výpravy
- Do obrazovky vyhodnocení (`tally`) bylo přidáno tlačítko `🗺️ Zpět do nabídky výprav`, jež bezpečně uloží získané krejcary a dušičky a vrátí hráče přímo k volbě kraje a lovce bez nucené okliky přes hospodu.

### 5. Standardizace modálního švu a deduplikace stylů
- Ve všech modálech (`ControlsModal`, `SettingsDevModal`, `CombatTextSettingsModal`, `ArsenalModal`, `BestiaryModal`) je zaveden jednotný vzor: horní zavírací tlačítko `✕`, kliknutí mimo panel na podkladové plátno a obsluha klávesy `Escape`.
- Z `src/index.css` byl odstraněn nechtěný 1 874 řádků dlouhý duplicitní blok, čímž byla obnovena správná kaskádová priorita responzivních pravidel pro mobilní i desktopová zobrazení.

## Důsledky
- **Konzistentní mentální model**: Hráč nachází tytéž navigační volby na stejných místech ve všech fázích hry.
- **Bezpečnost**: Destruktivní operace resetu postupu je přístupná výhradně s potvrzením v systémovém nastavení, nikoli vedle běžných navigačních tlačítek.
- **Okamžitá kontrola nad ozvučením**: Hlasitost a hudbu lze vypnout ihned po spuštění hry z libovolné nabídky.
- **Čistší a menší kód**: Odstranění nefunkčního kódu (`openEffectSettings`, nepoužitý stav `controlsDefaultTab`) a redukce CSS o ~39 % zmenšuje riziko dalších regresí.
