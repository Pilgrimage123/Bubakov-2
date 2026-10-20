# Odpoutání Dvojčete minibosse a reaktivní dynamická obtížnost

## Kontext
Původní implementace Dvojčete minibosse (ADR 0005 a 0009) byla uměle svázána s podmínkou `dynamicDifficulty >= 4.5`, což omezovalo jeho příchod pouze na nejvyšší dva stupně obtížnosti (*Hrusická šlamastyka* a *Pekelné boží dopuštění*). Tento přístup odporoval základní filozofii hry, podle níž mají být herní mechaniky, formace a druhy nepřátel dostupné na všech stupních a volič má řídit pouze tempo a objem hrozeb.

Zároveň byl Režisér výpravy v odezvě na průběh hry pomalý: index dominance vyhodnocoval průměrný TTK pouze z klouzavého okna 12 eliminací, vyhlazovací faktor tlaku měnil multiplikátor desítky sekund a při prudkém propadu Kuráže hráč často dostával další rány ze setrvačnosti fronty hrozeb.

## Rozhodnutí

### 1. Odpoutání Dvojčete minibosse od voliče obtížnosti
- **Dostupnost**: Dvojče minibosse se nově může objevit na všech běžných i vyšších stupních obtížnosti (2.50× až 5.00×). Na nejklidnějším stupni 2.00× (*Poklid za pecí*) zůstává trestání úspěchu zcela vypnuto v souladu s jeho herním slibem.
- **Zlevnění rozpočtu na 60 %**: Cena za vyvolání Dvojčete byla snížena z 30 na **18 bodů** z rejdového rozpočtu Režiséra výpravy.
- **Taktická reakce na hordový arzenál**: Režisér nasazuje Dvojče přednostně tehdy, když hráč disponuje vysokou proporcí zbraní zasahujících celé hordy nepřátel najednou (aury, celokruhové seky, průrazné projektily – ≥ 50 % arzenálu nebo ≥ 2 hordové zbraně). Dvojče tak slouží jako logický taktický protitah na buildy, které bez námahy taví zástupy běžných bubáků.
- **Koexistence s ostatními bossy**: Dvojče může být povoláno i v průběhu souboje s poledním či odpoledním minibossem, pokud hráč vykazuje drtivou dominanci.
- **Pacing a cooldown**: Zaveden minimální cooldown **60 sekund** od příchodu Dvojčete a striktní strop na nejvýše 1 živé Dvojče současně.
- **Odměna**: Po porážce Dvojčete je garantován drop Malované truhly.

### 2. Zvýšení reaktivity dynamické obtížnosti
- **Okamžitá panická brzda (Panic Brake)**: Při skokové ztrátě Kuráže (> 25 % maximální Kuráže během 1,5 sekundy nebo poklesu pod 30 % celkové Kuráže) Režisér okamžitě srazí `pressureMultiplier` na 0.75×, odpustí 10 bodů z rozpočtu hrozeb a aktivuje zvýšený podíl oslabených *Vyčerpaných bubáků* (50 %). Brzda má vnitřní cooldown 18 sekund pro zachování napětí.
- **Asymetrické vyhlazování tlaku**: Zmírnění tlaku v tísni reaguje během 1–2 sekund, zatímco eskalace tlaku při dominanci nabíhá svižněji (5–8 sekund stabilního úspěchu) namísto původních 30 sekund.
- **Rychlá detekce dominance**: Do výpočtu dominance byla začleněna krátkodobá rychlost eliminace nepřátel (`killVelocity` za poslední 3 sekundy) doplňující tradiční TTK a poměr Kuráže.

## Důsledky
- Hráči zažívají autentický taktický protitlak Režiséra výpravy odpovídající jejich buildu na libovolné běžné obtížnosti.
- Při krizových situacích dostává lovec okamžitý záchranný prostor k nadechnutí, aniž by se hra stala triviální.
- Telemetrie Režiséra vystavuje nové diagnostické proměnné (`killVelocity`, `distressBrakeActive`, `punitiveTwinCooldown`) pro ladění a automatické testy.
