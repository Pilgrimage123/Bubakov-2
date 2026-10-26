# Hejno mrazivých vran (Miniboss) a integrace Smart SVG spritů

Oblastní miniboss v 1. úrovni (Březnové tání) je implementován jako koordinované hejno 9 rychle letících vran s rozšířeným letovým spritem z velké vlny vran namísto jedné zvětšené pozemní entity. Vektorové Smart SVG sprity (9 folklórních hrdinů a postav) jsou přímo integrovány do karet výběru lovců, informačních modálů a scény Čertova dědečka, zatímco bojová aréna zůstává na bezalokačním Canvasu.

## Kontext a důvody
1. **Miniboss Hejno vran vs. osamocená velká vrána**: Původní líhnutí minibosse vytvářelo jedinou zvětšenou vránu s chůzovým spritem z profilu. Hráč očekává autentický dojem hejna dravých letících ptáků z vánice.
2. **Využití existujícího letového spritu**: Hra již disponuje vysoce efektivním vektorovým tvarem letící vrány s orientací ve směru rychlosti (`heading = atan2(vy, vx)`) a fázovaným máváním křídel (`VirtualLeaderCrowWave`). Tento sprite je zvětšen a využit i pro minibosse, čímž odpadá nutnost zavádět cizí nekonzistentní assety.
3. **Vyvážení 9členného hejna**: Rozdělení minibosse na 9 vran vyžaduje proporcionální rozložení statistik (cca 38 Kuráže a 8 poškození na vránu, souhrnně ~342 Kuráže na hejno) a zvýšenou rychlost (260 px/s), aby nedocházelo k okamžitému usmrcení hráče ani k zdlouhavému souboji.
4. **Zapojení Smart SVG do hry bez propadu FPS**: Smart SVG komponenty poskytují špičkovou interaktivní prezentaci reagující na kurzor myši. Jejich nasazením na karty výběru lovců v hlavním menu, do nákupního dialogu dědečka a do modálů bestiáře hra plně využívá jejich vizuální kvalitu, aniž by došlo k narušení bezalokační 60 FPS smyčky bojového canvasu (ADR 0017, ADR 0029).
