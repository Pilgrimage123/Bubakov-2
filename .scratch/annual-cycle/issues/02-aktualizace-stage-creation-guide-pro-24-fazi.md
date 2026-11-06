# 02: Aktualizace `STAGE_CREATION_GUIDE.md` a architektonických pravidel pro 24 fází

**What to build:** Kompletní rozšíření a zpřesnění příručky pro tvorbu výprav (`docs/STAGE_CREATION_GUIDE.md`) z dosavadního rámce na plný celoroční 24-fázový kalendářní cyklus (12 měsíců × 2 fáze Den/Noc). Dokumentace definuje všech 24 kanonických úrovní včetně fází pro Leden (21 a 22) a Únor (23 a 24), kodifikuje pravidla parity podle ADR 0037 mezi `engine.ts` a `App.tsx` (hráč, monstra, drop bounds, kolize Dědečka), mechanismy zimního skluzu na ledu a závazný checklist pro předcházení regresím.

**Blocked by:** 01: Dokončení verifikace a validace Ledna (Stages 21 & 22) s Perchtou s nožem

**Status:** closed

- [x] Aktualizovat Tabulku 2.1 v `docs/STAGE_CREATION_GUIDE.md` pro všech 24 fází (včetně Ledna 21–22 a Února 23–24 s jejich boss triádami a ohnisky).
- [x] Zakotvit do příručky explicitní kontrolní seznam pro ADR 0037 (4 body duální parity v `src/App.tsx`: player loop, livingEnemies loop, drop clamping, grandfather collision).
- [x] Zdokumentovat pravidla pro zimní zamrzlé vodní plochy (klouzavý led, ignorování vodního zpomalení na ledu, chování létajících nepřátel).
- [x] Aktualizovat terminologii a definice ve `GLOSSARY.md` (zahrnutí 24 výprav a masopustních reálií).
