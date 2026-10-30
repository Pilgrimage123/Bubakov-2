# 05: Miniboss Čarodějnice Zaspalka (85. sekunda)

**What to build:** At the 85-second mark of Stage 5, a warning banner announces the arrival of Čarodějnice Zaspalka (the Overslept Witch), a cranky hag who overslept Walpurgis Night (Filipojakubská noc on April 30). Riding a splintered birch broom that sputters dense clouds of black ink smoke, she swoops diagonally across the screen in fast, hit-and-run strafing passes before banking hard for another run.

**Blocked by:** 01: Definice 5. úrovně (Květen v Hrusicích) a postup hrou

**Status:** closed

- [x] Miniboss encounter for Čarodějnice Zaspalka triggers at 85 seconds with top-screen banner warning, boss health bar, and sound cue.
- [x] Kinematic state machine alternates between high-speed diagonal swoop passes across the arena and off-screen repositioning maneuvers.
- [x] Birch broom continuously sputters localized black ink smoke puffs that obscure vision and create hazard zones behind her flight path.
- [x] Procedural vector rendering depicts the grumpy, ruffled witch in a night kirtle clutching a splintered birch broomstick with ink exhaust.
- [x] Defeating Zaspalka drops a high-tier reward chest and clears any remaining ink smoke hazards.
- [x] Unit tests verify encounter trigger timing, swoop flight patterns, smoke trail emission, and defeat reward delivery.
