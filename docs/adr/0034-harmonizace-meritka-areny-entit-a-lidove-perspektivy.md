# Harmonizace měřítka arény, entit, projektilů a lidové perspektivy

## Kontext a rozhodnutí

Při vývoji bojové arény v Březnovém tání vznikla znatelná disproporce mezi různými vrstvami scény:
1. Procedurální štětcové postavy lovce a bojových strašidel byly vyvinuty v plném detailu s výškou **75–80 px** (kolizní rádius 20).
2. Původní panoramatické pozadí bylo dimenzováno pro miniaturní stafáž sedláků o výšce **38 px** a malé roubenky o výšce **52 px**, v důsledku čehož lovec působil jako obr kráčející po trpasličím modelovém městečku.
3. Vrhací pochutiny (povidlová buchta, koláč) byly renderovány v rozměru **60 × 55 px**, ačkoliv jejich kolizní rádius činil pouhých 13 px (průměr 26 px), což způsobovalo klamné zásahy a komické proporce vůči rukám lovce.
4. Pravoúhlé kolizní kvádry budov způsobovaly nepříjemné zasekávání lovce při kroužení kolem rohů.

Po rozhovoru podle designového stromu bylo rozhodnuto provést komplexní harmonizaci:
1. **Kotva měřítka k postavě lovce**: Lidská postava lovce (75–80 px, rádius 20) zůstává autoritativním etalonem pro zachování jemného detailu Ladovských obličejů, fousek, dýmu z fajfky a animací.
2. **Zvětšení a rozvolnění vesnické architektury**: Rozměry roubenek, hospody, školy, kostela a stromů jsou zvětšeny přibližně o 200–250 % (roubenka 240–280 px šířky, hospoda 320 px, kostelní areál 450 px). Středy budov jsou rozvolněny tak, aby návesní uličky měly průchozí šířku minimálně 130–160 px pro plynulý průchod lovce i velkých bossů.
3. **Sjednocení stafáže na pozadí**: Statičtí vesničané na polích a návsi jsou zvětšeni na 70–75 px a tažná zvířata na 85–95 px, čímž pozadí splyne s hratelným světem do jednoho organického celku.
4. **Kanonická 4-stupňová hierarchie entit**:
   - *Drobná havěť a roje*: 0.45×–0.6× lovce (35–45 px, rádius 12–15).
   - *Lidé a řadoví běsi*: 0.9×–1.1× lovce (70–85 px, rádius 18–22).
   - *Těžká strašidla a drábi*: 1.3×–1.5× lovce (100–120 px, rádius 26–34).
   - *Obludní bossové a legendy*: 2.0×–2.5× lovce (150–200 px, rádius 42–60).
5. **Harmonizované projektily**: Vizuální velikost vrhacích pochutin je zmenšena na 24–32 px tak, aby přesně lícovala s jejich fyzikálním dosahem a proporcemi lovcových dlaní.
6. **Základový půdorys a hladký skluz rohů**: Kolizní překážky budov jsou omezeny na základové zdi se zaoblenými rohy (poloměr 16–20 px), což eliminuje zasekávání a umožňuje postavám plynule procházet za převislými šindelovými střechami (depth-sorting).
7. **Nativní kamera a adaptivní zorné pole**: Základní zobrazení 1:1 zůstává zachováno pro displeje s výškou od 900 px; jemné adaptivní odzoomování (0.75×–0.85×) se aplikuje výhradně na kompaktních obrazovkách pod 768 px.

## Důsledky
- **Věrnost Ladovské poetice**: Vesnice získává autentický malebný ráz české pohádky bez pocitu lilliputánských modelů.
- **Přesná a spravedlivá hratelnost**: Údery projektilů odpovídají tomu, co hráč vidí, a kroužení kolem stavení je díky zaobleným půdorysům plynulé a bezpečné.
- **Aktualizace GLOSSARY.md**: Doplněny pojmy *Kotva měřítka*, *Hierarchie velikostí entit*, *Harmonizovaný projektil* a *Základový půdorys stavby*.
