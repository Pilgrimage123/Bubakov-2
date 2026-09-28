# Zásady designu hry Bubákov (Ladovská edice)

> **Základní a neměnné pravidlo:**
> **Na vysokou viditelnost a bezvadný kontrast písma je vždy třeba dbát!**
> Každý text, nadpis, nápověda, číslo a ovládací prvek musí být okamžitě, bez námahy a bezpečně čitelný za všech světelných podmínek, na všech zařízeních a na všech typech ladovského podkladu (WCAG AA/AAA compliance).

---

## 1. Zásada viditelnosti a kontrastu písma (Legibility & Contrast First)

1. **Zákaz splývavých barev:**
   - **Žádné světlé písmo na světlém podkladu:** Žlutá (`var(--mustard)` / `#D9A036`) nebo světle zelená se **nikdy nesmí** používat jako barva textu na světlém pergamenu (`#F3E9D2`, `#FFFDF8`, `#FAF6ED`). Na pergamenu musí být text vždy tmavý: hluboký černý inkoust (`#111111`), tmavá kůže (`#3D2210`, `#2A170A`), sytý tmavý jantar (`#78350F`) nebo tmavá lesní zeleň (`#166534`).
   - **Žádné tmavé písmo na tmavém podkladu:** Na dřevěných panelech (`.panel` s pozadím `#5E3A21` nebo `#3D2210`) se **nikdy nesmí** používat hnědé nebo tmavé písmo. Text na dřevě musí být světlý pergamen (`#F3E9D2`), smetanová (`#FEF3C7`) nebo jasná zářivá žluť (`#FDE047`) s výrazným inkoustovým stínem.

2. **Dynamická herní plátna a proměnlivá obloha (HUD a Canvas):**
   - Vzhledem k tomu, že se ve hře střídají denní fáze (světlé poledne `#F7EDD5` ➔ tmavá půlnoc `#171D28`), musí mít veškerý text zobrazený přes herní plátno (ukazatele času, mincí, dušiček, úrovně a poškození):
     - Buď **vlastní kontrastní podkladový štítek** (pergamenová destička s tmavým inkoustovým orámováním),
     - Nebo **robustní 360° obrysovou linku** (`ctx.strokeText` / CSS `text-shadow` ve všech 4 směrech s černým inkoustem `#111111`).
   - Plovoucí texty poškození (`DamageText`) musí mít vždy tlustý obrys (`ctx.lineWidth = 4`, `strokeStyle = #111111`).

3. **Žádné vybledlé texty v zamčených stavech:**
   - Zamčené karty, úkoly, zbraně a nepřátelé nesmí snižovat průhlednost textu na nečitelné hodnoty (`opacity: 0.5–0.7`).
   - Zamčený stav se indikuje ikonou zámku 🔒, tmavším podkladem karty nebo rámečkem, ale text nápovědy a zadání úkolu musí zůstat 100% sytý a ostře čitelný.

4. **Hierarchie a typografická váha:**
   - Hlavní font hry je `'Eczar', serif`.
   - Všechny důležité štítky a nápovědy používají tučné řezy (`font-weight: 800` nebo `900`).
   - Minimální velikost čitelného textu pro pomocné popisky je 12px (0.75rem), pro běžný text 14–16px (0.88–1.0rem), pro nadpisy 20–36px.

---

## 2. Ladovská estetika v souladu s čistým UI

1. **Silná obrysová linka (Černý inkoust):**
   - Všechny rámečky karet, tlačítek a medailonů používají černou inkoustovou linku (`border: 3px solid #111111` nebo `4px solid #111111`).
   - Tlačítka mají tvrdý, neprůhledný inkoustový stín (`box-shadow: 4px 4px 0px var(--ink)`).

2. **Autentická ladovská paleta:**
   - Pergamen světlý: `#F3E9D2` (podklad, karty)
   - Pergamen tmavý: `#DFD3BA` (informační pruhy)
   - Inkoust: `#111111` (písmo a kontury)
   - Dřevo tmavé: `#3D2210` / `#2A170A` (trámy, lišty)
   - Dřevo světlé: `#5E3A21` (panely oken)
   - Krev a pekelný žár: `#D1342B` (tlačítka, zdraví, bossové)
   - Medová hořčice / zlatá: `#D9A036` (odměny, zvýraznění s inkoustovou konturou)
   - Hluboká lesní zeleň: `#166534` (splněné úkoly, odemčeno)
   - Voda a studánka: `#3A76A8` (dušičky, vodníci)

3. **Responzivita a dotykové ovládání:**
   - Tlačítka a interaktivní plochy mají minimální dotykovou výšku 44px.
   - Plovoucí joystick a akční tlačítko speciální schopnosti nesmí překrývat textové informace v HUDu.

---

## 3. Zásada kompletního offline souboru a upravitelnosti (Downloadable HTML & TXT Standalone & Edit Integrity)

> **ZÁVAZNÉ A NEZRUŠITELNÉ PRAVIDLO:**
> **Soubor ke stažení v textovém formátu (.txt) i formátu (.html) MUSÍ VŽDY obsahovat naprosto kompletní, 100% samostatnou hru připravenou nejen k okamžitému offline hraní, ale i k plnohodnotným úpravám libovolným vývojářem nebo AI modelem (Claude, GPT)!**

1. **Okamžitá hratelnost pouhým přejmenováním (Offline Runtime):**
   - Soubor `bubakov_hra_ladovska_edice.txt` je přímým identickým dvojčetem `bubakov_hra_ladovska_edice.html`.
   - Stačí jej přejmenovat na `.html` (např. `bubakov.html`) a otevřít v jakémkoliv prohlížeči. Běží 100% offline bez nutnosti internetu, instalace či serveru.
2. **Čistý a neminifikovaný kód (Full AI & Developer Editability):**
   - Spustitelný kód v souboru NESMÍ být minifikován na nečitelné jednopísmenné zkratky. Všechny názvy proměnných, herních konstant, funkcí a struktur (`WEAPONS`, `ENEMY_TYPES`, `drawLadaHunter`, `updateGame`) musí zůstat plně čitelné a komentované, aby je Claude nebo programátor mohl otevřít v textovém editoru, ihned pochopit a přímo upravovat.
3. **Plné původní zdrojové kódy přímo v souboru (Embedded Source Tree):**
   - Uvnitř souboru se nachází kompletní původní strom zdrojových souborů (všechny moduly v TypeScriptu, CSS i konfigurace) ve strukturovaném bloku `<script id="bubakov-source-tree" type="application/json">` s exportní utilitou `window.BUBAKOV.exportSources()`.
4. **Detailní vývojářská příručka pro Claude a programátory:**
   - Na začátku souboru je v komentáři obsažen podrobný návod: architektura hry, kde najít a jak přidat zbraň, nepřítele, bosse, upravit ladovský canvas renderer, parametry syntezátoru či kolize.
5. **Automatická kontrola celistvosti při sestavení:**
   - Při každém sestavení (`npm run build` / `scripts/bundle-standalone.mjs`) je povinností zkontrolovat, že velikost generovaných souborů `.txt` i `.html` přesahuje minimální prahovou hodnotu (alespoň 1 MB) a že soubory obsahují jak platný kořenový uzel `#root`, tak kompletní unminified kód, zdrojový strom i úvodní dokumentační záhlaví.
