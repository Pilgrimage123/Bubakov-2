# Harmonizace projektilových zbraní, bazény vylepšení a oprava milníků

## Kontext
Původní systém rozvoje zbraní popsaný v ADR 0011 zavedl dynamické tematické bazény běžných vylepšení (pro úrovně 2, 4, 6 a 7) pouze pro sečné zbraně (`melee`) a aury (`aura`). Projektilové a vrhací zbraně byly ponechány na provizorním statickém růstu, který navíc kvůli chybě vyhodnocení `normalUpgrades: []` v enginu neuděloval žádné bonusy. Dříve navržená vylepšení pro projektily byla provizorně odložena do synergických upgradů a neobjevovala se na kartách zbraní v nůši ani v truhlách.
Dále se na milnících sečných zbraní (Osikový prut, Kovářské vidle, Kovaná halapartna) vyskytoval parametr `pierceDelta: 1` (průraz), který u sečných a bodných útoků na blízko neměl žádný efekt, neboť sečné útoky již přirozeně zasahují všechny nepřátele v oblouku.

## Rozhodnutí

### 1. Tematický bazén běžných vylepšení pro projektilové zbraně (`projectile`)
Všech 8 projektilových a vrhacích zbraní (`kysela_okurka`, `povidlove_buchty`, `devatero_kviti`, `snehova_koule`, `kynuty_kolac`, `horky_brambor`, `vceli_roj`, `svecena_kropenka`) má plnohodnotný bazén 6 běžných vylepšení:
1. **Kobercový nálet** (`proj_barrage`): +130 % projektilů, −30 % zranění
2. **Rychlopalný mechanismus** (`cd_hyper`): −30 % cooldown (podléhá Stropu kadence −75 %)
3. **Těžká munice** (`dmg_heavy`): +100 % zranění
4. **Průrazné kování** (`proj_pierce`): +2 průraz, −15 % zranění
5. **Dalekonosný rozptyl** (`proj_reach`): +50 % dosah a plošný rozstřik
6. **Hustá salva** (`proj_volley`): +60 % zranění, +40 % projektilů

Odstraněny byly duplicitní syntetické položky z `synergisticUpgrades.ts`. Vylepšení se nyní losují náhodně přímo na kartách zbraní v nůši Čertova dědečka a v malovaných truhlách na úrovních 2, 4, 6 a 7.

### 2. Oprava milníků sečných zbraní (`ignoreResist`)
Mrtvý parametr `pierceDelta: 1` byl u sečných zbraní na 5. a 8. úrovni nahrazen mechanikou ignorování odolností strašidel (`ignoreResist`):
- Úroveň 5: **+25 % ignorování odolností** (`ignoreResist: 0.25`)
- Úroveň 8: **+40 % ignorování odolností** (`ignoreResist: 0.40`)
Týká se voleb *Pevná násada* a *Prachová smršť* (Osikový prut), *Kalený trojzubec* a *Mistrovský hrot* (Kovářské vidle) a *Hák a hrot* a *Rychtářův rozsudek* (Kovaná halapartna). Způsobené zranění těmito útoky proráží houževnatost, kamennou kůži i další typové rezistence monster.

### 3. Oprava statistického modelu a synchronizace React UI
- Podmínka v `getRankedWeaponStats` byla opravena tak, aby prázdné pole `normalUpgrades: []` nenulovalo základní postupný růst.
- Výběr milníku v `WeaponMilestoneModal` v `App.tsx` je sjednocen s voláním `engine.chooseWeaponMilestone()`, což garantuje okamžitou invalidaci a přepočet `_cachedStats` zbraně a spuštění příslušného zvukového efektu.

## Důsledky
- Všechny tři kategorie zbraní (`melee`, `aura`, `projectile`) mají plnou systémovou a mechanickou paritu.
- Každá zbraň nabízí hlubokou variabilitu s tematickými kompromisy.
- Odstraněny nefunkční parametry a zajištěna bezchybná odezva v boji i uživatelském rozhraní.
