# Likvidace Smart SVG komponent a sjednocení vizuálu postav na Canvas 2D

## Kontext a rozhodnutí

Původní architektura hry udržovala dvoukolejný způsob vykreslování postav: vysoce detailní DOM vektorové komponenty (`Smart SVG sprity` v `src/components/svg/`) pro výběr lovců a kramářskou scénu a procedurální tušové/kvašové štětcové rutiny (`ladaRenderer.ts`) pro bojové plátno. Tato duplicita vedla k nekonzistencím, navyšování velikosti výsledného balíčku (JS bundle) a zbytečné zátěži DOM stromu v modálních oknech.

Po úspěšném převodu karet výběru lovců na canvasové náhledy (`LadaHunterCanvasPreview`) bylo rozhodnuto dokončit likvidaci celého zbývajícího Smart SVG subsystému:
1. **Odstranění `src/components/svg/`**: Kompletní smazání komponent Čertova dědečka (`SmartDedecekNuseSvg`, `SmartDedecekArenaSvg`), interaktivního prohlížeče (`SmartSvgViewer`) a celého registru `SMART_SVG_REGISTRY`.
2. **Převod Čertova dědečka na Canvas 2D**: Kramářská scéna (`GrandfatherScene.tsx`) i informační karta v nápovědě ovládání (`ControlsModal.tsx`) jsou převedeny na novou lehkou komponentu `LadaGrandfatherCanvasPreview`, která přímo volá procedurální rutinu `Lada.drawGrandfather` z `ladaRenderer.ts`.
3. **Odstranění mrtvého kódu**: Vyčištěna záložka `smart_svg` a dormantní přepínače v `AnimationTesterModal.tsx`, odstraněn vyhrazený chunk `smart-svg` ve `vite.config.ts` a smazány dočasné testovací a ladicí skripty.
4. **Zachování ladovských UI ikon**: Kanonické ladovské vektorové ikony v `GameIcon.tsx` a `LadaCustomIcons.tsx` zůstávají plně zachovány jako autoritativní rozhraní pro herní statistiky, zbraně a ovládací prvky (v souladu s GLOSSARY.md).

## Důsledky
- **Jediný zdroj pravdy (SSOT)**: Veškerá vizuální podoba postav, monster i kramáře je soustředěna v optimalizovaných procedurálních rutinách `ladaRenderer.ts`.
- **Výkon a čistota**: Nulová režie komplexních SVG DOM elementů a odstranění desítek kilobajtů redundantního kódu.
- **Aktualizace GLOSSARY.md**: Pojem *Smart SVG sprity* je označen za historický a nahrazen *Procedurální kresbou kramáře / lovce*.
