# Životnost nezkonzumovaného jídla a korekce dynamických dropů

## Kontext
Při delším hraní a dobré úspěšnosti lovce (plná nebo téměř plná Kuráž) docházelo k hromadění nezkonzumovaného jídla (chléb, hrušky, jitrnice) v aréně. Jelikož systém chránil lovce před nechtěným sebráním léčení při plném zdraví (`canCollectDrop = false`), ale jídlo nemělo nastavený časovač expirace (`expiration: undefined`), zůstávaly léčivé předměty ležet v trávě neomezeně dlouho. Vzhledem k pevnému stropu aktivních dropů (40 slotů) tyto relikty blokovaly generování užitečných odměn (krejcarů a voňavých perníčků).

Dále v logice dynamických dropů docházelo k nekonzistencím:
1. `opts.mercyCooldownActive` (ochranný 15s cooldown na záchranné léčení) nebyl v `resolveDynamicDrop` vyhodnocován.
2. V `GameEngine.spawnDrop` i `App.tsx` docházelo ke ztrátě parametrů při dynamické transformaci léčení (hodnoty, velikosti, příznak `isHot` a časovače expirace).
3. V renderovací smyčce `GameEngine.update` chyběl odpočet expirace a kontrola `canCollectDrop`, což vedlo k rozdílnému chování oproti `App.tsx`.
4. `performDropFusion` ignoroval nezkonzumované jídlo mimo obrazovku při přetížení arény.

## Rozhodnutí
1. **Kanonická expirace jídla (`FOOD_DROP_EXPIRATION = 25.0 s`)**:
   - Všechny léčivé předměty (`potion`, `bread`, `pear`) získávají výchozí trvanlivost 25 sekund.
   - Posledních 5 sekund před vypršením je doprovázeno pulzujícím vizuálním varováním (jemné blikání průhlednosti).
   - Po uplynutí 25 s bez spotřeby jídlo přirozeně oschne a uvolní slot arény.

2. **Konsolidace a fúze jídla mimo obrazovku (`performDropFusion`)**:
   - Pokud počet dropů překročí limit arény (`MAX_ACTIVE_DROPS`), starší nezkonzumované jídlo mimo dohled kamery se sloučí do hodnotného záchranného košíku perníku (`gingerbread_stash`) nebo se uvolní.

3. **Plná integrace Režiséra výpravy a pojistky záchrany**:
   - `resolveDynamicDrop` respektuje `mercyCooldownActive` a při aktivním cooldownu odklání léčení do mincí či perníčků (85% odklon).
   - Při plné Kuráži (≥ 95 %) dochází k 88% odklonu léčení na toláry, perníky, dušičky či podkovy bez duplicitních náhodných hodů.
   - Všechny parametry transformace (`value`, `size`, `speed`, `expiration`, `isHot`, `isMercyDrop`) jsou striktně předávány do entitního rozvržení.

4. **Podpora pro Medvědí mast / Masku medvěda (`bearMaskLevel > 0`)**:
   - Pokud lovec disponuje Maskou medvěda (`player.bearMaskLevel > 0`), `canCollectDrop` umožňuje sebrání jídla i při plné Kuráži za účelem vyvolání tlakové vlny přeléčení.
   - `resolveDynamicDrop` i `selectWeightedDropType` při aktivní Masce medvěda snižují potlačení jídla při plné Kuráži a ve fázi `stress` z 88 % na 40 %, aby měl lovec stálý přísun munice pro výbuchy přeléčení.

5. **Kanonická expirace a strop pro Hrníčky s dušičkami (`SOUL_DROP_EXPIRATION = 16.0 s`, `MAX_ACTIVE_SOUL_DROPS = 2`)**:
   - Hrníčky s dušičkami (`soul`) mají životnost 16 sekund (s blikáním posledních 4 sekund) a v aréně mohou ležet nejvýše 2 současně.
   - Další dušičky se při naplnění stropu nebo aktivním buffu *Dušičkový rej* (`soulBuffActive`) dynamicky odklánějí na krejcary, perníčky nebo jídlo.

6. **Sjednocený prioritní směrovač bonusových dropů a těžké kotvy v `PendingDropBank`**:
   - Každý poražený či zasycený bubák dává vždy základní odměnu (perníček + hod na Štěstí) a **nejvýše 1 sekundární bonusový předmět** (1. Truhla bosse/minibosse či bodového prahu -> 2. Záchranná jitrnice při Kuráži `< 25 %` s aktivací `mercyPityCooldown = 15 s` -> 3. Jeden připravený bodový práh `potion`/`bread`/`soul` -> 4. Vážený výběr Režiséra `selectWeightedDropType` podle skóre $V$ a kategorie bubáka).
   - `big_pouch` v aréně gravitačně přitahuje a pohlcuje okolní mince v okruhu `60 px`.
   - `PendingDropBank` při nashromáždění `>= 30` mincí nebo `>= 28` perníčků automaticky vyplácí převis jako *Velký měšec krejcarů* (`big_pouch`) a *Košík perníku* (`gingerbread_stash`) s konsolidačním bonusem `+15 %`, a vypršelé *Horké perníčky* vracejí 50 % své základní hodnoty do `PendingDropBank`.
