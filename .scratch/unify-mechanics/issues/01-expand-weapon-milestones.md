# 01: Rozšíření milníkového systému na všech 15 zbraní a validace arzenálu

**What to build:** Všech 15 kanonických zbraní má definovány hodnosti 1 až 8 a folklórní volby milníků na hodnostech 3, 5 a 8. Validace `validateWeaponMilestones()` prochází striktně bez chyb pro všech 15 zbraní.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Definovat hodnosti 1–8 a unikátní volby pro hodnosti 3, 5, 8 u všech 11 zbývajících zbraní (povidlove_buchty, kovarske_vidle, kovana_halapartna, dreveny_cep, devatero_kviti, snehova_koule, kynuty_kolac, horky_brambor, vceli_roj, hromnicka, svecena_kropenka).
- [x] Zabezpečit, že každá volba má folklórní název, popis a platné statistické modifikátory (baseDamageMult, cooldownMult, projectileCountDelta, areaRadiusMult, knockbackMult, statusDurationSec).
- [x] Aktualizovat `WEAPONS_WITH_MILESTONES` na všech 15 zbraní v `src/data/weaponMilestones.ts`.
- [x] Zajistit, že `validateWeaponMilestones()` ověří 100% arzenálu bez vyhození výjimky.
