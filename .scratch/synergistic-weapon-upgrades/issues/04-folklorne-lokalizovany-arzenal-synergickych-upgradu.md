# 04: Folklórní definice a lokalizace synergických upgradů pro všech 15 zbraní

**What to build:** Všech 15 kanonických zbraní má v herních datech a lokalizačních modulech nadefinované páry synergických variant běžných upgradů (Salva/Plošný rozptyl vs. Ráznost/Kadence/Průraz). Všechny texty zachovávají ladovskou atmosféru v českém i anglickém jazyce a parametry zbraní jsou ověřeny simulací v benchmarku arzenálu.

**Blocked by:** 02: Generování a nákup synergických variant zbraní v Dědečkově nůši, 03: Zařazení specifických synergických vylepšení do odměn Malované truhly

**Status:** ready-for-agent

- [ ] Každá z 15 kanonických zbraní má definovánu sadu folklórních synergických voleb s vybalancovanými hodnotami trade-offů.
- [ ] Všechny synergické upgrady mají úplné překladové řetězce v češtině (`cs.ts`) i angličtině (`en.ts`).
- [ ] Zbraňový benchmark `scripts/benchmark-weapons.ts` ověřuje chování a vyváženost zbraní se synergickými upgrady v boji proti různým typům bubáků.
- [ ] Žádná kombinace synergických voleb nevytváří nechtěnou zranitelnost, pád aplikace ani zablokování útočného cyklu.
