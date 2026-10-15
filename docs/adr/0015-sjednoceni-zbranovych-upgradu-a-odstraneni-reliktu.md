# Sjednocení zbraňových vylepšení, oprava projektilových postupů a odstranění reliktních synergií

## Kontext
Při revizi systému vylepšení zbraní a odměn v truhlách a u Čertova dědečka byla odhalena řada nekonzistencí z přechodných vývojových fází:
1. **Pojmové kolize jídel a zbraní**: V malovaných truhlách (pokladech) ležely stálé položky *Kynutý koláč (+25 Max Kuráž)* a *Povidlová buchta (Svačina na cestu)*. Pokud lovec nesl zbraň *Kynutý koláč* nebo *Povidlové buchty*, v jedné truhle se potkávaly totožné názvy i ikony pro jídlo a zbraň. U Čertova dědečka již dříve došlo k přejmenování koláče na *Pomeranč z Orientu*, v truhlách však nikoli (a navíc kód chybně přidával +30 Kuráže místo deklarovaných +25).
2. **Projektilové zbraně na starém systému**: Ačkoliv ADR 0012 definovalo 6 běžných vylepšení a postupy pro projektilové zbraně (`PROJECTILE_WEAPON_NORMAL_UPGRADE_PROGRESSIONS`), tyto postupy nebyly zapojeny do funkce `createWeaponRanks()` ani do podmínky `isCategoryCustom` v `getRankedWeaponStats()`. Všech 9 projektilových zbraní proto v inspekci a při postupech bez explicitních dynamických upgradů padalo do starého generického vzorce `+12 % zranění, +8 % nabíjení, +6 % dosah`.
3. **Relikt synergických upgradů**: Původní Ticket 01 definoval pro 5 zbraní boční syntetické perky (`synergisticUpgrades.ts`), jež se nabízely jako samostatné karty v nůši a truhlách. Po zavedení kánonického 8-úrovňového modelu s Milníky (3, 5, 8) a Kategoriemi (2, 4, 6, 7) se tyto karty staly matoucím duplikátem (např. *Záplava okurek* dělala totéž co *Kobercový nálet*).
4. **Bylinková fajfka mimo zbraňový arzenál v nůši**: Ačkoliv byla v ADR 0011 zavedena jako 16. plnohodnotná zbraň s 8 úrovněmi a milníky, v dědečkově nůši zůstávala zapsána jako 3-úrovňový pasivní předmět bez zbraňového typu.

## Rozhodnutí

### 1. Odstranění pojmových kolizí v truhlách
- **Pomeranč z Orientu (+25 Max Kuráž)**: Položka v truhlách byla sjednocena s nůší Čertova dědečka a opravena hodnota Kuráže na přesných +25 (odstraněn bug s +30).
- **Škvarková placka (Svačina na cestu)**: Druhá spotřební odměna v truhlách byla přejmenována na poctivou ladovskou *Škvarkovou placku* (+50 Kuráže, ikona 🫓), čímž se zcela oddělila od vrhací zbraně *Povidlové buchty*.

### 2. Plná integrace projektilových zbraní do kánonického 8-úrovňového modelu
- `PROJECTILE_WEAPON_NORMAL_UPGRADE_PROGRESSIONS` je plně zapojeno do `createWeaponRanks()` i `getRankedWeaponStats()`.
- Všech 9 projektilových zbraní (*Kyselá okurka, Povidlové buchty, Devatero kvítí, Sněhová koule, Kynutý koláč, Horký brambor, Včelí roj, Svěcená kropenka, Splašený houser*) nyní na úrovních 2, 4, 6 a 7 konzistentně využívá svůj kánonický bazén 6 tematických vylepšení (*Kobercový nálet, Rychlopalný mechanismus, Těžká munice, Průrazné kování, Dalekonosný rozptyl, Hustá salva*). Starý text `+12 % / +8 % / +6 %` byl definitivně odstraněn.

### 3. Automatický výběr vylepšení v enginu (Robust Upgrade Fallback)
- V metodě `GameEngine.upgradeWeapon()` byl přidán spolehlivý mechanismus: pokud na úrovních 2, 4, 6 a 7 není z UI či nůše předáno konkrétní `normalUpgradeId`, engine automaticky sáhne po předepsaném vylepšení z `rankDef.normalUpgradeId` nebo vylosuje náhodné vylepšení z příslušné kategorie. Zbraň tak nikdy nezůstane bez vylepšení.
- V `applyGrandfatherItem` je řádně předáván `candidateUpgradeId` z nákupní nabídky.

### 4. Bylinková fajfka jako plnohodnotná zbraň v nůši
- V `GRANDFATHER_ITEMS` byla *Bylinková fajfka* převedena do sekce zbraní (`wp_fajfka`, `isWeapon: true`, `weaponId: 'bylinkova_fajfka'`, 8 úrovní s milníky a aurickými vylepšeními).
- Původní ID `bylinkova_fajfka` je bezpečně aliasováno pro zachování 100% zpětné kompatibility uložených pozic.

### 5. Vyřazení reliktu synergických upgradů z nabídek
- Zrušeno generování a losování bočních karet synergických upgradů v nůši Čertova dědečka i v malovaných truhlách.
- Veškerý rozvoj všech 18 zbraní probíhá výhradně jednotnou cestou:
  - **Úrovně 1**: Základní zbraň
  - **Úrovně 2, 4, 6, 7**: Běžná vylepšení z bazénu kategorie (`melee`, `aura`, `projectile`)
  - **Úrovně 3, 5, 8**: Volba jednoho ze dvou unikátních Milníků
- Datový registr a obslužné metody v `synergisticUpgrades.ts` jsou zachovány pouze jako load-safe vrstva pro starší savy.

## Důsledky
- Všech 18 zbraní Bubákova má naprostou systémovou i textovou konzistenci.
- V nůši i truhlách již nedochází k matoucím duplicitám jmen a ikon.
- Hráč má jasný, přehledný a čitelný průchod vývojem každé zbraně od 1. do 8. úrovně.
