# 07: Tříúrovňové slévání Perníčků, kramářské pečeti bossů a regulace citoslovcí

**What to build:** Vizuální hierarchie kořisti, identifikace velitelů a regulace komiksových citoslovcí podle ADR 0045 a ADR 0047. Kořist se dynamicky slévá do tří úrovní v 10% zlaté paletě (drobná perníková hvězdička 14 px → mandlový bochánek s bílou polevou 22 px → královský zlacený kůň 32 px se svatozáří). Bossové a Ostřílení běsi nesou vznášející se malovaný erb (kramářskou pečeť) se 4px konturou. Kreslené dýmové obláčky s nápisy „BÁC!“ a „PRÁSK!“ jsou omezeny výhradně na kritické zásahy, doražení bossů a exploze milníků (max. 2–3 souběžně).

**Blocked by:** 02: Polarita 10% akcentní palety a morfologie střel (Oblé vs. Špičaté), 03: Klidný akvarelový terén a bezkonturové rozpité stopy na podlaze

**Status:** closed

- [x] V `src/render/renderDrops.ts` a `src/render/pernicekCanvas.ts` implementovat tříúrovňovou vizuální hierarchii slitých Perníčků s bílou polevou a zlacením.
- [x] V `src/render/ladaRenderer.ts` doplnit pro bossy a Ostřílené běsy zesílenou 4px konturu, kvašové tečkování a malovanou kramářskou pečeť vznášející se nad hlavou.
- [x] V `src/render/renderParticles.ts` zavést striktní rozpočet a filtr komiksových citoslovcí s nápisy („BÁC!“, „PRÁSK!“): zobrazovat pouze při kritickém zásahu či pádu bosse s limitem max. 3 současných instancí.
- [x] Ověřit čitelnost bojiště a orientaci hráče při porážce desítek běsů současně.
- [x] Zkontrolovat úspěšnost testů drop systému, částic a bossů.
