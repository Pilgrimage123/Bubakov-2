# 05: Grand finále 24-fázové celoroční kampaně, audit pravidla 7/2/1 a projektový bundle

**What to build:** Kompletní integrace a audit uceleného 12-měsíčního cyklu (všech 24 kanonických úrovní). Kampaň bezchybně navazuje od 1. Předjaří po 24. Noční Masopust. Na mapě v knize rozcestníků je zobrazeno všech 24 etap bez vizuálních překryvů, kampaňový audit v `allStagesAudit.test.ts` a `allStagesMapsAndSeasons.test.ts` garantuje dodržení pravidla 7/2/1 a Pravidla trojjedinosti vln napříč celou hrou. Zaznamenáno ADR 0044 a vygenerován čerstvý projektový export bundle pro trvalou archivaci.

**Blocked by:** 04: Únor – Noc: Masopustní rej a pochovávání basy (Stage 24 / Level 23)

**Status:** closed

- [x] Aktualizovat `tests/allStagesAudit.test.ts` na plný rozsah 24 úrovní (0 až 23) a ověřit kampaňový strop opakování 7 / 2 / 1.
- [x] Aktualizovat `tests/allStagesMapsAndSeasons.test.ts` pro všech 12 měsíců a 24 fází.
- [x] Doplnit a zkalibrovat zbývající rozcestníky v `src/components/LadaStorybookSpread.tsx` pro úrovně 22 a 23.
- [x] Zapsat architektonické rozhodnutí `docs/adr/0044-unor-masopust-a-zavrseni-rocniho-cyklu.md` a provázat jej v rejstříku.
- [x] Spustit exportní skript `scripts/export-project-bundle.ps1` a ověřit integritu souboru `cely_bubakov.txt`.
- [x] Provést finální běh testů `npm test` a produkčního sestavení `npm run build` s výsledkem 100% PASS.
