# Bubákov: Velký průvodce tvorbou výprav a malováním kraje
> **Dokument**: `docs/STAGE_CREATION_GUIDE.md`  
> **Verze**: 2.4 (Únor 2026 – Aktualizováno pro 24 výprav a kompletní 12měsíční kalendářní cyklus)  
> **Autoři**: Hrusický ponocný, rada starších a architekti Bubákova  
> **Kánon**: `GLOSSARY.md`, ADRs `0001`–`0044`, Stages 1–24 (Březen až Únor)

---

```
             /\
            /  \        HRUSICKÁ KRONIKA TVŮRCŮ VÝPRAV
           / /\ \       ==============================
          / /  \ \      „Kdo maže, ten jede. Kdo v Hrusicích nemíchá povidla,
         / / /\ \ \      toho Meluzína sfoukne do rybníka. Kdo zapomene na ořez
        / / /  \ \ \     plátna, toho pohltí prázdno. A kdo alokuje paměť
       /_/ /____\ \_\    v herním cyklu, tomu čert vezme celou výslužku!“
         |  ____  |
         | |    | |     Architektonický kodex pro tvorbu nových měsíců,
         | | [] | |     folklórních arén, nočních přízraků a ladovských kvašů.
         |_|____|_|
```

Tento dokument představuje **vyčerpávající technickou a folklórní bibli** pro tvorbu nových hratelných výprav (**Výpravy**), sezónních krajů (**Kraje**) a bitevních polí (**Arény**) v **Bubákově**. Shrnuje zkušenosti nabyté při stavbě všech 24 úrovní (od březnového tání přes posvícení až po masopustní rej a pochovávání basy) a slouží jako neprůstřelný návod pro správu, rozšiřování a zachování celého 12měsíčního kalendářního cyklu Hrusic.

---

## 1. Pět pilířů ladovského kodexu výprav

Dříve než sáhneš do kódu, vryj si do paměti pět pilířů hrusického vkusu, herního balancu a softwarové cti. Každá nová výprava musí bez výjimky vyhovovat všem pěti pilířům:

### Pilíř I: Dramaturgie, tempo a kotevní křivka výpravy
1. **Zlatý trojzubec příchodu bossů (`85 s` • `185 s` • `300 s`)**  
   Nevymýšlej svévolné časy příchodu! MiniBoss dorazí přesně v **85. sekundě** otestovat začátečnickou kuráž, Mezi-boss vtrhne v **185. sekundě** zkazit svačinu a Vele-boss sestoupí v **300. sekundě** při slavnostním kuropění k finálnímu zúčtování.
2. **Kotevní boss výpravy (Etalon 1 800 Kuráže — ADR 0038)**  
   Základní křivka výdrže bossů vychází z Hejna mrazivých vran (1. úroveň = 9 vran × 200 Kuráže = 1 800 základní Kuráže). Životy všech dalších bossů v kampani rostou aditivně podle Křivky obtížnosti výprav (`+20 % základ + 5 % za každou úroveň`).
3. **Žádný útok bez telegrafovaného nápřahu (0.6–1.2 s — ADR 0024)**  
   Každý útok bosse či těžkého běsa (švih kosou, plivnutí ohně, nálet, vrh balvanu) musí mít zřetelnou přípravnou fázi (**Nápřah**) – rozkročení, zrudnutí tušové kontury nebo varovný kruh na zemi. I babička s nůší a motykou musí mít čas zareagovat!

### Pilíř II: Taktika a Pravidlo trojjedinosti vln
1. **Pravidlo trojjedinosti nepřátelských vln (Ochrana proti dominanci jedné zbraně)**  
   Aby hráč neprošel hrou pouhým stáním na místě s jednou zbraní, každý bazén vln (`spawnPools`) v každé fázi dne (`noon`, `dusk`, `night`...) **musí** kombinovat tři taktické archetypy:
   - **Roj / drobná havěť** (`radius: 11–15 px` — myšáci, chrousti, vosy): Zranitelná plošnými aurami (*Bylinková fajfka*, *Devatero kvítí*), vytváří prostorový tlak na pohyb lovce.
   - **Přímý běžec / těžký běs** (`radius: 25–34 px` — drábi, sekáči, čerti): Odolný proti odhození, nutí hráče k boji na blízko sečnými zbraněmi (*Kovaná halapartna*, *Dřevěný cep*).
   - **Taktický narušitel / letec / odrážeč** (sršni s nálety, střelci, monstra s *Bleskovým odrazem*): Trestá pasivní kroužení a nutí k přesným zásahům projektily (*Perníčky*, *Povidlové buchty*, *Kyselá okurka*).
2. **Šetření slotů pro Virtuální vůdce (ADR 0027)**  
   Při plánování formací (hejna vran, roje sršňů, smečky netopýrů) Režisér výpravy koordinuje letky přes jediného *Virtuálního vůdce* (Virtual Leader), který zabírá pouhé 3 jednotky kapacity bojiště a zamezuje zasekávání výpočetního snímku.
3. **Kvalitativní vyrovnání namísto monster spamu**  
   Při naplnění Efektivní kapacity bojiště Režisér výpravy nezvyšuje obtížnost bezhlavým množením těl, ale investuje rejdový rozpočet do *Ostřílených běsů* a *Přívlastků bubáků*.

### Pilíř III: Ladovská estetika, optický kontrast a akustika
1. **Tlustá černá tuš je zákon (`#23170F`)**  
   Každá roubenka, kačena na rybníce, strašák v poli i pekelný rarach musí mít nekompromisní tušovou konturu (`lineWidth: 3–6 px`). Žádné rozmazané mlhavé stíny západních fantasy RPG! V Hrusicích platí čistá linie Josefa Lady.
2. **Povinný kolizní stín letce**  
   Každé létající monstrum (`isFlying: true` — vrány, netopýři, sršni, meluzíny) **musí** na zem vrhat oválný poloprůhledný stín posunutý o `+20–30 px` svisle pod středem těla. Tento stín určuje reálný bod kolize se střelami a zabraňuje optickému klamu v lidové perspektivě.
3. **Lunární kontrast v hluboké noci**  
   V nočních výpravách (`groundColor: #1E293B`) nesmí tmavá monstra (černí psi, netopýři, můry) splynout s trávou. Tmavé siluety musí mít světlý vnitřní lem (měsíční svit) nebo jemnou kvašovou auru.
