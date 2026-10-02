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

## 3. Zásada produkčního zdrojového stromu a buildů

1. **Canonical source:** `src/` je jediný zdroj pravdy pro herní logiku, data, renderování, UI a styly.
2. **Production build:** standardní Vite build (`npm run build`) vytváří produkční výstup v `dist/`.
3. **Žádný standalone export:** projekt již negeneruje ani nevyžaduje samostatné HTML/TXT herní snapshoty. Historické standalone artefakty z dřívějších revizí nejsou druhým zdrojem pravdy.
4. **Data integrity:** úpravy produkčního buildu nesmí odstraňovat herní data pouze proto, že byla dříve také obsažena v legacy standalone artefaktech.
