# 03: Lehký lokalizační systém (i18n) a přepínač CZ / EN

**What to build:** Lehká lokalizační vrstva oddělující stabilní kódové identifikátory od hráčských textů s podporou češtiny a angličtiny a přepínačem jazyka v herním UI.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Vytvořit lehký modul `src/i18n/index.ts` s funkcí `t(key, lang)` a slovníky pro `cs` a `en`.
- [ ] Zahrnout překlady pro názvy a popisy zbraní, budov ve vesnici, monster v bestiáři a základních UI textů.
- [ ] Přidat stav vybraného jazyka (`currentLang: 'cs' | 'en'`) do nastavení / `metaProgression` a přepínač jazyka do menu.
- [ ] Ověřit, že přepnutí jazyka okamžitě aktualizuje texty v UI bez dopadu na logiku enginu.