4. **Zákaz ledových ker v létě a na podzim!**  
   Pokud kalendář ukazuje Červen, Červenec, Srpen či Září, je přísně zakázáno kreslit na potok březnové ledové kry (`ice_floe`). Slunící se žába, lekníny, čeřící se voda nebo plující kachny ano; permafrost v župním posvícení je nepřípustný.
5. **Akustická trojice každé výpravy**  
   Každý měsíc musí mít definovanou zvukovou tvář skládající se ze tří prvků:
   - *Sezónní ruch pozadí (Ambient loop)*: tání sněhu na jaře, cvrčci v létě, vítr v komínech na podzim.
   - *Varovná polnice ponocného*: jasné zatroubení na roh při ohlášení bossů (85 s, 185 s, 300 s).
   - *Rituální zvuk vesnické práce*: specifický zvuk pro signaturní [E] mechaniku (zasyčení vařících povidel, praskot v peci, úder zvonu).

### Pilíř IV: Systémová integrita, nulová alokace a paměťový rozpočet
1. **Zákon dvojí parity (Headless Engine & Browser App — ADR 0037)**  
   Co se stane v `src/game/engine.ts`, musí se na vlas stejně odehrát v `src/App.tsx`. Pokud jablko spadne ze stromu v simulaci a v prohlížeči neudělá křup, Vitest zapláče a CI pipeline shoří popelem.
   Každá aréna vyžaduje přesně **4 body parity v `src/App.tsx`**:
   - (1) **Smyčka hráče** (`App.tsx`): detekce interakčního promptu `[E]`, chování vody/ledu (`getWaterEffect`), sezónní částice, `resolveObstacles(player, false)` a `clampToMarchArenaBounds(player, 28)`.
   - (2) **Smyčka nepřátel** (`App.tsx`): vliv vody/ledu na monstra, `resolveObstacles(e, isFlyingEnemy)` a `clampToMarchArenaBounds(e, 28)`.
   - (3) **Smyčka předmětů a dropů** (`App.tsx`): zařazení `engine.activeLevelId === X` do podmínky pro `clampToMarchArenaBounds(d, 28)` při pohybu i magnetickém sběru.
   - (4) **Kolize Dědečka** (`App.tsx`): `resolveObstacles(engine.grandfather, false)` a `clampToMarchArenaBounds(engine.grandfather, 28)`.
2. **Kruhový zásobník terénu (Zero-Allocation Ring Buffer)**  
   Veškerý dynamický *Zrádný terén* (kaluže povidel, louže tajícího sněhu, mlžná ložiska, rozsypané uhlíky) musí používat předalokované pole s pevným stropem (32–64 slotů). Je **přísně zakázáno** volat v herní smyčce `.push()`, `.splice()` nebo `.filter()`.
3. **Škrcení plovoucích textů u plošných pastí (FCT Throttling — ADR 0016)**  
   Když 30 nepřátel najednou vběhne do vroucích povidel, systém nesmí vychrlit 30 plovoucích čísel v jednom snímku. Plovoucí texty se škrtí na max. 1 text za `0.25 s` na entitu, a při hromadném zásahu (>5 entit) se zobrazí jediný souhrnný text nad středem zóny.
4. **Snímkový rozpočet p95 pod 16.7 ms (ADR 0029)**  
   Veškerá nová monstra a procedurální kresby musí projít automatickým benchmarkem (`enemyFpsBenchmark.test.ts`) pod zátěží 40 entit a udržet p95 čas pod 16.7 ms.

### Pilíř V: Vesnický folklór a jednotná smlouva bodů zájmu
1. **Právě jedno aktivní ohnisko výpravy (Signaturní vesnická mechanika)**  
   Z 9 kanonických bodů zájmu má každá výprava právě jedno hlavní interaktivní centrum s klávesou `[E]` (např. *Kotel na povidla* na návsi, *Chlebová pec*, *Svatováclavský oheň* u kostela) s pevnou dobou nabíjení (15–20 s). Ostatní POI slouží jako taktické pasivní zóny (krytí, regenerace, zrychlení).
2. **Jednotná smlouva nápovědy na HUDu**  
   Nápověda k interakci má vždy striktní formát: `[E] <Sloveso v infinitivu> <Předmět> (<Název dominanty>)` (např. `[E] Zamíchat povidla (Kotel na povidla)`). Stisk klávesy musí vždy vyvolat trojí odezvu: (a) zvukový signál, (b) vizuální rázovou vlnu na plátně, (c) odpočet nabíjení na HUDu.
3. **Kód v ASCII snake_case, poezie v `cs.ts`**  
   V datových strukturách píšeme `svestkovy_srsen` a `kotel_na_povidla`. Krásné české háčky a čárky patří do lokalizačních souborů `cs.ts`, příběhových svitků a do srdcí hráčů!

---

## 2. Doménový model a přehled kampaně (Výpravy 1–24)

Kampaň Bubákova se řídí přísným třístupňovým modelem (**ADR 0036** a **ADR 0037**):

```
       KRAJ (Kalendářní měsíc v Hrusicích)
       │
       ├── ARÉNA (Fyzická geometrie, cesty, potok, 9 bodů zájmu POI)
       │   └── Identifikátor: ASCII snake_case (např. 'zarijove_posviceni')
       │
       ├── DENNÍ VÝPRAVA (Sudé GameLevelId: 0, 2, 4, 6, 8, 10, 12...)
       │   └── Slunce, práce na poli, hmyz, hospodáři, žádní nemrtví
       │
       └── NOČNÍ VÝPRAVA (Liché GameLevelId: 1, 3, 5, 7, 9, 11, 13...)
           └── isNightLevel: true, měsíc, kvašové svícení, běsi, čarodějnice
```

### 2.1 Velká tabulka výprav (Kánon 1. až 24. úrovně – Celoroční cyklus 12 měsíců)

