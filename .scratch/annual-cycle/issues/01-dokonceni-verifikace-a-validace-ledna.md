# 01: Dokončení verifikace a validace Ledna (Stages 21 & 22) s Perchtou s nožem

**What to build:** Plně hratelný a otestovaný Leden (Stage 21: Tříkrálová koleda a sníh, Stage 22: Tříkrálová noc a perchta s nožem). Hráč může v denní fázi postavit sněhuláka na návsi pro získání ochranného sněhového štítu a léčení, v noční fázi posvětit dveře fary svěcenou křídou K+M+B pro plošné omráčení a posvátný štít proti běsům. V noční fázi hráče prověří obávaná folklórní Perchta s velkým nožem jako VeleBoss. Všechny jednotkové testy a audity pro Leden procházejí na 100 %.

**Blocked by:** None (can start immediately)

**Status:** closed

- [x] Opravit testovací asserty a export `drawLedenDecoration` v `tests/level20Leden.test.ts` a `src/render/ledenSvgLandscape.ts`.
- [x] Sjednotit očekávané vlastnosti nepřítele `perchta_s_nozem` (název `Šeredná Perchta s nožem`, poškození zbraně, atributy nečisté bytosti).
- [x] Zprovoznit testování odemykacího řetězce úrovní 20 a 21 přes `LEVEL_UNLOCKS`.
- [x] Ověřit, že `tests/level20Leden.test.ts`, `tests/allStagesAudit.test.ts` a `tests/allStagesMapsAndSeasons.test.ts` procházejí na 100 % bez chyb.
- [x] Zapsat architektonické rozhodnutí `docs/adr/0043-lednove-vypravy-a-perchta-s-nozem.md` a zaregistrovat jej do `docs/adr/README.md`.
