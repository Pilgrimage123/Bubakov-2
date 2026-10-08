# 05: Integrační verifikace, benchmarky a code-review

**What to build:** Spuštění celkového benchmarku a testů na integrační větvi, provedení `code-review` a finální začištění před sloučením do hlavní větve.

**Blocked by:** 03: Lehký lokalizační systém (i18n) a přepínač CZ / EN, 04: Dekompozice bezhlavého modulu GameEngine z App.tsx

**Status:** ready-for-agent

- [ ] Ověřit, že celý projekt bezchybně projde `npm run build` a TypeScript kontrolu.
- [ ] Spustit `npx tsx scripts/benchmark-weapons.ts` a potvrdit, že všechny scénáře proběhnou bez chyb.
- [ ] Provést code review standardů a specifikace pomocí nástroje `code-review`.
- [ ] Odstranit dočasné pracovní větve a připravit integrační větev k nasazení.