| UI Úroveň | `GameLevelId` | Režim | Název výpravy (`name`) | Aréna ID | Signaturní mechanika [E] | MiniBoss (`85 s`) | MeziBoss (`185 s`) | VeleBoss (`300 s`) |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Úroveň** | `0` | Den | Předjaří v Hrusicích – Denní tání | `breznove_tani` | `[E] Rozbít hrneček (Kaplička)` | `blatouch` | `vodnicek` | `vrana` (Hejno vran) |
| **2. Úroveň** | `1` | Noc | Předjaří v Hrusicích – Noční mrazy | `breznove_tani` | `[E] Zapálit louč (Náves)` | `tajici_snehulak` | `mrazivy_obr` | `morana` |
| **3. Úroveň** | `2` | Den | Duben v Hrusicích – Dubnový den | `dubnova_naves` | `[E] Pověsit pentli (Májka)` | `beranek` | `carodejnice_stara` | `vrchni_carodejnice` |
| **4. Úroveň** | `3` | Noc | Duben v Hrusicích – Dubnová noc | `dubnova_naves` | `[E] Rozfoukat popel (Oheň)` | `klekanice` | `drab` | `vrchni_carodejnice` (Sabat) |
| **5. Úroveň** | `4` | Den | Květen v Hrusicích – Májová slavnost | `kvetnova_naves` | `[E] Narazit májový soudek (Hospoda)` | `carodejnice_zaspalka` | `hastrman` | `ledovi_muzi` (Trio bratří) |
| **6. Úroveň** | `5` | Noc | Květen v Hrusicích – Májová noc | `kvetnova_naves` | `[E] Pomodlit se (Boží muka)` | `zbojnik` | `mlynar` | `hejkal` |
| **7. Úroveň** | `6` | Den | Červen v Hrusicích – Senoseč a žár | `cervnova_senosec` | `[E] Napít se podmáslí (Hospoda)` | `kralovsky_vele_rak` | `cert_sekac` | `kralovska_polednice` |
| **8. Úroveň** | `7` | Noc | Červen v Hrusicích – Červnová noc | `cervnova_senosec` | `[E] Natrhat kapradí (Hvozd)` | `rusalka` | `ohnivy_sudlicka` | `svatojansky_vladce` |
| **9. Úroveň** | `8` | Den | Červenec v Hrusicích – Žně sv. Markéty | `cervencove_zne` | `[E] Vystřelit růži (Střelnice)` | `krecek_obilnik` | `zitna_matka` | `hromotluk_marketa` |
| **10. Úroveň** | `9` | Noc | Červenec v Hrusicích – Bouře sv. Eliáše | `cervencove_zne` | `[E] Uzemnit bleskosvod (Kostel)` | `bila_pani` | `bezhlavy_rytir` | `drak` |
| **11. Úroveň** | `10` | Den | Srpen v Hrusicích – Dožínková slavnost | `srpnova_slavnost` | `[E] Upéct chléb (Chlebová pec)` | `kralovsky_cmelak` | `zlatohlavek_zrout` | `dozinkovy_chasnik` |
| **12. Úroveň** | `11` | Noc | Srpen v Hrusicích – Vavřinecká noc | `vavrinecka_noc` | `[E] Zažehnout vatru (Vavřinecká vatra)`| `netopyr_usatec` | `nocni_mura` | `vyr_velky` |
| **13. Úroveň** | `12` | Den | Září v Hrusicích – Posvícení a švestky | `zarijove_posviceni` | `[E] Zamíchat povidla (Kotel)` | `kralovsky_srsen` | `povidlovy_cert` | `posvicensky_hospodar` |
| **14. Úroveň** | `13` | Noc | Září v Hrusicích – Svatováclavská noc | `svatovaclavska_noc` | `[E] Zažehnout svatý oheň (Kostel)` | `bila_pani` | `mlynar` | `kvilici_meluzina` |
| **15. Úroveň** | `14` | Den | Říjen v Hrusicích – Bramborová nať a drakiáda | `rijnova_drakiada` | `[E] Upéct bramboru (Ohníček na návsi)` | `kralovsky_havran` | `hastrman_podzimni` | `drak_vetrnik` |
| **16. Úroveň** | `15` | Noc | Říjen v Hrusicích – Dušičková noc a výlov rybníka | `dusickova_noc` | `[E] Zažehnout dušičkovou svíci (Boží muka)` | `dusickova_bludicka` | `cert_rybnikar` | `vele_stika` |
| **17. Úroveň** | `16` | Den | Listopad v Hrusicích – Svatomartinské posvícení | `listopadove_posviceni` | `[E] Upéct husu v pekáči (Hospoda Na Rychtě)` | `kralovska_husa` | `martinsky_jezdec` | `listopadovy_mrazivec` |
| **18. Úroveň** | `17` | Noc | Listopad v Hrusicích – Listopadové mrazy a mlhy | `listopadove_posviceni` | `[E] Přiložit do milíře (Uhlířský milíř)` | `cerny_myslivec` | `kanec_knour` | `jezdec_meluziny` |
| **19. Úroveň** | `18` | Den | Prosinec v Hrusicích – Adventní trh a svatý Mikuláš | `prosincovy_advent` | `[E] Zapálit adventní svíci (Adventní věnec na návsi)` | `cert_s_pytlem` | `mikulassky_cert` | `kral_mrazik` |
| **20. Úroveň** | `19` | Noc | Prosinec v Hrusicích – Štědrovečerní noc a chlad | `prosincovy_advent` | `[E] Zazvonit na zvon (Zvonice sv. Mikuláše)` | `maskarni_kozel` | `mraziva_sova` | `kral_mrazik` |
| **21. Úroveň** | `20` | Den | Leden v Hrusicích – Tříkrálová koleda a sníh | `lednova_zavej` | `[E] Postavit sněhuláka (Náves u kašny)` | `obri_snehulak` | `trikralovy_jezdec` | `vladce_chumelenice` |
| **22. Úroveň** | `21` | Noc | Leden v Hrusicích – Tříkrálová noc a perchta | `lednova_zavej` | `[E] Napsat K+M+B svěcenou křídou (Dveře fary)` | `ledova_klekanice` | `kostlivec_s_kosou` | `perchta_s_nozem` |
| **23. Úroveň** | `22` | Den | Únor v Hrusicích – Masopustní průvod a koblihy | `unorova_naves` | `[E] Smažit masopustní koblihy (Hostinec U Cikánů)` | `masopustni_medved` | `slamennik_obr` | `rychtar_masek` |
| **24. Úroveň** | `23` | Noc | Únor v Hrusicích – Masopustní rej a pochovávání basy | `unorova_naves` | `[E] Pochovat basu a rozsvítit louče (Stará márnice)` | `nocni_kobold` | `umrlec_basista` | `bakchus_s_pivnim_soudkem` |

---

## 3. Celková mapa architektury a souborových vazeb

