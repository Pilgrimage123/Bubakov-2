# Vyladění hodnoty nepřátel, kompozitní index hrozby a otravnosti

## Kontext

V průběhu vývoje Bubákova (152 kanonických nepřátel a 23 ročních výprav) došlo k postupnému rozpojení několika subsystémů:
1. `ENEMY_POINTS` v `src/constants.ts` obsahovalo body nastavené částečně historicky a odhadem.
2. V `src/data/enemies.ts` existovaly anomálie v odměnách (např. *Polní křeček* dával 22 XP a 14 krejcarů při pouhých 34 bodech, zatímco *Noční Bubák* dával jen 12 XP a 8 krejcarů při 211 bodech).
3. Režisér výpravy v `getBubakThreatCost` účtoval za nasazení běžných monster fixní zploštělou cenu 3 body (a 8 za elity) bez ohledu na to, zda šlo o neškodnou rybniční žabku, nebo smrtící stínové monstrum.
4. Hvězdičková nebezpečnost (`danger` 1★ až 5★) v Bestiáři a okně odemykání neodpovídala skutečné obtížnosti a otravnosti strašidla pro hráče.

Bylo nezbytné sjednotit všechny tyto roviny pod jeden transparentní, deterministický a spravedlivý výpočtový model.

## Rozhodnutí

### 1. Kompozitní index hrozby a otravnosti
Byl zaveden objektivní matematický výpočet hrozby složený ze tří pilířů:
- **Základní bojový potenciál**:
  - Efektivní DPS: $\text{damage} / \max(0.3, \text{attackInterval})$ (zohledňuje kadenci útoku: rychlý 0,6 s je 3× nebezpečnější než pomalý 1,8 s).
  - Efektivní Kuráž (EHP): $\text{hp} \cdot (1 + \text{poiseResist} \cdot 0.4 + \text{willpower} \cdot 0.4) \cdot (\text{speed} / 75)^{0.6}$.
  - Základní síla: geometrický průměr $\sqrt{\text{EHP} \cdot \text{DPS} \cdot 2.5}$.
- **Multiplikátory otravnosti a narušování hry**:
  - Krádež kořisti a vyjídání bojiště (*Mrazivá vrána*, *Polní křeček*): **+35 %**
  - Střelba projektilů, prak a kouzla na dálku (*Kulový blesk*, *Písař*, *Stodolník*, *Pytlák*): **+30 %**
  - Sebevražedné výbuchy (*Zkažená kraslice*): **+50 %**
  - Dělení na menší potvory při zničení (*Pampeliškové chmýří*): **+35 %**
  - Zpomalující louže a plošné mrazivé aury (*Tající sněhulák*, *Mrázový skřítek*): **+25 %**
  - Stínová ochrana, úhyby a poloviditelnost (*Noční Bubák*, *Mrazivá jezinka*, `shadows`): **+30 %**
  - Let a ignorování pozemního terénu: **+20 %**
- **Slevy za hráčsky využitelné slabiny a hendikepy**:
  - Hladovost a nulová odolnost na jídlo (`foodResist === 0`, okamžité usmíření buchtou): **-18 %**
  - Nulová stabilita (`poiseResist === 0`, přerušení a odhození každým zásahem): **-15 %**
  - Pomalost pohybu (`speed < 50 px/s`, snadné kitování lovcem): **-15 %**
  - Nekalé síly zranitelné svěcenou vodou a Kapličkou (`isUnholy`): **-10 %**

### 2. Třívrstvé pásmové škálování
- **Běžná strašidla**: Odvozené body na škále **6 až 340 bodů**.
- **Oblastní minibossové a střední bossové**: Pásmo **400 až 3 500 bodů**.
- **Vládci měsíců (23 finálních bossů)**: Zachování zavedených kalendářních bodových kotev (**950 až 16 800 bodů** dle měsíce výpravy), aby byla chráněna ekonomika truhel a aditivní křivka ročního cyklu.

### 3. Přísná monotónnost odměn (Perníčky a Krejcary)
Atributy `xp` (perníčky pro Čertova dědečka) a `coinValue` (krejcary pro vesnici) se deterministicky odvozují z `ENEMY_POINTS`:
- *Běžná havěť (body 6–49)*: `xp = max(1, round(points * 0.08))`, `coinValue = 1`.
- *Střední a těžká strašidla (body 50–179)*: `xp = max(2, round(points * 0.08))`, `coinValue = max(1, round(points * 0.04))`.
- *Minibossové a těžcí běsi (body 180–3 500)*: `xp = max(16, round(points * 0.045))`, `coinValue = max(10, round(points * 0.025))`.
- *Finální bossové (body 4 500–18 000)*: `xp = min(350, max(40, round(points * 0.022)))`, `coinValue = min(250, max(25, round(points * 0.015)))`.

### 4. Dynamická cena v rozpočtu Režiséra výpravy
V `src/data/enemies.ts` byla zavedena předpočítaná mapa `BUBAK_THREAT_COSTS` a v `RunDirector.getBubakThreatCost` nahrazena fixní hodnota 3 za stupňovité pásmo **1 až 12 bodů**:
- Drobná havěť (body 6–24): **1 bod**
- Lehcí pěšáci (body 25–50): **2 body**
- Střední bojovníci (body 51–90): **3 body**
- Nebezpeční a otravní běsi (body 91–150): **5 bodů**
- Těžcí útočníci a střelci (body 151–220): **7 bodů**
- Elitní monstrozity v běžném poli (body 221–350): **9–12 bodů**
- Elitní přívlastky a minibossové: **8 / 18 bodů**.

### 5. Sjednocení hvězdiček nebezpečnosti (danger) v Bestiáři
- `★☆☆☆☆` (1★): body 6 až 35 (drobná havěť a roje)
- `★★☆☆☆` (2★): body 36 až 85 (běžná vesnická strašidla)
- `★★★☆☆` (3★): body 86 až 200 (nebezpeční a otravní běsi, střelci)
- `★★★★☆` (4★): body 201 až 3 500 (elitní hrozby a minibossové)
- `★★★★★` (5★): body 4 500 a více (Vládci měsíců a hlavní bossové)

## Důsledky

- Režisér výpravy nemůže zahltit arénu desítkami silných monstrozit najednou, protože platí jejich skutečnou cenu v rozpočtu hrozeb.
- Lovec je za porážku otravnějších a nebezpečnějších monster odměněn proporčně vyšším počtem perníčků i krejcarů bez výskytu historických anomálií.
- Informace v Bestiáři a okně odemykání jsou plně pravdivé a odrážejí skutečné herní vlastnosti.
- Všechny hodnoty jsou pokryty automatickým integračním testem `tests/enemyValueAndThreatIntegrity.test.ts`.
