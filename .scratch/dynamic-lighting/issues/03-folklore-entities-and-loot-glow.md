# 03: Integrace folklórních entit a kořisti (Hromnička, Bludičky, Perníčky & Truhly)

**What to build:**
Přidání specifických světelných emitérů pro folklórní entity v `src/game/lighting.ts`:
- Zbraň *Hromnička* vytváří teplou pulzující auru svatého světla.
- Strašidlo *Bludička* vyzařuje studené spektrální světlo.
- Ohnivé střely (*dragon_fireball*, *hell_spark*, *horky_brambor*) emitují světlo za letu.
- Vzácná kořist (*perníčky*, *podkova*, *truhly*) má jemný noční svit, aby byla viditelná i v temnotě.

**Blocked by:** 02-canvas-2d-lighting-renderer.md

**Status:** completed

- [x] Přidat vyhodnocení zbraně `hromnicka` do `getVisibleLightSources` (rozšiřuje poloměr a intenzitu světla lovce).
- [x] Přidat světelné zdroje pro bubáky typu `bludicka`.
- [x] Přidat světelné zdroje pro ohnivé a zářivé projektily v letu.
- [x] Přidat bodové emitery pro vzácné dropy (truhly, podkova, obří perníčky).
- [x] Rozšířit testy v `tests/dynamicLighting.test.ts` pro ověření přítomnosti těchto specifických světel.