Přidání nového měsíčního páru výprav (např. Listopad – úrovně 16 a 17, Prosinec – úrovně 18 a 19) vyžaduje přesný zásah do **9 vrstev systému**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. TYPY, FÁZE DNE A REGISTR VÝPRAV                                         │
│    • src/types.ts              (Rozšíření unionu GameLevelId: ... | 20 | 21 | 22 | 23)│
│    • src/data/levels.ts        (Záznamy GAME_LEVELS[16] až GAME_LEVELS[19]) │
│    • src/constants.ts          (getCurrentDayPhase větve pro den a noc,     │
│                                 rozpočtové body monster v ENEMY_POINTS)     │
│    • src/data/levelUnlocks.ts  (LEVEL_ORDER, isLevelFullyUnlocked,          │
│                                 makeSequentialUnlock s vazbou na bosse)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PROSTOROVÁ ARÉNA & 10 KANONICKÝCH DEKORACÍ (1 RÁM + 9 POI)              │
│    • src/data/<mesic>Arena.ts  (Export <MESIC>_POIS, <MESIC>_DECOR,         │
│                                 překážky s půdorysy, vodní drift, [E] stav) │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. STRAŠIDLA, REJDOVÝ ROZPOČET & REŽISÉR VÝPRAVY                            │
│    • src/data/enemies.ts       (Statistiky, velikosti, barvy, kategorie)    │
│    • src/data/enemyUnlocks.ts  (Postupný bestiář a milníky odhalení)        │
│    • src/game/director.ts      (STAGE_THREAT_MULTIPLIERS, filtry kategorií   │
│                                 v isRegularSpawnAllowedForLevel a bazény)   │
│    • src/game/virtualLeaderCrowWave.ts (Zahrnutí nočního ID výpravy)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. PROCEDURÁLNÍ KRAJINA, KVAŠOVÉ SVĚTLO & PLÁTNO                            │
│    • src/render/<mesic>SvgLandscape.ts (Kreslení všech 10 prvků dekoru)     │
│    • src/render/arenaRenderer.ts       (Barevná témata, ořezové poloměry    │
│                                         3200px/560px v chunked i fallback   │
│                                         průchodu a denní sluníčko)          │
│    • src/render/renderWorldHazards.ts  (Sekce 1a–1j: kruhy dosahu POI       │
│                                         a nápovědní banner aktivního POI)   │
│    • src/render/chunkCache.ts          (Registrace prefixu v isDynamicItem) │
│    • src/render/ladaRenderer.ts        (Směrování dekorací a spritů monster)│
│    • src/render/bakedBubakAtlas.ts     (Předpečení pro GPU atlas monster)   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. ZÁKON DVOJÍ PARITY (SIMULACE & PROHLÍŽEČ — ADR 0037)                    │
│    • src/game/engineState.ts   (Stavové rozhraní <mesic> a activePoiPrompt) │
│    • src/game/engine.ts        (Init stavu, [E] interakce, bossové, dropy)  │
│    • src/App.tsx               (1:1 zrcadlení v Reactu, klávesa [E],        │
│                                 světelné zdroje, clampování dropů v aréně)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. GPU ANIMACE, KATALOG & ARCHEKODY                                         │
│    • src/components/gpu-animation/enemyCatalog.ts (GPU kůstky a katalogy)  │
│    • src/data/runArchetypes.ts (RUN_ROZMARY[levelId] – přesně 2 kanonické   │
│                                 rozmary pro každou novou úroveň)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. TROFEJE, KNIŽNÍ SPREAD & DVOJJAZYČNÝ PŘEKLAD                             │
│    • src/data/trophies.ts      (Trofeje za dokončení výpravy a mechaniky)   │
│    • src/components/LadaStorybookSpread.tsx (Viněta a pin v MAP_SIGNPOSTS) │
│    • src/i18n/locales/cs.ts & en.ts (Kompletní lokalizační klíče)          │
├─────────────────────────────────────────────────────────────────────────────┤
│ 8. AUTOMATICKÉ AUDITY A VERIFIKAČNÍ TESTY                                   │
│    • tests/allStagesAudit.test.ts          (Invariance všech 20 úrovní)     │
│    • tests/allStagesMapsAndSeasons.test.ts (Audit plátna, POI a stacku)     │
│    • tests/level<id><Mesic>.test.ts        (Dedikovaná integrační sada)     │
│    • tests/enemyFpsBenchmark.test.ts       (Rozpočet p95 < 16.7 ms)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Anatomie 5minutové výpravy (Časová osa přežití)

Každá výprava trvá přesně **300 sekund** (5 minut), po nichž přichází finální souboj s Vele-bossem:

```mermaid
flowchart TD
    T0["0 s: Výsadek do Hrusic\n(Denní slunce / Noční soumrak)\nSpawn drobné havěti a prvních hlídek"] --> T85["85 s: Úder MiniBosse!\n(Varovná polnice, miniBoss.time = 85)\nNapř. Královský sršeň či Blatouch"]
    T85 --> T120["120–150 s: Zlom denní fáze\n(Poledne -> Odpoledne / Soumrak -> Hluboká noc)\nZvýšení rejdu a hustoty vln"]
    T120 --> T185["185 s: Útok MeziBosse!\n(midBoss.time = 185)\nNapř. Povidlový čert, Hastrman či Mlynář"]
    T185 --> T220["200–260 s: Vrcholná bouře běsů\n(Půlnoc / Zlatý podvečer)\nHordy netopýrů, vran či divočáků"]
    T220 --> T300["300 s: Kuropění & Příchod VeleBosse!\n(finalBoss.time = 300)\nNapř. Posvícenský Hospodář, Morana, Meluzína"]
    T300 --> TVICTORY["Porážka VeleBosse:\n• levelVictoryTriggered = true\n• Odemčení trofeje & další výpravy\n• Knížkový rozklad s vavřínovým věncem"]
```

---

## 5. Implementační vzory: Nulová alokace, FCT a Kolizní stín

Zde jsou konkrétní technické vzory zavedené v Pěti pilířích kodexu:

### 5.1 Vzor: Kruhový zásobník terénu (Zero-Allocation Ring Buffer)

Nikdy v herní smyčce nealokuj dynamické objekty. Použij předalokovaný statický buffer:

