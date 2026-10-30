# 05: Taktický nepřítel: Čarodějnice na koštěti (Létající nálety a uřknutí)

**What to build:** Introduces the "Čarodějnice na koštěti" (Flying Broom Witch) aerial enemy inspired by Czech Walpurgis Night folklore. Flying freely over fences, rivers, and obstacles (`isFlying: true`), she sweeps across the arena trailing glowing embers and sparks. She alternates between high-speed strafing dive-bombs and hovering at medium distance to cast "Uřknutí" (a telegraphed magical hex circle on the ground that cursed zones). Players must read her telegraphed flight corridors and strike during banking turns.

**Blocked by:** 01: Definice kraje, tempo a progrese (Dubnový den)

**Status:** closed

- [x] Enemy entry `carodejnice_koste` defined in `ENEMIES` and Bestiary with authentic Lada-style canvas draw routine (`drawBroomWitch`).
- [x] Kinematics support smooth banking flight curves and dive-bomb strafes unaffected by ground obstacles.
- [x] Telegraphed ground hex zone appears with clear visual warning before detonating into a curse burst.
- [x] Broom exhaust generates cinder and spark particles during movement.
- [x] Unit tests verify flight elevation, obstacle pass-through, telegraph timing, and combat interactions.
