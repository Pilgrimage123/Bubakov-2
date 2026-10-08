# Modulární lokalizační architektura, registr jazyků a vrstvený fallback

Rozhodli jsme se připravit hru Bubákov na libovolné budoucí rozšiřování o další jazyky pomocí deklarativního registru jazyků, modularizace slovníků a typovaných přístupových helperů.

## Kontext a rozhodnutí

Původní implementace lokalizace (`src/i18n/index.ts`) obsahovala binární přepínač `cs` / `en`, monolitický soubor slovníků a dosud nepokrývala herní data (úrovně, odemykání lovců, nůše Dědečka, milníky zbraní, trofeje) ani texty vykreslované na HTML5 Canvas.

Rozhodli jsme se pro následující architekturu:
1. **Deklarativní registr jazyků (`SUPPORTED_LOCALES`)**: Seznam podporovaných jazyků (kód, název, vlajka, slovník) je definován na jediném místě. UI přepínač na hlavní liště i v nastavení cykluje a čerpá výhradně z tohoto registru. Přidání nového jazyka v budoucnu znamená pouze přidání modulu slovníku a jedné položky do registru.
2. **Modulární slovníky**: Oddělení slovníků do samostatných souborů (`src/i18n/locales/cs.ts`, `en.ts` atd.) s typovou kontrolou klíčů podle české předlohy.
3. **Vrstvený fallback řetězec**: Při absenci překladového klíče v cílovém jazyce se text dohledává nejprve v angličtině (`en`), následně v kanonické češtině (`cs`) a až poté vrací samotný klíč.
4. **Typované přístupové funkce (Accessors)**: Herní entity a datové definice (úrovně, lovci, předměty Dědečkovy nůše, trofeje) si ponechávají jazykově neutrální identifikátory. Překlady se získávají přes vyhrazené funkce (`getLevelTranslation`, `getHunterTranslation`, `getGrandfatherItemTranslation`, `getTrophyTranslation`) s automatickým fallbackem.
5. **Předávání jazyka do canvas rendereru**: Kontext aktivního jazyka se předává do stavu enginu a vykreslovacích metod, aby varovné pruhy bossů, texty odhalení portrétů a plovoucí hlášky reagovaly okamžitě na změnu jazyka bez restartu běhu.