```ts
// src/data/<mesic>Arena.ts nebo renderWorldHazards.ts
export const MAX_WORLD_HAZARDS = 32;

export interface WorldHazardSlot {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  life: number;
  maxLife: number;
  slowRatio: number;
}

export function createHazardPool(size = MAX_WORLD_HAZARDS): WorldHazardSlot[] {
  return Array.from({ length: size }, () => ({
    active: false,
    x: 0,
    y: 0,
    radius: 0,
    life: 0,
    maxLife: 1,
    slowRatio: 0,
  }));
}

/** Zápis do kruhového zásobníku přímým přepisem bez .push() a .splice() */
export function spawnHazardSlot(
  pool: WorldHazardSlot[],
  head: { index: number },
  x: number,
  y: number,
  radius: number,
  life: number,
  slowRatio = 0.4
): void {
  const slot = pool[head.index];
  slot.active = true;
  slot.x = x;
  slot.y = y;
  slot.radius = radius;
  slot.life = life;
  slot.maxLife = life;
  slot.slowRatio = slowRatio;
  head.index = (head.index + 1) % pool.length;
}
```

### 5.2 Vzor: Škrcení plovoucích textů pro Zrádný terén (FCT Throttling)

Zabraň přetížení obrazovky texty při hromadném zásahu monster v kaluži či ohništi:

```ts
// Plovoucí text se smí generovat max. 1x za 0.25 s na monstrum
if (distSq < hazard.radius * hazard.radius) {
  enemy.speedModifier = hazard.slowRatio;
  
  const now = engine.state.gameTime;
  if (!enemy.lastHazardTextTime || now - enemy.lastHazardTextTime >= 0.25) {
    enemy.lastHazardTextTime = now;
    engine.addCombatText('Opařen!', enemy.x, enemy.y - 15, 'debuff');
  }
}
```

### 5.3 Vzor: Kolizní stín letce na plátně (Canvas 2D)

Pro všechna létající monstra promítni stín na zemský povrch:

```ts
// src/render/ladaRenderer.ts uvnitř drawFlyingEnemy
if (enemy.isFlying) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 15, 30, 0.38)';
  ctx.beginPath();
  // Oválný stín posunutý svisle o +24 px pod střed letící bytosti
  ctx.ellipse(0, 24, enemy.radius * 0.9, enemy.radius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
```

---

## 6. Krok za krokem: Jak uvařit nový měsíc

### Krok 1: Typy a registrace v `levels.ts`

1. **`src/types.ts`**: Rozšiř union `GameLevelId` o novou úroveň (např. `14 | 15`).
2. **`src/constants.ts`**:
   - V `getCurrentDayPhase(seconds, levelId)` přiřaď své denní ID k denní větvi a noční ID k noční větvi.
   - V `ENEMY_POINTS` definuj hodnotu bodů pro každého nového nepřítele.
3. **`src/data/levels.ts`**:
   Vytvoř záznam pro den i noc:
   ```ts
   export const GAME_LEVELS: Record<GameLevelId, GameLevelDef> = {
     // ...
     14: {
       id: 14,
       name: "15. Říjen v Hrusicích – Bramborová nať a drakiáda",
       shortTitle: "Říjnová drakiáda",
       subtitle: "Vonící dým z bramborové natě, draci na větru a pečené brambory v popelu",
       theme: "october_harvest",
       season: "autumn",
       icon: "🥔",
       badge: "15. Úroveň",
       skyColor: "#FDE68A",
       groundColor: "#B45309",
       weatherEffect: "falling_leaves",
       decorTypes: ["cottage", "tree", "rock", "potato_fire", "kite"],
       arena: {
         id: "rijnova_drakiada",
         name: "Říjnová náves a brambořiště",
         layout: "asymmetric_poi",
         poiOrder: ["fields", "church", "tavern", "village", "school", "pond", "mill", "forest", "shrine"],
       },
       miniBoss: {
         id: "kralovsky_havran",
         name: "🦅 Královský havran ze strniště",
         warning: "🦅 POZOR: ZE STRNIŠTĚ VYLETĚL OBŘÍ ČERNÝ HAVRAN!",
         time: 85,
         kills: 120,
         multiplier: 1.0,
       },
       midBoss: {
         id: "hastrman_podzimni",
         name: "🐸 Podzimní hastrman z rákosí",
         warning: "🐸 POZOR: Z KALNÉHO RYBNÍKA VYSTUPUJE HASTMAN SE SÍTÍ!",
         time: 185,
         kills: 280,
         multiplier: 1.0,
       },
       finalBoss: {
         id: "drak_vetrnik",
         name: "🪁 Hrusický drak Větrník",
         warning: "🪁 NEBE TEMNÍ! NAD HRUSICEMI KROUŽÍ OBŘÍ PAPÍROVÝ DRAK VĚTRNÍK! 🪁",
         time: 300,
         kills: 440,
         multiplier: 1.0,
       },
       bossMechanic: {
         label: "Ohníček z bramborové natě",
         description: "Přistup k ohništi na návsi a stiskni [E] pro upečení horké brambory – popálíš běsy v okolí a získáš posilující svačinku!",
         cadenceSeconds: 20
       }
     },
   };
   ```

### Krok 2: Posloupnost odemykání v `levelUnlocks.ts`

Žádná úroveň v Hrusicích nesmí viset ve vzduchu:
1. Přidej nová ID do pole `LEVEL_ORDER`.
2. V funkci `isLevelFullyUnlocked(id, meta)` přidej podmínku:
   ```ts
   if (id === 14 && ((meta?.bestiaryKills?.kvilici_meluzina || 0) >= 1 || !!meta?.completedLevels?.[13])) return true;
   ```
3. V `LEVEL_UNLOCKS` přidej `makeSequentialUnlock(14, ['svestkovy_srsen', 'topivec', 'kvilici_meluzina'])`. Všechna ID monster v tomto poli **musí existovat v `ENEMIES`**!

### Krok 3: Prostorová aréna a 10 kanonických dekorací (`<mesic>Arena.ts`)

Základem hrusické geografie je společná topologie z `marchThawArena.ts`. Znovu použij:
- Hranice arény: `MARCH_ARENA_BOUNDS` (`x: [-1920..1920], y: [-1675..1675]`).
- Lesní zóny: `MARCH_FOREST_ZONES`.
- Koryto potoka: `MARCH_STREAM_WAYPOINTS`.

Každý modul arény **musí exportovat přesně 10 dekorativních dominant** v `<MESIC>_DECOR`:
1. Rám arény a celovesnická infrastruktura: `<mesic>_border` na souřadnicích `(0, 0)`.
2. Devět bodů zájmu (POI) umístěných přesně na souřadnicích ze slovníku `<MESIC>_POIS`:
   - `fields`: `(225, -975)` — Severní pole a lány
   - `church`: `(-800, -650)` — Návrší s kostelem sv. Mikuláše
   - `tavern`: `(440, -75)` — Hospoda U Sejků
   - `village`: `(50, -75)` — Náves s lípou a louží
   - `school`: `(125, 550)` — Škola a ovocný sad
   - `pond`: `(-725, 615)` — Rybník Brčálník
   - `mill`: `(-880, 110)` — Vodní mlýn s náhonem
   - `forest`: `(650, 725)` — Hluboký hvozd a skály
   - `shrine`: `(820, -620)` — Boží muka u rozcestí

