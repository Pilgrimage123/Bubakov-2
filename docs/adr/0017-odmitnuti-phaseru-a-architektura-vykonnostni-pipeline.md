# ADR 0017: Odmítnutí migrace na framework Phaser a architektura výkonnostní renderovací pipeline

## Kontext

Během intenzivních fází výprav naráželi hráči na méně výkonných noteboocích a mobilních zařízeních na propady snímkové frekvence pod 30 FPS a mikro-zadrhávání (stuttering). K těmto problémům docházelo zejména ve chvílích, kdy Režisér výpravy zaplnil bojiště desítkami monster, scénou prolétávaly stovky projektilů, probíhala kompozice nočního kvašového osvětlení se stínovými polygony a nad entitami vyskakovaly desítky bojových plovoucích textů.

Jako prvotní řešení byla zvažována kompletní migrace herní scény do herního frameworku **Phaser** s cílem získat hardwarovou WebGL akceleraci.

Analýza a profilace však prokázaly, že Phaser je pro Bubákov nevhodný:
1. **Inkompatibilita procedurální vektorové grafiky s WebGL**: Výtvarná identita hry je postavena na desítkách tisíc řádků čistě procedurálního vektorového kreslení v kvašovém a tušovém stylu Josefa Lady (organické křivky, proměnlivé tušové tahy, šrafování). Ve WebGL režimu neumí frameworky dynamické křivky akcelerovat bez neustálé CPU triangulace geometrie v každém snímku, což by zatížení procesoru paradoxně několikanásobně zvýšilo.
2. **Narušení bezhlavého simulačního enginu**: Zavedení Phaseru by si vyžádalo přepis deterministického bezhlavého enginu (`GameEngine`), na němž stojí stovky unit testů a simulací bez DOM závislosti.
3. **Skutečná úzká hrdla**: Úzkým hrdlem nebyl samotný 2D Canvas, ale neefektivní organizace vykreslovací smyčky uvnitř React vrstvy, opakované procedurální překreslování statických roubenek a stromů, dynamické alokace dočasných polí pro třídění hloubky zatěžující Garbage Collector, kompozice světla v plném rozlišení a vektorové rasterizace čísel poškození přes `ctx.strokeText` / `fillText`.

## Rozhodnutí

### 1. Odmítnutí frameworku Phaser a zachování 2D Canvasu
Rozhodnuto nepoužít framework Phaser ani obecné WebGL spritové enginy pro vykreslování herního světa. Veškerá grafika zůstává na 2D Canvasu pro zachování 100% autentického ladovského stylu a bezhlavý herní engine zůstává zachován.

### 2. Dedikovaný bezestavový renderovací modul (`src/render/arenaRenderer.ts`)
Vyčleněna odpovědnost za transformaci herního stavu z prezentační React komponenty `App.tsx` do dedikovaného renderovacího modulu.
- Modul vystavuje jednotné primární rozhraní:
  ```ts
  renderArena(ctx, engine, camera, options?, outMetrics?): ArenaRenderMetrics
  ```
- Zahrnuje frustum culling na úrovni entit, dekorací i světel.
- Vrací detailní časové a počtové metriky jednotlivých fází (`backdropMs`, `staticDecorMs`, `entitiesMs`, `lightingMs`, `combatTextsMs`, `totalMs`).

### 3. Dlaždicová mezipaměť statické arény (`ChunkBitmapCache`)
Svět úrovně je rozdělen do prostorové mřížky čtvercových dlaždic (velikost 512×512 jednotek).
- Statické dekorace (roubenky, stromy, Boží muka, sněhové závěje, ploty) se vykreslí do offscreen bitmapových dlaždic pouze jednou při startu výpravy.
- V herním snímku se pomocí prostorového testu kamery identifikují pouze viditelné dlaždice a přenesou se na plátno rychlým `ctx.drawImage`.
- Dynamické a interaktivní objekty (např. Káča či louže tání) zůstávají odděleny a kreslí se dynamicky nad statickým podkladem.

### 4. Bezalokační správa hloubky (Zero-Allocation Pipeline)
Zcela odstraněny alokace dočasných polí (`drawables = []`) a volání `Array.prototype.sort` v renderovací smyčce.
- Zaveden trvalý předalokovaný buffer s fixní kapacitou 2048 položek.
- Třídění entit podle osy Y probíhá in-place stabilním insertion sortem přímo v bufferu bez práce pro Garbage Collector.
- Pro metriky snímku zavedena možnost předat znovupoužitelný objekt `outMetrics` eliminující generování objektů na haldě.

### 5. Dvoustupňové osvětlení v polovičním rozlišení (0.5× Downscaled Lighting)
Offscreen buffer pro kompozici Kvašové záře, Petrolejky a stínových polygonů se alokuje v polovičním rozlišení (faktor 0.5×) vůči oknu.
- Snižuje nároky na paměťovou propustnost a fillrate o 75 %.
- Na herní plátno se světelná vrstva promítá s bilineárním vyhlazením v režimu násobení pixelů (`multiply`), což propůjčuje světlu přirozenou měkkost knižní kvašové ilustrace.

### 6. Bitmapový atlas glyfů pro bojové texty (`GlyphAtlas`)
Číslice 0–9, desetinná čárka, znaménka `+`, `-` a symboly jsou při spuštění aplikace jednorázově předrenderovány do texturového atlasu s ladovskou tušovou konturou v klíčových barvách (bílá, zlatá, červená, zelená, azurová, fialová).
- Zobrazování plovoucích čísel poškození a léčení probíhá přenosem výřezů bitmap namísto CPU rasterizace písma (`ctx.fillText`).
- Zůstává zachován automatický fallback na vektorový text pro libovolná neregistrovaná slova.

### 7. Respektování uživatelských výkonnostních profilů
Optimalizace plně spolupracují se systémem výkonnostních profilů hráče (`battery / performance`, `balanced`, `fidelity`):
- Úsporný profil: Omezuje stínové polygony, potlačuje nadbytečné částice a agresivněji aplikuje culling.
- Grafický profil: Zachovává plné rozptylové stíny a detailní normálové reliéfy.

## Důsledky

- **Výkon**: Dosaženo stabilních 60 FPS bez mikro-zadrhávání i při maximálním zaplnění bojiště monstry a projektily.
- **Vizuální integrita**: Vizuální styl Josefa Lady zůstává 100% zachován bez artefaktů či zjednodušení na 3D/spritesheet grafiku.
- **Architektura**: Renderovací logika je oddělena od React komponent do samostatně testovatelného modulu, což zjednodušuje profilaci a budoucí rozšiřování.
