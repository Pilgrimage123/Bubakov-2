# 02: Zapojení hodnostních statistik zbraní do bojové smyčky a benchmark vyvážení

**What to build:** Všechny zbraně v herní smyčce povinně využívají statistiky vypočtené z `getRankedWeaponStats` (násobiče poškození, počet projektilů, zkrácení cooldownu, dosah a statusy), takže volby milníků mají okamžitý a znatelný vliv na bojové statistiky i chování.

**Blocked by:** 01: Rozšíření milníkového systému na všech 15 zbraní a validace arzenálu

**Status:** done

- [x] Zkontrolovat obsluhu střeleckých mechanismů v `src/App.tsx` / enginu pro každou zbraň, aby respektovala modifikátory z `getRankedWeaponStats(w.id, w.level, w)`.
- [x] Zabezpečit aplikaci bonusů projektilů (`projectileCountDelta`), dosahu (`areaRadiusMult`), průrazu (`pierceDelta`) a trvání statusů (`statusDurationSec`) v boji.
- [x] Ověřit chod benchmarku `scripts/benchmark-weapons.ts` a zkontrolovat, že startovní zbraně a milníky nevykazují regresi.
