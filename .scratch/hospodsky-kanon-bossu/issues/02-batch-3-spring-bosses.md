# 02: Dávka 3: Předjaří a Jaro (Úrovně L0–L5)

**What to build:** Kompletní překreslení 10 unikátních jarních a předjarních bossů v Hospodském figurálním kánonu (ADR 0054): Blatouch, Bahenní vodníček, Mrazivá vrána, Tající sněhulák, Mrazivý obr, Obří kolednický beránek, Klekánice, Čarodějnice Zaspalka, Ledoví muži (Pankrác, Servác, Bonifác), Zbojník z hamrů. Každý boss reaguje na nápřah (`windup`), úder (`strike`), rozzuření (`enraged`) a otočení doleva (`vx < 0`).

**Blocked by:** 01: Sezónní lešení a kanonizace L24 v levels.ts

**Status:** closed

- [x] Implementováno 10 kreslicích funkcí v `src/render/bosses/springBosses.ts` s využitím `hospodaBossHelpers.ts`
- [x] Všechny kreslicí metody mají jednotnou signaturu `(ctx, x, y, time, vx, panicked, attackInfo, enemy)`
- [x] Napojeno v `src/render/ladaRenderer.ts` na odpovídající dispatch metody
- [x] Testovací sada `tests/springBosses.test.ts` ověřuje stabilitu vykreslení ve všech stavech bez chyb a bez gradientů/stínů
