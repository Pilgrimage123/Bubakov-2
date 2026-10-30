# 06: Podpůrný Koledník s řehtačkou a skladba dubnových vln

**What to build:** Introduces the "Koledník s řehtačkou" (Easter Caroller with Wooden Ratchet) support rusher. His vigorous clattering emits expanding soundwave rings that buff surrounding bubaks with increased speed and attack ferocity, making him a high-priority tactical target. Configures the complete RunDirector spawn pools for Stage 3 across the noon (0–150 s) and afternoon (150–300 s) phases, balancing new enemies (`zkazena_kraslice`, `carodejnice_koste`, `rehtackar`) alongside canonical spring folklore creatures (`blatouch`, `zaba`, `ropucha`, `rarach`, `divozenka`, `jiskrivec`), strictly excluding winter and autumn mobs.

**Blocked by:** 04: Taktický nepřítel: Zkažená kraslice (Řetězová exploze), 05: Taktický nepřítel: Čarodějnice na koštěti (Létající nálety a uřknutí)

**Status:** closed

- [x] Support enemy `rehtackar` defined in `ENEMIES` and Bestiary with animated ratchet drawing and soundwave aura.
- [x] Soundwave aura periodically boosts speed and cadence of nearby allied monsters within radius.
- [x] Stage 3 spawn pools in `levels.ts` populated for `noon` and `afternoon` with harmonious spring encounters.
- [x] Out-of-season mobs (sněhulák, morana, kostlivec, čert) are strictly excluded from Stage 3 daylight pools.
- [x] Unit tests verify aura buff propagation, director pool integrity, and wave difficulty progression.
