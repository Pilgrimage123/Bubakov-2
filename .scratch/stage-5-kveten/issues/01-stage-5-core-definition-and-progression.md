# 01: Definice 5. úrovně (Květen v Hrusicích) a postup hrou

**What to build:** The player can select and embark on Stage 5, "5. Květen v Hrusicích – Májová slavnost", in the Expedition Menu (Nabídka výprav) after defeating the Midnight Hejkal in Stage 4. The stage runs for a full 5-minute (300 s) daytime expedition from sunny May morning through afternoon to festive evening, using warm spring color palettes, full Czech and English localizations, and progression unlock tracking.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Stage 5 in `GAME_LEVELS` is defined as "5. Květen v Hrusicích – Májová slavnost" with short title "Májová slavnost", thematic description, and season set to spring.
- [x] Stage unlock requirement is bound to defeating Půlnoční Hejkal in Stage 4 (Starý hřbitov a Hrusický hvozd) via level unlocks and progress getters.
- [x] Day phases stretch across the 300 s expedition with warm May morning, bright noon, and festive afternoon lighting palettes.
- [x] Encounter timeline is configured for the 85 s miniboss (Čarodějnice Zaspalka) and 300 s climax boss (Ledoví Muži).
- [x] Full localization support in Czech and English via `getLevelTranslation` without untranslated strings.
- [x] Unit tests verify level definition, progression unlock, timeline mapping, and localized labels.
