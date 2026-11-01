# Sjednocená kinematika a vodorovná orientace lovců

Všech sedm kanonických lovců na 2D plátně sdílí jednotný čtyřstavový kontrakt procedurální kresby (klid/chůze, sprint při rychlostním posílení, úlek při zásahu a panický úprk po ztrátě Kuráže) s chodidly ukotvenými na úrovni země, houpáním a náklonem aplikovaným výhradně na horní polovinu těla a jediným vnějším kontaktním stínem kresleným volajícím. Vodorovné natočení postavy a držených svítidel (`facingX: 1 | -1`) je záměrně odděleno od směrového vektoru pohybu (`lastDx`, `lastDy`), protože zbraně míří přes `Math.atan2(lastDy, lastDx)` a při čistě svislém pohybu vyžadují `lastDx = 0`, zatímco kreslicí rutiny potřebují zachovat poslední nenulové znaménko vodorovného pohledu bez nechtěného překlopení doprava.

## Důsledky

- Při čistě svislém pohybu (včetně svislého sprintu) si lovec i držená Hromnička či Petrolejka drží poslední vodorovný směr pohledu, aniž by se rozhodilo kolmé míření projektilů.
- Čas animace lovce (`animTime`) běží spojitě i v klidu, takže při zastavení nedochází ke skokové změně fáze kroku ani k zamrznutí plamínku svíce.
- Žádná kreslicí rutina lovce nevykresluje vlastní vnitřní stín a každá větev kreslení (včetně vířící sukovice Tuláka a jízdy Krajánka na žernovu) musí udržovat striktně vyvážený zásobník `ctx.save()` / `ctx.restore()`.
