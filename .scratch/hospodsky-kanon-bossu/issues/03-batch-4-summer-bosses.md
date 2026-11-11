# 03: Dávka 4: Léto a Žně (Úrovně L6–L11)

**What to build:** Kompletní překreslení 15 unikátních letních bossů a minibossů v Hospodském figurálním kánonu (ADR 0054): Královský vele-rak, Čert sekáč, Královská Polednice, Ohnivý sudlička, Svatojánský Vládce, Křeček obilník, Žitná matka, Pouťový Hromotluk Markéta, Bílá paní, Královský čmelák, Zlatohlávek Žrout, Dožínkový chasník, Netopýr Ušatec, Noční můra, Výr velký. Všechny postavy využívají trojjedinou povahu (bodří, furiantští, potměšilí) a živé lidové prvky.

**Blocked by:** 01: Sezónní lešení a kanonizace L24 v levels.ts

**Status:** closed

- [x] Implementováno 15 kreslicích funkcí v `src/render/bosses/summerBosses.ts`
- [x] Zapojení v `src/render/ladaRenderer.ts` se sjednocenou signaturou
- [x] Zvířecí i hmyzí bossové (křeček, čmelák, rak, netopýr, výr) mají ladovskou pohádkovou mimiku a lidové atributy
- [x] Testovací sada `tests/summerBosses.test.ts` pokrývá stabilitu vykreslení ve všech stavech