Přidej 4–8 specifických sezónních překážek s půdorysem (**Základový půdorys stavby**, ADR 0034).

---

## 7. Škola ladovského malířství: Procedurální plátno a kvaš

Všechno vizuální kouzlo Bubákova se odehrává v Canvas 2D v souboru `src/render/<mesic>SvgLandscape.ts`. Zde neexistují žádné bitmapové textury z cizích balíčků; každý tah štětce a tužky je počítán procedurálně.

### 7.1 Dva souřadnicové světy plátna

Když `arenaRenderer.ts` nebo `Decor.draw()` volá tvé vykreslování:
```ts
ctx.save();
ctx.translate(this.x, this.y);
ctx.scale(this.flip * this.scale, this.scale);
draw<Mesic>Decoration(ctx, this, time, isNight);
ctx.restore();
```
vznikají dva zcela odlišné souřadnicové prostory:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SVĚTOVÉ PLÁTNO: type === '<mesic>_border' (Kotva na 0, 0)                │
│    Stojíš ve středu celé mapy [-1920..1920, -1675..1675].                   │
│    Zde kreslíš globální vrstvy v pořadí odspodu nahoru:                     │
│    1. Polní cesty (lineWidth: 56, spojnice kostel-náves-hospoda-mosty)      │
│    2. Hrusický potok (tušový břeh lw: 96, vodní tělo lw: 86, proud lw: 34)   │
│    3. Dva dřevěné mostky na potoce (425, -455) a (475, 420)                 │
│    4. Čtyři centrální roubenky (přesně na půdorysech MARCH_THAW_OBSTACLES)  │
│    5. Ozdobný trojitý rám arény s rohovými kytičkami                        │
│    6. Zdobná titulní kartuše nahoře (0, -1590) s názvem měsíce              │
│    7. Polní překážky (stohy, mandele, panáky obilí)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. LOKÁLNÍ POI PLÁTNO: type === '<mesic>_<poi>' (Kotva na POI.x, POI.y)     │
│    Souřadnice (0, 0) je střed daného bodu zájmu!                            │
│    Pozor na relativní posuny:                                               │
│    Pokud má Kotel na povidla světovou polohu (45, -95) a náves má střed     │
│    (50, -75), musíš kotel uvnitř <mesic>_village nakreslit na:              │
│    relX = 45 - 50 = -5                                                      │
│    relY = -95 - (-75) = -20                                                 │
│    Jinak bude vizuální sprite posunutý vůči fyzickému koliznímu boxu!       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Sezónní proměna Hrusic napříč kalendářním rokem

```
┌───────────────┬──────────────────────┬──────────────────────────────────────┐
│ Měsíc         │ Paleta a nálada      │ Typické dominanty a polní překážky   │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 1–2: Březen   │ Šedobílý tající sníh │ Hroudy bláta, tající sněhuláci,      │
│               │ a hnědá ornice       │ praskající kry na rybníce            │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 3–4: Duben    │ Svěží jarní zeleň,   │ Pentlená májka na návsi, kraslice,  │
│               │ kvetoucí třešně      │ čarodějnická hranice dříví           │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 5–6: Květen   │ Sytá luční tráva,    │ Pivo s bílou pěnou u Sejků, pampeliš-│
│               │ bzučící chrousti     │ kové věnce, socha sv. Jana Nepomuka  │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 7–8: Červen   │ Zlatožluté seno,     │ Sušáky na seno, žebřiňáky se senem,  │
│               │ letní žár            │ koupaliště Na Racích                 │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 9–10: Červenec│ Zlatavé lány žita,   │ Panáky obilí, vlčí máky a chrpy,     │
│               │ bouřková mračna      │ poutní střelnice s růžemi z krepáku  │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 11–12: Srpen  │ Dožínkové strniště,  │ Chlebová pec na návsi, dožínkový vě- │
│               │ zralá jablka         │ nec, padající perseidy v noci        │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 13–14: Září   │ Modrající se švestky,│ Měděný kotel na povidla, pavučinky   │
│               │ zlaté babí léto      │ babího léta, svatováclavský oheň     │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 15–16: Říjen  │ Spadané listí, dým   │ Ohníčky z bramborové natě, draci     │
│               │ a sychravý vítr      │ na nebi, výlov rybníka a kádě s kapry│
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 17–18: Listop.│ Holé stromy, ranní   │ Svatomartinská husa v pekáči, uhlíř- │
│               │ mrazíky a mlhy       │ ský milíř v hvozdu, první vločky     │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 19–20: Prosin.│ Hluboký ladovský     │ Zasněžená náves, kluci na sáňkách,   │
│               │ sníh, tiché Vánoce   │ Mikuláš s čertem a andělem, Betlém   │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 21–22: Leden  │ Třeskuté mrazy, hlu- │ Stavění sněhuláka na návsi, tříkrá-  │
│               │ boké sněhové závěje  │ lová koleda s kometou, křída K+M+B   │
├───────────────┼──────────────────────┼──────────────────────────────────────┤
│ 23–24: Únor   │ Masopustní veselí,   │ Smažení masopustních koblih, tanec   │
│               │ rej pestrých maškar  │ laufra s bábou, pochovávání basy     │
└───────────────┴──────────────────────┴──────────────────────────────────────┘
```

---

## 8. Zákon dvojí parity (Headless Engine & Browser App)

> **ZLATÉ PRAVIDLO ADR 0037**: Bubákov disponuje dvěma běhovými prostředími:
> 1. **Bezhlavá simulace** (`src/game/engine.ts` a `src/game/engineState.ts`), která běží v unit testech, CI auditech a výkonnostních testech bez DOMu.
> 2. **Interaktivní klient** (`src/App.tsx`), který vykresluje hru v prohlížeči, snímá klávesnici, hraje zvuky a spravuje React stav.

### Kontrolní tabulka 1:1 parity

