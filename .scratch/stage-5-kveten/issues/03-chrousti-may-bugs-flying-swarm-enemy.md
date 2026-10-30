# 03: Chroust obecný (May Bug) – létající hmyzí nepřítel

**What to build:** The player encounters Chrousti (May Bugs / Cockchafers), plump buzzing brown beetles drawn in authentic Ladovský style with tiny waistcoats. They spawn in May swarm waves, fly in erratic sine-wave oscillations that ignore ground terrain obstacles, and drop sparkling XP seeds when swatted down by the player's attacks.

**Blocked by:** 01: Definice 5. úrovně (Květen v Hrusicích) a postup hrou

**Status:** closed

- [x] Enemy archetype `chroust` is registered with flight capability (`isFlying: true`), health, speed, and swarm cadence stats.
- [x] Flight kinematics simulate erratic sine-wave buzzing patterns that freely traverse ground obstacles, walls, and water.
- [x] On defeat, Chrousti scatter small glowing XP seeds / pollen pickups that provide immediate leveling reward.
- [x] Procedural vector rendering depicts Lada's authentic brown cockchafer beetle with open wing-cases, vibrating flight wings, striped abdomen, and a tiny embroidered vest.
- [x] Integrated into Stage 5 wave director spawn pools across morning and afternoon phases.
- [x] Unit tests verify kinematic flight math, collision filtering, XP seed dropping, and rendering safety.
