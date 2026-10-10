# Konsolidace Režiséra výpravy a optimalizace běhové smyčky

## Kontext
Při souběžném běhu původního vlnového generátoru v `App.tsx` a nového Režiséra výpravy (`RunDirector`) docházelo k dvojitému líhnutí strašidel a zahlcení scény až 135 entitami. Současně časté zápisy do stavu Reactu (`setRunStats`) při každém sebrání kořisti a zabití strašidla způsobovaly zasekávání vykreslovací smyčky (micro-stuttering), zatímco hromadění neomezeného počtu perníčků a neefektivní stavové operace v Canvasu (přepínání `source-atop`, opakované alokace gradientů mlhy a písma) snižovaly snímkovou frekvenci.

## Rozhodnutí
Veškeré líhnutí strašidel sjednocujeme výhradně pod Režiséra výpravy s pevným stropem 65–75 aktivních entit (40–50 v úsporném režimu) a přenosem denních fází úrovně do jeho fondu. Stav Reactu (`runStats`) je striktně oddělen od 60fps smyčky a synchronizován v dávkách po 150 ms (`HUD_SYNC_INTERVAL_SECONDS`). Aktivujeme Slévání perníčků mimo obrazovku se stropem 200–250 kusů, sdružujeme plovoucí čísla poškození do kumulativních textů se stropem 35–45, optimalizujeme grafické operace plátna (předrenderovaná mlha, bezpečné tónování palet) a navádění hmyzích střel směrujeme po přirozené křivce k nejbližšímu cíli přes `SpatialHash`.

## Důsledky
Bojiště získává stabilních 60 FPS i při intenzivních bojích a plošných zásazích zbraní. Odstraní se duplicitní entity i re-rendery komponenty `App`, přičemž Ladovská výtvarná podoba hry, autentický taktický rytmus a přesnost ekonomiky perníčků zůstávají plně zachovány.