| Subsystém / Funkce | Bezhlavý engine (`src/game/engine.ts`) | Interaktivní klient (`src/App.tsx`) |
| :--- | :--- | :--- |
| **Stav měsíce** | Pole v `EngineState` (`engineState.ts`), inicializace v `initRun()`, getter/setter na třídě `GameEngine`. | Stejné inicializační volání při startu výpravy s `chosenLevelId`. |
| **Generování dekorací** | Naplnění `state.decor` pomocí `<MESIC>_DECOR`. | Návrat pole `[...<MESIC>_DECOR]` ve funkci `generateDecorForLevel()`. |
| **Kolize s překážkami** | Volání `resolve<Mesic>Obstacles()` pro hráče a pozemní běsy. | Volání `resolve<Mesic>Obstacles()` v hlavní smyčce hráče i potvor. |
| **Noční světelné zdroje** | Přidání statických světel do `state.lightSources`. | Přidání světel do `engine.lightSources` v bloku `initGame()` (kolem řádku 4330). |
| **Interakce klávesy [E]** | Kontrola vzdálenosti k POI, spuštění cooldownu, udělení buffu v simulaci. | Odchycení klávesy `KeyE`, spuštění téhož cooldownu, zvuku, plovoucího textu a částic. |
| **Omezení dropů na mapě** | Přidání nového ID k oběma kontrolám `clampToMarchArenaBounds` (kolem řádků 7870 a 7910). | Přidání nového ID k oběma kontrolám `clampToMarchArenaBounds` v `App.tsx` (kolem řádků 10210 a 10240). |
| **Příchod bossů** | Spawn v 85 s, 185 s a 300 s v simulačním ticku. | Spawn v týchž sekundách s varovným pruhem a spuštěním hudby. |
| **Vítězství a trofeje** | Nastavení `levelVictoryTriggered = true` po smrti posledního bosse. | Otevření vítězného dialogu, zápis do `meta.completedLevels[id] = true` a udělení trofeje. |

---

## 9. Hrusická síň hanby aneb 8 nejnebezpečnějších pastí

```
                    HRUSICKÉ PASTÍŘSKÉ OSIDLO
                   ┌─────────────────────────┐
                   │  ! POZOR NA ZÁKEŘNOSTI !│
                   └───────────┬─────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
[1. Zmizení světa za humny]                [2. Věčné poledne o půlnoci]
Frustum ořez smaže cestu,                   levelId chybí v getCurrentDayPhase,
pokud chybí 3200px limit!                   takže noc začíná v pravé poledne!
```

### 1. Zmizení světa za humny (*The Vanishing Border Trap*)
* **Co se stalo**: Hráč ušel 600 pixelů na západ a celá polní cesta, potok i ozdobný rám arény náhle zmizely.
* **Proč**: V `arenaRenderer.ts` v Pass 2b má většina dekorací ořezový poloměr `560 * scale`. Protože `<mesic>_border` leží v počátku `(0, 0)`, jakmile se kamera vzdálí o více než 560 px, renderer usoudil, že dekorace je mimo obrazovku!
* **Náprava**: Vždy přidej `dec.type === '<mesic>_border'` do větve s poloměrem `3200 * scale`!

### 2. Věčné poledne v půlnoční mlze (*The Eternal Noon Trap*)
* **Co se stalo**: Byla spuštěna noční výprava, ale na obloze zářilo polední slunce a hráči nefungovalo noční kvašové svícení.
* **Proč**: Funkce `getCurrentDayPhase(seconds, levelId)` v `src/constants.ts` obsahuje explicitní výčet ID. Když v ní chybí tvé noční ID, vrátí výchozí polední fázi!
* **Náprava**: Každé nové sudé i liché ID poctivě zapiš do příslušné větve v `getCurrentDayPhase`.

### 3. Dvojitý posun v čase a prostoru (*The Double Translation Trap*)
* **Co se stalo**: Kostel sv. Mikuláše odletěl 800 pixelů mimo arénu do temného prázdna.
* **Proč**: Autor v rendereru `<mesic>SvgLandscape.ts` v bloku `<mesic>_church` zavolal `ctx.translate(-800, -650)`. Jenže wrapper v `Decor.draw()` už plátno posunul na souřadnice dané dekorace! Došlo k posunu na `(-1600, -1300)`.
* **Náprava**: Uvnitř větve `<mesic>_<poi>` kresli vždy se středem na relativních souřadnicích `(0, 0)`.

### 4. Puklé záchranné lano plátna (*The Broken Canvas Stack*)
* **Co se stalo**: Hra náhle spadla s chybou v testu plátna `ctx.getSaveDepth() !== 0`.
* **Proč**: Uvnitř složité kreslicí metody byl zavolán `ctx.save()`, ale po předčasném `return` chyběl odpovídající `ctx.restore()`.
* **Náprava**: Každý `ctx.save()` musí mít svůj `ctx.restore()` na stejné úrovni zanoření.

### 5. Ledový březen o žních (*The Winter-in-Summer Blunder*)
* **Co se stalo**: Uprostřed červencových žní plavaly na hrusickém potoce bílé ledové kry a postava se na nich klouzala.
* **Proč**: Autor zkopíroval vykreslování potoka z `marchThawArena.ts` i s voláním `drawIceFloes()`.
* **Náprava**: V letních a podzimních měsících kresli do vody lekníny, spadané listí, čeřící se vlnky nebo plovoucí kachny.

### 6. Zapomenutý rozpočet na strašidla (*Unbudgeted Spook Trap*)
* **Co se stalo**: Nové strašidlo se ve hře odmítalo objevit v náhodných vlnách, nebo test `allStagesAudit.test.ts` selhal na neznámém bodovém ohodnocení.
* **Proč**: V `src/constants.ts` v objektu `ENEMY_POINTS` chyběla položka s cenou monstra pro `RunDirector`.
* **Náprava**: Každé monstrum v `ENEMIES` musí mít své bodové ohodnocení v `ENEMY_POINTS`!

### 7. Hluchá browserová ozvěna (*The Headless-Only Parity Trap*)
* **Co se stalo**: Unit testy výpravy prošly na 100 %, ale hráč v prohlížeči po stisku `[E]` u kotle s povidly neviděl žádný efekt ani text.
* **Proč**: Mechanika byla naimplementována pouze v `src/game/engine.ts`, ale v `src/App.tsx` v obsluze klávesy `KeyE` nebyla zapsána!
* **Náprava**: Pokaždé zkontroluj tabulku parity v Sekci 8. Co umí engine, musí umět i React klient.

