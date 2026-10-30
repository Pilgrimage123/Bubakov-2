# 02: Dubnová náves a jarní taktické body zájmu (POI)

**What to build:** The hunter explores an authentic April village map inspired by Stage 1, transforming frozen ground into greening meadows and thawed landmarks with distinct tactical gameplay benefits:
- **Rozkvetlé meze a pole**: Furrows grant +15% movement speed and burst dandelion pollen clouds that confuse bubaks.
- **Kostel sv. Jiří**: The Easter bell tower [E] rings out the return of church bells from Rome, purging curses and emitting a sacred resonance wave.
- **Kolednická náves a májka**: The decorated Maypole grants a protective warding aura against hexes and uřknutí.
- **Vyhřátý rybník Brčálník**: Thawed water with warm shallows and reeds (no ice floes), where deep water slows enemies.
- **Rozkvetlý ovocný sad**: Blossoming cherry and apple trees generate drifting petal squalls that disrupt flying trajectories.

**Blocked by:** 01: Definice kraje, tempo a progrese (Dubnový den)

**Status:** closed

- [x] Stage 3 arena definition (`dubnova_naves`) registers the April POIs with positions, radii, and readable hints.
- [x] Interactive landmark triggers (Easter bell peal [E], Maypole warding aura) update player stats and emit gameplay effects.
- [x] Outer arena boundary clamps entities inside the drawn folk border.
- [x] Terrain obstacle collisions and line-of-sight properly account for village cottages, church, and trees without clipping bugs.
- [x] Unit tests verify POI detection, cooldown timings, and boundary clamping.
