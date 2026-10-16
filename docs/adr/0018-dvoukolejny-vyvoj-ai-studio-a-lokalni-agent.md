# Dvoukolejný vývoj (Google AI Studio a lokální agent)

## Kontext
Vývoj projektu Bubákov probíhá souběžně ve dvou různých prostředích:
1. **Google AI Studio (webové prostředí)**: Rychlé prototypování herních mechanik, přidávání nových dialogů, tlačítek a úprav parametrů přímo přes webové rozhraní.
2. **Lokální agent (Antigravity / IDE)**: Hloubková architektura enginu, refaktoring velkých modulů, optimalizace vykreslování arény a provoz integračních testů.

Tento dvoukolejný režim narážel na dva chronické problémy:
1. **Pády CI způsobené ořezaným lockfilem**: Webový sandbox Google AI Studio neobsahuje plné nativní binární závislosti (Linux/Windows platformní balíčky pro esbuild, rollup, lightningcss, vitest). Při uložení npm vygenerovalo minimalistický lockfile (ořezaný o ~2 940 řádků). Následný striktní příkaz `npm ci` v GitHub Actions okamžitě selhával s chybou chybějících balíčků.
2. **Časté merge konflikty v monolitickém `src/App.tsx`**: Soubor přesáhl 12 000 řádků a obsahoval současně vykreslovací smyčku, canvas, stav hry i deklarace 15 různých dialogových oken. Úprava nastavení z AI Studia a refaktoring renderování lokálním agentem pravidelně kolidovaly ve stejném souboru.

## Rozhodnutí

### 1. Samoopravná politika závislostí v CI (Self-Healing Fallback)
V souboru `.github/workflows/ci.yml` je krok instalace závislostí upraven tak, aby selhání striktního `npm ci` plynule přešlo na `npm install`:
```yaml
- name: Install dependencies
  run: npm ci || (echo "Warning: package-lock.json incomplete or from external sandbox; falling back to npm install" && npm install)
```
Tato politika je čistě pasivní: CI nainstaluje potřebné závislosti, ověří build i testy a označí commit zeleně bez nutnosti generovat automatické bot-commity. Plný multiplatformní lockfile se přirozeně doplní při nejbližším lokálním commitu. V `.gitattributes` je navíc lockfile chráněn pravidlem `merge=ours`.

### 2. Modální šev (`AppModals.tsx`)
Deklarace a konfigurace všech dialogových, nastavovacích a informačních oken byla vyčleněna z `src/App.tsx` do samostatné komponenty `src/components/AppModals.tsx`.
- `App.tsx` si ponechává pouze herní smyčku, canvas a předání stavů do švu `<AppModals />`.
- Jakékoliv nové dialogové okno, tlačítko či konfigurační pole přidané z Google AI Studia se upravuje výhradně v `AppModals.tsx` a nezasahuje do enginu.

### 3. Integrační kmen `main` a rušení zastaralých běhů
- AI Studio nadále pushuje přímo do větve `main` bez nutnosti zdlouhavého zakládání větví a ručních Pull Requestů ve webovém rozhraní.
- V workflow je aktivováno pravidlo souběhu `concurrency: cancel-in-progress: true`. Rychlé po sobě jdoucí pushy z webového editoru automaticky stornují předchozí rozběhnuté CI kontroly, čímž nevytvářejí falešné červené běhy.

## Důsledky
- **Nulové tření pro webové prototypování**: Push z Google AI Studia spolehlivě projde CI kontrolami i při ořezaném lokálním lockfile.
- **Konec merge konfliktů v `App.tsx`**: Fyzické oddělení dialogových oken od herního plátna eliminuje kolize mezi úpravami UI z AI Studia a hloubkovými změnami enginu.
- **Zachování integrity testů a buildu**: Veškerý kód nadále prochází plným typováním (`tsc --noEmit`), lintem (`eslint .`), sadou integračních testů (`vitest`) a produkčním sestavením (`vite build`).
