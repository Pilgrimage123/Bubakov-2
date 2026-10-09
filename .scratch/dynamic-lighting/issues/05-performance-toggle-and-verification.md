# 05: Výkonnostní režim, nastavení a integrační verifikace

**What to build:**
Přidání možnosti zapnout/vypnout dynamické osvětlení v `MetaProgression` (a v `TestModeModal` / nastavení), fallback na původní `ambientTint` v případě slabého zařízení nebo `performanceMode`, finální verifikace výkonu a 100% zelené testy.

**Blocked by:** 03-folklore-entities-and-loot-glow.md, 04-nocturnal-silhouettes-and-glowing-eyes.md

**Status:** ready-for-agent

- [ ] Přidat položku `dynamicLightingEnabled: boolean` do `MetaProgression` (výchozí `true`).
- [ ] Zahrnout přepínač do `TestModeModal.tsx` a zohlednit `meta.performanceMode` (při zapnutém performanceMode automaticky zjednodušit masku).
- [ ] Zajistit plynulý běh 60 FPS s nulovými chybami v konzoli a žádnými paměťovými úniky offscreen canvasu.
- [ ] Spustit celou testovací sadu `npx vitest run` a `npm run build` pro kompletní verifikaci.
