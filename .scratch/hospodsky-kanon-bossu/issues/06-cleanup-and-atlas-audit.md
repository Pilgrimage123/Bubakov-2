# 06: Kontrakce a audit kompatibility atlasu v ladaRenderer.ts

**What to build:** Vyčištění starých zjednodušených geometrických kreslicích metod z `ladaRenderer.ts`, konečná verifikace podpory `BakedBubakAtlas`, provedení benchmarku 60FPS a záznam v `changelog.md`.

**Blocked by:** 02: Dávka 3: Předjaří a Jaro (Úrovně L0–L5), 03: Dávka 4: Léto a Žně (Úrovně L6–L11), 04: Dávka 5: Podzim a Dušičky (Úrovně L12–L17), 05: Dávka 6: Zima, Masopust a Speciální bossové (Úrovně L18–L23 + Speciální)

**Status:** closed

- [x] Všechny zbývající staré geometrické metody bossů v `ladaRenderer.ts` nahrazeny delegačními metodami na sezónní moduly
- [x] Zkontrolována kompatibilita s atlasem (`BakedBubakAtlas`)
- [x] Všechny existující testy a benchmark (`npm test`) procházejí zeleně
- [x] Aktualizován `changelog.md` s odkazem na ADR 0054
