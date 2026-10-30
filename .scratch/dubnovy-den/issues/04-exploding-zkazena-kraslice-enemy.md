# 04: Taktický nepřítel: Zkažená kraslice (Řetězová exploze)

**What to build:** Introduces the "Zkažená kraslice" (Rotten Painted Egg) tactical enemy. Visually adorned with traditional folk batik patterns but pulsing with cracked fissures and noxious sulfur bubbles, this egg hops erratically toward the hunter. When reduced to 0 HP or on reaching proximity, it enters a 1.2 s ticking fuse state (shaking violently with flashing cues) and explodes into a blast of eggshell shrapnel and a puddle of foul yolk (slowing and inflicting damage over time). The blast deals heavy friendly-fire damage to surrounding bubaks, allowing hunters to trigger strategic chain explosions into incoming swarms.

**Blocked by:** 01: Definice kraje, tempo a progrese (Dubnový den)

**Status:** closed

- [x] Enemy entry `zkazena_kraslice` defined in `ENEMIES` and Bestiary with authentic Lada-style canvas draw routine (`drawZkazenaKraslice`).
- [x] State machine handles hopping locomotion, 1.2 s ticking fuse priming, and detonation.
- [x] Detonation emits a hazardous yolk pool on the ground that slows and inflicts dot damage.
- [x] Explosion deals AoE damage to the hunter and deals friendly-fire damage to all nearby enemies.
- [x] Unit tests verify hopping kinematics, fuse trigger conditions, friendly-fire splash damage, and hazard duration.
