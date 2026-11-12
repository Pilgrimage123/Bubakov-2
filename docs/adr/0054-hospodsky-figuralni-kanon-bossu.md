# Hospodský figurální kánon a trojjediná povaha bossů

## Kontext

V ústřední scéně hospody U Černého kocoura (`LadaCoverScene.tsx`) vznikl vysoce expresivní, živý výtvarný styl pro tři erbovní postavy: šibalského Hastrmana bafajícího z fajfky se zlatým víčkem, rozjařeného Hospodského Bubáka v záplatovaných kraťasech na kšandách a krásnou Rusalku s leknínovou korunou a orobincem. Naproti tomu řada bossů a minibossů v bojové aréně (`src/render/ladaRenderer.ts`) využívala starší zjednodušené geometrické tvary (kruhové hlavy bez vrstvené mimiky, ploché obrysy bez záplat a lemování) a u části zimních/masopustních bossů se vyskytoval nesoulad v signatuře vykreslovacích metod (`scale` na 4. parametru místo směru `vx`), způsobující vertikální převrácení při pohybu doleva.

## Rozhodnutí

1. **Hospodský figurální kánon pro všechny bosse**:
   Veškeré unikátní bytosti vystupující na pozicích Minibosse (85 s), Mezi-bosse (185 s) a Vele-bosse (300 s) napříč 24 výpravami (plus samostatní bossové `barbucha`, `cert`, `mlynar`, `masopustni_laufr`) přebírají čtyřpilířový standard z hospodské scény:
   - *Vícevrstvá živá mimika*: Bělmo, barevná duhovka, zornička s bílým odleskem, mrkající/mhouřící víčka, dynamické huňaté obočí, lesklý baňatý či skobovitý ladovský nos s pihami, tváře s ruměncem a bílými odlesky a artikulovaná ústa (křivé žlutavé zuby, vyplazený jazyk, strniště či vousy).
   - *Bohatý lidový oděv*: Vrstvené vestičky, šosy s červeným lemováním, křížkově přišité záplaty, kšandy s přezkami, puntíkované šátky, pruhované punčochy a botanické ozdoby (blatouchy, lekníny, orobinec, pentle).
   - *Artikulované končetiny a bojový postoj v aréně (bez židlí a popíjení piva)*: Strašidla a bossové v bojové aréně přirozeně **nesedí na židli či štokrleti a nepijí pivo z korbelů**, pokud to u dané postavy není výslovně vyžádáno její specifickou mechanikou. Hospodský kánon přenáší do arény *výtvarnou úroveň a detaily* (okulární mimiku, vrstvený oděv, záplaty, lemování, pihy, čtyřprsté ruce, kapky vody), nikoliv sedící či připíjející pózy od hospodského stolu. V aréně stojí bossové na vlastních nohou v přirozeném pohybovém a bojovém postoji a rukama ovládají své zbraně či drápy.
   - *Čistý kvaš a tuš s nulovou alokací*: Vykreslování využívá výhradně ploché kvašové polygony a hierarchickou tušovou linku (`#1C1610`) bez `CanvasGradient` či `shadowBlur`, plně kompatibilní s `BakedBubakAtlas` i živým 60FPS vykreslováním bossů.

2. **Trojjediná povaha hospodských bossů a reaktivní fáze**:
   Každý boss má jasně čitelnou folklórní náturu ze tří archetypů:
   - *Rozšafní a bodří* (šibalské pomrkávání, úsměv od ucha k uchu, fajfky, vrbové proutky, lucerny – Hastrman, Rusalka, Koledující Bubák, Drak, Pan Zajíc; pouze postavy s výslovnou pivní mechanikou jako Bakchus třímají soudek),
   - *Komicky vzteklí a furiantští* (srostlé obočí do V, nadmuté rudé tváře, vyceněné tesáky, odfrkávání páry – Skalní Obr, Hejkal, Čertovský Mlynář, Bezhlavý Rytíř, Morana),
   - *Zlomyslní a potměšilí* (přimhouřené šilhavé oči, křivý škleb s vyplazeným jazykem, skobovitý či mrkvový nos – Mariášový Čert s trojzubcem, Barbucha s vystřelujícími drápy na rukou, Stará Ježibaba z Melechu, Povidlový Čert, Umrlec Basista).
   Všechny obličeje i rekvizity dynamicky reagují na stavy `windup` (Nápřah), `strike` (Úder) a `enraged` (< 50 % Kuráže).

3. **Modularizace do `src/render/bosses/` a sjednocení signatur**:
   Sdílené kreslicí primitivum Hospodského figurálního kánonu a sezónní moduly bossů jsou vyčleněny do `src/render/bosses/` (`hospodaBossHelpers.ts`, `showcaseBosses.ts`, `hospodaBossesPart2.ts`) a napojeny na `Lada` v `src/render/ladaRenderer.ts` se sjednocenou signaturou `(ctx, x, y, time, vx, panicked, attackInfo, enemy)`. Ve 24. úrovni (`levels.ts`) je `nocni_kobold` nahrazen kanonickým `masopustni_laufr`.

## Důsledky

- Sjednocení vizuální kvality všech bossů v aréně i bestiáři s ústřední hospodskou scénou.
- Odstranění chyby převracení spritů při záporném `vx` u zimních a masopustních bossů.
- Zlepšení udržovatelnosti díky rozdělení kreslicích rutin bossů do přehledných sezónních modulů v `src/render/bosses/`.
