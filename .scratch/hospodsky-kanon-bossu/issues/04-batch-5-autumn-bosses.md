# 04: Dávka 5: Podzim a Dušičky (Úrovně L12–L17)

**What to build:** Kompletní překreslení 17 podzimních bossů v Hospodském figurálním kánonu (ADR 0054): Královský sršeň, Posvícenský Hospodář, Svatováclavský strážce, Chmelový skřítek, Kvílící Meluzína, Královský havran, Podzimní hastrman, Drak Větrník, Dušičková bludička, Pekelný čert rybníkář, Hrusická Veleštika, Královská svatomartinská husa, Martinský jezdec, Listopadový Mrazivec, Mlžný přízrak, Černý myslivec, Kanec Kňour.

**Blocked by:** 01: Sezónní lešení a kanonizace L24 v levels.ts

**Status:** closed

- [x] Implementováno 17 kreslicích funkcí v `src/render/bosses/autumnBosses.ts`
- [x] Zapojení v `src/render/ladaRenderer.ts`
- [x] Otestováno v `tests/autumnBosses.test.ts` ve stavech windup, strike, enraged, flip doleva
- [x] Žádné využití CanvasGradient či shadowBlur (nulové alokace a stálých 60FPS)
