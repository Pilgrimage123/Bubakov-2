# Květnová slavnost, parita herního klienta a kanonizace Dubnové noci

## Kontext a rozhodnutí

S přidáním 5. výpravy (*Květen v Hrusicích – Májová slavnost*) došlo k několika závažným architektonickým a obsahovým rozporům:
1. **Kalendářní rozpor kampaně**: Mezi 3. výpravu (*3. Duben v Hrusicích – Dubnový den*) a 5. výpravu (*5. Květen v Hrusicích – Májová slavnost*) byl vklíněn podzimní hřbitov s Hejkalem, což rozbíjelo jarní folklórní cyklus i přímou vazbu čarodějnice Zaspalky na Filipojakubskou noc (30. dubna).
2. **Kritický rozpad parity herního klienta (`App.tsx` vs. `engine.ts`)**: Pokročilá kinematika chroustů, štěpení pampelišek, kouřové nálety Zaspalky i synchronizovaná triáda Ledových mužů byly implementovány výhradně do testovacího simulačního enginu `engine.ts`, zatímco v ostrém herním klientu `App.tsx` zcela chyběly. Navíc v `App.tsx` smrt jakéhokoliv z bratří okamžitě ukončila úroveň falešným vítězstvím.
3. **Absence Midbosse a zpoždění finálního bosse**: V Květnu chyběl Midboss v 185. sekundě, což v `App.tsx` způsobovalo prodlevu finálního bosse až na 310 s kvůli závislosti na `midBossSpawned`.
4. **Nefunkční interakce pamětihodností `[E]`**: Oznámené a v textech slibované interakce kostela, hospody a sloupu sv. Jana Nepomuckého nebyly v herním klientu zapojeny.

Po rozhovoru podle designového stromu (grilling) bylo rozhodnuto:

1. **Kanonizace 4. úrovně jako Dubnové noci**:
   - 4. výprava (`id: 3`) se stává *4. Duben v Hrusicích – Dubnová noc* (Filipojakubská noc z 30. dubna na 1. května s plápolajícími hranicemi a reji čarodějnic).
   - 5. výprava navazuje přímo na Dubnovou noc: čarodějnice Zaspalka přilétá proto, že zaspala právě proběhlou Filipojakubskou noc.
2. **Povinná parita herního klienta (`App.tsx` a `engine.ts`)**:
   - Veškeré mechaniky nových entit (chroust, pampeliškové chmýří, Zaspalka, Ledoví muži) musí být stoprocentně zrcadleny v `App.tsx`.
   - Vítězství nad Ledovými muži vyžaduje pokoření všech tří bratří (Pankrác, Servác, Bonifác).
   - Úvodní vlna v Květnu nasazuje autentická májová strašidla namísto zastaralých zimních diblíků.
3. **Doplnění Midbosse**:
   - V 185. sekundě vystupuje z vyhřátého rybníka *Bahenní hastrman z Brčálníku*, čímž se sjednocuje dramatická křivka s 1.–3. úrovní.
4. **Aktivace májových pamětihodností na klávesu `[E]`**:
   - Kostelní májová zvonice (svatý otřes a požehnání obrany), májový ležák a koláče v hospodě (léčení a kuráž) a sloup sv. Jana Nepomuckého (zahnání běsů).

## Důsledky
- Kampaň získává přirozený kalendářní tok: Březen (den/noc) ➔ Duben (den/noc) ➔ Květen (májová slavnost).
- Zamezeno falešnému vítězství při porážce prvního Ledového muže a plná funkčnost májových strašidel v ostrém prohlížeči.
- Sjednocen rytmus výprav na 85 s (miniboss), 185 s (midboss) a 300 s (climax boss).
