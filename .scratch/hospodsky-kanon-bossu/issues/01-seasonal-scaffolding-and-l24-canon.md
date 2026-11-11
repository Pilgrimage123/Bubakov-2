# 01: Sezónní lešení a kanonizace L24 v levels.ts

**What to build:** Vytvoření základní modulární struktury v `src/render/bosses/` pro sezónní moduly bossů (Předjaří/Jaro, Léto, Podzim, Zima/Masopust), jejich centrální re-export a uvedení 24. úrovně hry v `levels.ts` do souladu s bodem 3 ADR 0054 (dosazení Masopustního Laufra na pozici minibosse L24).

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Vytvořeny soubory `springBosses.ts`, `summerBosses.ts`, `autumnBosses.ts` a `winterBosses.ts` v `src/render/bosses/`
- [x] Soubory jsou exportovány z `src/render/bosses/index.ts`
- [x] V `src/data/levels.ts` je na pozici `miniBoss` 24. úrovně nastaven `masopustni_laufr` dle ADR 0054
- [x] Existující testy a TypeScript typová kontrola procházejí bez chyb
