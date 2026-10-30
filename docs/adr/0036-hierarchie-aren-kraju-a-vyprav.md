# Hierarchie arén, krajů a výprav a kanonizace 3. úrovně

## Kontext a rozhodnutí

S rozdělením Předjaří na denní a noční výpravu (ADR 0035) a přidáním jarního dubnového zasazení vznikla v kódu a dokumentaci nejednoznačnost mezi číslováním výprav (1 až 8), indexy úrovní (0 až 7) a identifikátory arén. Aréna *Březnové tání* navíc v simulačním enginu obsluhovala pouze 1. výpravu, a 3. výprava měla v UI i odemykací logice nekonzistentní pozůstatky starého podzimního Brčálníku.

Po rozhovoru podle designového stromu bylo rozhodnuto:

1. **Trojčlenka doménového modelu (Kraj vs. Aréna vs. Výprava)**:
   - **Kraj**: Tematická zeměpisná a folklórní oblast (např. *Předjaří v Hrusicích*, *Duben v Hrusicích*).
   - **Aréna**: Fyzické bojiště, kolizní polygon, zákryty střech a pamětihodnosti se sémantickým řetězcovým ID (`breznove_tani`, `dubnova_naves`). Jedna aréna může být sdílena více výpravami.
   - **Výprava / Úroveň**: Lineární posloupnost 8 hratelných výprav (interní ID `0..7`, v UI zobrazeno výhradně jako `1. až 8. Úroveň`).

2. **Sdílená aréna Předjaří pro 1. i 2. výpravu**:
   - Aréna `breznove_tani` je v `marchThawArena.ts` a `engine.ts` aktivní pro `activeLevelId === 0 || activeLevelId === 1`. Obě výpravy sdílejí hranice bojiště, překážky chalup, unášení krami na Sázavě i Kapličku se zjevením, přičemž Noční mrazy mají tmavé svícení, sněžení a noční havěť.

3. **Kanonizace 3. výpravy (Dubnový den)**:
   - 3. výprava (`id: 2`) je *3. Duben v Hrusicích – Dubnový den* na aréně `dubnova_naves` s vrcholným bossem *Vrchní Filipojakubská Čarodějnice*.
   - Odemykání 4. úrovně (*Starý hřbitov a Hrusický hvozd*, `id: 3`) vyžaduje poražení Čarodějnice a potvor z Dubnového dne. Staré zmínky o rybníku Brčálníku a Pekelném Čertovi v 3. úrovni jsou definitivně nahrazeny.

## Důsledky
- Čísla výprav (1–8) již nejsou zaměňována s arénami; arény se identifikují sémanticky (`breznove_tani`, `dubnova_naves`).
- Noční mrazy v Předjaří mají plnohodnotné kolize a interaktivní terén totožný s denním během.
- Kampaň má čistou návaznost odemykání od 1. do 8. úrovně bez osiřelých podmínek.
