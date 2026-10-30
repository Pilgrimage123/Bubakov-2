# 01: Definice kraje, tempo a progrese (Dubnový den)

**What to build:** The player can select and embark on the 3rd stage, "3. Duben v Hrusicích – Dubnový den", in the Expedition Menu (Nabídka výprav) after defeating Morana in the 2nd stage. The stage runs for a full 5-minute (300 s) daytime expedition stretching across morning/noon (0–150 s) and April afternoon (150–300 s), with authentic Czech and English localizations, warm spring sky and ground colors, and progression unlock tracking.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Level 2 in `GAME_LEVELS` is defined as "3. Duben v Hrusicích – Dubnový den" with shortTitle "Dubnový den", subtitle, theme "spring_village", and season "spring".
- [x] Level unlock requirement is bound to defeating Morana in Level 1 (Noční mrazy) via `LEVEL_UNLOCKS` and `getLevelProgress`.
- [x] Day phases stretch across the 300 s duration: Noon (0–150 s) and Afternoon (150–300 s).
- [x] Pacing schedule is configured for 85 s miniboss, 185 s midboss, and 300 s final boss.
- [x] Full localization support in Czech (`cs.ts`) and English (`en.ts`) via `getLevelTranslation`.
- [x] Unit tests in `tests/level2DubnovyDen.test.ts` verify level definition, unlocks, day phase mapping, and progression.