### 8. Zatmění slunce v poledne (*Missing Daylight Sun Overlay*)
* **Co se stalo**: V denní úrovni chybělo animované ladovské usmívající se sluníčko v pravém horním rohu.
* **Proč**: V `src/render/arenaRenderer.ts` v Pass 11 má pomocná funkce `isDaylightStage(levelId)` explicitní výčet denních úrovní.
* **Náprava**: Přidej své nové denní ID do `isDaylightStage(levelId)`.

### 9. Zmizení rozmarů a runového výběru (*The Missing Run Rozmar Trap*)
* **Co se stalo**: Hráč vybral novou úroveň, ale hra spadla nebo nenabídla žádné runové modifikátory.
* **Proč**: V `src/data/runArchetypes.ts` v záznamu `RUN_ROZMARY` chyběl klíč nového `levelId`.
* **Náprava**: Vždy definuj přesně 2 kanonické rozmary s platnou hodnotou `formationBias` (`pincer`, `hammer_anvil`, `spiral`, `encirclement` apod.).

### 10. Skrytý nápovědní banner POI (*The Ghost HUD Prompt Trap*)
* **Co se stalo**: Hráč stál u aktivního POI a mohl stisknout `[E]`, ale v horní části obrazovky se nezobrazil žádný banner.
* **Proč**: V `src/render/renderWorldHazards.ts` chyběla obsluha `engine.<mesic>ActivePoiPrompt` v sekcích 1a–1j.
* **Náprava**: Přidej blok vykreslení banneru a aury pro daný měsíc do `renderWorldHazards.ts`.

### 11. Zaseknuté dynamické POI v mezipaměti (*The Stale Chunk Cache Trap*)
* **Co se stalo**: Animovaný oheň milíře nebo rotující prvky POI zamrzly a překreslovaly se rozmazaně.
* **Proč**: V `src/render/chunkCache.ts` v metodě `isDynamicItem` chyběl prefix nového měsíce.
* **Náprava**: Přidej `item.type.startsWith('<mesic>_')` do `isDynamicItem`.

---

## 10. Verifikace a spouštění testů

```bash
# 1. Kontrola typové čistoty TypeScriptu
npm run typecheck

# 2. Rychlý audit všech výprav a mapových podkladů
npx vitest run tests/allStagesAudit.test.ts tests/allStagesMapsAndSeasons.test.ts

# 3. Spuštění dedikovaného testu měsíce
npx vitest run tests/level12Zari.test.ts

# 4. Spuštění celého testovacího arzenálu (850+ testů)
npm test

# 5. Ověření produkčního sestavení Vite
npm run build
```

---

## 11. Předletová kontrola Ponocného (Checklist)

- [ ] **Typy a data**: `GameLevelId` rozšířen v `src/types.ts` a definice zapsána v `src/data/levels.ts`.
- [ ] **Fáze dne**: `getCurrentDayPhase` v `src/constants.ts` správně obsluhuje denní (start `noon`) i noční (start `dusk`) úroveň.
- [ ] **Trojjedinost vln**: Každá fáze v `spawnPools` obsahuje zástupce roje (havěť), přímého běžce (těžký běs) a taktického narušitele/letce.
- [ ] **Rozpočet**: Všechna nová monstra mají své body v `ENEMY_POINTS` v `src/constants.ts`.
- [ ] **Postup kampaně**: `LEVEL_ORDER`, `isLevelFullyUnlocked` a `LEVEL_UNLOCKS` provázány s předchozím bossem v `levelUnlocks.ts`.
- [ ] **Aréna a dominanty**: Modul `<mesic>Arena.ts` exportuje 9 POI, 10 prvků v `<MESIC>_DECOR` a sezónní překážky s půdorysem.
- [ ] **Nulová alokace terénu**: Zrádný terén používá kruhový zásobník (Ring Buffer) bez `.push()`, `.splice()` či `.filter()`.
- [ ] **Škrcení textů**: Plovoucí bojové texty u plošných pastí mají cooldown `0.25 s` a agregaci při >5 zásazích.
- [ ] **Signaturní mechanika**: Právě jedno [E] ohnisko s formátem `[E] <Sloveso> <Předmět> (<Dominanta>)` a trojí odezvou (audio, rázová vlna, cooldown).
- [ ] **Optický kontrast a letci**: Každý letec má pozemní stín posunutý o `+20–30 px` na ose Y a noční běsi mají kontrastní konturu.
- [ ] **Akustická trojice**: Definována ambientní smyčka, varovná polnice ponocného pro bosse a rituální zvuk pro [E].
- [ ] **Kreslicí rutina**: Modul `<mesic>SvgLandscape.ts` kreslí cesty, potok, mostky, 4 roubenky a reaguje na `isNight`.
- [ ] **Plátno v bezpečí**: Všechny kreslicí metody mají dokonale vyvážený stack (`ctx.save()` / `ctx.restore()`).
- [ ] **Ořez kamery**: V `arenaRenderer.ts` je `<mesic>_border` zařazen pod `3200 * scale` a `<mesic>_*` pod `560 * scale`.
- [ ] **Sluníčko**: Denní úroveň je zapsána v `isDaylightStage` v `arenaRenderer.ts`.
- [ ] **Dvojí parita**: Stav, překážky, klávesa [E], drop clampy a bossové zrcadleni 1:1 mezi `engine.ts` a `App.tsx`.
- [ ] **Lokalizace**: České (`cs.ts`) i anglické (`en.ts`) texty doplněny pro úroveň, podtitul, mechaniku i všechna nová monstra a bosse.
- [ ] **Kniha a trofeje**: Přidána trofej v `trophies.ts`, viněta a pin v `MAP_SIGNPOSTS` v `LadaStorybookSpread.tsx`.
- [ ] **Runové rozmary**: V `src/data/runArchetypes.ts` definovány přesně 2 rozmary s platným `formationBias`.
- [ ] **Nápovědní banner**: V `src/render/renderWorldHazards.ts` integrován banner a vizuální kruh pro aktivní POI.
- [ ] **Atlas a mezipaměť**: Monstra zapsána v `bakedBubakAtlas.ts` a prefix dekorací v `chunkCache.ts`.
- [ ] **Zkouška ohněm**: Všechny testy v `vitest` i produkční `npm run build` hlásí zelenou!

---

*„Ať tvé tušové linky nikdy nezblednou, ať je tvůj měděný kotel stále plný horkých povidel a ať žádný bubák neuteče tvému bystrému zraku!“*  
— **Rada starších obce Hrusice**
