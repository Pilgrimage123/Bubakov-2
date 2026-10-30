# 07: Bossové kraje (Kolednický beránek, Filipojakubská čarodějnice) a trofej

**What to build:** Delivers the complete boss progression and victory climax for Dubnový den:
- **Miniboss (85 s, ~50 kills)**: *Obří kolednický beránek* — a lively animated Easter baked lamb with a red neck ribbon and brass bell, charging aggressively and stirring blinding clouds of sugar dust.
- **Midboss (185 s, ~130 kills)**: *Stará ježibaba z Melechu* — an elder witch riding an oven peel, hurling volleys of volatile kraslice and ember whirlwinds.
- **Final Boss (300 s, ~250 kills)**: *Vrchní Filipojakubská Čarodějnice* — apex aerial boss orchestrating broom strafes, summoned vortexes, and cursed flock attacks.
Surviving the 5-minute daylight trial and overcoming the Vrchní Čarodějnice triggers the victory tally screen, awards the `level2_completed` trophy ("Dubnový přemožitel"), and unlocks Stage 4 (Starý hřbitov a Hrusický hvozd).

**Blocked by:** 02: Dubnová náves a jarní taktické body zájmu (POI), 06: Podpůrný Koledník s řehtačkou a skladba dubnových vln

**Status:** closed

- [x] Boss entities registered in `ENEMIES`, `GAME_LEVELS[2]`, and Bestiary with authentic Lada-style canvas art.
- [x] Warning banners and timed spawns fire at 85 s, 185 s, and 300 s.
- [x] Unique boss mechanics (sugar charge, ember vortex, aerial dive-bombs) are clearly telegraphed and balanced.
- [x] Pokoření final bosse triggers victory, records statistics, and unlocks Stage 4.
- [x] Trophy `level2_completed` updated in `TROPHIES` and unlocked upon victory.
- [x] Full run integration tests verify the boss timeline, scaling multipliers, and victory flow.
